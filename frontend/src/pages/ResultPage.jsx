import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Lock, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import StyleSelector from '../components/StyleSelector';
import BlueprintPreview from '../components/BlueprintPreview';
import ATSPreview from '../components/ATSPreview';
import ClassicPreview from '../components/ClassicPreview';
import PaymentModal from '../components/PaymentModal';
import { downloadBlueprintPdf } from '../utils/downloadPdf';
import { SAMPLE_DATA } from '../utils/sampleData';

export default function ResultPage({ resumeData, serverStatus }) {
  const navigate = useNavigate();
  const [styleId, setStyleId]         = useState(2);
  const [isPaid, setIsPaid]           = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use real data if available, otherwise show sample
  const data = resumeData || SAMPLE_DATA;
  const isDemo = !resumeData;

  const handleDownload = async () => {
    if (!isPaid) { setShowPayment(true); return; }
    setIsDownloading(true);
    try {
      const slug = (data.name || 'resume').toLowerCase().replace(/\s+/g, '-');
      await downloadBlueprintPdf('blueprint-preview', `relak-${slug}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />

      <main className="main">
        <section style={{ padding: '40px 24px 80px', maxWidth: 1280, margin: '0 auto' }}>

          {/* Top bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 32,
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: '1px solid #c3c6d1',
                  padding: '7px 14px', cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, color: '#43474f', borderRadius: 2,
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#006e2f' }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, color: '#006e2f',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                }}>
                  {isDemo ? 'Sample Preview' : 'AI Generated Blueprint'}
                </span>
              </div>
            </div>

            {/* Download / Unlock button */}
            {isPaid ? (
              <button
                className="btn-download"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download size={14} />
                {isDownloading ? 'Rendering...' : 'Download PDF'}
              </button>
            ) : (
              <button
                onClick={() => setShowPayment(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #001e40 0%, #003366 100%)',
                  color: '#ffffff',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, border: 'none', cursor: 'pointer',
                  borderRadius: 2, boxShadow: '0 3px 0 0 #001e40',
                }}
              >
                <Lock size={13} />
                Unlock for ₹20
              </button>
            )}
          </div>

          {/* Demo notice */}
          {isDemo && (
            <div style={{
              background: '#f3f3f3', border: '1px solid #c3c6d1',
              padding: '10px 16px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 14 }}>ℹ️</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, color: '#43474f',
              }}>
                Showing sample resume — upload your own on the{' '}
                <span
                  onClick={() => navigate('/')}
                  style={{ color: '#003366', cursor: 'pointer', textDecoration: 'underline' }}
                >home page</span>
              </span>
            </div>
          )}

          {/* Style selector */}
          <StyleSelector selected={styleId} onChange={setStyleId} />

          {/* Preview with blur gate */}
          <div style={{ position: 'relative' }}>
            <div className={styleId === 2 ? 'drafting-table' : 'plain-table'} style={{
              filter: isPaid ? 'none' : 'blur(7px)',
              userSelect: isPaid ? 'auto' : 'none',
              pointerEvents: isPaid ? 'auto' : 'none',
              transition: 'filter 0.4s ease',
            }}>
              {styleId === 1 && <ATSPreview data={data} />}
              {styleId === 2 && <BlueprintPreview data={data} />}
              {styleId === 3 && <ClassicPreview data={data} />}
            </div>

            {/* Unlock overlay */}
            {!isPaid && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 16,
              }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(195,198,209,0.6)',
                  padding: '32px 40px', textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0,30,64,0.12)',
                  maxWidth: 360,
                }}>
                  <Lock size={28} color="#003366" style={{ margin: '0 auto 16px', display: 'block' }} />
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 18, fontWeight: 700,
                    color: '#001e40', marginBottom: 8,
                  }}>Your Resume is Ready</div>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13, color: '#43474f',
                    lineHeight: 1.6, marginBottom: 20,
                  }}>
                    Unlock all 3 styles and unlimited PDF downloads for a one-time payment.
                  </p>
                  <button
                    onClick={() => setShowPayment(true)}
                    style={{
                      width: '100%', padding: '13px',
                      background: 'linear-gradient(135deg, #001e40 0%, #003366 100%)',
                      color: '#ffffff',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                      borderRadius: 2, boxShadow: '0 4px 0 0 #001e40',
                    }}
                  >
                    Unlock for ₹20
                  </button>
                  <div style={{
                    marginTop: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, color: '#737780',
                    letterSpacing: '0.05em',
                  }}>One-time · No subscription · Lifetime access</div>
                </div>
              </div>
            )}
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

      {showPayment && (
        <PaymentModal
          resumeName={data.name}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setIsPaid(true); setShowPayment(false); }}
        />
      )}
    </div>
  );
}
