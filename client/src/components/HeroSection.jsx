import React, { useRef } from 'react';
import { Zap } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CountUp from './CountUp';

gsap.registerPlugin(useGSAP);

// Headline as explicit words. Each word carries its own gradient class: gradient text
// (background-clip: text) disappears if its *children* are transformed, so the animated
// unit must be the element that owns the gradient. Fire words share one gradient via
// half-width background slices.
const HEADLINE = [
  { text: 'Instant' },
  { text: 'Snake', className: 'text-gradient-emerald latin' },
  { text: 'Species', className: 'text-gradient-emerald latin' },
  { text: '&' },
  { text: 'Venom', className: 'text-gradient-fire', slice: '0%' },
  { text: 'Hazard', className: 'text-gradient-fire', slice: '100%' },
  { text: 'Detection' }
];

// One sinuous path, drawn twice at different speeds so two thermal "snakes" slither across the hero
const SERPENT_PATH = 'M0 150 C 110 20, 210 280, 330 150 S 560 20, 680 150 S 800 280, 900 120';

const STATS = [
  { label: 'Species supported', count: { to: 3500, suffix: '+' } },
  { label: 'Analysis speed', count: { to: 2.5, decimals: 1, prefix: '< ', suffix: 's' } },
  { label: 'Identification accuracy', count: { to: 98.7, decimals: 1, suffix: '%' } },
  { label: 'Emergency antivenom guide', text: '24/7', hot: true }
];

export default function HeroSection() {
  const root = useRef(null);

  // Entrance choreography: pill → headline words → subtitle → stats panel → stat cells
  // Only transform + opacity are animated (compositor-only, no layout/paint per frame).
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { duration: 0.7, ease: 'power3.out' } });
      tl.from('.hero-pill', { y: 14, opacity: 0, duration: 0.5 })
        .from('.hero-word', {
          yPercent: 55,
          opacity: 0,
          duration: 0.8,
          ease: 'power4.out',
          stagger: 0.07
        }, '<0.1')
        .from('.hero-sub', { y: 16, opacity: 0 }, '-=0.45')
        .from('.hero-stats', { y: 26, opacity: 0, scale: 0.97 }, '-=0.4')
        .from('.hero-stat', { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 }, '<0.15');
    });
  }, { scope: root });

  return (
    <div ref={root} style={{
      position: 'relative',
      textAlign: 'center',
      padding: '3rem 1rem 2rem',
      width: '100%', // auto margins in a flex column stop stretching; without this it overflows on phones
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Ambient thermal serpents slithering behind the headline */}
      <svg className="hero-serpent" viewBox="0 0 900 300" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hero-thermal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4c1d95" />
            <stop offset="0.3" stopColor="#a21caf" />
            <stop offset="0.55" stopColor="#ef4444" />
            <stop offset="0.78" stopColor="#f97316" />
            <stop offset="1" stopColor="#fde047" />
          </linearGradient>
        </defs>
        <path className="serpent-trail" d={SERPENT_PATH} />
        <path className="serpent-glow" d={SERPENT_PATH} pathLength="1000" />
        <path className="serpent-body" d={SERPENT_PATH} pathLength="1000" />
        <path className="serpent-body serpent-body--slow" d={SERPENT_PATH} pathLength="1000" />
      </svg>

      {/* Top pill badge */}
      <div className="hero-pill" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1rem',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px dashed rgba(52, 211, 153, 0.5)',
        borderRadius: '8px',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontSize: '0.72rem',
        color: '#6ee7b7',
        fontWeight: 600,
        marginBottom: '1.5rem'
      }}>
        <Zap size={14} /> Field Station · Gemini Vision
      </div>

      {/* Main Headline */}
      <h1 className="hero-title" style={{
        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        lineHeight: 1.15,
        marginBottom: '1.25rem',
        fontWeight: 800
      }}>
        {HEADLINE.map((word, index) => (
          <React.Fragment key={word.text}>
            {index > 0 && ' '}
            <span
              className={`hero-word ${word.className || ''}`}
              style={{
                display: 'inline-block',
                ...(word.slice && { backgroundSize: '200% 100%', backgroundPosition: `${word.slice} 0` })
              }}
            >
              {word.text}
            </span>
          </React.Fragment>
        ))}
      </h1>

      {/* Subtitle */}
      <p className="hero-sub" style={{
        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
        color: '#94a3b8',
        maxWidth: '720px',
        margin: '0 auto 2.5rem',
        lineHeight: 1.6
      }}>
        Upload or capture any reptile photograph. Get instant scientific classification, venom lethality rating, emergency bite first-aid protocols, and habitat intelligence.
      </p>

      {/* Stats bar */}
      <div className="glass-panel hud-corners hero-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1.5rem',
        padding: '1.25rem 1.5rem',
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        borderRadius: '16px'
      }}>
        {STATS.map((stat, index) => (
          <div key={stat.label} className="hero-stat" style={{ textAlign: 'center' }}>
            <div
              className={stat.hot ? 'text-gradient-fire' : undefined}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 600,
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
                color: stat.hot ? undefined : '#ecf6f0',
                marginBottom: '0.3rem'
              }}
            >
              {stat.count ? <CountUp {...stat.count} delay={1.7 + index * 0.1} /> : stat.text}
            </div>
            <div className="mono" style={{ color: '#8aa395', fontSize: '0.66rem', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
