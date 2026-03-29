import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24,
        background: 'var(--bg, #f9f9f9)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#ba1a1a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            [ ENGINE_ERROR ]
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: '#001e40', marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 13, color: '#43474f', lineHeight: 1.6, marginBottom: 24 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 28px', background: '#003366', color: '#c9a84c', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 2 }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
