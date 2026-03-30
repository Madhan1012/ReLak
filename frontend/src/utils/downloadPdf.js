import jsPDF from 'jspdf';

/**
 * Generates a selectable-text PDF from the resume preview element.
 * Uses jsPDF's html() renderer which preserves text as real PDF text objects
 * (not a rasterized image), so the user can select/copy text in the PDF.
 *
 * Max 2 A4 pages. Dynamic filename: {user_name}_ReLak_{style}.pdf
 */
export async function downloadBlueprintPdf(elementId, _legacyFilename, styleName = 'style', userName = 'user') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const cleanName  = (userName  || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const cleanStyle = (styleName || 'style').toLowerCase().replace(/\s+/g, '-');
  const filename   = `${cleanName}_ReLak_${cleanStyle}.pdf`;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfW = pdf.internal.pageSize.getWidth();   // 210mm
  const pdfH = pdf.internal.pageSize.getHeight();  // 297mm

  // Clone the element so we can strip edit-mode controls without affecting the UI
  const clone = element.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.top      = '-9999px';
  clone.style.left     = '-9999px';
  clone.style.width    = element.offsetWidth + 'px';
  clone.style.background = '#ffffff';
  // Remove any interactive/edit-only elements from the clone
  clone.querySelectorAll('button, input, [contenteditable]').forEach(el => {
    if (el.tagName === 'INPUT') {
      const span = document.createElement('span');
      span.textContent = el.value;
      span.style.cssText = el.style.cssText;
      el.replaceWith(span);
    } else if (el.getAttribute('contenteditable')) {
      el.removeAttribute('contenteditable');
    } else {
      el.remove();
    }
  });
  document.body.appendChild(clone);

  try {
    await new Promise((resolve, reject) => {
      pdf.html(clone, {
        callback: (doc) => {
          doc.save(filename);
          resolve();
        },
        x: 0,
        y: 0,
        width: pdfW,
        windowWidth: element.offsetWidth,
        margin: [0, 0, 0, 0],
        autoPaging: 'text',
        html2canvas: {
          scale: 0.264583, // 1px = 0.264583mm at 96dpi → maps px to mm
          useCORS: true,
          logging: false,
        },
      });
    });
  } finally {
    document.body.removeChild(clone);
  }
}
