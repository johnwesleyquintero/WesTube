

import React from 'react';
import { GeneratedPackage } from '../../../types';
import { CopyButton } from '../../../components/CopyButton';

interface SeoTabProps {
  result: GeneratedPackage;
}

export const SeoTab: React.FC<SeoTabProps> = ({ result }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Research & Sources Section (Only if available) */}
      {(result.sources && result.sources.length > 0) || result.researchSummary ? (
         <div className="glass-panel p-6 rounded-xl border border-wes-pop/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-wes-pop/10 flex items-center justify-center mr-3 border border-wes-pop/20 text-wes-pop">
                <i className="fa-solid fa-globe"></i>
              </span>
              Source Intelligence
            </h3>
            
            {result.researchSummary && (
              <div className="mb-4">
                <p className="text-xs font-bold text-wes-pop uppercase tracking-widest mb-2">Research Summary</p>
                <div className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                  {result.researchSummary}
                </div>
              </div>
            )}

            {result.sources && result.sources.length > 0 && (
              <div>
                <p className="text-xs font-bold text-wes-pop uppercase tracking-widest mb-2">Citations & Links</p>
                <ul className="space-y-2">
                  {result.sources.map((source, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <i className="fa-solid fa-link text-slate-500 mt-0.5"></i>
                      <a 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-400 hover:text-wes-accent transition-colors truncate hover:underline"
                      >
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
         </div>
      ) : null}

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