import React, { useState } from 'react';
import { Skull, ShieldCheck, MapPin, Compass, Info, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';

export default function SnakeCard({ snake }) {
  const [expanded, setExpanded] = useState(false);

  const getDangerBadgeClass = (level) => {
    switch (level) {
      case 'Deadly': return 'badge-deadly';
      case 'Dangerous': return 'badge-dangerous';
      case 'Moderate': return 'badge-moderate';
      default: return 'badge-harmless';
    }
  };

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      {/* Header with Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            {snake.name}
          </h3>
          <div className="latin" style={{ fontSize: '0.92rem', color: '#6ee7b7' }}>
            {snake.scientificName}
          </div>
        </div>
        <span className={`badge ${getDangerBadgeClass(snake.dangerLevel)}`}>
          {snake.dangerLevel}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.85rem',
        color: '#cbd5e1',
        lineHeight: 1.5,
        marginBottom: '1rem',
        flex: 1
      }}>
        {snake.description}
      </p>

      {/* Info Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={13} color="#34d399" />
          <span><strong>Habitat:</strong> {snake.habitat}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Compass size={13} color="#06b6d4" />
          <span><strong>Region:</strong> {snake.region}</span>
        </div>
      </div>

      {/* Expandable Details Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn btn-secondary"
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '0.8rem',
          justifyContent: 'space-between'
        }}
      >
        <span>{expanded ? 'Hide Safety & First Aid' : 'View Safety & First Aid'}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded Accordion Content */}
      {expanded && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          {snake.firstAid && (
            <div style={{
              background: snake.venomous ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              border: snake.venomous ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              fontSize: '0.78rem',
              color: '#e2e8f0'
            }}>
              <div style={{ fontWeight: 700, color: snake.venomous ? '#f87171' : '#34d399', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <HeartPulse size={14} /> Medical / First Aid Guidance
              </div>
              {snake.firstAid}
            </div>
          )}

          {snake.funFact && (
            <div style={{
              background: 'rgba(250, 204, 21, 0.06)',
              border: '1px solid rgba(250, 204, 21, 0.2)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              fontSize: '0.78rem',
              color: '#fef08a'
            }}>
              <strong style={{ color: '#facc15' }}>Did you know?</strong> {snake.funFact}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
