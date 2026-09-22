import React from 'react';
import { RotateCcw, RotateCw, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageMeta } from '../../types/pdf';
import { PageThumbnailCanvas } from './PageThumbnailCanvas';

interface PageSidebarProps {
  pdfBytes: ArrayBuffer | null;
  pagesMeta: PageMeta[];
  activePageIndex: number;
  onSelectPage: (pageIndex: number) => void;
  onRotatePage: (pageIndex: number, degreesDelta: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onDuplicatePage: (pageIndex: number) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export const PageSidebar: React.FC<PageSidebarProps> = ({
  pdfBytes,
  pagesMeta,
  activePageIndex,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
  isOpen,
  onToggleSidebar,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggleSidebar}
        className="fixed left-3 top-24 z-30 p-2 bg-white dark:bg-[#282724] border border-[#E5E0D8] dark:border-[#383632] rounded-r-lg shadow-paper-md text-stone-700 dark:text-stone-300 hover:bg-[#F5F2EB] transition-colors"
        title="Show Page Thumbnails"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside className="w-56 bg-[#FAF9F6] border-r border-[#E5E0D8] flex flex-col h-[calc(100vh-7rem)] select-none z-20 shadow-paper-sm transition-all">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-[#E5E0D8] flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">
          Pages ({pagesMeta.length})
        </h2>
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded text-stone-500 hover:bg-stone-200 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pagesMeta.map((meta, index) => {
          const isActive = index === activePageIndex;
          return (
            <div
              key={`thumb-${index}`}
              onClick={() => onSelectPage(index)}
              className={`group relative p-2 rounded-lg border transition-all cursor-pointer ${isActive
                  ? 'bg-white border-[#C85A32] shadow-paper-md ring-2 ring-[#C85A32]/20'
                  : 'bg-white/60 border-stone-200 hover:border-stone-400'
                }`}
            >
              {/* Real PDF Page Thumbnail */}
              <div className="aspect-[1/1.4] bg-white border border-stone-200 rounded flex items-center justify-center relative overflow-hidden shadow-inner">
                {pdfBytes ? (
                  <PageThumbnailCanvas
                    pdfBytes={pdfBytes}
                    pageNumber={meta.pageNumber}
                    rotation={meta.rotation}
                  />
                ) : (
                  <span className="text-2xl font-serif text-stone-300 font-bold">
                    {meta.pageNumber}
                  </span>
                )}
              </div>

              {/* Page Actions Toolbar */}
              <div className="mt-2 flex items-center justify-between text-xs text-stone-600">
                <span className="font-mono font-semibold">#{meta.pageNumber}</span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(index, -90);
                    }}
                    className="p-1 hover:bg-stone-100 rounded"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(index, 90);
                    }}
                    className="p-1 hover:bg-stone-100 rounded"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(index);
                    }}
                    className="p-1 hover:bg-stone-100 rounded"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3 text-stone-600" />
                  </button>

                  {pagesMeta.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                      }}
                      className="p-1 hover:bg-red-50 text-red-600 rounded"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
