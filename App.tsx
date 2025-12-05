import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Generator } from './modules/Generator';
import { History } from './modules/History';
import { SettingsModal } from './components/SettingsModal';
import { Logo } from './components/Logo';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';

// Inner component to handle routing *after* auth context is available
const AppContent = () => {
  const { user, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-wes-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-wes-accent border-t-transparent animate-spin"></div>
           <p className="text-wes-accent font-mono text-sm tracking-widest animate-pulse">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Generator />;
      case 'history':
        return <History />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl border-dashed">
            <i className="fa-solid fa-person-digging text-4xl mb-4 text-wes-700"></i>
            <h2 className="text-xl font-bold text-slate-400">Under Construction</h2>
            <p className="mt-2 text-sm">The module "{activeView}" is coming in v2.3</p>
            <button 
              onClick={() => setActiveView('dashboard')}
              className="mt-6 px-4 py-2 bg-wes-800 hover:bg-wes-700 text-white rounded text-sm transition-colors border border-white/5"
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen text-slate-200 font-sans selection:bg-wes-accent selection:text-white">
      
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 right-4 z-50 md:hidden bg-wes-800 p-2 rounded text-wes-accent border border-white/10 shadow-lg"
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
        <div className="h-20 flex items-center justify-between px-8 shrink-0">
          <div className="md:hidden">
             <Logo withText={true} className="w-8 h-8" />
          </div>
          
          <div className="hidden md:flex flex-col">
             <h1 className="text-xl font-bold text-white tracking-tight">Production Studio</h1>
             <p className="text-xs text-slate-500 font-mono">System Online // {new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm text-slate-400">
               <span className="glass-panel px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {user.email}
               </span>
            </div>

            <button 
              onClick={signOut}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex-1 px-8 pb-8 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}