import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp, Phrase } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { 
  Volume2, Star, ArrowLeft, Play, Pause, Headphones, MessageSquare, 
  Eye, EyeOff, Calendar, Search, Settings, Plus, X, Sparkles, 
  Clock, HelpCircle, ChevronRight, Bookmark, Edit2, FileSpreadsheet, Download, Trash2,
  Languages, Layers
} from 'lucide-react';

export const PracticeSession: React.FC = () => {
  const {
    phrases,
    categories,
    activeIslandId,
    setActiveIslandId,
    setActiveTab,
    favorites,
    toggleFavorite,
    submitPracticeResult,
    markPhraseAsSeen,
    markPhrasesAsSeen,
    targetLanguage,
    addCustomPhrase,
    addCustomPhrasesBatch,
    updatePhrase,
    deletePhrase,
    streak,
    completedToday,
    dailyTarget
  } = useApp();

  const island = categories.find(c => c.id === activeIslandId);

  // --- 1. Practice Settings State (Persisted in LocalStorage) ---
  const [repetitions, setRepetitions] = useState<number>(() => {
    return Number(localStorage.getItem('hl_pref_reps') || '1');
  });
  const [pauseDuration, setPauseDuration] = useState<number>(() => {
    return Number(localStorage.getItem('hl_pref_pause') || '0.5');
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    return Number(localStorage.getItem('hl_pref_speed') || '1.0');
  });
  const [textSize, setTextSize] = useState<'A-' | 'A' | 'A+' | 'A++'>(() => {
    return (localStorage.getItem('hl_pref_text_size') as any) || 'A-';
  });
  const [sortOrder, setSortOrder] = useState<string>(() => {
    return localStorage.getItem('hl_pref_sort') || 'original';
  });

  // Save settings helpers
  const saveRepetitions = (val: number) => { setRepetitions(val); localStorage.setItem('hl_pref_reps', String(val)); };
  const savePause = (val: number) => { setPauseDuration(val); localStorage.setItem('hl_pref_pause', String(val)); };
  const saveSpeed = (val: number) => {
    setPlaybackSpeed(val);
    localStorage.setItem('hl_pref_speed', String(val));
    if (activeAudioRef.current) {
      activeAudioRef.current.playbackRate = val;
      activeAudioRef.current.defaultPlaybackRate = val;
    }
  };
  const saveSize = (val: 'A-' | 'A' | 'A+' | 'A++') => { setTextSize(val); localStorage.setItem('hl_pref_text_size', val); };
  const saveSort = (val: string) => { setSortOrder(val); localStorage.setItem('hl_pref_sort', val); };

  // --- 2. Filter / Search UI States ---
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [revealAllTranslations, setRevealAllTranslations] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addPhraseOpen, setAddPhraseOpen] = useState(false);
  
  // Right Stats Tab Toggle ('Hoje' vs 'Total')
  const [statsPeriod, setStatsPeriod] = useState<'today' | 'total'>('today');

  // Track locally revealed translations per card
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});

  // Flashcard memorization mode states
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Modes for showing target text or translation only
  const [showTargetOnly, setShowTargetOnly] = useState(false);
  const [showTranslationOnly, setShowTranslationOnly] = useState(false);

  // Local card star mastery rating (1-5 stars)
  const [phraseStars, setPhraseStars] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('hl_phrase_stars');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Track total shadowing repetitions done in this active session
  const [sessionRepCount, setSessionRepCount] = useState(0);

  // --- 3. Add Custom Phrase Form State ---
  const [newText, setNewText] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newVoice, setNewVoice] = useState('Fenrir');
  const [newSpeed, setNewSpeed] = useState(1.0);

  // Batch import and edit states
  const [addMode, setAddMode] = useState<'single' | 'batch'>('single');
  const [batchInput, setBatchInput] = useState('');
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null);
  const [editPhraseText, setEditPhraseText] = useState('');
  const [editPhraseTranslation, setEditPhraseTranslation] = useState('');
  const [editPhraseExplanation, setEditPhraseExplanation] = useState('');
  const [transferIslandId, setTransferIslandId] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [offlineProgress, setOfflineProgress] = useState<string | null>(null);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);

  useEffect(() => {
    if (activeIslandId) {
      setIsOfflineCached(localStorage.getItem(`hl_island_offline_${activeIslandId}`) === 'true');
    }
  }, [activeIslandId]);

  // Collapsible stats/tips right sidebar panel state
  const [statsSidebarOpen, setStatsSidebarOpen] = useState<boolean>(() => {
    return localStorage.getItem('hl_stats_sidebar_open') !== 'false';
  });

  const toggleStatsSidebar = () => {
    setStatsSidebarOpen(prev => {
      const nextVal = !prev;
      localStorage.setItem('hl_stats_sidebar_open', String(nextVal));
      return nextVal;
    });
  };

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

  // --- 4. Autoplay Shadowing Player State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  
  const currentRepRef = useRef<number>(1);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const activeAudioResolveRef = useRef<(() => void) | null>(null);

  const playbackSpeedRef = useRef(playbackSpeed);
  const repetitionsRef = useRef(repetitions);
  const pauseDurationRef = useRef(pauseDuration);

  // Keep refs in sync
  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    repetitionsRef.current = repetitions;
  }, [repetitions]);

  useEffect(() => {
    pauseDurationRef.current = pauseDuration;
  }, [pauseDuration]);

  // --- 5. Resolve Phrases & Apply Filters/Sorting ---
  const islandPhrases = useMemo(() => {
    if (!activeIslandId) return [];
    
    // Filter by island category
    let list = phrases.filter(p => p.category_id === activeIslandId);

    // Filter by favorite star bookmark if enabled
    if (filterFavorites) {
      list = list.filter(p => favorites.includes(p.id));
    }

    // Filter by search query if active
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.text.toLowerCase().includes(query) || 
        p.translation.toLowerCase().includes(query)
      );
    }

    // Sort according to preferences
    if (sortOrder === 'easy_first') {
      list = [...list].sort((a, b) => {
        const difficultyScore = { easy: 1, medium: 2, hard: 3 };
        return difficultyScore[a.difficulty || 'medium'] - difficultyScore[b.difficulty || 'medium'];
      });
    } else if (sortOrder === 'hard_first') {
      list = [...list].sort((a, b) => {
        const difficultyScore = { easy: 1, medium: 2, hard: 3 };
        return difficultyScore[b.difficulty || 'medium'] - difficultyScore[a.difficulty || 'medium'];
      });
    }

    return list;
  }, [phrases, activeIslandId, filterFavorites, searchQuery, sortOrder, favorites]);

  // Count the number of lines in batchInput for the visual bullet points margin
  const linesCount = useMemo(() => {
    if (!batchInput) return 1;
    return batchInput.split('\n').length;
  }, [batchInput]);

  // Parse batch input in real-time for visual guide
  const parsedBatchItems = useMemo(() => {
    if (!batchInput.trim()) return [];
    return batchInput.split('\n')
      .map(row => {
        if (!row.trim()) return null;
        const cleanRow = row.trim().replace(/^[\s•\-*]+/, '').trim();
        let parts = cleanRow.split(';');
        if (parts.length < 2) parts = cleanRow.split('\t');
        if (parts.length < 2) parts = cleanRow.split(',');

        const original = parts[0]?.trim() || '';
        const translation = parts[1]?.trim() || '';
        const isValid = !!original;

        return { original, translation, isValid };
      })
      .filter((item): item is { original: string; translation: string; isValid: boolean } => item !== null);
  }, [batchInput]);

  // Automatically queue all phrases of the active island for spaced repetition review
  useEffect(() => {
    if (activeIslandId && islandPhrases.length > 0) {
      const phraseIds = islandPhrases.map(p => p.id);
      markPhrasesAsSeen(phraseIds);
    }
  }, [activeIslandId, islandPhrases, markPhrasesAsSeen]);

  // --- 6. Stats calculations ---
  const stats = useMemo(() => {
    const activeIds = phrases.filter(p => p.category_id === activeIslandId).map(p => p.id);
    if (activeIds.length === 0) return { practiced: 0, reps: 0, mastered: 0 };

    // Count how many phrases have star ratings
    const practicedCount = activeIds.filter(id => phraseStars[id] > 0).length;

    // Count mastered phrases (rated 5 stars or repetition count in SM2 is high)
    const masteredCount = activeIds.filter(id => phraseStars[id] === 5).length;

    return {
      practiced: practicedCount,
      reps: sessionRepCount,
      mastered: masteredCount
    };
  }, [activeIslandId, phrases, phraseStars, sessionRepCount]);

  // --- 7. Autoplay Loop & Audio Actions ---

  // Stop everything
  const stopPlayer = () => {
    setIsPlaying(false);
    setPlayingIndex(null);
    setActivePlayingId(null);
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (activeAudioResolveRef.current) {
      try {
        activeAudioResolveRef.current();
      } catch (e) {}
      activeAudioResolveRef.current = null;
    }
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
    activeUtteranceRef.current = null;
  };

  // Resolve audio url from Supabase
  const getAudioUrl = (phrase: Phrase): string | null => {
    if (!phrase.audio_url) return null;
    if (phrase.audio_url.startsWith('http')) {
      if (phrase.audio_url.startsWith('https://audio.hyperlingua.app')) {
        return phrase.audio_url.replace('https://audio.hyperlingua.app', '/audio-proxy');
      }
      return phrase.audio_url;
    }
    const { data } = supabase.storage.from('phrase-audios').getPublicUrl(phrase.audio_url);
    return data.publicUrl;
  };

  // Direct single audio playback
  const playAudioFile = async (phrase: Phrase): Promise<void> => {
    markPhraseAsSeen(phrase.id);
    return new Promise(async (resolve) => {
      if (!audioEnabled) {
        // Just simulate playback duration if audio is toggled off
        setTimeout(() => resolve(), 1500);
        return;
      }

      // Resolve any pending audio promise first to release it cleanly!
      if (activeAudioResolveRef.current) {
        try {
          activeAudioResolveRef.current();
        } catch (e) {}
        activeAudioResolveRef.current = null;
      }
      activeAudioResolveRef.current = resolve;

      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }

      const playableUrl = await getPlayableAudioUrl(phrase);
      if (playableUrl) {
        const audio = new Audio(playableUrl);
        activeAudioRef.current = audio;
        
        // Preserve pitch when accelerated or decelerated
        if ('preservesPitch' in audio) {
          audio.preservesPitch = true;
        } else if ('webkitPreservesPitch' in audio) {
          (audio as any).webkitPreservesPitch = true;
        } else if ('mozPreservesPitch' in audio) {
          (audio as any).mozPreservesPitch = true;
        }

        audio.defaultPlaybackRate = playbackSpeedRef.current;
        audio.playbackRate = playbackSpeedRef.current;

        audio.onplay = () => {
          audio.playbackRate = playbackSpeedRef.current;
        };

        audio.oncanplay = () => {
          audio.playbackRate = playbackSpeedRef.current;
        };

        audio.onended = () => {
          activeAudioRef.current = null;
          activeAudioResolveRef.current = null;
          if (playableUrl.startsWith('blob:')) {
            URL.revokeObjectURL(playableUrl);
          }
          resolve();
        };

        audio.onerror = () => {
          activeAudioRef.current = null;
          activeAudioResolveRef.current = null;
          if (playableUrl.startsWith('blob:')) {
            URL.revokeObjectURL(playableUrl);
          }
          speakFallback(phrase.text, phrase.language_id).then(resolve);
        };

        audio.play().then(() => {
          audio.playbackRate = playbackSpeedRef.current;
        }).catch(() => {
          activeAudioRef.current = null;
          activeAudioResolveRef.current = null;
          if (playableUrl.startsWith('blob:')) {
            URL.revokeObjectURL(playableUrl);
          }
          speakFallback(phrase.text, phrase.language_id).then(resolve);
        });
      } else {
        speakFallback(phrase.text, phrase.language_id).then(resolve);
      }
    });
  };

  // Click on a phrase card to play and (if autoplay is active) continue autoplay from it
  const handlePhraseCardClick = (phrase: Phrase, index: number) => {
    if (isPlaying) {
      // Autoplay is active. Jump to this card and continue autoplay from here!
      if (activeAudioRef.current) {
        try {
          activeAudioRef.current.pause();
        } catch (e) {}
        activeAudioRef.current = null;
      }
      window.speechSynthesis.cancel();
      activeUtteranceRef.current = null;

      // Resolve the pending promise to unblock the autoplay loop
      if (activeAudioResolveRef.current) {
        try {
          activeAudioResolveRef.current();
        } catch (e) {}
        activeAudioResolveRef.current = null;
      }

      // Reset repetition counter to 1
      currentRepRef.current = 1;
      
      // Update playing index, triggering the autoplay useEffect to play this index
      setPlayingIndex(index);
    } else {
      // Autoplay is not active. Just play the audio for this phrase once
      playAudioFile(phrase);
    }
  };

  // TTS Fallback
  const speakFallback = (text: string, langCode: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        activeUtteranceRef.current = utterance; // Keep reference alive to prevent GC cutoff!
        utterance.rate = playbackSpeedRef.current;

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

        utterance.onend = () => {
          activeUtteranceRef.current = null;
          activeAudioResolveRef.current = null;
          resolve();
        };
        utterance.onerror = () => {
          activeUtteranceRef.current = null;
          activeAudioResolveRef.current = null;
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        activeUtteranceRef.current = null;
        resolve();
      }
    });
  };

  // Sequential Autoplay Effect
  useEffect(() => {
    if (!isPlaying) return;

    const runAutoplayLoop = async () => {
      if (playingIndex === null || playingIndex >= islandPhrases.length) {
        stopPlayer();
        return;
      }

      const phrase = islandPhrases[playingIndex];
      setActivePlayingId(phrase.id);

      // Highlight card and scroll it into view
      const cardElem = document.getElementById(`phrase-card-${phrase.id}`);
      if (cardElem) {
        cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Automatically reveal translation if configuration is active
      if (translationEnabled) {
        setRevealedCards(prev => ({ ...prev, [phrase.id]: true }));
      }

      // Play audio loop for configured reps
      for (let r = currentRepRef.current; r <= repetitionsRef.current; r++) {
        if (!isPlaying) return;
        currentRepRef.current = r;
        
        // Play audio
        await playAudioFile(phrase);
        setSessionRepCount(prev => prev + 1);

        try {
          const reps = Number(localStorage.getItem('hl_stats_total_shadow_reps') || '0') + 1;
          localStorage.setItem('hl_stats_total_shadow_reps', String(reps));

          const time = Number(localStorage.getItem('hl_stats_total_study_time_sec') || '0') + 10;
          localStorage.setItem('hl_stats_total_study_time_sec', String(time));

          const todayStr = new Date().toISOString().split('T')[0];
          const storedCounts = localStorage.getItem('hl_study_daily_counts');
          const counts: Record<string, number> = storedCounts ? JSON.parse(storedCounts) : {};
          counts[todayStr] = (counts[todayStr] || 0) + 1;
          localStorage.setItem('hl_study_daily_counts', JSON.stringify(counts));

          const storedDates = localStorage.getItem('hl_practiced_dates');
          const datesList: string[] = storedDates ? JSON.parse(storedDates) : [];
          if (!datesList.includes(todayStr)) {
            datesList.push(todayStr);
            localStorage.setItem('hl_practiced_dates', JSON.stringify(datesList));
          }
        } catch (e) {
          console.warn('Failed to update telemetry logs in PracticeSession', e);
        }

        // Pause duration delay between repeats
        if (r < repetitionsRef.current && isPlaying) {
          await new Promise(resolve => {
            autoplayTimerRef.current = setTimeout(resolve, pauseDurationRef.current * 1000) as any;
          });
        }
      }

      // Delay before moving to the next phrase card in the grid list
      if (isPlaying) {
        currentRepRef.current = 1;
        await new Promise(resolve => {
          autoplayTimerRef.current = setTimeout(resolve, pauseDurationRef.current * 1000) as any;
        });
        setPlayingIndex(prev => (prev !== null ? prev + 1 : null));
      }
    };

    runAutoplayLoop();

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, playingIndex]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => stopPlayer();
  }, []);

  const togglePlayAutoplay = () => {
    if (isPlaying) {
      stopPlayer();
    } else {
      if (islandPhrases.length === 0) return;
      setIsPlaying(true);
      setPlayingIndex(0);
      currentRepRef.current = 1;
    }
  };

  // --- 8. Star Bookmark & Mastery Clicks ---
  const handleToggleReveal = (id: string) => {
    setRevealedCards(prev => ({ ...prev, [id]: !prev[id] }));
    markPhraseAsSeen(id);
  };

  const handleRateStars = async (phraseId: string, starCount: number) => {
    const nextStars = { ...phraseStars, [phraseId]: starCount };
    setPhraseStars(nextStars);
    localStorage.setItem('hl_phrase_stars', JSON.stringify(nextStars));

    // Map stars to SM2 difficulty category
    // 5 stars = Fácil (easy), 3-4 = Médio (medium), 1-2 = Difícil (hard)
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (starCount === 5) difficulty = 'easy';
    else if (starCount <= 2) difficulty = 'hard';

    await submitPracticeResult(phraseId, difficulty);
  };

  // --- 9. Add Phrase Submit ---
  const handleAddPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newTranslation.trim()) return;

    await addCustomPhrase(
      newText,
      newTranslation,
      newExplanation,
      newDifficulty,
      newVoice,
      newSpeed
    );

    // Reset Form
    setNewText('');
    setNewTranslation('');
    setNewExplanation('');
    setAddPhraseOpen(false);
  };

  // Batch Import handler
  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchInput.trim()) return;

    const rows = batchInput.split('\n');
    const itemsToImport: { text: string; translation: string; explanation: string }[] = [];

    for (const row of rows) {
      if (!row.trim()) continue;
      
      // Remove any leading bullet points (e.g. •, -, *, 1., 2.)
      const cleanRow = row.trim().replace(/^[\s•\-*]+/, '').trim();
      
      // Split by semicolon, tab, or comma (fallback)
      let parts = cleanRow.split(';');
      if (parts.length < 2) parts = cleanRow.split('\t');
      if (parts.length < 2) parts = cleanRow.split(',');

      const original = parts[0]?.trim();
      const translation = parts[1]?.trim() || '';
      const explanation = parts[2]?.trim() || '';

      if (original) {
        itemsToImport.push({
          text: original,
          translation,
          explanation
        });
      }
    }

    if (itemsToImport.length > 0) {
      await addCustomPhrasesBatch(itemsToImport);
      alert(`Sucesso! Importadas ${itemsToImport.length} frases com sucesso!`);
    } else {
      alert('Nenhuma frase válida encontrada para importar. Certifique-se de usar o formato: Sentença; Tradução; Explicação (opcional)');
    }

    setBatchInput('');
    setAddPhraseOpen(false);
  };

  // Spreadsheet file import handler
  const handleSpreadsheetImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const rows = text.split('\n');
      let importedCount = 0;

      for (const row of rows) {
        if (!row.trim()) continue;

        // Split by semicolon, tab, or comma (fallback)
        let parts = row.split(';');
        if (parts.length < 2) parts = row.split('\t');
        if (parts.length < 2) parts = row.split(',');

        const original = parts[0]?.trim();
        const translation = parts[1]?.trim();
        const explanation = parts[2]?.trim() || '';

        // Skip headers if present
        if (original?.toLowerCase() === 'original' || original?.toLowerCase() === 'texto' || original?.toLowerCase() === 'frase') {
          continue;
        }

        if (original && translation) {
          await addCustomPhrase(
            original,
            translation,
            explanation,
            'medium',
            'Fenrir',
            1.0
          );
          importedCount++;
        }
      }

      alert(`Sucesso! Importadas ${importedCount} frases a partir da planilha!`);
      e.target.value = '';
      setAddPhraseOpen(false);
    };
    reader.readAsText(file);
  };

  // Export Phrases to Spreadsheet CSV
  const handleExportSpreadsheet = () => {
    if (islandPhrases.length === 0) {
      alert('Não há frases nesta ilha para exportar.');
      return;
    }

    const headers = 'Original;Tradução;Explicação\n';
    const rows = islandPhrases.map(phrase => {
      const original = (phrase.text || '').replace(/"/g, '""');
      const translation = (phrase.translation || '').replace(/"/g, '""');
      const explanation = (phrase.explanation || '').replace(/"/g, '""');
      return `"${original}";"${translation}";"${explanation}"`;
    }).join('\n');

    const csvContent = '\uFEFF' + headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const activeIsland = categories.find(c => c.id === activeIslandId);
    const islandName = activeIsland ? activeIsland.name : 'ilha';
    const sanitizedFilename = islandName.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'frases';

    link.setAttribute('download', `${sanitizedFilename}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to encode AudioBuffer to WAV
  const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // 1 = raw PCM (16-bit)
    const bitDepth = 16;
    
    let result;
    if (numOfChan === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }
    
    const bufferLength = result.length * 2;
    const arrayBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(arrayBuffer);
    
    const writeString = (v: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        v.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const floatTo16BitPCM = (v: DataView, offset: number, input: Float32Array) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        v.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };
    
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + bufferLength, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numOfChan, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numOfChan * (bitDepth / 8), true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, bufferLength, true);
    
    // Write PCM data
    floatTo16BitPCM(view, 44, result);
    
    return new Blob([view], { type: 'audio/wav' });
  };

  const interleave = (inputL: Float32Array, inputR: Float32Array): Float32Array => {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0;
    let inputIndex = 0;
    
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }

    return result;
  };

  const handleDownloadCombinedAudio = async () => {
    const audiosToFetch = islandPhrases.map(phrase => ({
      phrase,
      url: getAudioUrl(phrase)
    })).filter(item => item.url !== null);

    if (audiosToFetch.length === 0) {
      alert('Nenhuma frase nesta ilha possui áudio disponível para download.');
      return;
    }

    setDownloadProgress('Iniciando Web Audio...');

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffers: AudioBuffer[] = [];

      for (let i = 0; i < audiosToFetch.length; i++) {
        const item = audiosToFetch[i];
        setDownloadProgress(`Baixando áudio ${i + 1}/${audiosToFetch.length}...`);
        
        try {
          const response = await fetch(item.url!);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          buffers.push(audioBuffer);
        } catch (err) {
          console.warn(`Erro ao processar áudio da frase: ${item.phrase.text}`, err);
        }
      }

      if (buffers.length === 0) {
        alert('Não foi possível carregar nenhum áudio desta ilha.');
        setDownloadProgress(null);
        return;
      }

      setDownloadProgress('Mesclando com repetições e pausas...');

      const sampleRate = buffers[0].sampleRate;
      const numberOfChannels = 2; // Stereo output

      let totalDuration = 0;
      for (const buffer of buffers) {
        totalDuration += repetitions * (buffer.duration + pauseDuration);
      }

      const totalLength = Math.ceil(totalDuration * sampleRate);
      const combinedBuffer = audioCtx.createBuffer(numberOfChannels, totalLength, sampleRate);

      let currentSample = 0;

      for (const buffer of buffers) {
        for (let r = 0; r < repetitions; r++) {
          const bufferLength = buffer.length;
          
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const combinedData = combinedBuffer.getChannelData(channel);
            const sourceChannel = channel < buffer.numberOfChannels ? channel : 0;
            const sourceData = buffer.getChannelData(sourceChannel);
            
            combinedData.set(sourceData, currentSample);
          }
          
          currentSample += bufferLength;
          
          const silenceLength = Math.ceil(pauseDuration * sampleRate);
          currentSample += silenceLength;
        }
      }

      setDownloadProgress('Codificando WAV...');
      const wavBlob = audioBufferToWavBlob(combinedBuffer);

      setDownloadProgress('Iniciando download...');
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedName = (island?.name || 'ilha').toLowerCase().replace(/[^a-z0-9]/gi, '_');
      link.download = `${sanitizedName}_completo_rep${repetitions}x.wav`;
      link.click();
      URL.revokeObjectURL(url);
      
      setDownloadProgress(null);
    } catch (err) {
      console.error('Erro ao gerar áudio combinado:', err);
      alert('Ocorreu um erro ao gerar o áudio combinado.');
      setDownloadProgress(null);
    }
  };

  const downloadIslandForOffline = async () => {
    if (!navigator.onLine) {
      alert('Você precisa estar online para baixar as frases.');
      return;
    }

    const audiosToFetch = islandPhrases.map(phrase => ({
      phrase,
      url: getAudioUrl(phrase)
    })).filter(item => item.url !== null);

    if (audiosToFetch.length === 0) {
      alert('Nenhuma frase nesta ilha possui áudio disponível.');
      return;
    }

    setOfflineProgress('Salvando áudios offline...');

    try {
      const cache = await caches.open('hl-island-audios-cache');
      let successCount = 0;

      for (let i = 0; i < audiosToFetch.length; i++) {
        const item = audiosToFetch[i];
        setOfflineProgress(`Salvando áudio ${i + 1}/${audiosToFetch.length}...`);
        
        try {
          const response = await fetch(item.url!);
          if (response.ok) {
            await cache.put(item.url!, response);
            successCount++;
          }
        } catch (err) {
          console.warn(`Erro ao baixar para offline: ${item.phrase.text}`, err);
        }
      }

      localStorage.setItem(`hl_island_offline_${activeIslandId}`, 'true');
      setIsOfflineCached(true);
      setOfflineProgress(null);
      alert(`Sucesso! ${successCount} áudios salvos offline.`);
    } catch (err) {
      console.error('Erro ao salvar offline:', err);
      setOfflineProgress(null);
      alert('Erro ao salvar áudios offline.');
    }
  };

  const removeIslandOffline = async () => {
    if (confirm('Deseja realmente remover os áudios offline desta ilha?')) {
      try {
        const cache = await caches.open('hl-island-audios-cache');
        for (const phrase of islandPhrases) {
          const url = getAudioUrl(phrase);
          if (url) {
            await cache.delete(url);
          }
        }
        localStorage.removeItem(`hl_island_offline_${activeIslandId}`);
        setIsOfflineCached(false);
        alert('Áudios offline removidos!');
      } catch (err) {
        console.error('Erro ao remover offline:', err);
      }
    }
  };

  const getPlayableAudioUrl = async (phrase: Phrase): Promise<string | null> => {
    const url = getAudioUrl(phrase);
    if (!url) return null;

    try {
      const cache = await caches.open('hl-island-audios-cache');
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn('Error reading from Cache Storage:', e);
    }
    return url;
  };

  // Start Edit Phrase
  const handleStartEdit = (phrase: Phrase) => {
    setEditingPhraseId(phrase.id);
    setEditPhraseText(phrase.text);
    setEditPhraseTranslation(phrase.translation);
    setEditPhraseExplanation(phrase.explanation || '');
    setTransferIslandId(phrase.category_id);
  };

  // Edit/Save Phrase handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhraseId) return;

    // Invalidate audio file if the sentence text has been changed/updated
    const original = phrases.find(p => p.id === editingPhraseId);
    const cleanOriginal = original ? original.text.trim().replace(/\s+/g, ' ') : '';
    const cleanEdited = editPhraseText.trim().replace(/\s+/g, ' ');
    const textChanged = !original || cleanOriginal !== cleanEdited;

    updatePhrase(editingPhraseId, {
      text: editPhraseText.trim(),
      translation: editPhraseTranslation.trim(),
      explanation: editPhraseExplanation.trim(),
      category_id: transferIslandId,
      ...(textChanged ? { audio_url: null } : {})
    });

    setEditingPhraseId(null);
    setEditPhraseText('');
    setEditPhraseTranslation('');
    setEditPhraseExplanation('');
    setTransferIslandId('');
  };

  // Reusable helper to fetch translation suggestion from MyMemory API
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

  const handleBack = () => {
    stopPlayer();
    setActiveIslandId(null);
    setActiveTab('dashboard');
  };

  const getWeeklyCalendar = () => {
    const list = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let practicedList: string[] = [];
    try {
      const stored = localStorage.getItem('hl_practiced_dates');
      if (stored) {
        practicedList = JSON.parse(stored);
      }
    } catch (e) {
      console.warn(e);
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isPracticed = practicedList.includes(dateStr) || (dateStr === today.toISOString().split('T')[0] && completedToday > 0);
      
      list.push({
        name: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isPracticed,
        isToday: i === 0,
        dateStr
      });
    }
    
    return list;
  };

  // Text size class mapping
  const getTextSizeClass = () => {
    if (textSize === 'A-') return 'font-size-sm';
    if (textSize === 'A') return 'font-size-md';
    if (textSize === 'A+') return 'font-size-lg';
    return 'font-size-xl';
  };

  if (!activeIslandId) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center' }}>
        <HelpCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
        <div>
          <h2>Nenhuma Ilha Selecionada</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem' }}>
            Volte para a lista de ilhas e escolha uma coleção para começar.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleBack} style={{ margin: '0 auto' }}>
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 1. Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Voltar</span>
        </button>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Frases</span>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '2px' }}>{island?.name}</h4>
        </div>
      </div>

      {/* 2. Three-column grid layout */}
      <div className="practice-layout" style={!statsSidebarOpen ? { gridTemplateColumns: '1fr' } : {}}>
        
        {/* Left Side: Audio Player banner and sentences list */}
        <div className="practice-list-container">
          
          {/* Autoplay player control header */}
          <div className="autoplay-banner">
            <div className="autoplay-controls-group">
              <button 
                onClick={togglePlayAutoplay}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isPlaying ? 'var(--danger)' : 'var(--accent)',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {isPlaying ? 'Autoplay rodando...' : 'Iniciar Autoplay'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Metodologia Shadowing sequencial
                </span>
              </div>
            </div>

            <div className="autoplay-controls-group" style={{ gap: '8px' }}>
              {/* Repetition Cycle Quick Selector */}
              <button 
                className="settings-btn"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                onClick={() => {
                  const nextReps = repetitions >= 5 ? 1 : repetitions + 1;
                  saveRepetitions(nextReps);
                }}
              >
                Rep {repetitions}x
              </button>

              {/* Toggle Target Only / Hide Translations (Headphone Icon) */}
              <button 
                className={`btn-icon ${showTargetOnly ? 'active' : ''}`}
                style={{ width: '36px', height: '36px' }}
                onClick={() => {
                  const nextVal = !showTargetOnly;
                  setShowTargetOnly(nextVal);
                  if (nextVal) {
                    setShowTranslationOnly(false);
                  }
                }}
                title="Mostrar sentenças no idioma e ocultar traduções"
              >
                <Headphones size={16} />
              </button>

              {/* Toggle Translation Only / Hide Sentences (MessageSquare Icon) */}
              <button 
                className={`btn-icon ${showTranslationOnly ? 'active' : ''}`}
                style={{ width: '36px', height: '36px' }}
                onClick={() => {
                  const nextVal = !showTranslationOnly;
                  setShowTranslationOnly(nextVal);
                  if (nextVal) {
                    setShowTargetOnly(false);
                  }
                }}
                title="Ocultar sentenças no idioma e mostrar traduções"
              >
                <MessageSquare size={16} />
              </button>

              {/* Quick speed selector cycle */}
              <button
                className="settings-btn"
                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                onClick={() => {
                  const speeds = [0.8, 1.0, 1.25, 1.5, 2.0];
                  const idx = speeds.indexOf(playbackSpeed);
                  const nextSpeed = speeds[(idx + 1) % speeds.length];
                  saveSpeed(nextSpeed);
                }}
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>

          {/* Sub-controls Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Filter Favorites */}
              <button 
                className={`btn-icon ${filterFavorites ? 'active' : ''}`}
                onClick={() => setFilterFavorites(prev => !prev)}
                title="Filtrar favoritos"
              >
                <Star size={16} fill={filterFavorites ? 'currentColor' : 'none'} />
              </button>

              {/* Reveal/Hide all translations toggle */}
              <button 
                className={`btn-icon ${revealAllTranslations ? 'active' : ''}`}
                onClick={() => {
                  const nextVal = !revealAllTranslations;
                  setRevealAllTranslations(nextVal);
                  
                  // Apply to all currently visible cards
                  const updated: Record<string, boolean> = {};
                  islandPhrases.forEach(p => {
                    updated[p.id] = nextVal;
                  });
                  setRevealedCards(updated);
                }}
                title="Revelar todas as traduções"
              >
                {revealAllTranslations ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Flashcards study mode */}
              <button 
                className={`btn-icon ${flashcardMode ? 'active' : ''}`}
                onClick={() => {
                  setFlashcardMode(prev => !prev);
                  setCurrentFlashcardIdx(0);
                  setIsFlashcardFlipped(false);
                }}
                title="Estudar como Flashcards"
              >
                <Layers size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Expandable Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: searchOpen ? 'var(--bg-tertiary)' : 'transparent', border: searchOpen ? '1px solid var(--border)' : 'none', padding: searchOpen ? '4px 10px' : '0', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}>
                {searchOpen && (
                  <input 
                    type="text"
                    placeholder="Buscar frase..."
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.8rem', width: '120px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                )}
                <button 
                  className={`btn-icon ${searchOpen ? 'active' : ''}`}
                  onClick={() => {
                    setSearchOpen(prev => !prev);
                    if (searchOpen) setSearchQuery('');
                  }}
                  title="Pesquisar frases"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Settings gear */}
              <button 
                className="btn-icon" 
                onClick={() => setSettingsOpen(true)}
                title="Configurações de prática"
              >
                <Settings size={16} />
              </button>

              {/* Toggle Stats/Tips Sidebar */}
              <button 
                className={`btn-icon ${statsSidebarOpen ? 'active' : ''}`}
                onClick={toggleStatsSidebar}
                title={statsSidebarOpen ? "Ocultar dicas e progresso" : "Mostrar dicas e progresso"}
              >
                <HelpCircle size={16} />
              </button>

              {/* Add Custom Phrase Button */}
              <button 
                className={`btn-icon ${addPhraseOpen ? 'active' : ''}`}
                onClick={() => setAddPhraseOpen(prev => !prev)}
                title="Adicionar nova frase"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
              >
                {addPhraseOpen ? <X size={16} /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          {/* Add custom phrase sliding card */}
          {addPhraseOpen && (
            <div className="glass-card scale-in" style={{ padding: '20px', border: '1px dashed var(--accent)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✍️ Adicionar Nova Frase
                </h4>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
                  <button 
                    type="button" 
                    className={`settings-btn ${addMode === 'single' ? 'active' : ''}`}
                    style={{ fontSize: '0.75rem', padding: '4px 8px', border: 'none' }}
                    onClick={() => setAddMode('single')}
                  >
                    Única
                  </button>
                  <button 
                    type="button" 
                    className={`settings-btn ${addMode === 'batch' ? 'active' : ''}`}
                    style={{ fontSize: '0.75rem', padding: '4px 8px', border: 'none' }}
                    onClick={() => setAddMode('batch')}
                  >
                    Lote
                  </button>
                </div>
              </div>

              {addMode === 'single' ? (
                <form onSubmit={handleAddPhrase} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Texto original ({getLanguageName(targetLanguage)})</label>
                    <input 
                      type="text"
                      className="input-text"
                      style={{ width: '100%' }}
                      placeholder="e.g. Can you speak slowly, please?"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Tradução em Português</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text"
                        className="input-text"
                        style={{ flex: 1 }}
                        placeholder="e.g. Você pode falar devagar, por favor?"
                        value={newTranslation}
                        onChange={(e) => setNewTranslation(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoTranslateText(newText, setNewTranslation)}
                        className="settings-btn"
                        disabled={isTranslating}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          height: '42px',
                        }}
                        title="Sugerir tradução automática"
                      >
                        {isTranslating ? (
                          <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid var(--text-secondary)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Languages size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Explicação (Opcional)</label>
                    <textarea 
                      className="input-text"
                      placeholder="e.g. slowly é um advérbio que significa devagar."
                      style={{ minHeight: '60px', resize: 'vertical', width: '100%' }}
                      value={newExplanation}
                      onChange={(e) => setNewExplanation(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '8px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Dificuldade</label>
                      <select 
                        className="input-text"
                        style={{ padding: '6px 8px', width: '100%' }}
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value as any)}
                      >
                        <option value="easy">Fácil</option>
                        <option value="medium">Médio</option>
                        <option value="hard">Difícil</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Voz da IA</label>
                      <select 
                        className="input-text"
                        style={{ padding: '6px 8px', width: '100%' }}
                        value={newVoice}
                        onChange={(e) => setNewVoice(e.target.value)}
                      >
                        <option value="Fenrir">Fenrir (Masc)</option>
                        <option value="Aoede">Aoede (Fem)</option>
                        <option value="Kore">Kore (Fem)</option>
                        <option value="Puck">Puck (Masc)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Velocidade</label>
                      <select 
                        className="input-text"
                        style={{ padding: '6px 8px', width: '100%' }}
                        value={newSpeed}
                        onChange={(e) => setNewSpeed(parseFloat(e.target.value))}
                      >
                        <option value="0.8">0.8x Lento</option>
                        <option value="1.0">1.0x Normal</option>
                        <option value="1.25">1.25x Rápido</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '10px' }}>
                    Adicionar à Ilha
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBatchImport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', margin: 0 }}>
                        Cole as sentenças (uma por linha) {parsedBatchItems.length > 0 && <span style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: '4px' }}>(Total: {parsedBatchItems.length} detectadas)</span>}
                      </label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input 
                          type="file" 
                          accept=".csv,.txt,.tsv" 
                          style={{ display: 'none' }} 
                          id="spreadsheet-file-input" 
                          onChange={handleSpreadsheetImport} 
                        />
                        <label 
                          htmlFor="spreadsheet-file-input" 
                          className="btn-icon" 
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                          title="Importar de arquivo de planilha (.csv, .tsv, .txt)"
                        >
                          <FileSpreadsheet size={14} style={{ color: 'var(--success)' }} />
                        </label>

                        <button 
                          type="button"
                          className="btn-icon" 
                          onClick={handleExportSpreadsheet}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                          title="Exportar frases desta ilha para planilha (.csv)"
                        >
                          <Download size={14} style={{ color: 'var(--accent)' }} />
                        </button>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                      padding: '4px 8px',
                      alignItems: 'stretch',
                      gap: '4px',
                      marginBottom: '12px'
                    }}>
                      {/* Left visual bullet-points gutter */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        paddingTop: '8px', // aligned with textarea padding
                        userSelect: 'none'
                      }}>
                        {Array.from({ length: linesCount }).map((_, idx) => (
                          <div 
                            key={idx} 
                            style={{
                              height: '24px', // aligned with line-height
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px'
                            }}
                          >
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent)',
                              opacity: 0.8
                            }} />
                          </div>
                        ))}
                      </div>

                      {/* Textarea itself */}
                      <textarea 
                        className="input-text"
                        placeholder="Can you speak slowly, please?; Você pode falar devagar, por favor?&#10;Thank you very much"
                        style={{ 
                          flex: 1,
                          minHeight: '260px', 
                          resize: 'vertical', 
                          fontFamily: 'monospace', 
                          fontSize: '0.85rem',
                          lineHeight: '24px', 
                          paddingTop: '8px',
                          paddingBottom: '8px',
                          paddingLeft: '8px',
                          margin: 0,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--text)',
                          boxShadow: 'none'
                        }}
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '10px' }}>
                    Importar em Lote
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Cards List Grid */}
          {flashcardMode ? (
            <div className="flashcard-mode-container">
              {islandPhrases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Nenhuma frase encontrada para praticar flashcards.
                </div>
              ) : currentFlashcardIdx >= islandPhrases.length ? (
                <div className="glass-card scale-in" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>🎉</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ilha Revisada!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                    Você revisou todas as {islandPhrases.length} frases desta ilha com sucesso.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setCurrentFlashcardIdx(0);
                        setIsFlashcardFlipped(false);
                      }}
                      style={{ padding: '10px 20px' }}
                    >
                      Revisar Novamente
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => setFlashcardMode(false)}
                      style={{ padding: '10px 20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                    >
                      Voltar para Lista
                    </button>
                  </div>
                </div>
              ) : (
                (() => {
                  const phrase = islandPhrases[currentFlashcardIdx];
                  const isCardPlaying = activePlayingId === phrase.id;
                  const isCardFavorite = favorites.includes(phrase.id);

                  const handleFlashcardRate = async (rating: 'easy' | 'medium' | 'hard') => {
                    await submitPracticeResult(phrase.id, rating);
                    const ratingStars = {
                      easy: 5,
                      medium: 3,
                      hard: 1
                    };
                    handleRateStars(phrase.id, ratingStars[rating]);
                    setIsFlashcardFlipped(false);
                    setTimeout(() => {
                      setCurrentFlashcardIdx(prev => prev + 1);
                    }, 200);
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          Card {currentFlashcardIdx + 1} de {islandPhrases.length}
                        </span>
                        <button 
                          onClick={() => setFlashcardMode(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Sair do modo flashcard"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div 
                        className={`flashcard-card ${isFlashcardFlipped ? 'flipped' : ''}`}
                        onClick={() => setIsFlashcardFlipped(prev => !prev)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flashcard-card-inner">
                          <div className="flashcard-card-front glass-card">
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>
                              Frase Original ({getLanguageName(phrase.language_id)})
                            </span>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                              <span className={`phrase-text-display ${getTextSizeClass()}`} style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {phrase.text}
                              </span>
                              
                              <button
                                onClick={(e) => { e.stopPropagation(); playAudioFile(phrase); }}
                                className="btn-icon"
                                style={{ 
                                  background: 'var(--accent-glow)', 
                                  border: 'none', 
                                  color: 'var(--accent)', 
                                  cursor: 'pointer', 
                                  borderRadius: '50%',
                                  width: '42px',
                                  height: '42px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: '10px',
                                  boxShadow: 'var(--shadow-sm)'
                                }}
                                title="Ouvir pronúncia"
                              >
                                <Volume2 size={20} />
                              </button>
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '20px' }}>
                              Toque no card para revelar a tradução
                            </div>
                          </div>

                          <div className="flashcard-card-back glass-card">
                            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>
                              Tradução e Detalhes
                            </span>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {phrase.translation}
                              </span>

                              {phrase.explanation && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '80%' }}>
                                  💡 {phrase.explanation}
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '20px' }}>
                              Toque para voltar à frase original
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
                        {isFlashcardFlipped ? (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFlashcardRate('hard'); }}
                              className="btn"
                              style={{ flex: 1, padding: '12px', background: 'var(--danger-glow)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: 700 }}
                            >
                              🔴 Difícil
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFlashcardRate('medium'); }}
                              className="btn"
                              style={{ flex: 1, padding: '12px', background: 'var(--warning-glow)', border: '1px solid var(--warning)', color: 'var(--warning)', fontWeight: 700 }}
                            >
                              🟡 Médio
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFlashcardRate('easy'); }}
                              className="btn"
                              style={{ flex: 1, padding: '12px', background: 'var(--success-glow)', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: 700 }}
                            >
                              🟢 Fácil
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsFlashcardFlipped(true)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                          >
                            Mostrar Tradução
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '0 10px' }}>
                        <button 
                          disabled={currentFlashcardIdx === 0}
                          onClick={() => {
                            setCurrentFlashcardIdx(prev => prev - 1);
                            setIsFlashcardFlipped(false);
                          }}
                          className="settings-btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: currentFlashcardIdx === 0 ? 0.4 : 1 }}
                        >
                          ◀ Anterior
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentFlashcardIdx(prev => prev + 1);
                            setIsFlashcardFlipped(false);
                          }}
                          className="settings-btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Pular ▶
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
            {islandPhrases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhuma frase encontrada com os filtros ativos.
              </div>
            ) : (
              islandPhrases.map((phrase, idx) => {
                const isCardPlaying = activePlayingId === phrase.id;
                const isCardFavorite = favorites.includes(phrase.id);
                const isCardRevealed = revealedCards[phrase.id] || false;
                const starsCount = phraseStars[phrase.id] || 0;

                if (editingPhraseId === phrase.id) {
                  return (
                    <form 
                      key={phrase.id}
                      onSubmit={handleSaveEdit}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--accent)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Editar Sentença</strong>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                          onClick={() => setEditingPhraseId(null)}
                        >

                          Cancelar
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Texto original</label>
                        <input 
                          type="text"
                          className="input-text"
                          style={{ width: '100%' }}
                          value={editPhraseText}
                          onChange={(e) => setEditPhraseText(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Tradução</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text"
                            className="input-text"
                            style={{ flex: 1 }}
                            value={editPhraseTranslation}
                            onChange={(e) => setEditPhraseTranslation(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleAutoTranslateText(editPhraseText, setEditPhraseTranslation)}
                            className="settings-btn"
                            disabled={isTranslating}
                            style={{
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              height: '42px',
                            }}
                            title="Sugerir tradução automática"
                          >
                            {isTranslating ? (
                              <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid var(--text-secondary)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Languages size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Explicação (Opcional)</label>
                        <textarea 
                          className="input-text"
                          style={{ minHeight: '50px', resize: 'vertical', width: '100%' }}
                          value={editPhraseExplanation}
                          onChange={(e) => setEditPhraseExplanation(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Mover para outra Ilha</label>
                        <select
                          className="input-text"
                          style={{ width: '100%', padding: '6px 8px' }}
                          value={transferIslandId}
                          onChange={(e) => setTransferIslandId(e.target.value)}
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} {cat.id === activeIslandId ? ' (Ilha Atual)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>
                          Salvar Alterações
                        </button>
                        <button 
                          type="button" 
                          className="btn" 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '0.85rem', 
                            background: 'var(--danger-glow, rgba(239, 68, 68, 0.15))', 
                            color: 'var(--danger, #ef4444)', 
                            border: '1px solid var(--danger, #ef4444)', 
                            borderRadius: 'var(--radius-md)', 
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                          onClick={() => {
                            if (window.confirm("Deseja mesmo excluir esta frase permanentemente?")) {
                              deletePhrase(phrase.id);
                              setEditingPhraseId(null);
                            }
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div 
                    key={phrase.id} 
                    id={`phrase-card-${phrase.id}`}
                    className={`phrase-list-card ${isCardPlaying ? 'playing' : ''}`}
                    onClick={() => handlePhraseCardClick(phrase, idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    
                    <div className="phrase-card-content-layout">
                      <div className="phrase-card-meta-group">
                        <span className="phrase-card-number">#{idx + 1}</span>

                        {/* Bookmark Favorite toggler */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(phrase.id); }}
                          style={{ background: 'none', border: 'none', color: isCardFavorite ? '#eab308' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        >
                          <Star size={14} fill={isCardFavorite ? '#eab308' : 'none'} />
                        </button>

                        {/* Edit Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit(phrase); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                          title="Editar frase"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>

                      {/* Play single phrase audio */}
                      <button 
                        className="phrase-card-play-btn"
                        onClick={(e) => { e.stopPropagation(); handlePhraseCardClick(phrase, idx); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isCardPlaying ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px'
                        }}
                      >
                        <Volume2 size={18} style={{ color: isCardPlaying ? 'var(--accent)' : 'var(--text-muted)' }} />
                      </button>

                      {/* Phrases Target Text and translation trigger */}
                      <div className="phrase-card-text-block">
                        {/* CASE 1: Show Target Only (Hide Translations) */}
                        {showTargetOnly && (
                          <>
                            <span className={`phrase-text-display ${getTextSizeClass()}`} style={{ fontWeight: 600, color: 'var(--text-primary)', transition: 'font-size 0.2s' }}>
                              {phrase.text}
                            </span>
                            {isCardRevealed ? (
                              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  {phrase.translation}
                                </span>
                                {phrase.explanation && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    💡 {phrase.explanation}
                                  </span>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleToggleReveal(phrase.id); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', width: 'fit-content' }}
                                  title="Ocultar tradução"
                                >
                                  <EyeOff size={15} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleReveal(phrase.id); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '0', width: 'fit-content' }}
                              >
                                <Eye size={13} /> <span style={{ textDecoration: 'underline' }}>Ver tradução</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* CASE 2: Show Translation Only (Hide Sentences) */}
                        {showTranslationOnly && (
                          <>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {phrase.translation}
                            </span>
                            {isCardRevealed ? (
                              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className={`phrase-text-display ${getTextSizeClass()}`} style={{ fontWeight: 600, color: 'var(--accent)', transition: 'font-size 0.2s' }}>
                                  {phrase.text}
                                </span>
                                {phrase.explanation && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    💡 {phrase.explanation}
                                  </span>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleToggleReveal(phrase.id); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: '0', width: 'fit-content' }}
                                >
                                  <EyeOff size={12} /> Ocultar sentença
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleReveal(phrase.id); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '0', width: 'fit-content' }}
                              >
                                <Eye size={13} /> <span style={{ textDecoration: 'underline' }}>Ver sentença</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* CASE 3: Normal Mode (Show both, reveal translation dynamically) */}
                        {!showTargetOnly && !showTranslationOnly && (
                          <>
                            <span className={`phrase-text-display ${getTextSizeClass()}`} style={{ fontWeight: 600, color: 'var(--text-primary)', transition: 'font-size 0.2s' }}>
                              {phrase.text}
                            </span>

                            {isCardRevealed ? (
                              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  {phrase.translation}
                                </span>
                                {phrase.explanation && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    💡 {phrase.explanation}
                                  </span>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleToggleReveal(phrase.id); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', width: 'fit-content', marginTop: '2px' }}
                                  title="Ocultar tradução"
                                >
                                  <EyeOff size={15} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleReveal(phrase.id); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', width: 'fit-content', textAlign: 'left', padding: '0' }}
                              >
                                Toque para revelar
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Right corner 5-star ratings */}
                      <div className="phrase-stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            size={16}
                            className={`phrase-star ${star <= starsCount ? 'active' : ''}`}
                            fill={star <= starsCount ? 'currentColor' : 'none'}
                            onClick={(e) => { e.stopPropagation(); handleRateStars(phrase.id, star); }}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
          )}

        </div>

        {/* Right Side: Statistics & Shadowing Technique (Desktop-only) */}
        {statsSidebarOpen && (
          <div className="practice-stats-panel">
            
            {/* Hoje vs Total Selector */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: '4px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              border: '1px solid var(--border)'
            }}>
              <button 
                className={`settings-btn ${statsPeriod === 'today' ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-full)', border: 'none', padding: '6px' }}
                onClick={() => setStatsPeriod('today')}
              >
                📅 Hoje
              </button>
              <button 
                className={`settings-btn ${statsPeriod === 'total' ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-full)', border: 'none', padding: '6px' }}
                onClick={() => setStatsPeriod('total')}
              >
                ♾️ Total
              </button>
            </div>

            {/* Stats Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Box 1: Practiced */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>{stats.practiced}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Praticado</span>
              </div>
              
              {/* Box 2: Reps */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{stats.reps}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Reps</span>
              </div>

              {/* Box 3: Mastered */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>{stats.mastered}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Dominados</span>
              </div>
            </div>

            {/* Progress chart representation */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Acompanhe seu progresso</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {islandPhrases.length > 0 ? Math.round((stats.practiced / islandPhrases.length) * 100) : 0}%
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--accent)',
                  width: `${islandPhrases.length > 0 ? (stats.practiced / islandPhrases.length) * 100 : 0}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            {/* RESUMO Card */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>
                ⚡ RESUMO: Máximo resultado, mínimo tempo
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '6px' }}>
                  <span>🎧</span>
                  <span><strong>Shadowing</strong>: ouça, pause e repita até ficar fluente. Avalie com estrelas.</span>
                </li>
                <li style={{ display: 'flex', gap: '6px' }}>
                  <span>🧠</span>
                  <span><strong>Recordação ativa</strong>: traduza em voz alta a partir do seu idioma nativo. Avalie.</span>
                </li>
                <li style={{ display: 'flex', gap: '6px' }}>
                  <span>📁</span>
                  <span>Faça uso dos filtros e coleções para agrupar frases específicas.</span>
                </li>
                <li style={{ display: 'flex', gap: '6px' }}>
                  <span>✍️</span>
                  <span>Personalize: importe seu próprio conteúdo para prática sob medida.</span>
                </li>
                <li style={{ display: 'flex', gap: '6px' }}>
                  <span>⚙️</span>
                  <span>Personalize: ajuste velocidade do áudio, repetições e pausas nas Configurações.</span>
                </li>
              </ul>
            </div>

            {/* TÉCNICA Card */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success)' }}>
                📚 TÉCNICA: Shadowing e repetição
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Combine ritmo e entonação nativos ouvindo e repetindo frases inteiras em voz alta. Mesmo 5-10 minutos diários de shadowing aceleram fluência e pronúncia.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* 3. Practice Settings Modal Overlay (Screenshot 2) */}
      {settingsOpen && (
        <div className="practice-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="practice-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                }}>
                  <Settings size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Configurações de prática</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Personalize repetições, pausas e reprodução</span>
                </div>
              </div>

              <button 
                onClick={() => setSettingsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="practice-modal-body">
              
              {/* Option 1: Repetitions */}
              <div className="settings-option-group">
                <span className="settings-option-title">Repetições por frase</span>
                <div className="settings-buttons-row">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button 
                      key={num}
                      className={`settings-btn ${repetitions === num ? 'active' : ''}`}
                      onClick={() => saveRepetitions(num)}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Pause duration */}
              <div className="settings-option-group">
                <span className="settings-option-title">Duração da pausa</span>
                <div className="settings-buttons-row">
                  {[0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7].map((seconds) => (
                    <button 
                      key={seconds}
                      className={`settings-btn ${pauseDuration === seconds ? 'active' : ''}`}
                      onClick={() => savePause(seconds)}
                    >
                      {seconds}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Playback speed */}
              <div className="settings-option-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="settings-option-title">Velocidade de reprodução</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {playbackSpeed === 1.0 ? '1x Normal' : `${playbackSpeed}x`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0' }}>
                  <input 
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.25"
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    value={playbackSpeed}
                    onChange={(e) => saveSpeed(parseFloat(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>1.5x</span>
                    <span>2x</span>
                  </div>
                </div>
              </div>

              {/* Option 4: Text Size */}
              <div className="settings-option-group">
                <span className="settings-option-title">Tamanho do texto</span>
                <div className="settings-buttons-row">
                  {(['A-', 'A', 'A+', 'A++'] as const).map((size) => (
                    <button 
                      key={size}
                      className={`settings-btn ${textSize === size ? 'active' : ''}`}
                      onClick={() => saveSize(size)}
                      style={{ fontSize: size === 'A-' ? '0.75rem' : size === 'A' ? '0.85rem' : size === 'A+' ? '1rem' : '1.15rem', padding: '6px 12px' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 5: Sort order */}
              <div className="settings-option-group">
                <span className="settings-option-title">Ordenar por dificuldade</span>
                <select 
                  className="input-text"
                  style={{ width: '100%', padding: '10px 12px', fontSize: '0.85rem' }}
                  value={sortOrder}
                  onChange={(e) => saveSort(e.target.value)}
                >
                  <option value="original">Ordem original</option>
                  <option value="easy_first">Fácil primeiro</option>
                  <option value="hard_first">Difícil primeiro</option>
                </select>
              </div>

              {/* Offline & Download Section */}
              <div className="settings-option-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="settings-option-title">Downloads e Estudo Offline</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Action 1: Download Combined Audio */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setSettingsOpen(false);
                      handleDownloadCombinedAudio();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'var(--accent)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <Download size={16} />
                    Baixar Áudio Único da Ilha ({repetitions}x reps)
                  </button>

                  {/* Action 2: Download for Offline Mode */}
                  {isOfflineCached ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setSettingsOpen(false);
                        removeIslandOffline();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid var(--danger, #ef4444)',
                        color: 'var(--danger, #ef4444)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <Trash2 size={16} />
                      Remover Áudios Offline
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setSettingsOpen(false);
                        downloadIslandForOffline();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',

                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <Sparkles size={16} style={{ color: 'var(--success)' }} />
                      Salvar para Ouvir Offline
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Floating Progress Overlay */}
      {(downloadProgress || offlineProgress) && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '280px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Processando Áudio
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {downloadProgress || offlineProgress}
          </span>
          <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden', marginTop: '4px', position: 'relative' }}>
            <div style={{ height: '100%', background: 'var(--accent)', width: '40%', borderRadius: '999px', animation: 'loadingBar 1.5s infinite ease-in-out' }} />
          </div>
          <style>{`
            @keyframes loadingBar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PracticeSession;
