import React, { useState, useEffect } from 'react';
import { MapPin, Plus, AlertCircle, Skull, ShieldCheck, Calendar, User, RefreshCw, X, Radio, Camera } from 'lucide-react';
import { getSightings, createSighting, deleteSighting } from '../services/api';

export default function SightingsMap() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    speciesName: '',
    scientificName: '',
    venomous: true,
    dangerLevel: 'Dangerous',
    locationName: '',
    latitude: '',
    longitude: '',
    notes: '',
    reporterName: '',
    imageData: ''
  });

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      setLoading(true);
      const res = await getSightings();
      if (res.success) {
        setSightings(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch sightings:', err);
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(4),
            longitude: pos.coords.longitude.toFixed(4),
            locationName: prev.locationName || `GPS: ${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`
          }));
        },
        (err) => {
          alert('Unable to retrieve location. Please type your location manually.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.speciesName || !formData.locationName) {
      alert('Please fill in the snake species and location name.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createSighting(formData);
      if (res.success) {
        setSightings(prev => [res.data, ...prev]);
        setIsModalOpen(false);
        setFormData({
          speciesName: '',
          scientificName: '',
          venomous: true,
          dangerLevel: 'Dangerous',
          locationName: '',
          latitude: '',
          longitude: '',
          notes: '',
          reporterName: '',
          imageData: ''
        });
      }
      setSubmitting(false);
    } catch (err) {
      alert('Failed to submit sighting. Please check details.');
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sighting report?')) return;
    try {
      await deleteSighting(id);
      setSightings(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting sighting:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              padding: '0.5rem',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <Radio size={24} className="animate-pulse" />
            </div>
            <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
              Community Snake Sightings & Danger Radar
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '680px' }}>
            Live crowdsourced reptile sightings with GPS coordinates to alert hikers, farmers, and nearby residents of active venomous danger zones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchSightings} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh Radar
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Report Sighting
          </button>
        </div>
      </div>

      {/* Sightings Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#f59e0b' }} />
          <div>Scanning active community sightings radar...</div>
        </div>
      ) : sightings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem', borderRadius: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            No sightings logged yet. Be the first to report a snake sighting in your area!
          </p>
        </div>
      ) : (
        <div className="grid-responsive">
          {sightings.map((item) => (
            <div
              key={item._id}
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                position: 'relative'
              }}
            >
              {/* Photo if available */}
              {item.imageData && (
                <div style={{ height: '150px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
                  <img
                    src={item.imageData}
                    alt={item.speciesName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Title & Danger Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                    {item.speciesName}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#34d399', fontStyle: 'italic' }}>
                    {item.scientificName}
                  </div>
                </div>
                <span className={`badge ${item.venomous ? (item.dangerLevel === 'Deadly' ? 'badge-deadly' : 'badge-dangerous') : 'badge-harmless'}`}>
                  {item.dangerLevel || (item.venomous ? 'Venomous' : 'Harmless')}
                </span>
              </div>

              {/* Location */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                margin: '0.5rem 0 0.8rem'
              }}>
                <MapPin size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{item.locationName}</span>
              </div>

              {/* Notes */}
              {item.notes && (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                  "{item.notes}"
                </p>
              )}

              {/* Footer Meta */}
              <div style={{
                borderTop: '1px solid var(--border-glass)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={13} /> {item.reporterName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} /> {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Sighting Modal */}
      {isModalOpen && (
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
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            borderRadius: '20px',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
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

            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.3rem' }}>
              📍 Report Snake Sighting
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Add a real-time danger marker to keep nearby community members safe.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Species Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. King Cobra, Rattlesnake, Garden Snake"
                  value={formData.speciesName}
                  onChange={(e) => setFormData({ ...formData, speciesName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    Toxicity Type
                  </label>
                  <select
                    value={formData.venomous ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, venomous: e.target.value === 'true' })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(18, 24, 34, 0.95)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="true">⚠️ Venomous</option>
                    <option value="false">🛡️ Non-Venomous</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    Danger Level
                  </label>
                  <select
                    value={formData.dangerLevel}
                    onChange={(e) => setFormData({ ...formData, dangerLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(18, 24, 34, 0.95)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="Deadly">Deadly</option>
                    <option value="Dangerous">Dangerous</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Harmless">Harmless</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                    Location Name / Landmark *
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#34d399',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <MapPin size={13} /> Detect My GPS
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Pine Ridge Hiking Trail, Sector 4 Park"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (Hiker)"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Field Notes / Snake Behavior
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe size, behavior, warning sounds, or exact spot..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    color: '#fff',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {submitting ? 'Publishing Sighting...' : 'Broadcast Sighting to Community'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
