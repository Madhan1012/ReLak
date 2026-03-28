import { useRef, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export default function UploadZone({ onFileSelect, isLoading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    onFileSelect(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="upload-wrapper">
      {/* Architectural corner marks */}
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
          id="upload-input"
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

        {/* Blueprint geometric decoration */}
        <div className="bp-deco">
          <div className="bp-deco-outer">
            <div className="bp-deco-inner" />
          </div>
        </div>
      </div>
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
              <div
                className="step-fill"
                style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${0.7 + i * 0.3}s` }}
              />
            </div>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
