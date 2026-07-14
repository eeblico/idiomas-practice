import React, { useState } from 'react';
import { useApp, Category } from '../context/AppContext';
import { BookOpen, Users, Home, Speech, Gamepad2, Briefcase, Compass, ShoppingCart, Play, ChevronDown, ChevronUp, Plus, Trash2, Sparkles, X } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
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
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newIslandName, setNewIslandName] = useState('');
  const [newIslandDesc, setNewIslandDesc] = useState('');

  // Check if there are any custom categories in the active language
  const hasCustomCategories = customCategories.some(cc => cc.language_id === targetLanguage);

  // Grouping Topics metadata
  const topics: Topic[] = [
    ...(hasCustomCategories ? [{
      id: 'custom',
      name: 'Minhas Ilhas',
      description: 'Coleções e ilhas de estudo personalizadas criadas por você.',
      icon: <Sparkles size={22} />,
      badge: 'Pessoal',
      keywords: []
    }] : []),
    {
      id: 'basics',
      name: 'Aprenda o básico',
      description: 'Abrange elementos fundamentais como o alfabeto, gramática básica e frases essenciais de sobrevivência.',
      icon: <BookOpen size={22} />,
      badge: 'Em alta',
      keywords: [] // Handled explicitly by name matching
    },
    {
      id: 'family',
      name: 'Família e Relacionamentos',
      description: 'Abrange conexões interpessoais em um sentido mais amplo, incluindo tanto relacionamentos familiares quanto românticos.',
      icon: <Users size={22} />,
      badge: 'Popular',
      keywords: ['family', 'família', 'familia', 'hogar', 'relacionamentos', 'relacionamento', 'casamento', 'namoro']
    },
    {
      id: 'household',
      name: 'Casa e Vida Diária',
      description: 'Detalha rotinas comuns, tarefas domésticas e o vocabulário encontrado em uma casa típica.',
      icon: <Home size={22} />,
      keywords: ['home', 'house', 'cooking', 'meals', 'daily', 'routine', 'rotina', 'diária', 'diaria', 'hábitos', 'habito', 'hábito', 'casa', 'lar', 'refeições', 'cozinha']
    },
    {
      id: 'social',
      name: 'Interações Sociais',
      description: 'Abrange as nuances de conhecer pessoas, puxar assunto e manter conversas casuais.',
      icon: <Speech size={22} />,
      keywords: ['café', 'cafe', 'bar', 'restaurant', 'restaurante', 'social', 'meeting', 'interações', 'conversa', 'amigos', 'festa']
    },
    {
      id: 'hobbies',
      name: 'Passatempos',
      description: 'Explora o vocabulário sobre atividades de lazer, interesses pessoais e como você passa o seu tempo livre.',
      icon: <Gamepad2 size={22} />,
      keywords: ['creative', 'artistic', 'diy', 'skill', 'hobbies', 'leisure', 'passatempos', 'passatempo', 'lazer', 'esporte', 'música', 'habilidade']
    },
    {
      id: 'work',
      name: 'Trabalho',
      description: 'Explora a comunicação profissional, o vocabulário de escritório e a discussão de responsabilidades de carreira.',
      icon: <Briefcase size={22} />,
      keywords: ['office', 'work', 'job', 'hospitality', 'business', 'trabalho', 'emprego', 'escritório', 'escritorio', 'carreira', 'negócios']
    },
    {
      id: 'travel',
      name: 'Viagens e Exterior',
      description: 'Foca em transporte, navegação em novas cidades e gerenciamento de situações turísticas típicas.',
      icon: <Compass size={22} />,
      badge: 'Novo',
      keywords: ['hotel', 'accommodation', 'travel', 'airport', 'direction', 'viagens', 'viagem', 'exterior', 'aeroporto', 'direções', 'direção', 'localização', 'localizacao', 'turismo']
    },
    {
      id: 'shopping',
      name: 'Comer fora e compras',
      description: 'Foca em navegar por mercados, fazer pedidos em restaurantes e lidar com transações ou preços.',
      icon: <ShoppingCart size={22} />,
      keywords: ['shopping', 'grocery', 'buy', 'shop', 'compras', 'compra', 'supermercado', 'loja', 'pagamento']
    },
    {
      id: 'other',
      name: 'Outros Tópicos',
      description: 'Outras coleções de frases, vocabulário e shadowing para aprofundar seu aprendizado.',
      icon: <Compass size={22} />,
      keywords: []
    }
  ];

  const BASICS_CATEGORY_NAMES = [
    "O Kit de Sobrevivência",
    "Suas Primeiras 100 Frases",
    "300 Perguntas e Respostas – Parte 1",
    "300 Perguntas e Respostas – Parte 2",
    "300 Perguntas e Respostas – Parte 3",
    "Padrões de Linguagem – Parte 1",
    "Padrões de Linguagem – Parte 2",
    "Padrões de Linguagem – Parte 3",
    "Localização e Direções",
    "Falar Sobre Si Mesmo",
    "Horas e Horários",
    "Rotina Diária",
    "Hábitos",
    "Aprendizado de Idiomas"
  ];

  const isBasicsCategory = (name: string): boolean => {
    const norm = name.toLowerCase().replace(/–/g, '-').replace(/-/g, '-').trim();
    return BASICS_CATEGORY_NAMES.some(n => {
      const basicNorm = n.toLowerCase().replace(/–/g, '-').replace(/-/g, '-').trim();
      return basicNorm === norm;
    });
  };

  // Helper to map island/category to a topic based on keywords
  const getTopicForCategory = (cat: Category): string => {
    if (customCategories.some(cc => cc.id === cat.id)) {
      return 'custom';
    }

    if (isBasicsCategory(cat.name)) {
      return 'basics';
    }

    const nameLower = cat.name.toLowerCase();
    for (const topic of topics) {
      if (topic.id === 'basics' || topic.id === 'other') continue;
      if (topic.keywords.some(kw => nameLower.includes(kw))) {
        return topic.id;
      }
    }
    return 'other';
  };

  // Filter categories for the selected learning language (excluding vocabulary builder islands)
  const languageIslands = categories.filter(c => c.language_id === targetLanguage && !c.id.startsWith('vocab_sheet_'));

  // Group islands under their respective topics
  const groupedIslands: Record<string, Category[]> = {};
  topics.forEach(t => { groupedIslands[t.id] = []; });
  groupedIslands['other'] = [];

  languageIslands.forEach(cat => {
    const topicId = getTopicForCategory(cat);
    if (groupedIslands[topicId]) {
      groupedIslands[topicId].push(cat);
    } else {
      groupedIslands['other'].push(cat);
    }
  });

  // Sort basics categories strictly by BASICS_CATEGORY_NAMES order
  if (groupedIslands['basics']) {
    groupedIslands['basics'].sort((a, b) => {
      const idxA = BASICS_CATEGORY_NAMES.findIndex(n => {
        const basicNorm = n.toLowerCase().replace(/–/g, '-').replace(/-/g, '-').trim();
        const normA = a.name.toLowerCase().replace(/–/g, '-').replace(/-/g, '-').trim();
        return basicNorm === normA;
      });
      const idxB = BASICS_CATEGORY_NAMES.findIndex(n => {
        const basicNorm = n.toLowerCase().replace(/–/g, '-').replace(/-/g, '-').trim();
        const normB = b.name.toLowerCase().replace(/–/g, '-').replace(/-/g, '-').trim();
        return basicNorm === normB;
      });
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }

  const getPhraseCount = (categoryId: string) => {
    return phrases.filter(p => p.category_id === categoryId).length;
  };

  const handleStartIsland = (categoryId: string) => {
    setActiveIslandId(categoryId);
    setActiveTab('practice');
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-glow) 0%, var(--bg-secondary) 100%)',
        padding: '30px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>Ilhas de Idiomas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Explore coleções de tópicos com diálogos, histórias e frases.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            Nova Ilha
          </button>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent)'
          }}>
            {topics.length} Tópicos | {languageIslands.length} Ilhas
          </div>
        </div>
      </div>

      {/* Grid of Topics */}
      <div className="islands-grid">
        {topics.map((topic) => {
          const islandsInTopic = groupedIslands[topic.id] || [];
          const isExpanded = expandedTopicId === topic.id;
          
          if (islandsInTopic.length === 0) return null;

          return (
            <div 
              key={topic.id} 
              className="glass-card fade-in" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                borderColor: isExpanded ? 'var(--accent)' : 'var(--border)',
                gridColumn: isExpanded ? '1 / -1' : 'span 1', // Span full grid width when expanded for clear view
                transition: 'all 0.3s ease'
              }}
            >
              {/* Header Title / Description Card */}
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                onClick={() => toggleTopic(topic.id)}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {topic.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{topic.name}</h3>
                      {topic.badge && (
                        <span className={`badge ${
                          topic.badge === 'Em alta' ? 'badge-easy' : 
                          topic.badge === 'Popular' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {topic.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {islandsInTopic.length} {islandsInTopic.length === 1 ? 'ilha' : 'ilhas'} disponíveis
                    </span>
                  </div>
                </div>

                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {topic.description}
              </p>

              {/* Expanded Islands List */}
              {isExpanded && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {islandsInTopic.map((island) => {
                    const count = getPhraseCount(island.id);
                    const isCustom = customCategories.some(cc => cc.id === island.id);
                    const canClick = count > 0 || isCustom;
                    return (
                      <div
                        key={island.id}
                        className="island-card active-glow"
                        onClick={() => canClick && handleStartIsland(island.id)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          padding: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: !canClick ? 0.6 : 1,
                          cursor: !canClick ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{island.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{island.description}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="island-count" style={{ fontSize: '0.85rem' }}>
                            {count} {count === 1 ? 'frase' : 'frases'}
                          </span>
                          {count > 0 && (
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--accent)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Play size={14} fill="white" />
                            </div>
                          )}
                          {isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Deseja realmente excluir a ilha "${island.name}" e todas as suas frases?`)) {
                                  deleteCustomCategory(island.id);
                                }
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: 'rgb(239, 68, 68)',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                zIndex: 5
                              }}
                              title="Excluir Ilha"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Island Modal */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card scale-in" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'var(--bg-secondary)',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>Criar Nova Ilha</h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newIslandName.trim()) return;
              await addCustomCategory(newIslandName.trim(), newIslandDesc.trim());
              setNewIslandName('');
              setNewIslandDesc('');
              setIsCreateOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nome da Ilha</label>
                <input 
                  type="text" 
                  className="input-text"
                  placeholder="Ex: Minhas Férias em Paris, Diálogos de Negócios"
                  value={newIslandName}
                  onChange={(e) => setNewIslandName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Descrição (Opcional)</label>
                <textarea 
                  className="input-text"
                  placeholder="Ex: Frases úteis para conversação em hotéis e restaurantes..."
                  value={newIslandDesc}
                  onChange={(e) => setNewIslandDesc(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsCreateOpen(false)}
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', background: 'var(--accent)', color: 'white', border: 'none' }}
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
};
