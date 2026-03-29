import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import ProcessingOverlay from './components/ProcessingOverlay';
import ResultPage from './pages/ResultPage';
import BuildPage from './pages/BuildPage';
import AdminLogin from './pages/AdminLogin';
import ContentPage from './pages/ContentPage';
import { Rocket, PenLine, AlertTriangle } from 'lucide-react';
import { API_BASE } from './config';

export default function App() {
  const [resumeData, setResumeData]     = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    const handler = (e) => {
      if (!resumeData) return;
      e.preventDefault();
      e.returnValue = 'Your resume data will be lost if you close this tab.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [resumeData]);

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
      <Route path="/"       element={<HeroPage serverStatus={serverStatus} onResult={setResumeData} />} />
      <Route path="/result" element={<ResultPage resumeData={resumeData} setResumeData={setResumeData} serverStatus={serverStatus} />} />
      <Route path="/build"  element={<BuildPage onResult={setResumeData} serverStatus={serverStatus} />} />
      <Route path="/privacy" element={<ContentPage pageKey="privacy" serverStatus={serverStatus} />} />
      <Route path="/support" element={<ContentPage pageKey="support" serverStatus={serverStatus} />} />
      <Route path="/about"   element={<ContentPage pageKey="about"   serverStatus={serverStatus} />} />
      <Route path="/home/admins-login" element={<AdminLogin />} />
    </Routes>
  );
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function HeroPage({ serverStatus, onResult }) {
  const navigate = useNavigate();
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  const runUpload = async (file) => {
    if (!file) return;
    setIsLoading(true); setError(null);
    const fd = new FormData();
    fd.append('file', file);

    // Exponential backoff retry — 3 attempts: 0ms, 1s, 3s
    const delays = [0, 1000, 3000];
    let lastErr = null;

    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) await new Promise(r => setTimeout(r, delays[attempt]));
      try {
        const res  = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || json.detail || 'Upload failed');
        onResult(json.data);
        navigate('/result');
        setIsLoading(false);
        return;
      } catch (err) {
        lastErr = err;
        // Don't retry on client errors (4xx) — only on network/5xx
        if (err.message && !err.message.includes('fetch') && attempt < delays.length - 1) {
          break; // non-network error, stop retrying
        }
      }
    }

    setError(lastErr?.message || 'Upload failed');
    setIsLoading(false);
  };

  const statusLabel = { online: 'System Status: Ready', warming: 'System Warming Up...', offline: 'System Offline', checking: 'Checking System...' }[serverStatus] ?? 'Checking...';

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />
      <ProcessingOverlay visible={isLoading} />

      <main className="main">
        <section className="hero-section">
          <div className="hero-grid">

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <div className="status-badge">
                  <span className={`status-dot ${serverStatus}`} />
                  <span className="status-label">{statusLabel}</span>
                </div>
                <h1 className="hero-h1">ReLak: Zero-Touch<br />Portfolios.</h1>
                <p className="hero-sub">
                  Turn your PDF into a polished resume in 60 seconds.
                  Optimized with AI power-verbs.{' '}
                  <span className="hero-sub-price">₹20</span> per build.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  disabled={!pendingFile || isLoading}
                  onClick={() => runUpload(pendingFile)}
                  className="btn-primary"
                  style={{ opacity: (!pendingFile || isLoading) ? 0.5 : 1, cursor: (!pendingFile || isLoading) ? 'not-allowed' : 'pointer', width: 'fit-content' }}
                >
                  <Rocket size={16} /> Analyze &amp; Build
                </button>
                <button onClick={() => navigate('/build')} className="btn-secondary" style={{ width: 'fit-content' }}>
                  <PenLine size={15} /> Build from Scratch
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
                <div className="spec-cell"><span className="spec-label">Latency</span><span className="spec-value">0.8s</span></div>
                <div className="spec-cell"><span className="spec-label">Architecture</span><span className="spec-value">Neural</span></div>
              </div>
            </div>

            <div>
              <UploadZone onFileSelect={setPendingFile} isLoading={isLoading} />
              {error && (
                <div className="error-bar">
                  <AlertTriangle size={16} color="var(--red)" />
                  <span className="error-text">{error}</span>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}

function PageFooter() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="footer-logo">ReLak</span>
        <span className="footer-copy">Built with ReLak © 2026</span>
      </div>
      <div className="footer-links">
        <span onClick={() => navigate('/privacy')} className="footer-link" style={{ cursor: 'pointer' }}>Privacy & Terms</span>
        <span onClick={() => navigate('/support')} className="footer-link" style={{ cursor: 'pointer' }}>Support</span>
        <span onClick={() => navigate('/about')}   className="footer-link" style={{ cursor: 'pointer' }}>About</span>
      </div>
    </footer>
  );
}
