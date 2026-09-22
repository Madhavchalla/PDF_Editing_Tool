import React, { useRef, useState } from 'react';
import { X, PenTool, Type, Upload, Check } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string, title: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('John Doe');
  const [selectedFont, setSelectedFont] = useState('"Dancing Script", cursive');
  const [sigColor, setSigColor] = useState('#1C1917');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen) return null;

  // Handle Draw Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        onSaveSignature(canvas.toDataURL(), 'Handwritten Signature');
      }
    } else if (activeTab === 'type') {
      // Render typed text to temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 120;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.font = `44px ${selectedFont}`;
        ctx.fillStyle = sigColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || 'Signature', 200, 60);
        onSaveSignature(tempCanvas.toDataURL(), `Typed (${typedName})`);
      }
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSaveSignature(event.target.result as string, 'Uploaded Image Signature');
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-4 select-none">
      <div className="bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E0D8] dark:border-[#383632] rounded-xl shadow-paper-lg w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E5E0D8] dark:border-[#2E2E2A] flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#C85A32]" />
            <span>Create Signature</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E5E0D8] dark:border-[#2E2E2A] bg-[#F5F2EB] dark:bg-[#252422]">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'draw'
                ? 'border-[#C85A32] text-[#C85A32] bg-white dark:bg-[#1E1E1C]'
                : 'border-transparent text-stone-600 dark:text-stone-400'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>

          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'type'
                ? 'border-[#C85A32] text-[#C85A32] bg-white dark:bg-[#1E1E1C]'
                : 'border-transparent text-stone-600 dark:text-stone-400'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#C85A32] text-[#C85A32] bg-white dark:bg-[#1E1E1C]'
                : 'border-transparent text-stone-600 dark:text-stone-400'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6">
          {activeTab === 'draw' && (
            <div>
              <div className="border border-stone-300 dark:border-stone-700 bg-white rounded-lg shadow-inner relative touch-none">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] cursor-crosshair block"
                />
                <button
                  onClick={clearCanvas}
                  className="absolute right-2 bottom-2 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2 text-center">
                Draw your signature on the pad above using mouse or touch.
              </p>
            </div>
          )}

          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Your Full Name:</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full text-sm p-2.5 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-[#282724] outline-none focus:border-[#C85A32]"
                  placeholder="Enter name..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Signature Style:</label>
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#282724] p-4 rounded-lg flex items-center justify-center min-h-[90px]">
                  <span
                    style={{ fontFamily: selectedFont, color: sigColor }}
                    className="text-4xl"
                  >
                    {typedName || 'Signature'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-8 text-center bg-white/50 dark:bg-[#282724]/50">
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Upload image signature (PNG, JPG, SVG)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="sig-upload-input"
              />
              <label
                htmlFor="sig-upload-input"
                className="inline-block mt-2 px-4 py-2 bg-white border border-stone-300 rounded-md text-xs font-semibold cursor-pointer hover:bg-stone-50 shadow-sm"
              >
                Browse File
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E0D8] dark:border-[#2E2E2A] flex items-center justify-end gap-2 bg-[#F5F2EB] dark:bg-[#252422]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 rounded-md"
          >
            Cancel
          </button>
          {activeTab !== 'upload' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#b24e2a] rounded-md shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Use Signature</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
