import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Lock, ArrowLeft, Pencil, Eye, Timer } from 'lucide-react';
import Navbar from '../components/Navbar';
import StyleSelector from '../components/StyleSelector';
import BlueprintPreview from '../components/BlueprintPreview';
import ATSPreview from '../components/ATSPreview';
import ClassicPreview from '../components/ClassicPreview';
import PaymentModal from '../components/PaymentModal';
import { downloadBlueprintPdf } from '../utils/downloadPdf';
import { SAMPLE_DATA } from '../utils/sampleData';

// ── Countdown: shows time until data self-destructs (created_at + 2h) ────────
function CountdownTimer({ createdAt }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!createdAt) return;
    const expiry = new Date(createdAt).getTime() + 2 * 60 * 60 * 1000;

    const tick = () => {
      const diff = expiry - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  if (remaining === null) return null;

  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const urgent = remaining < 10 * 60 * 1000;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      background: urgent ? 'rgba(186,26,26,0.08)' : 'var(--bg-low)',
      border: `1px solid ${urgent ? 'var(--red)' : 'var(--border-solid)'}`,
      borderRadius: 2,
    }}>
      <Timer size={11} color={urgent ? 'var(--red)' : 'var(--text-dim)'} />
      <span style={{
        fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
        color: urgent ? 'var(--red)' : 'var(--text-dim)',
        letterSpacing: '0.05em',
      }}>
        Data self-destructs in: {mm}:{ss}
      </span>
    </div>
  );
}

export default function ResultPage({ resumeData, setResumeData, serverStatus, paymentEnabled = true, resumeSlug }) {
  const navigate = useNavigate();
  const [styleId, setStyleId]             = useState(2);
  const [isPaid, setIsPaid]               = useState(false);
  const [showPayment, setShowPayment]     = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editMode, setEditMode]           = useState(false);

  const data   = resumeData || SAMPLE_DATA;
  const isDemo = !resumeData;

  // In demo mode (PAYMENT_ENABLED=false) unlock immediately
  useEffect(() => {
    if (!paymentEnabled) setIsPaid(true);
  }, [paymentEnabled]);

  const handleDownload = async () => {
    if (!isPaid) { setShowPayment(true); return; }
    setIsDownloading(true);
    try {
      const slug = (data.name || 'resume').toLowerCase().replace(/\s+/g, '-');
      const styleNames = ['ats', 'blueprint', 'classic'];
      const styleName = styleNames[styleId - 1] || 'style';
      await downloadBlueprintPdf('blueprint-preview', `relak-${slug}.pdf`, styleName, data.name);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDataChange = (updated) => {
    if (setResumeData) setResumeData(updated);
  };

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />

      <main className="main">
        <section style={{ padding: '40px 24px 80px', maxWidth: 1280, margin: '0 auto' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border-solid)', padding: '7px 14px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-muted)', borderRadius: 2 }}>
                <ArrowLeft size={13} /> Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--green)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {isDemo ? 'Sample Preview' : 'AI Generated Blueprint'}
                </span>
              </div>
              {!isDemo && !isPaid && data._created_at && (
                <CountdownTimer createdAt={data._created_at} />
              )}
              {!paymentEnabled && (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--gold)', background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold)', padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  DEMO MODE
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {isPaid && (
                <button
                  onClick={() => setEditMode(e => !e)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: editMode ? 'var(--bg-mid)' : 'none', border: '1px solid var(--border-solid)', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-muted)', borderRadius: 2 }}
                >
                  {editMode ? <><Eye size={13} /> Preview</> : <><Pencil size={13} /> Edit</>}
                </button>
              )}
              {isPaid ? (
                <button onClick={handleDownload} disabled={isDownloading} className="btn-download">
                  <Download size={14} />
                  {isDownloading ? 'Rendering...' : 'Download PDF'}
                </button>
              ) : (
                <button onClick={() => setShowPayment(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'var(--blue)', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 2, boxShadow: '0 3px 0 0 var(--blue-dark)' }}>
                  <Lock size={13} /> Unlock for ₹20
                </button>
              )}
            </div>
          </div>

          {/* Demo notice */}
          {isDemo && (
            <div style={{ background: 'var(--bg-low)', border: '1px solid var(--border-solid)', padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>ℹ️</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                Showing sample resume —{' '}
                <span onClick={() => navigate('/')} style={{ color: 'var(--blue)', cursor: 'pointer', textDecoration: 'underline' }}>upload your own</span>
              </span>
            </div>
          )}

          {editMode && (
            <div style={{ background: 'var(--bg-low)', border: '1px dashed var(--blue)', padding: '10px 16px', marginBottom: 16, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--blue)' }}>
              ✏ Edit mode — click any text to edit. Changes apply to the downloaded PDF.
            </div>
          )}

          <StyleSelector selected={styleId} onChange={setStyleId} />

          {/* Preview with blur gate */}
          <div style={{ position: 'relative' }}>
            <div className={styleId === 2 ? 'drafting-table' : 'plain-table'} style={{ filter: isPaid ? 'none' : 'blur(7px)', userSelect: isPaid ? 'auto' : 'none', pointerEvents: isPaid ? 'auto' : 'none', transition: 'filter 0.4s ease' }}>
              {styleId === 1 && <ATSPreview data={data} editable={editMode} onDataChange={handleDataChange} />}
              {styleId === 2 && <BlueprintPreview data={data} editable={editMode} onDataChange={handleDataChange} />}
              {styleId === 3 && <ClassicPreview data={data} editable={editMode} onDataChange={handleDataChange} />}
            </div>

            {!isPaid && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-solid)', padding: '32px 40px', textAlign: 'center', boxShadow: '0 8px 32px var(--shadow)', maxWidth: 360 }}>
                  <Lock size={28} color="var(--blue)" style={{ margin: '0 auto 16px', display: 'block' }} />
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--blue-dark)', marginBottom: 8 }}>Your Resume is Ready</div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                    Unlock all 3 styles, inline editing, and unlimited PDF downloads.
                  </p>
                  <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '13px', background: 'var(--blue)', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 2, boxShadow: '0 4px 0 0 var(--blue-dark)' }}>
                    Unlock for ₹20
                  </button>
                  <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>One-time · No subscription · Lifetime access</div>
                </div>
              </div>
            )}
          </div>

        </section>
      </main>

      <PageFooter />

      {showPayment && (
        <PaymentModal
          resumeName={data.name}
          portfolioSlug={resumeSlug}
          paymentEnabled={paymentEnabled}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setIsPaid(true); setShowPayment(false); setEditMode(false); }}
        />
      )}
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
        <span onClick={() => navigate('/support')} className="footer-link" style={{ cursor: 'pointer' }}>Terms of Service</span>
        <span onClick={() => navigate('/about')} className="footer-link" style={{ cursor: 'pointer' }}>About</span>
      </div>
    </footer>
  );
}
