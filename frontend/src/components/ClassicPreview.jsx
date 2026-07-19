import { E } from './PreviewComponents';
import { Plus, Trash2 } from 'lucide-react';

// Leadership keywords for dynamic badge detection
const LEADERSHIP_KEYWORDS = ['founder', 'lead', 'manager', 'director', 'chief', 'architect'];

function isLeadershipRole(roleOrTitle) {
  if (!roleOrTitle || typeof roleOrTitle !== 'string') return false;
  const lower = roleOrTitle.toLowerCase();
  return LEADERSHIP_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Style 3 — Classic Resume
 * A4 proportions: 794px wide × up to 1123px per page (96 dpi equivalent)
 * Two-column: 210px navy sidebar + main content
 * Max 2 pages enforced by capping total height at 2246px
 */

const A4_W = 794;
const A4_H = 1123;
const MAX_H = A4_H * 2; // hard cap at 2 pages

const NAVY   = '#1a2744';
const NAVY2  = '#243352';
const GOLD   = '#c9a84c';
const WHITE  = '#ffffff';
const LIGHT  = 'rgba(255,255,255,0.75)';
const DIM    = 'rgba(255,255,255,0.45)';
const BODY   = '#2c2c2c';
const MUTED  = '#555555';
const RULE   = '#d4d4d4';

// ── Sub-components ────────────────────────────────────────────────────────────

function SidebarSection({ title, children, onAdd, editable }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: `1px solid ${GOLD}40`, paddingBottom: 4 }}>
        <div style={{
          fontFamily: "'Georgia', serif",
          fontSize: 9, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: GOLD,
        }}>{title}</div>
        {editable && onAdd && <button onClick={onAdd} style={{ background: 'none', border: 'none', color: GOLD, cursor: 'pointer', padding: 0 }}><Plus size={10} /></button>}
      </div>
      {children}
    </div>
  );
}

