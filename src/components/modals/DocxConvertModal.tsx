import React from 'react';
import { X, FileSpreadsheet, FileText, ArrowRightLeft, Download, CheckCircle } from 'lucide-react';

interface DocxConvertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExportDocx: () => void;
    onImportDocx: (file: File) => void;
    isProcessing: boolean;
}

export const DocxConvertModal: React.FC<DocxConvertModalProps> = ({
    isOpen,
    onClose,
    onExportDocx,
    onImportDocx,
    isProcessing,
}) => {
    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportDocx(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 select-none">
            <div className="bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E0D8] dark:border-[#383632] rounded-xl shadow-paper-lg w-full max-w-lg overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b border-[#E5E0D8] dark:border-[#2E2E2A] flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        <span>PDF ↔ DOCX Converter Studio</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Option 1: Export PDF to DOCX */}
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-600 text-white shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                    Export PDF to MS Word (.docx)
                                </h4>
                                <p className="text-xs text-stone-600 dark:text-stone-400">
                                    Convert current PDF layout & text into an editable Word document.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                onExportDocx();
                                onClose();
                            }}
                            disabled={isProcessing}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export DOCX</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-300">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>High precision layout extraction: preserves text formatting, bold/italic, and page structure.</span>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#E5E0D8] dark:border-[#2E2E2A] flex justify-end bg-[#F5F2EB] dark:bg-[#252422]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
