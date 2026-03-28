import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures #blueprint-preview and exports a compressed PDF.
 * - JPEG 82% quality + scale 1.5 keeps output well under 2MB.
 * - For Classic style (A4-sized element) we render at exactly A4 width.
 */
export async function downloadBlueprintPdf(elementId, filename = 'relak-resume.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

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
    slice.getContext('2d').drawImage(canvas, 0, -yOffset);

    const imgData = slice.toDataURL('image/jpeg', 0.82);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, sliceH * (pdfW / canvas.width));

    yOffset += pageHeightPx;
    pageNum++;
  }

  pdf.save(filename);
}
