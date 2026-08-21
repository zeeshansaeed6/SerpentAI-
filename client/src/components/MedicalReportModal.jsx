import React, { useState } from 'react';
import { Printer, X, FileText, CheckCircle2, ShieldAlert, HeartPulse, MapPin } from 'lucide-react';

export default function MedicalReportModal({ result, isOpen, onClose }) {
  if (!isOpen || !result) return null;

  const [patientName, setPatientName] = useState('');
  const [biteLocation, setBiteLocation] = useState('Right Ankle / Lower Leg');
  const [incidentTime, setIncidentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 5, 10, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        borderRadius: '20px',
        position: 'relative',
        background: '#0d1117'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Printable Section */}
        <div id="printable-incident-report">
          {/* Header */}
          <div style={{
            borderBottom: '2px solid #ef4444',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SERPENTAI CLINICAL INCIDENT REPORT
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0.2rem 0' }}>
                Snakebite Envenomation Assessment
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Report Generated: {new Date().toLocaleString()}
              </div>
            </div>
            <div style={{
              background: result.venomous ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: result.venomous ? '#f87171' : '#34d399',
              border: result.venomous ? '1px solid #ef4444' : '1px solid #10b981',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              textAlign: 'center',
              fontWeight: 800
            }}>
              <div>{result.venomous ? 'VENOMOUS' : 'NON-VENOMOUS'}</div>
              <div style={{ fontSize: '0.75rem' }}>{result.dangerLevel || 'Hazard'}</div>
            </div>
          </div>

          {/* Patient Details Inputs */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-glass)'
          }}>
            <h4 style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Patient & Incident Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Bite Time</label>
                <input
                  type="text"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Anatomical Bite Site</label>
                <input
                  type="text"
                  value={biteLocation}
                  onChange={(e) => setBiteLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Identified Species Dossier */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr',
            gap: '1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <img
              src={result.imageData}
              alt={result.snakeName}
              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {result.snakeName}
              </div>
              <div style={{ fontStyle: 'italic', color: '#34d399', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                {result.scientificName}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
                {result.description}
              </p>
            </div>
          </div>

          {/* Medical Guidance Box */}
          <div style={{
            background: result.venomous ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: result.venomous ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{
              color: result.venomous ? '#f87171' : '#34d399',
              fontSize: '0.9rem',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <HeartPulse size={16} /> Clinical Management Recommendations
            </h4>
            <p style={{ color: '#e2e8f0', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
              {result.firstAid}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={18} /> Print / Save Medical PDF
          </button>
        </div>
      </div>
    </div>
  );
}
