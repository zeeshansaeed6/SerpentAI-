import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import HistoryPage from './pages/HistoryPage';
import QuizPage from './pages/QuizPage';
import SightingsMap from './components/SightingsMap';
import SpeciesComparison from './components/SpeciesComparison';
import HospitalFinder from './components/HospitalFinder';
import VenomSymptomsVisualizer from './components/VenomSymptomsVisualizer';
import SerpentBot from './components/SerpentBot';
import SymptomTriage from './components/SymptomTriage';
import PreventionGuide from './components/PreventionGuide';
import RescueDirectory from './components/RescueDirectory';
import SerpentMark from './components/SerpentMark';
import { usePointerGlow } from './hooks/usePointerGlow';

// Screen-reader page titles (the scanner tab has a visible <h1> in its hero)
const TAB_TITLES = {
  bot: 'SerpentBot AI Herpetologist',
  triage: 'Snakebite Symptom Triage',
  prevention: 'Snake-Proofing and Prevention Guide',
  rescue: 'Snake Rescuers and Wildlife Helplines',
  sightings: 'Community Snake Sightings and Danger Radar',
  compare: 'Lookalike Mimic Analyzer',
  hospitals: 'Antivenom Hospital Locator',
  simulator: 'Venom Pathology Simulator',
  encyclopedia: 'Reptile and Snake Encyclopedia',
  history: 'Your Scan History',
  quiz: 'Snake Identification and Safety Quiz'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  usePointerGlow();

  // Always land at the top of the new view
  const goToTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={goToTab} />

      {/* Main Content View based on activeTab */}
      <main className="main-content">
        {TAB_TITLES[activeTab] && <h1 className="sr-only">{TAB_TITLES[activeTab]}</h1>}
        {activeTab === 'scanner' && (
          <HomePage onExploreGuide={() => goToTab('encyclopedia')} />
        )}
        {activeTab === 'bot' && <SerpentBot />}
        {activeTab === 'triage' && <SymptomTriage />}
        {activeTab === 'prevention' && <PreventionGuide />}
        {activeTab === 'rescue' && <RescueDirectory />}
        {activeTab === 'sightings' && <SightingsMap />}
        {activeTab === 'compare' && <SpeciesComparison />}
        {activeTab === 'hospitals' && <HospitalFinder />}
        {activeTab === 'simulator' && <VenomSymptomsVisualizer />}
        {activeTab === 'encyclopedia' && <GuidePage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'quiz' && <QuizPage />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(5, 11, 9, 0.92)',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div className="thermal-bar" style={{ width: '120px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
            <SerpentMark size={22} />
            <span className="brand-title">SerpentAI Global Intelligence & Antivenom Network</span>
          </div>
          <p style={{ color: '#8aa395', fontSize: '0.82rem', maxWidth: '650px', margin: 0 }}>
            Powered by React, Express, Supabase (PostgreSQL) & Multimodal Gemini 3.6 Flash.
            <br />
            <strong>Medical Notice:</strong> Always contact emergency services (911 / 112 / 108) immediately for snake encounters.
          </p>
          <div style={{ color: '#475569', fontSize: '0.75rem' }}>
            SerpentAI &copy; {new Date().getFullYear()} — Dedicated to Wildlife Conservation & Snakebite Mortality Reduction
          </div>
        </div>
      </footer>
    </div>
  );
}
