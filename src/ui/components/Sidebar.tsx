import React from 'react';
import { X, User, HelpCircle, Info, Phone, History, Cpu, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../store/theme';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();

  const menuItems = [
    { icon: User, label: 'Account Details', path: '/#/account-details' },
    { icon: HelpCircle, label: 'How to Use', path: '/#/how-to-use' },
    { icon: Info, label: 'About Us', path: '/#/about-us' },
    { icon: Phone, label: 'Contact Us', path: '/#/contact-us' },
    { icon: History, label: 'History', path: '/#/history' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-slate-950 shadow-2xl font-mono",
          "transform transition-transform duration-200 ease-out z-50 flex flex-col justify-between",
          "border-r border-slate-800 text-slate-200",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <div className="h-14 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-red-600 rounded-sm text-white">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="font-bold text-sm tracking-widest uppercase text-white font-sans">
                MAIN NAVIGATION
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  window.location.href = item.path;
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-sm transition-all group text-left uppercase tracking-wider"
              >
                <item.icon className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 m-3 rounded-sm bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
            <Terminal className="w-3.5 h-3.5 text-red-500" />
            <span>AI Architecture</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
            Powered by hybrid <b>spaCy v3 Statistical Models</b> and <b>BERT / RoBERTa Deep Learning Transformers</b> for high-precision PII sanitization and realistic synthetic data generation.
          </p>
        </div>
      </aside>
    </>
  );
}