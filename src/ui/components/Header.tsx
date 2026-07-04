import React from 'react';
import { Menu, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16",
      "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60",
      "flex items-center justify-between px-4 sm:px-6 z-50 transition-all shadow-sm"
    )}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded-xl transition-colors duration-200 text-gray-700 dark:text-gray-300"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => (window.location.href = '/#/')}
          className="flex items-center gap-2 group text-xl font-extrabold tracking-tight"
        >
          <div className="p-1.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-black">
            RE-DACT
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>Hybrid NER & Transformer Ready</span>
        </div>
      </div>
    </header>
  );
}