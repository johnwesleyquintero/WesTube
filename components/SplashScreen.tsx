import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-wes-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fadeIn">
         <div className="w-12 h-12 rounded-full border-4 border-wes-accent border-t-transparent animate-spin"></div>
         <div className="text-center">
           <p className="text-wes-accent font-mono text-sm tracking-widest animate-pulse">INITIALIZING SYSTEM</p>
           <p className="text-wes-600 text-xs mt-2 font-mono">Loading Neural Modules...</p>
         </div>
      </div>
    </div>
  );
};
