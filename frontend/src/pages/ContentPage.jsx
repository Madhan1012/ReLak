import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { fetchContent } from '../utils/contentStore';

// Minimal markdown renderer — handles ## headings, **bold**, --- rules, newlines
function renderMd(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--blue-dark)', margin: '20px 0 8px' }}>{line.slice(4)}</h3>;
    if (line.trim() === '---') return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-solid)', margin: '20px 0' }} />;
    if (!line.trim()) return <br key={i} />;
    // Table rows — render as simple text
    if (line.startsWith('|')) {
      const cells = line.split('|').filter(Boolean).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return null; // separator row
      return <p key={i} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 4 }}>{cells.join(' · ')}</p>;
    }
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    );
    return <p key={i} style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 6 }}>{parts}</p>;
  });
}

export default function ContentPage({ pageKey, serverStatus }) {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchContent(pageKey).then(c => {
      setContent(c);
      setLoading(false);
    });
  }, [pageKey]);

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />
      <main className="main">
        <div className="content-page">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, background: 'none', border: '1px solid var(--border-solid)', padding: '7px 14px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-muted)', borderRadius: 2 }}
          >
            <ArrowLeft size={13} /> Back
          </button>

          {loading ? (
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-dim)', animation: 'pulse 1.5s ease-in-out infinite' }}>Loading...</div>
          ) : (
            <>
              <span className="tag">[ RELAK ]</span>
              <h1>{content?.title}</h1>
              <div style={{ marginTop: 24 }}>{renderMd(content?.body)}</div>
            </>
          )}
        </div>
      </main>
      <ContentFooter />
    </div>
  );
}

function ContentFooter() {
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
