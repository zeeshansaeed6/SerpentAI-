import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, BookOpen, Skull, ShieldCheck } from 'lucide-react';
import SnakeCard from '../components/SnakeCard';
import { getSnakes } from '../services/api';

export default function GuidePage() {
  const [snakes, setSnakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [venomFilter, setVenomFilter] = useState('all');
  const [dangerFilter, setDangerFilter] = useState('all');

  useEffect(() => {
    fetchSnakes();
  }, [search, venomFilter, dangerFilter]);

  const fetchSnakes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (venomFilter === 'venomous') params.venomous = 'true';
      if (venomFilter === 'non-venomous') params.venomous = 'false';
      if (dangerFilter !== 'all') params.danger = dangerFilter;

      const res = await getSnakes(params);
      if (res.success) {
        setSnakes(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch snakes:', err);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <BookOpen size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
            Reptile & Snake Encyclopedia
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '650px' }}>
          Explore global snake species, identify distinguishing field marks, understand venom toxicity, and review emergency response guidelines.
        </p>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{
            flex: 1,
            minWidth: '240px',
            position: 'relative'
          }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by common name, scientific name, or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Venomous Filter */}
          <select
            value={venomFilter}
            onChange={(e) => setVenomFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(18, 24, 34, 0.95)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: '#cbd5e1',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Toxicity Types</option>
            <option value="venomous">⚠️ Venomous Only</option>
            <option value="non-venomous">🛡️ Non-Venomous Only</option>
          </select>

          {/* Danger Level Filter */}
          <select
            value={dangerFilter}
            onChange={(e) => setDangerFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(18, 24, 34, 0.95)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: '#cbd5e1',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Danger Levels</option>
            <option value="Deadly">Deadly</option>
            <option value="Dangerous">Dangerous</option>
            <option value="Moderate">Moderate</option>
            <option value="Harmless">Harmless</option>
          </select>
        </div>
      </div>

      {/* Grid of Snake Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#34d399' }} />
          <div>Loading snake encyclopedia...</div>
        </div>
      ) : snakes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', borderRadius: '16px' }}>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            No snake species matched your search criteria. Try a different term or clear filters.
          </p>
        </div>
      ) : (
        <div className="grid-responsive">
          {snakes.map((snake) => (
            <SnakeCard key={snake._id} snake={snake} />
          ))}
        </div>
      )}
    </div>
  );
}
