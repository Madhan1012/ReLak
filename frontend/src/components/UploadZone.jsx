import { useRef, useState } from 'react';
import { UploadCloud, FileText, Briefcase } from 'lucide-react';

export default function UploadZone({ onFileSelect, onJobDescriptionChange, isLoading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jd, setJd] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleJdChange = (e) => {
    const val = e.target.value;
    setJd(val);
    onJobDescriptionChange?.(val);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="upload-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="corner-mark corner-tl" />
      <div className="corner-mark corner-tr" />
      <div className="corner-mark corner-bl" />
      <div className="corner-mark corner-br" />

      <div
        className={`upload-zone${isDragging ? ' dragging' : ''}${isLoading ? ' loading' : ''}`}
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {isLoading ? (
          <ProcessingIndicator />
        ) : (
          <>
            <div className="upload-icon-box">
              {selectedFile
                ? <FileText size={56} color="rgba(0,51,102,0.5)" strokeWidth={1} />
                : <UploadCloud size={56} color="rgba(0,51,102,0.35)" strokeWidth={1} />
              }
            </div>
            <p className="upload-title">
              {selectedFile ? selectedFile.name : 'Drag-and-drop or click to upload'}
            </p>
            <p className="upload-sub">
              Supported formats: .PDF, .DOCX (Max 2MB).<br />
              Your data is used only for parsing.
            </p>
          </>
        )}

        <div className="bp-deco">
          <div className="bp-deco-outer"><div className="bp-deco-inner" /></div>
        </div>
      </div>

      {!isLoading && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <Briefcase size={12} />
            <span>[ Optional ] Tailor to Job Description</span>
          </div>
          <textarea
            placeholder="Paste the job description here to optimize your resume for this specific role..."
            value={jd}
            onChange={handleJdChange}
            style={{
              width: '100%', minHeight: '100px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-solid)',
              padding: '10px', color: 'var(--text)',
              fontSize: '13px', fontFamily: "'Inter', sans-serif",
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <p style={{ marginTop: 8, fontSize: 10, color: 'var(--text-dim)', fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
            AI will prioritize skills and highlight experiences that match this JD.
          </p>
        </div>
      )}
    </div>
  );
}

function ProcessingIndicator() {
  const steps = [
    'Parsing document structure...',
    'Extracting semantic hierarchy...',
    'Optimizing with power-verbs...',
    'Assigning tech stack icons...',
  ];
  return (
    <div className="processing-wrap">
      <div className="processing-title">◉ AI Engine Processing...</div>
      <div className="processing-steps">
        {steps.map((step, i) => (
          <div key={i} className="processing-step">
            <span className="step-coord">[{String(i + 1).padStart(2, '0')}]</span>
            <div className="step-bar">
              <div className="step-fill" style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${0.7 + i * 0.3}s` }} />
            </div>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
