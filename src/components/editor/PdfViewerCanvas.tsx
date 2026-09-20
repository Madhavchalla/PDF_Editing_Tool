import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PageMeta, TextElement, Annotation, ActiveTool } from '../../types/pdf';
import { TextEditLayer } from './TextEditLayer';
import { AnnotationLayer } from './AnnotationLayer';

interface PdfViewerCanvasProps {
  pdfBytes: ArrayBuffer;
  pageMeta: PageMeta;
  zoom: number;
  activeTool: ActiveTool;
  textElements: TextElement[];
  annotations: Annotation[];
  selectedTextId: string | null;
  strokeColor: string;
  onSelectText: (id: string | null) => void;
  onUpdateText: (id: string, newText: string) => void;
  onAddAnnotation: (ann: Annotation) => void;
  onAddTextAtPosition: (xPercent: number, yPercent: number) => void;
}

export const PdfViewerCanvas: React.FC<PdfViewerCanvasProps> = ({
  pdfBytes,
  pageMeta,
  zoom,
  activeTool,
  textElements,
  annotations,
  selectedTextId,
  strokeColor,
  onSelectText,
  onUpdateText,
  onAddAnnotation,
  onAddTextAtPosition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!canvasRef.current || !pdfBytes) return;

      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(pageMeta.pageNumber);

        if (isCancelled) return;

        // High resolution rendering for ultra-crisp vector rendering
        const dpr = window.devicePixelRatio || 2;
        const renderScale = zoom * Math.max(2, dpr * 1.5);
        const viewport = page.getViewport({ scale: renderScale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // High resolution canvas internal buffer
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Display size matching CSS scaling
        canvas.style.width = `${pageMeta.width * zoom}px`;
        canvas.style.height = `${pageMeta.height * zoom}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.warn('PDF canvas render fallback:', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfBytes, pageMeta.pageNumber, zoom, pageMeta.rotation]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'text-add') {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      onAddTextAtPosition(xPercent, yPercent);
    } else if (activeTool === 'select') {
      onSelectText(null);
    }
  };

  const scaledWidth = pageMeta.width * zoom;
  const scaledHeight = pageMeta.height * zoom;

  return (
    <div className="flex flex-col items-center justify-center my-6 select-none">
      <div
        onClick={handleCanvasClick}
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          transform: `rotate(${pageMeta.rotation || 0}deg)`,
        }}
        className="relative bg-white pdf-page-shadow rounded-sm transition-transform duration-200 overflow-hidden"
      >
        {/* Crisp Vector PDF Canvas */}
        <canvas
          ref={canvasRef}
          className="block"
        />

        {/* Text Editing Layer Overlay */}
        <TextEditLayer
          pageIndex={pageMeta.pageIndex}
          textElements={textElements}
          selectedTextId={selectedTextId}
          onSelectText={onSelectText}
          onUpdateText={onUpdateText}
          activeTool={activeTool}
          zoom={zoom}
        />

        {/* Drawing & Shapes Vector Layer */}
        <AnnotationLayer
          pageIndex={pageMeta.pageIndex}
          width={scaledWidth}
          height={scaledHeight}
          annotations={annotations}
          activeTool={activeTool}
          strokeColor={strokeColor}
          onAddAnnotation={onAddAnnotation}
        />
      </div>

      <div className="mt-2 text-[11px] font-mono text-stone-500 font-medium">
        Page {pageMeta.pageNumber} • Crisp Vector View
      </div>
    </div>
  );
};
