import React, { useRef, useState } from 'react';
import { Annotation, ActiveTool, DrawingPoint } from '../../types/pdf';

interface AnnotationLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  annotations: Annotation[];
  activeTool: ActiveTool;
  strokeColor: string;
  onAddAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation?: (id: string) => void;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  pageIndex,
  width,
  height,
  annotations,
  activeTool,
  strokeColor,
  onAddAnnotation,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const [shapeStart, setShapeStart] = useState<DrawingPoint | null>(null);
  const [currentShape, setCurrentShape] = useState<DrawingPoint | null>(null);

  const isDrawingTool = activeTool === 'draw-pen' || activeTool === 'draw-highlighter';
  const isShapeTool = activeTool === 'shape-rect' || activeTool === 'shape-circle' || activeTool === 'shape-line' || activeTool === 'shape-arrow';

  const pageAnnots = annotations.filter(a => a.pageIndex === pageIndex);

  const getRelativeCoords = (e: React.MouseEvent<SVGSVGElement>): DrawingPoint => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingTool && !isShapeTool) return;

    const point = getRelativeCoords(e);
    setIsDrawing(true);

    if (isDrawingTool) {
      setCurrentPoints([point]);
    } else if (isShapeTool) {
      setShapeStart(point);
      setCurrentShape(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const point = getRelativeCoords(e);

    if (isDrawingTool) {
      setCurrentPoints(prev => [...prev, point]);
    } else if (isShapeTool) {
      setCurrentShape(point);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (isDrawingTool && currentPoints.length > 1) {
      const newAnn: Annotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageIndex,
        type: activeTool === 'draw-highlighter' ? 'highlighter' : 'pen',
        points: currentPoints,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        strokeColor: activeTool === 'draw-highlighter' ? '#FDE047' : strokeColor,
        strokeWidth: activeTool === 'draw-highlighter' ? 14 : 3,
        opacity: activeTool === 'draw-highlighter' ? 0.4 : 1.0,
      };
      onAddAnnotation(newAnn);
    } else if (isShapeTool && shapeStart && currentShape) {
      const x = Math.min(shapeStart.x, currentShape.x);
      const y = Math.min(shapeStart.y, currentShape.y);
      const w = Math.abs(currentShape.x - shapeStart.x);
      const h = Math.abs(currentShape.y - shapeStart.y);

      let type: Annotation['type'] = 'rect';
      if (activeTool === 'shape-circle') type = 'circle';
      if (activeTool === 'shape-line') type = 'line';
      if (activeTool === 'shape-arrow') type = 'arrow';

      const newAnn: Annotation = {
        id: `shape-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageIndex,
        type,
        x,
        y,
        width: Math.max(1, w),
        height: Math.max(1, h),
        strokeColor,
        strokeWidth: 3,
        opacity: 1.0,
      };
      onAddAnnotation(newAnn);
    }

    setCurrentPoints([]);
    setShapeStart(null);
    setCurrentShape(null);
  };

  return (
    <svg
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`absolute inset-0 w-full h-full z-10 ${
        isDrawingTool || isShapeTool ? 'cursor-crosshair' : 'pointer-events-none'
      }`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Existing Saved Annotations */}
      {pageAnnots.map((ann) => {
        if ((ann.type === 'pen' || ann.type === 'highlighter') && ann.points) {
          const pathString = ann.points
            .map((p, idx) => {
              const absX = (p.x / 100) * width;
              const absY = (p.y / 100) * height;
              return `${idx === 0 ? 'M' : 'L'} ${absX} ${absY}`;
            })
            .join(' ');

          return (
            <path
              key={ann.id}
              d={pathString}
              stroke={ann.strokeColor}
              strokeWidth={ann.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={ann.opacity}
            />
          );
        }

        const absX = (ann.x / 100) * width;
        const absY = (ann.y / 100) * height;
        const absW = (ann.width / 100) * width;
        const absH = (ann.height / 100) * height;

        if (ann.type === 'rect') {
          return (
            <rect
              key={ann.id}
              x={absX}
              y={absY}
              width={absW}
              height={absH}
              stroke={ann.strokeColor}
              strokeWidth={ann.strokeWidth}
              fill={ann.fillColor || 'none'}
              opacity={ann.opacity}
              rx={4}
            />
          );
        }

        if (ann.type === 'circle') {
          return (
            <ellipse
              key={ann.id}
              cx={absX + absW / 2}
              cy={absY + absH / 2}
              rx={absW / 2}
              ry={absH / 2}
              stroke={ann.strokeColor}
              strokeWidth={ann.strokeWidth}
              fill={ann.fillColor || 'none'}
              opacity={ann.opacity}
            />
          );
        }

        if (ann.type === 'line' || ann.type === 'arrow') {
          return (
            <g key={ann.id}>
              <line
                x1={absX}
                y1={absY}
                x2={absX + absW}
                y2={absY + absH}
                stroke={ann.strokeColor}
                strokeWidth={ann.strokeWidth}
                opacity={ann.opacity}
              />
              {ann.type === 'arrow' && (
                <polygon
                  points={`${absX + absW},${absY + absH} ${absX + absW - 8},${absY + absH - 5} ${absX + absW - 8},${absY + absH + 5}`}
                  fill={ann.strokeColor}
                />
              )}
            </g>
          );
        }

        if ((ann.type === 'image' || ann.type === 'stamp') && ann.imageSrc) {
          return (
            <image
              key={ann.id}
              href={ann.imageSrc}
              x={absX}
              y={absY}
              width={absW}
              height={absH}
              preserveAspectRatio="none"
            />
          );
        }

        return null;
      })}

      {/* In-Progress Drawing Preview */}
      {isDrawing && currentPoints.length > 1 && (
        <path
          d={currentPoints
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${(p.x / 100) * width} ${(p.y / 100) * height}`)
            .join(' ')}
          stroke={activeTool === 'draw-highlighter' ? '#FDE047' : strokeColor}
          strokeWidth={activeTool === 'draw-highlighter' ? 14 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={activeTool === 'draw-highlighter' ? 0.4 : 1.0}
        />
      )}

      {/* In-Progress Shape Preview */}
      {isDrawing && shapeStart && currentShape && (
        <rect
          x={(Math.min(shapeStart.x, currentShape.x) / 100) * width}
          y={(Math.min(shapeStart.y, currentShape.y) / 100) * height}
          width={(Math.abs(currentShape.x - shapeStart.x) / 100) * width}
          height={(Math.abs(currentShape.y - shapeStart.y) / 100) * height}
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="none"
        />
      )}
    </svg>
  );
};
