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
      <div className="h-screen w-screen bg-wes-900 flex items-center justify-center text-wes-accent">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
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
        );
    }
  };

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
        
        {/* Sign Out Button (Small, in sidebar area for now or handled via settings) */}
        {/* We can also add it to the sidebar bottom via prop drilling, but let's put it in SettingsModal or top bar */}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-wes-700 flex items-center justify-between px-6 bg-wes-800">
          <div className="md:hidden">
             <Logo withText={true} className="w-8 h-8" />
          </div>
          
          <div className="hidden md:flex items-center text-sm text-slate-400">
             <span className="bg-wes-700/50 px-3 py-1 rounded-full border border-wes-700 text-xs">
                <i className="fa-solid fa-user mr-2 text-wes-accent"></i>
                {user.email}
             </span>
          </div>

          <button 
            onClick={signOut}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-2 hover:bg-wes-700 px-3 py-1.5 rounded transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-hidden">
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
