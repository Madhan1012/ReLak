import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_BASE } from '../config';

const mono = "'JetBrains Mono', monospace";
const sans = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

const inp = {
  width: '100%', padding: '10px 12px',
  background: 'var(--input-bg)', border: '1px solid var(--border-solid)',
  fontFamily: inter, fontSize: 13, color: 'var(--text)',
  outline: 'none', borderRadius: 2, boxSizing: 'border-box',
};
const label = {
  fontFamily: mono, fontSize: 9, color: 'var(--text-dim)',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  display: 'block', marginBottom: 5,
};
const fieldWrap = { marginBottom: 16 };

function Field({ label: lbl, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={fieldWrap}>
      <label style={label}>{lbl}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inp} />
    </div>
  );
}
function TextArea({ label: lbl, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={fieldWrap}>
      <label style={label}>{lbl}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
    </div>
  );
}

function StepBar({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 3, background: i <= current ? 'var(--blue)' : 'var(--bg-high)', transition: 'background 0.3s' }} />
      ))}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '28px', marginBottom: 20 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: 'var(--blue)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label: lbl }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'none', border: '1px dashed var(--blue)', color: 'var(--blue)', fontFamily: mono, fontSize: 11, cursor: 'pointer', borderRadius: 2 }}>
      <Plus size={13} /> {lbl}
    </button>
  );
}
function RemoveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}>
      <Trash2 size={14} />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BuildPage({ onResult, serverStatus }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Form state
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', address: '', linkedin: '', github: '', summary: '' });
  const [techSkills, setTechSkills] = useState(['']);
  const [softSkills, setSoftSkills] = useState(['']);
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', highlights: [''] }]);
  const [projects, setProjects] = useState([{ title: '', description: '', technologies: [''], link: '' }]);
  const [education, setEducation] = useState([{ institution: '', degree: '', year: '', gpa: '' }]);

  const STEPS = ['Personal', 'Skills', 'Experience', 'Projects', 'Education'];

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updatePersonal = (k, v) => setPersonal(p => ({ ...p, [k]: v }));

  const listAdd    = (setter, blank) => setter(a => [...a, blank]);
  const listRemove = (setter, i)     => setter(a => a.filter((_, j) => j !== i));
  const listUpdate = (setter, i, v)  => setter(a => a.map((x, j) => j === i ? v : x));

  const expUpdate = (i, k, v) => setExperience(a => a.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const projUpdate = (i, k, v) => setProjects(a => a.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const eduUpdate  = (i, k, v) => setEducation(a => a.map((x, j) => j === i ? { ...x, [k]: v } : x));

  // ── Build final data object ───────────────────────────────────────────────
  const handleFinish = async () => {
    const data = {
      ...personal,
      technical_skills: techSkills.filter(Boolean),
      soft_skills: softSkills.filter(Boolean),
      experience: experience.map(e => ({ ...e, highlights: e.highlights.filter(Boolean) })),
      projects: projects.map(p => ({ ...p, technologies: p.technologies.filter(Boolean), link: p.link || null })),
      education: education.map(e => ({ ...e, gpa: e.gpa || null })),
    };
    // Generate a local slug and register it in the DB so payment/verify works
    const slug = `scratch-${personal.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    try {
      await fetch(`${API_BASE}/session/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, resume_data: data }),
      });
    } catch { /* non-critical — payment will still work in demo mode */ }
    onResult(data, slug);
    navigate('/result');
  };

  return (
    <div className="drafting-grid">
      <Navbar serverStatus={serverStatus} />
      <main className="main">
        <section style={{ padding: '40px 24px 80px', maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border-solid)', padding: '7px 14px', cursor: 'pointer', fontFamily: mono, fontSize: 11, color: 'var(--text-muted)', borderRadius: 2 }}>
              <ArrowLeft size={13} /> Back
            </button>
            <div>
              <div style={{ fontFamily: sans, fontSize: 22, fontWeight: 700, color: 'var(--blue-dark)', letterSpacing: '-0.3px' }}>Build from Scratch</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</div>
            </div>
          </div>

          <StepBar current={step} total={STEPS.length} />

          {/* ── Step 0: Personal ── */}
          {step === 0 && (
            <Card title="[ 01 ] Personal Details">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <Field label="Full Name *" value={personal.name} onChange={v => updatePersonal('name', v)} placeholder="Madhan Kumar" />
                <Field label="Email *" value={personal.email} onChange={v => updatePersonal('email', v)} placeholder="you@example.com" type="email" />
                <Field label="Phone" value={personal.phone} onChange={v => updatePersonal('phone', v)} placeholder="+91 98765 43210" />
                <Field label="Location" value={personal.address} onChange={v => updatePersonal('address', v)} placeholder="Chennai, Tamil Nadu" />
                <Field label="LinkedIn URL" value={personal.linkedin} onChange={v => updatePersonal('linkedin', v)} placeholder="linkedin.com/in/yourname" />
                <Field label="GitHub URL" value={personal.github} onChange={v => updatePersonal('github', v)} placeholder="github.com/yourname" />
              </div>
              <TextArea label="Professional Summary *" value={personal.summary} onChange={v => updatePersonal('summary', v)}
                placeholder="3-4 sentences about your background, expertise, and what you bring to the table." rows={4} />
            </Card>
          )}

          {/* ── Step 1: Skills ── */}
          {step === 1 && (
            <>
              <Card title="[ 02 ] Technical Skills">
                {techSkills.map((sk, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={sk} onChange={e => listUpdate(setTechSkills, i, e.target.value)}
                      placeholder="e.g. Python, React, PostgreSQL" style={{ ...inp, flex: 1 }} />
                    {techSkills.length > 1 && <RemoveBtn onClick={() => listRemove(setTechSkills, i)} />}
                  </div>
                ))}
                <AddBtn onClick={() => listAdd(setTechSkills, '')} label="Add Skill" />
              </Card>
              <Card title="[ 03 ] Soft Skills">
                {softSkills.map((sk, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={sk} onChange={e => listUpdate(setSoftSkills, i, e.target.value)}
                      placeholder="e.g. Team Leadership, Problem Solving" style={{ ...inp, flex: 1 }} />
                    {softSkills.length > 1 && <RemoveBtn onClick={() => listRemove(setSoftSkills, i)} />}
                  </div>
                ))}
                <AddBtn onClick={() => listAdd(setSoftSkills, '')} label="Add Skill" />
              </Card>
            </>
          )}

          {/* ── Step 2: Experience ── */}
          {step === 2 && (
            <>
              {experience.map((exp, i) => (
                <Card key={i} title={`[ EX-${String(i+1).padStart(2,'0')} ] Experience`}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    {experience.length > 1 && <RemoveBtn onClick={() => listRemove(setExperience, i)} />}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <Field label="Job Title *" value={exp.role} onChange={v => expUpdate(i, 'role', v)} placeholder="Software Engineer" />
                    <Field label="Company *" value={exp.company} onChange={v => expUpdate(i, 'company', v)} placeholder="Acme Corp" />
                    <Field label="Duration" value={exp.duration} onChange={v => expUpdate(i, 'duration', v)} placeholder="Jan 2022 — Present" />
                  </div>
                  <label style={label}>Highlights (one per line)</label>
                  {exp.highlights.map((h, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input value={h} onChange={e => expUpdate(i, 'highlights', exp.highlights.map((x, k) => k === j ? e.target.value : x))}
                        placeholder="Built X that achieved Y using Z" style={{ ...inp, flex: 1 }} />
                      {exp.highlights.length > 1 && <RemoveBtn onClick={() => expUpdate(i, 'highlights', exp.highlights.filter((_, k) => k !== j))} />}
                    </div>
                  ))}
                  <AddBtn onClick={() => expUpdate(i, 'highlights', [...exp.highlights, ''])} label="Add Bullet" />
                </Card>
              ))}
              <AddBtn onClick={() => listAdd(setExperience, { company: '', role: '', duration: '', highlights: [''] })} label="Add Experience" />
            </>
          )}

          {/* ── Step 3: Projects ── */}
          {step === 3 && (
            <>
              {projects.map((proj, i) => (
                <Card key={i} title={`[ PR-${String(i+1).padStart(2,'0')} ] Project`}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    {projects.length > 1 && <RemoveBtn onClick={() => listRemove(setProjects, i)} />}
                  </div>
                  <Field label="Project Title *" value={proj.title} onChange={v => projUpdate(i, 'title', v)} placeholder="My Awesome Project" />
                  <TextArea label="Description *" value={proj.description} onChange={v => projUpdate(i, 'description', v)}
                    placeholder="What it does, why it matters, what you built." rows={3} />
                  <Field label="GitHub / Demo Link" value={proj.link} onChange={v => projUpdate(i, 'link', v)} placeholder="https://github.com/you/project" />
                  <label style={label}>Technologies</label>
                  {proj.technologies.map((t, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input value={t} onChange={e => projUpdate(i, 'technologies', proj.technologies.map((x, k) => k === j ? e.target.value : x))}
                        placeholder="Python, React, Docker..." style={{ ...inp, flex: 1 }} />
                      {proj.technologies.length > 1 && <RemoveBtn onClick={() => projUpdate(i, 'technologies', proj.technologies.filter((_, k) => k !== j))} />}
                    </div>
                  ))}
                  <AddBtn onClick={() => projUpdate(i, 'technologies', [...proj.technologies, ''])} label="Add Tech" />
                </Card>
              ))}
              <AddBtn onClick={() => listAdd(setProjects, { title: '', description: '', technologies: [''], link: '' })} label="Add Project" />
            </>
          )}

          {/* ── Step 4: Education ── */}
          {step === 4 && (
            <>
              {education.map((edu, i) => (
                <Card key={i} title={`[ ED-${String(i+1).padStart(2,'0')} ] Education`}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    {education.length > 1 && <RemoveBtn onClick={() => listRemove(setEducation, i)} />}
                  </div>
                  <Field label="Degree *" value={edu.degree} onChange={v => eduUpdate(i, 'degree', v)} placeholder="B.Tech Computer Science" />
                  <Field label="Institution *" value={edu.institution} onChange={v => eduUpdate(i, 'institution', v)} placeholder="IIT Madras" />
                  <Field label="Year" value={edu.year} onChange={v => eduUpdate(i, 'year', v)} placeholder="2016 — 2020" />
                  <Field label="CGPA / Percentage" value={edu.gpa} onChange={v => eduUpdate(i, 'gpa', v)} placeholder="8.5 / 10 or 89%" />
                </Card>
              ))}
              <AddBtn onClick={() => listAdd(setEducation, { institution: '', degree: '', year: '', gpa: '' })} label="Add Education" />
            </>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: 'none', border: '1px solid var(--border-solid)', cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: mono, fontSize: 12, color: 'var(--text-muted)', opacity: step === 0 ? 0.4 : 1, borderRadius: 2 }}
            >
              <ArrowLeft size={14} /> Previous
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!personal.name || !personal.email}
                className="btn-primary"
                style={{ opacity: (!personal.name || !personal.email) ? 0.5 : 1 }}
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!personal.name || !personal.email}
                className="btn-primary"
                style={{ opacity: (!personal.name || !personal.email) ? 0.5 : 1 }}
              >
                Preview Resume <ArrowRight size={14} />
              </button>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
