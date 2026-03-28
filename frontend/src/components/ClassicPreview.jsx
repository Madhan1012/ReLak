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

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "'Georgia', serif",
        fontSize: 9, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: GOLD, marginBottom: 8,
        borderBottom: `1px solid ${GOLD}40`,
        paddingBottom: 4,
      }}>{title}</div>
      {children}
    </div>
  );
}

function MainSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: "'Georgia', serif",
        fontSize: 13, fontWeight: 700,
        color: NAVY, marginBottom: 8,
        borderBottom: `2px solid ${NAVY}`,
        paddingBottom: 3, letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}>{title}</div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClassicPreview({ data }) {
  if (!data) return null;

  const hasPhoto = !!data.photo_url;

  return (
    <div
      id="blueprint-preview"
      style={{
        width: A4_W,
        maxHeight: MAX_H,
        overflow: 'hidden',          // enforces 2-page cap
        display: 'grid',
        gridTemplateColumns: '210px 1fr',
        background: WHITE,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: BODY,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
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

        {/* Photo — only if present in resume */}
        {hasPhoto && (
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <img
              src={data.photo_url}
              alt={data.name}
              style={{
                width: 90, height: 90,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${GOLD}`,
              }}
            />
          </div>
        )}

        {/* Name + title block */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Georgia', serif",
            fontSize: 18, fontWeight: 700,
            color: WHITE, lineHeight: 1.25,
            marginBottom: 6,
          }}>{data.name}</div>
          <div style={{
            width: 32, height: 2,
            background: GOLD, marginBottom: 8,
          }} />
          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ContactLine icon="✉" value={data.email} />
            {data.phone  && <ContactLine icon="☎" value={data.phone} />}
            {data.address && <ContactLine icon="⌖" value={data.address} />}
          </div>
        </div>

        {/* Skills */}
        {data.skills?.length > 0 && (
          <SidebarSection title="Skills">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {data.skills.map((sk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <span style={{ color: GOLD, fontSize: 8, marginTop: 3, flexShrink: 0 }}>◆</span>
                  <span style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: 11, color: LIGHT, lineHeight: 1.4,
                  }}>{sk}</span>
                </div>
              ))}
            </div>
          </SidebarSection>
        )}

        {/* Technologies */}
        {data.tech_stack_icons?.length > 0 && (
          <SidebarSection title="Technologies">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px' }}>
              {data.tech_stack_icons.map((t, i) => (
                <span key={i} style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 9, color: DIM,
                  background: 'rgba(255,255,255,0.07)',
                  padding: '2px 6px',
                  textTransform: 'capitalize',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>{t.replace(/-/g, ' ')}</span>
              ))}
            </div>
          </SidebarSection>
        )}
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main style={{ padding: '32px 28px', overflow: 'hidden' }}>

        {/* Summary */}
        {data.summary && (
          <MainSection title="Profile">
            <p style={{
              fontFamily: "'Georgia', serif",
              fontSize: 11.5, lineHeight: 1.7,
              color: MUTED, margin: 0,
            }}>{data.summary}</p>
          </MainSection>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <MainSection title="Experience">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: 1,
                  }}>
                    <span style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: 13, fontWeight: 700, color: NAVY,
                    }}>{exp.role}</span>
                    <span style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: 9.5, color: '#888888', whiteSpace: 'nowrap',
                    }}>{exp.duration}</span>
                  </div>
                  <div style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: 11, color: GOLD,
                    fontStyle: 'italic', marginBottom: 5,
                  }}>{exp.company}</div>
                  <ul style={{ margin: 0, paddingLeft: 14 }}>
                    {exp.highlights.map((h, j) => (
                      <li key={j} style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: 11, color: BODY,
                        lineHeight: 1.6, marginBottom: 2,
                      }}>{h}</li>
                    ))}
                  </ul>
                  {i < data.experience.length - 1 && (
                    <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 12 }} />
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <MainSection title="Projects">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: 12, fontWeight: 700,
                    color: NAVY, marginBottom: 2,
                  }}>{proj.title}</div>
                  <p style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: 11, color: MUTED,
                    lineHeight: 1.6, margin: '0 0 4px',
                  }}>{proj.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 5px' }}>
                    {proj.technologies.map((t, j) => (
                      <span key={j} style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 9, border: `1px solid ${RULE}`,
                        padding: '1px 6px', color: MUTED,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <MainSection title="Education">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.education.map((edu, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: 12, fontWeight: 700, color: NAVY,
                    }}>{edu.degree}</div>
                    <div style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: 11, color: MUTED, fontStyle: 'italic',
                    }}>{edu.institution}</div>
                  </div>
                  <span style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9.5, color: '#888888',
                    whiteSpace: 'nowrap', marginLeft: 8,
                  }}>{edu.year}</span>
                </div>
              ))}
            </div>
          </MainSection>
        )}

      </main>
    </div>
  );
}

function ContactLine({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <span style={{ fontSize: 9, color: GOLD, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 9.5, color: DIM,
        lineHeight: 1.4, wordBreak: 'break-all',
      }}>{value}</span>
    </div>
  );
}
