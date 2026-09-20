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
    <div className="bg-[#FAF9F6] dark:bg-[#1E1E1C] border-b border-[#E5E0D8] dark:border-[#2E2E2A] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-paper-sm z-20 select-none">
      {/* Tool Selectors */}
      <div className="flex items-center gap-1 bg-[#EFEBE1] dark:bg-[#292825] p-1 rounded-lg border border-[#E5E0D8] dark:border-[#383632]">
        <button
          onClick={() => onSelectTool('select')}
          className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTool === 'select'
              ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-sm'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/50'
          }`}
          title="Select & Drag Cursor"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select</span>
        </button>

        <button
          onClick={() => onSelectTool('text-edit')}
          className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTool === 'text-edit'
              ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-sm'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/50'
          }`}
          title="Edit PDF Text (Click any text on PDF)"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Edit text</span>
        </button>

        <button
          onClick={() => onSelectTool('text-add')}
          className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
            activeTool === 'text-add'
              ? 'bg-white dark:bg-[#383632] text-[#C85A32] font-semibold shadow-sm'
              : 'text-stone-700 dark:text-stone-300 hover:bg-white/50'
          }`}
          title="Add New Text Box"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add text</span>
        </button>

        <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-0.5" />

        <button
          onClick={onOpenSignatureModal}
          className="px-2.5 py-1.5 rounded text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-white/50 flex items-center gap-1.5 transition-colors"
          title="Add Signature"
        >
          <PenLine className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sign</span>
        </button>

        <button
          onClick={onInsertImageClick}
          className="px-2.5 py-1.5 rounded text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-white/50 flex items-center gap-1.5 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Image</span>
        </button>
      </div>

      {/* PDF House Style In-Place Property Inspector */}
      <div className="flex items-center gap-2">
        {selectedTextElement && (
          <div className="flex items-center gap-1.5 bg-[#EFEBE1] dark:bg-[#292825] p-1 rounded-lg border border-[#E5E0D8] dark:border-[#383632]">
            {/* Auto-Inherited Font Family */}
            <select
              value={selectedTextElement.fontFamily}
              onChange={(e) => onUpdateSelectedText({ fontFamily: e.target.value })}
              className="text-xs font-semibold bg-white dark:bg-[#383632] border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-stone-900 dark:text-stone-100 outline-none"
            >
              {FONT_FAMILIES.map(f => (
                <option key={f.value} value={f.value}>{f.name}</option>
              ))}
            </select>

            {/* Auto-Inherited Exact Font Size (e.g. 13.92) */}
            <input
              type="number"
              step="0.1"
              value={selectedTextElement.fontSize}
              onChange={(e) => onUpdateSelectedText({ fontSize: parseFloat(e.target.value) || 12 })}
              className="text-xs font-mono font-medium bg-white dark:bg-[#383632] border border-stone-300 dark:border-stone-700 rounded px-1.5 py-1 text-stone-900 dark:text-stone-100 outline-none w-16 text-center"
              title="Font Size (pt)"
            />

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />

            {/* Auto-Inherited Bold (B) */}
            <button
              onClick={() => onUpdateSelectedText({ fontWeight: selectedTextElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                selectedTextElement.fontWeight === 'bold' ? 'bg-[#C85A32] text-white' : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
              title="Bold"
            >
              B
            </button>

            {/* Auto-Inherited Italic (I) */}
            <button
              onClick={() => onUpdateSelectedText({ fontStyle: selectedTextElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
              className={`px-2 py-1 rounded text-xs font-semibold italic transition-colors ${
                selectedTextElement.fontStyle === 'italic' ? 'bg-[#C85A32] text-white' : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
              title="Italic"
            >
              I
            </button>

            {/* Underline */}
            <button
              onClick={() => onUpdateSelectedText({ textDecoration: selectedTextElement.textDecoration === 'underline' ? 'none' : 'underline' })}
              className={`p-1.5 rounded text-xs transition-colors ${
                selectedTextElement.textDecoration === 'underline' ? 'bg-[#C85A32] text-white' : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />

            {/* Auto-Inherited Color Picker */}
            <ColorPicker
              color={selectedTextElement.color || '#1C1917'}
              onChange={(color) => onUpdateSelectedText({ color })}
            />

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />

            {/* Alignment */}
            <button
              onClick={() => onUpdateSelectedText({ textAlign: 'left' })}
              className={`p-1.5 rounded text-xs ${selectedTextElement.textAlign === 'left' ? 'bg-white dark:bg-[#383632] text-[#C85A32]' : 'text-stone-700'}`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateSelectedText({ textAlign: 'center' })}
              className={`p-1.5 rounded text-xs ${selectedTextElement.textAlign === 'center' ? 'bg-white dark:bg-[#383632] text-[#C85A32]' : 'text-stone-700'}`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateSelectedText({ textAlign: 'right' })}
              className={`p-1.5 rounded text-xs ${selectedTextElement.textAlign === 'right' ? 'bg-white dark:bg-[#383632] text-[#C85A32]' : 'text-stone-700'}`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />

            {/* Delete Selected */}
            <button
              onClick={onDeleteSelected}
              className="p-1.5 rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              title="Delete Selected Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
