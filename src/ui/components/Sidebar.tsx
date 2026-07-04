import React from 'react';
import { X, User, Sun, Moon, HelpCircle, Info, Phone, History, Cpu, Sparkles, ShieldAlert } from 'lucide-react';
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl shadow-2xl",
          "transform transition-transform duration-300 ease-out z-50 flex flex-col justify-between",
          "border-r border-gray-200/80 dark:border-gray-800/80",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Navigation
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  window.location.href = item.path;
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                {item.label}
              </button>
            ))}
            
            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/60 my-2" />

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200 group"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5 text-indigo-500 group-hover:rotate-12 transition-transform" />
                  <span>Switch to Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform" />
                  <span>Switch to Light Mode</span>
                </>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 dark:border-blue-400/20">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>AI Architecture</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Powered by hybrid <b>spaCy v3 Statistical Models</b> and <b>BERT / RoBERTa Deep Learning Transformers</b> for high-precision PII sanitization.
          </p>
        </div>
      </aside>
    </>
  );
}