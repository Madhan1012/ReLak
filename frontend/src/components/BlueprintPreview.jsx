import { Mail, Phone, MapPin, Plus, Trash2 } from 'lucide-react';
import { E, EditableChips } from './PreviewComponents';

// Leadership keywords for dynamic badge detection
const LEADERSHIP_KEYWORDS = ['founder', 'lead', 'manager', 'director', 'chief', 'architect'];

function isLeadershipRole(roleOrTitle) {
  if (!roleOrTitle || typeof roleOrTitle !== 'string') return false;
  const lower = roleOrTitle.toLowerCase();
  return LEADERSHIP_KEYWORDS.some(kw => lower.includes(kw));
}

function SectionHeader({ index, title }) {
  return (
    <div className="section-header">
      <span className="section-index">[ {String(index).padStart(2, '0')} ]</span>
      <h2 className="section-title">{title}</h2>
      <div className="section-rule" />
    </div>
  );
}

export default function BlueprintPreview({ data, editable = false, onDataChange }) {
  if (!data) return null;

  const techSkills = data.technical_skills ?? data.skills ?? [];
  const softSkills = data.soft_skills ?? [];

  /** Deep-patch helper: 'experience.0.role' → sets that nested value */
  const patch = (path, value) => {
    if (!onDataChange) return;
    const parts = path.split('.');
    const next = JSON.parse(JSON.stringify(data));
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    onDataChange(next);
  };

  const addExp  = () => onDataChange && onDataChange({ ...data, experience: [...(data.experience || []), { company: '', role: '', duration: '', highlights: [''] }] });
  const addProj = () => onDataChange && onDataChange({ ...data, projects: [...(data.projects || []), { title: '', description: '', technologies: [], link: null }] });
  const addEdu  = () => onDataChange && onDataChange({ ...data, education: [...(data.education || []), { institution: '', degree: '', year: '' }] });
  const removeExp  = i => onDataChange && onDataChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });
  const removeProj = i => onDataChange && onDataChange({ ...data, projects: data.projects.filter((_, j) => j !== i) });
  const removeEdu  = i => onDataChange && onDataChange({ ...data, education: data.education.filter((_, j) => j !== i) });

  let idx = 2;

  return (
    <div id="blueprint-preview" className="bp-card">

      {/* ── Identity ── */}
      <header style={{ marginBottom: 40 }}>
        <span className="identity-tag">[ 01_IDENTITY ]</span>
        <E tag="h1" value={data.name} editable={editable} onChange={v => patch('name', v)}
          style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 52, fontWeight: 700, color: 'var(--blue-dark)', letterSpacing: '-1.5px', lineHeight: 1, display: 'block' }} />
        <div className="identity-rule" />
        <E tag="p" value={data.summary} editable={editable} onChange={v => patch('summary', v)}
          style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.7, marginBottom: 16, display: 'block' }} />

        {/* Contact row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          <div className="identity-email">
            <Mail size={13} color="var(--text-dim)" />
            <E value={data.email} editable={editable} onChange={v => patch('email', v)} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-dim)' }} />
          </div>
          {(data.phone || editable) && (
            <div className="identity-email">
              <Phone size={13} color="var(--text-dim)" />
              <E value={data.phone || ''} editable={editable} onChange={v => patch('phone', v || null)} placeholder="+91 ..." style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-dim)' }} />
            </div>
          )}
          {(data.address || editable) && (
            <div className="identity-email">
              <MapPin size={13} color="var(--text-dim)" />
              <E value={data.address || ''} editable={editable} onChange={v => patch('address', v || null)} placeholder="City, Country" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-dim)' }} />
            </div>
          )}
          {(data.linkedin || editable) && (
            <div className="identity-email">
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-dim)' }}>in</span>
              <E value={data.linkedin || ''} editable={editable} onChange={v => patch('linkedin', v || null)} placeholder="LinkedIn URL" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-dim)' }} />
            </div>
          )}
          {(data.github || editable) && (
            <div className="identity-email">
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-dim)' }}>gh</span>
              <E value={data.github || ''} editable={editable} onChange={v => patch('github', v || null)} placeholder="GitHub URL" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--text-dim)' }} />
            </div>
          )}
        </div>
      </header>

      {/* ── Technical Skills ── */}
      {(techSkills.length > 0 || editable) && (
        <section style={{ marginBottom: 40 }}>
          <SectionHeader index={idx++} title="Technical_Skills" />
          <EditableChips items={techSkills} editable={editable}
            onChange={v => patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', v)} />
        </section>
      )}

      {/* ── Soft Skills ── */}
      {(softSkills.length > 0 || editable) && (
        <section style={{ marginBottom: 40 }}>
          <SectionHeader index={idx++} title="Soft_Skills" />
          <EditableChips items={softSkills} editable={editable} onChange={v => patch('soft_skills', v)} />
        </section>
      )}

      {/* ── Experience ── */}
      {((data.experience?.filter(e => e.role || e.company).length > 0) || editable) && (
        <section id="experience" style={{ marginBottom: 40 }}>
          <SectionHeader index={idx++} title="Experience_Log" />
          <div className="exp-list">
            {(data.experience || []).map((exp, i) => (
              <div key={i} className="exp-row" style={{ position: 'relative' }}>
                {editable && (
                  <button onClick={() => removeExp(i)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', zIndex: 1 }}><Trash2 size={13} /></button>
                )}
                <div className="exp-meta">
                  <E value={exp.duration} editable={editable} onChange={v => patch(`experience.${i}.duration`, v)}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }} />
                  <div className="exp-active"><span className="exp-active-dot" /><span className="exp-active-label">Active</span></div>
                </div>
                <div className={`exp-card ${i === 0 ? 'primary' : 'secondary'}`}>
                  <div className="exp-card-top">
                    <div>
                      <E value={exp.role} editable={editable} onChange={v => patch(`experience.${i}.role`, v)}
                        style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--blue-dark)', marginBottom: 4, display: 'block' }} />
                      <E value={exp.company} editable={editable} onChange={v => patch(`experience.${i}.company`, v)}
                        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--blue)', display: 'block' }} />
                    </div>
                    <span className="exp-ref">{isLeadershipRole(exp.role) ? '[ LEADERSHIP ]' : `[ REF: EX-${String(i + 1).padStart(3, '0')} ]`}</span>
                  </div>
                  <ul className="exp-highlights">
                    {(exp.highlights || []).map((h, j) => (
                      <li key={j} className="exp-highlight">
                        <span className="exp-arrow">→</span>
                        <E value={h} editable={editable} onChange={v => {
                          const hl = [...exp.highlights]; hl[j] = v; patch(`experience.${i}.highlights`, hl);
                        }} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }} />
                        {editable && (
                          <button onClick={() => patch(`experience.${i}.highlights`, exp.highlights.filter((_, k) => k !== j))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '0 4px', flexShrink: 0 }}><Trash2 size={11} /></button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {editable && (
                    <button onClick={() => patch(`experience.${i}.highlights`, [...(exp.highlights || []), ''])} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, background: 'none', border: '1px dashed var(--border-solid)', padding: '3px 10px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--blue)', borderRadius: 2 }}>
                      <Plus size={11} /> Add bullet
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {editable && (
            <button onClick={addExp} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: '1px dashed var(--blue)', padding: '8px 16px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--blue)', borderRadius: 2 }}>
              <Plus size={13} /> Add Experience
            </button>
          )}
        </section>
      )}

      {/* ── Projects ── */}
      {((data.projects?.filter(p => p.title).length > 0) || editable) && (
        <section id="projects" style={{ marginBottom: 40 }}>
          <SectionHeader index={idx++} title="Project_Schematics" />
          <div className="proj-grid">
            {(data.projects || []).map((proj, i) => (
              <div key={i} className="proj-card" style={{ position: 'relative' }}>
                {editable && (
                  <button onClick={() => removeProj(i)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}><Trash2 size={13} /></button>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  {isLeadershipRole(proj.title) ? (
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--gold)', background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold)', padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      LEADERSHIP
                    </span>
                  ) : (
                    <span className="proj-id">PROJ_{String(i + 1).padStart(3, '0')}</span>
                  )}
                </div>
                <E value={proj.title} editable={editable} onChange={v => patch(`projects.${i}.title`, v)}
                  style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--blue-dark)', marginBottom: 10, display: 'block' }} />
                <E tag="p" value={proj.description} editable={editable} onChange={v => patch(`projects.${i}.description`, v)}
                  style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }} />
                <EditableChips items={proj.technologies || []} editable={editable}
                  onChange={v => patch(`projects.${i}.technologies`, v)} />
              </div>
            ))}
          </div>
          {editable && (
            <button onClick={addProj} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: '1px dashed var(--blue)', padding: '8px 16px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--blue)', borderRadius: 2 }}>
              <Plus size={13} /> Add Project
            </button>
          )}
        </section>
      )}

      {/* ── Education ── */}
      {((data.education?.filter(e => e.degree || e.institution).length > 0) || editable) && (
        <section id="education">
          <SectionHeader index={idx++} title="Education" />
          <div className="edu-list">
            {(data.education || []).map((edu, i) => (
              <div key={i} className="edu-row" style={{ position: 'relative' }}>
                {editable && (
                  <button onClick={() => removeEdu(i)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}><Trash2 size={13} /></button>
                )}
                <div>
                  <E value={edu.degree} editable={editable} onChange={v => patch(`education.${i}.degree`, v)}
                    style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--blue-dark)', marginBottom: 4, display: 'block' }} />
                  <E value={edu.institution} editable={editable} onChange={v => patch(`education.${i}.institution`, v)}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-muted)', display: 'block' }} />
                </div>
                <E value={edu.year} editable={editable} onChange={v => patch(`education.${i}.year`, v)}
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, background: 'var(--bg-highest)', padding: '4px 12px', color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
          {editable && (
            <button onClick={addEdu} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: '1px dashed var(--blue)', padding: '8px 16px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--blue)', borderRadius: 2 }}>
              <Plus size={13} /> Add Education
            </button>
          )}
        </section>
      )}

    </div>
  );
}
