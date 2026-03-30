import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures the resume preview and exports a PDF.
 * Uses html2canvas for reliable rendering across all resume styles.
 * Filename: {user_name}_ReLak_{style}.pdf
 * Max 2 A4 pages.
 */
export async function downloadBlueprintPdf(elementId, _legacy, styleName = 'style', userName = 'user') {
  const element = document.getElementById(elementId);
  if (!element) { console.error('Preview element not found:', elementId); return; }

  const cleanName  = (userName  || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const cleanStyle = (styleName || 'style').toLowerCase().replace(/\s+/g, '-');
  const filename   = `${cleanName}_ReLak_${cleanStyle}.pdf`;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 0,
    width:  element.scrollWidth,
    height: element.scrollHeight,
  });

  const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pdfW = pdf.internal.pageSize.getWidth();   // 210mm
  const pdfH = pdf.internal.pageSize.getHeight();  // 297mm

  const pageHeightPx = Math.round((pdfH / pdfW) * canvas.width);
  let yOffset = 0;
  let pageNum = 0;

  while (yOffset < canvas.height && pageNum < 2) {
    if (pageNum > 0) pdf.addPage();

    const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
    const slice  = document.createElement('canvas');
    slice.width  = canvas.width;
    slice.height = sliceH;
    slice.getContext('2d').drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const imgData = slice.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, sliceH * (pdfW / canvas.width));

    yOffset += pageHeightPx;
    pageNum++;
  }

  pdf.save(filename);
}
