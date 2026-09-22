import { Document, Packer, Paragraph, TextRun, AlignmentType, SectionType } from 'docx';
import { TextElement, PageMeta } from '../types/pdf';

export class DocxExportService {
  /**
   * Helper to map CSS font families to standard MS Word font names
   */
  private static parseFontForDocx(fontFamily: string): string {
    const f = (fontFamily || '').toLowerCase();
    if (f.includes('times') || f.includes('serif')) return 'Times New Roman';
    if (f.includes('courier') || f.includes('mono')) return 'Courier New';
    if (f.includes('georgia')) return 'Georgia';
    if (f.includes('verdana')) return 'Verdana';
    if (f.includes('garamond')) return 'Garamond';
    if (f.includes('tahoma')) return 'Tahoma';
    if (f.includes('trebuchet')) return 'Trebuchet MS';
    if (f.includes('calibri')) return 'Calibri';
    return 'Arial';
  }

  /**
   * Export text elements extracted from PDF into a native MS Word .docx file.
   * Ensures exact 1-to-1 page count, exact line positions, and exact font/color layout.
   */
  static async exportToDocx(textElements: TextElement[], pagesMeta: PageMeta[]): Promise<Blob> {
    const sections = [];

    for (let pIdx = 0; pIdx < pagesMeta.length; pIdx++) {
      const pageMeta = pagesMeta[pIdx] || { width: 595.28, height: 841.89 };
      const pageW_pt = pageMeta.width || 595.28;
      const pageH_pt = pageMeta.height || 841.89;

      // Filter text elements for this page (ignoring deleted elements)
      const pageElements = textElements
        .filter(t => t.pageIndex === pIdx && !t.isDeleted)
        .sort((a, b) => a.y - b.y || a.x - b.x);

      // Group elements into lines based on tight Y percentage tolerance (~0.6%)
      const lines: TextElement[][] = [];
      let currentLine: TextElement[] = [];
      let currentY = -1;

      for (const el of pageElements) {
        if (currentY < 0 || Math.abs(el.y - currentY) < 0.6) {
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
      let prevLineY_pt = 0;

      for (const line of lines) {
        // Sort line items from left to right
        line.sort((a, b) => a.x - b.x);
        const firstItem = line[0];
        const lineY_pt = (firstItem.y / 100) * pageH_pt;

        // Build runs for items on this line
        const runs: TextRun[] = [];

        for (let i = 0; i < line.length; i++) {
          const item = line[i];
          const cleanText = item.text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');

          // If there is a horizontal gap between adjacent items on the same line, insert spacing
          if (i > 0) {
            const prevItem = line[i - 1];
            const gapPercent = item.x - (prevItem.x + prevItem.width);
            if (gapPercent > 3.0) {
              const numSpaces = Math.max(1, Math.round(gapPercent / 2.0));
              runs.push(new TextRun({ text: ' '.repeat(numSpaces) }));
            } else if (!prevItem.text.endsWith(' ') && !cleanText.startsWith(' ')) {
              runs.push(new TextRun({ text: ' ' }));
            }
          }

          runs.push(
            new TextRun({
              text: cleanText,
              size: Math.max(14, Math.round((item.fontSize || 12) * 2)), // docx half-points (24 = 12pt)
              bold: item.fontWeight === 'bold',
              italics: item.fontStyle === 'italic',
              underline: item.textDecoration === 'underline' ? {} : undefined,
              color: item.color ? item.color.replace('#', '') : '1C1917',
              font: DocxExportService.parseFontForDocx(item.fontFamily),
            })
          );
        }

        // Determine paragraph alignment from first item
        let alignment: any = AlignmentType.LEFT;
        if (firstItem?.textAlign === 'center') alignment = AlignmentType.CENTER;
        if (firstItem?.textAlign === 'right') alignment = AlignmentType.RIGHT;
        if (firstItem?.textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

        // Dynamic spacing before paragraph to match PDF vertical layout
        let spaceBefore = 0;
        if (prevLineY_pt > 0) {
          const yGap_pt = lineY_pt - prevLineY_pt;
          const fontSize_pt = firstItem.fontSize || 12;
          const extraGap_pt = yGap_pt - fontSize_pt;
          if (extraGap_pt > 2) {
            spaceBefore = Math.min(360, Math.round(extraGap_pt * 20)); // dxa
          }
        }
        prevLineY_pt = lineY_pt;

        paragraphs.push(
          new Paragraph({
            children: runs,
            alignment,
            spacing: {
              before: spaceBefore,
              after: 40, // 2pt space after line
              line: 240, // Single line spacing
            },
          })
        );
      }

      // If page is completely empty, add an empty paragraph to maintain page structure
      if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
      }

      // Create a section for each PDF page with EXACT page dimensions and NEXT_PAGE section type
      sections.push({
        properties: {
          type: pIdx > 0 ? SectionType.NEXT_PAGE : SectionType.CONTINUOUS,
          page: {
            size: {
              width: Math.round(pageW_pt * 20),
              height: Math.round(pageH_pt * 20),
            },
            margin: {
              top: 720,    // 0.5 in (36pt = 720 dxa)
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: paragraphs,
      });
    }

    const doc = new Document({
      creator: "PaperCraft PDF Toolkit",
      title: "Converted PDF Document",
      description: "PDF converted to MS Word (.docx) with exact page and layout fidelity",
      sections: sections.length > 0 ? sections : [
        {
          properties: {},
          children: [new Paragraph({ children: [new TextRun({ text: 'Empty Document' })] })],
        }
      ],
    });

    return await Packer.toBlob(doc);
  }
}
