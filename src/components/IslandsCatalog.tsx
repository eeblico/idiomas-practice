import React, { useState, useEffect } from 'react';
import { useApp, Category } from '../context/AppContext';
import { 
  Brain, 
  Sprout, 
  Users, 
  Compass, 
  BookOpen, 
  Target, 
  Film, 
  Plus, 
  Trash2, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Sparkles,
  Music,
  Video,
  Search,
  Filter
} from 'lucide-react';

interface MacroClima {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgGradient: string;
  badgeBg: string;
  keywords: string[];
}

export const IslandsCatalog: React.FC = () => {
  const { 
    categories, 
    phrases, 
    targetLanguage, 
    setActiveIslandId, 
    setActiveTab,
    customCategories,
    addCustomCategory,
    deleteCustomCategory
  } = useApp();

  const [activeClimaFilter, setActiveClimaFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'story' | 'core' | 'poplab'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newIslandName, setNewIslandName] = useState('');
  const [newIslandDesc, setNewIslandDesc] = useState('');
  const [newIslandClima, setNewIslandClima] = useState('flow');

  useEffect(() => {
    const saved = sessionStorage.getItem('noclima_active_clima');
    if (saved) {
      setActiveClimaFilter(saved);
      sessionStorage.removeItem('noclima_active_clima');
    }
  }, []);

  // Define the 4 Macro-Climas metadata
  const climas: MacroClima[] = [
    {
      id: 'deepwork',
      name: 'Deep Work',
      subtitle: 'Clima Analítico',
      description: 'Estratégias de branding, negócios, tomada de decisão, finanças, leis e conectores lógicos.',
      icon: <Brain size={22} />,
      color: '#8b5cf6',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.03) 100%)',
      keywords: ['trabalho', 'work', 'office', 'escritório', 'escritorio', 'negócios', 'negocios', 'business', 'finanças', 'investimentos', 'lei', 'vendas', 'marketing', 'empreendedorismo', 'entrevistas', 'aprendizado']
    },
    {
      id: 'flow',
      name: 'Flow',
      subtitle: 'Identidade & Rotina',
      description: 'Sentimentos, quem você é, rotinas diárias, rituais de bem-estar (Obsidian, yoga) e fisiologia.',
      icon: <Sprout size={22} />,
      color: '#10b981',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.03) 100%)',
      keywords: ['rotina', 'hábitos', 'habito', 'casa', 'lar', 'falar sobre si mesmo', 'saúde', 'fitness', 'refeições', 'cozinha', 'cuidados', 'bem-estar', 'manutenção', 'contas', 'tarefas', 'sentimentos', 'daily', 'home']
    },
    {
      id: 'influence',
      name: 'Influence',
      subtitle: 'Conexão & Impacto Interpessoal',
      description: 'Comunicação social, mediação de diálogos, empoderamento em conversas, dinâmicas e polidez.',
      icon: <Users size={22} />,
      color: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.03) 100%)',
      keywords: ['padrões', 'padroes', '300 perguntas', '300 espartanos', 'polidez', 'preferências', 'preferencias', 'opiniões', 'opinoes', 'amigos', 'relacionamentos', 'namoro', 'social', 'conversa', 'diálogos', 'dialogos', 'interações', 'kit de sobrevivência', 'primeiras 100']
    },
    {
      id: 'explorer',
      name: 'Explorer',
      subtitle: 'Lúdico & Descoberta',
      description: 'Lazer, viagens, gastronomia, hobbies, esportes, cultura pop e interações leves.',
      icon: <Compass size={22} />,
      color: '#3b82f6',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      badgeBg: 'rgba(59, 130, 246, 0.12)',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(2, 132, 199, 0.03) 100%)',
      keywords: ['viagens', 'viagem', 'aeroporto', 'hotel', 'turismo', 'transporte', 'compras', 'supermercado', 'hobbies', 'passatempos', 'esportes', 'jogos', 'música', 'musica', 'artes', 'pets', 'animais', 'lazer', 'travel', 'bar', 'café', 'restaurante']
    }
  ];

  // Helper to map category to a Clima
  const getClimaForCategory = (cat: Category): string => {
    const nameLower = cat.name.toLowerCase();
    
    // Custom user categories check
    if (customCategories.some(cc => cc.id === cat.id)) {
      if (cat.description?.includes('[deepwork]')) return 'deepwork';
      if (cat.description?.includes('[flow]')) return 'flow';
      if (cat.description?.includes('[influence]')) return 'influence';
      if (cat.description?.includes('[explorer]')) return 'explorer';
      return 'flow'; // default for custom
    }

    for (const clima of climas) {
      if (clima.keywords.some(kw => nameLower.includes(kw))) {
        return clima.id;
      }
    }
    return 'explorer'; // fallback clima
  };

  // Helper to map category to sub-structure: 'story' | 'core' | 'poplab'
  const getSubStructureForCategory = (cat: Category): 'story' | 'core' | 'poplab' => {
    if (customCategories.some(cc => cc.id === cat.id)) {
      return 'story';
    }
    const nameLower = cat.name.toLowerCase();
    if (nameLower.includes('música') || nameLower.includes('filme') || nameLower.includes('série') || nameLower.includes('pop') || nameLower.includes('shadowing')) {
      return 'poplab';
    }
    return 'core';
  };

  // Filter categories for active target language (exclude vocab sheet islands)
  const languageIslands = categories.filter(c => c.language_id === targetLanguage && !c.id.startsWith('vocab_sheet_'));

  // Filter by search query
  const searchedIslands = languageIslands.filter(cat => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return cat.name.toLowerCase().includes(q) || (cat.description && cat.description.toLowerCase().includes(q));
  });

  const getPhraseCount = (categoryId: string) => {
    return phrases.filter(p => p.category_id === categoryId).length;
  };

  const handleStartIsland = (categoryId: string) => {
    setActiveIslandId(categoryId);
    setActiveTab('practice');
  };

  const handleCreateIslandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIslandName.trim()) return;

    addCustomCategory(newIslandName.trim(), `${newIslandDesc.trim()} [${newIslandClima}]`);
    setNewIslandName('');
    setNewIslandDesc('');
    setIsCreateOpen(false);
  };

  const displayedClimas = activeClimaFilter === 'all' 
    ? climas 
    : climas.filter(c => c.id === activeClimaFilter);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(16, 185, 129, 0.05) 100%)',
        padding: '28px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🏝️ Ilhas de Idiomas — <span style={{ color: 'var(--accent)' }}>NoClima</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
            Nova Ilha Narrativa
          </button>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Macro-Clima Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setActiveClimaFilter('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeClimaFilter === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: activeClimaFilter === 'all' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
              color: activeClimaFilter === 'all' ? 'white' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            ⚡ Todos os Climas ({languageIslands.length})
          </button>

          {climas.map(clima => {
            const count = languageIslands.filter(cat => getClimaForCategory(cat) === clima.id).length;
            const isActive = activeClimaFilter === clima.id;
            return (
              <button
                key={clima.id}
                onClick={() => setActiveClimaFilter(clima.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isActive ? `1px solid ${clima.color}` : '1px solid var(--border)',
                  background: isActive ? clima.badgeBg : 'var(--bg-tertiary)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ color: clima.color, display: 'flex', alignItems: 'center' }}>{clima.icon}</span>
                {clima.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Sub-structure Filter & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Sub-structure selector (Story, Core, Pop Lab) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveSubTab('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'all' ? 'var(--accent)' : 'transparent',
                color: activeSubTab === 'all' ? 'white' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Todas as Sub-ilhas
            </button>
            <button
              onClick={() => setActiveSubTab('story')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'story' ? 'var(--accent)' : 'transparent',
                color: activeSubTab === 'story' ? 'white' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <BookOpen size={12} /> Story (Pessoais)
            </button>
            <button
              onClick={() => setActiveSubTab('core')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'core' ? 'var(--accent)' : 'transparent',
                color: activeSubTab === 'core' ? 'white' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Target size={12} /> Core (Fundamentais)
            </button>
            <button
              onClick={() => setActiveSubTab('poplab')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'poplab' ? 'var(--accent)' : 'transparent',
                color: activeSubTab === 'poplab' ? 'white' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Film size={12} /> Pop Lab (Mídia)
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Buscar ilha por nome..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'white',
                fontSize: '0.82rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. CLIMAS CATALOG CONTAINER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {displayedClimas.map(clima => {
          // Get islands belonging to this clima
          const climaIslands = searchedIslands.filter(cat => getClimaForCategory(cat) === clima.id);

          // Sub-structure breakdown
          const storyIslands = climaIslands.filter(cat => getSubStructureForCategory(cat) === 'story');
          const coreIslands = climaIslands.filter(cat => getSubStructureForCategory(cat) === 'core');
          const poplabIslands = climaIslands.filter(cat => getSubStructureForCategory(cat) === 'poplab');

          if (climaIslands.length === 0 && searchQuery.trim()) return null;

          return (
            <div 
              key={clima.id} 
              className="glass-card fade-in"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                background: clima.bgGradient,
                border: `1px solid ${clima.borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Clima Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
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
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 850, color: 'white', margin: 0 }}>
                        {clima.name}
                      </h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: clima.color, background: clima.badgeBg, padding: '2px 8px', borderRadius: '12px' }}>
                        {clima.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {climaIslands.length} {climaIslands.length === 1 ? 'ilha' : 'ilhas'}
                  </span>
                </div>
              </div>

              {/* Sub-structures Render */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Story */}
                {(activeSubTab === 'all' || activeSubTab === 'story') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {storyIslands.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                        Nenhuma história narrativa criada neste clima ainda. Use o botão "Nova Ilha Narrativa" para adicionar.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                        {storyIslands.map(island => renderIslandCard(island, clima, true))}
                      </div>
                    )}
                  </div>
                )}

                {/* Core */}
                {(activeSubTab === 'all' || activeSubTab === 'core') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                      {coreIslands.map(island => renderIslandCard(island, clima, false))}
                    </div>
                  </div>
                )}

                {/* Pop Lab */}
                {(activeSubTab === 'all' || activeSubTab === 'poplab') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                      {poplabIslands.length > 0 ? (
                        poplabIslands.map(island => renderIslandCard(island, clima, false))
                      ) : null}

                      {/* Direct inter-related Pop Lab shortcuts to Music & Media tabs */}
                      <div 
                        onClick={() => setActiveTab('music')}
                        className="glass-card active-glow"
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <Music size={20} style={{ color: '#f59e0b' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'white', display: 'block' }}>Pop Lab Músicas</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Praticar com letras e karaokê 🎵</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab('media')}
                        className="glass-card active-glow"
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <Video size={20} style={{ color: '#3b82f6' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'white', display: 'block' }}>Pop Lab Shadowing</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mineração de cenas de vídeo 🎬</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL FOR CREATING NEW NARRATIVE ISLAND */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '460px', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--accent)' }} /> Nova Ilha Narrativa (Story)
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIslandSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Nome da Ilha / História
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Minha Apresentação Profissional"
                  value={newIslandName}
                  onChange={e => setNewIslandName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Macro-Clima de Alinhamento
                </label>
                <select
                  value={newIslandClima}
                  onChange={e => setNewIslandClima(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="deepwork">🧠 Deep Work (Analítico / Negócios)</option>
                  <option value="flow">🌱 Flow (Identidade / Rotina)</option>
                  <option value="influence">💬 Influence (Conexão / Social)</option>
                  <option value="explorer">✈️ Explorer (Lúdico / Viagens)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Descrição / Objetivo
                </label>
                <textarea 
                  rows={3}
                  placeholder="Descreva o foco ou a narrativa destas frases..."
                  value={newIslandDesc}
                  onChange={e => setNewIslandDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Criar Ilha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Helper render for single island card
  function renderIslandCard(island: Category, clima: MacroClima, isCustom: boolean) {
    const count = getPhraseCount(island.id);
    const cleanDesc = island.description ? island.description.replace(/\[(deepwork|flow|influence|explorer)\]/g, '').trim() : '';

    return (
      <div
        key={island.id}
        className="glass-card active-glow"
        onClick={() => handleStartIsland(island.id)}
        style={{
          background: 'var(--bg-tertiary)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: clima.color,
              flexShrink: 0
            }} />
            <strong style={{ fontSize: '0.9rem', color: 'white', lineHeight: 1.3 }}>
              {island.name}
            </strong>
          </div>

          {isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Deseja excluir a ilha "${island.name}"?`)) {
                  deleteCustomCategory(island.id);
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', opacity: 0.7 }}
              title="Excluir ilha"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {cleanDesc && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
            {cleanDesc}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {count} {count === 1 ? 'frase' : 'frases'}
          </span>

          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: clima.badgeBg,
            color: clima.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={10} style={{ marginLeft: '1px', fill: clima.color }} />
          </div>
        </div>
      </div>
    );
  }
};