function MainSection({ title, children, onAdd, editable }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: `2px solid ${NAVY}`, paddingBottom: 3 }}>
        <div style={{
          fontFamily: "'Georgia', serif",
          fontSize: 13, fontWeight: 700,
          color: NAVY, letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>{title}</div>
        {editable && onAdd && <button onClick={onAdd} style={{ background: 'none', border: 'none', color: NAVY, cursor: 'pointer', padding: 0 }}><Plus size={12} /></button>}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClassicPreview({ data, editable = false, onDataChange }) {
  if (!data) return null;

  const techSkills = data.technical_skills ?? data.skills ?? [];
  const softSkills = data.soft_skills ?? [];

  /** Deep-patch helper */
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
  const addEdu  = () => onDataChange && onDataChange({ ...data, education: [...(data.education || []), { institution: '', degree: '', year: '', gpa: '' }] });
  const removeExp  = i => onDataChange && onDataChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });
  const removeProj = i => onDataChange && onDataChange({ ...data, projects: data.projects.filter((_, j) => j !== i) });
  const removeEdu  = i => onDataChange && onDataChange({ ...data, education: data.education.filter((_, j) => j !== i) });

  return (
    <div
      id="blueprint-preview"
      style={{
        width: A4_W,
        maxHeight: editable ? 'none' : MAX_H,
        overflow: editable ? 'visible' : 'hidden', // enforces 2-page cap
        display: 'grid',
        gridTemplateColumns: '210px 1fr',
        background: WHITE,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: BODY,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        position: 'relative'
      }}
    >
      {/* ══════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════ */}
      <aside style={{
        background: NAVY,
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: A4_H,
      }}>

        {/* Name + title block */}
        <div style={{ marginBottom: 20 }}>
          <E tag="div" style={{
            fontFamily: "'Georgia', serif",
            fontSize: 18, fontWeight: 700,
            color: WHITE, lineHeight: 1.25,
            marginBottom: 6,
          }} value={data.name} onChange={v => patch('name', v)} editable={editable} />
          <div style={{
            width: 32, height: 2,
            background: GOLD, marginBottom: 8,
          }} />
          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ContactLine icon="✉" value={data.email} onChange={v => patch('email', v)} editable={editable} placeholder="Email" />
            <ContactLine icon="☎" value={data.phone} onChange={v => patch('phone', v)} editable={editable} placeholder="Phone" />
            <ContactLine icon="⌖" value={data.address} onChange={v => patch('address', v)} editable={editable} placeholder="Location" />
            <ContactLine icon="in" value={data.linkedin} onChange={v => patch('linkedin', v)} editable={editable} placeholder="LinkedIn URL" />
            <ContactLine icon="gh" value={data.github} onChange={v => patch('github', v)} editable={editable} placeholder="GitHub URL" />
          </div>
        </div>

        {/* Technical Skills */}
        <SidebarSection title="Technical Skills" editable={editable} onAdd={() => patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', [...techSkills, ''])}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {techSkills.map((sk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, position: 'relative' }}>
                <span style={{ color: GOLD, fontSize: 8, marginTop: 3, flexShrink: 0 }}>◆</span>
                <E style={{ fontFamily: "'Georgia', serif", fontSize: 11, color: LIGHT, lineHeight: 1.4, flex: 1 }} value={sk} onChange={v => {
                  const s2 = [...techSkills]; s2[i] = v; patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', s2);
                }} editable={editable} />
                {editable && <button onClick={() => patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', techSkills.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}><Trash2 size={10} /></button>}
              </div>
            ))}
          </div>
        </SidebarSection>

        {/* Soft Skills */}
        <SidebarSection title="Soft Skills" editable={editable} onAdd={() => patch('soft_skills', [...softSkills, ''])}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {softSkills.map((sk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{ color: GOLD, fontSize: 8, marginTop: 3, flexShrink: 0 }}>◇</span>
                <E style={{ fontFamily: "'Georgia', serif", fontSize: 11, color: LIGHT, lineHeight: 1.4, flex: 1 }} value={sk} onChange={v => {
                  const s2 = [...softSkills]; s2[i] = v; patch('soft_skills', s2);
                }} editable={editable} />
                {editable && <button onClick={() => patch('soft_skills', softSkills.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}><Trash2 size={10} /></button>}
              </div>
            ))}
          </div>
        </SidebarSection>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main style={{ padding: '32px 28px', overflow: 'hidden' }}>

        {/* Summary */}
        <MainSection title="Profile">
          <E tag="p" style={{
            fontFamily: "'Georgia', serif",
            fontSize: 11.5, lineHeight: 1.7,
            color: MUTED, margin: 0,
          }} value={data.summary} onChange={v => patch('summary', v)} editable={editable} />
        </MainSection>

        {/* Experience */}
        <MainSection title="Experience" editable={editable} onAdd={addExp}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(data.experience || []).map((exp, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {editable && <button onClick={() => removeExp(i)} style={{ position: 'absolute', right: -20, top: 0, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', marginBottom: 1,
                }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: 13, fontWeight: 700, color: NAVY }}>
                    {isLeadershipRole(exp.role) ? (
                      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: GOLD, background: 'rgba(201,168,76,0.12)', border: '1px solid GOLD', padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 8 }}>
                        LEADERSHIP
                      </span>
                    ) : null}
                    <E style={{ fontSize: 13, fontWeight: 700, color: NAVY }} value={exp.role} onChange={v => patch(`experience.${i}.role`, v)} editable={editable} />
                  </span>
                  <E style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9.5, color: '#888888', whiteSpace: 'nowrap',
                  }} value={exp.duration} onChange={v => patch(`experience.${i}.duration`, v)} editable={editable} />
                </div>
                <E tag="div" style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: 11, color: GOLD,
                  fontStyle: 'italic', marginBottom: 5,
                }} value={exp.company} onChange={v => patch(`experience.${i}.company`, v)} editable={editable} />
                <ul style={{ margin: 0, paddingLeft: 14 }}>
                  {exp.highlights.map((h, j) => (
                    <li key={j} style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: 11, color: BODY,
                      lineHeight: 1.6, marginBottom: 2,
                    }}>
                      <E value={h} onChange={v => {
                        const h2 = [...exp.highlights]; h2[j] = v; patch(`experience.${i}.highlights`, h2);
                      }} editable={editable} />
                      {editable && <button onClick={() => patch(`experience.${i}.highlights`, exp.highlights.filter((_, k) => k !== j))} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}><Trash2 size={10} /></button>}
                    </li>
                  ))}
                  {editable && <button onClick={() => patch(`experience.${i}.highlights`, [...exp.highlights, ''])} style={{ background: 'none', border: 'none', color: NAVY, cursor: 'pointer', fontFamily: "'Georgia', serif", fontSize: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={10} /> Add Bullet</button>}
                </ul>
                {i < data.experience.length - 1 && (
                  <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 12 }} />
                )}
              </div>
            ))}
          </div>
        </MainSection>

        {/* Projects */}
        <MainSection title="Projects" editable={editable} onAdd={addProj}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.projects || []).map((proj, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {editable && <button onClick={() => removeProj(i)} style={{ position: 'absolute', right: -20, top: 0, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: 12, fontWeight: 700, color: NAVY }}>
                    {isLeadershipRole(proj.title) ? (
                      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: GOLD, background: 'rgba(201,168,76,0.12)', border: '1px solid GOLD', padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 8 }}>
                        LEADERSHIP
                      </span>
                    ) : null}
                    <E value={proj.title} onChange={v => patch(`projects.${i}.title`, v)} editable={editable} />
                  </span>
                </div>
                <E tag="p" style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: 11, color: MUTED,
                  lineHeight: 1.6, margin: '0 0 4px',
                }} value={proj.description} onChange={v => patch(`projects.${i}.description`, v)} editable={editable} />
                {/* Technologies as plain text — no floating badge row */}
                {editable ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 5px' }}>
                    {(proj.technologies || []).map((t, j) => (
                      <span key={j} style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 9, border: `1px solid ${RULE}`,
                        padding: '1px 6px', color: MUTED, display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <E value={t} onChange={v => {
                          const t2 = [...proj.technologies]; t2[j] = v; patch(`projects.${i}.technologies`, t2);
                        }} editable={editable} />
                        {editable && <button onClick={() => patch(`projects.${i}.technologies`, proj.technologies.filter((_, k) => k !== j))} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}><Trash2 size={8} /></button>}
                      </span>
                    ))}
                    {editable && <button onClick={() => patch(`projects.${i}.technologies`, [...proj.technologies, ''])} style={{ background: 'none', border: 'none', color: NAVY, cursor: 'pointer', fontFamily: "'Georgia', serif", fontSize: 9 }}><Plus size={10} /></button>}
                  </div>
                ) : (
                  proj.technologies?.length > 0 && (
                    <p style={{ fontFamily: "'Courier New', monospace", fontSize: 9.5, color: MUTED, margin: '2px 0 0', lineHeight: 1.5 }}>
                      {proj.technologies.filter(Boolean).join(' | ')}
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        </MainSection>

        {/* Education */}
        <MainSection title="Education" editable={editable} onAdd={addEdu}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.education || []).map((edu, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {editable && <button onClick={() => removeEdu(i)} style={{ position: 'absolute', right: -20, top: 0, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <E style={{ fontFamily: "'Georgia', serif", fontSize: 12, fontWeight: 700, color: BODY }} value={edu.degree} onChange={v => patch(`education.${i}.degree`, v)} editable={editable} />
                  <E style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: '#888888' }} value={edu.year} onChange={v => patch(`education.${i}.year`, v)} editable={editable} />
                </div>
                <E tag="div" style={{ fontFamily: "'Georgia', serif", fontSize: 11, color: MUTED }} value={edu.institution} onChange={v => patch(`education.${i}.institution`, v)} editable={editable} />
                {edu.gpa && <E tag="div" style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: '#888888', marginTop: 2 }} value={`CGPA: ${edu.gpa}`} onChange={v => patch(`education.${i}.gpa`, v)} editable={editable} />}
              </div>
            ))}
          </div>
        </MainSection>
      </main>
    </div>
  );
}

function ContactLine({ icon, value, onChange, editable, placeholder }) {
  if (!value && !editable) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: GOLD, width: 14, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <E style={{ fontFamily: "'Georgia', serif", fontSize: 10.5, color: LIGHT, wordBreak: 'break-all', lineHeight: 1.3 }} value={value} onChange={onChange} editable={editable} placeholder={placeholder} />
    </div>
  );
}
