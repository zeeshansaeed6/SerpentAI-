import React from 'react';

// Last line of defence: if any component throws while rendering, show a calm recovery screen
// (with emergency numbers) instead of a blank page.
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          background: '#050b09',
          color: '#ecf6f0',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '1.9rem', margin: '0 0 0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a8bcb1', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            The page hit an unexpected problem. Reloading usually fixes it.
          </p>
          <p style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '0.85rem 1rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            <strong>Snakebite emergency?</strong> Don't wait: call your local emergency number now
            (<a href="tel:112" style={{ color: '#fca5a5' }}>112</a> / <a href="tel:911" style={{ color: '#fca5a5' }}>911</a> /{' '}
            <a href="tel:108" style={{ color: '#fca5a5' }}>108</a>). Keep the person still and the bitten limb below heart level.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ minHeight: '44px', padding: '0.7rem 1.6rem', borderRadius: '14px', border: '1px solid rgba(190, 242, 100, 0.35)', background: 'linear-gradient(135deg, #047857, #10b981)', color: '#fff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Reload the page
          </button>
        </div>
      </div>
    );
  }
}
