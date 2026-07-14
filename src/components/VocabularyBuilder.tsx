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
  ChevronRight,
  ChevronDown
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

interface Subgroup {
  id: string;
  circleLabel?: string;
  title: string;
  description: string;
  isStandalone?: boolean;
  sheetId?: string;
  islandIds?: string[];
}

interface GroupDefinition {
  id: string;
  name: string;
  dotColor: string;
  subgroups: Subgroup[];
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

  // Accordion collapsed state for subgroups (true means collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

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

  // Search and filter inside selected island
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUnstudied, setOnlyUnstudied] = useState(false);

  // Form states for adding custom words
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
      const langVocab = staticVocabulary[targetLanguage] || [];
      const categoriesGrouped: Record<string, VocabularyWord[]> = {};
      
      langVocab.forEach(w => {
        if (!categoriesGrouped[w.category]) {
          categoriesGrouped[w.category] = [];
        }
        categoriesGrouped[w.category].push(w);
      });

      Object.entries(categoriesGrouped).forEach(([catKey, words]) => {
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

    // Always append the "Minhas Palavras" (custom user vocabulary) island
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
            islandIds: ['nível_a1_-_parte_1', 'nível_a1_-_parte_2', 'nível_a1_-_parte_3', 'nível_a1_-_parte_4']
          },
          {
            id: 'a2',
            circleLabel: 'A2',
            title: 'A2',
            description: 'Vocabulário essencial para descrever seu ambiente imediato e necessidades pessoais rotineiras.',
            islandIds: ['nível_a2_-_parte_1', 'nível_a2_-_parte_2', 'nível_a2_-_parte_3', 'nível_a2_-_parte_4']
          },
          {
            id: 'conjugacoes',
            title: 'Conjugações Verbais Básicas',
            description: 'Presente - Passado - Futuro',
            isStandalone: true,
            sheetId: 'presente'
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
            islandIds: ['nível_b1_-_parte_1', 'nível_b1_-_parte_2', 'nível_b1_-_parte_3', 'nível_b1_-_parte_4']
          },
          {
            id: 'b2',
            circleLabel: 'B2',
            title: 'B2',
            description: 'Vocabulário versátil para participar de discussões complexas e expressar pontos de vista sobre diversos temas abstratos.',
            islandIds: ['nível_b2_-_parte_1', 'nível_b2_-_parte_2', 'nível_b2_-_parte_3']
          },
          {
            id: 'adjetivos',
            title: '300 Adjetivos Mais Comuns',
            description: 'Descritores essenciais para ajudar você a adicionar mais detalhes e variedade à sua linguagem cotidiana.',
            isStandalone: true,
            sheetId: 'adjetivos'
          },
          {
            id: 'adverbios',
            title: 'Os 300 Advérbios Mais Comuns',
            description: 'Modificadores-chave para expressar como, quando e onde as ações ocorrem.',
            isStandalone: true,
            sheetId: 'advérbios'
          },
          {
            id: 'verbos',
            title: 'Os 300 Verbos Mais Comuns',
            description: 'Palavras de ação essenciais para ajudar você a descrever atividades e estados de ser de forma clara.',
            isStandalone: true,
            sheetId: 'verbos'
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
            sheetId: 'c1'
          }
        ]
      }
    ];
  }, []);

  // Compute active selected island data
  const currentIsland = useMemo(() => {
    if (!activeIslandId) return null;
    return vocabIslands.find(island => island.id === activeIslandId) || null;
  }, [activeIslandId, vocabIslands]);

  // Filtered words within selected island
  const filteredWords = useMemo(() => {
    if (!currentIsland) return [];
    return currentIsland.words.filter(w => {
      const matchesSearch = 
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = !onlyUnstudied || !studiedWordIds.includes(w.id);
      
      return matchesSearch && matchesFilter;
    });
  }, [currentIsland, searchQuery, onlyUnstudied, studiedWordIds]);

  // Global vocabulary statistics
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

    setNewWord('');
    setNewTranslation('');
    setNewExample('');
    setNewExampleTranslation('');
    setIsFormOpen(false);
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

  // Toggle section accordion expansion
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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

  const isWordInQueue = (wordText: string) => {
    const cleanWord = wordText.trim().toLowerCase();
    return phrases.some((p: Phrase) => p.text.toLowerCase() === cleanWord && p.language_id === targetLanguage);
  };

  const toggleReveal = (wordId: string) => {
    setRevealedCardIds(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  // Render a single grid card for the catalog view (similar to screenshot layout)
  const renderIslandCard = (islandId: string) => {
    const island = vocabIslands.find(is => is.id === islandId);
    if (!island) return null;

    const total = island.words.length;
    const studied = island.words.filter(w => studiedWordIds.includes(w.id)).length;
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;

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
              {sheetDescriptions[island.id] || 'Explore sentenças e palavras deste nível.'}
            </p>
          </div>
          
          {/* Subtle micro-progress indicator */}
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

  // Render a full-width standalone horizontal card banner (matching present/adjective/verbs etc.)
  const renderStandaloneCard = (sheetId: string, title: string, desc: string, groupColor: string) => {
    const island = vocabIslands.find(is => is.id === sheetId);
    if (!island) return null;

    const total = island.words.length;
    const studied = island.words.filter(w => studiedWordIds.includes(w.id)).length;
    const percent = total > 0 ? Math.round((studied / total) * 100) : 0;

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

        {/* Small circle progress indicator on right side */}
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

      {/* 2. FORM TO ADD CUSTOM WORDS */}
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

      {/* 3. VIEW 1: LEVEL-GROUPED CATALOG ACCORDIONS */}
      {!activeIslandId ? (
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
          {customWords.filter(w => w.id.startsWith(`custom-${targetLanguage}-`)).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {renderStandaloneCard('custom-words', 'Vocabulário Personalizado', 'Explore e adicione seus próprios termos de estudo personalizados.', 'var(--accent)')}
            </div>
          )}

          {/* Rendering grouped structures when target language is English (spreadsheet view) */}
          {targetLanguage === 'en' ? (
            groups.map(group => (
              <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Level Category Indicator Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: group.dotColor }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'white', margin: 0 }}>
                    {group.name}
                  </h3>
                </div>

                {/* Render sub-accordions and standalone cards inside level */}
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
                      {/* Accordion header trigger */}
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
            /* Fallback generic layout for non-English target languages */
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
                {vocabIslands.filter(is => is.id !== 'custom-words').map(island => renderIslandCard(island.id))}
              </div>
            </div>
          )}

          {/* If customWords is empty, still offer standalone card to start typing custom words */}
          {customWords.filter(w => w.id.startsWith(`custom-${targetLanguage}-`)).length === 0 && (
            <div 
              onClick={() => {
                setActiveIslandId('custom-words');
                setIsFormOpen(true);
              }}
              className="glass-card planner-day-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                border: '1px dashed var(--border)',
                background: 'rgba(255, 255, 255, 0.01)',
                marginTop: '12px',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <Plus size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Comece a adicionar suas próprias palavras personalizadas
              </span>
            </div>
          )}

        </div>
      ) : (
        /* 4. VIEW 2: DETAILS OF SELECTED ISLAND - VERTICAL LIST OF SENTENCES */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Back Navigation Bar */}
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

          {/* Island Search and Filter toolbar */}
          <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar sentenças nesta ilha..."
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

            {/* Filter check: unstudied only */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlyUnstudied}
                onChange={e => setOnlyUnstudied(e.target.checked)}
              />
              <span>Ocultar estudadas</span>
            </label>

            {/* Island study progress count */}
            {currentIsland && (
              <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>
                  Concluído: <strong>{currentIsland.words.filter(w => studiedWordIds.includes(w.id)).length}</strong> de <strong>{currentIsland.words.length}</strong>
                </span>
              </div>
            )}
          </div>

          {/* List of Sentences (One below another) */}
          {filteredWords.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1rem', color: 'white', margin: '0 0 4px 0' }}>Nenhuma sentença encontrada</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {onlyUnstudied ? 'Você já marcou todas as sentenças desta ilha como vistas!' : 'Tente ajustar sua pesquisa.'}
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              {filteredWords.map((word) => {
                const isCustom = word.id.startsWith('custom-');
                const isStudied = studiedWordIds.includes(word.id);
                const inReview = isWordInQueue(word.word);
                const isRevealed = revealedCardIds[word.id] || false;

                return (
                  <div
                    key={word.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isStudied ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                      border: isStudied ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      gap: '14px',
                      transition: 'all 0.15s',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Left: audio and sentence text */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                      {/* Audio speaker trigger */}
                      <button
                        type="button"
                        onClick={() => speakWord(word.word, word.id)}
                        style={{
                          background: playingWordId === word.id ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                          color: playingWordId === word.id ? 'white' : 'var(--text-secondary)',
                          border: 'none',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s'
                        }}
                      >
                        <Volume2 size={15} className={playingWordId === word.id ? 'pulse-anim' : ''} />
                      </button>

                      {/* Text & Reveal trigger */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {word.word}
                        </h4>
                        
                        {/* Reveal Translation area */}
                        <div 
                          onClick={() => toggleReveal(word.id)}
                          style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '2px' }}
                        >
                          {isRevealed ? (
                            <span className="fade-in" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>
                              {word.translation}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px dotted var(--text-muted)' }}>
                              Clique para revelar tradução
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      {/* Checkbox Studied */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', cursor: 'pointer', color: isStudied ? '#10b981' : 'var(--text-muted)' }}>
                        <input
                          type="checkbox"
                          checked={isStudied}
                          onChange={() => toggleStudied(word.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{isStudied ? 'Visto' : 'Marcar visto'}</span>
                      </label>

                      {/* Spaced repetition queue indicator */}
                      {inReview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.72rem', fontWeight: 600 }}>
                          <CheckCircle2 size={13} />
                          <span>Na Revisão</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToReview(word)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Plus size={12} /> Importar
                        </button>
                      )}

                      {/* Delete Custom Word button */}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                          }}
                          title="Excluir palavra"
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
      )}

    </div>
  );
};
