import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { TextElement, Annotation, PageMeta, WatermarkConfig, SecurityConfig } from '../types/pdf';

// Configure pdfjs worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ExtractedPdfData {
  pdfBytes: ArrayBuffer;
  numPages: number;
  pagesMeta: PageMeta[];
  textElements: TextElement[];
}

interface RawTextItem {
  str: string;
  tx: number;
  ty: number;
  width: number;
  height: number;
  fontHeight: number;
  fontName: string;
  realFontFamily: string;
  styleObjFontFamily?: string;
}

export class PdfService {
  /**
   * Clean raw PDF font descriptor into exact Times New Roman font family
   */
  public static parseFontFamily(fontDescriptor: string, styleFontFamily?: string): string {
    const descriptorClean = (fontDescriptor || '').toLowerCase();

    // Monospace fonts
    if (
      descriptorClean.includes('courier') || 
      descriptorClean.includes('mono') || 
      descriptorClean.includes('code') || 
      descriptorClean.includes('console')
    ) {
      return '"Courier New", Courier, monospace';
    }

    // Explicit Sans-Serif fonts
    if (
      descriptorClean.includes('arial') || 
      descriptorClean.includes('helvetica') || 
      descriptorClean.includes('calibri') || 
      descriptorClean.includes('verdana') ||
      descriptorClean.includes('tahoma') ||
      descriptorClean.includes('trebuchet')
    ) {
      return 'Arial, Helvetica, sans-serif';
    }

    if (descriptorClean.includes('inter')) {
      return 'Inter, sans-serif';
    }

    if (descriptorClean.includes('georgia')) {
      return 'Georgia, serif';
    }

    // Exact Times New Roman for serif/roman documents and PDF fallbacks
    return '"Times New Roman", Times, serif';
  }

