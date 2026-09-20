import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyBadge: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F2EB] dark:bg-[#282724] border border-[#E5E0D8] dark:border-[#383632] rounded-full text-xs font-medium text-stone-700 dark:text-stone-300 shadow-sm transition-colors">
      <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
      <span>100% Private & Local</span>
      <span className="hidden md:inline text-stone-400 dark:text-stone-500">•</span>
      <span className="hidden md:inline text-stone-500 dark:text-stone-400 font-normal">Files never leave your browser</span>
    </div>
  );
};
