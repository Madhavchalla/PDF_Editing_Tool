import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  FileSpreadsheet, 
  Type, 
  PenTool, 
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onOpenFile: (file: File) => void;
  onLoadSamplePdf: (sampleName: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenFile,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onOpenFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col justify-between selection:bg-[#C85A32]/20">
      {/* Navbar */}
      <nav className="h-16 px-6 border-b border-[#E5E0D8] bg-[#FAF9F6]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#C85A32] text-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">
            PaperCraft <span className="text-[#C85A32] font-sans text-xs px-2 py-0.5 rounded bg-[#F0EBE1]">Studio</span>
          </span>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFEBE1] border border-[#E5E0D8] text-xs font-semibold text-stone-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Professional PDF & DOCX Editor Studio</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight max-w-3xl">
          Edit PDFs naturally like an <span className="italic text-[#C85A32] font-serif">MS Word</span> document.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed">
          Modify text content directly, format fonts, convert PDF ↔ DOCX, sign, watermark, and rearrange pages — with 100% client-side privacy.
        </p>

        {/* Dropzone Container */}
        <div className="w-full max-w-2xl mt-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer shadow-paper-lg relative overflow-hidden ${
              isDragOver
                ? 'border-[#C85A32] bg-[#FDF6F0] scale-[1.01]'
                : 'border-[#D4CBBB] bg-white hover:border-[#C85A32] hover:bg-[#FAF9F6]'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              id="hero-file-input"
            />

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FDF6F0] border border-[#F5E2D5] text-[#C85A32] flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="font-serif font-bold text-xl text-stone-900">
                Drop your PDF file here
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Supports all standard PDF documents for full inline editing
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <label
                  htmlFor="hero-file-input"
                  className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#b24e2a] text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer z-20"
                >
                  Browse Computer
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 w-full max-w-4xl text-left">
          <div className="p-4 bg-white border border-[#E5E0D8] rounded-xl shadow-paper-sm">
            <Type className="w-5 h-5 text-[#C85A32] mb-2" />
            <h4 className="font-bold text-xs text-stone-900">Direct Text Editing</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Click any text block in original PDF to edit like MS Word.</p>
          </div>

          <div className="p-4 bg-white border border-[#E5E0D8] rounded-xl shadow-paper-sm">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-bold text-xs text-stone-900">Export to MS Word</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Export PDF layout & text into editable Word docx files.</p>
          </div>

          <div className="p-4 bg-white border border-[#E5E0D8] rounded-xl shadow-paper-sm">
            <PenTool className="w-5 h-5 text-indigo-600 mb-2" />
            <h4 className="font-bold text-xs text-stone-900">Sign & Annotate</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Draw signature, type handwriting, and place images.</p>
          </div>

          <div className="p-4 bg-white border border-[#E5E0D8] rounded-xl shadow-paper-sm">
            <Layers className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-bold text-xs text-stone-900">Page Organizer</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Rotate, reorder, delete, and duplicate pages easily.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-[#E5E0D8] text-center text-xs text-stone-500">
        PaperCraft Studio • Private 100% In-Browser PDF Toolkit & Editor
      </footer>
    </div>
  );
};
