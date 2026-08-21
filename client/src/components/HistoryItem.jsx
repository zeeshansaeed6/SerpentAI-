import React from 'react';
import { Trash2, ExternalLink, Calendar, Skull, ShieldCheck } from 'lucide-react';

export default function HistoryItem({ item, onView, onDelete }) {
  const isVenomous = item.venomous;
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="glass-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Left info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
        <div style={{
          background: isVenomous ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: isVenomous ? '#f87171' : '#34d399',
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
          border: isVenomous ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          {isVenomous ? <Skull size={22} /> : <ShieldCheck size={22} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem' }}>{item.snakeName}</h4>
            <span className={`badge ${isVenomous ? 'badge-deadly' : 'badge-harmless'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
              {isVenomous ? 'Venomous' : 'Non-Venomous'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.2rem' }}>
            {item.scientificName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
            <Calendar size={12} /> {formattedDate}
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onView(item._id)}
          className="btn btn-outline"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <ExternalLink size={14} /> View Dossier
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="btn btn-secondary"
          style={{
            padding: '0.45rem',
            color: '#f87171',
            borderRadius: '8px'
          }}
          title="Delete from history"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
