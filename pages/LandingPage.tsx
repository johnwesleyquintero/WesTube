import React from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-wes-900 text-white overflow-hidden font-sans">
      
      {/* Left Panel - The Brand */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-wes-900 via-wes-800 to-[#1a237e] p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-10 left-10 w-64 h-64 bg-wes-accent rounded-full blur-[100px]"></div>
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <Logo withText={true} className="w-10 h-10" />
          
          <div className="mt-20">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Automate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Content Empire</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              WesTube Engine v2.0 is the comprehensive AI production network for your multi-channel strategy. Generate scripts, visuals, and audio in seconds.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 text-xs font-mono text-slate-400 mt-10">
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-check-circle text-wes-success"></i>
             <span>Gemini 2.5 Flash</span>
           </div>
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-check-circle text-wes-success"></i>
             <span>Supabase Cloud</span>
           </div>
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-check-circle text-wes-success"></i>
             <span>Multi-Persona</span>
           </div>
        </div>
      </div>

      {/* Right Panel - The Auth */}
      <div className="w-full md:w-1/2 bg-white text-slate-900 flex flex-col items-center justify-center p-8 md:p-12 relative">
         <div className="w-full max-w-sm">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Sign in to access your production dashboard.</p>
            </div>

            <button 
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg shadow-sm transition-all duration-200 transform active:scale-[0.98]"
            >
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
               <span>Sign in with Google</span>
            </button>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                By signing in, you agree to the Terms of Service and Privacy Policy of WesTube Inc.
              </p>
            </div>
         </div>

         {/* Footer Info */}
         <div className="absolute bottom-6 w-full text-center text-xs text-slate-400">
           Protected by WesAI Security Systems v2.2
         </div>
      </div>
    </div>
  );
};
