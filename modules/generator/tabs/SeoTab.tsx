import React from 'react';
import { GeneratedPackage } from '../../../types';
import { CopyButton } from '../../../components/CopyButton';

interface SeoTabProps {
  result: GeneratedPackage;
}

export const SeoTab: React.FC<SeoTabProps> = ({ result }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel p-8 rounded-xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">Optimized Title</label>
            <CopyButton text={result.title} />
          </div>
          <div className="text-2xl text-white font-bold select-all bg-black/20 p-4 rounded-lg border border-white/10 leading-snug">
            {result.title}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <CopyButton text={result.description} />
          </div>
          <textarea 
            readOnly 
            className="w-full h-48 bg-black/20 p-4 rounded-lg border border-white/10 text-sm text-slate-300 font-mono resize-none focus:outline-none custom-scrollbar"
            value={result.description}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Keywords / Tags</label>
          <div className="flex flex-wrap gap-2">
            {result.tags.map(tag => (
              <span key={tag} className="text-xs bg-wes-800/50 text-slate-300 px-3 py-1.5 rounded-full border border-white/10 select-all cursor-pointer hover:bg-wes-accent/20 hover:text-white hover:border-wes-accent/40 transition-all">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};