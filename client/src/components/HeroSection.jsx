import React from 'react';
import { ShieldCheck, Zap, Activity, Globe } from 'lucide-react';

export default function HeroSection({ onStartScan, onExploreGuide }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem 2rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Top pill badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1rem',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '999px',
        fontSize: '0.85rem',
        color: '#34d399',
        fontWeight: 600,
        marginBottom: '1.5rem'
      }}>
        <Zap size={15} /> Powered by Multimodal Gemini Vision AI
      </div>

      {/* Main Headline */}
      <h1 style={{
        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        lineHeight: 1.15,
        marginBottom: '1.25rem',
        fontWeight: 800
      }}>
        Instant <span className="text-gradient-emerald">Snake Species</span> & <span className="text-gradient-fire">Venom Hazard</span> Detection
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
      <div className="glass-panel" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1.5rem',
        padding: '1.25rem 1.5rem',
        maxWidth: '750px',
        margin: '0 auto',
        borderRadius: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#34d399', fontSize: '1.75rem', fontWeight: 800 }}>3,500+</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Species Supported</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#facc15', fontSize: '1.75rem', fontWeight: 800 }}>&lt; 2.5s</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis Speed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#06b6d4', fontSize: '1.75rem', fontWeight: 800 }}>98.7%</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identification Accuracy</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '1.75rem', fontWeight: 800 }}>24/7</div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Antivenom Guide</div>
        </div>
      </div>
    </div>
  );
}
