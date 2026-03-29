import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Eye, EyeOff, ShieldCheck, Trash2, AlertTriangle,
  RefreshCw, Users, FolderOpen, BarChart2, FileText,
} from 'lucide-react';
import { getContent, setContent } from '../utils/contentStore';
import { API_BASE } from '../config';


const mono = "'JetBrains Mono', monospace";
const sans = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

// ── Auth shell ────────────────────────────────────────────────────────────────
export default function AdminLogin() {
  const navigate = useNavigate();
  const [key, setKey]           = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: { 'X-Admin-Key': key.trim() } });
      if (!res.ok) throw new Error('Invalid admin key');
      setAdminKey(key.trim());
      setAuthed(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100svh', background: '#001e40',
      backgroundImage: `linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.03) 1px,transparent 1px)`,
      backgroundSize: '24px 24px',
      display: 'flex', alignItems: authed ? 'flex-start' : 'center',
      justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: authed ? 900 : 420, paddingTop: authed ? 32 : 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>ReLak</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin Control Panel</div>
        </div>

        {!authed ? (
          <form onSubmit={handleLogin}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Lock size={16} color="rgba(255,255,255,0.5)" />
                <span style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Authentication Required</span>
              </div>
              <label style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Admin Key</label>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <input type={show ? 'text' : 'password'} value={key} onChange={e => setKey(e.target.value)} placeholder="Enter admin key..."
                  style={{ width: '100%', padding: '12px 40px 12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: mono, fontSize: 13, outline: 'none', borderRadius: 2, boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && <div style={{ background: 'rgba(186,26,26,0.15)', border: '1px solid rgba(186,26,26,0.4)', padding: '8px 12px', marginBottom: 16, fontFamily: mono, fontSize: 11, color: '#ff8a80' }}>{error}</div>}
              <button type="submit" disabled={loading || !key.trim()} style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontFamily: mono, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 2, opacity: !key.trim() ? 0.5 : 1 }}>
                {loading ? 'Verifying...' : 'Access Panel'}
              </button>
            </div>
          </form>
        ) : (
          <AdminDashboard adminKey={adminKey} onLogout={() => { setAuthed(false); setKey(''); setAdminKey(''); }} />
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', letterSpacing: '0.1em' }}>← Back to ReLak</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function AdminDashboard({ adminKey, onLogout }) {
  const [tab, setTab]               = useState('overview');
  const [stats, setStats]           = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [users, setUsers]           = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const apiFetch = (path, opts = {}) =>
    fetch(`${API_BASE}${path}`, { ...opts, headers: { 'X-Admin-Key': adminKey, ...(opts.headers || {}) } });

  const refreshStats = async () => {
    const r = await apiFetch('/admin/stats');
    if (r.ok) setStats(await r.json());
  };
  const refreshPortfolios = async () => {
    setLoadingData(true);
    const r = await apiFetch('/admin/portfolios');
    if (r.ok) setPortfolios(await r.json());
    setLoadingData(false);
  };
  const refreshUsers = async () => {
    setLoadingData(true);
    const r = await apiFetch('/admin/users');
    if (r.ok) setUsers(await r.json());
    setLoadingData(false);
  };

  useEffect(() => { refreshStats(); }, []);
  useEffect(() => {
    if (tab === 'portfolios') refreshPortfolios();
    if (tab === 'users') refreshUsers();
  }, [tab]);

  const TABS = [
    { id: 'overview',   label: 'Overview',    icon: <BarChart2 size={13} /> },
    { id: 'portfolios', label: 'Portfolios',  icon: <FolderOpen size={13} /> },
    { id: 'users',      label: 'Users',       icon: <Users size={13} /> },
    { id: 'content',    label: 'Pages',       icon: <FileText size={13} /> },
    { id: 'danger',     label: 'Danger Zone', icon: <AlertTriangle size={13} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} color="#6bff8f" />
          <span style={{ fontFamily: mono, fontSize: 11, color: '#6bff8f', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Access Granted</span>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontFamily: mono, fontSize: 10, cursor: 'pointer', padding: '6px 14px', borderRadius: 2 }}>Sign Out</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #6bff8f' : '2px solid transparent',
            color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
            fontFamily: mono, fontSize: 11, cursor: 'pointer', marginBottom: -1,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === 'overview'   && <OverviewTab stats={stats} onRefresh={refreshStats} />}
      {tab === 'portfolios' && <PortfoliosTab portfolios={portfolios} loading={loadingData} apiFetch={apiFetch} onRefresh={refreshPortfolios} />}
      {tab === 'users'      && <UsersTab users={users} loading={loadingData} apiFetch={apiFetch} onRefresh={refreshUsers} />}
      {tab === 'content'    && <ContentTab />}
      {tab === 'danger'     && <DangerTab stats={stats} apiFetch={apiFetch} onRefresh={refreshStats} />}
    </div>
  );
}

function OverviewTab({ stats, onRefresh }) {
  if (!stats) return <Spinner />;
  const metrics = [
    { label: 'Total Users',      value: stats.users },
    { label: 'Portfolios Built', value: stats.portfolios },
    { label: 'Paid Builds',      value: stats.paid_portfolios },
    { label: 'Revenue',          value: `₹${stats.revenue_inr}` },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><RefreshBtn onClick={onRefresh} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 16px' }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 700, color: '#fff' }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfoliosTab({ portfolios, loading, apiFetch, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [msg, setMsg] = useState('');

  const markPaid = async (id) => {
    const r = await apiFetch(`/admin/portfolios/${id}/mark-paid`, { method: 'PATCH' });
    if (r.ok) { setMsg('Marked as paid.'); onRefresh(); }
  };
  const del = async (id) => {
    if (!window.confirm('Delete this portfolio?')) return;
    const r = await apiFetch(`/admin/portfolios/${id}`, { method: 'DELETE' });
    if (r.ok) { setMsg('Deleted.'); onRefresh(); }
  };

  if (loading) return <Spinner />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{portfolios.length} record(s)</span>
        <RefreshBtn onClick={onRefresh} />
      </div>
      {msg && <div style={{ fontFamily: mono, fontSize: 11, color: '#6bff8f', marginBottom: 12 }}>✓ {msg}</div>}
      {portfolios.length === 0 && <Empty label="No portfolios yet." />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {portfolios.map(p => (
          <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontFamily: mono, fontSize: 12, color: '#fff', fontWeight: 600 }}>{p.slug}</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: p.is_paid ? '#6bff8f' : '#ff8a80', marginLeft: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {p.is_paid ? '● PAID' : '○ UNPAID'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{p.created_at?.slice(0, 16)}</span>
                <AdminBtn onClick={() => setExpanded(expanded === p.id ? null : p.id)} label={expanded === p.id ? 'Hide' : 'View'} />
                {!p.is_paid && <AdminBtn onClick={() => markPaid(p.id)} label="Mark Paid" color="#6bff8f" />}
                <AdminBtn onClick={() => del(p.id)} label="Delete" color="#ff8a80" />
              </div>
            </div>
            {expanded === p.id && (
              <pre style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.7)', fontFamily: mono, fontSize: 10, lineHeight: 1.6, overflow: 'auto', maxHeight: 320, borderRadius: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(p.resume_data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab({ users, loading, apiFetch, onRefresh }) {
  const [msg, setMsg] = useState('');
  const del = async (id) => {
    if (!window.confirm('Delete this user and all their portfolios?')) return;
    const r = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    if (r.ok) { setMsg('User deleted.'); onRefresh(); }
  };
  if (loading) return <Spinner />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{users.length} user(s)</span>
        <RefreshBtn onClick={onRefresh} />
      </div>
      {msg && <div style={{ fontFamily: mono, fontSize: 11, color: '#6bff8f', marginBottom: 12 }}>✓ {msg}</div>}
      {users.length === 0 && <Empty label="No users yet." />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map(u => (
          <div key={u.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontFamily: mono, fontSize: 12, color: '#fff' }}>{u.email}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 10 }}>{u.created_at?.slice(0, 16)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{u.id.slice(0, 8)}…</span>
              <AdminBtn onClick={() => del(u.id)} label="Delete" color="#ff8a80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerTab({ stats, apiFetch, onRefresh }) {
  const [purgeState, setPurgeState]   = useState('idle');
  const [purgeResult, setPurgeResult] = useState(null);

  const handlePurge = async () => {
    setPurgeState('purging');
    try {
      const r = await apiFetch('/admin/purge', { method: 'DELETE' });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setPurgeResult(data); setPurgeState('done'); onRefresh();
    } catch { setPurgeState('idle'); }
  };

  return (
    <div style={{ border: '1px solid rgba(186,26,26,0.4)', padding: '24px', background: 'rgba(186,26,26,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <AlertTriangle size={14} color="#ff8a80" />
        <span style={{ fontFamily: mono, fontSize: 10, color: '#ff8a80', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Danger Zone</span>
      </div>
      <p style={{ fontFamily: inter, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 20 }}>
        Permanently delete <strong style={{ color: 'rgba(255,255,255,0.7)' }}>all portfolios and users</strong> from the Neon database. Irreversible.
      </p>
      {purgeState === 'idle' && (
        <button onClick={() => setPurgeState('confirm')} style={{ width: '100%', padding: '11px', background: 'rgba(186,26,26,0.2)', border: '1px solid rgba(186,26,26,0.5)', color: '#ff8a80', fontFamily: mono, fontSize: 11, cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Trash2 size={13} /> Purge All Data
        </button>
      )}
      {purgeState === 'confirm' && (
        <div>
          <div style={{ background: 'rgba(186,26,26,0.15)', border: '1px solid rgba(186,26,26,0.4)', padding: '12px', marginBottom: 12, fontFamily: mono, fontSize: 11, color: '#ff8a80', lineHeight: 1.6 }}>
            ⚠ This will delete {stats?.portfolios ?? '?'} portfolio(s) and {stats?.users ?? '?'} user(s). Type CONFIRM to proceed.
          </div>
          <ConfirmInput onConfirm={handlePurge} onCancel={() => setPurgeState('idle')} />
        </div>
      )}
      {purgeState === 'purging' && <div style={{ fontFamily: mono, fontSize: 11, color: '#ff8a80', textAlign: 'center', padding: '8px 0' }}>Purging database...</div>}
      {purgeState === 'done' && purgeResult && (
        <div style={{ background: 'rgba(0,110,47,0.15)', border: '1px solid rgba(0,110,47,0.4)', padding: '12px', fontFamily: mono, fontSize: 11, color: '#6bff8f', lineHeight: 1.7 }}>
          ✓ Purge complete — Portfolios: {purgeResult.portfolios_deleted} · Users: {purgeResult.users_deleted}
        </div>
      )}
    </div>
  );
}

// ── Micro-components ──────────────────────────────────────────────────────────
function ConfirmInput({ onConfirm, onCancel }) {
  const [val, setVal] = useState('');
  const ready = val.trim().toUpperCase() === 'CONFIRM';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Type CONFIRM to proceed"
        style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${ready ? 'rgba(186,26,26,0.7)' : 'rgba(255,255,255,0.15)'}`, color: '#fff', fontFamily: mono, fontSize: 12, outline: 'none', borderRadius: 2 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '9px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontFamily: mono, fontSize: 11, cursor: 'pointer', borderRadius: 2 }}>Cancel</button>
        <button onClick={onConfirm} disabled={!ready} style={{ flex: 1, padding: '9px', background: ready ? 'rgba(186,26,26,0.4)' : 'rgba(186,26,26,0.1)', border: '1px solid rgba(186,26,26,0.5)', color: ready ? '#ff8a80' : 'rgba(255,138,128,0.4)', fontFamily: mono, fontSize: 11, cursor: ready ? 'pointer' : 'not-allowed', borderRadius: 2 }}>Purge Now</button>
      </div>
    </div>
  );
}

function AdminBtn({ onClick, label, color = 'rgba(255,255,255,0.5)' }) {
  return <button onClick={onClick} style={{ padding: '4px 10px', background: 'none', border: `1px solid ${color}40`, color, fontFamily: mono, fontSize: 10, cursor: 'pointer', borderRadius: 2 }}>{label}</button>;
}
function RefreshBtn({ onClick }) {
  return <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontFamily: mono, fontSize: 10, cursor: 'pointer', borderRadius: 2 }}><RefreshCw size={11} /> Refresh</button>;
}
function Spinner() {
  return <div style={{ textAlign: 'center', padding: '32px 0' }}><div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
}
function Empty({ label }) {
  return <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '24px 0' }}>{label}</div>;
}

// ── Content editor tab ────────────────────────────────────────────────────────
function ContentTab() {
  const pages = ['privacy', 'support', 'about'];
  const labels = { privacy: 'Privacy & Terms', support: 'Support', about: 'About' };
  const [activePage, setActivePage] = useState('privacy');
  const [content, setLocalContent] = useState(() => getContent());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setContent(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cur = content[activePage] || { title: '', body: '' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {pages.map(p => (
          <button key={p} onClick={() => setActivePage(p)} style={{
            padding: '6px 14px', background: activePage === p ? 'rgba(255,255,255,0.12)' : 'none',
            border: '1px solid rgba(255,255,255,0.15)', color: activePage === p ? '#fff' : 'rgba(255,255,255,0.5)',
            fontFamily: mono, fontSize: 11, cursor: 'pointer', borderRadius: 2,
          }}>{labels[p]}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Page Title</label>
          <input value={cur.title} onChange={e => setLocalContent(c => ({ ...c, [activePage]: { ...cur, title: e.target.value } }))}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: mono, fontSize: 13, outline: 'none', borderRadius: 2, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Body (Markdown: ## Heading, **bold**)
          </label>
          <textarea value={cur.body} rows={16}
            onChange={e => setLocalContent(c => ({ ...c, [activePage]: { ...cur, body: e.target.value } }))}
            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontFamily: mono, fontSize: 12, outline: 'none', borderRadius: 2, resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleSave} style={{ padding: '11px', background: saved ? 'rgba(0,110,47,0.3)' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: saved ? '#6bff8f' : '#fff', fontFamily: mono, fontSize: 12, cursor: 'pointer', borderRadius: 2 }}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
