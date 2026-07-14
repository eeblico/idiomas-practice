import React, { useState, useMemo } from 'react';
import { useApp, AVAILABLE_LANGUAGES } from '../context/AppContext';
import { 
  Plus, 
  BookOpen, 
  Award,
  ChevronDown
} from 'lucide-react';

interface GroupDefinition {
  id: string;
  name: string;
  dotColor: string;
  subgroups: {
    id: string;
    circleLabel?: string;
    title: string;
    description: string;
    isStandalone?: boolean;
    sheetId?: string;
    islandIds?: string[];
  }[];
}

export const VocabularyBuilder: React.FC = () => {
  const { 
    targetLanguage, 
    categories, 
    phrases, 
    phraseStars, 
    reviewItems,
    setActiveIslandId,
    setActiveTab
  } = useApp();

  const activeLang = AVAILABLE_LANGUAGES.find(l => l.id === targetLanguage) || AVAILABLE_LANGUAGES[0];

  // Accordion collapsed state for subgroups (true means collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Sheet descriptions map to keep cards aligned with screenshots
  const sheetDescriptions: Record<string, string> = {
    'nível_a1_-_parte_1': 'Palavras fundamentais para construir frases básicas e navegar em interações simples e cotidianas.',
    'nível_a1_-_parte_2': 'Palavras fundamentais para construir frases básicas e navegar em interações simples do dia a dia.',
    'nível_a1_-_parte_3': 'Palavras fundamentais para construir frases básicas e navegar em interações simples do dia a dia.',
    'nível_a1_-_parte_4': 'Palavras fundamentais para construir frases básicas e navegar em interações simples e cotidianas.',
    'nível_a2_-_parte_1': 'Vocabulário essencial para descrever seu ambiente imediato e necessidades pessoais rotineiras.',
    'nível_a2_-_parte_2': 'Vocabulário essencial para descrever o seu ambiente imediato e as necessidades pessoais rotineiras.',
    'nível_a2_-_parte_3': 'Vocabulário essencial para descrever seu ambiente imediato e necessidades pessoais rotineiras.',
    'nível_a2_-_parte_4': 'Vocabulário essencial para descrever seu ambiente imediato e necessidades pessoais rotineiras.',
    'nível_b1_-_parte_1': 'Linguagem funcional para expressar opiniões, explicar planos e lidar com a maioria das situações de viagem comuns.',
    'nível_b1_-_parte_2': 'Linguagem funcional para expressar opiniões, explicar planos e lidar com as situações de viagem mais comuns.',
    'nível_b1_-_parte_3': 'Linguagem funcional para expressar opiniões, explicar planos e lidar com as situações de viagem mais comuns.',
    'nível_b1_-_parte_4': 'Linguagem funcional para expressar opiniões, explicar planos e lidar com as situações de viagem mais comuns.',
    'nível_b2_-_parte_1': 'Vocabulário versátil para participar de discussões complexas e expressar pontos de vista sobre diversos temas abstratos.',
    'nível_b2_-_parte_2': 'Vocabulário versátil para participar de discussões complexas e expressar pontos de vista sobre diversos tópicos abstratos.',
    'nível_b2_-_parte_3': 'Vocabulário versátil para participar de discussões complexas e expressar pontos de vista sobre diversos temas abstratos.',
    'presente': 'Presente - Passado - Futuro',
    'adjetivos': 'Descritores essenciais para ajudar você a adicionar mais detalhes e variedade à sua linguagem cotidiana.',
    'advérbios': 'Modificadores-chave para expressar como, quando e onde as ações ocorrem.',
    'verbos': 'Palavras de ação essenciais para ajudar você a descrever atividades e estados de ser de forma clara.',
    'c1': 'Sophisticated terms to convey subtle nuances and produce clear, well-structured text on complex subjects.'
  };

  const categoryLabels: Record<string, string> = {
    comum: 'Geral',
    viagem: 'Viagem',
    trabalho: 'Trabalho',
    dia_a_dia: 'Dia a Dia',
    sentimentos: 'Sentimentos',
    comida: 'Comida'
  };

  // Extract vocabulary builder categories (prefixed with 'vocab_sheet_')
  const vocabIslands = useMemo(() => {
    return categories.filter(c => c.id.startsWith('vocab_sheet_') && c.language_id === targetLanguage);
  }, [categories, targetLanguage]);

  // Define groups exactly matching the screenshot visual specification
  const groups: GroupDefinition[] = useMemo(() => {
    return [
      {
        id: 'iniciante',
        name: 'Iniciante',
        dotColor: '#10b981',
        subgroups: [
          {
            id: 'a1',
            circleLabel: 'A1',
            title: 'A1',
            description: 'Palavras fundamentais para construir frases básicas e navegar em interações simples e cotidianas.',
            islandIds: ['vocab_sheet_nível_a1_-_parte_1', 'vocab_sheet_nível_a1_-_parte_2', 'vocab_sheet_nível_a1_-_parte_3', 'vocab_sheet_nível_a1_-_parte_4']
          },
          {
            id: 'a2',
            circleLabel: 'A2',
            title: 'A2',
            description: 'Vocabulário essencial para descrever seu ambiente imediato e necessidades pessoais rotineiras.',
            islandIds: ['vocab_sheet_nível_a2_-_parte_1', 'vocab_sheet_nível_a2_-_parte_2', 'vocab_sheet_nível_a2_-_parte_3', 'vocab_sheet_nível_a2_-_parte_4']
          },
          {
            id: 'conjugacoes',
            title: 'Conjugações Verbais Básicas',
            description: 'Presente - Passado - Futuro',
            isStandalone: true,
            sheetId: 'vocab_sheet_presente'
          }
        ]
      },
      {
        id: 'intermediario',
        name: 'Intermediário',
        dotColor: '#f59e0b',
        subgroups: [
          {
            id: 'b1',
            circleLabel: 'B1',
            title: 'B1',
            description: 'Linguagem funcional para expressar opiniões, explicar planos e lidar com a maioria das situações de viagem comuns.',
            islandIds: ['vocab_sheet_nível_b1_-_parte_1', 'vocab_sheet_nível_b1_-_parte_2', 'vocab_sheet_nível_b1_-_parte_3', 'vocab_sheet_nível_b1_-_parte_4']
          },
          {
            id: 'b2',
            circleLabel: 'B2',
            title: 'B2',
            description: 'Vocabulário versátil para participar de discussões complexas e expressar pontos de vista sobre diversos temas abstratos.',
            islandIds: ['vocab_sheet_nível_b2_-_parte_1', 'vocab_sheet_nível_b2_-_parte_2', 'vocab_sheet_nível_b2_-_parte_3']
          },
          {
            id: 'adjetivos',
            title: '300 Adjetivos Mais Comuns',
            description: 'Descritores essenciais para ajudar você a adicionar mais detalhes e variedade à sua linguagem cotidiana.',
            isStandalone: true,
            sheetId: 'vocab_sheet_adjetivos'
          },
          {
            id: 'adverbios',
            title: 'Os 300 Advérbios Mais Comuns',
            description: 'Modificadores-chave para expressar como, quando e onde as ações ocorrem.',
            isStandalone: true,
            sheetId: 'vocab_sheet_advérbios'
          },
          {
            id: 'verbos',
            title: 'Os 300 Verbos Mais Comuns',
            description: 'Palavras de ação essenciais para ajudar você a descrever atividades e estados de ser de forma clara.',
            isStandalone: true,
            sheetId: 'vocab_sheet_verbos'
          }
        ]
      },
      {
        id: 'avancado',
        name: 'Avançado',
        dotColor: '#ef4444',
        subgroups: [
          {
            id: 'c1',
            title: 'Gramática e vocabulário C1',
            description: 'Sophisticated terms to convey subtle nuances and produce clear, well-structured text on complex subjects.',
            isStandalone: true,
            sheetId: 'vocab_sheet_c1'
          }
        ]
      }
    ];
  }, []);

  // Global vocabulary stats computed dynamically
  const globalStats = useMemo(() => {
    let total = 0;
    let studied = 0;
    let inReview = 0;

    vocabIslands.forEach(island => {
      const islandPhrases = phrases.filter(p => p.category_id === island.id);
      total += islandPhrases.length;
      
      islandPhrases.forEach(p => {
        const isStudied = (phraseStars[p.id] && phraseStars[p.id] > 0) || reviewItems[p.id];
        if (isStudied) {
          studied++;
        }
        if (reviewItems[p.id]) {
          inReview++;
        }
      });
    });

    const progress = total > 0 ? Math.round((studied / total) * 100) : 0;

    return { total, studied, inReview, progress };
  }, [vocabIslands, phrases, phraseStars, reviewItems]);

  // Toggle subgroup accordion
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Open active island and redirect to practice tab
  const handleOpenIsland = (islandId: string) => {
    setActiveIslandId(islandId);
    setActiveTab('practice');
  };

  // Render a standard sub-island grid card (with purple book icon)
  const renderIslandCard = (islandId: string) => {
    const island = vocabIslands.find(is => is.id === islandId);
    if (!island) return null;

    const islandPhrases = phrases.filter(p => p.category_id === island.id);
    const total = islandPhrases.length;
    const studied = islandPhrases.filter(p => (phraseStars[p.id] && phraseStars[p.id] > 0) || reviewItems[p.id]).length;
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;

    // Remove category prefix to match sheetDescriptions keys
    const cleanKey = island.id.replace('vocab_sheet_', '');

    return (
      <div
        key={island.id}
        onClick={() => handleOpenIsland(island.id)}
        className="glass-card planner-day-card"
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          cursor: 'pointer',
          border: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.01)',
          position: 'relative',
          transition: 'all 0.2s',
          minHeight: '108px'
        }}
      >
        <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white', margin: 0 }}>
              {island.name}
            </h5>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.35 }}>
              {sheetDescriptions[cleanKey] || island.description || 'Explore sentenças e palavras deste nível.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? 'var(--success)' : 'var(--accent)' }} />
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {percent}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render a full-width horizontal banner card
  const renderStandaloneCard = (sheetId: string, title: string, desc: string, groupColor: string) => {
    const island = vocabIslands.find(is => is.id === sheetId);
    if (!island) return null;

    const islandPhrases = phrases.filter(p => p.category_id === island.id);
    const total = islandPhrases.length;
    const studied = islandPhrases.filter(p => (phraseStars[p.id] && phraseStars[p.id] > 0) || reviewItems[p.id]).length;
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;

    return (
      <div
        key={island.id}
        onClick={() => handleOpenIsland(island.id)}
        className="glass-card planner-day-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          border: '1px solid var(--border)',
          borderLeft: `4px solid ${groupColor}`,
          background: 'rgba(255, 255, 255, 0.01)',
          marginTop: '12px',
          position: 'relative'
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${groupColor}`,
          flexShrink: 0
        }}>
          <BookOpen size={18} style={{ color: groupColor }} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            {desc}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {studied}/{total}
          </span>
          <span style={{ fontSize: '0.62rem', color: percent === 100 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 800 }}>
            {percent}% dominado
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '10px', color: 'white', margin: 0 }}>
            📖 Construtor de Vocabulário
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Domine vocabulário e sentenças essenciais em <strong>{activeLang.flag_emoji} {activeLang.name}</strong>.
          </p>
        </div>
        
        {/* Create custom phrase button (redirects directly to the custom words island workspace) */}
        <button
          onClick={() => handleOpenIsland('vocab_sheet_custom_words')}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={16} />
          Nova Palavra
        </button>
      </div>

      {/* 2. MAIN CATALOG VIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Global Progress Panel */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={14} style={{ color: '#eab308' }} /> Progresso Geral de Vocabulário
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{globalStats.progress}%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                ({globalStats.studied} de {globalStats.total} sentenças dominadas • {globalStats.inReview} importadas para revisão)
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${globalStats.progress}%`, height: '100%', background: 'linear-gradient(to right, var(--accent), #10b981)', transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Standalone card for custom words */}
        {vocabIslands.some(is => is.id === 'vocab_sheet_custom_words') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderStandaloneCard('vocab_sheet_custom_words', 'Vocabulário Personalizado', 'Explore e adicione seus próprios termos de estudo personalizados.', 'var(--accent)')}
          </div>
        )}

        {/* Level accordions catalog display (for English spreadsheet view) */}
        {targetLanguage === 'en' ? (
          groups.map(group => (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Level Category dot indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: group.dotColor }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'white', margin: 0 }}>
                  {group.name}
                </h3>
              </div>

              {/* Render subgroups & standalone cards inside level */}
              {group.subgroups.map(subgroup => {
                if (subgroup.isStandalone && subgroup.sheetId) {
                  return renderStandaloneCard(
                    subgroup.sheetId, 
                    subgroup.title, 
                    subgroup.description, 
                    group.dotColor
                  );
                }

                const isCollapsed = collapsedSections[subgroup.id] || false;

                return (
                  <div key={subgroup.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Collapsible header */}
                    <div 
                      onClick={() => toggleSection(subgroup.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        marginTop: '8px',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {subgroup.circleLabel && (
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: group.dotColor,
                            color: 'white',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem'
                          }}>
                            {subgroup.circleLabel}
                          </div>
                        )}
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>
                            {subgroup.title}
                          </h4>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            {subgroup.description}
                          </p>
                        </div>
                      </div>
                      
                      <ChevronDown 
                        size={18} 
                        style={{ 
                          color: 'var(--text-muted)', 
                          transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', 
                          transition: 'transform 0.25s ease' 
                        }} 
                      />
                    </div>

                    {/* Accordion panel of inner cards */}
                    {!isCollapsed && subgroup.islandIds && (
                      <div 
                        className="fade-in"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '14px',
                          marginTop: '10px',
                          paddingLeft: '12px'
                        }}
                      >
                        {subgroup.islandIds.map(id => renderIslandCard(id))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          /* Thematic category display (for non-English target languages) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'white', margin: 0 }}>
                Ilhas de Vocabulário
              </h3>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '14px',
              marginTop: '8px'
            }}>
              {vocabIslands.filter(is => is.id !== 'vocab_sheet_custom_words').map(island => renderIslandCard(island.id))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
