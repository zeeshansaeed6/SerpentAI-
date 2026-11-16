import React, { useState } from 'react';
import { Home, ShieldCheck, CheckSquare, XCircle, AlertTriangle, Lightbulb, Tent, Sparkles } from 'lucide-react';

const SECTIONS = [
  {
    id: 'home',
    title: '🏡 Home & Backyard Snake-Proofing',
    items: [
      { rule: 'Eliminate Rodents & Food Sources', detail: 'Snakes follow prey. Store pet food and bird seed in airtight metal containers to eliminate mice and rats.' },
      { rule: 'Trim Lawn & Clear Woodpiles', detail: 'Keep grass cut below 2 inches. Move firewood stacks and construction debris at least 30 feet away from house walls.' },
      { rule: 'Seal Foundation Cracks & Gaps', detail: 'Snakes can squeeze through holes larger than 1/4 inch. Seal gaps under doors, dryer vents, and pipe penetrations.' },
      { rule: 'Install Heavy 1/4" Hardware Mesh', detail: 'Attach wire mesh along fencing, angling outwards to prevent snakes from squeezing through garden perimeter.' }
    ]
  },
  {
    id: 'outdoor',
    title: '🏕️ Hiking & Camping Safety Protocols',
    items: [
      { rule: 'Always Check Boots & Sleeping Bags', detail: 'Never leave shoes or boots outside. Shake them out thoroughly before putting feet inside.' },
      { rule: 'Carry a High-Lumen Flashlight at Night', detail: 'Over 60% of venomous bites happen after dusk when nocturnal snakes (like Kraits and Vipers) are actively hunting.' },
      { rule: 'Never Step Over Logs Blindly', detail: 'Always step onto a fallen log first and check the other side before stepping down.' },
      { rule: 'Keep Tent Zipped Fully at All Times', detail: 'Even during the day, keep mesh and outer doors zipped shut to prevent reptiles from seeking cool shelter inside.' }
    ]
  }
];

const MYTHS = [
  {
    myth: "Commercial snake repellent powders, sulfur, and mothballs keep snakes away.",
    reality: "MYTH BUSTED! Controlled scientific trials prove snakes freely crawl over sulfur, mothballs, and chemical sprays without hesitation. The only effective deterrent is physical exclusion and prey elimination.",
    safeAlternative: "Seal gaps with mortar/mesh and eliminate rodent food sources."
  },
  {
    myth: "Carbolic acid (phenol) around the house boundary repels snakes.",
    reality: "MYTH BUSTED & DANGEROUS! Carbolic acid is highly toxic to pets, children, and groundwater, yet snakes readily cross it once the liquid evaporates.",
    safeAlternative: "Keep vegetation trimmed and ground clear of hiding debris."
  },
  {
    myth: "Cutting the bite mark and sucking out venom saves lives.",
    reality: "MYTH BUSTED & HARMFUL! Venom enters the lymphatic system instantly. Sucking venom introduces mouth bacteria, damages muscle tissue, and can poison the rescuer.",
    safeAlternative: "Immobilize the limb and rush immediately to an antivenom hospital."
  }
];

export default function PreventionGuide() {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Home size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Comprehensive Snake-Proofing & Prevention Guide
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '720px' }}>
          Proven environmental exclusion strategies, home inspection checklists, outdoor safety rules, and scientifically debunked snake myths.
        </p>
      </div>

      {/* Checklists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {SECTIONS.map((sec, secIdx) => (
          <div key={sec.id} className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem', fontWeight: 700 }}>
              {sec.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {sec.items.map((item, idx) => {
                const key = `${secIdx}-${idx}`;
                const isDone = checkedItems[key];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(key)}
                    style={{
                      background: isDone ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isDone ? '1px solid #10b981' : '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <input type="checkbox" aria-label={item.rule} checked={Boolean(isDone)} readOnly />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isDone ? '#34d399' : '#fff' }}>
                        {item.rule}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, paddingLeft: '1.5rem', lineHeight: 1.4 }}>
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Room Containment Protocol */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        borderRadius: '20px',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        background: 'rgba(245, 158, 11, 0.04)'
      }}>
        <h3 style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={22} /> What to Do If a Snake Enters Your House
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>1. Evacuate Room</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Calmly get all family members and pets out of the room immediately.</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>2. Block Doorway</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Close the door and place a rolled-up wet towel firmly along the bottom gap.</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>3. Call Certified Catcher</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Never attempt to hit or catch it yourself. Call local wildlife rescue.</div>
          </div>
        </div>
      </div>

      {/* Scientific Myth Busters */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={22} color="#facc15" /> Scientific Snake Myth-Busters
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {MYTHS.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '1.2rem'
              }}
            >
              <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <XCircle size={16} /> Myth: "{m.myth}"
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                {m.reality}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                ✓ Effective Solution: {m.safeAlternative}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
