import React from 'react';
import { useApp } from '../context/AppContext';
import { Layout, BookOpen, Video, Music, Clock, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, reviewsDueCount } = useApp();

  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <Layout className="nav-icon" />
        <span>Início</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'islands' || activeTab === 'practice' ? 'active' : ''}`}
        onClick={() => setActiveTab('islands')}
      >
        <BookOpen className="nav-icon" />
        <span>Ilhas</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'media' ? 'active' : ''}`}
        onClick={() => setActiveTab('media')}
      >
        <Video className="nav-icon" />
        <span>Shadowing</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'music' ? 'active' : ''}`}
        onClick={() => setActiveTab('music')}
      >
        <Music className="nav-icon" />
        <span>Músicas</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'review' ? 'active' : ''}`}
        onClick={() => setActiveTab('review')}
        style={{ position: 'relative' }}
      >
        <Clock className="nav-icon" />
        <span>Revisar</span>
        {reviewsDueCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '6px',
              right: '25%',
              background: 'var(--danger)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 5px rgba(0,0,0,0.3)'
            }}
          >
            {reviewsDueCount}
          </span>
        )}
      </button>

      {/* IA Chat button - Restrict to bottom tab bar on mobile */}
      <button 
        className="nav-item"
        onClick={() => window.dispatchEvent(new Event('toggle_ai_chat'))}
      >
        <Sparkles className="nav-icon" style={{ color: '#f59e0b' }} />
        <span>IA Chat</span>
      </button>
    </nav>
  );
};
