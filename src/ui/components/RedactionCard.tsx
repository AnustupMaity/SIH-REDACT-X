import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface RedactionCardProps {
  icon: typeof FileText;
  title: string;
  description: string;
  onClick: () => void;
}

export function RedactionCard({ icon: Icon, title, description, onClick }: RedactionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative p-7 rounded-2xl transition-all duration-300 text-left w-full overflow-hidden",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl",
        "border border-gray-200/80 dark:border-gray-800/80",
        "hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:-translate-y-1.5",
        "hover:border-blue-500/50 dark:hover:border-blue-400/50"
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="inline-flex p-3 rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
        
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-500 transition-all duration-300" />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}