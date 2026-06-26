import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, BookOpen, Headphones, Clock, Award, 
  Calendar, CheckCircle, Map as MapIcon, Target 
} from 'lucide-react';

export const StatsView: React.FC = () => {
  const { 
    streak, 
    phrases, 
    favorites, 
    reviewsDueCount, 
    reviewItems, 
    targetLanguage, 
    categories 
  } = useApp();

  // Filter phrases & categories for active target language
  const targetPhrases = useMemo(() => {
    return (phrases || []).filter(p => p && p.language_id === targetLanguage);
  }, [phrases, targetLanguage]);

  const targetPhrasesMap = useMemo(() => {
    return new Map(targetPhrases.map(p => [p.id, p]));
  }, [targetPhrases]);

  // Filter review items for the target language phrases
  const targetReviewItems = useMemo(() => {
    return Object.values(reviewItems || {}).filter(item => {
      return item && item.phrase_id && targetPhrasesMap.has(item.phrase_id);
    });
  }, [reviewItems, targetPhrasesMap]);

  const studiedCount = targetReviewItems.length;
  const totalPhrases = targetPhrases.length;
  const vocabPercentage = totalPhrases > 0 ? Math.round((studiedCount / totalPhrases) * 100) : 0;

  // Local storage metrics
  const shadowReps = useMemo(() => {
    try {
      const val = Number(localStorage.getItem('hl_stats_total_shadow_reps') || '0');
      return isNaN(val) ? 0 : val;
    } catch {
      return 0;
    }
  }, []);

  const totalTimeSec = useMemo(() => {
    try {
      const val = Number(localStorage.getItem('hl_stats_total_study_time_sec') || '0');
      return isNaN(val) ? 0 : val;
    } catch {
      return 0;
    }
  }, []);

  const timeStr = useMemo(() => {
    const hrs = Math.floor(totalTimeSec / 3600);
    const mins = Math.floor((totalTimeSec % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }, [totalTimeSec]);

  // CEFR calculation
  const cefrThresholds = [
    { level: 'A0', name: 'Iniciante Absoluto', min: 0, max: 10 },
    { level: 'A1', name: 'Iniciante', min: 11, max: 50 },
    { level: 'A2', name: 'Básico', min: 51, max: 120 },
    { level: 'B1', name: 'Intermediário', min: 121, max: 250 },
    { level: 'B2', name: 'Intermediário Superior', min: 251, max: 500 },
    { level: 'C1', name: 'Avançado', min: 501, max: Infinity }
  ];

  const cefrInfo = useMemo(() => {
    let current = cefrThresholds[0];
    let next = cefrThresholds[1];

    for (let i = 0; i < cefrThresholds.length; i++) {
      if (studiedCount >= cefrThresholds[i].min && studiedCount <= cefrThresholds[i].max) {
        current = cefrThresholds[i];
        next = cefrThresholds[i + 1] || null;
        break;
      }
    }
    
    let pct = 100;
    if (next) {
      const range = next.min - current.min;
      const progress = studiedCount - current.min;
      pct = Math.min(Math.round((progress / range) * 100), 100);
    }

    return { current, next, pct };
  }, [studiedCount]);

  // Mastery categories
  const masteryStats = useMemo(() => {
    let novas = 0;
    let aprendendo = 0;
    let revisando = 0;
    let dominadas = 0;

    targetPhrases.forEach(p => {
      const item = reviewItems?.[p.id];
      if (!item) {
        novas++;
      } else {
        const interval = item.interval_days || 0;
        if (interval < 5) {
          aprendendo++;
        } else if (interval <= 21) {
          revisando++;
        } else {
          dominadas++;
        }
      }
    });

    const total = targetPhrases.length || 1;
    return {
      novas,
      aprendendo,
      revisando,
      dominadas,
      pctNovas: Math.round((novas / total) * 100),
      pctAprendendo: Math.round((aprendendo / total) * 100),
      pctRevisando: Math.round((revisando / total) * 100),
      pctDominadas: Math.round((dominadas / total) * 100),
    };
  }, [targetPhrases, reviewItems]);

  // GitHub contribution calendar data (8 weeks = 56 days)
  const calendarDays = useMemo(() => {
    const today = new Date();
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());
    
    const startDate = new Date(currentSunday);
    startDate.setDate(currentSunday.getDate() - 49); // Sunday of 7 weeks ago

    const daysList = [];
    let countsMap: Record<string, number> = {};
    try {
      const stored = localStorage.getItem('hl_study_daily_counts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          countsMap = parsed;
        }
      }
    } catch {}

    for (let i = 0; i < 56; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = countsMap[dateStr] || 0;
      daysList.push({ date: d, dateStr, count });
    }
    return daysList;
  }, []);

  // Islands list progress details
  const targetCategories = useMemo(() => {
    return (categories || []).filter(c => c && c.language_id === targetLanguage);
  }, [categories, targetLanguage]);

  const islandProgressList = useMemo(() => {
    return targetCategories.map(cat => {
      const catPhrases = targetPhrases.filter(p => p.category_id === cat.id);
      const total = catPhrases.length;
      
      let studied = 0;
      let novas = 0;
      let aprendendo = 0;
      let revisando = 0;
      let dominadas = 0;

      catPhrases.forEach(p => {
        const item = reviewItems?.[p.id];
        if (item) {
          studied++;
          const interval = item.interval_days || 0;
          if (interval < 5) {
            aprendendo++;
          } else if (interval <= 21) {
            revisando++;
          } else {
            dominadas++;
          }
        } else {
          novas++;
        }
      });

      const progress = total > 0 ? Math.round((studied / total) * 100) : 0;

      return {
        category: cat,
        total,
        studied,
        progress,
        novas,
        aprendendo,
        revisando,
        dominadas
      };
    }).sort((a, b) => b.progress - a.progress); // Sort by progress descending
  }, [targetCategories, targetPhrases, reviewItems]);

  // Color intensities for github contribution cells
  const getCellColor = (count: number) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count <= 3) return 'rgba(139, 92, 246, 0.25)'; // Low activity violet
    if (count <= 7) return 'rgba(139, 92, 246, 0.50)'; // Mid activity
    if (count <= 12) return 'rgba(139, 92, 246, 0.75)'; // High activity
    return 'rgba(139, 92, 246, 1.0)'; // Super high activity
  };

  const formatTooltip = (date: Date, count: number) => {
    const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    return `${dateStr}: ${count} ${count === 1 ? 'estudo' : 'estudos'}`;
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .stats-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .stats-dashboard-grid {
            grid-template-columns: 1.1fr 1.9fr;
          }
        }
        .stats-grid-cols-4 {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .stats-grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1280px) {
          .stats-grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}} />

      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Estatísticas de Aprendizado</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acompanhe seu progresso, frequência e níveis de fluência.</p>
      </div>

      {/* 4 Metrics Cards Row */}
      <div className="stats-grid-cols-4">
        {/* Card 1: Ofensiva */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{streak || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dias de Ofensiva</div>
          </div>
        </div>

        {/* Card 2: Vocabulário */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ color: 'var(--accent)', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{vocabPercentage}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{studiedCount} / {totalPhrases} frases</div>
          </div>
        </div>

        {/* Card 3: Shadowing Reps */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ color: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <Headphones size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{shadowReps}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Repetições Shadowing</div>
          </div>
        </div>

        {/* Card 4: Tempo de Estudo */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{timeStr}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tempo Total de Estudo</div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-dashboard-grid">
        
        {/* Column 1: CEFR Level & Vocabulary Mastery Donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card: CEFR Nível */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Award size={20} style={{ color: 'var(--accent)' }} /> Nível CEFR Projetado
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
              <div style={{ 
                fontSize: '2.2rem', 
                fontWeight: 900, 
                color: 'var(--accent)', 
                background: 'rgba(139, 92, 246, 0.1)', 
                minWidth: '64px', 
                height: '64px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px dashed rgba(139, 92, 246, 0.3)'
              }}>
                {cefrInfo.current.level}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{cefrInfo.current.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Calculado com base nas frases estudadas do idioma atual.
                </div>
              </div>
            </div>

            {cefrInfo.next && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span>Próximo nível: <strong>{cefrInfo.next.level} ({cefrInfo.next.name})</strong></span>
                  <span>{studiedCount} / {cefrInfo.next.min} frases</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${cefrInfo.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #10b981)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}
          </div>

          {/* Card: Mastery Donut Infographic */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Target size={20} style={{ color: '#10b981' }} /> Domínio de Vocabulário
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
              {/* Conic Donut Chart */}
              <div style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: `conic-gradient(
                  #10b981 0% ${masteryStats.pctDominadas}%,
                  #3b82f6 ${masteryStats.pctDominadas}% ${masteryStats.pctDominadas + masteryStats.pctRevisando}%,
                  #f59e0b ${masteryStats.pctDominadas + masteryStats.pctRevisando}% ${masteryStats.pctDominadas + masteryStats.pctRevisando + masteryStats.pctAprendendo}%,
                  rgba(255, 255, 255, 0.08) ${masteryStats.pctDominadas + masteryStats.pctRevisando + masteryStats.pctAprendendo}% 100%
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  width: '102px',
                  height: '102px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalPhrases}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Frases Totais</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#10b981' }} />
                    <span>Dominadas</span>
                  </div>
                  <strong>{masteryStats.dominadas} ({masteryStats.pctDominadas}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#3b82f6' }} />
                    <span>Revisando</span>
                  </div>
                  <strong>{masteryStats.revisando} ({masteryStats.pctRevisando}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#f59e0b' }} />
                    <span>Aprendendo</span>
                  </div>
                  <strong>{masteryStats.aprendendo} ({masteryStats.pctAprendendo}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                    <span>Novas</span>
                  </div>
                  <strong>{masteryStats.novas} ({masteryStats.pctNovas}%)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Activity Frequency Calendar & Islands detailed Progress list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card: Contribution Calendar */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Calendar size={20} style={{ color: 'var(--accent)' }} /> Frequência de Estudos (Últimas 8 Semanas)
            </h3>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Intensidade diária de revisões e prática de shadowing no aplicativo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '340px' }}>
                {/* Y-axis Day labels */}
                <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gap: '4px', fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', paddingTop: '2px' }}>
                  <span>Dom</span>
                  <span></span>
                  <span>Ter</span>
                  <span></span>
                  <span>Qui</span>
                  <span></span>
                  <span>Sáb</span>
                </div>

                {/* 7 rows by 8 columns grid */}
                <div style={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridTemplateRows: 'repeat(7, 12px)',
                  gap: '4px'
                }}>
                  {calendarDays.map((day) => (
                    <div 
                      key={day.dateStr}
                      title={formatTooltip(day.date, day.count)}
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getCellColor(day.count),
                        borderRadius: '2px',
                        transition: 'transform 0.1s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                        e.currentTarget.style.boxShadow = '0 0 6px rgba(139, 92, 246, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Legend for grid */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Menos</span>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(139, 92, 246, 0.25)', borderRadius: '1px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(139, 92, 246, 0.50)', borderRadius: '1px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(139, 92, 246, 0.75)', borderRadius: '1px' }} />
                <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(139, 92, 246, 1.0)', borderRadius: '1px' }} />
                <span>Mais</span>
              </div>
            </div>
          </div>

          {/* Card: Islands Progress List */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <MapIcon size={20} style={{ color: '#06b6d4' }} /> Progresso Detalhado por Ilha
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {islandProgressList.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                  Nenhuma ilha encontrada para o idioma selecionado.
                </div>
              ) : (
                islandProgressList.map(item => (
                  <div key={item.category.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.category.name}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#06b6d4' }}>{item.progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', background: '#06b6d4', borderRadius: '999px' }} />
                    </div>

                    {/* Distribution stats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Total: <strong>{item.total}</strong></span>
                      <span>•</span>
                      <span style={{ color: '#10b981' }}>Dominadas: <strong>{item.dominadas}</strong></span>
                      <span>•</span>
                      <span style={{ color: '#3b82f6' }}>Revisando: <strong>{item.revisando}</strong></span>
                      <span>•</span>
                      <span style={{ color: '#f59e0b' }}>Aprendendo: <strong>{item.aprendendo}</strong></span>
                      <span>•</span>
                      <span>Novas: <strong>{item.novas}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
