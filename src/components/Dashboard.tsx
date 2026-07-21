import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  HelpCircle, 
  Volume2, 
  PlayCircle, 
  Brain, 
  Sprout, 
  Users, 
  Compass, 
  BookOpen, 
  Target, 
  Film, 
  Music, 
  Video, 
  RefreshCw, 
  BarChart3, 
  Settings as SettingsIcon,
  Zap,
  ArrowRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    streak,
    categories,
    phrases,
    setActiveIslandId,
    setActiveTab,
    recentIslandIds,
    phraseStars,
    reviewItems,
    targetLanguage
  } = useApp();

  // 1. Calculate Today's study time
  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayTimeSec = React.useMemo(() => {
    try {
      const storedDaily = localStorage.getItem(`hl_stats_today_time_sec_${todayStr}`);
      if (storedDaily) return Number(storedDaily) || 0;
      
      // Fallback check overall study counts
      const counts = localStorage.getItem('hl_study_daily_counts');
      if (counts) {
        const parsed = JSON.parse(counts);
        if (parsed[todayStr]) return (parsed[todayStr] * 45) || 0; // est 45s per item
      }
      return 0;
    } catch {
      return 0;
    }
  }, [todayStr]);

  const todayTimeFormatted = React.useMemo(() => {
    const hrs = Math.floor(todayTimeSec / 3600);
    const mins = Math.floor((todayTimeSec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  }, [todayTimeSec]);

  // 2. Calculate Comprehension CEFR Level
  const targetPhrases = React.useMemo(() => {
    return (phrases || []).filter(p => p && p.language_id === targetLanguage);
  }, [phrases, targetLanguage]);

  const comprehensionCount = React.useMemo(() => {
    return targetPhrases.filter(p => {
      const star = phraseStars[p.id] || 0;
      const rev = reviewItems?.[p.id];
      return star > 0 || rev !== undefined;
    }).length;
  }, [targetPhrases, phraseStars, reviewItems]);

  const comprehensionCEFR = React.useMemo(() => {
    if (comprehensionCount >= 501) return 'C1';
    if (comprehensionCount >= 251) return 'B2';
    if (comprehensionCount >= 121) return 'B1';
    if (comprehensionCount >= 51) return 'A2';
    if (comprehensionCount >= 11) return 'A1';
    return 'A0';
  }, [comprehensionCount]);

  // 3. Calculate Speaking CEFR Level
  const speakingCount = React.useMemo(() => {
    return targetPhrases.filter(p => {
      const star = phraseStars[p.id] || 0;
      return star >= 4;
    }).length;
  }, [targetPhrases, phraseStars]);

  const speakingCEFR = React.useMemo(() => {
    if (speakingCount >= 251) return 'C1';
    if (speakingCount >= 126) return 'B2';
    if (speakingCount >= 61) return 'B1';
    if (speakingCount >= 26) return 'A2';
    if (speakingCount >= 6) return 'A1';
    return 'A0';
  }, [speakingCount]);

  // Get recently studied/visited islands, falling back to first 3 if none
  const getRecentIslands = () => {
    const recent = categories.filter(c => recentIslandIds.includes(c.id));
    const sortedRecent = [...recent].sort((a, b) => {
      return recentIslandIds.indexOf(a.id) - recentIslandIds.indexOf(b.id);
    });

    if (sortedRecent.length > 0) {
      return sortedRecent.slice(0, 3);
    }

    return categories
      .filter(c => phrases.some(p => p.category_id === c.id))
      .slice(0, 3);
  };

  const recentIslands = getRecentIslands();

  const handlePlayIsland = (islandId: string) => {
    setActiveIslandId(islandId);
    setActiveTab('practice');
  };

  const handleOpenClima = (climaId: string) => {
    // Navigate to islands tab with the clima pre-selected
    setActiveTab('islands');
    // Store selected clima in sessionStorage for IslandsCatalog to pick up
    sessionStorage.setItem('noclima_active_clima', climaId);
  };

  const climas = [
    {
      id: 'deepwork',
      name: 'Deep Work',
      subtitle: 'Clima Analítico & Alta Performance',
      description: 'Estratégias de branding, negócios, tomada de decisão, finanças, leis e conectores lógicos.',
      icon: <Brain size={26} />,
      color: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.04) 100%)'
    },
    {
      id: 'flow',
      name: 'Flow',
      subtitle: 'Clima de Identidade & Rotina',
      description: 'Sentimentos, quem você é, rotinas diárias, rituais de bem-estar (Obsidian, yoga) e fisiologia.',
      icon: <Sprout size={26} />,
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.04) 100%)'
    },
    {
      id: 'influence',
      name: 'Influence',
      subtitle: 'Conexão & Impacto Interpessoal',
      description: 'Comunicação social, mediação de diálogos, empoderamento, relacionamentos e polidez.',
      icon: <Users size={26} />,
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.04) 100%)'
    },
    {
      id: 'explorer',
      name: 'Explorer',
      subtitle: 'Clima Lúdico & Descoberta',
      description: 'Lazer, viagens, gastronomia, hobbies, esportes, cultura pop e interações leves.',
      icon: <Compass size={26} />,
      color: '#3b82f6',
      badgeBg: 'rgba(59, 130, 246, 0.12)',
      borderColor: 'rgba(59, 130, 246, 0.25)',
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(2, 132, 199, 0.04) 100%)'
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. Greeting header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            Bem-vindo ao <span style={{ color: 'var(--accent)' }}>NoClima</span> 👋
          </h2>
        </div>
        
        {/* Streak counter pill (Consecutive daily platform entries) */}
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
            <span className="stat-box-value">{todayTimeFormatted}</span>
            <span className="stat-box-label">Hoje</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <HelpCircle size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">{comprehensionCEFR}</span>
            <span className="stat-box-label">Compreensão</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Volume2 size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">{speakingCEFR}</span>
            <span className="stat-box-label">Fala</span>
          </div>
        </div>
      </div>

      {/* 3. MACRO-CLIMAS GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Macro-Climas de Energia</h3>
          <button
            onClick={() => setActiveTab('islands')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Ver todas as ilhas <ArrowRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '16px'
        }}>
          {climas.map(clima => (
            <div
              key={clima.id}
              onClick={() => handleOpenClima(clima.id)}
              className="glass-card active-glow"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: clima.gradient,
                border: `1px solid ${clima.borderColor}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: clima.badgeBg,
                    color: clima.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${clima.borderColor}`
                  }}>
                    {clima.icon}
                  </div>

                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: clima.color,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: clima.badgeBg
                  }}>
                    Active
                  </span>
                </div>

                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {clima.name}
                </h4>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: clima.color, display: 'block', marginTop: '2px' }}>
                  {clima.subtitle}
                </span>
              </div>

              {/* Sub-ilhas pills (Story, Core, Pop Lab) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <BookOpen size={11} style={{ color: clima.color }} /> Story
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Target size={11} style={{ color: clima.color }} /> Core
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Film size={11} style={{ color: clima.color }} /> Pop Lab
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Tools Bar */}
      <div>
        <h4 style={{ 
          fontSize: '0.78rem', 
          fontWeight: 750, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          marginBottom: '12px' 
        }}>
          Ferramentas & Estúdios Rápidos
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {/* Vocabulário */}
          <div 
            onClick={() => setActiveTab('vocabulary')}
            className="glass-card active-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={16} style={{ color: '#8b5cf6' }} /> Construtor de Vocabulário
          </div>

          {/* Músicas */}
          <div 
            onClick={() => setActiveTab('music')}
            className="glass-card active-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s'
            }}
          >
            <Music size={16} style={{ color: '#f59e0b' }} /> Estúdio de Músicas
          </div>

          {/* Shadowing / Filmes */}
          <div 
            onClick={() => setActiveTab('media')}
            className="glass-card active-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s'
            }}
          >
            <Video size={16} style={{ color: '#3b82f6' }} /> Shadowing & Vídeos
          </div>

          {/* Revisar Deck */}
          <div 
            onClick={() => setActiveTab('review')}
            className="glass-card active-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} style={{ color: '#10b981' }} /> Revisão Espaçada (SM2)
          </div>

          {/* Estatísticas */}
          <div 
            onClick={() => setActiveTab('stats')}
            className="glass-card active-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={16} style={{ color: '#ec4899' }} /> Estatísticas
          </div>

          {/* Ajustes */}
          <div 
            onClick={() => setActiveTab('settings')}
            className="glass-card active-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'white',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s'
            }}
          >
            <SettingsIcon size={16} style={{ color: 'var(--text-muted)' }} /> Ajustes
          </div>
        </div>
      </div>

      {/* 5. Recent Lessons List */}
      <div className="lessons-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Lições Recentes</h3>
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
              Nenhuma lição iniciada recentemente. Escolha um Clima acima para começar!
            </div>
          ) : (
            recentIslands.map((island) => (
              <div key={island.id} className="lesson-row">
                <div className="lesson-info">
                  <div className="lesson-icon-wrapper">
                    <Target size={18} style={{ color: 'var(--accent)' }} />
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

    </div>
  );
};
