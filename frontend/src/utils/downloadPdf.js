/**
 * PDF and DOCX export utilities for ReLak resumes.
 *
 * PDF  — uses browser native print-to-PDF (window.print).
 *        100% searchable text, ATS-safe, no html2canvas rasterization.
 *
 * DOCX — uses the `docx` npm package to produce an editable Word document.
 */

// ─── Native Print PDF ─────────────────────────────────────────────────────────

/**
 * Trigger the browser Print dialog so the user can Save as PDF.
 * Only the resume element is shown; all other UI is hidden via a print style.
 */
export async function downloadBlueprintPdf(elementId, _legacy, styleName, userName) {
  const element = document.getElementById(elementId);
  if (!element) { console.error('Preview element not found:', elementId); return; }

  const name = (userName || 'resume').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const prevTitle = document.title;
  document.title = name + '_ReLak_' + (styleName || 'resume');

  const printStyle = document.createElement('style');
  printStyle.setAttribute('id', 'relak-print-style');
  printStyle.textContent = [
    '@media print {',
    '  body > * { display: none !important; }',
    '  #relak-print-root { display: block !important; }',
    '  @page { margin: 10mm; size: A4 portrait; }',
    '  .exp-card, .proj-card, .edu-row, .exp-highlight, .exp-row {',
    '    page-break-inside: avoid; break-inside: avoid;',
    '  }',
    '}',
  ].join('\n');
  document.head.appendChild(printStyle);

  const printRoot = document.createElement('div');
  printRoot.setAttribute('id', 'relak-print-root');
  printRoot.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;z-index:99999;background:#fff;';
  printRoot.appendChild(element.cloneNode(true));
  document.body.appendChild(printRoot);

  await new Promise(function(resolve) {
    requestAnimationFrame(function() { requestAnimationFrame(resolve); });
  });

  window.print();

  document.title = prevTitle;
  document.head.removeChild(printStyle);
  document.body.removeChild(printRoot);
}

// ─── DOCX Export ─────────────────────────────────────────────────────────────

/**
 * Generate and download a .docx from resume data using the `docx` npm library.
 */
