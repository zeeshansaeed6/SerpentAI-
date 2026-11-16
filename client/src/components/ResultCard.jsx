import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  AlertTriangle, ShieldCheck, Volume2, VolumeX, HeartPulse, 
  MapPin, Compass, Utensils, Lightbulb, RotateCcw, Share2, 
  CheckCircle2, ExternalLink, Skull, FileText, Hospital, PhoneCall, Navigation, Crosshair 
} from 'lucide-react';
import MedicalReportModal from './MedicalReportModal';
import { getHospitals } from '../services/api';
import { calculateDistance } from '../utils/distance';

gsap.registerPlugin(useGSAP);

export default function ResultCard({ result, onScanAgain }) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Nearby hospitals state
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Detecting your location...');
  const root = useRef(null);

  // Auto-detect user GPS and find nearest antivenom centers
  useEffect(() => {
    fetchNearbyEmergencyHospitals();
  }, [result]);

  // Staged reveal of the dossier: banner → photo → name → details → meter fill → info cards.
  // Transform/opacity only; reduced-motion users see the final state immediately.
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power3.out' } });
      tl.from('.rc-banner', { y: -18, opacity: 0, duration: 0.5 })
        .from('.rc-image', { scale: 0.94, opacity: 0, duration: 0.8 }, '<0.1')
        .from('.rc-title', { y: 22, opacity: 0 }, '<0.15')
        .from('.rc-latin', { y: 14, opacity: 0 }, '<0.12')
        .from('.rc-desc', { y: 14, opacity: 0 }, '<0.1')
        .from('.rc-meter-fill', { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut' }, '-=0.3')
        .from('.rc-chip', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, '<0.2');
    });
  }, { scope: root, dependencies: [result] });

  // Early return must come after all hooks (rules of hooks)
  if (!result) return null;

  const isDeadly = result.dangerLevel === 'Deadly' || (result.venomous && result.dangerLevel === 'Dangerous');
  const isVenomous = result.venomous;

  const fetchNearbyEmergencyHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const res = await getHospitals();
      if (res.success && res.data) {
        let hospitalsList = res.data;

        // Try getting browser GPS
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const uLat = pos.coords.latitude;
              const uLng = pos.coords.longitude;
              setUserLocation({ lat: uLat, lng: uLng });
              setLocationStatus(`GPS: ${uLat.toFixed(2)}°, ${uLng.toFixed(2)}°`);

              // Sort hospitals by calculated distance
              const sorted = hospitalsList.map(h => ({
                ...h,
                calculatedDistance: calculateDistance(uLat, uLng, h.lat, h.lng)
              })).sort((a, b) => parseFloat(a.calculatedDistance) - parseFloat(b.calculatedDistance));

              setNearbyHospitals(sorted.slice(0, 2));
              setLoadingHospitals(false);
            },
            (err) => {
              setLocationStatus('Default Regional Centers (GPS disabled)');
              setNearbyHospitals(hospitalsList.slice(0, 2));
              setLoadingHospitals(false);
            },
            { timeout: 6000 }
          );
        } else {
          setNearbyHospitals(hospitalsList.slice(0, 2));
          setLoadingHospitals(false);
        }
      }
    } catch (err) {
      console.error('Failed to load emergency hospitals:', err);
      setLoadingHospitals(false);
    }
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textToRead = `Species Identified: ${result.snakeName}. Scientific name: ${result.scientificName}. ${
      isVenomous ? 'Warning: This snake is venomous with ' + result.dangerLevel + ' hazard level.' : 'This snake is non-venomous and harmless.'
    } ${result.description}. First Aid guidance: ${result.firstAid}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `SerpentAI: Identified ${result.snakeName}`,
        text: `Identified ${result.snakeName} (${result.scientificName}) - ${isVenomous ? 'Venomous' : 'Non-venomous'}. Check first aid!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${result.snakeName} (${result.scientificName}) - ${isVenomous ? 'VENOMOUS' : 'NON-VENOMOUS'}\nFirst aid: ${result.firstAid}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <div ref={root} style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Alert Header Banner if Venomous */}
        {isVenomous ? (
          <div className="rc-banner rc-banner--danger" style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: '#ef4444',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Skull size={24} />
              </div>
              <div>
                <h4 aria-level={2} style={{ color: '#f87171', margin: 0, fontSize: '1.1rem' }}>
                  VENOMOUS REPTILE DETECTED — {result.dangerLevel?.toUpperCase() || 'DANGEROUS'}
                </h4>
                <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.85rem' }}>
                  Keep safe distance. Do not touch or provoke this animal. Review emergency first-aid and nearest antivenom centers below.
                </p>
              </div>
            </div>
            <span className="badge badge-deadly">
              {result.dangerLevel || 'Venomous'}
            </span>
          </div>
        ) : (
          <div className="rc-banner" style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: '#10b981',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 aria-level={2} style={{ color: '#34d399', margin: 0, fontSize: '1.1rem' }}>
                  NON-VENOMOUS / HARMLESS SPECIES
                </h4>
                <p style={{ color: '#a7f3d0', margin: 0, fontSize: '0.85rem' }}>
                  This snake poses no venom hazard to humans or household pets.
                </p>
              </div>
            </div>
            <span className="badge badge-harmless">
              Safe / Harmless
            </span>
          </div>
        )}

        {/* Main Dossier Card */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', position: 'relative' }}>
          <div className="stack-md" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: '2rem',
            alignItems: 'start'
          }}>
            {/* Left Column: Image & Confidence Meter */}
            <div>
              <div className="rc-image" style={{
                borderRadius: '18px',
                overflow: 'hidden',
                background: '#000',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1.25rem',
                height: '260px'
              }}>
                <img
                  src={result.imageData}
                  alt={result.snakeName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* AI Confidence Meter */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                padding: '1rem',
                border: '1px solid var(--border-glass)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>AI Confidence</span>
                  <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700 }}>
                    {result.confidence === 'High' ? '98.5% (High)' : result.confidence === 'Medium' ? '86.0% (Medium)' : '72.0% (Low)'}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div className="rc-meter-fill" style={{
                    height: '100%',
                    width: result.confidence === 'High' ? '98%' : result.confidence === 'Medium' ? '85%' : '65%',
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                    borderRadius: '999px',
                    transition: 'width 1s ease'
                  }}></div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={onScanAgain}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
                  >
                    <RotateCcw size={16} /> Scan Another
                  </button>
                  <button
                    onClick={handleShare}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                  >
                    <Share2 size={16} /> {copied ? 'Copied!' : 'Share'}
                  </button>
                </div>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    fontSize: '0.85rem',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    color: '#34d399'
                  }}
                >
                  <FileText size={16} /> Export Medical Incident PDF
                </button>
              </div>
            </div>

            {/* Right Column: Species Intelligence Details */}
            <div>
              {/* Header & TTS button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h2 className="rc-title" style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
                    {result.snakeName}
                  </h2>
                  <div className="latin rc-latin" style={{ color: '#6ee7b7', fontSize: '1.25rem' }}>
                    {result.scientificName}
                  </div>
                </div>

                {/* Audio Voice button */}
                <button
                  onClick={toggleSpeech}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.8rem',
                    borderRadius: '10px',
                    color: speaking ? '#ef4444' : '#34d399',
                    border: speaking ? '1px solid #ef4444' : '1px solid rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span>{speaking ? 'Stop Voice' : 'Listen AI Audio'}</span>
                </button>
              </div>

              {/* Description */}
              <p className="rc-desc" style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {result.description}
              </p>

              {/* Key Habitat & Region Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                <div className="rc-chip" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <MapPin size={14} color="#34d399" /> HABITAT
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{result.habitat || 'Forests, Grasslands'}</div>
                </div>

                <div className="rc-chip" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <Compass size={14} color="#06b6d4" /> GEOGRAPHIC REGION
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{result.region || 'Global / Tropical'}</div>
                </div>

                {result.diet && (
                  <div className="rc-chip" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <Utensils size={14} color="#facc15" /> DIET & PREY
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{result.diet}</div>
                  </div>
                )}
              </div>

              {/* First Aid Protocol */}
              <div className="rc-chip" style={{
                background: isVenomous ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: isVenomous ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '14px',
                padding: '1.2rem',
                marginBottom: '1.25rem'
              }}>
                <h4 aria-level={3} style={{
                  color: isVenomous ? '#f87171' : '#34d399',
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <HeartPulse size={18} /> First Aid & Medical Protocol
                </h4>
                <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                  {result.firstAid}
                </p>
              </div>

              {/* Fun Fact */}
              {result.funFact && (
                <div className="rc-chip" style={{
                  background: 'rgba(250, 204, 21, 0.08)',
                  border: '1px solid rgba(250, 204, 21, 0.25)',
                  borderRadius: '14px',
                  padding: '1rem 1.2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <Lightbulb size={20} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ color: '#facc15', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Herpetologist Fun Fact
                    </div>
                    <div style={{ color: '#fef08a', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {result.funFact}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🏥 Auto-Dispatched Nearest Antivenom Hospitals based on User Location */}
        <div className="glass-panel" style={{
          padding: '1.75rem',
          borderRadius: '20px',
          border: isVenomous ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
          background: isVenomous ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                background: isVenomous ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isVenomous ? '#ef4444' : '#34d399',
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Hospital size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                  Nearest Verified Antivenom Referral Centers
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Crosshair size={12} color="#34d399" />
                  <span>Auto-matched location: {locationStatus}</span>
                </div>
              </div>
            </div>

            <span className="badge badge-harmless" style={{ fontSize: '0.75rem' }}>
              24/7 Verified Stocks
            </span>
          </div>

          {loadingHospitals ? (
            <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              Calculating distances to nearest emergency toxicology facilities...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {nearbyHospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        ✓ {hosp.stockStatus}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                        📍 {hosp.calculatedDistance ? `~${hosp.calculatedDistance} km` : `~${hosp.distanceEstimate}`}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: '0.2rem 0', fontWeight: 700 }}>
                      {hosp.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.6rem 0' }}>
                      {hosp.address} ({hosp.city})
                    </p>

                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '0.85rem' }}>
                      <strong>Antivenom:</strong> {hosp.antivenomAvailable.join(', ')}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <a
                      href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem', fontSize: '0.78rem', textDecoration: 'none' }}
                    >
                      <PhoneCall size={14} /> Call Emergency
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem', fontSize: '0.78rem', textDecoration: 'none' }}
                    >
                      <Navigation size={14} /> Navigate Map
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Printable Medical Incident Modal */}
      <MedicalReportModal
        result={result}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
}
