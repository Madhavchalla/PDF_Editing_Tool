import React from 'react';
import {
  MousePointer,
  Type,
  PenLine,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Image as ImageIcon,
  Plus,
  Sliders,
  Type as TypeIcon,
  Minus,
} from 'lucide-react';
import { ActiveTool, TextElement } from '../../types/pdf';
import { ColorPicker } from '../common/ColorPicker';

interface FormattingToolbarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  selectedTextElement: TextElement | null;
  onUpdateSelectedText: (updated: Partial<TextElement>) => void;
  onDeleteSelected: () => void;
  onOpenSignatureModal: () => void;
  onInsertImageClick: () => void;
  strokeColor?: string;
  onStrokeColorChange?: (color: string) => void;
}

const FONT_FAMILIES = [
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Arial / Helvetica', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
];

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  activeTool,
  onSelectTool,
  selectedTextElement,
  onUpdateSelectedText,
  onDeleteSelected,
  onOpenSignatureModal,
  onInsertImageClick,
}) => {
  return (
    <aside className="w-72 shrink-0 bg-[#FAF9F6] dark:bg-[#1E1E1C] border-l border-[#E5E0D8] dark:border-[#2E2E2A] flex flex-col h-full shadow-paper-sm z-20 select-none overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-[#E5E0D8] dark:border-[#2E2E2A] flex items-center gap-2 bg-[#F2EDE4] dark:bg-[#252421] shrink-0">
        <Sliders className="w-4 h-4 text-[#C85A32]" />
        <h2 className="text-xs font-serif font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
          Tools & Formatting
        </h2>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Section 1: Main Tools */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Editing Mode
          </span>
          <div className="flex flex-col gap-1.5 bg-[#EFEBE1] dark:bg-[#292825] p-1.5 rounded-lg border border-[#E5E0D8] dark:border-[#383632]">
            <button
              onClick={() => onSelectTool('select')}
              className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activeTool === 'select'
                  ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                <span>Select & Drag</span>
              </div>
              {activeTool === 'select' && <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />}
            </button>

            <button
              onClick={() => onSelectTool('text-edit')}
              className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activeTool === 'text-edit'
                  ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span>Edit PDF Text</span>
              </div>
              {activeTool === 'text-edit' && <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />}
            </button>

            <button
              onClick={() => onSelectTool('text-add')}
              className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activeTool === 'text-add'
                  ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C85A32]" />
                <span>Add Text Box</span>
              </div>
              {activeTool === 'text-add' && <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />}
            </button>
          </div>
        </div>

        {/* Section 2: Insert Operations */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Insert Content
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSignatureModal}
              className="px-3 py-2.5 rounded-lg border border-[#E5E0D8] dark:border-[#383632] bg-white dark:bg-[#282724] hover:bg-[#F4F0E8] dark:hover:bg-[#32312D] text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <PenLine className="w-4 h-4 text-indigo-600" />
              <span>Signature</span>
            </button>

            <button
              onClick={onInsertImageClick}
              className="px-3 py-2.5 rounded-lg border border-[#E5E0D8] dark:border-[#383632] bg-white dark:bg-[#282724] hover:bg-[#F4F0E8] dark:hover:bg-[#32312D] text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Image</span>
            </button>
          </div>
        </div>

        {/* Section 3: Text Formatting Inspector */}
        <div className="space-y-3 pt-2 border-t border-[#E5E0D8] dark:border-[#2E2E2A]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Text Formatting
            </span>
            {selectedTextElement && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-semibold">
                Active
              </span>
            )}
          </div>

          {selectedTextElement ? (
            <div className="bg-white dark:bg-[#252421] p-3.5 rounded-xl border border-[#E5E0D8] dark:border-[#383632] space-y-4 shadow-paper-sm">
              {/* Font Family */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Font Family</label>
                <select
                  value={selectedTextElement.fontFamily}
                  onChange={(e) => onUpdateSelectedText({ fontFamily: e.target.value })}
                  className="w-full text-xs font-semibold bg-[#FAF9F6] dark:bg-[#383632] border border-stone-300 dark:border-stone-700 rounded-md px-2.5 py-2 text-stone-900 dark:text-stone-100 outline-none focus:ring-1 focus:ring-[#C85A32]"
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.value} value={f.value}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Font Size (pt)</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateSelectedText({ fontSize: Math.max(6, Number((selectedTextElement.fontSize - 0.5).toFixed(1))) })}
                    className="p-1.5 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedTextElement.fontSize}
                    onChange={(e) => onUpdateSelectedText({ fontSize: parseFloat(e.target.value) || 12 })}
                    className="flex-1 text-xs font-mono font-medium bg-[#FAF9F6] dark:bg-[#383632] border border-stone-300 dark:border-stone-700 rounded-md py-1.5 text-stone-900 dark:text-stone-100 outline-none text-center"
                  />
                  <button
                    onClick={() => onUpdateSelectedText({ fontSize: Number((selectedTextElement.fontSize + 0.5).toFixed(1)) })}
                    className="p-1.5 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Font Styles (B, I, U) */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Styles</label>
                <div className="flex items-center gap-1 bg-[#F5F2EB] dark:bg-[#1E1E1C] p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => onUpdateSelectedText({ fontWeight: selectedTextElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
                      selectedTextElement.fontWeight === 'bold' ? 'bg-[#C85A32] text-white shadow-xs' : 'text-stone-700 dark:text-stone-300 hover:bg-white'
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => onUpdateSelectedText({ fontStyle: selectedTextElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold italic transition-colors ${
                      selectedTextElement.fontStyle === 'italic' ? 'bg-[#C85A32] text-white shadow-xs' : 'text-stone-700 dark:text-stone-300 hover:bg-white'
                    }`}
                  >
                    I
                  </button>
                  <button
                    onClick={() => onUpdateSelectedText({ textDecoration: selectedTextElement.textDecoration === 'underline' ? 'none' : 'underline' })}
                    className={`flex-1 py-1.5 rounded text-xs flex items-center justify-center transition-colors ${
                      selectedTextElement.textDecoration === 'underline' ? 'bg-[#C85A32] text-white shadow-xs' : 'text-stone-700 dark:text-stone-300 hover:bg-white'
                    }`}
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Alignment</label>
                <div className="flex items-center gap-1 bg-[#F5F2EB] dark:bg-[#1E1E1C] p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => onUpdateSelectedText({ textAlign: 'left' })}
                    className={`flex-1 py-1.5 rounded text-xs flex items-center justify-center ${
                      selectedTextElement.textAlign === 'left' ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-xs' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateSelectedText({ textAlign: 'center' })}
                    className={`flex-1 py-1.5 rounded text-xs flex items-center justify-center ${
                      selectedTextElement.textAlign === 'center' ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-xs' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateSelectedText({ textAlign: 'right' })}
                    className={`flex-1 py-1.5 rounded text-xs flex items-center justify-center ${
                      selectedTextElement.textAlign === 'right' ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-xs' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Text Color</label>
                <div className="flex items-center justify-between p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#1E1E1C]">
                  <span className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300">
                    {selectedTextElement.color || '#1C1917'}
                  </span>
                  <ColorPicker
                    color={selectedTextElement.color || '#1C1917'}
                    onChange={(color) => onUpdateSelectedText({ color })}
                  />
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={onDeleteSelected}
                className="w-full mt-2 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Block</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#F4F0E8] dark:bg-[#252421] p-4 rounded-xl border border-[#E5E0D8] dark:border-[#383632] text-center space-y-2">
              <TypeIcon className="w-6 h-6 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif italic">
                Click any text block on the PDF canvas to edit its font, size, alignment, and color.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
