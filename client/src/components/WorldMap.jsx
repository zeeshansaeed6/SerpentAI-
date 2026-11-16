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

/**
 * Themed world map drawn from bundled geometry (no map tiles, so it works under a strict CSP).
 * markers: [{ id, lat, lng, level, title, subtitle }]  (level: a severity level or 'hospital')
 * Markers are real buttons: focusable, labelled, and ≥28px hit targets at any zoom.
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
  const [width, setWidth] = useState(900);
  const [hoverId, setHoverId] = useState(null);
  const [region, setRegion] = useState('World');
  const [, setTick] = useState(0); // forces a render after a zoom so React's marker scale matches the DOM

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
  const placed = useMemo(() => {
    const rank = (level) => (level === 'hospital' ? -1 : SEVERITY.findIndex((s) => s.level === severityOf(level).level));
    return markers
      .map((m) => {
        const point = projection([m.lng, m.lat]);
        return point ? { ...m, x: point[0], y: point[1] } : null;
      })
      .filter(Boolean)
      .sort((a, b) => rank(a.level) - rank(b.level));
  }, [markers]);

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

  const goTo = contextSafe((name) => {
    setRegion(name);
    setHoverId(null);

    let target = WORLD_VIEW;
    if (name === 'Fit') {
      const spots = placed.length ? placed : [];
      if (spots.length) {
        const lngs = spots.map((m) => m.lng);
        const lats = spots.map((m) => m.lat);
        target = viewFor([Math.min(...lngs) - 8, Math.min(...lats) - 8, Math.max(...lngs) + 8, Math.max(...lats) + 8]);
      }
    } else if (name !== 'World') {
      target = viewFor(REGION_BOXES[name]);
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const proxy = { ...viewRef.current };
    gsap.to(proxy, {
      ...target,
      duration: reduced ? 0 : 0.9,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: () => applyView({ x: proxy.x, y: proxy.y, w: proxy.w, h: proxy.h }),
      onComplete: () => setTick((n) => n + 1)
    });
  });

  const view = viewRef.current;
  const k = view.w / width;
  const hover = hoverId ? placed.find((m) => m.id === hoverId) : null;
  const tipLeft = hover ? clamp(((hover.x - view.x) / view.w) * 100, 14, 86) : 0;
  const tipTop = hover ? clamp(((hover.y - view.y) / view.h) * 100, 0, 100) : 0;
  const hoverSeverity = hover && hover.level !== 'hospital' ? severityOf(hover.level) : null;

  return (
    <div className="map-panel glass-panel">
      <div className="map-toolbar">
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

          {placed.map((m) => (
            <g
              key={m.id}
              className={`map-marker${selectedId === m.id ? ' is-selected' : ''}`}
              data-mx={m.x}
              data-my={m.y}
              transform={`translate(${m.x} ${m.y}) scale(${k})`}
              role="button"
              tabIndex={0}
              aria-label={`${m.title}, ${m.level === 'hospital' ? 'antivenom centre' : `${severityOf(m.level).level} danger`}, ${m.subtitle}`}
              onPointerEnter={() => setHoverId(m.id)}
              onPointerLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(m.id)}
              onBlur={() => setHoverId(null)}
              onClick={() => onSelect?.(m.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect?.(m.id);
                }
              }}
            >
              <circle className="map-hit" r="14" fill="transparent" />
              <circle className="map-focus" r="13" fill="none" />
              <MarkerGlyph marker={m} />
            </g>
          ))}


        </svg>

        {hover && (
          <div className={`map-tooltip${tipTop < 28 ? ' map-tooltip--below' : ''}`} style={{ left: `${tipLeft}%`, top: `${tipTop}%` }} role="status">
            <div className="map-tooltip__title">{hover.title}</div>
            <div className="map-tooltip__meta">{hover.subtitle}</div>
            {hoverSeverity && (
              <div className="map-tooltip__level">
                <SeverityGlyph level={hoverSeverity.level} size={12} /> {hoverSeverity.level}
              </div>
            )}
          </div>
        )}
      </div>

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
