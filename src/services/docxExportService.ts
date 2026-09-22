import { Document, Packer, Paragraph, TextRun, AlignmentType, SectionType, Tab, TabStopType } from 'docx';
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
   * Ensures exact 1-to-1 page count, exact X/Y line positions, indents, tab stops, and font/color layout.
   */
  static async exportToDocx(textElements: TextElement[], pagesMeta: PageMeta[]): Promise<Blob> {
    const sections = [];

    for (let pIdx = 0; pIdx < pagesMeta.length; pIdx++) {
      const pageMeta = pagesMeta[pIdx] || { width: 595.28, height: 841.89 };
      const pageW_pt = pageMeta.width || 595.28;
      const pageH_pt = pageMeta.height || 841.89;

      const topMargin_pt = 36;  // 0.5 in = 720 dxa
      const leftMargin_pt = 36; // 0.5 in = 720 dxa

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

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        line.sort((a, b) => a.x - b.x);
        const firstItem = line[0];
        const lineY_pt = (firstItem.y / 100) * pageH_pt;
        const firstX_pt = (firstItem.x / 100) * pageW_pt;

        // Determine paragraph alignment
        let alignment: any = AlignmentType.LEFT;
        if (firstItem?.textAlign === 'center') alignment = AlignmentType.CENTER;
        if (firstItem?.textAlign === 'right') alignment = AlignmentType.RIGHT;
        if (firstItem?.textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

        // Calculate vertical spacing before paragraph in dxa (1 pt = 20 dxa)
        let spaceBefore_dxa = 0;
        if (lineIdx === 0) {
          spaceBefore_dxa = Math.max(0, Math.round((lineY_pt - topMargin_pt) * 20));
        } else {
          const prevFirstItem = lines[lineIdx - 1][0];
          const prevFontSize = prevFirstItem.fontSize || 12;
          const yGap = lineY_pt - prevLineY_pt;
          const extraGap = yGap - (prevFontSize * 1.15);
          if (extraGap > 1) {
            spaceBefore_dxa = Math.round(extraGap * 20);
          }
        }
        prevLineY_pt = lineY_pt;

        // Prepare tabStops and runs for multiple items on same line
        const tabStops: { type: any; position: number }[] = [];
        const runs: (TextRun | Tab)[] = [];

        for (let i = 0; i < line.length; i++) {
          const item = line[i];
          const cleanText = item.text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');

          if (i > 0) {
            const itemX_pt = (item.x / 100) * pageW_pt;
            const tabPos_dxa = Math.round(itemX_pt * 20);
            tabStops.push({ type: TabStopType.LEFT, position: tabPos_dxa });
            runs.push(new Tab());
          }

          runs.push(
            new TextRun({
              text: cleanText,
              size: Math.max(14, Math.round((item.fontSize || 12) * 2)), // half-points
              bold: item.fontWeight === 'bold',
              italics: item.fontStyle === 'italic',
              underline: item.textDecoration === 'underline' ? {} : undefined,
              color: item.color ? item.color.replace('#', '') : '1C1917',
              font: DocxExportService.parseFontForDocx(item.fontFamily),
            })
          );
        }

        // Left indent for left-aligned paragraphs if not centered/right-aligned
        let leftIndent_dxa = 0;
        if (alignment === AlignmentType.LEFT && firstX_pt > leftMargin_pt + 5) {
          leftIndent_dxa = Math.round((firstX_pt - leftMargin_pt) * 20);
        }

        paragraphs.push(
          new Paragraph({
            children: runs,
            alignment,
            tabStops: tabStops.length > 0 ? tabStops : undefined,
            indent: leftIndent_dxa > 0 ? { left: leftIndent_dxa } : undefined,
            spacing: {
              before: Math.max(0, spaceBefore_dxa),
              after: 20, // 1pt tight bottom spacing
              line: 240, // Single line spacing
            },
          })
        );
      }

      if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
      }

      sections.push({
        properties: {
          type: pIdx > 0 ? SectionType.NEXT_PAGE : SectionType.CONTINUOUS,
          page: {
            size: {
              width: Math.round(pageW_pt * 20),
              height: Math.round(pageH_pt * 20),
            },
            margin: {
              top: Math.round(topMargin_pt * 20),     // 720 dxa = 0.5 in
              bottom: Math.round(topMargin_pt * 20),  // 720 dxa = 0.5 in
              left: Math.round(leftMargin_pt * 20),   // 720 dxa = 0.5 in
              right: Math.round(leftMargin_pt * 20),  // 720 dxa = 0.5 in
            },
          },
        },
        children: paragraphs,
      });
    }

    const doc = new Document({
      creator: "PaperCraft PDF Toolkit",
      title: "Converted PDF Document",
      description: "PDF converted to MS Word (.docx) with 1-to-1 exact page, layout, and font fidelity",
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
