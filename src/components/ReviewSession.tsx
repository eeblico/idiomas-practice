import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp, Phrase } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { 
  Volume2, Star, ArrowLeft, RefreshCw, CheckCircle, 
  Clock, BookOpen, Sparkles, Sliders, Settings, AlertCircle, Plus, Edit2,
  Languages, HelpCircle, Info, Shuffle, Eye, EyeOff, ChevronDown, ChevronUp,
  Search, Grid, Tag, Award, Archive, ShieldAlert, BarChart2, Check, X, HelpCircle as HelpIcon
} from 'lucide-react';

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];

interface TelemetryRecord {
  phraseId: string;
  categoryId: string;
  timestamp: number;
  timeSpentSeconds: number;
  isCorrect: boolean;
  text: string;
}

const getLanguageName = (langId: string): string => {
  const map: Record<string, string> = {
    en: 'Inglês',
    es: 'Espanhol',
    fr: 'Francês',
    it: 'Italiano',
    de: 'Alemão',
    zh: 'Mandarim',
    ru: 'Russo'
  };
  return map[langId] || langId;
};

const formatInterval = (days: number): string => {
  if (days === 1) return '1 dia';
  return `${days} dias`;
};

// Telemetry Helpers
const getTelemetry = (): TelemetryRecord[] => {
  try {
    const stored = localStorage.getItem('hl_review_telemetry');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addTelemetryRecord = (record: TelemetryRecord) => {
  try {
    const current = getTelemetry();
    const next = [...current, record].slice(-300); // Keep last 300 records
    localStorage.setItem('hl_review_telemetry', JSON.stringify(next));
  } catch (e) {
    console.error(e);
  }
};

export const ReviewSession: React.FC = () => {
  const {
    phrases,
    favorites,
    toggleFavorite,
    submitPracticeResult,
    markPhraseAsSeen,
    setActiveTab,
    reviewAlgorithm,
    setReviewAlgorithm,
    reviewItems,
    user,
    categories,
    updatePhrase,
    targetLanguage,
    phraseStars,
    updatePhraseStars,
    archivedPhrases,
    suspendedPhrases,
    toggleArchivePhrase,
    toggleSuspendPhrase,
    updatePhraseTags
  } = useApp();

  // Navigation & Layout
  const [activeSubTab, setActiveSubTab] = useState<'practice' | 'library'>('practice');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'due' | 'new' | 'all' | 'starred'>('due');
  const [showInsights, setShowInsights] = useState(true);

  // Configuration and Filters
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('all');
  const [newCardsLimit, setNewCardsLimit] = useState<number>(10);
  const [starsFilter, setStarsFilter] = useState<string>('all');
  const [shuffleQueue, setShuffleQueue] = useState<boolean>(true);
  const [showAlgorithmHelp, setShowAlgorithmHelp] = useState<boolean>(false);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);

  // Library tab filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('text');
  const [selectedGrouping, setSelectedGrouping] = useState<'none' | 'collection' | 'category' | 'level' | 'tags'>('none');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Study Modes / Games selection
  const [reviewMode, setReviewMode] = useState<'flashcard' | 'cloze' | 'scramble' | 'listening' | 'writing'>('flashcard');

  // Telemetry references
  const cardStartTimeRef = useRef<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [telemetryStateTrigger, setTelemetryStateTrigger] = useState<number>(0);

  // Interactive Games form inputs
  const [clozeInput, setClozeInput] = useState<string>('');
  const [clozeTarget, setClozeTarget] = useState<string>('');
  const [clozeSentence, setClozeSentence] = useState<string>('');
  const [clozeResult, setClozeResult] = useState<'correct' | 'incorrect' | null>(null);

  const [scrambleWords, setScrambleWords] = useState<string[]>([]);
  const [scrambleSelected, setScrambleSelected] = useState<string[]>([]);
  const [scrambleResult, setScrambleResult] = useState<'correct' | 'incorrect' | null>(null);

  const [listeningInput, setListeningInput] = useState<string>('');
  const [listeningResult, setListeningResult] = useState<'correct' | 'incorrect' | null>(null);
  const [revealTranslationClue, setRevealTranslationClue] = useState<boolean>(false);

  const [writingInput, setWritingInput] = useState<string>('');
  const [writingResult, setWritingResult] = useState<'correct' | 'incorrect' | null>(null);

  // Edit card modal inside study session
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editCardText, setEditCardText] = useState('');
  const [editCardTranslation, setEditCardTranslation] = useState('');
  const [editCardExplanation, setEditCardExplanation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Active study session queue
  const [sessionQueue, setSessionQueue] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lapsedPhrasesSet, setLapsedPhrasesSet] = useState<Set<string>>(new Set());
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);
  
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);
  const [initialQueueLength, setInitialQueueLength] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const nowTime = useMemo(() => new Date().getTime(), [sessionActive]);

  // Clean tag input helper
  const [editingPhraseTagsId, setEditingPhraseTagsId] = useState<string | null>(null);
  const [phraseTagsInput, setPhraseTagsInput] = useState<string>('');

  // General filtered list for review selection
  const filteredPhrasesForReview = useMemo(() => {
    let list = phrases.filter(p => p.language_id === targetLanguage);
    if (reviewCategoryFilter !== 'all') {
      list = list.filter(p => p.category_id === reviewCategoryFilter);
    }
    if (starsFilter !== 'all') {
      if (starsFilter === 'starred') {
        list = list.filter(p => (phraseStars[p.id] || 0) > 0);
      } else {
        const starVal = Number(starsFilter);
        list = list.filter(p => (phraseStars[p.id] || 0) === starVal);
      }
    }
    return list;
  }, [phrases, targetLanguage, reviewCategoryFilter, starsFilter, phraseStars]);

  // Library filtered phrases list
  const filteredPhrasesForLibrary = useMemo(() => {
    let list = phrases.filter(p => p.language_id === targetLanguage);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.text.toLowerCase().includes(q) ||
        p.translation.toLowerCase().includes(q) ||
        (p.explanation && p.explanation.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (reviewCategoryFilter !== 'all') {
      list = list.filter(p => p.category_id === reviewCategoryFilter);
    }

    if (starsFilter !== 'all') {
      if (starsFilter === 'starred') {
        list = list.filter(p => (phraseStars[p.id] || 0) > 0);
      } else {
        const starVal = Number(starsFilter);
        list = list.filter(p => (phraseStars[p.id] || 0) === starVal);
      }
    }

    if (statusFilter === 'favorites') {
      list = list.filter(p => favorites.includes(p.id));
    } else if (statusFilter === 'archived') {
      list = list.filter(p => archivedPhrases.includes(p.id));
    } else if (statusFilter === 'suspended') {
      list = list.filter(p => suspendedPhrases.includes(p.id));
    } else {
      list = list.filter(p => !archivedPhrases.includes(p.id) && !suspendedPhrases.includes(p.id));
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'text') {
        return a.text.localeCompare(b.text);
      }
      if (sortBy === 'difficulty') {
        const diffWeight = { hard: 3, medium: 2, easy: 1 };
        const aDiff = diffWeight[(reviewItems[a.id]?.difficulty || 'medium') as 'easy' | 'medium' | 'hard'];
        const bDiff = diffWeight[(reviewItems[b.id]?.difficulty || 'medium') as 'easy' | 'medium' | 'hard'];
        return bDiff - aDiff;
      }
      if (sortBy === 'next_review') {
        const aTime = reviewItems[a.id] ? new Date(reviewItems[a.id].next_review_date).getTime() : 9999999999999;
        const bTime = reviewItems[b.id] ? new Date(reviewItems[b.id].next_review_date).getTime() : 9999999999999;
        return aTime - bTime;
      }
      if (sortBy === 'stars') {
        const aStars = phraseStars[a.id] || 0;
        const bStars = phraseStars[b.id] || 0;
        return bStars - aStars;
      }
      return a.id.localeCompare(b.id);
    });

    return list;
  }, [phrases, targetLanguage, searchQuery, reviewCategoryFilter, starsFilter, statusFilter, sortBy, favorites, archivedPhrases, suspendedPhrases, phraseStars, reviewItems]);

  // Dashboard calculations
  const stats = useMemo(() => {
    const due = filteredPhrasesForReview.filter(p => {
      const item = reviewItems[p.id];
      return item && new Date(item.next_review_date).getTime() <= nowTime && !archivedPhrases.includes(p.id) && !suspendedPhrases.includes(p.id);
    });

    const newCards = filteredPhrasesForReview.filter(p => !reviewItems[p.id] && !archivedPhrases.includes(p.id) && !suspendedPhrases.includes(p.id));

    const learned = filteredPhrasesForReview.filter(p => {
      const item = reviewItems[p.id];
      return item && new Date(item.next_review_date).getTime() > nowTime && !archivedPhrases.includes(p.id) && !suspendedPhrases.includes(p.id);
    });

    const starred = filteredPhrasesForReview.filter(p => (phraseStars[p.id] || 0) > 0 && !archivedPhrases.includes(p.id) && !suspendedPhrases.includes(p.id));

    return {
      dueCount: due.length,
      newCount: newCards.length,
      learnedCount: learned.length,
      starredCount: starred.length,
      duePhrases: due,
      newPhrases: newCards,
      starredPhrases: starred
    };
  }, [filteredPhrasesForReview, reviewItems, nowTime, phraseStars, archivedPhrases, suspendedPhrases]);

  // Telemetry Memos for Insights Sidebar
  const insights = useMemo(() => {
    const records = getTelemetry();
    if (records.length === 0) {
      return {
        avgTime: '0.0s',
        retention: 100,
        weakSpots: [],
        vocab: [],
        recommendation: 'Sem registros de telemetria ainda. Inicie sua primeira sessão de estudos!'
      };
    }

    const totalSeconds = records.reduce((sum, r) => sum + r.timeSpentSeconds, 0);
    const avgTime = (totalSeconds / records.length).toFixed(1) + 's';

    const correct = records.filter(r => r.isCorrect).length;
    const retention = Math.round((correct / records.length) * 100);

    // Find weak spots by category
    const catMap: Record<string, { total: number; failed: number }> = {};
    records.forEach(r => {
      if (!catMap[r.categoryId]) catMap[r.categoryId] = { total: 0, failed: 0 };
      catMap[r.categoryId].total += 1;
      if (!r.isCorrect) catMap[r.categoryId].failed += 1;
    });

    const weakSpots = Object.entries(catMap)
      .map(([catId, statistics]) => {
        const catName = categories.find(c => c.id === catId)?.name || 'Outro';
        const failRate = Math.round((statistics.failed / statistics.total) * 100);
        return { catName, failRate };
      })
      .filter(w => w.failRate > 0)
      .sort((a, b) => b.failRate - a.failRate)
      .slice(0, 3);

    // Hardest single words
    const wordCounts: Record<string, number> = {};
    records.filter(r => !r.isCorrect).forEach(r => {
      const words = r.text.toLowerCase().split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"")).filter(w => w.length > 3);
      words.forEach(w => {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      });
    });

    const vocab = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Recommendation logic
    let recommendation = 'Seu rendimento está excelente! Continue revisando os cards agendados diariamente.';
    if (retention < 80) {
      recommendation = 'Alta taxa de esquecimento detectada. Recomendamos usar o algoritmo Fibonacci e praticar lotes menores.';
    } else if (weakSpots.length > 0) {
      recommendation = `Sua maior taxa de erro está na ilha "${weakSpots[0].catName}". Dedique sua próxima sessão a esta categoria.`;
    }

    return { avgTime, retention, weakSpots, vocab, recommendation };
  }, [telemetryStateTrigger, categories]);

  // Audio Playback Helpers
  const getAudioUrl = (phrase: Phrase): string | null => {
    if (!phrase.audio_url) return null;
    if (phrase.audio_url.startsWith('http')) return phrase.audio_url;
    const { data } = supabase.storage.from('phrase-audios').getPublicUrl(phrase.audio_url);
    return data.publicUrl;
  };

  const playPhraseAudio = (phrase: Phrase) => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }

    const url = getAudioUrl(phrase);
    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;
      if ('preservesPitch' in audio) audio.preservesPitch = true;
      
      const speed = phrase.speed || 1.0;
      audio.defaultPlaybackRate = speed;
      audio.playbackRate = speed;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        speakFallback(phrase.text, phrase.language_id);
      };
      
      audio.play().then(() => {
        audio.playbackRate = speed;
      }).catch(() => {
        setIsPlaying(false);
        speakFallback(phrase.text, phrase.language_id);
      });
    } else {
      speakFallback(phrase.text, phrase.language_id);
    }
  };

  const speakFallback = (text: string, langCode: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;
      
      const langMapping: Record<string, string> = {
        en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', de: 'de-DE', zh: 'zh-CN', ru: 'ru-RU'
      };
      utterance.lang = langMapping[langCode] || langCode;
      utterance.rate = currentPhrase?.speed || 1.0;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        activeUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        activeUtteranceRef.current = null;
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn(e);
      activeUtteranceRef.current = null;
    }
  };

  // Play audio on card shift
  const currentPhrase = sessionQueue[currentIndex];
  useEffect(() => {
    if (currentPhrase && sessionActive && !completed && !isEditingCard) {
      const timer = setTimeout(() => {
        playPhraseAudio(currentPhrase);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPhrase?.id, sessionActive, completed, isEditingCard]);

  // Card elapsed timer logic
  useEffect(() => {
    if (!sessionActive || completed || isEditingCard) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, completed, isEditingCard, currentIndex]);

  // Cloze Sentence generator helper
  const getClozeSentence = (text: string) => {
    const words = text.split(/\s+/);
    let cleanWords = words.map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,""));
    let targetWordIndex = 0;
    let longestLength = 0;
    for (let i = 0; i < cleanWords.length; i++) {
      if (cleanWords[i].length > longestLength && cleanWords[i].length > 3) {
        longestLength = cleanWords[i].length;
        targetWordIndex = i;
      }
    }
    const targetWord = cleanWords[targetWordIndex];
    const clozeText = words.map((w, idx) => idx === targetWordIndex ? '_____' : w).join(' ');
    return { clozeText, targetWord };
  };

  // Set up game mode states on card swap
  useEffect(() => {
    if (!currentPhrase) return;
    cardStartTimeRef.current = Date.now();
    setSecondsElapsed(0);
    setRevealTranslationClue(false);

    // Cloze Game Init
    const cloze = getClozeSentence(currentPhrase.text);
    setClozeSentence(cloze.clozeText);
    setClozeTarget(cloze.targetWord);
    setClozeInput('');
    setClozeResult(null);

    // Scramble Game Init
    const cleanWords = currentPhrase.text.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"")).filter(Boolean);
    const shuffled = [...cleanWords].sort(() => 0.5 - Math.random());
    setScrambleWords(shuffled);
    setScrambleSelected([]);
    setScrambleResult(null);

    // Listening Game Init
    setListeningInput('');
    setListeningResult(null);

    // Writing Game Init
    setWritingInput('');
    setWritingResult(null);
  }, [currentIndex, currentPhrase?.id, reviewMode]);

  // Game validation handlers
  const handleVerifyCloze = (e?: React.FormEvent) => {
    e?.preventDefault();
    const isCorrect = clozeInput.trim().toLowerCase() === clozeTarget.toLowerCase();
    setClozeResult(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    playPhraseAudio(currentPhrase);
  };

  const handleVerifyScramble = () => {
    const cleanText = currentPhrase.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase().replace(/\s+/g, ' ').trim();
    const typedText = scrambleSelected.join(' ').toLowerCase().trim();
    const isCorrect = cleanText === typedText;
    setScrambleResult(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    playPhraseAudio(currentPhrase);
  };

  const handleVerifyListening = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanOriginal = currentPhrase.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase().replace(/\s+/g, ' ').trim();
    const cleanTyped = listeningInput.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase().replace(/\s+/g, ' ').trim();
    const isCorrect = cleanOriginal === cleanTyped;
    setListeningResult(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    playPhraseAudio(currentPhrase);
  };

  const handleVerifyWriting = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanOriginal = currentPhrase.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase().replace(/\s+/g, ' ').trim();
    const cleanTyped = writingInput.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase().replace(/\s+/g, ' ').trim();
    const isCorrect = cleanOriginal === cleanTyped;
    setWritingResult(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    playPhraseAudio(currentPhrase);
  };

  const handleStartSession = (type: 'due' | 'new' | 'all' | 'starred') => {
    let list: Phrase[] = [];
    setSessionType(type);

    if (type === 'due') {
      list = [...stats.duePhrases];
    } else if (type === 'new') {
      list = stats.newPhrases.slice(0, newCardsLimit);
    } else if (type === 'starred') {
      list = [...stats.starredPhrases];
    } else {
      list = filteredPhrasesForReview.filter(p => reviewItems[p.id]);
    }

    // Filter out archived/suspended
    list = list.filter(p => !archivedPhrases.includes(p.id) && !suspendedPhrases.includes(p.id));

    if (list.length === 0) return;

    const finalQueue = shuffleQueue ? [...list].sort(() => 0.5 - Math.random()) : [...list];
    setSessionQueue(finalQueue);
    setInitialQueueLength(finalQueue.length);
    setCurrentIndex(0);
    setRevealed(false);
    setCompleted(false);
    setSessionActive(true);
    setLapsedPhrasesSet(new Set());
    setCardsReviewedCount(0);
    cardStartTimeRef.current = Date.now();
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  // Submit response & handle queue progression
  const handleRateDifficulty = async (rating: 'easy' | 'medium' | 'hard') => {
    if (!currentPhrase) return;
    const isLapsed = lapsedPhrasesSet.has(currentPhrase.id);

    if (!isLapsed) {
      await submitPracticeResult(currentPhrase.id, rating);
    }

    // Telemetry log
    const timeSpent = Math.max(1, Math.round((Date.now() - cardStartTimeRef.current) / 1000));
    addTelemetryRecord({
      phraseId: currentPhrase.id,
      categoryId: currentPhrase.category_id,
      timestamp: Date.now(),
      timeSpentSeconds: timeSpent,
      isCorrect: rating !== 'hard',
      text: currentPhrase.text
    });
    setTelemetryStateTrigger(prev => prev + 1);

    setCardsReviewedCount(prev => prev + 1);

    if (rating === 'hard') {
      setLapsedPhrasesSet(prev => {
        const next = new Set(prev);
        next.add(currentPhrase.id);
        return next;
      });

      setSessionQueue(prev => {
        const next = [...prev];
        next.push(currentPhrase);
        return next;
      });

      setSessionFeedback('Frase recolocada no fim da fila para reforço.');
      setTimeout(() => setSessionFeedback(null), 3000);

      setRevealed(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      if (currentIndex + 1 < sessionQueue.length) {
        setRevealed(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }
  };

  const handleBackToDashboard = () => {
    setSessionActive(false);
    setCompleted(false);
  };

  // Pre-calculate next intervals
  const getNextIntervalDays = (phraseId: string, rating: 'easy' | 'medium' | 'hard'): number => {
    const item = reviewItems[phraseId];
    if (reviewAlgorithm === 'fibonacci') {
      const stage = item ? item.repetitions : 0;
      let nextStage = stage;
      if (rating === 'easy') {
        nextStage = Math.min(FIBONACCI_SEQUENCE.length - 1, stage + 2);
      } else if (rating === 'medium') {
        nextStage = Math.min(FIBONACCI_SEQUENCE.length - 1, stage + 1);
      } else {
        nextStage = Math.max(0, stage - 2);
      }
      return FIBONACCI_SEQUENCE[nextStage];
    } else {
      const reps = item ? item.repetitions : 0;
      const interval = item ? item.interval_days : 0;
      const ef = item ? parseFloat(item.ease_factor) : 2.5;

      if (rating === 'hard') return 1;

      let nextInterval = interval;
      let nextReps = reps;

      if (nextReps === 0) {
        nextInterval = 1;
      } else if (nextReps === 1) {
        nextInterval = 6;
      } else {
        const q = rating === 'easy' ? 5 : 3;
        const nextEf = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        nextInterval = Math.round(interval * Math.max(1.3, nextEf));
      }
      return nextInterval;
    }
  };

  const handleStartEditCard = (phrase: Phrase) => {
    setEditCardText(phrase.text);
    setEditCardTranslation(phrase.translation);
    setEditCardExplanation(phrase.explanation || '');
    setIsEditingCard(true);
  };

  const handleSaveCardEdit = async () => {
    if (!currentPhrase) return;
    await updatePhrase(currentPhrase.id, {
      text: editCardText,
      translation: editCardTranslation,
      explanation: editCardExplanation
    });
    setIsEditingCard(false);
  };

  const handleAutoTranslateText = async (text: string, callback: (translated: string) => void) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const sourceLang = targetLanguage;
      const targetLang = 'pt';
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        callback(data.responseData.translatedText);
      } else {
        alert("Não foi possível obter uma sugestão de tradução automática.");
      }
    } catch (error) {
      console.error("Auto translation failed:", error);
      alert("Erro ao conectar com o serviço de tradução.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Helper diff text render for listening & writing modes
  const getDiffText = (typed: string, original: string) => {
    const tWords = typed.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").trim().split(/\s+/);
    const oWordsRaw = original.trim().split(/\s+/);
    
    return oWordsRaw.map((word, idx) => {
      const cleanOriginalWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase();
      const cleanTypedWord = tWords[idx] || '';
      const isMatch = cleanOriginalWord === cleanTypedWord;
      
      return (
        <span key={idx} style={{ 
          color: isMatch ? 'var(--success)' : '#ef4444', 
          textDecoration: isMatch ? 'none' : 'line-through',
          marginRight: '6px',
          fontWeight: 700
        }}>
          {word}
        </span>
      );
    });
  };

  // Toggle Tags form
  const handleOpenTagEditor = (phraseId: string, currentTags: string[] = []) => {
    setEditingPhraseTagsId(phraseId);
    setPhraseTagsInput(currentTags.join(', '));
  };

  const handleSaveTags = (phraseId: string) => {
    const tags = phraseTagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    updatePhraseTags(phraseId, tags);
    setEditingPhraseTagsId(null);
  };

  // --- Active Review Session View ---
  if (sessionActive) {
    if (completed || sessionQueue.length === 0) {
      return (
        <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.25))' }} />
          
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Sessão Concluída! 🎉</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem', maxWidth: '450px', lineHeight: 1.5 }}>
              Excelente! Você praticou as frases selecionadas no modo <strong>{reviewMode === 'cloze' ? 'Completar Lacunas' : reviewMode === 'scramble' ? 'Ordenar Palavras' : reviewMode === 'listening' ? 'Ditado' : reviewMode === 'writing' ? 'Digitação' : 'Flashcard'}</strong>.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px 32px', width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{cardsReviewedCount}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cards Revisados</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                {Math.max(0, initialQueueLength - lapsedPhrasesSet.size)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sem Erros</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleBackToDashboard} style={{ padding: '12px 28px', borderRadius: '30px' }}>
            Voltar ao Painel de Revisão
          </button>
        </div>
      );
    }

    const isLapsedCard = currentPhrase ? lapsedPhrasesSet.has(currentPhrase.id) : false;

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Session Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={handleBackToDashboard} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Parar Sessão</span>
          </button>
          
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>⏱️ {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}</span>
            <span>({currentIndex + 1}/{sessionQueue.length})</span>
          </span>
        </div>

        {/* Practice card container */}
        <div className="card-practice-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Progress bar */}
          <div className="progress-dots" style={{ gap: '4px', height: '4px' }}>
            {sessionQueue.map((_, idx) => (
              <span
                key={idx}
                className={`progress-dot ${idx < currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}`}
                style={{ flex: 1, borderRadius: '2px', height: '100%' }}
              />
            ))}
          </div>

          {/* Toast feedback */}
          {sessionFeedback && (
            <div className="scale-in" style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              width: '100%'
            }}>
              <AlertCircle size={14} /> {sessionFeedback}
            </div>
          )}

          {/* Flashcard */}
          <div 
            className="flashcard"
            style={{ position: 'relative', flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {/* Top Indicators inside card */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '6px', zIndex: 10, alignItems: 'center' }}>
              {/* Mastery Indicator (Stars) */}
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '10px' }} title="Nível de Domínio">
                <Star size={12} fill="#eab308" stroke="#eab308" />
                <span style={{ fontSize: '0.7rem', color: '#eab308', fontWeight: 800 }}>{phraseStars[currentPhrase.id] || 0}</span>
              </div>

              {/* Interval Indicator */}
              {reviewItems[currentPhrase.id] && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.68rem', color: 'var(--text-secondary)' }} title="Data de Revisão">
                  📅 {formatInterval(reviewItems[currentPhrase.id].interval_days)}
                </div>
              )}
            </div>

            {/* Action Bar inside card */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
              {isLapsedCard && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🔁 Reforço
                </span>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEditCard(currentPhrase);
                }} 
                className="btn-icon"
                style={{ width: '36px', height: '36px' }}
                title="Editar conteúdo da frase"
              >
                <Edit2 size={15} />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentPhrase.id);
                }} 
                className={`btn-icon ${favorites.includes(currentPhrase.id) ? 'active' : ''}`}
                style={{ width: '36px', height: '36px' }}
              >
                <Star size={18} fill={favorites.includes(currentPhrase.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {isEditingCard ? (
              <div 
                className="fade-in" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  padding: '16px',
                  textAlign: 'left',
                  justifyContent: 'center'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>
                  ✏️ Ajustar Conteúdo do Card
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Texto Original</label>
                  <input 
                    type="text" 
                    className="input-text" 
                    value={editCardText} 
                    onChange={(e) => setEditCardText(e.target.value)} 
                    style={{ width: '100%', fontSize: '0.82rem', padding: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Tradução</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      className="input-text" 
                      value={editCardTranslation} 
                      onChange={(e) => setEditCardTranslation(e.target.value)} 
                      style={{ flex: 1, fontSize: '0.82rem', padding: '6px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoTranslateText(editCardText, setEditCardTranslation)}
                      className="settings-btn"
                      disabled={isTranslating}
                      style={{
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '32px',
                      }}
                      title="Sugerir tradução automática"
                    >
                      {isTranslating ? (
                        <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid var(--text-secondary)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Languages size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Explicação / Detalhes</label>
                  <textarea 
                    className="input-text" 
                    value={editCardExplanation} 
                    onChange={(e) => setEditCardExplanation(e.target.value)} 
                    style={{ width: '100%', minHeight: '50px', fontSize: '0.78rem', padding: '6px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsEditingCard(false)}
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSaveCardEdit}
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', background: 'var(--accent)' }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* --- Mode A: Flashcard --- */}
                {reviewMode === 'flashcard' && (
                  revealed ? (
                    <div className="fade-in" style={{ width: '100%', textAlign: 'center' }}>
                      <div className="flashcard-target">
                        <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{currentPhrase.text}</span>
                        <div className="audio-waves-container" onClick={() => playPhraseAudio(currentPhrase)} style={{ cursor: 'pointer', marginTop: '12px' }}>
                          <Volume2 size={20} style={{ color: isPlaying ? 'var(--accent)' : 'var(--text-secondary)' }} />
                          <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                          <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                          <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                          <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                        </div>
                      </div>
                      <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {currentPhrase.translation}
                      </div>
                    </div>
                  ) : (
                    <div className="fade-in" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleReveal}>
                      <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {currentPhrase.translation}
                      </div>
                      <div className="reveal-overlay">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', margin: '0 auto 10px', animation: 'float 2s ease-in-out infinite' }}>
                          <Volume2 size={24} />
                        </div>
                        <span className="reveal-text">Toque para revelar a frase em {getLanguageName(currentPhrase.language_id)}</span>
                      </div>
                    </div>
                  )
                )}

                {/* --- Mode B: Cloze (Completar Lacunas) --- */}
                {reviewMode === 'cloze' && (
                  <div className="fade-in" style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Completar Lacuna:</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '0.02em' }}>
                      {clozeSentence}
                    </div>

                    {!revealed ? (
                      <form onSubmit={handleVerifyCloze} style={{ display: 'flex', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
                        <input
                          type="text"
                          className="input-text"
                          placeholder="Digite a palavra que falta..."
                          value={clozeInput}
                          onChange={(e) => setClozeInput(e.target.value)}
                          autoFocus
                          style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Confirmar</button>
                      </form>
                    ) : (
                      <div className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '10px 0' }}>
                          {clozeResult === 'correct' ? (
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <Check size={14} /> Correto!
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <X size={14} /> Incorreto (Esperado: "{clozeTarget}")
                            </span>
                          )}
                        </div>
                        <div className="flashcard-target">
                          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{currentPhrase.text}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          {currentPhrase.translation}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- Mode C: Scramble (Ordenar Palavras) --- */}
                {reviewMode === 'scramble' && (
                  <div className="fade-in" style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Clique nas palavras para ordenar:</div>
                    
                    {/* Active slot */}
                    <div style={{ minHeight: '44px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                      {scrambleSelected.map((word, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => {
                            if (revealed) return;
                            setScrambleSelected(prev => prev.filter((_, i) => i !== idx));
                          }}
                          style={{ background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: '4px', cursor: revealed ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>

                    {/* Word pool */}
                    {!revealed && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                        {scrambleWords.map((word, idx) => {
                          const countSelected = scrambleSelected.filter(w => w === word).length;
                          const countTotal = scrambleWords.filter(w => w === word).length;
                          const isUsed = countSelected >= countTotal;
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isUsed}
                              onClick={() => setScrambleSelected(prev => [...prev, word])}
                              style={{ 
                                background: isUsed ? 'rgba(255,255,255,0.02)' : 'var(--bg-tertiary)', 
                                border: '1px solid var(--border)', 
                                color: isUsed ? 'var(--text-muted)' : 'white',
                                padding: '6px 12px', 
                                borderRadius: '4px', 
                                cursor: isUsed ? 'not-allowed' : 'pointer', 
                                fontWeight: 600,
                                fontSize: '0.8rem'
                              }}
                            >
                              {word}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!revealed ? (
                      <button 
                        type="button" 
                        disabled={scrambleSelected.length === 0}
                        onClick={handleVerifyScramble} 
                        className="btn btn-primary" 
                        style={{ padding: '8px 24px', margin: '0 auto', display: 'block' }}
                      >
                        Confirmar Ordem
                      </button>
                    ) : (
                      <div className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '10px 0' }}>
                          {scrambleResult === 'correct' ? (
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <Check size={14} /> Correto!
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <X size={14} /> Incorreto
                            </span>
                          )}
                        </div>
                        <div className="flashcard-target">
                          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{currentPhrase.text}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          {currentPhrase.translation}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- Mode D: Ditado (Listening) --- */}
                {reviewMode === 'listening' && (
                  <div className="fade-in" style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Ditado (Escute o áudio e digite):</div>
                    
                    <button 
                      type="button" 
                      onClick={() => playPhraseAudio(currentPhrase)}
                      className="btn-icon active hover-scale"
                      style={{ width: '54px', height: '54px', borderRadius: '50%', margin: '0 auto 16px', background: 'var(--accent)', color: 'white' }}
                      title="Ouvir áudio"
                    >
                      <Volume2 size={24} />
                    </button>

                    {/* Optional translation clue */}
                    {revealTranslationClue ? (
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', maxWidth: '360px', margin: '0 auto 16px' }}>
                        💡 Clue: "{currentPhrase.translation}"
                      </div>
                    ) : (
                      !revealed && (
                        <button 
                          type="button" 
                          onClick={() => setRevealTranslationClue(true)} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', textDecoration: 'underline', cursor: 'pointer', marginBottom: '16px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                        >
                          Ver dica de tradução
                        </button>
                      )
                    )}

                    {!revealed ? (
                      <form onSubmit={handleVerifyListening} style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
                        <input
                          type="text"
                          className="input-text"
                          placeholder="Digite o que você ouviu..."
                          value={listeningInput}
                          onChange={(e) => setListeningInput(e.target.value)}
                          autoFocus
                          style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Confirmar</button>
                      </form>
                    ) : (
                      <div className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '10px 0' }}>
                          {listeningResult === 'correct' ? (
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <Check size={14} /> Escrita Correta!
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <X size={14} /> Erros de Escrita
                            </span>
                          )}
                        </div>

                        {/* Diff Render */}
                        {listeningResult !== 'correct' && (
                          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1.05rem', margin: '10px auto', maxWidth: '420px', lineHeight: 1.4 }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'left' }}>Comparativo:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {getDiffText(listeningInput, currentPhrase.text)}
                            </div>
                          </div>
                        )}

                        <div className="flashcard-target" style={{ marginTop: '16px' }}>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{currentPhrase.text}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          {currentPhrase.translation}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- Mode E: Digitação da Frase --- */}
                {reviewMode === 'writing' && (
                  <div className="fade-in" style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', padding: '0 20px' }}>
                      {currentPhrase.translation}
                    </div>

                    {!revealed ? (
                      <form onSubmit={handleVerifyWriting} style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '0 auto' }}>
                        <input
                          type="text"
                          className="input-text"
                          placeholder={`Digite em ${getLanguageName(currentPhrase.language_id)}...`}
                          value={writingInput}
                          onChange={(e) => setWritingInput(e.target.value)}
                          autoFocus
                          style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Confirmar</button>
                      </form>
                    ) : (
                      <div className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '10px 0' }}>
                          {writingResult === 'correct' ? (
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <Check size={14} /> Digitação Perfeita!
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                              <X size={14} /> Incorreto
                            </span>
                          )}
                        </div>

                        {/* Diff Render */}
                        {writingResult !== 'correct' && (
                          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1.05rem', margin: '10px auto', maxWidth: '420px', lineHeight: 1.4 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {getDiffText(writingInput, currentPhrase.text)}
                            </div>
                          </div>
                        )}

                        <div className="flashcard-target" style={{ marginTop: '16px' }}>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{currentPhrase.text}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- Back Face Extra elements (Revealed metadata) --- */}
                {revealed && (
                  <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '16px', paddingTop: '12px' }}>
                    
                    {/* Mastery Stars rating */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nível de Domínio</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(star => {
                          const isStarred = (phraseStars[currentPhrase.id] || 0) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updatePhraseStars(currentPhrase.id, star); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                              title={`Marcar como ${star} estrelas`}
                            >
                              <Star size={18} fill={isStarred ? '#eab308' : 'none'} stroke={isStarred ? '#eab308' : 'var(--text-muted)'} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {currentPhrase.explanation && (
                      <div className="flashcard-explanation" style={{ marginTop: '14px', maxWidth: '550px', fontSize: '0.8rem', padding: '8px 14px', textAlign: 'center' }}>
                        💡 {currentPhrase.explanation}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Action Row */}
          {!revealed ? (
            reviewMode === 'flashcard' ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => playPhraseAudio(currentPhrase)} 
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Volume2 size={16} /> Ouvir Frase
                </button>
                <button 
                  onClick={handleReveal} 
                  className="btn btn-primary"
                  style={{ flex: 2, height: '48px', borderRadius: 'var(--radius-md)' }}
                >
                  Revelar Resposta
                </button>
              </div>
            ) : null
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
                Qual o nível de dificuldade dessa frase para você?
              </div>
              
              <div className="rating-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <button className="rating-btn rating-btn-hard" onClick={() => handleRateDifficulty('hard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>🔴 Difícil</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8 }}>
                    {reviewAlgorithm === 'fibonacci' ? 'Rever hoje' : `Rever em ${formatInterval(getNextIntervalDays(currentPhrase.id, 'hard'))}`}
                  </span>
                </button>
                
                <button className="rating-btn rating-btn-medium" onClick={() => handleRateDifficulty('medium')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>🟡 Médio</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8 }}>
                    {`Rever em ${formatInterval(getNextIntervalDays(currentPhrase.id, 'medium'))}`}
                  </span>
                </button>
                
                <button className="rating-btn rating-btn-easy" onClick={() => handleRateDifficulty('easy')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>🟢 Fácil</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8 }}>
                    {`Rever em ${formatInterval(getNextIntervalDays(currentPhrase.id, 'easy'))}`}
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- Dashboard / Library Layout ---
  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%', alignItems: 'stretch' }}>
      
      {/* LEFT/CENTER MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }}>
        
        {/* Navigation & Header tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setActiveSubTab('practice')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeSubTab === 'practice' ? '2px solid var(--accent)' : 'none',
                color: activeSubTab === 'practice' ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                paddingBottom: '8px',
                cursor: 'pointer'
              }}
            >
              🎯 Praticar Revisão
            </button>
            <button
              onClick={() => setActiveSubTab('library')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeSubTab === 'library' ? '2px solid var(--accent)' : 'none',
                color: activeSubTab === 'library' ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                paddingBottom: '8px',
                cursor: 'pointer'
              }}
            >
              📚 Biblioteca de Cards ({filteredPhrasesForLibrary.length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Insights panel toggler button */}
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`btn-icon ${showInsights ? 'active' : ''}`}
              style={{ width: '32px', height: '32px' }}
              title="Alternar painel de Insights"
            >
              <BarChart2 size={16} />
            </button>
          </div>
        </div>

        {/* ======================================= */}
        {/* TAB 1: PRACTICE DASHBOARD & SESSION START */}
        {/* ======================================= */}
        {activeSubTab === 'practice' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Repetição Espaçada ⌛</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Otimize sua retenção e combata a curva de esquecimento.
                </p>
              </div>

              {/* Algorithm select pill widget */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', padding: '4px 10px', borderRadius: '30px', border: '1px solid var(--border)' }}>
                <Sliders size={13} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Algoritmo:</span>
                
                <button
                  onClick={() => setReviewAlgorithm(reviewAlgorithm === 'fibonacci' ? 'sm2' : 'fibonacci')}
                  style={{
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {reviewAlgorithm === 'fibonacci' ? '📈 Fibonacci' : '⚙️ SM2'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setShowAlgorithmHelp(true)} 
                  style={{ background: 'none', border: 'none', display: 'flex', padding: '2px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              
              <div className="review-glow-card amber" onClick={() => stats.dueCount > 0 && handleStartSession('due')} style={{ opacity: stats.dueCount > 0 ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agendadas</span>
                  <Clock size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.dueCount}</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>revisões pendentes</span>
              </div>

              <div className="review-glow-card blue" onClick={() => stats.newCount > 0 && handleStartSession('new')} style={{ opacity: stats.newCount > 0 ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Novas</span>
                  <Sparkles size={15} style={{ color: '#3b82f6' }} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.newCount}</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>cards não iniciados</span>
              </div>

              <div className="review-glow-card green" onClick={() => stats.learnedCount > 0 && handleStartSession('all')} style={{ opacity: stats.learnedCount > 0 ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Em Rotação</span>
                  <BookOpen size={15} style={{ color: 'var(--success)' }} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.learnedCount}</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>frases ativas</span>
              </div>

              <div className="review-glow-card gold" onClick={() => stats.starredCount > 0 && handleStartSession('starred')} style={{ opacity: stats.starredCount > 0 ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estreladas</span>
                  <Star size={15} fill="#eab308" stroke="#eab308" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.starredCount}</div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>cards de ilhas</span>
              </div>
            </div>

            {/* Game / Study Mode Select Grid */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>🎮 Escolha o Modo de Estudo</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <button
                  onClick={() => setReviewMode('flashcard')}
                  style={{
                    background: reviewMode === 'flashcard' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${reviewMode === 'flashcard' ? 'var(--accent)' : 'var(--border)'}`,
                    color: reviewMode === 'flashcard' ? 'var(--accent)' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🎴 Flashcard</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>Frente e Verso clássico</span>
                </button>

                <button
                  onClick={() => setReviewMode('cloze')}
                  style={{
                    background: reviewMode === 'cloze' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${reviewMode === 'cloze' ? 'var(--accent)' : 'var(--border)'}`,
                    color: reviewMode === 'cloze' ? 'var(--accent)' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🕳️ Completar Lacunas</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>Cloze com áudio</span>
                </button>

                <button
                  onClick={() => setReviewMode('scramble')}
                  style={{
                    background: reviewMode === 'scramble' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${reviewMode === 'scramble' ? 'var(--accent)' : 'var(--border)'}`,
                    color: reviewMode === 'scramble' ? 'var(--accent)' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🧩 Ordenar Palavras</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>Word Scramble</span>
                </button>

                <button
                  onClick={() => setReviewMode('listening')}
                  style={{
                    background: reviewMode === 'listening' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${reviewMode === 'listening' ? 'var(--accent)' : 'var(--border)'}`,
                    color: reviewMode === 'listening' ? 'var(--accent)' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🎧 Ditado (Listening)</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>Escute e digite</span>
                </button>

                <button
                  onClick={() => setReviewMode('writing')}
                  style={{
                    background: reviewMode === 'writing' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${reviewMode === 'writing' ? 'var(--accent)' : 'var(--border)'}`,
                    color: reviewMode === 'writing' ? 'var(--accent)' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>✍️ Digitação da Frase</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>Traduza digitando</span>
                </button>
              </div>
            </div>

            {/* Quick Session Config drawer */}
            <div className="glass-card" style={{ border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={15} style={{ color: 'var(--accent)' }} /> Configurações de Fila
                </span>
                {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {filtersExpanded && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    
                    {/* Island dropdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Filtrar por Ilha</span>
                      <select
                        value={reviewCategoryFilter}
                        onChange={(e) => setReviewCategoryFilter(e.target.value)}
                        className="input-text"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px' }}
                      >
                        <option value="all">Todas as Ilhas</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Limit new cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Novos por Sessão</span>
                      <select
                        value={newCardsLimit}
                        onChange={(e) => setNewCardsLimit(Number(e.target.value))}
                        className="input-text"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px' }}
                      >
                        {[5, 10, 15, 20, 30].map(val => (
                          <option key={val} value={val}>{val} cards</option>
                        ))}
                      </select>
                    </div>

                    {/* Stars level filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Filtro de Mastery (Estrelas)</span>
                      <select
                        value={starsFilter}
                        onChange={(e) => setStarsFilter(e.target.value)}
                        className="input-text"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px' }}
                      >
                        <option value="all">Qualquer progresso</option>
                        <option value="starred">Marcados (★+)</option>
                        <option value="5">Apenas 5★ (★★★★★)</option>
                        <option value="3">Apenas 3★ (★★★)</option>
                        <option value="1">Apenas 1★ (★)</option>
                      </select>
                    </div>
                  </div>

                  {/* Shuffle toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shuffle size={14} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Embaralhar fila (Ordem aleatória)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={shuffleQueue}
                      onChange={(e) => setShuffleQueue(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Launch session card */}
            <div className="glass-card" style={{ padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--accent)' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>Fila Pronta</h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Sua fila contém <strong>{stats.dueCount} revisões agendadas</strong> e <strong>{stats.newCount} novos termos</strong> prontos para serem introduzidos.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  disabled={stats.dueCount === 0}
                  onClick={() => handleStartSession('due')}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '130px', padding: '10px 14px', fontSize: '0.75rem', borderRadius: '20px' }}
                >
                  🚀 Revisar Agendados ({stats.dueCount})
                </button>
                <button
                  disabled={stats.newCount === 0}
                  onClick={() => handleStartSession('new')}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '130px', padding: '10px 14px', fontSize: '0.75rem', borderRadius: '20px' }}
                >
                  ✨ Aprender Novos ({stats.newCount})
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: LIBRARY / CARD MANAGER VIEW      */}
        {/* ======================================= */}
        {activeSubTab === 'library' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Search & Status Filters */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Pesquisar por texto, tradução ou tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', paddingLeft: '32px', fontSize: '0.8rem', paddingRight: '10px', height: '34px' }}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-text"
                  style={{ width: '130px', fontSize: '0.78rem', height: '34px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <option value="all">Sentenças Ativas</option>
                  <option value="favorites">⭐️ Favoritas</option>
                  <option value="archived">📦 Arquivadas</option>
                  <option value="suspended">⏸️ Suspensas</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-text"
                  style={{ width: '130px', fontSize: '0.78rem', height: '34px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <option value="text">🔤 Ordem Alfabética</option>
                  <option value="stars">⭐️ Nível de Domínio</option>
                  <option value="difficulty">🔴 Dificuldade</option>
                  <option value="next_review">📅 Próxima Revisão</option>
                </select>
              </div>

              {/* Grouping Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Agrupar por:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'none', label: 'Nenhum' },
                    { id: 'category', label: 'Ilha (Categoria)' },
                    { id: 'level', label: 'Nível (Dificuldade)' },
                    { id: 'tags', label: 'Tags' }
                  ].map(grp => (
                    <button
                      key={grp.id}
                      onClick={() => setSelectedGrouping(grp.id as any)}
                      style={{
                        background: selectedGrouping === grp.id ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        color: selectedGrouping === grp.id ? 'white' : 'var(--text-secondary)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {grp.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Library list mapping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPhrasesForLibrary.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                  Nenhum card atende aos filtros selecionados.
                </div>
              ) : (
                filteredPhrasesForLibrary.map(phrase => {
                  const item = reviewItems[phrase.id];
                  const stars = phraseStars[phrase.id] || 0;
                  const difficulty = item?.difficulty || 'medium';
                  const isArchived = archivedPhrases.includes(phrase.id);
                  const isSuspended = suspendedPhrases.includes(phrase.id);

                  return (
                    <div 
                      key={phrase.id}
                      className="glass-card"
                      style={{ padding: '14px 16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      {/* Top flags row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        
                        {/* Domain (Stars) & Difficulty indicator */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ display: 'flex', gap: '1px' }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={11} fill={s <= stars ? '#eab308' : 'none'} stroke={s <= stars ? '#eab308' : 'var(--text-muted)'} />
                            ))}
                          </span>

                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: difficulty === 'easy' ? 'var(--success)' : difficulty === 'hard' ? '#ef4444' : 'var(--accent)',
                            textTransform: 'uppercase'
                          }}>
                            {difficulty === 'easy' ? 'Fácil' : difficulty === 'hard' ? 'Difícil' : 'Médio'}
                          </span>
                        </div>

                        {/* Flags actions */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => toggleArchivePhrase(phrase.id)}
                            style={{ 
                              background: isArchived ? 'rgba(234, 179, 8, 0.1)' : 'none', 
                              border: 'none', 
                              color: isArchived ? '#eab308' : 'var(--text-muted)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              fontWeight: 700
                            }}
                            title={isArchived ? 'Desarquivar card' : 'Arquivar card'}
                          >
                            <Archive size={12} /> {isArchived ? 'Arquivado' : 'Arquivar'}
                          </button>

                          <button
                            onClick={() => toggleSuspendPhrase(phrase.id)}
                            style={{ 
                              background: isSuspended ? 'rgba(239, 68, 68, 0.1)' : 'none', 
                              border: 'none', 
                              color: isSuspended ? '#ef4444' : 'var(--text-muted)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              fontWeight: 700
                            }}
                            title={isSuspended ? 'Retomar card' : 'Suspender card'}
                          >
                            <ShieldAlert size={12} /> {isSuspended ? 'Suspenso' : 'Suspender'}
                          </button>

                          <button
                            onClick={() => toggleFavorite(phrase.id)}
                            style={{ background: 'none', border: 'none', color: favorites.includes(phrase.id) ? '#eab308' : 'var(--text-muted)', cursor: 'pointer' }}
                          >
                            <Star size={14} fill={favorites.includes(phrase.id) ? '#eab308' : 'none'} />
                          </button>
                        </div>
                      </div>

                      {/* Main text and translation */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: 'white', display: 'block' }}>{phrase.text}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{phrase.translation}</span>
                        </div>
                        
                        <button
                          onClick={() => playPhraseAudio(phrase)}
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', flexShrink: 0 }}
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>

                      {/* Tags row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '6px', marginTop: '4px' }}>
                        <Tag size={10} style={{ color: 'var(--text-muted)' }} />
                        {phrase.tags && phrase.tags.map((tag, idx) => (
                          <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px' }}>
                            {tag}
                          </span>
                        ))}
                        
                        {editingPhraseTagsId === phrase.id ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={phraseTagsInput}
                              onChange={(e) => setPhraseTagsInput(e.target.value)}
                              placeholder="ex: verbo, giria"
                              style={{ padding: '2px 4px', fontSize: '0.62rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '3px', color: 'white' }}
                              autoFocus
                            />
                            <button onClick={() => handleSaveTags(phrase.id)} style={{ background: 'var(--success)', border: 'none', color: 'white', padding: '2px 6px', fontSize: '0.62rem', borderRadius: '3px', cursor: 'pointer' }}>OK</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenTagEditor(phrase.id, phrase.tags)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.62rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                          >
                            + Tag
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>

      {/* ======================================= */}
      {/* RIGHT SIDEBAR: LEARNING INSIGHTS        */}
      {/* ======================================= */}
      {showInsights && (
        <div className="fade-in glass-card" style={{ width: '280px', flexShrink: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={15} style={{ color: 'var(--accent)' }} /> Insights de Aprendizado
            </span>
            <button onClick={() => setShowInsights(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>&times;</button>
          </div>

          {/* Average response time widget */}
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Tempo Médio por Resposta</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginTop: '2px' }}>{insights.avgTime}</div>
          </div>

          {/* Retention indicator bar widget */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              <span>Taxa de Retenção</span>
              <span style={{ color: 'var(--success)' }}>{insights.retention}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${insights.retention}%`, background: 'var(--success)', borderRadius: '3px' }} />
            </div>
          </div>

          {/* Recommendations block */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={11} style={{ color: 'var(--accent)' }} /> Recomendações
            </span>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.35 }}>
              {insights.recommendation}
            </p>
          </div>

          {/* Weak spots widget */}
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Pontos Fracos (Erros por Ilha)</span>
            {insights.weakSpots.length === 0 ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nenhum erro registrado. Excelente!</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {insights.weakSpots.map((ws, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{ws.catName}</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{ws.failRate}% erros</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hardest vocabulary widget */}
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Vocabulário mais difícil</span>
            {insights.vocab.length === 0 ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ainda não há dados suficientes.</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {insights.vocab.map((word, idx) => (
                  <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#fca5a5', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Popover Algorithm Modal overlay */}
      {showAlgorithmHelp && (
        <div className="practice-modal-overlay" onClick={() => setShowAlgorithmHelp(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpIcon size={18} style={{ color: 'var(--accent)' }} /> Algoritmos de Repetição
              </h3>
              <div style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => setShowAlgorithmHelp(false)}>&times;</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'white', display: 'block', marginBottom: '4px' }}>📈 Fibonacci Spacing</strong>
                Intervalos baseados na sequência de Fibonacci (1, 2, 3, 5, 8, 13 dias...). Em caso de erro, você retrocede apenas 2 níveis em vez de resetar, protegendo sua linha de aprendizado.
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <strong style={{ color: 'white', display: 'block', marginBottom: '4px' }}>⚙️ SuperMemo SM2</strong>
                Calcula os próximos intervalos multiplicando pelo Fator de Facilidade (Ease Factor). Respostas fáceis aumentam a facilidade, enquanto erros resetam o intervalo do card para 1 dia.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
