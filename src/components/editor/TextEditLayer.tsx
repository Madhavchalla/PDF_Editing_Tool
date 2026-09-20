import React from 'react';
import { TextElement } from '../../types/pdf';

interface TextEditLayerProps {
  pageIndex: number;
  textElements: TextElement[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onUpdateText: (id: string, newText: string) => void;
  activeTool: string;
  zoom: number;
}

export const TextEditLayer: React.FC<TextEditLayerProps> = ({
  pageIndex,
  textElements,
  selectedTextId,
  onSelectText,
  onUpdateText,
  activeTool,
  zoom,
}) => {
  const pageTexts = textElements.filter(t => t.pageIndex === pageIndex);

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-visible select-text">
      {pageTexts.map((item) => {
        // Render solid white patch for deleted text blocks to erase them from screen
        if (item.isDeleted) {
          return (
            <div
              key={item.id}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${Math.min(100 - item.x, item.width + 2)}%`,
                height: `${item.height + 0.5}%`,
              }}
              className="absolute bg-white z-30 pointer-events-none"
            />
          );
        }

        const isSelected = selectedTextId === item.id;
        const isModifiedOrNew = item.isModified || item.isNew;
        const isActivelyEditing = isSelected;

        // Exact scaled font size matching canvas scale
        const scaledFontSize = Math.max(9, item.fontSize * zoom);

        const isCenter = item.textAlign === 'center';
        const boxLeft = isCenter ? Math.max(2, item.x - 6) : item.x;
        const boxWidth = isCenter 
          ? Math.min(96, item.width + 12) 
          : Math.min(100 - item.x, Math.max(item.width + 6, 35));

        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectText(item.id);
            }}
            style={{
              left: `${boxLeft}%`,
              top: `${item.y}%`,
              width: `${boxWidth}%`,
              minHeight: `${item.height}%`,
              fontSize: `${scaledFontSize}px`,
              fontFamily: item.fontFamily,
              fontWeight: item.fontWeight,
              fontStyle: item.fontStyle,
              textDecoration: item.textDecoration,
              color: item.color || '#1C1917',
              textAlign: item.textAlign,
              lineHeight: '1.2',
            }}
            className={`absolute cursor-text transition-none p-0 m-0 border-none outline-none ${
              isActivelyEditing || isModifiedOrNew
                ? 'bg-white z-30 shadow-xs'
                : 'bg-transparent z-10'
            }`}
          >
            {isActivelyEditing || isModifiedOrNew ? (
              <textarea
                value={item.text}
                onChange={(e) => onUpdateText(item.id, e.target.value)}
                rows={Math.max(1, item.text.split('\n').length)}
                className="w-full h-full bg-white text-stone-900 resize-none p-0 m-0 block select-text whitespace-pre-wrap focus:outline-none focus:ring-0 focus:border-none shadow-none ring-0"
                style={{
                  fontSize: `${scaledFontSize}px`,
                  fontFamily: item.fontFamily,
                  fontWeight: item.fontWeight,
                  fontStyle: item.fontStyle,
                  textAlign: item.textAlign,
                  color: item.color || '#1C1917',
                  lineHeight: '1.2',
                  padding: '0px',
                  margin: '0px',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  background: '#FFFFFF',
                }}
                autoFocus={isSelected}
              />
            ) : (
              // Invisible click target
              <div className="w-full h-full pointer-events-auto cursor-text min-h-[14px] border-none outline-none bg-transparent" />
            )}
          </div>
        );
      })}
    </div>
  );
};
