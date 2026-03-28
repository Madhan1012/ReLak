import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import ProcessingOverlay from './components/ProcessingOverlay';
import ResultPage from './pages/ResultPage';
import AdminLogin from './pages/AdminLogin';
import { Rocket, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// ── Root app with routing ─────────────────────────────────────────────────────
export default function App() {
  const [resumeData, setResumeData]   = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  // Warn before tab close if resume data is in memory (not yet downloaded)
  useEffect(() => {
    const handler = (e) => {
      if (!resumeData) return;
      e.preventDefault();
      e.returnValue = 'Your resume data will be lost if you close this tab.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [resumeData]);

  // Wake-up routine — shared across pages
  useEffect(() => {
    let attempts = 0;
    const ping = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) { setServerStatus('online'); return; }
      } catch { /* cold start */ }
      attempts++;
      if (attempts < 6) { setServerStatus('warming'); setTimeout(ping, 5000); }
      else setServerStatus('offline');
    };
    ping();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HeroPage
            serverStatus={serverStatus}
            onResult={setResumeData}
          />
        }
      />
      <Route
        path="/result"
        element={
          <ResultPage
            resumeData={resumeData}
            serverStatus={serverStatus}
          />
        }
      />
      {/* Secret admin URL */}
      <Route path="/home/admins-login" element={<AdminLogin />} />
    </Routes>
  );
}

// ── Hero / Upload page ────────────────────────────────────────────────────────
function HeroPage({ serverStatus, onResult }) {
  const navigate = useNavigate();
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  const runUpload = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || json.detail || 'Upload failed');
      onResult(json.data);
      navigate('/result');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = {
    online:   'System Status: Ready',
    warming:  'System Warming Up...',
    offline:  'System Offline',
    checking: 'Checking System...',
  }[serverStatus] ?? 'Checking...';

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />

      {/* Full-screen processing overlay */}
      <ProcessingOverlay visible={isLoading} />

      <main className="main">
        <section className="hero-section">
          <div className="hero-grid">

            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              <div>
                <div className="status-badge">
                  <span className={`status-dot ${serverStatus}`} />
                  <span className="status-label">{statusLabel}</span>
                </div>

                <h1 className="hero-h1">
                  ReLak: Zero-Touch<br />Portfolios.
                </h1>
                <p className="hero-sub">
                  Turn your PDF into a live, architectural portfolio in 60 seconds.
                  Optimized with AI power-verbs.{' '}
                  <span className="hero-sub-price">₹20</span> per build.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  className="btn-primary"
                  disabled={!pendingFile || isLoading}
                  onClick={() => runUpload(pendingFile)}
                  style={{
                    opacity: (!pendingFile || isLoading) ? 0.5 : 1,
                    cursor: (!pendingFile || isLoading) ? 'not-allowed' : 'pointer',
                  }}
                >
                  Analyze &amp; Build
                  <Rocket size={16} />
                </button>

                {serverStatus === 'warming' && (
                  <div className="warming-row">
                    <span className="warming-text">Wake-up pinging server...</span>
                    <div className="warming-line" />
                    <span className="warming-coord">[01]</span>
                  </div>
                )}
              </div>

              <div className="specs-grid">
                <div className="spec-cell">
                  <span className="spec-label">Latency</span>
                  <span className="spec-value">0.8s</span>
                </div>
                <div className="spec-cell">
                  <span className="spec-label">Architecture</span>
                  <span className="spec-value">Neural</span>
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div>
              <UploadZone onFileSelect={setPendingFile} isLoading={isLoading} />
              {error && (
                <div className="error-bar">
                  <AlertTriangle size={16} color="#ba1a1a" />
                  <span className="error-text">{error}</span>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="footer-logo">ReLak</span>
          <span className="footer-copy">Built with ReLak © 2026</span>
        </div>
        <div className="footer-links">
          {['Privacy', 'Terms', 'Support'].map(l => (
            <a key={l} href="#" className="footer-link">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
