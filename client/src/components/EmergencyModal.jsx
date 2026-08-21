import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, HeartPulse, CheckCircle2, XCircle } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
        padding: '1.75rem',
        position: 'relative'
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
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            padding: '0.6rem',
            borderRadius: '12px',
            color: '#ef4444',
            display: 'flex'
          }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 style={{ color: '#ef4444', fontSize: '1.5rem', margin: 0 }}>
              SNAKEBITE EMERGENCY PROTOCOL
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Immediate life-saving measures & antivenom action plan
            </p>
          </div>
        </div>

        {/* Emergency Hotlines */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ambulance / Emergency</div>
            <a href="tel:911" style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
              <PhoneCall size={18} /> 911 / 112 / 108
            </a>
          </div>
          <div style={{ width: '1px', background: 'rgba(239, 68, 68, 0.2)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Poison Control Hotline</div>
            <a href="tel:18002221222" style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
              <PhoneCall size={18} /> 1-800-222-1222
            </a>
          </div>
        </div>

        {/* Step-by-Step Immediate Actions */}
        <h4 style={{ color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartPulse size={20} color="#34d399" /> Critical First-Aid Steps
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* DOs */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <h5 style={{ color: '#34d399', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} /> DO THESE IMMEDIATELY
            </h5>
            <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong>Stay calm & still:</strong> Movement speeds venom circulation.</li>
              <li><strong>Immobilize the limb:</strong> Keep bitten area at or slightly below heart level.</li>
              <li><strong>Remove jewelry:</strong> Take off rings/watches before swelling begins.</li>
              <li><strong>Note the time & snake:</strong> Take a safe photo or remember colors/patterns for antivenom selection.</li>
            </ul>
          </div>

          {/* DON'Ts */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <h5 style={{ color: '#f87171', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <XCircle size={18} /> NEVER DO THESE
            </h5>
            <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong>DO NOT cut the wound:</strong> Causes tissue necrosis.</li>
              <li><strong>DO NOT suck venom:</strong> Dangerous & completely ineffective.</li>
              <li><strong>DO NOT use tourniquets:</strong> Can cause amputation risk.</li>
              <li><strong>DO NOT apply ice:</strong> Causes local tissue destruction.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem' }}
        >
          Understood, Close Emergency Guide
        </button>
      </div>
    </div>
  );
}
