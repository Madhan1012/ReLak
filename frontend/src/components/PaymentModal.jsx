import { useState } from 'react';
import { X, CreditCard, CheckCircle, Lock } from 'lucide-react';

// Demo Razorpay — no real money, simulates the flow
export default function PaymentModal({ onClose, onSuccess, resumeName }) {
  const [step, setStep] = useState('confirm'); // confirm | processing | success

  const handlePay = () => {
    setStep('processing');

    // Simulate Razorpay test flow — 2s delay then success
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onSuccess(), 1500);
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,30,64,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: 420,
        padding: '36px 32px', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,30,64,0.18)',
        border: '1px solid rgba(195,198,209,0.4)',
      }}>
        {/* Close */}
        {step !== 'processing' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#737780', padding: 4,
          }}><X size={18} /></button>
        )}

        {step === 'confirm' && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#003366',
                display: 'block', marginBottom: 10,
              }}>[ UNLOCK_BLUEPRINT ]</span>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22, fontWeight: 700,
                color: '#001e40', marginBottom: 6,
              }}>Claim Your Resume</h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13, color: '#43474f', lineHeight: 1.6,
              }}>
                One-time payment per resume generation. Switch between all 3 styles and
                download as many times as you want — no extra charge.
              </p>
            </div>

            {/* What you get */}
            <div style={{
              background: '#f3f3f3', padding: '16px',
              marginBottom: 24, borderLeft: '3px solid #003366',
            }}>
              {[
                'All 3 resume styles (ATS, Blueprint, Classic)',
                'Unlimited PDF downloads',
                'AI power-verb optimisation',
                'Anti-hallucination verified content',
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: i < 3 ? 8 : 0,
                }}>
                  <span style={{ color: '#006e2f', fontSize: 12 }}>✓</span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12, color: '#43474f',
                  }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Price + clarification */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0', borderTop: '1px solid #e8e8e8',
            }}>
              <div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, color: '#43474f', display: 'block',
                }}>Total (one-time)</span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11, color: '#737780', marginTop: 2, display: 'block',
                }}>Per resume generation — not per style</span>
              </div>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22, fontWeight: 700, color: '#001e40',
              }}>₹20</span>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, color: '#737780',
              lineHeight: 1.5, marginBottom: 20,
              padding: '8px 0', borderBottom: '1px solid #e8e8e8',
            }}>
              All 3 styles (ATS, Blueprint, Classic) are included. Switch freely and
              download unlimited PDFs — the ₹20 covers this resume build, not each style separately.
            </p>

            {/* Demo notice */}
            <div style={{
              background: '#fff8e1', border: '1px solid #f0c040',
              padding: '8px 12px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, color: '#7a5c00',
              }}>DEMO MODE — No real money will be charged</span>
            </div>

            {/* Pay button */}
            <button onClick={handlePay} style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #001e40 0%, #003366 100%)',
              color: '#ffffff',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 0 0 #001e40',
              borderRadius: 2,
            }}>
              <CreditCard size={16} />
              Pay ₹20 via Razorpay
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginTop: 12,
            }}>
              <Lock size={11} color="#737780" />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, color: '#737780', letterSpacing: '0.05em',
              }}>Secured by Razorpay · SSL Encrypted</span>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 48, height: 48, border: '3px solid #e8e8e8',
              borderTop: '3px solid #003366', borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13, color: '#001e40', marginBottom: 8,
            }}>Processing payment...</div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12, color: '#737780',
            }}>Connecting to Razorpay gateway</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="#006e2f" style={{ margin: '0 auto 20px', display: 'block' }} />
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 20, fontWeight: 700, color: '#001e40', marginBottom: 8,
            }}>Payment Successful!</div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13, color: '#43474f',
            }}>Unlocking your blueprint...</div>
          </div>
        )}
      </div>
    </div>
  );
}
