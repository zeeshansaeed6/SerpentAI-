import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import countries110m from 'world-atlas/countries-110m.json';
import { SEVERITY, GLYPH_PATHS, severityOf } from '../utils/severity';
import SeverityGlyph from './SeverityGlyph';

gsap.registerPlugin(useGSAP);

const W = 960;
const H = 480;
const SURFACE = '#07100d';
const USER_COLOR = '#38bdf8';
const HOSPITAL_COLOR = '#e8fff5';

// Projection and static geometry are computed once at module load (no tile server, no network)
const projection = geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' });
const pathFor = geoPath(projection);
const LAND_PATH = pathFor(feature(countries110m, countries110m.objects.countries));
const GRATICULE_PATH = pathFor(geoGraticule10());
const SPHERE_PATH = pathFor({ type: 'Sphere' });

// [west, south, east, north]
const REGION_BOXES = {
  Asia: [60, -12, 150, 55],
  Americas: [-130, -56, -30, 62],
  Africa: [-20, -36, 55, 38],
  Europe: [-12, 34, 45, 72],
  Oceania: [110, -48, 180, 0]
};
const REGION_NAMES = ['World', ...Object.keys(REGION_BOXES)];
const WORLD_VIEW = { x: 0, y: 0, w: W, h: H };

// Projected view box that frames a lng/lat box, padded, kept at the map's 2:1 aspect ratio
const viewFor = ([west, south, east, north]) => {
  const points = [
    [west, south], [east, south], [east, north], [west, north],
    [(west + east) / 2, south], [(west + east) / 2, north], [west, (south + north) / 2], [east, (south + north) / 2]
  ].map((p) => projection(p)).filter(Boolean);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  let w = (Math.max(...xs) - Math.min(...xs)) * 1.2;
  let h = (Math.max(...ys) - Math.min(...ys)) * 1.2;
  if (w / h > W / H) h = (w * H) / W; else w = (h * W) / H;
  w = Math.min(Math.max(w, 90), W);
  h = (w * H) / W;
  return {
    x: Math.max(0, Math.min(W - w, cx - w / 2)),
    y: Math.max(0, Math.min(H - h, cy - h / 2)),
    w,
    h
  };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function MarkerGlyph({ marker }) {
  if (marker.level === 'hospital') {
    return (
      <>
        <circle r="9" fill={SURFACE} stroke="#34d399" strokeWidth="1.5" />
        <path d="M-2 -5.5h4v3.5h3.5v4H2v3.5h-4V2h-3.5v-4H-2z" fill={HOSPITAL_COLOR} />
      </>
    );
  }
  const sev = severityOf(marker.level);
  const common = { fill: sev.color, stroke: SURFACE, strokeWidth: 2, paintOrder: 'stroke' };
  return (
    <>
      {sev.shape === 'circle' && <circle r="5.5" {...common} />}
      {sev.shape === 'diamond' && <path d={GLYPH_PATHS.diamond} {...common} />}
      {sev.shape === 'triangle' && <path d={GLYPH_PATHS.triangle} {...common} />}
      {sev.shape === 'target' && (
        <>
          <circle className="map-ping" r="9" fill="none" stroke={sev.color} strokeWidth="1.5" />
          <circle r="5" {...common} />
          <circle r="8.5" fill="none" stroke={sev.color} strokeWidth="1.5" />
        </>
      )}
    </>
  );
}

const MIN_VIEW_W = 90; // max zoom (~10x)
const CLUSTER_PX = 30; // markers closer than this on screen merge into one numbered group
const SEVERITY_RANK = (level) => (level === 'hospital' ? -1 : SEVERITY.findIndex((s) => s.level === severityOf(level).level));

// Keep a view box inside the map
const clampView = (v) => {
  const w = clamp(v.w, MIN_VIEW_W, W);
  const h = (w * H) / W;
  return { x: clamp(v.x, 0, W - w), y: clamp(v.y, 0, H - h), w, h };
};

// Greedy grouping in screen space. `points` is sorted least→most severe; groups are anchored on
// their most severe member and returned in the same draw order (deadliest on top).
const groupMarkers = (points, radius) => {
  if (radius <= 0) return points.map((m) => ({ ...m, members: [m] }));
  const groups = [];
  [...points].reverse().forEach((m) => {
    const group = groups.find((g) => Math.hypot(g.x - m.x, g.y - m.y) <= radius);
    if (group) group.members.push(m);
    else groups.push({ ...m, members: [m] });
  });
  return groups.reverse();
};

function ClusterGlyph({ level, count }) {
  const color = level === 'hospital' ? '#34d399' : severityOf(level).color;
  return (
    <>
      <circle r="15" fill="none" stroke={color} strokeWidth="1.5" opacity="0.45" />
      <circle r="11.5" fill={color} stroke={SURFACE} strokeWidth="2" paintOrder="stroke" />
      <text className="map-cluster-count" textAnchor="middle" dy="0.36em" fill={SURFACE}>{count}</text>
    </>
  );
}

/**
 * Themed world map drawn from bundled geometry (no map tiles, so it works under a strict CSP).
 * markers: [{ id, lat, lng, level, title, subtitle }]  (level: a severity level or 'hospital')
 * Markers are real buttons: focusable, labelled, and ≥28px hit targets at any zoom. Nearby
 * markers group into numbered clusters. Mouse: drag to pan, Ctrl+scroll to zoom. Everyone: the
 * +/− buttons and region chips (touch screens keep native page scrolling over the map).
 */
export default function WorldMap({
  markers = [],
  user = null,
  onSelect,
  selectedId = null,
  legend = 'severity',
  ariaLabel = 'World map'
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const viewRef = useRef(WORLD_VIEW);
  const widthRef = useRef(900);
  const dragRef = useRef(null);
  const [width, setWidth] = useState(900);
  const [hoverId, setHoverId] = useState(null);
  const [region, setRegion] = useState('World');
  const [, setTick] = useState(0); // forces a render after the view changes so React and the DOM agree

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      widthRef.current = entry.contentRect.width || 900;
      setWidth(widthRef.current);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Least dangerous first so the deadliest markers are drawn on top
  const placed = useMemo(
    () => markers
      .map((m) => {
        const point = projection([m.lng, m.lat]);
        return point ? { ...m, x: point[0], y: point[1] } : null;
      })
      .filter(Boolean)
      .sort((a, b) => SEVERITY_RANK(a.level) - SEVERITY_RANK(b.level)),
    [markers]
  );

  const userPoint = user ? projection([user.lng, user.lat]) : null;

  const counts = useMemo(() => {
    const result = Object.fromEntries(SEVERITY.map((s) => [s.level, 0]));
    markers.forEach((m) => { if (m.level !== 'hospital') result[severityOf(m.level).level] += 1; });
    return result;
  }, [markers]);

  // Markers stay a constant pixel size at any zoom: scale = svg units per screen pixel
  const applyView = (view) => {
    viewRef.current = view;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    const k = view.w / widthRef.current;
    svg.querySelectorAll('[data-mx]').forEach((el) => {
      el.setAttribute('transform', `translate(${el.dataset.mx} ${el.dataset.my}) scale(${k})`);
    });
  };

  const { contextSafe } = useGSAP({ scope: wrapRef });

  const animateTo = contextSafe((target, duration = 0.9) => {
    setHoverId(null);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const proxy = { ...viewRef.current };
    gsap.to(proxy, {
      ...clampView(target),
      duration: reduced ? 0 : duration,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: () => applyView({ x: proxy.x, y: proxy.y, w: proxy.w, h: proxy.h }),
      onComplete: () => setTick((n) => n + 1)
    });
  });

  const goTo = (name) => {
    setRegion(name);
    let target = WORLD_VIEW;
    if (name === 'Fit' && placed.length) {
      const lngs = placed.map((m) => m.lng);
      const lats = placed.map((m) => m.lat);
      target = viewFor([Math.min(...lngs) - 8, Math.min(...lats) - 8, Math.max(...lngs) + 8, Math.max(...lats) + 8]);
    } else if (name !== 'World' && name !== 'Fit') {
      target = viewFor(REGION_BOXES[name]);
    }
    animateTo(target);
  };

  // Zoom keeping a focal point (default: the centre) fixed on screen
  const zoomBy = (factor, focus = { fx: 0.5, fy: 0.5 }) => {
    const v = viewRef.current;
    const w = clamp(v.w / factor, MIN_VIEW_W, W);
    const h = (w * H) / W;
    return clampView({ x: v.x + focus.fx * v.w - focus.fx * w, y: v.y + focus.fy * v.h - focus.fy * h, w, h });
  };

  const manualZoom = (factor) => {
    setRegion(null);
    animateTo(zoomBy(factor), 0.35);
  };

  // Ctrl/⌘ + scroll (and trackpad pinch) zooms at the pointer; plain scrolling still scrolls the page
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    let settle = 0;
    const onWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const focus = { fx: (event.clientX - rect.left) / rect.width, fy: (event.clientY - rect.top) / rect.height };
      applyView(zoomBy(event.deltaY < 0 ? 1.25 : 0.8, focus));
      setRegion(null);
      clearTimeout(settle);
      settle = setTimeout(() => setTick((n) => n + 1), 150);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => { svg.removeEventListener('wheel', onWheel); clearTimeout(settle); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse drag to pan (touch keeps native scrolling)
  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('.map-marker')) return;
    dragRef.current = { x: event.clientX, y: event.clientY, view: { ...viewRef.current }, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    drag.moved = true;
    const scale = drag.view.w / widthRef.current;
    applyView(clampView({ ...drag.view, x: drag.view.x - dx * scale, y: drag.view.y - dy * scale }));
  };
  const endDrag = () => {
    if (dragRef.current?.moved) {
      setRegion(null);
      setTick((n) => n + 1);
    }
    dragRef.current = null;
  };

  const view = viewRef.current;
  const k = view.w / width;
  const items = groupMarkers(placed, view.w <= MIN_VIEW_W + 10 ? 0 : CLUSTER_PX * k).map((g) => ({
    ...g,
    id: g.members.length > 1 ? `cluster:${g.id}` : g.id
  }));

  const hover = hoverId ? items.find((m) => m.id === hoverId) : null;
  const tipLeft = hover ? clamp(((hover.x - view.x) / view.w) * 100, 14, 86) : 0;
  const tipTop = hover ? clamp(((hover.y - view.y) / view.h) * 100, 0, 100) : 0;
  const hoverSeverity = hover && hover.level !== 'hospital' ? severityOf(hover.level) : null;
  const noun = legend === 'hospital' ? 'antivenom centres' : 'sightings';

  const clusterTarget = (group) => {
    const lngs = group.members.map((m) => m.lng);
    const lats = group.members.map((m) => m.lat);
    return viewFor([Math.min(...lngs) - 2, Math.min(...lats) - 2, Math.max(...lngs) + 2, Math.max(...lats) + 2]);
  };

  return (
    <div className="map-panel glass-panel">
      <div className="map-toolbar">
        <div className="map-zoom" role="group" aria-label="Map zoom">
          <button type="button" className="map-zoom-btn" onClick={() => manualZoom(0.6)} aria-label="Zoom out" disabled={view.w >= W}>−</button>
          <button type="button" className="map-zoom-btn" onClick={() => manualZoom(1.6)} aria-label="Zoom in" disabled={view.w <= MIN_VIEW_W}>+</button>
        </div>
        <div className="map-regions" role="group" aria-label="Zoom to region">
          {[...REGION_NAMES, 'Fit'].map((name) => (
            <button
              key={name}
              type="button"
              className="map-region-btn"
              aria-pressed={region === name}
              onClick={() => goTo(name)}
              title={name === 'Fit' ? 'Zoom to fit all markers' : `Zoom to ${name}`}
            >
              {name === 'Fit' ? 'Fit markers' : name}
            </button>
          ))}
        </div>
      </div>

      <div className="map-stage" ref={wrapRef}>
        <svg
          ref={svgRef}
          className="map-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={ariaLabel}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <radialGradient id="map-ocean" cx="50%" cy="45%" r="70%">
              <stop offset="0" stopColor="#0d1f19" />
              <stop offset="1" stopColor="#060d0b" />
            </radialGradient>
          </defs>
          <path d={SPHERE_PATH} fill="url(#map-ocean)" />
          <path d={GRATICULE_PATH} className="map-graticule" />
          <path d={LAND_PATH} className="map-land" />
          <path d={SPHERE_PATH} className="map-outline" />

          {/* Drawn first and click-through: your location must never block the markers above it */}
          {userPoint && (
            <g data-mx={userPoint[0]} data-my={userPoint[1]} transform={`translate(${userPoint[0]} ${userPoint[1]}) scale(${k})`} aria-label="Your location" role="img" pointerEvents="none">
              <circle className="map-ping" r="9" fill="none" stroke={USER_COLOR} strokeWidth="1.5" />
              <circle r="5" fill={USER_COLOR} stroke={SURFACE} strokeWidth="2" paintOrder="stroke" />
            </g>
          )}

          {items.map((m) => {
            const isCluster = m.members.length > 1;
            const activate = () => (isCluster ? animateTo(clusterTarget(m)) : onSelect?.(m.id));
            const label = isCluster
              ? `${m.members.length} ${noun} in this area. Activate to zoom in.`
              : `${m.title}, ${m.level === 'hospital' ? 'antivenom centre' : `${severityOf(m.level).level} danger`}, ${m.subtitle}`;
            return (
              <g
                key={m.id}
                className={`map-marker${selectedId === m.id ? ' is-selected' : ''}`}
                data-mx={m.x}
                data-my={m.y}
                transform={`translate(${m.x} ${m.y}) scale(${k})`}
                role="button"
                tabIndex={0}
                aria-label={label}
                onPointerEnter={() => setHoverId(m.id)}
                onPointerLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(m.id)}
                onBlur={() => setHoverId(null)}
                onClick={activate}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate();
                  }
                }}
              >
                <circle className="map-hit" r="16" fill="transparent" />
                <circle className="map-focus" r="17" fill="none" />
                {isCluster ? <ClusterGlyph level={m.level} count={m.members.length} /> : <MarkerGlyph marker={m} />}
              </g>
            );
          })}
        </svg>

        {hover && (
          <div className={`map-tooltip${tipTop < 28 ? ' map-tooltip--below' : ''}`} style={{ left: `${tipLeft}%`, top: `${tipTop}%` }} role="status">
            <div className="map-tooltip__title">
              {hover.members.length > 1 ? `${hover.members.length} ${noun} here` : hover.title}
            </div>
            <div className="map-tooltip__meta">
              {hover.members.length > 1
                ? `${hover.members.slice(-3).reverse().map((m) => m.title).join(', ')}${hover.members.length > 3 ? ` +${hover.members.length - 3} more` : ''} · click to zoom in`
                : hover.subtitle}
            </div>
            {hoverSeverity && (
              <div className="map-tooltip__level">
                <SeverityGlyph level={hoverSeverity.level} size={12} /> {hoverSeverity.level}
                {hover.members.length > 1 ? ' (highest)' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="map-hint">Drag to pan · Ctrl + scroll to zoom · numbered circles group nearby reports</p>

      <ul className="map-legend" aria-label="Map legend">
        {legend === 'severity' && SEVERITY.map((s) => (
          <li key={s.level}>
            <SeverityGlyph level={s.level} /> <span>{s.level}</span> <strong>{counts[s.level]}</strong>
          </li>
        ))}
        {legend === 'hospital' && (
          <li>
            <svg width="16" height="16" viewBox="-10 -10 20 20" aria-hidden="true">
              <circle r="9" fill={SURFACE} stroke="#34d399" strokeWidth="1.5" />
              <path d="M-2 -5.5h4v3.5h3.5v4H2v3.5h-4V2h-3.5v-4H-2z" fill={HOSPITAL_COLOR} />
            </svg>
            <span>Antivenom centre</span> <strong>{markers.length}</strong>
          </li>
        )}
        {user && (
          <li>
            <svg width="14" height="14" viewBox="-10 -10 20 20" aria-hidden="true"><circle r="5.5" fill={USER_COLOR} /></svg>
            <span>Your location</span>
          </li>
        )}
      </ul>
    </div>
  );
}
