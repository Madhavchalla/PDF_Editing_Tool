import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { TextElement, PageMeta } from '../types/pdf';

export class DocxExportService {
  /**
   * Export text elements extracted from PDF into a native MS Word .docx file
   */
  static async exportToDocx(textElements: TextElement[], pagesMeta: PageMeta[]): Promise<Blob> {
    const sections = [];

    for (let pIdx = 0; pIdx < pagesMeta.length; pIdx++) {
      const pageElements = textElements
        .filter(t => t.pageIndex === pIdx && !t.isDeleted)
        .sort((a, b) => a.y - b.y || a.x - b.x);

      // Group elements into lines based on close Y percentages (tolerance ~2%)
      const lines: TextElement[][] = [];
      let currentLine: TextElement[] = [];
      let currentY = -1;

      for (const el of pageElements) {
        if (currentY < 0 || Math.abs(el.y - currentY) < 2.0) {
          currentLine.push(el);
          currentY = el.y;
        } else {
          if (currentLine.length > 0) {
            lines.push(currentLine);
          }
          currentLine = [el];
          currentY = el.y;
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      const paragraphs: Paragraph[] = [];

      // Add Page Header / Title if first page
      if (pIdx === 0 && lines.length === 0) {
        paragraphs.push(
          new Paragraph({
            text: "Converted Document",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          })
        );
      }

      for (const line of lines) {
        // Sort line items from left to right
        line.sort((a, b) => a.x - b.x);

        const runs: TextRun[] = line.map(item => {
          // Clean text
          const cleanText = item.text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
          
          return new TextRun({
            text: cleanText + ' ',
            size: (item.fontSize || 12) * 2, // docx uses half-points (24 = 12pt)
            bold: item.fontWeight === 'bold',
            italics: item.fontStyle === 'italic',
            underline: item.textDecoration === 'underline' ? {} : undefined,
            color: item.color ? item.color.replace('#', '') : '1C1917',
            font: item.fontFamily.includes('serif') ? 'Times New Roman' : 'Arial',
          });
        });

        // Determine paragraph alignment from first item
        const firstItem = line[0];
        let alignment: any = AlignmentType.LEFT;
        if (firstItem?.textAlign === 'center') alignment = AlignmentType.CENTER;
        if (firstItem?.textAlign === 'right') alignment = AlignmentType.RIGHT;
        if (firstItem?.textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

        const isHeading = firstItem && firstItem.fontSize > 18;

        paragraphs.push(
          new Paragraph({
            children: runs,
            alignment,
            heading: isHeading ? HeadingLevel.HEADING_1 : undefined,
            spacing: {
              after: 120, // 6pt space after paragraph
            }
          })
        );
      }

      sections.push({
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: '' })],
      });
    }

    const doc = new Document({
      creator: "PaperCraft PDF Toolkit",
      title: "Converted PDF Document",
      description: "PDF converted to Word DOCX seamlessly",
      sections: sections.length > 0 ? sections : [{ children: [new Paragraph({ text: "Empty document" })] }],
    });

    return await Packer.toBlob(doc);
  }
}
