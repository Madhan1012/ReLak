import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getContent } from '../utils/contentStore';

// Minimal markdown renderer — handles ## headings, **bold**, newlines
function renderMd(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h2 key={i}>{line.slice(3)}</h2>;
    }
    if (!line.trim()) return <br key={i} />;
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    );
    return <p key={i}>{parts}</p>;
  });
}

export default function ContentPage({ pageKey, serverStatus }) {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);

  useEffect(() => {
    const all = getContent();
    setContent(all[pageKey] || { title: pageKey, body: '' });
  }, [pageKey]);

  if (!content) return null;

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />
      <main className="main">
        <div className="content-page">
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32,
              background: 'none', border: '1px solid var(--border-solid)',
              padding: '7px 14px', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: 'var(--text-muted)', borderRadius: 2,
            }}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span className="tag">[ RELAK ]</span>
          <h1>{content.title}</h1>
          <div style={{ marginTop: 24 }}>{renderMd(content.body)}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
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
        <span onClick={() => navigate('/about')} className="footer-link" style={{ cursor: 'pointer' }}>About</span>
      </div>
    </footer>
  );
}
