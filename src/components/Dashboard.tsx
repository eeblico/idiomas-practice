import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, HelpCircle, Volume2, ShieldAlert, Award, Star, PlayCircle, Play, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    user,
    streak,
    dailyGoalProgress,
    categories,
    phrases,
    setActiveIslandId,
    setActiveTab
  } = useApp();

  // Pick first 3 islands with phrases as "Recent Lessons" mocks
  const getRecentIslands = () => {
    return categories
      .filter(c => phrases.some(p => p.category_id === c.id))
      .slice(0, 3);
  };

  const recentIslands = getRecentIslands();

  const handlePlayIsland = (islandId: string) => {
    setActiveIslandId(islandId);
    setActiveTab('practice');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. Greeting header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bem-vindo de volta 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>Pronto para continuar</p>
        </div>
        
        {/* Streak counter pill */}
        {streak > 0 && (
          <div style={{
            background: 'rgba(249, 115, 22, 0.12)',
            color: '#f97316',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(249, 115, 22, 0.2)'
          }}>
            🔥 {streak} {streak === 1 ? 'Dia' : 'Dias'}
          </div>
        )}
      </div>

      {/* 2. Horizontal Stats Row */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">0m</span>
            <span className="stat-box-label">Today</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <HelpCircle size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">A0</span>
            <span className="stat-box-label">Compreensão</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Volume2 size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">A0</span>
            <span className="stat-box-label">Fala</span>
          </div>
        </div>
      </div>

      {/* 3. Launch month notification banner */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Sparkles size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <span>All Pro features are free during our launch month — enjoy full access while it lasts.</span>
      </div>

      {/* 4. Start Learning Colored Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Start Learning</h3>
        
        <div className="learning-grid">
          {/* Card 1: Islands */}
          <div className="learning-card learning-card-blue" onClick={() => setActiveTab('islands')}>
            <div>
              <div className="learning-card-icon">🏝️</div>
              <h4 className="learning-card-title">Ilhas de Idiomas</h4>
              <p className="learning-card-desc">
                Aprenda com temas da vida real com diálogos, histórias e frases.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px', fontSize: '0.75rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Tópicos</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Diálogos</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Histórias</span>
            </div>
          </div>

          {/* Card 2: Vocab */}
          <div className="learning-card learning-card-purple" onClick={() => setActiveTab('islands')}>
            <div>
              <div className="learning-card-icon">📖</div>
              <h4 className="learning-card-title">Construtor de Vocabulário</h4>
              <p className="learning-card-desc">
                Domine palavras essenciais organizadas por categoria e frequência.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px', fontSize: '0.75rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Iniciante</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Intermediate</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Advanced</span>
            </div>
          </div>

          {/* Card 3: Collections */}
          <div className="learning-card learning-card-orange" onClick={() => setActiveTab('review')}>
            <div>
              <div className="learning-card-icon">⭐</div>
              <h4 className="learning-card-title">My Collections</h4>
              <p className="learning-card-desc">
                Practice your saved vocabulary and favorite sentences.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px', fontSize: '0.75rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Favoritos</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Revisões SM2</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Lessons List */}
      <div className="lessons-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recent Lessons</h3>
          <button 
            onClick={() => setActiveTab('islands')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Ver todas
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentIslands.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Nenhuma lição iniciada recentemente. Vá para a aba Ilhas para começar!
            </div>
          ) : (
            recentIslands.map((island) => (
              <div key={island.id} className="lesson-row">
                <div className="lesson-info">
                  <div className="lesson-icon-wrapper">
                    🏝️
                  </div>
                  <div className="lesson-details">
                    <span className="lesson-name">{island.name}</span>
                    <span className="lesson-meta">{island.description}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePlayIsland(island.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PlayCircle size={28} style={{ color: 'var(--accent)' }} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Basic Tip Section */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.12)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 20px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.4
      }}>
        💡 <strong>Tip:</strong> Practice both <strong>Listen & Repeat</strong> and <strong>Active Recall</strong> modes for best results!
      </div>
      
    </div>
  );
};
