import React, { useRef, useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, HeartPulse, CheckCircle2, Clock, RotateCcw, Printer, PhoneCall } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AnimatedNumber from './AnimatedNumber';

gsap.registerPlugin(useGSAP);

export default function SymptomTriage() {
  const root = useRef(null);

  // Entrance: header, questionnaire, then the result panel
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(['.tr-head', '.tr-form', '.tr-result'], {
        y: 26,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12
      });
    });
  }, { scope: root });

  const [biteMark, setBiteMark] = useState('two_fangs');
  const [timeElapsed, setTimeElapsed] = useState('under_30m');
  const [localSymptoms, setLocalSymptoms] = useState({
    severePain: true,
    rapidSwelling: true,
    bleeding: true,
    blistering: false
  });
  const [systemicSymptoms, setSystemicSymptoms] = useState({
    droopingEyelids: false,
    breathingDifficulty: false,
    gumBleeding: false,
    nauseaDizziness: true
  });
  const [calculated, setCalculated] = useState(false);

  const toggleLocal = (key) => {
    setLocalSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSystemic = (key) => {
    setSystemicSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate Envenomation Risk Score (weights sum to 205, so clamp to the displayed /100 scale)
  let score = 0;
  if (biteMark === 'two_fangs') score += 40;
  else if (biteMark === 'single_fang') score += 25;
  else score += 5;

  if (localSymptoms.severePain) score += 15;
  if (localSymptoms.rapidSwelling) score += 20;
  if (localSymptoms.bleeding) score += 10;
  if (localSymptoms.blistering) score += 15;

  if (systemicSymptoms.droopingEyelids) score += 30;
  if (systemicSymptoms.breathingDifficulty) score += 35;
  if (systemicSymptoms.gumBleeding) score += 30;
  if (systemicSymptoms.nauseaDizziness) score += 10;

  score = Math.min(score, 100);

  const isCritical = score >= 65;
  const isModerate = score >= 35 && score < 65;

  return (
    <div ref={root} style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel tr-head" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <HeartPulse size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Snakebite Symptom Triage & Envenomation Risk Calculator
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '720px' }}>
          Assess bite puncture patterns, symptom onset, and physiological signs to estimate systemic envenomation severity for emergency medical responders.
        </p>
      </div>

      {/* Triage Questionnaire & Results */}
      <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input Form */}
        <div className="glass-panel tr-form" style={{ padding: '1.75rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section 1: Bite Mark Pattern */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              1. Bite Puncture Mark Appearance
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'two_fangs', label: '2 Distinct Punctures (Classic Venomous Fang Marks)', hint: 'High risk of viper/elapid envenomation' },
                { id: 'single_fang', label: '1 Single Deep Puncture Mark', hint: 'Possible partial/glancing strike' },
                { id: 'horseshoe', label: 'Horseshoe / Arc of Multiple Small Teeth Scrapes', hint: 'Typically non-venomous colubrid teeth pattern' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setBiteMark(opt.id)}
                  style={{
                    background: biteMark === opt.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: biteMark === opt.id ? '1px solid #10b981' : '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{opt.hint}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Time Elapsed */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              2. Time Elapsed Since Bite
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {[
                { id: 'under_30m', label: '< 30 Mins' },
                { id: '1_to_3h', label: '1 – 3 Hours' },
                { id: 'over_4h', label: '> 4 Hours' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeElapsed(t.id)}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: timeElapsed === t.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: timeElapsed === t.id ? '1px solid #f59e0b' : '1px solid var(--border-glass)',
                    color: timeElapsed === t.id ? '#fbbf24' : '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Local Symptoms */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              3. Local Bite Site Symptoms
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { key: 'severePain', label: 'Severe Throbbing Pain' },
                { key: 'rapidSwelling', label: 'Rapid Spreading Swelling' },
                { key: 'bleeding', label: 'Continuous Bleeding' },
                { key: 'blistering', label: 'Dark Blisters / Necrosis' }
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => toggleLocal(item.key)}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    background: localSymptoms[item.key] ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: localSymptoms[item.key] ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-glass)',
                    color: localSymptoms[item.key] ? '#fca5a5' : '#94a3b8',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <input type="checkbox" aria-label={item.label} checked={localSymptoms[item.key]} readOnly />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Systemic Symptoms */}
          <div>
            <label style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              4. Systemic / Whole Body Signs
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { key: 'droopingEyelids', label: 'Drooping Eyelids (Ptosis)' },
                { key: 'breathingDifficulty', label: 'Difficulty Breathing / Swallowing' },
                { key: 'gumBleeding', label: 'Gum Bleeding / Dark Urine' },
                { key: 'nauseaDizziness', label: 'Nausea / Extreme Dizziness' }
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => toggleSystemic(item.key)}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    background: systemicSymptoms[item.key] ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: systemicSymptoms[item.key] ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-glass)',
                    color: systemicSymptoms[item.key] ? '#fca5a5' : '#94a3b8',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <input type="checkbox" aria-label={item.label} checked={systemicSymptoms[item.key]} readOnly />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Assessment Card */}
        <div className="glass-panel tr-result" style={{
          padding: '1.75rem',
          borderRadius: '20px',
          border: isCritical ? '1px solid rgba(239, 68, 68, 0.5)' : isModerate ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(16, 185, 129, 0.4)',
          background: isCritical ? 'rgba(239, 68, 68, 0.06)' : isModerate ? 'rgba(245, 158, 11, 0.04)' : 'rgba(16, 185, 129, 0.04)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              background: isCritical ? 'rgba(239, 68, 68, 0.2)' : isModerate ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isCritical ? '#f87171' : isModerate ? '#fbbf24' : '#34d399',
              border: isCritical ? '1px solid #ef4444' : isModerate ? '1px solid #f59e0b' : '1px solid #10b981'
            }}>
              {isCritical
                ? <><AlertTriangle size={15} /> RED ALERT: HIGH ENVENOMATION RISK</>
                : isModerate
                  ? <><AlertTriangle size={15} /> YELLOW ALERT: MODERATE RISK</>
                  : <><ShieldCheck size={15} /> GREEN ALERT: LOW ENVENOMATION RISK</>}
            </div>

            <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>
              Estimated Risk: <AnimatedNumber value={score} /> / 100
            </h3>

            {/* Risk gauge: marker glides along a green → amber → red scale as symptoms change */}
            <div className="risk-gauge" role="img" aria-label={`Estimated risk ${score} out of 100`}>
              <div className="risk-gauge__track" />
              <div className="risk-gauge__marker" style={{ left: `${score}%` }} />
            </div>
            <div className="risk-gauge__scale" aria-hidden="true">
              <span>Low</span><span>Moderate</span><span>Critical</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: '#cbd5e1'
          }}>
            {isCritical ? (
              <div>
                <strong style={{ color: '#f87171' }}>Critical Medical Emergency:</strong> Symptoms suggest significant systemic envenomation. Immediate antivenom therapy and ventilatory/coagulation monitoring are required at a Level 1 Trauma Center.
              </div>
            ) : isModerate ? (
              <div>
                <strong style={{ color: '#fbbf24' }}>Active Medical Evaluation Needed:</strong> Possible envenomation or deep bite. Observe in hospital setting for 24 hours to monitor swelling progression and blood clotting times (20WBCT).
              </div>
            ) : (
              <div>
                <strong style={{ color: '#34d399' }}>Low Envenomation Likelihood:</strong> Likely a dry bite or harmless species. Clean the wound, monitor for infection, and ensure tetanus vaccination is up to date.
              </div>
            )}
          </div>

          {/* Action List */}
          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Recommended Resuscitation Steps:
          </h4>
          <ul style={{ fontSize: '0.8rem', color: '#cbd5e1', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
            <li>Immobilize bitten limb with splint or sling at heart level.</li>
            <li>Take patient to hospital by vehicle (never walk or run).</li>
            <li>Perform 20-minute Whole Blood Clotting Test (20WBCT) on arrival.</li>
            <li>Prepare antivenom infusion if neurological signs or coagulopathy appear.</li>
          </ul>

          <a
            href="tel:911"
            className="btn btn-danger"
            style={{ width: '100%', padding: '0.75rem', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            <PhoneCall size={16} /> Call Emergency Ambulance
          </a>
        </div>
      </div>
    </div>
  );
}
