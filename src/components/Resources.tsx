import React, { useState, useEffect } from 'react';
import { Plus, Search, Copy, Check, Edit2, Trash2, X, Sparkles, Code } from 'lucide-react';

interface AIPrompt {
  id: string;
  name: string;
  category: string;
  promptText: string;
}

const DEFAULT_PROMPTS: AIPrompt[] = [
  {
    id: 'p1',
    name: 'Explicação Gramatical em Contexto',
    category: 'Gramática',
    promptText: 'Por favor, analise a seguinte frase em inglês no contexto de uma conversa diária: "[FRASE]". Destaque as estruturas gramaticais principais, explique o tempo verbal utilizado e forneça 3 frases alternativas semelhantes com explicações rápidas das diferenças.'
  },
  {
    id: 'p2',
    name: 'Nuances e Sinônimos',
    category: 'Vocabulário',
    promptText: 'Como um falante nativo diferencia as palavras "[PALAVRA_1]" e "[PALAVRA_2]" no inglês falado informal? Forneça exemplos práticos de diálogos onde uma é preferida em relação à outra, explicando a nuance de tom.'
  },
  {
    id: 'p3',
    name: 'Conexões de Pronúncia (Connected Speech)',
    category: 'Pronúncia',
    promptText: 'Descreva os fenômenos de pronúncia conectada (linking, reductions, e flapped sounds) que ocorrem ao falar a frase "[FRASE]" em velocidade natural. Forneça uma transcrição fonética simplificada e dicas de articulação.'
  },
  {
    id: 'p4',
    name: 'Reescrita Natural e Fluidez',
    category: 'Escrita',
    promptText: 'Reescreva o seguinte texto em inglês para torná-lo 100% natural, imitando a fala de um nativo de forma fluida. Classifique a reescrita em duas versões (informal/amigos e neutra/trabalho) e comente brevemente o que foi modificado e o porquê: "[TEXTO]"'
  },
  {
    id: 'p5',
    name: 'Criação de Diálogos Situacionais',
    category: 'Prática',
    promptText: 'Crie um diálogo curto e realista (de 4 a 6 linhas) em inglês usando a palavra/expressão "[EXPRESSÃO]". O cenário deve ser "[CENÁRIO]" (ex. cafeteria, aeroporto, reunião). Traduza o diálogo para o português e destaque os chunks mais importantes.'
  }
];

