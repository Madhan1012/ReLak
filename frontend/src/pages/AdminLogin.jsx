import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [key, setKey]         = useState('');
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [stats, setStats]     = useState(null);
  const [adminKey, setAdminKey] = useState(''); // keep key for subsequent calls

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'X-Admin-Key': key.trim() },
      });
      if (!res.ok) throw new Error('Invalid admin key');
      const data = await res.json();
      setAdminKey(key.trim());
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100svh',
      background: '#001e40',
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28, fontWeight: 700,
            color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 6,
          }}>ReLak</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>Admin Control Panel</div>
        </div>

        {!stats ? (
          <form onSubmit={handleLogin}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '32px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Lock size={16} color="rgba(255,255,255,0.5)" />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Authentication Required</span>
              </div>

              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                display: 'block', marginBottom: 8,
              }}>Admin Key</label>

              <div style={{ position: 'relative', marginBottom: 20 }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="Enter admin key..."
                  style={{
                    width: '100%', padding: '12px 40px 12px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13, outline: 'none', borderRadius: 2,
                    boxSizing: 'border-box',
                  }}
                />
                <button type="button" onClick={() => setShow(s => !s)} style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0,
                }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(186,26,26,0.15)',
                  border: '1px solid rgba(186,26,26,0.4)',
                  padding: '8px 12px', marginBottom: 16,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, color: '#ff8a80',
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading || !key.trim()} style={{
                width: '100%', padding: '13px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: 2, opacity: !key.trim() ? 0.5 : 1,
              }}>
                {loading ? 'Verifying...' : 'Access Panel'}
              </button>
            </div>
          </form>
        ) : (
          <AdminDashboard
            stats={stats}
            adminKey={adminKey}
            onLogout={() => { setStats(null); setKey(''); setAdminKey(''); }}
            onStatsRefresh={setStats}
          />
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer', letterSpacing: '0.1em',
          }}>← Back to ReLak</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function AdminDashboard({ stats, adminKey, onLogout, onStatsRefresh }) {
  const [purgeState, setPurgeState] = useState('idle'); // idle | confirm | purging | done
  const [purgeResult, setPurgeResult] = useState(null);

  const metrics = [
    { label: 'Total Users',      value: stats.users },
    { label: 'Portfolios Built', value: stats.portfolios },
    { label: 'Revenue',          value: `₹${stats.revenue_inr}` },
    { label: 'Paid Builds',      value: Math.floor(stats.revenue_inr / 20) },
  ];

  const handlePurge = async () => {
    setPurgeState('purging');
    try {
      const res = await fetch(`${API_BASE}/admin/purge`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': adminKey },
      });
      if (!res.ok) throw new Error('Purge failed');
      const data = await res.json();
      setPurgeResult(data);
      setPurgeState('done');
      // Refresh stats
      const statsRes = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      if (statsRes.ok) onStatsRefresh(await statsRes.json());
    } catch {
      setPurgeState('idle');
    }
  };

  return (
    <div>
      {/* Access granted badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <ShieldCheck size={16} color="#6bff8f" />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: '#6bff8f',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>Access Granted</span>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '20px 16px',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>{m.label}</div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28, fontWeight: 700, color: '#ffffff',
            }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* ── Danger Zone ── */}
      <div style={{
        border: '1px solid rgba(186,26,26,0.4)',
        padding: '20px', marginBottom: 16,
        background: 'rgba(186,26,26,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <AlertTriangle size={14} color="#ff8a80" />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: '#ff8a80',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>Danger Zone</span>
        </div>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12, color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.6, marginBottom: 16,
        }}>
          Permanently delete <strong style={{ color: 'rgba(255,255,255,0.7)' }}>all portfolios and users</strong> from the Neon database.
          This action is irreversible.
        </p>

        {purgeState === 'idle' && (
          <button onClick={() => setPurgeState('confirm')} style={{
            width: '100%', padding: '11px',
            background: 'rgba(186,26,26,0.2)',
            border: '1px solid rgba(186,26,26,0.5)',
            color: '#ff8a80',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, cursor: 'pointer', borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Trash2 size={13} /> Purge All Data
          </button>
        )}

        {purgeState === 'confirm' && (
          <div>
            <div style={{
              background: 'rgba(186,26,26,0.15)',
              border: '1px solid rgba(186,26,26,0.4)',
              padding: '12px', marginBottom: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: '#ff8a80', lineHeight: 1.6,
            }}>
              ⚠ This will delete {stats.portfolios} portfolio(s) and {stats.users} user(s) permanently.
              Type CONFIRM below to proceed.
            </div>
            <ConfirmInput onConfirm={handlePurge} onCancel={() => setPurgeState('idle')} />
          </div>
        )}

        {purgeState === 'purging' && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, color: '#ff8a80',
            animation: 'pulse 1.5s ease-in-out infinite',
            textAlign: 'center', padding: '8px 0',
          }}>Purging database...</div>
        )}

        {purgeState === 'done' && purgeResult && (
          <div style={{
            background: 'rgba(0,110,47,0.15)',
            border: '1px solid rgba(0,110,47,0.4)',
            padding: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, color: '#6bff8f', lineHeight: 1.7,
          }}>
            ✓ Purge complete<br />
            Portfolios deleted: {purgeResult.portfolios_deleted}<br />
            Users deleted: {purgeResult.users_deleted}
          </div>
        )}
      </div>

      <button onClick={onLogout} style={{
        width: '100%', padding: '11px',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, cursor: 'pointer', borderRadius: 2,
      }}>Sign Out</button>
    </div>
  );
}

// Requires typing "CONFIRM" before the purge fires
function ConfirmInput({ onConfirm, onCancel }) {
  const [val, setVal] = useState('');
  const ready = val.trim().toUpperCase() === 'CONFIRM';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder='Type CONFIRM to proceed'
        style={{
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${ready ? 'rgba(186,26,26,0.7)' : 'rgba(255,255,255,0.15)'}`,
          color: '#ffffff',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, outline: 'none', borderRadius: 2,
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '9px',
          background: 'none',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, cursor: 'pointer', borderRadius: 2,
        }}>Cancel</button>
        <button onClick={onConfirm} disabled={!ready} style={{
          flex: 1, padding: '9px',
          background: ready ? 'rgba(186,26,26,0.4)' : 'rgba(186,26,26,0.1)',
          border: '1px solid rgba(186,26,26,0.5)',
          color: ready ? '#ff8a80' : 'rgba(255,138,128,0.4)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, cursor: ready ? 'pointer' : 'not-allowed', borderRadius: 2,
        }}>Purge Now</button>
      </div>
    </div>
  );
}
