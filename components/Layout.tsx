import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';
import { SettingsModal } from './SettingsModal';
import { User } from '@supabase/supabase-js';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  signOut: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  activeView, 
  setActiveView, 
  signOut 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen text-slate-200 font-sans selection:bg-wes-accent selection:text-white bg-wes-950 transition-colors duration-300">
      
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 right-4 z-50 md:hidden bg-wes-800 p-2 rounded text-wes-accent border border-wes-700 shadow-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-transform duration-300 md:relative md:bg-transparent md:translate-x-0 md:w-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          activeView={activeView} 
          setActiveView={(view) => {
            setActiveView(view);
            setMobileMenuOpen(false);
          }} 
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <div className="h-20 flex items-center justify-between px-8 shrink-0 bg-wes-950 border-b border-transparent md:border-wes-700/30 transition-colors">
          <div className="md:hidden">
             <Logo withText={true} className="w-8 h-8" />
          </div>
          
          <div className="hidden md:flex flex-col">
             {/* slate-200 maps to high contrast text (black in light mode) */}
             <h1 className="text-xl font-bold text-slate-200 tracking-tight">Production Studio</h1>
             <p className="text-xs text-slate-500 font-mono">System Online // {new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Header Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg hover:bg-wes-800 flex items-center justify-center text-slate-400 hover:text-wes-accent transition-colors"
              title="Toggle Theme"
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            <div className="hidden md:flex items-center text-sm text-slate-400">
               <span className="glass-panel px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                  {user.email}
               </span>
            </div>

            <button 
              onClick={signOut}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-2 hover:bg-wes-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex-1 px-8 pb-8 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};