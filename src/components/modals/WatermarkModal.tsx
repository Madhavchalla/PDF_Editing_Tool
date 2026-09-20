import React, { useState } from 'react';
import { X, Stamp, Check } from 'lucide-react';
import { WatermarkConfig } from '../../types/pdf';
import { ColorPicker } from '../common/ColorPicker';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  watermark: WatermarkConfig;
  onUpdateWatermark: (config: WatermarkConfig) => void;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
  watermark,
  onUpdateWatermark,
}) => {
  const [config, setConfig] = useState<WatermarkConfig>(watermark);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateWatermark(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E0D8] dark:border-[#383632] rounded-xl shadow-paper-lg w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E5E0D8] dark:border-[#2E2E2A] flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Stamp className="w-5 h-5 text-amber-600" />
            <span>Document Watermark Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-[#282724] border border-stone-200 dark:border-stone-800 rounded-lg">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Enable Watermark on PDF
            </span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 text-[#C85A32] accent-[#C85A32] rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              Watermark Text:
            </label>
            <input
              type="text"
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              className="w-full text-xs p-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-[#282724] outline-none focus:border-[#C85A32]"
              placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Font Size: {config.fontSize} pt
              </label>
              <input
                type="range"
                min="20"
                max="90"
                value={config.fontSize}
                onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                className="w-full accent-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Opacity: {Math.round(config.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={config.opacity}
                onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                className="w-full accent-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Rotation Angle: {config.rotation}°
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                value={config.rotation}
                onChange={(e) => setConfig({ ...config, rotation: Number(e.target.value) })}
                className="w-full accent-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Watermark Color:
              </label>
              <ColorPicker
                color={config.color}
                onChange={(color) => setConfig({ ...config, color })}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E0D8] dark:border-[#2E2E2A] flex justify-end gap-2 bg-[#F5F2EB] dark:bg-[#252422]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#b24e2a] rounded-md shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Watermark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
