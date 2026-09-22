import React from 'react';
import { Move } from 'lucide-react';
import { TextElement } from '../../types/pdf';

interface TextEditLayerProps {
  pageIndex: number;
  textElements: TextElement[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onUpdateText: (id: string, newText: string) => void;
  onUpdateTextPosition?: (id: string, x: number, y: number) => void;
  onUpdateTextBounds?: (id: string, x: number, width: number) => void;
  activeTool: string;
  zoom: number;
}

export const TextEditLayer: React.FC<TextEditLayerProps> = ({
  pageIndex,
  textElements,
  selectedTextId,
  onSelectText,
  onUpdateText,
  onUpdateTextPosition,
  onUpdateTextBounds,
  activeTool,
  zoom,
}) => {
  const pageTexts = textElements.filter(t => t.pageIndex === pageIndex);

  // Helper to extract clientX and clientY from mouse or touch event
  const getClientCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    const mouseEvt = e as MouseEvent;
    return { clientX: mouseEvt.clientX, clientY: mouseEvt.clientY };
  };

  // Drag Whole Text Box Position (x, y)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, item: TextElement) => {
    e.stopPropagation();
    onSelectText(item.id);

    const { clientX: startMouseX, clientY: startMouseY } = getClientCoords(e);
    const startX = item.x;
    const startY = item.y;

    const dragTargetEl = (e.currentTarget as HTMLElement).closest('.text-block-container') as HTMLElement;
    const pageContainer = (e.currentTarget as HTMLElement).closest('.relative');
    if (!pageContainer) return;

    const rect = pageContainer.getBoundingClientRect();
    const pageW = rect.width;
    const pageH = rect.height;

    let finalX = startX;
    let finalY = startY;

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getClientCoords(moveEvt);
      const dx = clientX - startMouseX;
      const dy = clientY - startMouseY;
      const dxPercent = (dx / pageW) * 100;
      const dyPercent = (dy / pageH) * 100;

      finalX = Math.max(0, Math.min(96, startX + dxPercent));
      finalY = Math.max(0, Math.min(96, startY + dyPercent));

