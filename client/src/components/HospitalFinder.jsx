import React, { useState, useEffect } from 'react';
import { Hospital, PhoneCall, MapPin, CheckCircle2, ShieldAlert, Navigation, Search, RefreshCw, AlertCircle, Crosshair } from 'lucide-react';
import { getHospitals } from '../services/api';
import { calculateDistance } from '../utils/distance';

export default function HospitalFinder() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, [search, countryFilter]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.query = search.trim();
      if (countryFilter !== 'all') params.country = countryFilter;

      const res = await getHospitals(params);
      if (res.success) {
        let list = res.data;

        // If user location already detected, calculate distances
        if (userLocation) {
          list = list.map(h => ({
            ...h,
            calculatedDistance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng)
          })).sort((a, b) => parseFloat(a.calculatedDistance) - parseFloat(b.calculatedDistance));
        }

        setHospitals(list);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      setGpsStatus('Locating GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          setUserLocation({ lat: uLat, lng: uLng });
          setGpsStatus(`GPS Active (${uLat.toFixed(2)}°, ${uLng.toFixed(2)}°)`);

          setHospitals(prev => {
            const updated = prev.map(h => ({
              ...h,
              calculatedDistance: calculateDistance(uLat, uLng, h.lat, h.lng)
            })).sort((a, b) => parseFloat(a.calculatedDistance) - parseFloat(b.calculatedDistance));
            return updated;
          });
        },
        (err) => {
          setGpsStatus('Location permission denied / unavailable');
        }
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Hospital size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Antivenom Emergency Hospital & Critical Care Locator
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '700px' }}>
          Locate nearest emergency referral centers equipped with validated snake antivenom stocks, intensive care ventilatory support, and 24/7 toxicology teams.
        </p>

        {/* Search, GPS and Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search hospital name, city, antivenom brand (e.g. Polyvalent, CroFab)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleDetectGPS}
            className="btn btn-outline"
            style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}
          >
            <Crosshair size={16} /> {gpsStatus || 'Sort by Nearest GPS'}
          </button>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(18, 24, 34, 0.95)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: '#cbd5e1',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Global Regions</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="Australia">Australia</option>
            <option value="Hong Kong">Hong Kong / Asia</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#ef4444' }} />
          <div>Scanning regional antivenom inventories...</div>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', borderRadius: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            No hospitals found matching your search. Try changing search keywords.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <CheckCircle2 size={13} /> {hosp.stockStatus}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '0.82rem', fontWeight: 700 }}>
                    📍 {hosp.calculatedDistance ? `~${hosp.calculatedDistance} km` : `~${hosp.distanceEstimate}`}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 700 }}>
                  {hosp.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#06b6d4', marginBottom: '0.75rem', fontWeight: 600 }}>
                  {hosp.type}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                  <MapPin size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{hosp.address} ({hosp.city}, {hosp.country})</span>
                </div>

                {/* Antivenom Stock Checklist */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    Available Antivenom Units:
                  </div>
                  {hosp.antivenomAvailable.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.5rem' }}>
                <a
                  href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn btn-danger"
                  style={{ padding: '0.55rem', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  <PhoneCall size={15} /> Emergency Call
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  <Navigation size={15} /> Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
