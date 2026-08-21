import React, { useState } from 'react';
import { 
  Camera, BookOpen, History, Award, AlertCircle, Menu, X, 
  Radio, ArrowRightLeft, Hospital, Activity, Bot, HeartPulse, Home, Shield, Globe 
} from 'lucide-react';
import EmergencyModal from './EmergencyModal';

export default function Navbar({ activeTab, setActiveTab, currentLang, setCurrentLang }) {
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
            background: 'linear-gradient(135deg, #059669, #10b981)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            🐍
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="brand-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>SerpentAI</span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>Ultra</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>AI Wildlife & Antivenom Network</div>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          overflowX: 'auto',
          maxWidth: '860px',
          padding: '0 0.5rem'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '9px',
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? '#34d399' : '#94a3b8',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Emergency SOS Button + Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {/* Language Switcher */}
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value)}
            style={{
              padding: '0.4rem 0.6rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="en">🇺🇸 EN</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="es">🇪🇸 ES</option>
          </select>

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
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? '#34d399' : '#cbd5e1',
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
