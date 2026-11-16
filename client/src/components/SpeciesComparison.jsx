import React, { useState } from 'react';
import { Eye, ShieldAlert, ShieldCheck, ArrowRightLeft, Sparkles, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

const COMPARISON_PAIRS = [
  {
    id: 'coral-vs-king',
    title: 'Coral Snake vs Scarlet Kingsnake',
    category: 'Color Band Mimicry',
    snakeA: {
      name: 'Eastern Coral Snake',
      scientificName: 'Micrurus fulvius',
      venomous: true,
      dangerLevel: 'Deadly',
      rhyme: 'Red on Yellow, Kill a Fellow!',
      pupils: 'Round pupils',
      head: 'Blunt black snout with no heat pit',
      banding: 'Red bands directly touch Yellow bands',
      fangs: 'Fixed, short front fangs with neurotoxic venom',
      temperament: 'Extremely secretive and shy, but lethal if provoked',
      image: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=400&q=80'
    },
    snakeB: {
      name: 'Scarlet Kingsnake',
      scientificName: 'Lampropeltis elapsoides',
      venomous: false,
      dangerLevel: 'Harmless',
      rhyme: 'Red on Black, Friend of Jack / Venom Lack!',
      pupils: 'Round pupils',
      head: 'Reddish snout',
      banding: 'Red bands touch Black bands (separated from yellow)',
      fangs: 'No fangs or venom; non-venomous constrictor',
      temperament: 'Harmless to humans, beneficial rodent control',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'cottonmouth-vs-watersnake',
    title: 'Cottonmouth (Water Moccasin) vs Banded Water Snake',
    category: 'Aquatic Pit Viper vs Harmless Water Snake',
    snakeA: {
      name: 'Cottonmouth / Water Moccasin',
      scientificName: 'Agkistrodon piscivorus',
      venomous: true,
      dangerLevel: 'Deadly',
      rhyme: 'Blocky head & white mouth interior warning',
      pupils: 'Vertical cat-like elliptical pupils',
      head: 'Wide, spade-shaped triangular head with deep facial heat pits',
      banding: 'Ragged pixelated dark hourglass saddles with pixelated edges',
      fangs: 'Hinged front fangs delivering destructive cytotoxic/hemotoxic venom',
      temperament: 'Coils and opens bright white mouth (cottonmouth) when alarmed',
      image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=400&q=80'
    },
    snakeB: {
      name: 'Banded Water Snake',
      scientificName: 'Nerodia fasciata',
      venomous: false,
      dangerLevel: 'Harmless',
      rhyme: 'Round pupils & dark vertical lip bars',
      pupils: 'Round pupils situated high on skull',
      head: 'Narrower, oval head without heat pits (though may flatten head when scared)',
      banding: 'Clean unbroken crossbands, vertical dark bars on lower lip scales',
      fangs: 'No fangs or venom glands; teeth only',
      temperament: 'Dives into water quickly; bites only if physically grasped',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'cobra-vs-ratsnake',
    title: 'Indian Cobra vs Oriental Rat Snake (Dhaman)',
    category: 'Elapid Hooded Snake vs Harmless Colubrid',
    snakeA: {
      name: 'Indian Spectacled Cobra',
      scientificName: 'Naja naja',
      venomous: true,
      dangerLevel: 'Deadly',
      rhyme: 'Wide expandable hood with spectacle marking',
      pupils: 'Round, alert dark eyes with smooth scales',
      head: 'Broad, rounded head that flattens into an imposing wide hood',
      banding: 'Tan/brown/black with hood spectacle mark; body scales smooth',
      fangs: 'Proteroglyphous fixed fangs delivering potent neurotoxin',
      temperament: 'Rises up 1/3 of body length and loudly hisses when cornered',
      image: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=400&q=80'
    },
    snakeB: {
      name: 'Oriental Rat Snake (Dhaman)',
      scientificName: 'Ptyas mucosa',
      venomous: false,
      dangerLevel: 'Harmless',
      rhyme: 'Keel scales, large eyes, black lip lines & no hood',
      pupils: 'Very large round eyes with keen daylight vision',
      head: 'Elongated narrow head with prominent black vertical stripes on lips',
      banding: 'Olive/brown with black reticulated net pattern towards the tail',
      fangs: 'No venom; extremely fast lightning runner',
      temperament: 'Fast fleeing; will mimic a growl if cornered but non-venomous',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80'
    }
  }
];

export default function SpeciesComparison() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const pair = COMPARISON_PAIRS[selectedPairIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(16, 185, 129, 0.2))',
            padding: '0.5rem',
            borderRadius: '12px',
            color: '#34d399',
            display: 'flex'
          }}>
            <ArrowRightLeft size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Side-by-Side Snake Comparison & Lookalike Mimic Analyzer
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          Prevent life-threatening identification mistakes in the wild. Compare dangerous venomous species with their harmless lookalike mimics.
        </p>

        {/* Pair Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {COMPARISON_PAIRS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedPairIndex(idx)}
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                background: selectedPairIndex === idx ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedPairIndex === idx ? '#34d399' : '#cbd5e1',
                border: selectedPairIndex === idx ? '1px solid #10b981' : '1px solid var(--border-glass)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Side by Side Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Venomous Species A */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          background: 'rgba(239, 68, 68, 0.04)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-deadly" style={{ marginBottom: '0.4rem' }}>
                🚨 {pair.snakeA.dangerLevel} VENOMOUS
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                {pair.snakeA.name}
              </h3>
              <div className="latin" style={{ color: '#f87171', fontSize: '0.95rem' }}>
                {pair.snakeA.scientificName}
              </div>
            </div>
          </div>

          {/* Rule of thumb callout */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#fecaca',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            ⚠️ Field Rule: "{pair.snakeA.rhyme}"
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>HEAD & SNOUT</div>
              <div style={{ color: '#fff' }}>{pair.snakeA.head}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>COLOR PATTERN & SCALES</div>
              <div style={{ color: '#fff' }}>{pair.snakeA.banding}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>PUPIL & EYE SHAPE</div>
              <div style={{ color: '#fff' }}>{pair.snakeA.pupils}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>FANGS & TOXICITY</div>
              <div style={{ color: '#fca5a5' }}>{pair.snakeA.fangs}</div>
            </div>
          </div>
        </div>

        {/* Harmless Species B */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          background: 'rgba(16, 185, 129, 0.04)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-harmless" style={{ marginBottom: '0.4rem' }}>
                🛡️ HARMLESS MIMIC
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                {pair.snakeB.name}
              </h3>
              <div className="latin" style={{ color: '#6ee7b7', fontSize: '0.95rem' }}>
                {pair.snakeB.scientificName}
              </div>
            </div>
          </div>

          {/* Rule of thumb callout */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#a7f3d0',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            🛡️ Field Rule: "{pair.snakeB.rhyme}"
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>HEAD & SNOUT</div>
              <div style={{ color: '#fff' }}>{pair.snakeB.head}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>COLOR PATTERN & SCALES</div>
              <div style={{ color: '#fff' }}>{pair.snakeB.banding}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>PUPIL & EYE SHAPE</div>
              <div style={{ color: '#fff' }}>{pair.snakeB.pupils}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>FANGS & TOXICITY</div>
              <div style={{ color: '#a7f3d0' }}>{pair.snakeB.fangs}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
