const STYLES = [
  { id: 1, label: 'ATS Friendly',   tag: 'SAFE BUILD',     desc: 'Single-column, clean black on white. Optimised for resume parsers.' },
  { id: 2, label: 'Blueprint',      tag: 'CURRENT BUILD',  desc: 'Architectural grid with blueprint blue accents and Lucide icons.' },
  { id: 3, label: 'Classic',        tag: 'PROFESSIONAL',   desc: 'Two-column serif layout. Formal and authoritative.' },
  { id: 4, label: 'Professional',   tag: 'DOCX MIRROR',    desc: 'Strict single-column. Plain-text skills, techs in narrative. Maximum ATS fidelity.' },
];

export default function StyleSelector({ selected, onChange }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>[ SELECT_STYLE ]</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              background: selected === s.id ? 'var(--blue-dark)' : 'var(--bg-card)',
              border: selected === s.id ? '2px solid var(--blue-dark)' : '2px solid var(--border-solid)',
              padding: '16px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s', borderRadius: 2,
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: selected === s.id ? 'var(--gold)' : 'var(--blue)', display: 'block', marginBottom: 6 }}>{s.tag}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: selected === s.id ? '#ffffff' : 'var(--blue-dark)', display: 'block', marginBottom: 4 }}>{s.label}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: selected === s.id ? 'rgba(255,255,255,0.65)' : 'var(--text-dim)', lineHeight: 1.5 }}>{s.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
