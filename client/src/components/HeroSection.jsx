import React from 'react';
import { ShieldCheck, Zap, Activity, Globe } from 'lucide-react';

export default function HeroSection({ onStartScan, onExploreGuide }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem 2rem',
      width: '100%', // auto margins in a flex column stop stretching; without this it overflows on phones
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Top pill badge */}
      <div style={{
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
      <h1 style={{
        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        lineHeight: 1.15,
        marginBottom: '1.25rem',
        fontWeight: 800
      }}>
        Instant <span className="text-gradient-emerald latin">Snake Species</span> &amp; <span className="text-gradient-fire">Venom Hazard</span> Detection
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
        color: '#94a3b8',
        maxWidth: '720px',
        margin: '0 auto 2.5rem',
        lineHeight: 1.6
      }}>
        Upload or capture any reptile photograph. Get instant scientific classification, venom lethality rating, emergency bite first-aid protocols, and habitat intelligence.
      </p>

      {/* Stats bar */}
      <div className="glass-panel hud-corners" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1.5rem',
        padding: '1.25rem 1.5rem',
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        borderRadius: '16px'
      }}>
        {[
          { value: '3,500+', label: 'Species supported' },
          { value: '< 2.5s', label: 'Analysis speed' },
          { value: '98.7%', label: 'Identification accuracy' },
          { value: '24/7', label: 'Emergency antivenom guide', hot: true }
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
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
              {stat.value}
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
