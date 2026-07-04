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
        "group relative p-6 rounded-sm transition-all duration-200 text-left w-full font-mono",
        "bg-slate-900 border border-slate-800",
        "hover:border-red-500 hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex p-3 rounded-sm bg-slate-950 border border-slate-800 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors font-sans">
          {title}
        </h3>
        <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-red-500 transition-all" />
      </div>
      
      <p className="text-slate-400 text-sm leading-relaxed font-sans">
        {description}
      </p>
    </button>
  );
}