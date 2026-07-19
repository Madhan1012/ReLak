import { Trash2, Plus } from 'lucide-react';

/** Visible [LINK] badge — prints in PDF. Editable input in edit mode. */
export function LinkBadge({ href, onEdit, editable }) {
  if (!href && !editable) return null;
  const short = (href || '').replace('https://', '').replace('http://', '').replace('www.', '');
  if (editable) {
    return (
      <input
        defaultValue={href || ''}
        onBlur={e => onEdit && onEdit(e.target.value || null)}
        placeholder="https://github.com/..."
        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--blue)', background: 'var(--bg-low)', border: '1px solid var(--border-solid)', padding: '1px 6px', borderRadius: 2, width: 220, outline: 'none' }}
      />
    );
  }
  if (!href) return null;
  return (
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--blue)', background: 'var(--bg-low)', padding: '1px 7px', border: '1px solid var(--border-solid)', borderRadius: 2, wordBreak: 'break-all' }}>
      [LINK] {short}
    </span>
  );
}

/** Inline contentEditable span/block. Falls back to plain render when not editable. */
export function E({ value, onChange, editable, style, tag: Tag = 'span', placeholder = '…' }) {
  if (!editable) return <Tag style={style}>{value}</Tag>;
  return (
    <Tag
      contentEditable suppressContentEditableWarning
      onBlur={e => onChange && onChange(e.currentTarget.textContent)}
      style={{ ...style, outline: 'none', borderBottom: '1px dashed var(--border-solid)', minWidth: 40, cursor: 'text' }}
      title="Click to edit"
    >
      {value || placeholder}
    </Tag>
  );
}

/** Editable pipe-delimited skill list. Non-editable renders as plain text. */
export function EditableChips({ items, onChange, editable, chipClass = "skill-chip" }) {
  if (!editable) {
    // Plain text with pipe delimiter — no pill boxes, fully ATS-parseable
    const text = items.filter(Boolean).join(' | ');
    return (
      <p style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
        {text}
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input value={s} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: '3px 8px', border: '1px solid var(--border-solid)', background: 'var(--bg-low)', color: 'var(--text)', borderRadius: 2, flex: 1, outline: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}><Trash2 size={12} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ''])} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px dashed var(--border-solid)', padding: '4px 10px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--blue)', borderRadius: 2, width: 'fit-content' }}>
        <Plus size={11} /> Add
      </button>
    </div>
  );
}
