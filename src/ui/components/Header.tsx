import React from 'react';
import { Menu, ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-14",
      "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80",
      "flex items-center justify-between px-4 sm:px-6 z-50 transition-all shadow-md font-mono"
    )}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-sm transition-colors text-slate-300"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => (window.location.href = '/#/')}
          className="flex items-center gap-2 group text-base font-bold tracking-tight font-sans"
        >
          <div className="p-1 bg-red-600 rounded-sm text-white shadow-sm flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-white font-extrabold tracking-widest text-sm sm:text-base font-mono">
            RE-DACT
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300">
          <Terminal className="w-3 h-3 text-red-500" />
          <span>REDACTION CONSOLE</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-900 border border-slate-800 text-[11px] font-bold text-emerald-400">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>AI REDACTION ENGINE</span>
        </div>
      </div>
    </header>
  );
}