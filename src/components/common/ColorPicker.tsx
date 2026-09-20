import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  { name: 'Stone Charcoal', hex: '#1C1917' },
  { name: 'Warm Terracotta', hex: '#C85A32' },
  { name: 'Sage Green', hex: '#4A7C59' },
  { name: 'Deep Navy', hex: '#1E3A8A' },
  { name: 'Warm Amber', hex: '#D97706' },
  { name: 'Rich Crimson', hex: '#991B1B' },
  { name: 'Deep Purple', hex: '#581C87' },
  { name: 'Soft Slate', hex: '#475569' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {label && <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 rounded border border-[#E5E0D8] bg-white hover:border-[#C85A32] transition-colors shadow-sm"
        title="Select Color"
      >
        <span
          className="w-5 h-5 rounded-sm border border-stone-300"
          style={{ backgroundColor: color }}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 z-50 p-3 bg-white border border-[#E5E0D8] rounded-lg shadow-paper-md w-48">
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    onChange(c.hex);
                    setIsOpen(false);
                  }}
                  className="w-7 h-7 rounded border border-stone-200 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {color.toLowerCase() === c.hex.toLowerCase() && (
                    <Check className={`w-3.5 h-3.5 ${c.hex === '#FFFFFF' ? 'text-stone-900' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-500 font-mono">HEX:</span>
              <input
                type="text"
                value={color}
                onChange={e => onChange(e.target.value)}
                className="w-full text-xs font-mono px-2 py-1 border border-stone-200 rounded focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
