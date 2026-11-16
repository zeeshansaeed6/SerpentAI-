import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Trash2, X, AlertTriangle, ExternalLink } from 'lucide-react';
import HistoryItem from '../components/HistoryItem';
import ResultCard from '../components/ResultCard';
import { getHistory, getHistoryDetail, deleteHistoryItem } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory(1, 50);
      if (res.success) {
        setHistory(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await getHistoryDetail(id);
      if (res.success) {
        setSelectedDetection(res.data);
      }
      setLoadingDetail(false);
    } catch (err) {
      console.error('Failed to fetch detail:', err);
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item._id !== id));
      if (selectedDetection?._id === id) {
        setSelectedDetection(null);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
              padding: '0.5rem',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <History size={24} />
            </div>
            <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: 0 }}>
              AI Scan History Log
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Review your previous snake identification scans and medical recommendations.
          </p>
          <p style={{ color: '#8aa395', fontSize: '0.78rem', margin: '0.4rem 0 0' }}>
            Private to this browser: no one else can see your scans. Your newest 50 are kept, and clearing your browser data removes access to them.
          </p>
        </div>

        <button onClick={fetchHistory} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Log
        </button>
      </div>

      {/* History List or Modal Detail */}
      {selectedDetection ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSelectedDetection(null)}
            className="btn btn-secondary"
            style={{ marginBottom: '1rem' }}
          >
            ← Back to History List
          </button>
          <ResultCard
            result={selectedDetection}
            onScanAgain={() => setSelectedDetection(null)}
          />
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#06b6d4' }} />
          <div>Retrieving past scan records...</div>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Scans in History Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Upload or capture your first snake photo on the AI Scanner tab to log identification results here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {history.map((item) => (
            <HistoryItem
              key={item._id}
              item={item}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
