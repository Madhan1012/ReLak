import { Mail } from 'lucide-react';
import LucideIcon from './LucideIcon';

function SectionHeader({ index, title }) {
  return (
    <div className="section-header">
      <span className="section-index">[ {String(index).padStart(2, '0')} ]</span>
      <h2 className="section-title">{title}</h2>
      <div className="section-rule" />
    </div>
  );
}

function SkillChip({ label }) {
  return <span className="skill-chip">{label}</span>;
}

export default function BlueprintPreview({ data }) {
  if (!data) return null;

  return (
    <div id="blueprint-preview" className="bp-card">

      {/* ── Identity ── */}
      <header style={{ marginBottom: 48 }}>
        <span className="identity-tag">[ 01_IDENTITY ]</span>
        <h1 className="identity-name">{data.name}</h1>
        <div className="identity-rule" />
        <p className="identity-summary">{data.summary}</p>
        <div className="identity-email">
          <Mail size={13} color="#737780" />
          <span>{data.email}</span>
        </div>
      </header>

      {/* ── Tech Stack Icons ── */}
      {data.tech_stack_icons?.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader index={2} title="Technical_Engine" />
          <div className="tech-grid">
            {data.tech_stack_icons.map((icon, i) => (
              <div key={i} className="tech-cell">
                <LucideIcon name={icon} size={18} color="#003366" />
                <span className="tech-cell-label">{icon.replace(/-/g, ' ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills ── */}
      {data.skills?.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <SectionHeader index={3} title="Skills_Matrix" />
          <div className="skills-wrap">
            {data.skills.map((s, i) => <SkillChip key={i} label={s} />)}
          </div>
        </section>
      )}

      {/* ── Experience ── */}
      {data.experience?.length > 0 && (
        <section id="experience" style={{ marginBottom: 48 }}>
          <SectionHeader index={4} title="Experience_Log" />
          <div className="exp-list">
            {data.experience.map((exp, i) => (
              <div key={i} className="exp-row">
                <div className="exp-meta">
                  <span className="exp-duration">{exp.duration}</span>
                  <div className="exp-active">
                    <span className="exp-active-dot" />
                    <span className="exp-active-label">Active</span>
                  </div>
                </div>
                <div className={`exp-card ${i === 0 ? 'primary' : 'secondary'}`}>
                  <div className="exp-card-top">
                    <div>
                      <div className="exp-role">{exp.role}</div>
                      <div className="exp-company">{exp.company}</div>
                    </div>
                    <span className="exp-ref">[ REF: EX-{String(i + 1).padStart(3, '0')} ]</span>
                  </div>
                  <ul className="exp-highlights">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="exp-highlight">
                        <span className="exp-arrow">→</span>
                        <span className="exp-highlight-text">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Projects ── */}
      {data.projects?.length > 0 && (
        <section id="projects" style={{ marginBottom: 48 }}>
          <SectionHeader index={5} title="Project_Schematics" />
          <div className="proj-grid">
            {data.projects.map((proj, i) => (
              <div key={i} className="proj-card">
                <span className="proj-id">PROJ_{String(i + 1).padStart(3, '0')}</span>
                <div className="proj-title">{proj.title}</div>
                <p className="proj-desc">{proj.description}</p>
                <div className="proj-chips">
                  {proj.technologies.map((t, j) => <SkillChip key={j} label={t} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ── */}
      {data.education?.length > 0 && (
        <section id="education">
          <SectionHeader index={6} title="Education" />
          <div className="edu-list">
            {data.education.map((edu, i) => (
              <div key={i} className="edu-row">
                <div>
                  <div className="edu-degree">{edu.degree}</div>
                  <div className="edu-institution">{edu.institution}</div>
                </div>
                <span className="edu-year">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