  /**
   * Load PDF file and extract page metadata + continuous paragraph flow blocks
   */
  static async loadPdf(file: File | ArrayBuffer): Promise<ExtractedPdfData> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    
    const numPages = pdfDoc.numPages;
    const pagesMeta: PageMeta[] = [];
    const textElements: TextElement[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      const pageIndex = i - 1;

      pagesMeta.push({
        pageIndex,
        pageNumber: i,
        width: viewport.width,
        height: viewport.height,
        rotation: page.rotate || 0,
      });

      // Extract text content and font style resource objects
      const textContent = await page.getTextContent();
      const styles = textContent.styles || {};
      const rawItems: RawTextItem[] = [];

      for (const item of textContent.items) {
        if ('str' in item && item.str.length > 0) {
          const transform = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
          const tx = transform[4];
          const ty = transform[5];
          const fontHeight = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]) || item.height || 12;

          // Lookup PDF font style dictionary descriptor
          const styleObj = (styles as any)[item.fontName] || {};
          const descriptor = `${item.fontName || ''} ${styleObj.fontFamily || ''}`;

          rawItems.push({
            str: item.str,
            tx,
            ty,
            width: item.width || (item.str.length * fontHeight * 0.5),
            height: item.height || fontHeight,
            fontHeight,
            fontName: item.fontName || '',
            realFontFamily: descriptor,
            styleObjFontFamily: styleObj.fontFamily,
          });
        }
      }

      // Group raw items into lines by matching Y coordinates
      rawItems.sort((a, b) => b.ty - a.ty || a.tx - b.tx);

      const mergedLines: RawTextItem[][] = [];
      let currentLineGroup: RawTextItem[] = [];
      let currentY = -1;

      for (const item of rawItems) {
        const yTolerance = Math.max(6.0, item.fontHeight * 0.5);
        if (currentY < 0 || Math.abs(item.ty - currentY) <= yTolerance) {
          currentLineGroup.push(item);
          currentY = item.ty;
        } else {
          if (currentLineGroup.length > 0) {
            mergedLines.push(currentLineGroup);
          }
          currentLineGroup = [item];
          currentY = item.ty;
        }
      }
      if (currentLineGroup.length > 0) {
        mergedLines.push(currentLineGroup);
      }

      // Merge items in each line into cohesive flow blocks
      let itemIdx = 0;
      for (const lineItems of mergedLines) {
        lineItems.sort((a, b) => a.tx - b.tx);

        let mergedStr = '';
        let startTx = lineItems[0].tx;
        let fontHeight = lineItems[0].fontHeight;
        let realFontFamily = lineItems[0].realFontFamily;
        let styleObjFontFamily = lineItems[0].styleObjFontFamily;
        let ty = lineItems[0].ty;
        let lastEndTx = startTx;

        for (const item of lineItems) {
          const gap = item.tx - lastEndTx;
          if (mergedStr.length > 0 && gap > (fontHeight * 0.15) && !mergedStr.endsWith(' ') && !item.str.startsWith(' ')) {
            mergedStr += ' ';
          }
          mergedStr += item.str;
          lastEndTx = Math.max(lastEndTx, item.tx + item.width);
        }

        if (mergedStr.trim().length === 0) continue;

        const totalWidth = Math.max(10, lastEndTx - startTx);
        itemIdx++;

        // Detect text alignment (center, right, left)
        const lineCenterX = startTx + totalWidth / 2;
        const pageCenterX = viewport.width / 2;
        const isCentered = Math.abs(lineCenterX - pageCenterX) < (viewport.width * 0.12);
        const isRightAligned = (viewport.width - (startTx + totalWidth)) < (viewport.width * 0.12) && !isCentered;

        let textAlign: TextElement['textAlign'] = 'left';
        if (isCentered) textAlign = 'center';
        else if (isRightAligned) textAlign = 'right';

        const fontAscent = fontHeight * 0.8;
        const fontTopPdf = ty + fontAscent;
        const viewportY = viewport.height - fontTopPdf;

        const xPercent = Math.max(0, Math.min(98, (startTx / viewport.width) * 100));
        const yPercent = Math.max(0, Math.min(98, (viewportY / viewport.height) * 100));
        const widthPercent = Math.max(2, Math.min(100 - xPercent, (totalWidth / viewport.width) * 100));
        const heightPercent = Math.max(1.2, ((fontHeight * 1.1) / viewport.height) * 100);

        const fontFamily = PdfService.parseFontFamily(realFontFamily, styleObjFontFamily);
        const fontLower = realFontFamily.toLowerCase();
        const isBold = fontLower.includes('bold') || fontLower.includes('black') || fontLower.includes('heavy') || fontLower.includes('-bd') || fontLower.includes('boldmt') || fontLower.includes('700') || fontLower.includes('800');
        const isItalic = fontLower.includes('italic') || fontLower.includes('oblique') || fontLower.includes('ital') || fontLower.includes('-it') || fontLower.includes('italicmt');

        textElements.push({
          id: `text-p${pageIndex}-${itemIdx}-${Math.random().toString(36).substring(2, 7)}`,
          pageIndex,
          x: xPercent,
          y: yPercent,
          width: widthPercent,
          height: heightPercent,
          text: mergedStr,
          originalText: mergedStr,
          fontSize: Math.max(8, Number(fontHeight.toFixed(2))),
          fontFamily,
          color: '#1C1917',
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: 'none',
          textAlign,
          isModified: false,
          isDeleted: false,
          isNew: false,
        });
      }
    }

    return {
      pdfBytes: arrayBuffer,
      numPages,
      pagesMeta,
      textElements
    };
  }

  /**
   * Helper to convert Hex color to pdf-lib RGB (0 to 1)
   */
  private static parseHexColor(hex: string) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2) || '00', 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4) || '00', 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6) || '00', 16) / 255;
    return rgb(r, g, b);
  }

  /**
   * Compile edited PDF document and generate Uint8Array for download
   */
  static async exportPdf(
    originalPdfBytes: ArrayBuffer,
    pagesMeta: PageMeta[],
    textElements: TextElement[],
    annotations: Annotation[],
    watermark?: WatermarkConfig,
    security?: SecurityConfig
  ): Promise<Uint8Array> {
    let pdfDoc: PDFDocument;

    try {
      pdfDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
    } catch (e) {
      pdfDoc = await PDFDocument.create();
    }

    const standardFontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const standardFontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const standardFontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const standardFontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const standardFontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

    const getFont = (family: string, isBold: boolean) => {
      if (family.includes('Times') || family.includes('serif')) {
        return isBold ? standardFontTimesBold : standardFontTimes;
      }
      if (family.includes('Courier') || family.includes('mono')) {
        return standardFontCourier;
      }
      return isBold ? standardFontHelveticaBold : standardFontHelvetica;
    };

    const pages = pdfDoc.getPages();

    for (let pageIndex = 0; pageIndex < pagesMeta.length; pageIndex++) {
      const meta = pagesMeta[pageIndex];
      const page = pages[pageIndex] || pdfDoc.addPage([meta.width || 595, meta.height || 841]);
      
      if (meta.rotation) {
        page.setRotation(degrees(meta.rotation));
      }

      const { width, height } = page.getSize();

      // 1. Process Text Edits, Deletions, and New Text
      const pageTexts = textElements.filter(t => t.pageIndex === pageIndex);

      for (const el of pageTexts) {
        const absX = (el.x / 100) * width;
        const absWidth = (el.width / 100) * width;
        const absHeight = (el.height / 100) * height;
        const absY = height - ((el.y / 100) * height) - el.fontSize;

        // White-out original text if deleted or modified
        if (el.isDeleted || el.isModified) {
          page.drawRectangle({
            x: Math.max(0, absX - 2),
            y: Math.max(0, height - ((el.y / 100) * height) - absHeight - 2),
            width: Math.min(width - absX + 2, absWidth + 8),
            height: Math.min(height, absHeight + 4),
            color: el.backgroundColor ? PdfService.parseHexColor(el.backgroundColor) : rgb(1, 1, 1),
          });
        }

        // Render edited or new text (do NOT re-draw untouched original text to prevent double text overlay)
        if (!el.isDeleted && (el.isModified || el.isNew)) {
          const font = getFont(el.fontFamily, el.fontWeight === 'bold');
          const textColor = PdfService.parseHexColor(el.color || '#1C1917');

          page.drawText(el.text, {
            x: absX,
            y: absY,
            size: el.fontSize,
            font,
            color: textColor,
            maxWidth: width - absX - 10,
          });
        }
      }

      // 2. Process Annotations
      const pageAnnots = annotations.filter(a => a.pageIndex === pageIndex);

      for (const ann of pageAnnots) {
        const absX = (ann.x / 100) * width;
        const absY = height - ((ann.y / 100) * height) - ((ann.height / 100) * height);
        const absW = (ann.width / 100) * width;
        const absH = (ann.height / 100) * height;

        const strokeColor = PdfService.parseHexColor(ann.strokeColor || '#C85A32');
        const fillColor = ann.fillColor ? PdfService.parseHexColor(ann.fillColor) : undefined;

        if (ann.type === 'rect') {
          page.drawRectangle({
            x: absX,
            y: absY,
            width: absW,
            height: absH,
            borderColor: strokeColor,
            borderWidth: ann.strokeWidth,
            color: fillColor,
            opacity: ann.opacity,
          });
        } else if (ann.type === 'circle') {
          const rx = absW / 2;
          const ry = absH / 2;
          page.drawEllipse({
            x: absX + rx,
            y: absY + ry,
            xScale: rx,
            yScale: ry,
            borderColor: strokeColor,
            borderWidth: ann.strokeWidth,
            color: fillColor,
            opacity: ann.opacity,
          });
        } else if (ann.type === 'stamp' && ann.stampText) {
          page.drawRectangle({
            x: absX,
            y: absY,
            width: Math.max(120, absW),
            height: Math.max(40, absH),
            borderColor: strokeColor,
            borderWidth: 2,
            color: rgb(0.98, 0.96, 0.94),
            opacity: ann.opacity,
          });
          page.drawText(ann.stampText, {
            x: absX + 10,
            y: absY + 12,
            size: 14,
            font: standardFontHelveticaBold,
            color: strokeColor,
          });
        } else if ((ann.type === 'image' || ann.type === 'signature' || ann.type === 'stamp') && ann.imageSrc) {
          try {
            const base64Data = ann.imageSrc.split(',')[1] || ann.imageSrc;
            const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            let embeddedImg;
            if (ann.imageSrc.includes('data:image/png')) {
              embeddedImg = await pdfDoc.embedPng(imgBytes);
            } else {
              embeddedImg = await pdfDoc.embedJpg(imgBytes);
            }

            page.drawImage(embeddedImg, {
              x: absX,
              y: absY,
              width: absW || 150,
              height: absH || 60,
              opacity: ann.opacity || 1.0,
            });
          } catch (err) {
            console.warn('Image embedding fallback:', err);
          }
        }
      }

      // 3. Process Watermark
      if (watermark && watermark.enabled && watermark.text) {
        const wmColor = PdfService.parseHexColor(watermark.color || '#C85A32');
        page.drawText(watermark.text, {
          x: width / 4,
          y: height / 2,
          size: watermark.fontSize || 48,
          font: standardFontHelveticaBold,
          color: wmColor,
          opacity: watermark.opacity || 0.2,
          rotate: degrees(watermark.rotation || -45),
        });
      }
    }

    return await pdfDoc.save();
  }
}
