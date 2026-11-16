import React, { useState } from 'react';
import { PhoneCall, Shield, Search, MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const RESCUERS = [
  {
    id: 'res-1',
    name: 'Wildlife SOS 24/7 National Reptile Rescue',
    region: 'Delhi NCR / Northern India',
    country: 'India',
    phone: '+91-9871963535',
    type: 'NGO & Forest Dept Partner',
    available24_7: true,
    specialization: 'Cobras, Kraits, Vipers, Pythons in urban homes'
  },
  {
    id: 'res-2',
    name: 'Friends of Snakes Society (FOSS)',
    region: 'Hyderabad / Telangana',
    country: 'India',
    phone: '+91-8374233366',
    type: 'Certified Rescue Team',
    available24_7: true,
    specialization: 'Urban extraction, conservation education'
  },
  {
    id: 'res-3',
    name: 'Quick Response Team (QRT) Wildlife Rescue',
    region: 'Bangalore / Karnataka',
    country: 'India',
    phone: '+91-9980339880',
    type: 'Forest Dept Registered',
    available24_7: true,
    specialization: 'Venomous reptile relocation'
  },
  {
    id: 'res-4',
    name: 'Florida Fish and Wildlife Conservation (FWC)',
    region: 'Florida Statewide',
    country: 'United States',
    phone: '+1-888-404-3922',
    type: 'State Wildlife Agency',
    available24_7: true,
    specialization: 'Rattlesnakes, Moccasins, Pythons'
  },
  {
    id: 'res-5',
    name: 'WIRES Wildlife Rescue Emergency Hotline',
    region: 'New South Wales / Sydney',
    country: 'Australia',
    phone: '+61-1300094737',
    type: 'Licensed Wildlife Service',
    available24_7: true,
    specialization: 'Brown snakes, Red-bellied black snakes'
  }
];

export default function RescueDirectory() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');

  const filtered = RESCUERS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase()) ||
      r.specialization.toLowerCase().includes(search.toLowerCase());
    const matchCountry = country === 'all' || r.country.toLowerCase() === country.toLowerCase();
    return matchSearch && matchCountry;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Certified Snake Rescuers & Wildlife Helpline Directory
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '720px' }}>
          Never kill or attempt to capture wild snakes yourself. Contact licensed, trained snake catchers and forest department rescue units for humane relocation.
        </p>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search rescue team, region, city..."
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

          <select
            aria-label="Filter by country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
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
            <option value="all">All Countries</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="Australia">Australia</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(r => (
          <div
            key={r.id}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, background: 'rgba(6, 182, 212, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  {r.type}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> 24/7 Active
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '0.3rem 0', fontWeight: 700 }}>
                {r.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                <MapPin size={14} />
                <span>{r.region} ({r.country})</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '1rem' }}>
                <strong>Focus:</strong> {r.specialization}
              </p>
            </div>

            <a
              href={`tel:${r.phone.replace(/[^0-9+]/g, '')}`}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem', textDecoration: 'none', fontSize: '0.85rem' }}
            >
              <PhoneCall size={16} /> Call Snake Catcher ({r.phone})
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