export async function downloadDocx(data, styleName) {
  var mod = await import('docx');
  var Document = mod.Document;
  var Packer = mod.Packer;
  var Paragraph = mod.Paragraph;
  var TextRun = mod.TextRun;
  var HeadingLevel = mod.HeadingLevel;
  var AlignmentType = mod.AlignmentType;
  var BorderStyle = mod.BorderStyle;

  var cleanName = (data.name || 'resume').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  var techSkills = data.technical_skills || data.skills || [];
  var softSkills = data.soft_skills || [];
  var children = [];

  function heading(text) {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '003366', space: 4 } },
    });
  }

  function bodyPara(text, opts) {
    return new Paragraph({
      children: [new TextRun(Object.assign({ text: text, size: 20, font: 'Calibri' }, opts || {}))],
      spacing: { after: 60 },
    });
  }

  function bulletPara(text) {
    return new Paragraph({
      children: [new TextRun({ text: text, size: 20, font: 'Calibri' })],
      bullet: { level: 0 },
      spacing: { after: 40 },
    });
  }

  // Name
  children.push(new Paragraph({
    children: [new TextRun({ text: data.name || '', bold: true, size: 36, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }));

  // Contact line
  var contactParts = [data.email, data.phone, data.address, data.linkedin, data.github].filter(Boolean);
  children.push(new Paragraph({
    children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Calibri', color: '444444' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
  }));

  // Summary
  if (data.summary) {
    children.push(heading('Professional Summary'));
    children.push(bodyPara(data.summary));
  }

  // Technical Skills
  if (techSkills.length > 0) {
    children.push(heading('Technical Skills'));
    children.push(bodyPara(techSkills.join(' | ')));
  }

  // Soft Skills
  if (softSkills.length > 0) {
    children.push(heading('Soft Skills'));
    children.push(bodyPara(softSkills.join(' | ')));
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    children.push(heading('Experience'));
    for (var i = 0; i < data.experience.length; i++) {
      var exp = data.experience[i];
      children.push(new Paragraph({
        children: [
          new TextRun({ text: exp.role || '', bold: true, size: 22, font: 'Calibri' }),
          new TextRun({ text: exp.company ? ('  \u2014  ' + exp.company) : '', size: 20, font: 'Calibri', color: '003366' }),
          new TextRun({ text: exp.duration ? ('  (' + exp.duration + ')') : '', size: 18, font: 'Calibri', color: '888888', italics: true }),
        ],
        spacing: { before: 120, after: 40 },
      }));
      var highlights = exp.highlights || [];
      for (var j = 0; j < highlights.length; j++) {
        if (highlights[j]) children.push(bulletPara(highlights[j]));
      }
    }
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    children.push(heading('Projects'));
    for (var pi = 0; pi < data.projects.length; pi++) {
      var proj = data.projects[pi];
      var techs = (proj.technologies || []).filter(Boolean).join(', ');
      children.push(new Paragraph({
        children: [
          new TextRun({ text: proj.title || '', bold: true, size: 22, font: 'Calibri' }),
          new TextRun({ text: techs ? ('  |  ' + techs) : '', size: 18, font: 'Calibri', color: '555555' }),
        ],
        spacing: { before: 120, after: 40 },
      }));
      if (proj.description) children.push(bodyPara(proj.description));
      if (proj.link) children.push(bodyPara(proj.link, { color: '003366' }));
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    children.push(heading('Education'));
    for (var ei = 0; ei < data.education.length; ei++) {
      var edu = data.education[ei];
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.degree || '', bold: true, size: 22, font: 'Calibri' }),
          new TextRun({ text: edu.year ? ('  (' + edu.year + ')') : '', size: 18, font: 'Calibri', color: '888888', italics: true }),
        ],
        spacing: { before: 100, after: 30 },
      }));
      if (edu.institution) children.push(bodyPara(edu.institution, { color: '444444' }));
      if (edu.gpa) children.push(bodyPara('CGPA: ' + edu.gpa, { color: '666666', size: 18 }));
    }
  }

  var doc = new Document({
    creator: 'ReLak',
    title: (data.name || 'Resume') + ' \u2014 ReLak',
    sections: [{ properties: {}, children: children }],
  });

  var blob = await Packer.toBlob(doc);
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = cleanName + '_ReLak.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── High-Quality Lossless PDF (html2canvas fallback) ────────────────────────

/**
 * High-quality lossless PDF via html2canvas at scale 3 + PNG encoding.
 * Produces a larger file but with pixel-perfect rendering as a raster image.
 * NOTE: Output is a rasterized image — not selectable text. Use only when
 * the user explicitly requests lossless image quality over ATS parseability.
 */
export async function downloadHighQualityPdf(elementId, styleName, userName) {
  var html2canvas = (await import('html2canvas')).default;
  var jsPDF = (await import('jspdf')).jsPDF;

  var element = document.getElementById(elementId);
  if (!element) { console.error('Preview element not found:', elementId); return; }

  var cleanName = (userName || 'resume').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  var canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 0,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: false });
  var pdfW = pdf.internal.pageSize.getWidth();
  var pdfH = pdf.internal.pageSize.getHeight();
  var pageHeightPx = Math.round((pdfH / pdfW) * canvas.width);
  var yOffset = 0;
  var pageNum = 0;

  while (yOffset < canvas.height && pageNum < 3) {
    if (pageNum > 0) pdf.addPage();
    var sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
    var topMarginPx = pageNum > 0 ? Math.round(40 * (canvas.width / 210)) : 0;
    var slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceH + topMarginPx;
    var ctx = slice.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, topMarginPx, canvas.width, sliceH);
    var imgData = slice.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, slice.height * (pdfW / canvas.width));
    yOffset += pageHeightPx;
    pageNum++;
  }

  pdf.save(cleanName + '_ReLak_HQ.pdf');
}
