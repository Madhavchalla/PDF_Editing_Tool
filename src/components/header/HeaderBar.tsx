import React from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldAlert,
  FolderOpen,
  LayoutGrid,
} from 'lucide-react';

interface HeaderBarProps {
  documentName: string;
  onDocumentNameChange: (name: string) => void;
  onOpenFile: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onOpenPageOrganizer: () => void;
  onOpenWatermarkModal?: () => void;
  onOpenSecurityModal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  isExporting: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  documentName,
  onDocumentNameChange,
  onOpenFile,
  onExportPdf,
  onExportDocx,
  onOpenPageOrganizer,
  onOpenSecurityModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  isExporting,
}) => {
  return (
    <header className="h-14 bg-[#FAF9F6] dark:bg-[#1E1E1C] border-b border-[#E5E0D8] dark:border-[#2E2E2A] px-4 flex items-center justify-between select-none shadow-paper-sm z-30">
      {/* Left: Brand logo & Document Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenFile}>
          <div className="w-9 h-9 rounded-lg bg-[#C85A32] text-white flex items-center justify-center shadow-sm hover:bg-[#b24e2a] transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              PaperCraft <span className="font-sans text-xs font-semibold px-1.5 py-0.5 rounded bg-[#F0EBE1] dark:bg-[#2E2E2A] text-[#C85A32]">PDF</span>
            </h1>
          </div>
        </div>

        <div className="h-5 w-px bg-stone-300 dark:bg-stone-700 mx-1 hidden sm:block" />

        {/* Editable Title */}
        <div className="hidden sm:flex items-center gap-2">
          <input
            type="text"
            value={documentName}
            onChange={(e) => onDocumentNameChange(e.target.value)}
            className="text-xs font-medium bg-transparent border border-transparent hover:border-stone-300 focus:border-[#C85A32] focus:bg-white dark:focus:bg-[#282724] px-2 py-1 rounded text-stone-800 dark:text-stone-200 outline-none w-44 md:w-60 truncate transition-colors"
            placeholder="Document Name"
          />
        </div>
      </div>

      {/* Middle: Undo/Redo & Zoom Controls */}
      <div className="flex items-center gap-1 bg-[#EFEBE1] dark:bg-[#292825] p-1 rounded-lg border border-[#E5E0D8] dark:border-[#383632]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-[#383632] disabled:opacity-40 disabled:hover:bg-transparent text-stone-700 dark:text-stone-300 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-[#383632] disabled:opacity-40 disabled:hover:bg-transparent text-stone-700 dark:text-stone-300 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />

        <button
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-[#383632] text-stone-700 dark:text-stone-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium px-1 min-w-[40px] text-center text-stone-700 dark:text-stone-300">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-[#383632] text-stone-700 dark:text-stone-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => onZoomChange(1.0)}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-[#383632] text-stone-700 dark:text-stone-300 transition-colors"
          title="Reset Zoom"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions & Download/Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPageOrganizer}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-[#282724] border border-[#E5E0D8] dark:border-[#383632] hover:bg-[#F5F2EB] dark:hover:bg-[#32312D] rounded-md transition-colors"
          title="Page Organizer Grid"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
          <span>Pages</span>
        </button>

        <button
          onClick={onOpenSecurityModal}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-[#282724] border border-[#E5E0D8] dark:border-[#383632] hover:bg-[#F5F2EB] dark:hover:bg-[#32312D] rounded-md transition-colors"
          title="Protect PDF Password"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protect</span>
        </button>

        <button
          onClick={onOpenFile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-[#282724] border border-[#E5E0D8] dark:border-[#383632] hover:bg-[#F5F2EB] dark:hover:bg-[#32312D] rounded-md transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
          <span className="hidden sm:inline">Open</span>
        </button>

        {/* Export to Word button */}
        <button
          onClick={onExportDocx}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-all shadow-sm"
          title="Export PDF to Word (.docx)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Export DOCX</span>
        </button>

        {/* Main Download PDF button */}
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#b24e2a] rounded-md transition-all shadow-sm disabled:opacity-50"
        >
          {isExporting ? (
            <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Download PDF</span>
        </button>
      </div>
    </header>
  );
};
