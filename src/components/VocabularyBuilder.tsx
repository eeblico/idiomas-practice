import React, { useState, useEffect, useMemo } from 'react';
import { useApp, AVAILABLE_LANGUAGES, Phrase } from '../context/AppContext';
import { staticVocabulary, VocabularyWord } from '../data/vocabularyData';
import vocabPlanilha from '../data/vocabPlanilha.json';
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
  BookMarked,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface SheetWord {
  id: string;
  word: string;
  translation: string;
}

interface SheetIsland {
  id: string;
  name: string;
  level: string;
  category: string;
  words: SheetWord[];
}

export const VocabularyBuilder: React.FC = () => {
  const { 
    targetLanguage, 
    addCustomPhrase, 
    phrases 
  } = useApp();

  const activeLang = AVAILABLE_LANGUAGES.find(l => l.id === targetLanguage) || AVAILABLE_LANGUAGES[0];

  // Active selected vocabulary island (null means catalog view)
  const [activeIslandId, setActiveIslandId] = useState<string | null>(null);

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

  // Search query inside the active island
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUnstudied, setOnlyUnstudied] = useState(false);

  // Form states for adding a custom word
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newLevel, setNewLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [newCategory, setNewCategory] = useState<'comum' | 'viagem' | 'trabalho' | 'dia_a_dia' | 'sentimentos' | 'comida'>('comum');
  const [newExample, setNewExample] = useState('');
  const [newExampleTranslation, setNewExampleTranslation] = useState('');

  // Audio playing state for TTS feedback
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  // Save custom words to local storage when changed
  useEffect(() => {
    localStorage.setItem('hl_custom_vocab_words', JSON.stringify(customWords));
  }, [customWords]);

  // Save studied words to local storage when changed
  useEffect(() => {
    localStorage.setItem('hl_studied_vocab_words', JSON.stringify(studiedWordIds));
  }, [studiedWordIds]);

  // Map category keys to user-friendly titles
  const categoryLabels: Record<string, string> = {
    comum: 'Geral',
    viagem: 'Viagem',
    trabalho: 'Trabalho',
    dia_a_dia: 'Dia a Dia',
    sentimentos: 'Sentimentos',
    comida: 'Comida',
    adjetivos: 'Adjetivos',
    adverbios: 'Advérbios',
    verbos: 'Verbos',
    gramatica: 'Gramática',
    geral: 'Geral'
  };

  // Build the list of islands depending on the active study language
  const vocabIslands = useMemo(() => {
    const islandsList: {
      id: string;
      name: string;
      level: 'iniciante' | 'intermediario' | 'avancado';
      category: string;
      words: VocabularyWord[];
    }[] = [];

    if (targetLanguage === 'en') {
      // 1. For English, load spreadsheet sheets as islands
      const sheets = vocabPlanilha as SheetIsland[];
      sheets.forEach(sheet => {
        islandsList.push({
          id: sheet.id,
          name: sheet.name,
          level: sheet.level as any,
          category: sheet.category,
          words: sheet.words.map(w => ({
            id: w.id,
            word: w.word,
            translation: w.translation,
            level: sheet.level as any,
            category: sheet.category as any,
            example: '',
            exampleTranslation: ''
          }))
        });
      });
    } else {
      // 2. For other languages, group the static vocabulary by categories
      const langVocab = staticVocabulary[targetLanguage] || [];
      const categoriesGrouped: Record<string, VocabularyWord[]> = {};
      
      langVocab.forEach(w => {
        if (!categoriesGrouped[w.category]) {
          categoriesGrouped[w.category] = [];
        }
        categoriesGrouped[w.category].push(w);
      });

      Object.entries(categoriesGrouped).forEach(([catKey, words]) => {
        // Find dominant level for the category
        const levelsCount = { iniciante: 0, intermediario: 0, avancado: 0 };
        words.forEach(w => { if (levelsCount[w.level] !== undefined) levelsCount[w.level]++; });
        let dominantLevel: 'iniciante' | 'intermediario' | 'avancado' = 'iniciante';
        if (levelsCount.intermediario > levelsCount.iniciante && levelsCount.intermediario > levelsCount.avancado) {
          dominantLevel = 'intermediario';
        } else if (levelsCount.avancado > levelsCount.iniciante && levelsCount.avancado > levelsCount.intermediario) {
          dominantLevel = 'avancado';
        }

        islandsList.push({
          id: `static-cat-${catKey}`,
          name: categoryLabels[catKey] || catKey.charAt(0).toUpperCase() + catKey.slice(1),
          level: dominantLevel,
          category: catKey,
          words: words
        });
      });
    }

    // 3. Always append the "Minhas Palavras" (custom user vocabulary) island
    const langCustomWords = customWords.filter(w => w.id.startsWith(`custom-${targetLanguage}-`));
    islandsList.push({
      id: 'custom-words',
      name: 'Minhas Palavras',
      level: 'iniciante',
      category: 'geral',
      words: langCustomWords
    });

    return islandsList;
  }, [targetLanguage, customWords]);

  // Compute the currently active selected island data
  const currentIsland = useMemo(() => {
    if (!activeIslandId) return null;
    return vocabIslands.find(island => island.id === activeIslandId) || null;
  }, [activeIslandId, vocabIslands]);

  // Filtered words within the active island
  const filteredWords = useMemo(() => {
    if (!currentIsland) return [];
    return currentIsland.words.filter(w => {
      const matchesSearch = 
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.example && w.example.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = !onlyUnstudied || !studiedWordIds.includes(w.id);
      
      return matchesSearch && matchesFilter;
    });
  }, [currentIsland, searchQuery, onlyUnstudied, studiedWordIds]);

  // Global vocabulary stats across all active language islands
  const globalStats = useMemo(() => {
    let totalWords = 0;
    let totalStudied = 0;
    let inReviewCount = 0;

    vocabIslands.forEach(island => {
      totalWords += island.words.length;
      island.words.forEach(w => {
        if (studiedWordIds.includes(w.id)) {
          totalStudied++;
        }
        // Check if word exists in study reviews queue
        const cleanWord = w.word.trim().toLowerCase();
        const inSystem = phrases.some((p: Phrase) => p.text.toLowerCase() === cleanWord && p.language_id === targetLanguage);
        if (inSystem) {
          inReviewCount++;
        }
      });
    });

    const progressPercent = totalWords > 0 ? Math.round((totalStudied / totalWords) * 100) : 0;

    return {
      total: totalWords,
      studied: totalStudied,
      inReview: inReviewCount,
      progress: progressPercent
    };
  }, [vocabIslands, studiedWordIds, phrases, targetLanguage]);

  // Audio speech player
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

  // Add custom word logic
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
      exampleTranslation: newExampleTranslation.trim()
    };

    setCustomWords(prev => [createdWord, ...prev]);

    // Reset fields
    setNewWord('');
    setNewTranslation('');
    setNewExample('');
    setNewExampleTranslation('');
    setIsFormOpen(false);

    // If active island is custom words, it updates automatically
  };

  // Delete custom word logic
  const handleDeleteCustomWord = (wordId: string) => {
    if (confirm('Deseja excluir esta palavra personalizada?')) {
      setCustomWords(prev => prev.filter(w => w.id !== wordId));
      setStudiedWordIds(prev => prev.filter(id => id !== wordId));
    }
  };

  // Toggle studied checkbox
  const toggleStudied = (wordId: string) => {
    setStudiedWordIds(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId) 
        : [...prev, wordId]
    );
  };

  // Import card to SM2 Spaced Repetition queue
  const handleAddToReview = async (word: VocabularyWord) => {
    try {
      const cleanCategory = word.category || 'geral';
      const cleanLevel = word.level || 'iniciante';
      const cleanEx = word.example ? `*${word.example}*` : 'Nenhum exemplo cadastrado.';
      const cleanExTr = word.exampleTranslation ? `(${word.exampleTranslation})` : '';

      const explanationMarkdown = `📚 **Vocabulário:** ${word.word}\n📖 **Definição:** ${word.translation}\n🏷️ **Nível:** ${cleanLevel.toUpperCase()}\n📂 **Categoria:** ${cleanCategory.toUpperCase()}\n\n💡 **Contexto / Exemplo:**\n${cleanEx}\n${cleanExTr}`;
      
      await addCustomPhrase(
        word.word,
        word.translation,
        explanationMarkdown,
        cleanLevel === 'avancado' ? 'hard' : cleanLevel === 'intermediario' ? 'medium' : 'easy',
        'Fenrir',
        1.0,
        `shadowing-vocab-${targetLanguage}`
      );
      
      alert(`"${word.word}" foi adicionada com sucesso ao seu deck de revisões!`);
    } catch (err) {
      console.error(err);
      alert('Não foi possível importar a sentença.');
    }
  };

  // Check if a word is in study reviews
  const isWordInQueue = (wordText: string) => {
    const cleanWord = wordText.trim().toLowerCase();
    return phrases.some((p: Phrase) => p.text.toLowerCase() === cleanWord && p.language_id === targetLanguage);
  };

  // Toggle card reveal
  const toggleReveal = (wordId: string) => {
    setRevealedCardIds(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  // Return custom emojis per island
  const getIslandEmoji = (name: string, category: string) => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();
    if (n.includes('a1')) return '🌱';
    if (n.includes('a2')) return '🌿';
    if (n.includes('b1')) return '🌳';
    if (n.includes('b2')) return '🌲';
    if (n.includes('c1')) return '🏆';
    if (n.includes('presente')) return '🕒';
    if (c === 'adjetivos') return '🎨';
    if (c === 'adverbios') return '🚀';
    if (c === 'verbos') return '🏃';
    if (n.includes('minhas')) return '⭐';
    if (c === 'viagem') return '✈️';
    if (c === 'comida') return '🍔';
    if (c === 'trabalho') return '💼';
    if (c === 'sentimentos') return '❤️';
    if (c === 'dia_a_dia') return '📅';
    return '🏝️';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* 1. HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '10px', color: 'white', margin: 0 }}>
            📖 Construtor de Vocabulário
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Domine vocabulário e sentenças essenciais em <strong>{activeLang.flag_emoji} {activeLang.name}</strong>.
          </p>
        </div>
        
        {/* Toggle Form to Add Custom Word */}
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
          {isFormOpen ? 'Fechar Cadastro' : 'Nova Palavra'}
        </button>
      </div>

      {/* 2. FORM TO ADD CUSTOM WORD */}
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
                {Object.entries(categoryLabels).filter(([k]) => k !== 'adjetivos' && k !== 'adverbios' && k !== 'verbos' && k !== 'gramatica' && k !== 'geral').map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Example Sentence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FRASE DE EXEMPLO (OPCIONAL)</label>
              <textarea
                className="input-text"
                placeholder="Ex: This breakthrough changes everything."
                value={newExample}
                onChange={e => setNewExample(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.82rem', minHeight: '60px', resize: 'vertical' }}
              />
            </div>

            {/* Example Translation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TRADUÇÃO DO EXEMPLO</label>
              <textarea
                className="input-text"
                placeholder="Ex: Esta descoberta muda tudo."
                value={newExampleTranslation}
                onChange={e => setNewExampleTranslation(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.82rem', minHeight: '60px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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

      {/* 3. VIEW 1: CATALOG OF VOCABULARY ISLANDS */}
      {!activeIslandId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Global Progress Panel */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={14} style={{ color: '#eab308' }} /> Progresso Geral de Vocabulário
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{globalStats.progress}%</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ({globalStats.studied} de {globalStats.total} palavras dominadas • {globalStats.inReview} na fila de repetição)
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${globalStats.progress}%`, height: '100%', background: 'linear-gradient(to right, var(--accent), #10b981)', transition: 'width 0.4s' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '8px 0 0 0', color: 'white' }}>
            Ilhas de Vocabulário
          </h3>

          {/* Grid of Vocabulary Islands */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px' 
          }}>
            {vocabIslands.map((island) => {
              const totalWords = island.words.length;
              const studied = island.words.filter(w => studiedWordIds.includes(w.id)).length;
              const percent = totalWords > 0 ? Math.round((studied / totalWords) * 100) : 0;
              const emoji = getIslandEmoji(island.name, island.category);

              return (
                <div
                  key={island.id}
                  onClick={() => {
                    setActiveIslandId(island.id);
                    setSearchQuery('');
                    setOnlyUnstudied(false);
                    setRevealedCardIds({});
                  }}
                  className="glass-card planner-day-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>{emoji}</span>
                    <span style={{
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: island.level === 'avancado' ? 'rgba(239, 68, 68, 0.15)' : island.level === 'intermediario' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: island.level === 'avancado' ? '#ef4444' : island.level === 'intermediario' ? '#eab308' : '#3b82f6'
                    }}>
                      {island.level === 'avancado' ? 'C1/C2' : island.level === 'intermediario' ? 'B1/B2' : 'A1/A2'}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {island.name}
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {totalWords} sentenças cadastradas
                    </span>
                  </div>

                  {/* Progress info */}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <span>Progresso:</span>
                      <span style={{ fontWeight: 700, color: percent > 0 ? '#10b981' : 'white' }}>{percent}% ({studied}/{totalWords})</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? 'var(--success)' : 'var(--accent)', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* 4. VIEW 2: DETAILS OF SELECTED ISLAND */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Back Navigation & Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <button
              onClick={() => setActiveIslandId(null)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s'
              }}
            >
              <ArrowLeft size={14} /> Voltar para Ilhas
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {getIslandEmoji(currentIsland?.name || '', currentIsland?.category || '')}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'white', margin: 0 }}>
                {currentIsland?.name}
              </h3>
              <span style={{
                fontSize: '0.55rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                background: currentIsland?.level === 'avancado' ? 'rgba(239, 68, 68, 0.15)' : currentIsland?.level === 'intermediario' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: currentIsland?.level === 'avancado' ? '#ef4444' : currentIsland?.level === 'intermediario' ? '#eab308' : '#3b82f6'
              }}>
                {currentIsland?.level === 'avancado' ? 'C1/C2' : currentIsland?.level === 'intermediario' ? 'B1/B2' : 'A1/A2'}
              </span>
            </div>
          </div>

          {/* Island-specific Toolbar */}
          <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar nesta ilha..."
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

            {/* Filter checkbox: unstudied only */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlyUnstudied}
                onChange={e => setOnlyUnstudied(e.target.checked)}
              />
              <span>Ocultar estudadas</span>
            </label>

            {/* Progress summary for this island */}
            {currentIsland && (
              <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>
                  Concluído: <strong>{currentIsland.words.filter(w => studiedWordIds.includes(w.id)).length}</strong> de <strong>{currentIsland.words.length}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Word List within the Island */}
          {filteredWords.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1rem', color: 'white', margin: '0 0 4px 0' }}>Nenhuma palavra encontrada nesta ilha</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {onlyUnstudied ? 'Você já dominou todas as sentenças exibidas por esse filtro!' : 'Tente ajustar sua pesquisa.'}
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
                    {/* Header: Tags & Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-secondary)'
                        }}>
                          {categoryLabels[word.category] || currentIsland?.name}
                        </span>
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

                    {/* Word / Sentence Original */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.3, wordBreak: 'break-word', flex: 1 }}>
                          {word.word}
                        </h4>

                        {/* Speaker Pronunciation button */}
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
                            transition: 'all 0.2s',
                            flexShrink: 0
                          }}
                          title="Ouvir pronúncia"
                        >
                          <Volume2 size={14} className={playingWordId === word.id ? 'pulse-anim' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Translation Toggle Panel */}
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
                        <span className="fade-in" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textAlign: 'center', lineHeight: 1.3 }}>
                          {word.translation}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                          Clique para ver a tradução
                        </span>
                      )}
                    </div>

                    {/* Usage example sentence (if exists) */}
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

                    {/* Bottom Action Row: Checkbox Studied and SRS Import */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginTop: 'auto',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '10px'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', cursor: 'pointer', color: isStudied ? '#10b981' : 'var(--text-muted)' }}>
                        <input
                          type="checkbox"
                          checked={isStudied}
                          onChange={() => toggleStudied(word.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{isStudied ? 'Estudado' : 'Marcar visto'}</span>
                      </label>

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
      )}

    </div>
  );
};
