import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Lock, Check, Eye, EyeOff } from 'lucide-react';
import { SecurityConfig } from '../../types/pdf';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  security: SecurityConfig;
  onUpdateSecurity: (config: SecurityConfig) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  security,
  onUpdateSecurity,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProtected, setIsProtected] = useState(security.isPasswordProtected);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setIsProtected(security.isPasswordProtected);
      setShowPassword(false);
    }
  }, [isOpen, security]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSecurity({
      isPasswordProtected: isProtected,
      userPassword: password,
      ownerPassword: password,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E0D8] dark:border-[#383632] rounded-xl shadow-paper-lg w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E5E0D8] dark:border-[#2E2E2A] flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <span>PDF Security & Encryption</span>
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
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Protect Document with Password
              </span>
            </div>
            <input
              type="checkbox"
              checked={isProtected}
              onChange={(e) => setIsProtected(e.target.checked)}
              className="w-4 h-4 text-[#C85A32] accent-[#C85A32] rounded cursor-pointer"
            />
          </div>

          {isProtected && (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Encryption Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-2.5 pr-9 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-[#282724] outline-none focus:border-[#C85A32]"
                  placeholder="Enter password..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Users will be prompted to enter this password to view or edit the downloaded PDF.
              </p>
            </div>
          )}
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
            <span>Save Security</span>
          </button>
        </div>
      </div>
    </div>
  );
};
