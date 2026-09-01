import { E } from './PreviewComponents';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Style 4 — Professional (DOCX-Mirror)
 *
 * Strict single-column layout modelled on the reference DOCX template:
 *   - Full-width text, no sidebars, no grids, no floating blocks
 *   - Skills: comma-separated plain text on one continuous line
 *   - Projects: bold title + description paragraph; technologies woven into
 *     the narrative (no standalone tech rows beneath descriptions)
 *   - Education: degree (bold) + year (italic) on one row, CGPA inline
 *   - Section headings: small-caps, bottom border rule
 *   - Page-break-inside: avoid on all block nodes
 *
 * Font stack mirrors the DOCX: Calibri body, Georgia fallback for print.
 */

const FONT_BODY   = "'Calibri', 'Georgia', 'Times New Roman', serif";
const FONT_MONO   = "'Courier New', Courier, monospace";
const COLOR_NAME  = '#000000';
const COLOR_BODY  = '#1a1a1a';
const COLOR_DIM   = '#555555';
const COLOR_LINK  = '#003366';
const COLOR_RULE  = '#c0c0c0';
const A4_W        = 794;

// ── Tiny sub-components ───────────────────────────────────────────────────────

function SectionHeading({ title, editable, onAdd, addLabel }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: `2px solid ${COLOR_RULE}`, paddingBottom: 3, marginBottom: 10, marginTop: 18,
    }}>
      <h2 style={{
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: COLOR_BODY, margin: 0,
      }}>{title}</h2>
      {editable && onAdd && (
        <button onClick={onAdd} style={{ background: 'none', border: '1px dashed #aaa', padding: '2px 8px', cursor: 'pointer', fontFamily: FONT_MONO, fontSize: 10, color: COLOR_LINK, borderRadius: 2 }}>
          <Plus size={10} style={{ marginRight: 4 }} />{addLabel || 'Add'}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfessionalPreview({ data, editable = false, onDataChange }) {
  if (!data) return null;

  const techSkills = data.technical_skills ?? data.skills ?? [];
  const softSkills = data.soft_skills ?? [];

  const patch = (path, value) => {
    if (!onDataChange) return;
    const parts = path.split('.');
    const next = JSON.parse(JSON.stringify(data));
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
    onDataChange(next);
  };

  const addExp  = () => onDataChange && onDataChange({ ...data, experience: [...(data.experience || []), { company: '', role: '', duration: '', highlights: [''] }] });
  const addProj = () => onDataChange && onDataChange({ ...data, projects:   [...(data.projects   || []), { title: '', description: '', technologies: [], link: null }] });
  const addEdu  = () => onDataChange && onDataChange({ ...data, education:  [...(data.education  || []), { institution: '', degree: '', year: '', gpa: '' }] });

  const removeExp  = i => onDataChange && onDataChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });
  const removeProj = i => onDataChange && onDataChange({ ...data, projects:   data.projects.filter(  (_, j) => j !== i) });
  const removeEdu  = i => onDataChange && onDataChange({ ...data, education:  data.education.filter( (_, j) => j !== i) });

  const bodyStyle = { fontFamily: FONT_BODY, fontSize: 11, color: COLOR_BODY, lineHeight: 1.45, margin: 0 };

  return (
    <div
      id="blueprint-preview"
      style={{
        background: '#ffffff',
        width: A4_W,
        margin: '0 auto',
        padding: '48px 64px',
        fontFamily: FONT_BODY,
        color: COLOR_BODY,
        fontSize: 11,
        lineHeight: 1.45,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* ── NAME ── */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <E
          tag="div"
          value={data.name}
          onChange={v => patch('name', v)}
          editable={editable}
          style={{ fontFamily: FONT_BODY, fontSize: 22, fontWeight: 700, color: COLOR_NAME, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        />
      </div>

      {/* ── CONTACT LINE ── */}
      <div style={{ textAlign: 'center', marginBottom: 2 }}>
        {editable ? (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 8px' }}>
            {[['email','Email'],['phone','Phone'],['address','Location'],['linkedin','LinkedIn'],['github','GitHub']].map(([k, lbl]) => (
              <span key={k} style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_DIM }}>
                <E value={data[k] || ''} onChange={v => patch(k, v || null)} editable={editable} placeholder={lbl}
                  style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_DIM }} />
                <span style={{ color: COLOR_RULE, margin: '0 4px' }}>|</span>
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_DIM }}>
            {[data.email, data.phone, data.address, data.linkedin, data.github].filter(Boolean).join(' | ')}
          </span>
        )}
      </div>

      {/* thin rule under header */}
      <div style={{ borderTop: `1px solid ${COLOR_RULE}`, margin: '10px 0 2px' }} />

      {/* ── PROFESSIONAL SUMMARY ── */}
      {(data.summary || editable) && (
        <div>
          <SectionHeading title="Professional Summary" />
          <E
            tag="p"
            value={data.summary}
            onChange={v => patch('summary', v)}
            editable={editable}
            style={{ ...bodyStyle, marginBottom: 0 }}
          />
        </div>
      )}

      {/* ── TECHNICAL SKILLS ── */}
      {(techSkills.length > 0 || editable) && (
        <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <SectionHeading title="Technical Skills" />
          {editable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {techSkills.map((sk, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input value={sk} onChange={e => { const s2 = [...techSkills]; s2[i] = e.target.value; patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', s2); }}
                    style={{ fontFamily: FONT_MONO, fontSize: 10, padding: '2px 6px', border: '1px solid #ccc', background: '#fafafa', flex: 1, outline: 'none', borderRadius: 2 }} />
                  <button onClick={() => patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', techSkills.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={11} /></button>
                </div>
              ))}
              <button onClick={() => patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', [...techSkills, ''])}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px dashed #aaa', padding: '3px 8px', cursor: 'pointer', fontFamily: FONT_MONO, fontSize: 10, color: COLOR_LINK, borderRadius: 2, width: 'fit-content', marginTop: 2 }}>
                <Plus size={10} /> Add Skill
              </button>
            </div>
          ) : (
            <p style={{ ...bodyStyle, fontFamily: FONT_MONO, fontSize: 10.5 }}>
              {techSkills.filter(Boolean).join(' , ')}
            </p>
          )}
        </div>
      )}

      {/* ── SOFT SKILLS ── */}
      {(softSkills.length > 0 || editable) && (
        <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <SectionHeading title="Soft Skills" />
          {editable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {softSkills.map((sk, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input value={sk} onChange={e => { const s2 = [...softSkills]; s2[i] = e.target.value; patch('soft_skills', s2); }}
                    style={{ fontFamily: FONT_MONO, fontSize: 10, padding: '2px 6px', border: '1px solid #ccc', background: '#fafafa', flex: 1, outline: 'none', borderRadius: 2 }} />
                  <button onClick={() => patch('soft_skills', softSkills.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={11} /></button>
                </div>
              ))}
              <button onClick={() => patch('soft_skills', [...softSkills, ''])}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px dashed #aaa', padding: '3px 8px', cursor: 'pointer', fontFamily: FONT_MONO, fontSize: 10, color: COLOR_LINK, borderRadius: 2, width: 'fit-content', marginTop: 2 }}>
                <Plus size={10} /> Add Skill
              </button>
            </div>
          ) : (
            <p style={{ ...bodyStyle, fontFamily: FONT_MONO, fontSize: 10.5 }}>
              {softSkills.filter(Boolean).join(' , ')}
            </p>
          )}
        </div>
      )}

      {/* ── EXPERIENCE ── */}
      {((data.experience?.filter(e => e.role || e.company).length > 0) || editable) && (
        <div>
          <SectionHeading title="Experience" editable={editable} onAdd={addExp} addLabel="Add Experience" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.experience || []).map((exp, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', position: 'relative' }}>
                {editable && (
                  <button onClick={() => removeExp(i)} style={{ position: 'absolute', right: -24, top: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={13} /></button>
                )}
                {/* Role - Company  (Duration) — all on one line like the DOCX */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                  <span>
                    <E value={exp.role} onChange={v => patch(`experience.${i}.role`, v)} editable={editable}
                      style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: COLOR_BODY }} />
                    {(exp.company || editable) && (
                      <>
                        <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR_LINK }}>{' \u2014 '}</span>
                        <E value={exp.company} onChange={v => patch(`experience.${i}.company`, v)} editable={editable}
                          style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR_LINK }} placeholder="Company" />
                      </>
                    )}
                  </span>
                  <E value={exp.duration} onChange={v => patch(`experience.${i}.duration`, v)} editable={editable}
                    style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: '#888888', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: 12 }} placeholder="Jan 2024 – Present" />
                </div>
                {/* Highlights as bullet list */}
                <ul style={{ margin: '0 0 0 0', paddingLeft: 16, listStyleType: 'disc' }}>
                  {(exp.highlights || []).map((h, j) => (
                    <li key={j} style={{ ...bodyStyle, marginBottom: 2, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <E value={h} onChange={v => { const hl = [...exp.highlights]; hl[j] = v; patch(`experience.${i}.highlights`, hl); }} editable={editable} />
                      {editable && (
                        <button onClick={() => patch(`experience.${i}.highlights`, exp.highlights.filter((_, k) => k !== j))}
                          style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', padding: 0 }}><Trash2 size={9} /></button>
                      )}
                    </li>
                  ))}
                </ul>
                {editable && (
                  <button onClick={() => patch(`experience.${i}.highlights`, [...(exp.highlights || []), ''])}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px dashed #aaa', padding: '2px 8px', cursor: 'pointer', fontFamily: FONT_MONO, fontSize: 9, color: COLOR_LINK, borderRadius: 2, marginTop: 4, width: 'fit-content' }}>
                    <Plus size={9} /> Add bullet
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {((data.projects?.filter(p => p.title).length > 0) || editable) && (
        <div>
          <SectionHeading title="Projects" editable={editable} onAdd={addProj} addLabel="Add Project" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.projects || []).map((proj, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', position: 'relative' }}>
                {editable && (
                  <button onClick={() => removeProj(i)} style={{ position: 'absolute', right: -24, top: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={13} /></button>
                )}
                {/* Title line */}
                <E value={proj.title} onChange={v => patch(`projects.${i}.title`, v)} editable={editable}
                  style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: COLOR_BODY, display: 'block', marginBottom: 2 }} />
                {/* Description paragraph — technologies should be woven in here */}
                <E tag="p" value={proj.description} onChange={v => patch(`projects.${i}.description`, v)} editable={editable}
                  style={{ ...bodyStyle, marginBottom: 0 }} />
                {/* In edit mode only: show technologies as a plain-text helper line */}
                {editable && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: '#999', marginBottom: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Technologies (for reference)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {(proj.technologies || []).map((t, j) => (
                        <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input value={t} onChange={e => { const t2 = [...proj.technologies]; t2[j] = e.target.value; patch(`projects.${i}.technologies`, t2); }}
                            style={{ fontFamily: FONT_MONO, fontSize: 10, padding: '2px 6px', border: '1px solid #ccc', background: '#fafafa', flex: 1, outline: 'none', borderRadius: 2 }} />
                          <button onClick={() => patch(`projects.${i}.technologies`, proj.technologies.filter((_, k) => k !== j))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={10} /></button>
                        </div>
                      ))}
                      <button onClick={() => patch(`projects.${i}.technologies`, [...(proj.technologies || []), ''])}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px dashed #aaa', padding: '2px 8px', cursor: 'pointer', fontFamily: FONT_MONO, fontSize: 9, color: COLOR_LINK, borderRadius: 2, width: 'fit-content' }}>
                        <Plus size={9} /> Add tech
                      </button>
                    </div>
                  </div>
                )}
                {/* Link — shown only when present */}
                {(!editable && proj.link) && (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: COLOR_LINK, display: 'block', marginTop: 2, wordBreak: 'break-all' }}>
                    {proj.link}
                  </a>
                )}
                {editable && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: '#999', marginRight: 6 }}>Link:</span>
                    <E value={proj.link || ''} onChange={v => patch(`projects.${i}.link`, v || null)} editable={editable}
                      style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: COLOR_LINK }} placeholder="https://github.com/..." />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EDUCATION ── */}
      {((data.education?.filter(e => e.degree || e.institution).length > 0) || editable) && (
        <div>
          <SectionHeading title="Education" editable={editable} onAdd={addEdu} addLabel="Add Education" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data.education || []).map((edu, i) => (
              <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', position: 'relative' }}>
                {editable && (
                  <button onClick={() => removeEdu(i)} style={{ position: 'absolute', right: -24, top: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={13} /></button>
                )}
                {/* Degree  (Year)     CGPA: x.xx — all on one line, mirroring the DOCX */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                  <span>
                    <E value={edu.degree} onChange={v => patch(`education.${i}.degree`, v)} editable={editable}
                      style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: COLOR_BODY }} />
                    {(edu.year || editable) && (
                      <>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: '#888888', marginLeft: 6 }}>(</span>
                        <E value={edu.year} onChange={v => patch(`education.${i}.year`, v)} editable={editable}
                          style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: '#888888', fontStyle: 'italic' }} placeholder="2021 – 2025" />
                        <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: '#888888' }}>)</span>
                      </>
                    )}
                  </span>
                  {/* CGPA on the right of the same row */}
                  {(edu.gpa || editable) && (
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_DIM }}>
                      CGPA: <E value={edu.gpa || ''} onChange={v => patch(`education.${i}.gpa`, v || null)} editable={editable}
                        style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR_DIM }} placeholder="8.84" />
                    </span>
                  )}
                </div>
                {/* Institution on next line */}
                <E tag="div" value={edu.institution} onChange={v => patch(`education.${i}.institution`, v)} editable={editable}
                  style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR_DIM, marginTop: 1 }} placeholder="University name" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
