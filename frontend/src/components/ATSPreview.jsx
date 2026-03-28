/** Style 1 — ATS Friendly: single-column, no graphics, pure black on white */
export default function ATSPreview({ data }) {
  if (!data) return null;

  const s = {
    wrap: {
      background: '#ffffff', padding: '40px 48px',
      fontFamily: "'Inter', sans-serif", color: '#111111',
      maxWidth: 800, margin: '0 auto',
    },
    name: {
      fontSize: 28, fontWeight: 700, color: '#000000',
      letterSpacing: '-0.5px', marginBottom: 4,
    },
    contact: { fontSize: 12, color: '#444444', marginBottom: 20 },
    rule: { borderTop: '2px solid #000000', margin: '16px 0' },
    thinRule: { borderTop: '1px solid #cccccc', margin: '12px 0' },
    sectionTitle: {
      fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: '#000000',
      marginBottom: 10,
    },
    summary: { fontSize: 13, lineHeight: 1.65, color: '#333333', marginBottom: 20 },
    role: { fontSize: 14, fontWeight: 700, color: '#000000' },
    company: { fontSize: 13, color: '#333333' },
    duration: { fontSize: 12, color: '#666666' },
    bullet: { fontSize: 13, color: '#333333', lineHeight: 1.6, marginLeft: 16 },
    chip: {
      display: 'inline-block', fontSize: 11,
      border: '1px solid #cccccc', padding: '2px 8px',
      marginRight: 6, marginBottom: 6, color: '#333333',
    },
    projTitle: { fontSize: 13, fontWeight: 700, color: '#000000' },
    projDesc: { fontSize: 12, color: '#444444', lineHeight: 1.6 },
  };

  return (
    <div id="blueprint-preview" style={s.wrap}>
      {/* Header */}
      <div style={s.name}>{data.name}</div>
      <div style={s.contact}>{data.email}</div>
      <div style={s.rule} />

      {/* Summary */}
      <div style={s.sectionTitle}>Professional Summary</div>
      <p style={s.summary}>{data.summary}</p>

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Skills</div>
          <div>{data.skills.map((sk, i) => <span key={i} style={s.chip}>{sk}</span>)}</div>
        </div>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={s.role}>{exp.role}</span>
                <span style={s.duration}>{exp.duration}</span>
              </div>
              <div style={s.company}>{exp.company}</div>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {exp.highlights.map((h, j) => (
                  <li key={j} style={s.bullet}>{h}</li>
                ))}
              </ul>
              {i < data.experience.length - 1 && <div style={s.thinRule} />}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Projects</div>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={s.projTitle}>{proj.title}</div>
              <p style={s.projDesc}>{proj.description}</p>
              <div>{proj.technologies.map((t, j) => <span key={j} style={s.chip}>{t}</span>)}</div>
              {i < data.projects.length - 1 && <div style={s.thinRule} />}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Education</div>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={s.role}>{edu.degree}</div>
                <div style={s.company}>{edu.institution}</div>
              </div>
              <div style={s.duration}>{edu.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
