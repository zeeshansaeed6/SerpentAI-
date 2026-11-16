import React, { useState } from 'react';
import { 
  Camera, BookOpen, History, Award, AlertCircle, Menu, X, 
  Radio, ArrowRightLeft, Hospital, Activity, Bot, HeartPulse, Home, Shield
} from 'lucide-react';
import EmergencyModal from './EmergencyModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'scanner', label: 'AI Scanner', icon: Camera },
    { id: 'bot', label: 'SerpentBot AI', icon: Bot },
    { id: 'triage', label: 'Bite Triage', icon: HeartPulse },
    { id: 'prevention', label: 'Snake Proofing', icon: Home },
    { id: 'rescue', label: 'Snake Rescuers', icon: Shield },
    { id: 'sightings', label: 'Danger Radar', icon: Radio },
    { id: 'compare', label: 'Mimic Analyzer', icon: ArrowRightLeft },
    { id: 'hospitals', label: 'Antivenom Centers', icon: Hospital },
    { id: 'simulator', label: 'Venom Pathology', icon: Activity },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'history', label: 'History', icon: History },
    { id: 'quiz', label: 'Quiz', icon: Award },
  ];

  return (
    <>
      <header className="glass-panel" style={{
        position: 'sticky',
        top: '1rem',
        zIndex: 100,
        margin: '0.75rem 1.5rem',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('scanner')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #0891b2, #10b981)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            border: '1px solid rgba(103, 232, 249, 0.4)',
            boxShadow: '0 0 18px rgba(34, 211, 238, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)'
          }}>
            🐍
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="brand-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>SerpentAI</span>
              <span style={{
                background: 'rgba(34, 211, 238, 0.16)',
                color: '#67e8f9',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '6px',
                border: '1px solid rgba(34, 211, 238, 0.4)'
              }}>Ultra</span>
            </div>
            <div className="brand-tagline mono" style={{ fontSize: '0.62rem', color: '#7d93ad', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
              <span className="status-dot" /> Network online
            </div>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          overflowX: 'auto',
          maxWidth: '100%',
          padding: '0 0.5rem'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={isActive ? 'nav-btn active' : 'nav-btn'}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '9px',
                  background: isActive ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
                  color: isActive ? '#67e8f9' : '#94a3b8',
                  border: isActive ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Emergency SOS Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="btn btn-danger"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.78rem',
              borderRadius: '9px'
            }}
          >
            <AlertCircle size={15} />
            <span>SOS</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary mobile-toggle"
            style={{ padding: '0.45rem', display: 'none' }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="glass-panel" style={{
          margin: '0 1.5rem 1rem',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
                  color: isActive ? '#67e8f9' : '#cbd5e1',
                  border: 'none',
                  fontWeight: 600,
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Emergency Modal */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </>
  );
}
