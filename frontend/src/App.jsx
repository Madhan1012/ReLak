import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import ProcessingOverlay from './components/ProcessingOverlay';
import { Rocket, PenLine, AlertTriangle } from 'lucide-react';
import { API_BASE, ADMIN_PATH, PRICE_INR, PRICE_INR_JD } from './config';
import { sanitizeResumeData } from './utils/sanitize';

// ── Lazy-loaded routes — only fetched when user navigates there ───────────────
const ResultPage   = lazy(() => import('./pages/ResultPage'));
const BuildPage    = lazy(() => import('./pages/BuildPage'));
const AdminLogin   = lazy(() => import('./pages/AdminLogin'));
const ContentPage  = lazy(() => import('./pages/ContentPage'));

function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
        Loading...
      </span>
    </div>
  );
}

export default function App() {
  const [resumeData, setResumeData]         = useState(null);
  const [resumeSlug, setResumeSlug]         = useState(null);
  const [hasJD, setHasJD]                   = useState(false);
  const [serverStatus, setServerStatus]     = useState('checking');
  const [paymentEnabled, setPaymentEnabled] = useState(null);
  const [isAdmin, setIsAdmin]               = useState(() => !!sessionStorage.getItem('relak-admin'));

  // On tab close: fire beacon to delete unpaid session data from DB + clear state
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
    const cleanup = () => {
      if (!resumeSlug) return;
      // sendBeacon is fire-and-forget, works even as tab closes
      const blob = new Blob([JSON.stringify({ slug: resumeSlug })], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/session/cleanup`, blob);
    };
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, [resumeSlug]);

  useEffect(() => {
    let attempts = 0;
    const ping = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          setServerStatus('online');
          // Fetch config once server is up
          fetch(`${API_BASE}/config`).then(r => r.ok ? r.json() : null).then(cfg => {
            if (cfg) setPaymentEnabled(cfg.payment_enabled ?? true);
          }).catch(() => {});
          return;
        }
      } catch { /* cold start */ }
      attempts++;
      if (attempts < 6) { setServerStatus('warming'); setTimeout(ping, 5000); }
      else setServerStatus('offline');
    };
    ping();
  }, []);

  return (
    <>
      {/* ── Dev banner — hidden in production via VITE_SHOW_DEV_BANNER=false ── */}
      {import.meta.env.VITE_SHOW_DEV_BANNER !== 'false' && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16, zIndex: 9999,
          background: '#ba1a1a', color: '#ffffff',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '5px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(186,26,26,0.4)',
          pointerEvents: 'none',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.8, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
          Under Development
        </div>
      )}

      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/"       element={<HeroPage serverStatus={serverStatus} onResult={(data, slug, jd) => { setResumeData(data); setResumeSlug(slug); setHasJD(!!jd); }} />} />
          <Route path="/result" element={<ResultPage resumeData={resumeData} setResumeData={setResumeData} serverStatus={serverStatus} paymentEnabled={paymentEnabled} resumeSlug={resumeSlug} isAdmin={isAdmin} hasJD={hasJD} />} />
          <Route path="/build"  element={<BuildPage onResult={(data, slug) => { setResumeData(data); setResumeSlug(slug); }} serverStatus={serverStatus} />} />
          <Route path="/privacy" element={<ContentPage pageKey="privacy" serverStatus={serverStatus} />} />
          <Route path="/support" element={<ContentPage pageKey="support" serverStatus={serverStatus} />} />
          <Route path="/about"   element={<ContentPage pageKey="about"   serverStatus={serverStatus} />} />
          <Route path="/terms"   element={<ContentPage pageKey="privacy" serverStatus={serverStatus} />} />
          <Route path="/refund"  element={<ContentPage pageKey="refund"  serverStatus={serverStatus} />} />
          <Route path="/home/admins-login" element={<AdminLogin />} />
          {ADMIN_PATH !== '/home/admins-login' && <Route path={ADMIN_PATH} element={<AdminLogin />} />}
        </Routes>
      </Suspense>
    </>
  );
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function HeroPage({ serverStatus, onResult }) {
  const navigate = useNavigate();
  const [pendingFile, setPendingFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  const runUpload = async (file) => {
    if (!file) return;
    setIsLoading(true); setError(null);
    const fd = new FormData();
    fd.append('file', file);
    if (jobDescription) {
      fd.append('job_description', jobDescription);
    }

    // Exponential backoff retry — 3 attempts: 0ms, 1s, 3s
    const delays = [0, 1000, 3000];
    let lastErr = null;

    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) await new Promise(r => setTimeout(r, delays[attempt]));
      try {
        const res  = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || json.detail || 'Upload failed');
        onResult(sanitizeResumeData(json.data), json.slug, jobDescription);
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
                <h1 className="hero-h1">ReLak</h1>
                <p className="hero-sub">
                  Turn your PDF into a polished resume in 60 seconds.
                  Optimized with AI power-verbs.{' '}
                  <span className="hero-sub-price">₹{PRICE_INR}</span> per build.
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
                <div className="spec-cell"><span className="spec-label">Latency</span><span className="spec-value">~60s</span></div>
                <div className="spec-cell"><span className="spec-label">Engine</span><span className="spec-value">Neural</span></div>
              </div>
            </div>

            <div>
              <UploadZone 
                onFileSelect={setPendingFile} 
                onJobDescriptionChange={setJobDescription}
                isLoading={isLoading} 
              />
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
        <span onClick={() => navigate('/privacy')} className="footer-link" style={{ cursor: 'pointer' }}>Privacy Policy</span>
        <span onClick={() => navigate('/terms')}   className="footer-link" style={{ cursor: 'pointer' }}>Terms of Service</span>
        <span onClick={() => navigate('/refund')}  className="footer-link" style={{ cursor: 'pointer' }}>Refund Policy</span>
        <span onClick={() => navigate('/support')} className="footer-link" style={{ cursor: 'pointer' }}>Support</span>
        <span onClick={() => navigate('/about')}   className="footer-link" style={{ cursor: 'pointer' }}>About</span>
      </div>
    </footer>
  );
}
