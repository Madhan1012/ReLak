import { useEffect, useState } from 'react';

const STEPS = [
  { id: 1, label: 'Parsing document structure',      detail: 'Extracting text layers and semantic hierarchy...' },
  { id: 2, label: 'Identifying key sections',        detail: 'Locating Experience, Projects, Education blocks...' },
  { id: 3, label: 'Running two-pass AI extraction',  detail: 'Pass 1: raw fact extraction from source...' },
  { id: 4, label: 'Improving with power-verbs',      detail: 'Pass 2: rewriting bullets — Action + Task + Result...' },
  { id: 5, label: 'Self-checking for hallucinations',detail: 'Verifying every claim against source document...' },
  { id: 6, label: 'Formatting layout',              detail: 'Applying resume style and section structure...' },
  { id: 7, label: 'Finalising blueprint',            detail: 'Structuring JSON output and validating schema...' },
];

export default function ProcessingOverlay({ visible }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [dots, setDots] = useState('');

  // Advance steps on a timer to simulate progress
  useEffect(() => {
    if (!visible) { setActiveStep(0); setCompletedSteps([]); return; }
    setActiveStep(0);
    setCompletedSteps([]);

    const timings = [0, 1800, 3800, 6000, 8500, 11000, 13500];
    const timers = timings.map((delay, i) =>
      setTimeout(() => {
        setActiveStep(i);
        if (i > 0) setCompletedSteps(prev => [...prev, i - 1]);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  // Animated dots
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#f9f9f9',
      backgroundImage: `
        linear-gradient(to right, rgba(0,51,102,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,51,102,0.05) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>

      {/* Corner marks */}
      {[
        { top: 24, left: 24, borderTop: '2px solid', borderLeft: '2px solid' },
        { top: 24, right: 24, borderTop: '2px solid', borderRight: '2px solid' },
        { bottom: 24, left: 24, borderBottom: '2px solid', borderLeft: '2px solid' },
        { bottom: 24, right: 24, borderBottom: '2px solid', borderRight: '2px solid' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: 20, height: 20,
          borderColor: 'rgba(0,51,102,0.25)', ...s,
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px',
            background: '#f3f3f3', border: '1px solid #c3c6d1',
            marginBottom: 20,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#006e2f',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#43474f',
            }}>AI Engine Active</span>
          </div>

          <h1 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28, fontWeight: 700,
            color: '#001e40', letterSpacing: '-0.5px',
            lineHeight: 1.2, marginBottom: 8,
          }}>
            Analysing Resume{dots}
          </h1>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 15, color: '#43474f', lineHeight: 1.6,
          }}>
            {STEPS[activeStep]?.detail}
          </p>
        </div>

        {/* Step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STEPS.map((step, i) => {
            const done    = completedSteps.includes(i);
            const active  = activeStep === i;
            const pending = !done && !active;

            return (
              <div key={step.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: pending ? 0.35 : 1,
                transition: 'opacity 0.4s ease',
              }}>
                {/* Step number / check */}
                <div style={{
                  width: 28, height: 28, flexShrink: 0,
                  border: `2px solid ${done ? '#006e2f' : active ? '#003366' : '#c3c6d1'}`,
                  background: done ? '#006e2f' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}>
                  {done ? (
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>
                  ) : (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9, color: active ? '#003366' : '#737780',
                    }}>{String(step.id).padStart(2, '0')}</span>
                  )}
                </div>

                {/* Bar + label */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 4,
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, color: done ? '#006e2f' : active ? '#001e40' : '#737780',
                      fontWeight: active ? 600 : 400,
                    }}>{step.label}</span>
                    {active && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9, color: '#003366',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}>PROCESSING</span>
                    )}
                    {done && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9, color: '#006e2f',
                      }}>DONE</span>
                    )}
                  </div>
                  <div style={{
                    height: 2, background: '#e8e8e8', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: done ? '#006e2f' : active ? '#003366' : 'transparent',
                      width: done ? '100%' : active ? '60%' : '0%',
                      transition: 'width 1.5s ease',
                      animation: active ? 'shimmer 1.5s ease-in-out infinite' : 'none',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom coord */}
        <div style={{
          marginTop: 40, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, color: '#c3c6d1', letterSpacing: '0.1em',
          }}>RELAK_ENGINE v1.0</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, color: '#c3c6d1',
          }}>[{String(activeStep + 1).padStart(2, '0')}/{STEPS.length}]</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { width: 40%; }
          50%  { width: 75%; }
          100% { width: 40%; }
        }
      `}</style>
    </div>
  );
}
