import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './pages/LandingPage';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';
import { ToastContainer } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';

// Lazy load heavy modules for performance
const Generator = React.lazy(() => import('./modules/Generator').then(module => ({ default: module.Generator })));
const History = React.lazy(() => import('./modules/History').then(module => ({ default: module.History })));

// Inner component to handle routing *after* auth context is available
const AppContent = () => {
  const { user, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Generator initialTab="script" />;
      case 'scripts':
        return <Generator initialTab="script" />;
      case 'assets':
        return <Generator initialTab="assets" />;
      case 'seo':
        return <Generator initialTab="seo" />;
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
    <Layout 
      user={user} 
      activeView={activeView} 
      setActiveView={setActiveView} 
      signOut={signOut}
    >
      <ToastContainer />
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center">
          <Loader />
        </div>
      }>
        {renderContent()}
      </Suspense>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}