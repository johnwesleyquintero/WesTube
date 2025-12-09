import React from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-wes-950 text-slate-200 overflow-hidden font-sans transition-colors duration-500">
      
      {/* Absolute Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-wes-900/50 backdrop-blur-md border border-wes-700 flex items-center justify-center text-slate-400 hover:text-wes-accent transition-all hover:scale-110 shadow-lg"
        title="Toggle Theme"
      >
        <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>

      {/* Left Panel - The Brand */}
      <div className="w-full md:w-1/2 relative overflow-hidden flex flex-col justify-between p-12">
        {/* Background Mesh Gradients */}
        <div className="absolute inset-0 bg-wes-950 transition-colors duration-500">
            <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-wes-accent/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-wes-pop/10 rounded-full blur-[120px]"></div>
        </div>
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 backdrop-blur-3xl z-0"></div>

        <div className="relative z-10">
          <Logo withText={true} className="w-10 h-10" />
          
          <div className="mt-24">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-wes-900/50 border border-wes-700 backdrop-blur-md mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-wes-success mr-2 animate-pulse"></span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">System v2.3 Online</span>
            </div>
            {/* Using slate-200 which maps to High Contrast Text (Dark in Light Mode, Light in Dark Mode) */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-slate-200">
              Build Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-wes-accent to-wes-pop">Digital Empire</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-light">
              WesTube Engine is the neural interface for your multi-channel production strategy. Deploy scripts, visuals, and sonics from a single command center.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 text-xs font-mono text-slate-500 mt-10 uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-bolt text-wes-accent"></i>
             <span>Gemini 2.5 Flash</span>
           </div>
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-database text-wes-pop"></i>
             <span>Supabase Vector</span>
           </div>
        </div>
      </div>

      {/* Right Panel - The Auth */}
      <div className="w-full md:w-1/2 bg-wes-900/40 backdrop-blur-md border-l border-wes-700 flex flex-col items-center justify-center p-8 md:p-12 relative transition-colors duration-500">
         <div className="w-full max-w-sm relative z-10">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-200 mb-2 tracking-tight">Authenticate</h2>
              <p className="text-slate-400">Authenticate to access the production mainframe.</p>
            </div>

            <button 
              onClick={signInWithGoogle}
              className="group w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 transform hover:scale-[1.02]"
            >
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
               <span>Initialize with Google</span>
            </button>

            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Authorized Personnel Only
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};