import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider } from './context/ProjectContext';
import { LandingPage } from './pages/LandingPage';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';
import { SplashScreen } from './components/SplashScreen';
import { ConstructionView } from './components/ConstructionView';
import { Dashboard } from './modules/Dashboard';

// Lazy load heavy modules for performance
const Generator = React.lazy(() => import('./modules/Generator').then(module => ({ default: module.Generator })));
const History = React.lazy(() => import('./modules/History').then(module => ({ default: module.History })));
const Brainstorm = React.lazy(() => import('./modules/Brainstorm').then(module => ({ default: module.Brainstorm })));

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
        return <Dashboard onNavigate={setActiveView} />;
      case 'brainstorm':
        // Pass navigation prop to allow Brainstorm to redirect to Dashboard
        return <Brainstorm onNavigate={setActiveView} />;
      case 'scripts':
        return <Generator initialTab="script" />;
      case 'assets':
        return <Generator initialTab="assets" />;
      case 'video':
        return <Generator initialTab="video" />;
      case 'seo':
        return <Generator initialTab="seo" />;
      case 'history':
        return <History />;
      default:
        return (
          <ConstructionView 
            moduleName={activeView} 
            onReturn={() => setActiveView('dashboard')} 
          />
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
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </ToastProvider>
    </AuthProvider>
  );
}