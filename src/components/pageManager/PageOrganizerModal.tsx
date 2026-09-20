import React from 'react';
import { X, RotateCcw, RotateCw, Trash2, Copy, LayoutGrid, Check } from 'lucide-react';
import { PageMeta } from '../../types/pdf';
import { PageThumbnailCanvas } from '../sidebar/PageThumbnailCanvas';

interface PageOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBytes: ArrayBuffer | null;
  pagesMeta: PageMeta[];
  onRotatePage: (pageIndex: number, degreesDelta: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onDuplicatePage: (pageIndex: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

export const PageOrganizerModal: React.FC<PageOrganizerModalProps> = ({
  isOpen,
  onClose,
  pdfBytes,
  pagesMeta,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-6 select-none">
      <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl shadow-paper-lg w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Page Organizer Studio ({pagesMeta.length} Pages)
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Grid of Page Thumbnails */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 bg-[#F5F2EB]/50">
          {pagesMeta.map((meta, index) => (
            <div
              key={`org-page-${index}`}
              className="bg-white border border-[#E5E0D8] rounded-xl p-3 shadow-paper-sm hover:shadow-paper-md transition-all flex flex-col items-center group relative"
            >
              {/* Thumbnail Container */}
              <div
                style={{ transform: `rotate(${meta.rotation || 0}deg)` }}
                className="w-full aspect-[1/1.4] bg-white border border-stone-200 rounded-lg flex flex-col items-center justify-center relative shadow-inner transition-transform overflow-hidden"
              >
                {pdfBytes ? (
                  <PageThumbnailCanvas
                    pdfBytes={pdfBytes}
                    pageNumber={meta.pageNumber}
                    rotation={meta.rotation}
                  />
                ) : (
                  <span className="text-3xl font-serif text-stone-300 font-bold">
                    {meta.pageNumber}
                  </span>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="w-full mt-3 flex items-center justify-between text-xs text-stone-700">
                <span className="font-mono font-bold">Page {meta.pageNumber}</span>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-md">
                  <button
                    onClick={() => onRotatePage(index, -90)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Rotate Counter-Clockwise"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
                  </button>
                  <button
                    onClick={() => onRotatePage(index, 90)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-stone-700" />
                  </button>
                  <button
                    onClick={() => onDuplicatePage(index)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3.5 h-3.5 text-stone-700" />
                  </button>
                  {pagesMeta.length > 1 && (
                    <button
                      onClick={() => onDeletePage(index)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E0D8] flex items-center justify-between bg-[#F5F2EB]">
          <span className="text-xs text-stone-500 font-medium">
            Total {pagesMeta.length} Pages • Rotate, duplicate, or delete pages easily.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#b24e2a] rounded-md shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Done Organizing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