      // Direct DOM style update during move for 60fps drag
      if (dragTargetEl) {
        dragTargetEl.style.left = `${finalX}%`;
        dragTargetEl.style.top = `${finalY}%`;
      }
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);

      if (onUpdateTextPosition && (finalX !== startX || finalY !== startY)) {
        onUpdateTextPosition(item.id, Number(finalX.toFixed(2)), Number(finalY.toFixed(2)));
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  // Stretch Left Edge Handle Dragging
  const handleResizeLeftStart = (e: React.MouseEvent | React.TouchEvent, item: TextElement) => {
    e.stopPropagation();
    onSelectText(item.id);

    const { clientX: startMouseX } = getClientCoords(e);
    const startX = item.x;
    const startW = item.width;

    const dragTargetEl = (e.currentTarget as HTMLElement).closest('.text-block-container') as HTMLElement;
    const pageContainer = (e.currentTarget as HTMLElement).closest('.relative');
    if (!pageContainer) return;

    const pageW = pageContainer.getBoundingClientRect().width;
    let finalX = startX;
    let finalW = startW;

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      const { clientX } = getClientCoords(moveEvt);
      const dx = clientX - startMouseX;
      const dxPercent = (dx / pageW) * 100;

      finalX = Math.max(0, Math.min(startX + startW - 2, startX + dxPercent));
      finalW = Math.max(2, startW - (finalX - startX));

      if (dragTargetEl) {
        dragTargetEl.style.left = `${finalX}%`;
        dragTargetEl.style.width = `${finalW}%`;
      }
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);

      if (onUpdateTextBounds && (finalX !== startX || finalW !== startW)) {
        onUpdateTextBounds(item.id, Number(finalX.toFixed(2)), Number(finalW.toFixed(2)));
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  // Stretch Right Edge Handle Dragging
  const handleResizeRightStart = (e: React.MouseEvent | React.TouchEvent, item: TextElement) => {
    e.stopPropagation();
    onSelectText(item.id);

    const { clientX: startMouseX } = getClientCoords(e);
    const startW = item.width;

    const dragTargetEl = (e.currentTarget as HTMLElement).closest('.text-block-container') as HTMLElement;
    const pageContainer = (e.currentTarget as HTMLElement).closest('.relative');
    if (!pageContainer) return;

    const pageW = pageContainer.getBoundingClientRect().width;
    let finalW = startW;

    const handleMove = (moveEvt: MouseEvent | TouchEvent) => {
      const { clientX } = getClientCoords(moveEvt);
      const dx = clientX - startMouseX;
      const dxPercent = (dx / pageW) * 100;

      finalW = Math.max(2, Math.min(100 - item.x, startW + dxPercent));

      if (dragTargetEl) {
        dragTargetEl.style.width = `${finalW}%`;
      }
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);

      if (onUpdateTextBounds && finalW !== startW) {
        onUpdateTextBounds(item.id, Number(item.x.toFixed(2)), Number(finalW.toFixed(2)));
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-visible select-text">
      {pageTexts.map((item) => {
        // Render solid white patch for deleted text blocks to erase them from screen
        if (item.isDeleted) {
          const eraseX = item.originalX !== undefined ? item.originalX : item.x;
          const eraseY = item.originalY !== undefined ? item.originalY : item.y;
          const eraseW = item.originalWidth !== undefined ? item.originalWidth : item.width;
          const eraseH = item.originalHeight !== undefined ? item.originalHeight : item.height;

          return (
            <div
              key={item.id}
              style={{
                left: `${eraseX}%`,
                top: `${eraseY}%`,
                width: `${Math.min(100 - eraseX, eraseW + 1.5)}%`,
                height: `${eraseH + 0.4}%`,
              }}
              className="absolute bg-white z-30 pointer-events-none"
            />
          );
        }

        const isSelected = selectedTextId === item.id;
        const isModifiedOrNew = item.isModified || item.isNew;
        const isActivelyEditing = isSelected;

        // Erase original canvas text whenever existing text is selected, modified, or deleted (never for newly inserted text boxes)
        const shouldEraseOriginal = !item.isNew && (isSelected || item.isModified || item.isDeleted);
        const origX = item.originalX !== undefined ? item.originalX : item.x;
        const origY = item.originalY !== undefined ? item.originalY : item.y;
        const origW = item.originalWidth !== undefined ? item.originalWidth : item.width;
        const origH = item.originalHeight !== undefined ? item.originalHeight : item.height;

        // Exact scaled font size matching canvas scale
        const scaledFontSize = Math.max(9, item.fontSize * zoom);

        // PDF House Style: Tight boundary calculation matching exact text width
        const boxLeft = item.x;
        const boxWidth = Math.min(100 - item.x, Math.max(item.width + 1.5, 4));

        return (
          <React.Fragment key={item.id}>
            {/* White-out patch for original location if existing text is selected, modified, or deleted */}
            {shouldEraseOriginal && (
              <div
                style={{
                  left: `${origX}%`,
                  top: `${origY}%`,
                  width: `${Math.min(100 - origX, origW)}%`,
                  height: `${origH}%`,
                }}
                className="absolute bg-white z-10 pointer-events-none"
              />
            )}

            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelectText(item.id);
              }}
              style={{
                left: `${boxLeft}%`,
                top: `${item.y}%`,
                width: `${boxWidth}%`,
                fontSize: `${scaledFontSize}px`,
                fontFamily: item.fontFamily,
                fontWeight: item.fontWeight,
                fontStyle: item.fontStyle,
                textDecoration: item.textDecoration,
                color: item.color || '#1C1917',
                textAlign: item.textAlign,
                lineHeight: '1.25',
              }}
              className={`text-block-container absolute transition-none p-0 m-0 border outline-none bg-transparent overflow-visible ${
                isSelected
                  ? 'border-blue-600 border-dashed z-30 ring-1 ring-blue-500/30 rounded-2xs'
                  : 'border-transparent hover:border-blue-400/60 hover:border-dashed z-20'
              }`}
            >
              {/* PDF House Style Move Grip Handle */}
              {isSelected && (
                <div
                  onMouseDown={(e) => handleDragStart(e, item)}
                  onTouchStart={(e) => handleDragStart(e, item)}
                  className="absolute -top-6 right-0 h-6 px-2 bg-blue-600 text-white rounded-t flex items-center justify-center cursor-move select-none shadow-xs z-40 hover:bg-blue-700 transition-colors"
                  title="Click or Touch & Drag to move text block"
                >
                  <Move className="w-3.5 h-3.5 text-white cursor-move" />
                </div>
              )}

              {/* Left Stretch Handle (Blue Circle with enlarged touch target) */}
              {isSelected && (
                <div
                  onMouseDown={(e) => handleResizeLeftStart(e, item)}
                  onTouchStart={(e) => handleResizeLeftStart(e, item)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-ew-resize z-50 touch-none"
                  title="Drag to stretch left"
                >
                  <div className="w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-md hover:scale-125 transition-transform" />
                </div>
              )}

              {/* Right Stretch Handle (Blue Circle with enlarged touch target) */}
              {isSelected && (
                <div
                  onMouseDown={(e) => handleResizeRightStart(e, item)}
                  onTouchStart={(e) => handleResizeRightStart(e, item)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-ew-resize z-50 touch-none"
                  title="Drag to stretch right"
                >
                  <div className="w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-md hover:scale-125 transition-transform" />
                </div>
              )}

              {isActivelyEditing || isModifiedOrNew ? (
                <textarea
                  value={item.text}
                  onChange={(e) => onUpdateText(item.id, e.target.value)}
                  rows={Math.max(1, item.text.split('\n').length)}
                  className="w-full text-stone-900 resize-none p-0 m-0 block select-text whitespace-pre-wrap focus:outline-none focus:ring-0 focus:border-none shadow-none ring-0 bg-transparent overflow-visible"
                  style={{
                    fontSize: `${scaledFontSize}px`,
                    fontFamily: item.fontFamily,
                    fontWeight: item.fontWeight,
                    fontStyle: item.fontStyle,
                    textAlign: item.textAlign,
                    color: item.color || '#1C1917',
                    lineHeight: '1.25',
                    padding: '0px',
                    margin: '0px',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                    height: 'auto',
                  }}
                  autoFocus={isSelected}
                />
              ) : (
                // PDF House Style Click Target
                <div 
                  onMouseDown={(e) => {
                    if (activeTool === 'move-text') {
                      handleDragStart(e, item);
                    }
                  }}
                  onTouchStart={(e) => {
                    if (activeTool === 'move-text') {
                      handleDragStart(e, item);
                    }
                  }}
                  className="w-full h-full pointer-events-auto cursor-text min-h-[14px] border-none outline-none bg-transparent" 
                />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
