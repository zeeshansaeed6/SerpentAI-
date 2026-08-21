import React, { useState } from 'react';
import { Activity, Heart, Brain, Wind, ShieldAlert, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

const VENOM_TYPES = [
  {
    id: 'neurotoxic',
    name: 'Neurotoxic Venom',
    category: 'Nervous System & Respiratory Attack',
    snakes: 'Cobras (Naja), Kraits (Bungarus), Black Mambas, Coral Snakes',
    color: '#38bdf8',
    summary: 'Blocks synaptic nerve impulse transmission across motor endplates, causing flaccid muscle paralysis and asphyxiation.',
    organs: [
      { name: 'Brain & Cranial Nerves', impact: 'Bilateral ptosis (eyelid drooping), blurred/double vision, facial numbness, slurred speech.' },
      { name: 'Diaphragm & Lungs', impact: 'Progressive respiratory failure; inability to breathe without mechanical ventilator support.' },
      { name: 'Throat & Pharynx', impact: 'Difficulty swallowing (dysphagia), excessive salivation, risk of airway aspiration.' },
      { name: 'Motor Muscles', impact: 'Ascending flaccid paralysis starting from head/neck and moving down to extremities.' }
    ],
    timeline: [
      { time: '0 – 30 Minutes', detail: 'Local numbness or slight tingling at bite site; mild drowsiness; heavy drooping eyelids (ptosis).' },
      { time: '1 – 3 Hours', detail: 'Difficulty swallowing saliva, slurred speech, generalized weakness, unsteady gait.' },
      { time: '4 – 12 Hours', detail: 'Severe respiratory distress, diaphragm paralysis. Fatal without prompt antivenom or mechanical ventilation.' }
    ]
  },
  {
    id: 'hemotoxic',
    name: 'Hemotoxic Venom',
    category: 'Blood Coagulation & Vascular Attack',
    snakes: "Russell's Viper, Saw-scaled Viper, Gaboon Viper, Boomslang",
    color: '#f87171',
    summary: 'Destroys fibrinogen and red blood cells, causes severe consumptive coagulopathy, spontaneous hemorrhage, and organ failure.',
    organs: [
      { name: 'Circulatory System & Vessels', impact: 'Endothelial vascular destruction, massive internal bleeding, rapid drop in blood pressure.' },
      { name: 'Kidneys & Renal Tubules', impact: 'Acute tubular necrosis, oliguria/anuria, acute renal failure requiring hemodialysis.' },
      { name: 'Gums, Eyes & Mucosa', impact: 'Spontaneous oozing of non-clotting blood from gums, nosebleeds, hematuria (blood in urine).' },
      { name: 'Heart & Myocardium', impact: 'Severe hypovolemic shock, tachycardia, cardiac ischemia.' }
    ],
    timeline: [
      { time: '0 – 30 Minutes', detail: 'Excruciating throbbing pain, immediate localized swelling and bleeding from fang punctures.' },
      { time: '1 – 4 Hours', detail: 'Rapidly spreading edema, blood-filled blisters (bullae), continuous non-clotting gum bleeding.' },
      { time: '6 – 24 Hours', detail: 'Severe systemic hemorrhage, hypovolemic shock, acute kidney injury. Requires antivenom + fresh frozen plasma.' }
    ]
  },
  {
    id: 'cytotoxic',
    name: 'Cytotoxic / Necrotoxic Venom',
    category: 'Cellular & Soft Tissue Destruction',
    snakes: 'Puff Adders, Spitting Cobras, Cottonmouths, Fer-de-lance',
    color: '#fbbf24',
    summary: 'Digestive enzymes (phospholipases, proteases) liquefy cell membranes, causing massive local necrosis and compartment syndrome.',
    organs: [
      { name: 'Skin & Subcutaneous Fat', impact: 'Extensive cellular lysis, black necrotic slough, large fluid bullae formation.' },
      { name: 'Muscle Compartments', impact: 'Severe compartment syndrome risking irreversible muscle ischemia and nerve death.' },
      { name: 'Lymphatic Drainage', impact: 'Painful regional lymphadenopathy, severe limb swelling extending to torso.' },
      { name: 'Immune System', impact: 'High secondary bacterial infection risk; may require debridement or surgical grafting.' }
    ],
    timeline: [
      { time: '0 – 30 Minutes', detail: 'Burning agonizing localized pain; immediate swelling, redness, and discoloration around fangs.' },
      { time: '2 – 8 Hours', detail: 'Large dark serosanguinous blisters develop; skin turns dark purple/black indicating necrosis.' },
      { time: '24 – 72 Hours', detail: 'Deep muscle sloughing, tissue demarcation. Requires surgical fasciotomy and wound debridement.' }
    ]
  },
  {
    id: 'myotoxic',
    name: 'Myotoxic Venom',
    category: 'Skeletal Muscle Breakdown',
    snakes: 'Beaked Sea Snakes (Enhydrina), Cascabel Rattlesnake (Crotalus durissus)',
    color: '#a78bfa',
    summary: 'Attacks skeletal muscle fibers causing systemic rhabdomyolysis, releasing toxic myoglobin that clogs the renal filters.',
    organs: [
      { name: 'Skeletal Muscles', impact: 'Generalized intense muscle stiffness, pain on movement, muscle enzyme (CK) elevation.' },
      { name: 'Kidneys & Renal Filtration', impact: 'Myoglobinuria (cola-colored dark brown urine), acute tubular blockage and renal shutdown.' },
      { name: 'Blood Chemistry', impact: 'Hyperkalemia (high potassium) causing life-threatening cardiac arrhythmias.' },
      { name: 'Neuromuscular Junction', impact: 'Muscle flaccidity combined with extreme muscular spasm.' }
    ],
    timeline: [
      { time: '0 – 1 Hour', detail: 'Minimal local bite pain; early muscle ache in neck, arms, and thighs.' },
      { time: '2 – 6 Hours', detail: 'Severe muscle rigidity, painful body movement, urine turns dark reddish-brown or black.' },
      { time: '12 – 24 Hours', detail: 'Acute renal failure from myoglobin overload; hyperkalemic cardiac arrest risk. Immediate dialysis needed.' }
    ]
  }
];

export default function VenomSymptomsVisualizer() {
  const [selectedType, setSelectedType] = useState('neurotoxic');
  const activeVenom = VENOM_TYPES.find(v => v.id === selectedType) || VENOM_TYPES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Activity size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Human Venom Toxicity & Physiological Symptoms Simulator
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          Explore how different reptile venom classes attack human physiological systems, from cellular necrosis to respiratory failure and coagulopathy.
        </p>

        {/* Venom Class Selectors */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {VENOM_TYPES.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedType(v.id)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: selectedType === v.id ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedType === v.id ? v.color : '#94a3b8',
                border: selectedType === v.id ? `2px solid ${v.color}` : '1px solid var(--border-glass)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: v.color }}></span>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '1.5rem' }}>
        {/* Left: Target Organ Impact */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ color: activeVenom.color, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Primary Pathology
            </span>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: '0.2rem 0' }}>
              {activeVenom.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              {activeVenom.summary}
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: '#94a3b8'
          }}>
            <strong style={{ color: '#fff' }}>Example Snakes:</strong> {activeVenom.snakes}
          </div>

          <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Brain size={18} color={activeVenom.color} /> Anatomical System Breakdown
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activeVenom.organs.map((organ, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: activeVenom.color, marginBottom: '0.2rem' }}>
                  {organ.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {organ.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Progression Timeline */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px' }}>
          <h4 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="#f59e0b" /> Clinical Symptom Progression Timeline
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Typical timeline without antivenom intervention. Seek medical care immediately at minute 0.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            {activeVenom.timeline.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  position: 'relative'
                }}
              >
                {/* Timeline node */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `2px solid ${activeVenom.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '1rem',
                  flex: 1
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.3rem' }}>
                    ⏱️ {step.time}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {step.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.85rem',
            color: '#fca5a5'
          }}>
            <strong>Critical Medical Note:</strong> Severity depends on venom dose injected ("wet bite" vs "dry bite"), victim body weight, bite location, and time elapsed before antivenom administration.
          </div>
        </div>
      </div>
    </div>
  );
}
