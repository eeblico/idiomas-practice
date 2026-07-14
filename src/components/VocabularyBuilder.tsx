import React, { useState, useEffect, useMemo } from 'react';
import { useApp, AVAILABLE_LANGUAGES, Phrase } from '../context/AppContext';
import { staticVocabulary, VocabularyWord } from '../data/vocabularyData';
import { 
  Search, 
  Plus, 
  Volume2, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Tag, 
  GraduationCap, 
  Check, 
  X, 
  Award,
  BookMarked
} from 'lucide-react';

export const VocabularyBuilder: React.FC = () => {
  const { 
    targetLanguage, 
    addCustomPhrase, 
    phrases 
  } = useApp();

  const activeLang = AVAILABLE_LANGUAGES.find(l => l.id === targetLanguage) || AVAILABLE_LANGUAGES[0];

  // Custom words added by the user
  const [customWords, setCustomWords] = useState<VocabularyWord[]>(() => {
    try {
      const stored = localStorage.getItem('hl_custom_vocab_words');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Word IDs marked as studied by the user
  const [studiedWordIds, setStudiedWordIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hl_studied_vocab_words');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Toggled state for revealing translations per card
  const [revealedCardIds, setRevealedCardIds] = useState<Record<string, boolean>>({});

  // Active filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'todos' | 'iniciante' | 'intermediario' | 'avancado'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Form states for adding a custom word
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newLevel, setNewLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [newCategory, setNewCategory] = useState<'comum' | 'viagem' | 'trabalho' | 'dia_a_dia' | 'sentimentos' | 'comida'>('comum');
  const [newExample, setNewExample] = useState('');
  const [newExampleTranslation, setNewExampleTranslation] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');

  // Audio playing state for TTS feedback
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  // Merge static and custom words for the current target language
  const allWords = useMemo(() => {
    const staticList = staticVocabulary[targetLanguage] || [];
    const customList = customWords.filter(w => w.id.startsWith(`custom-${targetLanguage}-`));
    return [...staticList, ...customList];
  }, [targetLanguage, customWords]);

  // Save custom words to local storage when changed
  useEffect(() => {
    localStorage.setItem('hl_custom_vocab_words', JSON.stringify(customWords));
  }, [customWords]);

  // Save studied words to local storage when changed
  useEffect(() => {
    localStorage.setItem('hl_studied_vocab_words', JSON.stringify(studiedWordIds));
  }, [studiedWordIds]);

  // TTS helper for word pronunciation
  const speakWord = (text: string, wordId: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMapping: Record<string, string> = {
        en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', de: 'de-DE', zh: 'zh-CN', ru: 'ru-RU'
      };
      
      utterance.lang = langMapping[targetLanguage] || targetLanguage;
      utterance.rate = 0.9;
      
      utterance.onstart = () => setPlayingWordId(wordId);
      utterance.onend = () => setPlayingWordId(null);
      utterance.onerror = () => setPlayingWordId(null);
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Speech error:', e);
      setPlayingWordId(null);
    }
  };

  // Add a custom word to the list
  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newTranslation.trim()) return;

    const createdWord: VocabularyWord = {
      id: `custom-${targetLanguage}-${Date.now()}`,
      word: newWord.trim(),
      translation: newTranslation.trim(),
      level: newLevel,
      category: newCategory,
      example: newExample.trim(),
      exampleTranslation: newExampleTranslation.trim(),
      phonetic: newPhonetic.trim() || undefined
    };

    setCustomWords(prev => [createdWord, ...prev]);

    // Reset form states
    setNewWord('');
    setNewTranslation('');
    setNewExample('');
    setNewExampleTranslation('');
    setNewPhonetic('');
    setIsFormOpen(false);
  };

  // Delete a custom word
  const handleDeleteCustomWord = (wordId: string) => {
    if (confirm('Deseja excluir esta palavra personalizada?')) {
      setCustomWords(prev => prev.filter(w => w.id !== wordId));
      setStudiedWordIds(prev => prev.filter(id => id !== wordId));
    }
  };

  // Toggle studied status
  const toggleStudied = (wordId: string) => {
    setStudiedWordIds(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId) 
        : [...prev, wordId]
    );
  };

  // Add a word to the SRS Review Deck
  const handleAddToReview = async (word: VocabularyWord) => {
    try {
      const explanationMarkdown = `📚 **Vocabulário:** ${word.word}\n📖 **Definição:** ${word.translation}\n🏷️ **Nível:** ${word.level.toUpperCase()}\n📂 **Categoria:** ${word.category.replace('_', ' ').toUpperCase()}\n\n💡 **Exemplo de uso:**\n*${word.example}*\n(${word.exampleTranslation})`;
      
      await addCustomPhrase(
        word.word,
        word.translation,
        explanationMarkdown,
        word.level === 'avancado' ? 'hard' : word.level === 'intermediario' ? 'medium' : 'easy',
        'Fenrir',
        1.0,
        `shadowing-vocab-${targetLanguage}`
      );
      
      alert(`"${word.word}" foi adicionada com sucesso ao seu deck de revisões!`);
    } catch (err) {
      console.error(err);
      alert('Não foi possível adicionar a palavra às revisões.');
    }
  };

  // Check if a word is already in the review queue
  const isWordInQueue = (wordText: string) => {
    const cleanWord = wordText.trim().toLowerCase();
    return phrases.some((p: Phrase) => p.text.toLowerCase() === cleanWord && p.language_id === targetLanguage);
  };

  // Toggle translation visibility
  const toggleReveal = (wordId: string) => {
    setRevealedCardIds(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  // Categories helper mapping
  const categoryLabels: Record<string, string> = {
    comum: 'Geral',
    viagem: 'Viagem',
    trabalho: 'Trabalho',
    dia_a_dia: 'Dia a Dia',
    sentimentos: 'Sentimentos',
    comida: 'Comida'
  };

  // Filtering logic
  const filteredWords = useMemo(() => {
    return allWords.filter(w => {
      const matchesSearch = 
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.example && w.example.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLevel = selectedLevel === 'todos' || w.level === selectedLevel;
      const matchesCategory = selectedCategory === 'todos' || w.category === selectedCategory;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [allWords, searchQuery, selectedLevel, selectedCategory]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = allWords.length;
    const studied = allWords.filter(w => studiedWordIds.includes(w.id)).length;
    
    // In Review queue count
    const inReview = allWords.filter(w => isWordInQueue(w.word)).length;

    // Progress percentage
    const progress = total > 0 ? Math.round((studied / total) * 100) : 0;

    // Split by levels
    const levels = {
      iniciante: { total: 0, studied: 0 },
      intermediario: { total: 0, studied: 0 },
      avancado: { total: 0, studied: 0 }
    };

    allWords.forEach(w => {
      if (levels[w.level]) {
        levels[w.level].total++;
        if (studiedWordIds.includes(w.id)) {
          levels[w.level].studied++;
        }
      }
    });

    return { total, studied, inReview, progress, levels };
  }, [allWords, studiedWordIds, phrases, targetLanguage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* 1. HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '10px', color: 'white', margin: 0 }}>
            📖 Construtor de Vocabulário
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Expanda seu vocabulário em <strong>{activeLang.flag_emoji} {activeLang.name}</strong> por meio de frequência, temas e revisões intervaladas.
          </p>
        </div>
        
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
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
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? 'Fechar Painel' : 'Nova Palavra'}
        </button>
      </div>

      {/* 2. ADD CUSTOM WORD FORM */}
      {isFormOpen && (
        <form 
          onSubmit={handleAddWord}
          className="glass-card fade-in" 
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--accent)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'white' }}>Adicionar Palavra Personalizada</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Word Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PALAVRA NO IDIOMA ORIGINAL *</label>
              <input
                type="text"
                required
                className="input-text"
                placeholder="Ex: Breakthrough"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Translation Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TRADUÇÃO EM PORTUGUÊS *</label>
              <input
                type="text"
                required
                className="input-text"
                placeholder="Ex: Descoberta significativa"
                value={newTranslation}
                onChange={e => setNewTranslation(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Phonetic Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRONÚNCIA / FONÉTICA (OPCIONAL)</label>
              <input
                type="text"
                className="input-text"
                placeholder="Ex: /ˈbreɪkθruː/"
                value={newPhonetic}
                onChange={e => setNewPhonetic(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Level Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>NÍVEL DE PROFICIÊNCIA</label>
              <select
                className="input-text"
                value={newLevel}
                onChange={e => setNewLevel(e.target.value as any)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'white' }}
              >
                <option value="iniciante">Iniciante (A1-A2)</option>
                <option value="intermediario">Intermediário (B1-B2)</option>
                <option value="avancado">Avançado (C1-C2)</option>
              </select>
            </div>

            {/* Category Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CATEGORIA TEMÁTICA</label>
              <select
                className="input-text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'white' }}
              >
                {Object.entries(categoryLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', flexWrap: 'wrap' }}>
            {/* Example Sentence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FRASE DE EXEMPLO (IDIOMA ORIGINAL)</label>
              <textarea
                className="input-text"
                placeholder="Ex: This scientific breakthrough will change everything."
                value={newExample}
                onChange={e => setNewExample(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 0.85, minHeight: '60px', resize: 'vertical' }}
              />
            </div>

            {/* Example Translation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TRADUÇÃO DA FRASE DE EXEMPLO</label>
              <textarea
                className="input-text"
                placeholder="Ex: Esta descoberta científica mudará tudo."
                value={newExampleTranslation}
                onChange={e => setNewExampleTranslation(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 0.85, minHeight: '60px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                background: 'var(--success)',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}
            >
              Salvar Palavra
            </button>
          </div>
        </form>
      )}

      {/* 3. PERFORMANCE & PROGRESS DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Overall Progress */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={14} style={{ color: '#eab308' }} /> Progresso de Domínio
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{stats.progress}%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                ({stats.studied} de {stats.total} palavras)
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.progress}%`, height: '100%', background: 'linear-gradient(to right, var(--accent), #10b981)', transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Level Stats breakdown */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <GraduationCap size={14} style={{ color: 'var(--accent)' }} /> Níveis Estudados
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Iniciante:</span>
              <span style={{ fontWeight: 700, color: 'white' }}>{stats.levels.iniciante.studied}/{stats.levels.iniciante.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Intermediário:</span>
              <span style={{ fontWeight: 700, color: 'white' }}>{stats.levels.intermediario.studied}/{stats.levels.intermediario.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avançado:</span>
              <span style={{ fontWeight: 700, color: 'white' }}>{stats.levels.avancado.studied}/{stats.levels.avancado.total}</span>
            </div>
          </div>
        </div>

        {/* Review Queue integration */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookMarked size={14} style={{ color: 'var(--success)' }} /> Integração com Revisão SM2
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>{stats.inReview}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>palavras importadas</span>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.25 }}>
            As palavras importadas entram na sua rotação de estudos diários.
          </span>
        </div>

      </div>

      {/* 4. SEARCH AND FILTERS TOOLBAR */}
      <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Pesquisar palavra ou tradução..."
              className="input-text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius)',
                background: 'rgba(0,0,0,0.2)'
              }}
            />
          </div>

          {/* Level Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.15)', padding: '2px', borderRadius: '6px' }}>
            {(['todos', 'iniciante', 'intermediario', 'avancado'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  border: 'none',
                  background: selectedLevel === lvl ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: selectedLevel === lvl ? 'white' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: selectedLevel === lvl ? 700 : 500,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s'
                }}
              >
                {lvl === 'todos' ? 'Todos Níveis' : lvl === 'intermediario' ? 'Intermed.' : lvl}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="input-text"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)'
              }}
            >
              <option value="todos">Todas Categorias</option>
              {Object.entries(categoryLabels).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 5. VOCABULARY LIST GRID */}
      {filteredWords.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1rem', color: 'white', margin: '0 0 4px 0' }}>Nenhuma palavra encontrada</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Tente mudar os filtros de busca ou crie uma nova palavra personalizada!
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '16px' 
        }}>
          {filteredWords.map((word) => {
            const isCustom = word.id.startsWith('custom-');
            const isStudied = studiedWordIds.includes(word.id);
            const inReview = isWordInQueue(word.word);
            const isRevealed = revealedCardIds[word.id] || false;

            return (
              <div
                key={word.id}
                className="glass-card fade-in"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  border: isStudied ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border)',
                  background: isStudied ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                  transition: 'all 0.2s',
                  boxShadow: isStudied ? '0 0 10px rgba(16, 185, 129, 0.05)' : 'none'
                }}
              >
                {/* Header row: badges & delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {/* Level Badge */}
                    <span style={{
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: word.level === 'avancado' ? 'rgba(239, 68, 68, 0.15)' : word.level === 'intermediario' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: word.level === 'avancado' ? '#ef4444' : word.level === 'intermediario' ? '#eab308' : '#3b82f6'
                    }}>
                      {word.level === 'avancado' ? 'C1/C2' : word.level === 'intermediario' ? 'B1/B2' : 'A1/A2'}
                    </span>
                    {/* Category Badge */}
                    <span style={{
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-secondary)'
                    }}>
                      {categoryLabels[word.category] || word.category}
                    </span>
                    {/* Custom Word indicator */}
                    {isCustom && (
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: 'var(--accent)'
                      }}>
                        Criada
                      </span>
                    )}
                  </div>

                  {/* Delete button (only for custom words) */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomWord(word.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(239, 68, 68, 0.7)',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                      }}
                      title="Excluir palavra"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Body: Original word, pronunciation & TTS */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>
                        {word.word}
                      </h4>
                      {word.phonetic && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          {word.phonetic}
                        </span>
                      )}
                    </div>

                    {/* Audio Play button */}
                    <button
                      type="button"
                      onClick={() => speakWord(word.word, word.id)}
                      style={{
                        background: playingWordId === word.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        color: playingWordId === word.id ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Ouvir pronúncia"
                    >
                      <Volume2 size={14} className={playingWordId === word.id ? 'pulse-anim' : ''} />
                    </button>
                  </div>
                </div>

                {/* Toggle translation reveal */}
                <div 
                  onClick={() => toggleReveal(word.id)}
                  style={{
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    minHeight: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  {isRevealed ? (
                    <span className="fade-in" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textAlign: 'center' }}>
                      {word.translation}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                      Clique para ver a tradução
                    </span>
                  )}
                </div>

                {/* Example sentence usage */}
                {word.example && (
                  <div style={{ 
                    borderTop: '1px solid rgba(255,255,255,0.05)', 
                    paddingTop: '8px', 
                    fontSize: '0.68rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '2px' 
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>EXEMPLO DE USO:</span>
                    <p style={{ color: 'white', margin: 0, fontStyle: 'italic', lineHeight: 1.3 }}>
                      "{word.example}"
                    </p>
                    {isRevealed && (
                      <p className="fade-in" style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                        ({word.exampleTranslation})
                      </p>
                    )}
                  </div>
                )}

                {/* Bottom Actions Row: Mark Studied and Save to Review */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: 'auto',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '10px'
                }}>
                  {/* Mark Studied Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', cursor: 'pointer', color: isStudied ? '#10b981' : 'var(--text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={isStudied}
                      onChange={() => toggleStudied(word.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{isStudied ? 'Estudado' : 'Marcar visto'}</span>
                  </label>

                  {/* Add to Spaced Repetition queue */}
                  {inReview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.68rem', fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      <span>Na Revisão</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToReview(word)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'background 0.2s'
                      }}
                      title="Salvar no deck de revisões"
                    >
                      <Plus size={12} /> Importar
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
};
