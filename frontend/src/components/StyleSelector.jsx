const STYLES = [
  {
    id: 1,
    label: 'ATS Friendly',
    tag: 'SAFE BUILD',
    desc: 'Single-column, clean black on white. Optimised for resume parsers.',
  },
  {
    id: 2,
    label: 'Blueprint',
    tag: 'CURRENT BUILD',
    desc: 'Architectural grid with blueprint blue accents and Lucide icons.',
  },
  {
    id: 3,
    label: 'Classic',
    tag: 'PROFESSIONAL',
    desc: 'Two-column serif layout. Formal and authoritative.',
  },
];

export default function StyleSelector({ selected, onChange }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: '#737780',
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>[ SELECT_STYLE ]</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(195,198,209,0.4)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              background: selected === s.id ? '#001e40' : '#ffffff',
              border: selected === s.id
                ? '2px solid #001e40'
                : '2px solid rgba(195,198,209,0.6)',
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              borderRadius: 2,
            }}
          >
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: selected === s.id ? 'rgba(119,163,214,0.8)' : '#003366',
              display: 'block', marginBottom: 6,
            }}>{s.tag}</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14, fontWeight: 700,
              color: selected === s.id ? '#ffffff' : '#001e40',
              display: 'block', marginBottom: 4,
            }}>{s.label}</span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: selected === s.id ? 'rgba(255,255,255,0.65)' : '#737780',
              lineHeight: 1.5,
            }}>{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