export const Resources: React.FC = () => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [promptName, setPromptName] = useState('');
  const [promptCategory, setPromptCategory] = useState('');
  const [promptText, setPromptText] = useState('');

  // Load from localstorage
  useEffect(() => {
    const stored = localStorage.getItem('hl_study_prompts');
    if (stored) {
      try {
        setPrompts(JSON.parse(stored));
      } catch (e) {
        setPrompts(DEFAULT_PROMPTS);
      }
    } else {
      setPrompts(DEFAULT_PROMPTS);
      localStorage.setItem('hl_study_prompts', JSON.stringify(DEFAULT_PROMPTS));
    }
  }, []);

  // Save to localstorage helper
  const savePrompts = (updatedList: AIPrompt[]) => {
    setPrompts(updatedList);
    localStorage.setItem('hl_study_prompts', JSON.stringify(updatedList));
  };

  // Get all unique categories (excluding 'Todos')
  const categories = ['Todos', ...Array.from(new Set(prompts.map(p => p.category))).sort()];

  // Handle copy text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Open Form for Adding
  const openAddModal = () => {
    setEditingPrompt(null);
    setPromptName('');
    setPromptCategory('Geral');
    setPromptText('');
    setShowFormModal(true);
  };

  // Open Form for Editing
  const openEditModal = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    setPromptName(prompt.name);
    setPromptCategory(prompt.category);
    setPromptText(prompt.promptText);
    setShowFormModal(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptName.trim() || !promptText.trim()) {
      alert('Por favor, preencha o nome e o texto do prompt.');
      return;
    }

    const cleanCategory = promptCategory.trim() || 'Geral';

    if (editingPrompt) {
      // Update
      const updated = prompts.map(p => 
        p.id === editingPrompt.id 
          ? { ...p, name: promptName.trim(), category: cleanCategory, promptText: promptText.trim() } 
          : p
      );
      savePrompts(updated);
    } else {
      // Add
      const newPrompt: AIPrompt = {
        id: `p-${Date.now()}`,
        name: promptName.trim(),
        category: cleanCategory,
        promptText: promptText.trim()
      };
      savePrompts([...prompts, newPrompt]);
    }

    setShowFormModal(false);
  };

  // Delete Prompt
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prompt?')) {
      const updated = prompts.filter(p => p.id !== id);
      savePrompts(updated);
    }
  };

  // Filter & Search Prompts
  const filteredPrompts = prompts.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.promptText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Title & Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Recursos de IA</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Copie prompts de IA criados especialmente para complementar seus estudos com inteligência artificial.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
        >
          <Plus size={16} /> Novo Prompt
        </button>
      </div>

      {/* Filter Options & Search Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-text"
            placeholder="Pesquisar prompts por nome, conteúdo ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', width: '100%' }}
          />
        </div>

        {/* Categories Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '6px' }}>
            Filtrar por:
          </span>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(124, 58, 237, 0.12)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {filteredPrompts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filteredPrompts.map(prompt => {
            const isCopied = copiedId === prompt.id;
            return (
              <div 
                key={prompt.id} 
                className="glass-card fade-in" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '14px', 
                  padding: '18px', 
                  position: 'relative',
                  border: '1px solid var(--border)',
                  transition: 'all 0.24s',
                  overflow: 'hidden'
                }}
              >
                {/* Category & Top Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: 'var(--accent)', 
                    background: 'rgba(124, 58, 237, 0.08)', 
                    border: '1px solid rgba(124, 58, 237, 0.15)', 
                    padding: '2px 8px', 
                    borderRadius: '12px' 
                  }}>
                    {prompt.category}
                  </span>

                  <button
                    onClick={() => handleCopy(prompt.id, prompt.promptText)}
                    style={{
                      background: isCopied ? '#10b981' : 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}
                    title="Copiar prompt"
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copiar
                      </>
                    )}
                  </button>
                </div>

                {/* Prompt Name & Content Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
                    {prompt.name}
                  </h3>
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono, monospace)',
                    lineHeight: 1.45,
                    maxHeight: '130px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {prompt.promptText}
                  </div>
                </div>

                {/* Bottom CRUD Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '8px', 
                  borderTop: '1px solid var(--border)', 
                  paddingTop: '12px',
                  marginTop: '4px'
                }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => openEditModal(prompt)}
                    style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Editar prompt"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDelete(prompt.id)}
                    style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}
                    title="Excluir prompt"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)'
        }}>
          <Sparkles size={24} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Nenhum prompt encontrado.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Tente ajustar a busca ou clique em "Novo Prompt" para criar um.</p>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="practice-modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', width: '92%' }}>
            <div className="practice-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <Code size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {editingPrompt ? 'Editar Prompt de Estudo' : 'Criar Novo Prompt'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {editingPrompt ? 'Modifique os detalhes do prompt' : 'Adicione uma nova instrução de IA'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="practice-modal-body" style={{ gap: '16px' }}>
                
                {/* Prompt Name */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Nome do Prompt</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Ex: Prática de Conversa, Correção de Escrita..."
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    style={{ width: '100%', marginTop: '6px' }}
                    required
                  />
                </div>

                {/* Prompt Category */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Categoria</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Ex: Gramática, Pronúncia, Escrita..."
                    value={promptCategory}
                    onChange={(e) => setPromptCategory(e.target.value)}
                    style={{ width: '100%', marginTop: '6px' }}
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                {/* Prompt Text */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Texto do Prompt (Instrução)</label>
                  <textarea
                    className="input-text"
                    placeholder="Cole aqui o prompt completo da IA. Você pode usar marcações como [FRASE], [PALAVRA] ou [TEXTO] para destacar os campos dinâmicos..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    style={{
                      width: '100%',
                      height: '140px',
                      marginTop: '6px',
                      resize: 'vertical',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.78rem',
                      lineHeight: 1.45,
                      padding: '10px'
                    }}
                    required
                  />
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px', 
                padding: '16px 24px', 
                borderTop: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowFormModal(false)}
                  style={{ padding: '8px 16px' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontWeight: 700 }}
                >
                  Salvar Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};
