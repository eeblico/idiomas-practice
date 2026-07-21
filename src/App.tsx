import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Resources } from './components/Resources';
import { IslandsCatalog } from './components/IslandsCatalog';
import { PracticeSession } from './components/PracticeSession';
import { ReviewSession } from './components/ReviewSession';
import { StatsView } from './components/StatsView';
import { Settings } from './components/Settings';
import { AdminPanel } from './components/AdminPanel';
import { MediaStudy } from './components/MediaStudy';
import { MusicStudy } from './components/MusicStudy';
import { VocabularyBuilder } from './components/VocabularyBuilder';
import { Menu, Wifi, WifiOff, Sun } from 'lucide-react';
import { AIChatSidebar } from './components/AIChatSidebar';
import { BottomNav } from './components/BottomNav';

const MainAppContent: React.FC = () => {
  const { activeTab, online, loading } = useApp();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar when entering Shadowing workspace, and expand when leaving
  useEffect(() => {
    setSidebarCollapsed(activeTab === 'media');
  }, [activeTab]);

  // Load onboarding completion status
  useEffect(() => {
    const complete = localStorage.getItem('hl_onboarding_complete');
    setOnboardingComplete(complete === 'true');

    // Pre-populate Gemini API key with user-provided key if missing or default placeholder
    const storedKey = localStorage.getItem('hl_gemini_key');
    if (!storedKey || storedKey.trim() === '' || storedKey === 'sua-chave-gemini-aqui') {
      localStorage.setItem('hl_gemini_key', 'AQ.Ab8RN6LHaU87Y0w5nqUWIyZXBJQSelTWqPerw9OY_I6Z3Kl4yw');
    }

    // Pre-populate DeepSeek API credentials on startup
    const dsKey = localStorage.getItem('hl_deepseek_key');
    if (!dsKey || dsKey.trim() === '' || dsKey === 'sua-chave-deepseek-aqui') {
      localStorage.setItem('hl_deepseek_key', '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');
    }
    const dsModel = localStorage.getItem('hl_deepseek_model');
    if (!dsModel || dsModel.trim() === '') {
      localStorage.setItem('hl_deepseek_model', 'deepseek-ai/deepseek-v4-pro');
    }

    // Pre-populate Nemotron API credentials on startup
    const nemoKey = localStorage.getItem('hl_nemotron_key');
    if (!nemoKey || nemoKey.trim() === '' || nemoKey === 'sua-chave-nemotron-aqui') {
      localStorage.setItem('hl_nemotron_key', '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');
    }
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    localStorage.setItem('hl_onboarding_complete', 'true');
  };

  if (onboardingComplete === null || loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin-sun 3s linear infinite', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.8))' }}>
            <Sun size={54} style={{ color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)' }} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em' }}>NoClima</span>
        </div>
        <style>{`
          @keyframes spin-sun {
            0% { transform: rotate(0deg) scale(0.95); }
            50% { transform: rotate(180deg) scale(1.12); }
            100% { transform: rotate(360deg) scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Active Component mapping based on routing tabs
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'resources':
        return <Resources />;
      case 'islands':
        return <IslandsCatalog />;
      case 'practice':
        return <PracticeSession />;
      case 'review':
        return <ReviewSession />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <AdminPanel />;
      case 'media':
        return <MediaStudy />;
      case 'music':
        return <MusicStudy />;
      case 'vocabulary':
        return <VocabularyBuilder />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* 1. Left Navigation Sidebar Panel (desktop visible, mobile slidable drawer) */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* 2. Right Hand Viewport Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        
        {/* Mobile Header Bar (hidden on desktop) */}
        <header className="mobile-header">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <Menu size={24} />
          </button>
          
          <h1 style={{ fontSize: '1.2rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={20} style={{ color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)' }} />
            <span style={{ color: '#f59e0b' }}>NoClima</span>
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {online ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                color: 'var(--success)',
                background: 'var(--success-glow)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700
              }}>
                <Wifi size={10} /> Online
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                color: 'var(--danger)',
                background: 'var(--danger-glow)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700
              }}>
                <WifiOff size={10} /> Offline
              </span>
            )}
          </div>
        </header>

        {/* Backdrop overlay for mobile sidebar drawer */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 150
            }}
          />
        )}

        {/* Scrollable Viewport Page Content */}
        <main className="app-content">
          <div className="app-content-inner">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
      
      {/* Collapsible Global AI Chat Sidebar Panel */}
      <AIChatSidebar />

      {/* Mobile Bottom Navigation Drawer */}
      <BottomNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export default App;
