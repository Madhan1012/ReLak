import { E, LinkBadge, EditableChips } from './PreviewComponents';
import { Plus, Trash2 } from 'lucide-react';

// Leadership keywords for dynamic badge detection
const LEADERSHIP_KEYWORDS = ['founder', 'lead', 'manager', 'director', 'chief', 'architect'];

function isLeadershipRole(roleOrTitle) {
  if (!roleOrTitle || typeof roleOrTitle !== 'string') return false;
  const lower = roleOrTitle.toLowerCase();
  return LEADERSHIP_KEYWORDS.some(kw => lower.includes(kw));
}

/** Style 1 — ATS Friendly: single-column, no graphics, pure black on white */
export default function ATSPreview({ data, editable = false, onDataChange }) {
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
  const addEdu  = () => onDataChange && onDataChange({ ...data, education: [...(data.education || []), { institution: '', degree: '', year: '' }] });
  const removeExp  = i => onDataChange && onDataChange({ ...data, experience: data.experience.filter((_, j) => j !== i) });
  const removeProj = i => onDataChange && onDataChange({ ...data, projects: data.projects.filter((_, j) => j !== i) });
  const removeEdu  = i => onDataChange && onDataChange({ ...data, education: data.education.filter((_, j) => j !== i) });

  const s = {
    wrap: { background: '#ffffff', padding: '40px 48px', fontFamily: "'Inter', sans-serif", color: '#111111', maxWidth: 800, margin: '0 auto', position: 'relative' },
    name: { fontSize: 28, fontWeight: 700, color: '#000000', letterSpacing: '-0.5px', marginBottom: 4 },
    contact: { fontSize: 12, color: '#444444', marginBottom: 4, display: 'flex', flexWrap: 'wrap', gap: '0 8px' },
    rule: { borderTop: '2px solid #000000', margin: '16px 0' },
    thinRule: { borderTop: '1px solid #cccccc', margin: '12px 0' },
    sectionTitle: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000000', marginBottom: 10 },
    summary: { fontSize: 13, lineHeight: 1.65, color: '#333333', marginBottom: 20 },
    role: { fontSize: 14, fontWeight: 700, color: '#000000' },
    company: { fontSize: 13, color: '#333333' },
    duration: { fontSize: 12, color: '#666666' },
    bullet: { fontSize: 13, color: '#333333', lineHeight: 1.6 },
    chip: { display: 'inline-block', fontSize: 11, border: '1px solid #cccccc', padding: '2px 8px', marginRight: 6, marginBottom: 6, color: '#333333' },
    projTitle: { fontSize: 13, fontWeight: 700, color: '#000000' },
    projDesc: { fontSize: 12, color: '#444444', lineHeight: 1.6 },
    link: { fontSize: 11, color: '#003366', textDecoration: 'none' },
    addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'none', border: '1px dashed #ccc', color: '#666', fontFamily: "'Inter', sans-serif", fontSize: 11, cursor: 'pointer', borderRadius: 2, marginTop: 10 },
  };

  return (
    <div id="blueprint-preview" style={s.wrap}>
      {/* Header */}
      <E tag="div" style={s.name} value={data.name} onChange={v => patch('name', v)} editable={editable} />
      <div style={s.contact}>
        <E value={data.email} onChange={v => patch('email', v)} editable={editable} />
        { (data.phone || editable) && <span> · </span> }
        <E value={data.phone} onChange={v => patch('phone', v)} editable={editable} placeholder="Phone" />
        { (data.address || editable) && <span> · </span> }
        <E value={data.address} onChange={v => patch('address', v)} editable={editable} placeholder="Location" />
      </div>
      <div style={{ ...s.contact, marginBottom: 0 }}>
        <E value={data.linkedin} onChange={v => patch('linkedin', v)} editable={editable} placeholder="LinkedIn URL" />
        { (data.linkedin && data.github) && <span> · </span> }
        <E value={data.github} onChange={v => patch('github', v)} editable={editable} placeholder="GitHub URL" />
      </div>
      <div style={s.rule} />

      {/* Summary */}
      <div style={s.sectionTitle}>Professional Summary</div>
      <E tag="p" style={s.summary} value={data.summary} onChange={v => patch('summary', v)} editable={editable} />

      {/* Technical Skills */}
      <div style={{ marginBottom: 20 }}>
        <div style={s.sectionTitle}>Technical Skills</div>
        <EditableChips items={techSkills} onChange={v => patch(data.technical_skills !== undefined ? 'technical_skills' : 'skills', v)} editable={editable} chipClass="ats-chip" />
      </div>

      {/* Soft Skills */}
      <div style={{ marginBottom: 20 }}>
        <div style={s.sectionTitle}>Soft Skills</div>
        <EditableChips items={softSkills} onChange={v => patch('soft_skills', v)} editable={editable} chipClass="ats-chip" />
      </div>

      {/* Experience */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={s.sectionTitle}>Experience</div>
          {editable && <button onClick={addExp} style={s.addBtn}><Plus size={12} /> Add Experience</button>}
        </div>
        {(data.experience || []).map((exp, i) => (
          <div key={i} style={{ marginBottom: 14, position: 'relative' }}>
            {editable && <button onClick={() => removeExp(i)} style={{ position: 'absolute', right: -30, top: 0, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
                {isLeadershipRole(exp.role) ? (
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid #c9a84c', padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 8 }}>
                    LEADERSHIP
                  </span>
                ) : null}
                <E style={s.role} value={exp.role} onChange={v => patch(`experience.${i}.role`, v)} editable={editable} />
              </span>
              <E style={s.duration} value={exp.duration} onChange={v => patch(`experience.${i}.duration`, v)} editable={editable} />
            </div>
            <E tag="div" style={s.company} value={exp.company} onChange={v => patch(`experience.${i}.company`, v)} editable={editable} />
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              {exp.highlights.map((h, j) => (
                <li key={j} style={s.bullet}>
                  <E value={h} onChange={v => {
                    const h2 = [...exp.highlights];
                    h2[j] = v;
                    patch(`experience.${i}.highlights`, h2);
                  }} editable={editable} />
                  {editable && <button onClick={() => {
                    patch(`experience.${i}.highlights`, exp.highlights.filter((_, k) => k !== j));
                  }} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}><Trash2 size={10} /></button>}
                </li>
              ))}
              {editable && <button onClick={() => patch(`experience.${i}.highlights`, [...exp.highlights, ''])} style={{ ...s.addBtn, padding: '2px 8px', fontSize: 10 }}><Plus size={10} /> Add Bullet</button>}
            </ul>
            {i < data.experience.length - 1 && <div style={s.thinRule} />}
          </div>
        ))}
      </div>

      {/* Projects */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={s.sectionTitle}>Projects</div>
          {editable && <button onClick={addProj} style={s.addBtn}><Plus size={12} /> Add Project</button>}
        </div>
        {(data.projects || []).map((proj, i) => (
          <div key={i} style={{ marginBottom: 12, position: 'relative' }}>
            {editable && <button onClick={() => removeProj(i)} style={{ position: 'absolute', right: -30, top: 0, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#000000' }}>
                {isLeadershipRole(proj.title) ? (
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid #c9a84c', padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 8 }}>
                    LEADERSHIP
                  </span>
                ) : null}
                <E style={s.projTitle} value={proj.title} onChange={v => patch(`projects.${i}.title`, v)} editable={editable} />
              </span>
              <LinkBadge href={proj.link} onEdit={v => patch(`projects.${i}.link`, v)} editable={editable} />
            </div>
            <E tag="p" style={{ ...s.projDesc, margin: '4px 0' }} value={proj.description} onChange={v => patch(`projects.${i}.description`, v)} editable={editable} />
            <EditableChips items={proj.technologies || []} onChange={v => patch(`projects.${i}.technologies`, v)} editable={editable} chipClass="ats-chip" />
            {i < data.projects.length - 1 && <div style={s.thinRule} />}
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={s.sectionTitle}>Education</div>
          {editable && <button onClick={addEdu} style={s.addBtn}><Plus size={12} /> Add Education</button>}
        </div>
        {(data.education || []).map((edu, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, position: 'relative' }}>
            {editable && <button onClick={() => removeEdu(i)} style={{ position: 'absolute', right: -30, top: 0, background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={14} /></button>}
            <div>
              <E style={s.role} value={edu.degree} onChange={v => patch(`education.${i}.degree`, v)} editable={editable} />
              <E tag="div" style={s.company} value={edu.institution} onChange={v => patch(`education.${i}.institution`, v)} editable={editable} />
            </div>
            <E style={s.duration} value={edu.year} onChange={v => patch(`education.${i}.year`, v)} editable={editable} />
          </div>
        ))}
      </div>
    </div>
  );
}
