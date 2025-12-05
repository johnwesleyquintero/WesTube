import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Generator } from './modules/Generator';
import { SettingsModal } from './components/SettingsModal';
import { Logo } from './components/Logo';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-wes-900 text-slate-200 font-sans selection:bg-wes-accent selection:text-white">
      
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
        fixed inset-0 z-40 bg-wes-900/95 backdrop-blur transition-transform duration-300 md:relative md:bg-transparent md:translate-x-0 md:w-auto
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
        {/* Top Bar (Mobile Only) */}
        <div className="md:hidden h-16 border-b border-wes-700 flex items-center px-6 bg-wes-800">
          <Logo withText={true} className="w-8 h-8" />
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          {activeView === 'dashboard' ? (
            <Generator />
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-wes-800/50 rounded-xl border border-wes-700 border-dashed">
               <i className="fa-solid fa-person-digging text-4xl mb-4 text-wes-700"></i>
               <h2 className="text-xl font-bold text-slate-400">Under Construction</h2>
               <p className="mt-2 text-sm">The module "{activeView}" is coming in v2.1</p>
               <button 
                 onClick={() => setActiveView('dashboard')}
                 className="mt-6 px-4 py-2 bg-wes-700 hover:bg-wes-600 text-white rounded text-sm transition-colors"
               >
                 Return to Dashboard
               </button>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}