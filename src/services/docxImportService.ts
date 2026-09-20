import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class DocxImportService {
  /**
   * Convert uploaded .docx file into a formatted PDF file
   */
  static async convertDocxToPdf(docxFile: File | ArrayBuffer): Promise<Uint8Array> {
    const arrayBuffer = docxFile instanceof File ? await docxFile.arrayBuffer() : docxFile;
    
    // Parse docx to raw text and HTML structure
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const htmlString = result.value;
    
    // Create new PDF Document
    const pdfDoc = await PDFDocument.create();
    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Standard A4 dimensions
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 54; // 0.75 inch margin
    const contentWidth = pageWidth - margin * 2;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Parse simple HTML elements from mammoth
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const nodes = Array.from(doc.body.children);

    for (const node of nodes) {
      const tagName = node.tagName.toLowerCase();
      const text = node.textContent?.trim() || '';

      if (!text) continue;

      let fontSize = 12;
      let isBold = false;
      let font = fontHelvetica;
      let spaceAfter = 12;

      if (tagName === 'h1') {
        fontSize = 22;
        isBold = true;
        font = fontHelveticaBold;
        spaceAfter = 18;
      } else if (tagName === 'h2') {
        fontSize = 18;
        isBold = true;
        font = fontHelveticaBold;
        spaceAfter = 14;
      } else if (tagName === 'h3') {
        fontSize = 15;
        isBold = true;
        font = fontHelveticaBold;
        spaceAfter = 12;
      } else if (node.querySelector('strong, b')) {
        isBold = true;
        font = fontHelveticaBold;
      }

      // Word wrapping logic
      const words = text.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > contentWidth && currentLine) {
          // Check page bottom overflow
          if (currentY - fontSize < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          page.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0.11, 0.1, 0.09),
          });
          currentY -= fontSize * 1.3;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (currentY - fontSize < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        page.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.11, 0.1, 0.09),
        });
        currentY -= fontSize * 1.3 + spaceAfter;
      }
    }

    return await pdfDoc.save();
  }
}
