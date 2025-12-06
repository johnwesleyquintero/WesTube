import React from 'react';

interface ConstructionViewProps {
  moduleName: string;
  onReturn: () => void;
}

export const ConstructionView: React.FC<ConstructionViewProps> = ({ moduleName, onReturn }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl border-dashed animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-wes-800/50 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
         <i className="fa-solid fa-person-digging text-3xl text-wes-700"></i>
      </div>
      <h2 className="text-xl font-bold text-slate-400 tracking-tight">Under Construction</h2>
      <p className="mt-2 text-sm font-mono text-slate-600">Module <span className="text-wes-accent">"{moduleName}"</span> is coming in v2.3</p>
      <button 
        onClick={onReturn}
        className="mt-8 px-6 py-2.5 bg-wes-800 hover:bg-wes-700 text-slate-300 hover:text-white rounded-lg text-sm transition-all border border-white/5 shadow-lg"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i>
        Return to Dashboard
      </button>
    </div>
  );
};