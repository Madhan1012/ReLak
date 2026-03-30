import { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle, Lock, Shield, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../config';

/**
 * PaymentModal
 *
 * Demo mode  (PAYMENT_ENABLED=false on server):
 *   Runs a fake animated flow, then calls POST /payment/verify with
 *   demo_mode=true. Server marks the portfolio paid and returns success.
 *
 * Production (PAYMENT_ENABLED=true on server):
 *   1. POST /payment/create-order  → get Razorpay order id
 *   2. Open window.Razorpay checkout
 *   3. On handler callback → POST /payment/verify with real signature
 *   4. Server verifies HMAC, marks paid, returns success
 *
 * To go live: set PAYMENT_ENABLED=true + RAZORPAY_KEY_ID + RAZORPAY_SECRET
 * in server/.env and add VITE_RAZORPAY_KEY_ID to frontend/.env.production.
 * No frontend code changes needed.
 */

const DEMO_STEPS = [
  { label: 'Connecting to payment gateway...', ms: 600  },
  { label: 'Verifying order details...',        ms: 500  },
  { label: 'Processing transaction...',         ms: 900  },
  { label: 'Confirming payment...',             ms: 400  },
];

export default function PaymentModal({ onClose, onSuccess, resumeName, portfolioSlug, paymentEnabled }) {
  const [step, setStep]           = useState('confirm');  // confirm | processing | success | error
  const [procStep, setProcStep]   = useState(-1);
  const [doneSteps, setDoneSteps] = useState([]);
  const [errMsg, setErrMsg]       = useState('');

  // ── Drive demo animation steps ────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'processing' || procStep < 0) return;

    if (procStep >= DEMO_STEPS.length) {
      // Animation done — now actually verify with server
      verifyWithServer();
      return;
    }

    const t = setTimeout(() => {
      setDoneSteps(d => [...d, procStep]);
      setProcStep(p => p + 1);
    }, DEMO_STEPS[procStep].ms);

    return () => clearTimeout(t);
  }, [step, procStep]);

  // ── Server verify call (works for both demo and real Razorpay) ────────────
  const verifyWithServer = async (razorpayResponse = null) => {
    try {
      const body = razorpayResponse
        ? {
            portfolio_id:        portfolioSlug,
            razorpay_order_id:   razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature:  razorpayResponse.razorpay_signature,
          }
        : { portfolio_id: portfolioSlug, demo_mode: true };

      const res  = await fetch(`${API_BASE}/payment/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.detail || 'Verification failed');

      setStep('success');
      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      setErrMsg(err.message || 'Payment verification failed. Please try again.');
      setStep('error');
    }
  };

  // ── Main pay handler ──────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!paymentEnabled) {
      // Demo: run animation then verify
      setStep('processing');
      setProcStep(0);
      return;
    }

    // Real Razorpay flow
    setStep('processing');
    try {
      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ portfolio_slug: portfolioSlug }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok || !order.id) throw new Error(order.detail || 'Order creation failed');

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) throw new Error('Razorpay key not configured');

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         rzpKey,
          amount:      order.amount,
          currency:    'INR',
          name:        'ReLak',
          description: 'Resume Blueprint Unlock',
          order_id:    order.id,
          prefill:     { name: resumeName || '' },
          theme:       { color: '#003366' },
          handler: async (response) => {
            await verifyWithServer(response);
            resolve();
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        rzp.open();
      });
    } catch (err) {
      setErrMsg(err.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--overlay-bg)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: 420,
        padding: '36px 32px', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,30,64,0.2)',
        border: '1px solid rgba(195,198,209,0.4)',
      }}>

        {step !== 'processing' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer', color: '#737780', padding: 4,
          }}><X size={18} /></button>
        )}

        {/* ── Confirm ── */}
        {step === 'confirm' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#003366', display: 'block', marginBottom: 10 }}>
                [ UNLOCK_BLUEPRINT ]
              </span>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#001e40', marginBottom: 6 }}>
                {resumeName ? `${resumeName}'s Resume` : 'Your Resume'} is Ready
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#43474f', lineHeight: 1.6 }}>
                One-time payment. All 3 styles, inline editing, and PDF download included.
              </p>
            </div>

            <div style={{ background: '#f3f3f3', padding: '14px 16px', marginBottom: 20, borderLeft: '3px solid #003366' }}>
              {[
                'All 3 resume styles — ATS, Blueprint, Classic',
                'Inline editing — click any field to change it',
                'Unlimited PDF downloads',
                'AI power-verb optimisation included',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                  <span style={{ color: '#006e2f', fontSize: 12, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#43474f' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8', marginBottom: 20 }}>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#43474f', display: 'block' }}>Total (one-time)</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#737780', marginTop: 2, display: 'block' }}>Per resume — not per style</span>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: '#001e40' }}>₹20</span>
            </div>

            {!paymentEnabled && (
              <div style={{ background: '#fff8e1', border: '1px solid #f0c040', padding: '8px 12px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13 }}>⚡</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: '#7a5c00', letterSpacing: '0.04em' }}>
                  DEMO — Razorpay integration ready, no real charge
                </span>
              </div>
            )}

            <button onClick={handlePay} style={{
              width: '100%', padding: '14px',
              background: '#003366', color: '#c9a84c',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 0 0 #001e40', borderRadius: 2,
            }}>
              <CreditCard size={16} /> Pay ₹20 via Razorpay
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              <Lock size={11} color="#737780" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#737780', letterSpacing: '0.05em' }}>
                Secured by Razorpay · SSL Encrypted
              </span>
            </div>
          </>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 48, height: 48, margin: '0 auto 16px', border: '3px solid #e8e8e8', borderTop: '3px solid #003366', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: '#001e40', marginBottom: 4 }}>Processing Payment</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#737780', letterSpacing: '0.05em' }}>Do not close this window</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DEMO_STEPS.map((s, i) => {
                const done   = doneSteps.includes(i);
                const active = procStep === i;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: (!done && !active) ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                    <div style={{
                      width: 22, height: 22, flexShrink: 0, borderRadius: '50%',
                      border: `2px solid ${done ? '#006e2f' : active ? '#003366' : '#c3c6d1'}`,
                      background: done ? '#006e2f' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                    }}>
                      {done
                        ? <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                        : <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: active ? '#003366' : '#737780' }}>{String(i + 1).padStart(2, '0')}</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 2, background: '#e8e8e8', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: done ? '#006e2f' : '#003366',
                          width: done ? '100%' : active ? '65%' : '0%',
                          transition: `width ${s.ms}ms ease`,
                        }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: done ? '#006e2f' : active ? '#001e40' : '#737780', whiteSpace: 'nowrap', minWidth: 190, textAlign: 'right' }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 20px', background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={28} color="#006e2f" />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#001e40', marginBottom: 8 }}>Payment Successful</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#43474f', marginBottom: 16 }}>All styles and downloads are now unlocked.</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Shield size={12} color="#006e2f" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#006e2f', letterSpacing: '0.05em' }}>TRANSACTION VERIFIED</span>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 20px', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={26} color="#b91c1c" />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#001e40', marginBottom: 8 }}>Payment Failed</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#43474f', marginBottom: 20, lineHeight: 1.5 }}>{errMsg}</div>
            <button onClick={() => { setStep('confirm'); setDoneSteps([]); setProcStep(-1); }} style={{ padding: '10px 24px', background: '#003366', color: '#c9a84c', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, borderRadius: 2 }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
