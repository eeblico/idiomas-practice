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
  ArrowRight,
  Sun,
  Calendar
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    streak,
    categories,
    phrases,
    setActiveIslandId,
    setActiveTab,
    recentIslandIds,
    completedToday
  } = useApp();

  // 1. Calculate Today's active platform usage time (seconds active on NoClima today)
  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const [activeSecsToday, setActiveSecsToday] = React.useState<number>(() => {
    try {
      const key = `noclima_active_time_${todayStr}`;
      const legacy = localStorage.getItem(`hl_stats_today_time_sec_${todayStr}`);
      return Number(localStorage.getItem(key) || legacy || '0');
    } catch {
      return 0;
    }
  });

  React.useEffect(() => {
    const key = `noclima_active_time_${todayStr}`;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveSecsToday(prev => {
          const next = prev + 1;
          try {
            localStorage.setItem(key, String(next));
          } catch {}
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayStr]);

  const activeTimeFormatted = React.useMemo(() => {
    const hrs = Math.floor(activeSecsToday / 3600);
    const mins = Math.floor((activeSecsToday % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  }, [activeSecsToday]);

  // 2. Calculate Quarter Countdown & Progress Percentage Ring
  const quarterInfo = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0=Jan ... 11=Dec)

    // Current quarter index: 0=Q1 (Jan-Mar), 1=Q2 (Apr-Jun), 2=Q3 (Jul-Sep), 3=Q4 (Oct-Dec)
    const quarterIndex = Math.floor(month / 3);
    const qStartMonth = quarterIndex * 3;
    const qEndMonth = qStartMonth + 2;

    const qStart = new Date(year, qStartMonth, 1, 0, 0, 0);
    const qEnd = new Date(year, qEndMonth + 1, 0, 23, 59, 59);

    const totalMs = qEnd.getTime() - qStart.getTime();
    const elapsedMs = Math.max(0, now.getTime() - qStart.getTime());
    const remainingMs = Math.max(0, qEnd.getTime() - now.getTime());

    const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    const weeksLeft = Math.floor(daysLeft / 7);
    const remDays = daysLeft % 7;

    const elapsedPct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

    let displayStr = `${daysLeft}d`;
    if (weeksLeft > 0) {
      displayStr = `${weeksLeft} sem ${remDays}d`;
    }

    return {
      quarterName: `Q${quarterIndex + 1}`,
      weeksLeft,
      remDays,
      daysLeft,
      displayStr,
      elapsedPct
    };
  }, []);

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
            Bem-vindo ao <Sun size={26} style={{ color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)' }} /> <span style={{ color: '#f59e0b' }}>NoClima</span>
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
        {/* Box 1: Minutos de uso na plataforma hoje */}
        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">{activeTimeFormatted}</span>
            <span className="stat-box-label">Hoje</span>
          </div>
        </div>

        {/* Box 2: Frases Praticadas Hoje */}
        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <BookOpen size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value">{completedToday}</span>
            <span className="stat-box-label">Praticadas Hoje</span>
          </div>
        </div>

        {/* Box 3: Contagem Regressiva do Trimestre (Semanas / Dias) */}
        <div className="stat-box">
          <div className="stat-box-icon" style={{ color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Calendar size={20} />
          </div>
          <div className="stat-box-info">
            <span className="stat-box-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 850, color: 'white' }}>{quarterInfo.weeksLeft} sem</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>/</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa' }}>{quarterInfo.daysLeft}d</span>
            </span>
            <span className="stat-box-label">Fim do Trimestre ({quarterInfo.quarterName})</span>
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
