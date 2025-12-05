import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-6">
    <div className="relative">
       <div className="w-16 h-16 rounded-full border-2 border-wes-accent/20 border-t-wes-accent animate-spin"></div>
       <div className="absolute inset-0 rounded-full border-2 border-wes-pop/20 border-b-wes-pop animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
       <div className="absolute inset-0 flex items-center justify-center">
         <i className="fa-solid fa-brain text-wes-accent animate-pulse"></i>
       </div>
    </div>
    <div className="text-center">
        <p className="text-white font-mono text-sm tracking-widest uppercase">Processing</p>
        <p className="text-slate-500 text-xs mt-1">Aligning channel persona...</p>
    </div>
  </div>
);