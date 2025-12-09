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

      {/* Mobile Menu Button - Positioned better for thumb reach */}
      <button 
        className="fixed bottom-6 right-6 z-50 md:hidden w-12 h-12 flex items-center justify-center bg-wes-accent text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/20 active:scale-95 transition-transform"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Menu"
      >
        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-wes-900 w-72 md:w-auto shadow-2xl md:shadow-none transition-transform duration-300 ease-out md:relative md:translate-x-0
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Top Bar */}
        <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0 bg-wes-950 border-b border-wes-800 md:border-wes-700/30 transition-colors z-20">
          <div className="md:hidden flex items-center gap-3">
             <Logo withText={false} className="w-8 h-8" />
             <span className="font-bold text-slate-200 text-lg tracking-tight">WesTube</span>
          </div>
          
          <div className="hidden md:flex flex-col">
             {/* slate-200 maps to high contrast text (black in light mode) */}
             <h1 className="text-xl font-bold text-slate-200 tracking-tight">Production Studio</h1>
             <p className="text-xs text-slate-500 font-mono">System Online // {new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Header Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 md:w-8 md:h-8 rounded-lg hover:bg-wes-800 flex items-center justify-center text-slate-400 hover:text-wes-accent transition-colors active:bg-wes-700"
              title="Toggle Theme"
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg md:text-base`}></i>
            </button>

            <div className="hidden md:flex items-center text-sm text-slate-400">
               <span className="glass-panel px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                  {user.email}
               </span>
            </div>

            <button 
              onClick={signOut}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-2 hover:bg-wes-800 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-wes-700"
            >
              <i className="fa-solid fa-right-from-bracket text-lg md:text-sm"></i>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 pb-20 md:px-8 md:pb-8 overflow-hidden w-full">
          {children}
        </div>
      </main>
    </div>
  );
};