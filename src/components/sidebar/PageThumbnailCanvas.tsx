import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PageThumbnailCanvasProps {
  pdfBytes: ArrayBuffer;
  pageNumber: number;
  rotation?: number;
}

export const PageThumbnailCanvas: React.FC<PageThumbnailCanvasProps> = ({
  pdfBytes,
  pageNumber,
  rotation = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const renderThumbnail = async () => {
      if (!canvasRef.current || !pdfBytes) return;

      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(pageNumber);

        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 0.25, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.warn('Thumbnail render fallback:', err);
      }
    };

    renderThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [pdfBytes, pageNumber, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain block bg-white"
    />
  );
};
