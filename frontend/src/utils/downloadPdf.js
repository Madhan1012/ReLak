import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures #blueprint-preview and exports a compressed PDF.
 * - JPEG 82% quality + scale 1.5 keeps output well under 2MB.
 * - For Classic style (A4-sized element) we render at exactly A4 width.
 * - Dynamic filename: {user_name}_ReLak_{style}.pdf
 * - Enforces max 2 pages with break-inside: avoid on cards
 */
export async function downloadBlueprintPdf(elementId, filename = 'relak-resume.pdf', styleName = 'style', userName = 'user') {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Dynamic filename: {user_name}_ReLak_{style}.pdf
  const cleanName = (userName || 'user').toLowerCase().replace(/\s+/g, '-');
  const cleanStyle = (styleName || 'style').toLowerCase().replace(/\s+/g, '-');
  const finalFilename = `${cleanName}_ReLak_${cleanStyle}.pdf`;

  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 0,
    // Render at the element's natural width so A4 layouts aren't stretched
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfW = pdf.internal.pageSize.getWidth();   // 210mm
  const pdfH = pdf.internal.pageSize.getHeight();  // 297mm

  // How many canvas pixels fit in one A4 page height
  const pageHeightPx = Math.round((pdfH / pdfW) * canvas.width);

  let yOffset = 0;
  let pageNum = 0;

  while (yOffset < canvas.height) {
    if (pageNum > 0) pdf.addPage();

    const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
    const slice  = document.createElement('canvas');
    slice.width  = canvas.width;
    slice.height = sliceH;
    slice.getContext('2d').drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const imgData = slice.toDataURL('image/jpeg', 0.82);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, sliceH * (pdfW / canvas.width));

    yOffset += pageHeightPx;
    pageNum++;
    
    // Max 2 pages enforcement
    if (pageNum >= 2) break;
  }

  pdf.save(finalFilename);
}
