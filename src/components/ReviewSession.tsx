import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp, Phrase } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { 
  Volume2, Star, ArrowLeft, RefreshCw, CheckCircle, 
  Clock, BookOpen, Sparkles, Sliders, Settings, AlertCircle, Plus, Edit2,
  Languages, HelpCircle, Info, Shuffle, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react';

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];

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
    updatePhraseStars
  } = useApp();

  // Navigation states
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'due' | 'new' | 'all' | 'starred'>('due');

  // Custom session config states
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('all');
  const [newCardsLimit, setNewCardsLimit] = useState<number>(10);
  const [starsFilter, setStarsFilter] = useState<string>('all');
  const [shuffleQueue, setShuffleQueue] = useState<boolean>(true);
  const [showAlgorithmHelp, setShowAlgorithmHelp] = useState<boolean>(false);

  // Card edit form states
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editCardText, setEditCardText] = useState('');
  const [editCardTranslation, setEditCardTranslation] = useState('');
  const [editCardExplanation, setEditCardExplanation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Session queue states
  const [sessionQueue, setSessionQueue] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lapsedPhrasesSet, setLapsedPhrasesSet] = useState<Set<string>>(new Set());
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);
  
  // Stats inside current session
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);
  const [initialQueueLength, setInitialQueueLength] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const nowTime = useMemo(() => new Date().getTime(), [sessionActive]);

  const filteredPhrasesForReview = useMemo(() => {
    let list = phrases;
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
  }, [phrases, reviewCategoryFilter, starsFilter, phraseStars]);

  // --- Dashboard Statistics Calculations ---
  const stats = useMemo(() => {
    // 1. Due Phrases (Pendente)
    const due = filteredPhrasesForReview.filter(p => {
      const item = reviewItems[p.id];
      return item && new Date(item.next_review_date).getTime() <= nowTime;
    });

    // 2. New Phrases (Novos)
    const newCards = filteredPhrasesForReview.filter(p => !reviewItems[p.id]);

    // 3. Learned/In-review Phrases (Em Aprendizado)
    const learned = filteredPhrasesForReview.filter(p => {
      const item = reviewItems[p.id];
      return item && new Date(item.next_review_date).getTime() > nowTime;
    });

    // 4. Starred Phrases (Estrelados)
    const starred = filteredPhrasesForReview.filter(p => (phraseStars[p.id] || 0) > 0);

    return {
      dueCount: due.length,
      newCount: newCards.length,
      learnedCount: learned.length,
      starredCount: starred.length,
      duePhrases: due,
      newPhrases: newCards,
      starredPhrases: starred
    };
  }, [filteredPhrasesForReview, reviewItems, nowTime, phraseStars]);

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
      
      // Preserve pitch when speed is changed
      if ('preservesPitch' in audio) {
        audio.preservesPitch = true;
      } else if ('webkitPreservesPitch' in audio) {
        (audio as any).webkitPreservesPitch = true;
      } else if ('mozPreservesPitch' in audio) {
        (audio as any).mozPreservesPitch = true;
      }
      
      const speed = phrase.speed || 1.0;
      audio.defaultPlaybackRate = speed;
      audio.playbackRate = speed;
      
      audio.onplay = () => {
        setIsPlaying(true);
        audio.playbackRate = speed;
      };
      audio.oncanplay = () => {
        audio.playbackRate = speed;
      };
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
      activeUtteranceRef.current = utterance; // Keep alive!
      
      const langMapping: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        it: 'it-IT',
        de: 'de-DE',
        zh: 'zh-CN',
        ru: 'ru-RU'
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

  // Trigger audio on card render
  const currentPhrase = sessionQueue[currentIndex];
  useEffect(() => {
    if (currentPhrase && sessionActive && !completed && !isEditingCard) {
      // Delay slightly for smooth transition
      const timer = setTimeout(() => {
        playPhraseAudio(currentPhrase);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPhrase?.id, sessionActive, completed, isEditingCard]);

  // Start Session Actions
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
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleStartEditCard = (phrase: Phrase) => {
    setEditCardText(phrase.text);
    setEditCardTranslation(phrase.translation);
    setEditCardExplanation(phrase.explanation || '');
    setIsEditingCard(true);
  };

  const handleSaveCardEdit = () => {
    if (!currentPhrase) return;
    if (!editCardText.trim() || !editCardTranslation.trim()) {
      alert('Texto original e tradução são obrigatórios.');
      return;
    }

    const cleanOriginal = currentPhrase.text.trim().replace(/\s+/g, ' ');
    const cleanEdited = editCardText.trim().replace(/\s+/g, ' ');
    const textChanged = cleanOriginal !== cleanEdited;

    updatePhrase(currentPhrase.id, {
      text: editCardText.trim(),
      translation: editCardTranslation.trim(),
      explanation: editCardExplanation.trim(),
      ...(textChanged ? { audio_url: null } : {})
    });

    setSessionQueue(prev => prev.map(item => {
      if (item.id === currentPhrase.id) {
        return {
          ...item,
          text: editCardText.trim(),
          translation: editCardTranslation.trim(),
          explanation: editCardExplanation.trim(),
          ...(textChanged ? { audio_url: null } : {})
        };
      }
      return item;
    }));

    setIsEditingCard(false);
  };

  const handleAutoTranslateText = async (text: string, callback: (val: string) => void) => {
    if (!text.trim()) {
      alert("Escreva alguma sentença no texto original antes de traduzir.");
      return;
    }
    setIsTranslating(true);
    try {
      const sourceLang = targetLanguage || 'en';
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|pt`;
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

  // Pre-calculate next interval previews
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
      // SM-2 Spaced Repetition calculation
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
        // q values: easy = 5, medium = 3
        const q = rating === 'easy' ? 5 : 3;
        const nextEf = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        nextInterval = Math.round(interval * Math.max(1.3, nextEf));
      }
      return nextInterval;
    }
  };

  // Submit response & handle queue progression
  const handleRateDifficulty = async (rating: 'easy' | 'medium' | 'hard') => {
    if (!currentPhrase) return;

    // Determine if this card was already failed in the current session
    const isLapsed = lapsedPhrasesSet.has(currentPhrase.id);

    // 1. Submit card review only if it wasn't already failed in this session
    // (This prevents overwriting the initial 'hard' state penalty and scheduling it for tomorrow)
    if (!isLapsed) {
      await submitPracticeResult(currentPhrase.id, rating);
    }

    // Increment reviewed count
    setCardsReviewedCount(prev => prev + 1);

    if (rating === 'hard') {
      // Re-queue card at the end of the current session list so they practice it again (forcing active recall)
      setLapsedPhrasesSet(prev => {
        const next = new Set(prev);
        next.add(currentPhrase.id);
        return next;
      });

      setSessionQueue(prev => {
        const next = [...prev];
        next.push(currentPhrase); // Append copy to end of queue
        return next;
      });

      setSessionFeedback('Frase recolocada no fim da fila para reforço.');
      setTimeout(() => setSessionFeedback(null), 3000);

      setRevealed(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      // Correct (Medium / Easy)
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

    const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const isFavorite = currentPhrase ? favorites.includes(currentPhrase.id) : false;

  // --- Active Review Session View ---
  if (sessionActive) {
    if (completed || sessionQueue.length === 0) {
      return (
        <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.25))' }} />
          
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Sessão Concluída! 🎉</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem', maxWidth: '450px', lineHeight: 1.5 }}>
              Excelente! Você praticou as frases selecionadas. As curvas de retenção de memória foram atualizadas com sucesso.
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
          
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> {sessionType === 'new' ? 'Estudo de Novos' : sessionType === 'starred' ? 'Estrelados' : 'Revisão'} ({currentIndex + 1}/{sessionQueue.length})
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
            className={`flashcard ${!revealed ? 'unrevealed' : ''}`}
            onClick={!revealed ? handleReveal : undefined}
            style={{ position: 'relative', flex: 1, minHeight: '260px' }}
          >
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
                  🔁 Fila de Reforço
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
                className={`btn-icon ${isFavorite ? 'active' : ''}`}
                style={{ width: '36px', height: '36px' }}
              >
                <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
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
            ) : revealed ? (
              <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="flashcard-target" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{currentPhrase.text}</span>
                  
                  {/* Interactive Audio Wave */}
                  <div 
                    className="audio-waves-container" 
                    onClick={(e) => { e.stopPropagation(); playPhraseAudio(currentPhrase); }} 
                    style={{ cursor: 'pointer', marginTop: '12px' }}
                    title="Ouvir pronúncia"
                  >
                    <Volume2 size={20} style={{ color: isPlaying ? 'var(--accent)' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
                    <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                    <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                    <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                    <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                    <div className={`audio-wave-bar ${isPlaying ? 'playing' : ''}`} />
                  </div>
                </div>
                
                <div className="flashcard-translation" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '8px' }}>
                  {currentPhrase.translation}
                </div>

                {/* 1-5 Mastery Stars Picker on card back */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', margin: '14px 0' }}>
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
                  <div className="flashcard-explanation" style={{ marginTop: '12px', maxWidth: '550px', fontSize: '0.8rem', padding: '10px 16px' }}>
                    💡 {currentPhrase.explanation}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                <div className="flashcard-translation" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', padding: '0 20px' }}>
                  {currentPhrase.translation}
                </div>
                
                <div className="reveal-overlay">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', animation: 'float 2s ease-in-out infinite' }}>
                    <Volume2 size={24} />
                  </div>
                  <span className="reveal-text">Relembre em {getLanguageName(currentPhrase.language_id)}</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toque para revelar a resposta</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          {!revealed ? (
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
                  <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>&#128993; Médio</span>
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

  // --- Dashboard Main Panel View ---
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Dashboard Title Header & Algorithm Picker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Revisão Espaçada ⌛</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Otimize sua retenção de vocabulário e evite o esquecimento com métodos comprovados.
          </p>
        </div>

        {/* Algorithm switch pill widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: '30px', border: '1px solid var(--border)' }}>
          <Sliders size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Algoritmo:</span>
          
          <button
            onClick={() => setReviewAlgorithm(reviewAlgorithm === 'fibonacci' ? 'sm2' : 'fibonacci')}
            style={{
              background: 'var(--accent)',
              border: 'none',
              color: 'white',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {reviewAlgorithm === 'fibonacci' ? '📈 Fibonacci' : '⚙️ SuperMemo SM2'}
          </button>

          <button 
            type="button" 
            onClick={() => setShowAlgorithmHelp(true)} 
            style={{ background: 'none', border: 'none', display: 'flex', padding: '2px', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Como funcionam os algoritmos?"
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </div>

      {/* Spaced Repetition Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        
        {/* Due Cards Box */}
        <div 
          className="review-glow-card amber" 
          onClick={() => stats.dueCount > 0 && handleStartSession('due')}
          style={{ opacity: stats.dueCount > 0 ? 1 : 0.6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agendadas</span>
            <Clock size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{stats.dueCount}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>revisar hoje (due)</span>
        </div>

        {/* New Cards Box */}
        <div 
          className="review-glow-card blue" 
          onClick={() => stats.newCount > 0 && handleStartSession('new')}
          style={{ opacity: stats.newCount > 0 ? 1 : 0.6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Novas</span>
            <Sparkles size={16} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{stats.newCount}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>prontas para iniciar</span>
        </div>

        {/* Learned Cards Box */}
        <div 
          className="review-glow-card green" 
          onClick={() => stats.learnedCount > 0 && handleStartSession('all')}
          style={{ opacity: stats.learnedCount > 0 ? 1 : 0.6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em Rotação</span>
            <BookOpen size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{stats.learnedCount}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>cards ativos estudados</span>
        </div>

        {/* Starred Cards Box */}
        <div 
          className="review-glow-card gold" 
          onClick={() => stats.starredCount > 0 && handleStartSession('starred')}
          style={{ opacity: stats.starredCount > 0 ? 1 : 0.6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estreladas</span>
            <Star size={16} fill="#eab308" stroke="#eab308" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{stats.starredCount}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>cards marcados nas ilhas</span>
        </div>
      </div>

      {/* Accordion / Expandable Configs Drawer */}
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
            fontSize: '0.88rem'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} style={{ color: 'var(--accent)' }} /> Ajustar Filtros & Embaralhamento
          </span>
          {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {filtersExpanded && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              
              {/* Filter by Island dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtrar por Ilha</span>
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

              {/* Limit of new cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Novos Cards por Sessão</span>
                <select
                  value={newCardsLimit}
                  onChange={(e) => setNewCardsLimit(Number(e.target.value))}
                  className="input-text"
                  style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px' }}
                >
                  {[5, 10, 15, 20, 30, 50].map(val => (
                    <option key={val} value={val}>{val} cards</option>
                  ))}
                </select>
              </div>

              {/* Stars Filter dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtro de Mastery (Estrelas)</span>
                <select
                  value={starsFilter}
                  onChange={(e) => setStarsFilter(e.target.value)}
                  className="input-text"
                  style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px' }}
                >
                  <option value="all">Todas as sentenças</option>
                  <option value="starred">Qualquer Estrela (★+)</option>
                  <option value="5">Apenas 5 Estrelas (★★★★★)</option>
                  <option value="3">Apenas 3 Estrelas (★★★)</option>
                  <option value="1">Apenas 1 Estrela (★)</option>
                </select>
              </div>
            </div>

            {/* Shuffle Toggle Switch Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.01)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shuffle size={16} style={{ color: 'var(--accent)' }} />
                <div>
                  <strong style={{ fontSize: '0.8rem', display: 'block' }}>Ordem Aleatória (Embaralhar)</strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mistura a fila de cards a cada nova sessão</span>
                </div>
              </div>

              {/* Minimalist toggle switch wrapper */}
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={shuffleQueue}
                  onChange={(e) => setShuffleQueue(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: shuffleQueue ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                    transition: '.3s',
                    borderRadius: '34px'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px', width: '16px',
                    left: shuffleQueue ? '20px' : '4px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.3s',
                    borderRadius: '50%'
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Popover Algorithm Modal overlay */}
      {showAlgorithmHelp && (
        <div className="practice-modal-overlay" onClick={() => setShowAlgorithmHelp(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} style={{ color: 'var(--accent)' }} /> Algoritmos de Repetição
              </h3>
              <button onClick={() => setShowAlgorithmHelp(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>&times;</button>
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
