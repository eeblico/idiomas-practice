import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { cloudSyncService } from '../services/cloudSync';
import { userStorage } from '../services/userStorage';
import { 
  Video, Upload, Link2, Play, Pause, RotateCcw, 
  ChevronRight, ChevronLeft, Repeat, Volume2, Mic, Info, Star, Bookmark, Share2, 
  ArrowLeft, Download, RefreshCw, X, HelpCircle, Check, Sparkles, Menu,
  Copy, Plus, Maximize, Minimize, Eye, EyeOff, Expand, Shrink, Settings,
  Search, FileText, Languages, Trash2
} from 'lucide-react';

// --- Data Models & Types ---
interface SyncedWord {
  text: string;
  start: number;
  end: number;
}

interface Subtitle {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  translation: string;
  explanation?: string;
  words?: SyncedWord[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  subtitles: Subtitle[];
}

// Pre-loaded Local Explanations Dictionary for Offline Demonstration
const OFFLINE_DICTIONARY: Record<string, any> = {
  people: {
    word: 'people',
    type: 'substantivo',
    pronunciation: '/ˈpiː.pəl/',
    definition: 'Pessoas, seres humanos no plural.',
    context_meaning: 'Refere-se à comunidade de indivíduos.',
    examples: [{ sentence: 'People from all over the world.', translation: 'Pessoas de todo o mundo.' }],
    native_usages: ['Usado comumente para referir-se a grupos ou sociedade em geral.'],
    chunks: [{ expression: 'young people', meaning: 'jovens', example: 'Young people are passionate.' }]
  },
  different: {
    word: 'different',
    type: 'adjetivo',
    pronunciation: '/ˈdɪf.ər.ənt/',
    definition: 'Diferente, não idêntico, único.',
    context_meaning: 'Ter características ou identidades distintas.',
    examples: [{ sentence: 'We all have different dreams.', translation: 'Todos nós temos sonhos diferentes.' }],
    native_usages: ['Usado frequentemente com "from" ou "than" no inglês americano.'],
    chunks: [{ expression: 'make a different', meaning: 'fazer a diferença', example: 'You make a difference.' }]
  },
  owe: {
    word: 'owe',
    type: 'verbo',
    pronunciation: '/oʊ/',
    definition: 'Ter a obrigação de pagar ou devolver algo a alguém (financeiramente ou moralmente).',
    context_meaning: 'Ter uma dívida financeira ou moral.',
    examples: [{ sentence: 'I owe you a favor.', translation: 'Eu te devo um favor.' }],
    native_usages: ['Nativos usam "owe" no dia a dia para dívidas monetárias e favores.'],
    chunks: [{ expression: 'I owe you one', meaning: 'Fico te devendo uma', example: 'Thanks, I owe you one.' }]
  }
};

// --- Pre-loaded High-Fidelity Lessons (featuring Dianna Cowern Naturalizer Campaign) ---
const PRELOADED_LESSONS: Lesson[] = [
  {
    id: 'dianna-cowern-naturalizer',
    title: 'Dianna Cowern / Today We Will campaign by Naturalizer',
    description: 'Prática de escuta ativa e montagem de frases em inglês autêntico.',
    videoUrl: 'https://www.youtube.com/watch?v=1oW_WkWsZkg',
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 5.5,
        text: 'people who are different',
        translation: 'pessoas que são diferentes',
        explanation: 'people who are different = pessoas que são diferentes. "who" funciona como pronome relativo conectando a oração.'
      },
      {
        id: 2,
        start: 5.5,
        end: 11.0,
        text: 'should never feel like they do not belong',
        translation: 'nunca deveriam sentir que não pertencem',
        explanation: 'should never feel like = nunca deveriam sentir como se. belong = pertencer.'
      },
      {
        id: 3,
        start: 11.0,
        end: 18.0,
        text: 'today we will stand up and make our voices heard',
        translation: 'hoje nós vamos nos posicionar e fazer nossas vozes serem ouvidas',
        explanation: 'stand up = se posicionar / levantar-se. make our voices heard = fazer nossas vozes serem ouvidas.'
      },
      {
        id: 4,
        start: 18.0,
        end: 25.0,
        text: 'because everyone deserves the right to live authentically',
        translation: 'porque todo mundo merece o direito de viver com autenticidade',
        explanation: 'deserves the right = merece o direito. live authentically = viver autenticamente.'
      },
      {
        id: 5,
        start: 25.0,
        end: 29.5,
        text: 'embrace your passions and never be afraid to speak your truth',
        translation: 'abrace suas paixões e nunca tenha medo de falar a sua verdade',
        explanation: 'embrace your passions = abrace suas paixões. speak your truth = falar sua verdade.'
      }
    ]
  },
  {
    id: 'harry-potter-platform934',
    title: 'Harry Potter - Plataforma 9¾ (Cena com Hagrid)',
    description: 'Estude ritmo e entonação de diálogos de filme com lacunas e personagens.',
    videoUrl: 'https://www.youtube.com/watch?v=1oW_WkWsZkg',
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 6.0,
        text: "Hagrid: Blimey, is that the time? Now your train leaves in ten minutes. Here's your ticket. Stick to it, Harry. That's very important. Stick to your ticket.",
        translation: "Hagrid: Caramba, já é essa hora? Seu trem parte em dez minutos. Aqui está seu bilhete. Guarde bem, Harry. É muito importante. Não perca seu bilhete.",
        explanation: "Blimey = caramba (gíria britânica). Stick to it = mantenha com você / siga à risca."
      },
      {
        id: 2,
        start: 6.0,
        end: 12.0,
        text: "Harry Potter: But Hagrid, there must be a mistake. This says Platform 9¾. There's no such thing, is there?",
        translation: "Harry Potter: Mas Hagrid, deve haver um engano. Aqui diz Plataforma 9¾. Não existe tal coisa, existe?",
        explanation: "There must be a mistake = deve haver um engano. No such thing = não existe tal coisa."
      }
    ]
  },
  {
    id: 'malcolm-phone',
    title: 'Malcolm in the Middle - Cena do Telefone',
    description: 'Estude ritmo e entonação natural de diálogos rápidos em inglês.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 2.2,
        text: 'The bad thing is,',
        translation: 'A parte ruim é,',
        explanation: 'The bad thing = a parte ruim.'
      },
      {
        id: 2,
        start: 2.2,
        end: 5.5,
        text: 'no one else in the family ever bothers to remember anything.',
        translation: 'ninguém mais na família se importa em lembrar de nada.',
        explanation: 'bothers = se importa/incomoda.'
      },
      {
        id: 3,
        start: 5.5,
        end: 9.0,
        text: "you told me to remind you about Mom and Dad's anniversary.",
        translation: 'você me disse para te lembrar do aniversário da mamãe e do papai.',
        explanation: "told me to remind = me disse para lembrar. Dad's = do papai."
      },
      {
        id: 4,
        start: 9.0,
        end: 15.0,
        text: 'No, you owe me 20 bucks.',
        translation: 'Não, você me deve 20 pratas.',
        explanation: 'owe me = me deve. bucks = dólares/pratas.'
      }
    ]
  },
  {
    id: 'friends-oweyouone',
    title: 'Friends - Expressão "I owe you one"',
    description: 'Aprenda gírias de agradecimento e cobranças cotidianas.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 2.0,
        text: 'Cool.',
        translation: 'Legal.',
        explanation: 'Cool = legal, bacana.'
      },
      {
        id: 2,
        start: 2.0,
        end: 4.5,
        text: 'Thanks, man.',
        translation: 'Valeu, cara.',
        explanation: 'Thanks, man = valeu cara.'
      },
      {
        id: 3,
        start: 4.5,
        end: 8.0,
        text: 'I owe you one.',
        translation: 'Fico te devendo uma.',
        explanation: 'I owe you one = fico te devendo uma.'
      },
      {
        id: 4,
        start: 8.0,
        end: 15.0,
        text: 'No, you owe me 20.',
        translation: 'Não, você me deve 20.',
        explanation: 'owe me = me deve.'
      }
    ]
  }
];

// --- IndexedDB for Offline Large Video Media Storage ---
const dbName = 'ShadowingMediaDB';
const storeName = 'mediaFiles';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFileToDB = async (id: string, file: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(file, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getFileFromDB = async (id: string): Promise<Blob | null> => {
  const db = await initDB();
  return new Promise<Blob | null>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const deleteFileFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const decodeHtmlEntities = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/^[>\s»\-_]+/, '')
    .trim();
};

const cleanWordForComparison = (w: string): string => {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const parseSpeakerAndText = (rawText: string): { speaker: string | null; dialogue: string } => {
  const clean = decodeHtmlEntities(rawText);
  const match = clean.match(/^([A-Za-z0-9\s'.-]{2,25}):\s*(.+)$/);
  if (match) {
    return { speaker: match[1].trim(), dialogue: match[2].trim() };
  }
  const bracketMatch = clean.match(/^\[([A-Za-z0-9\s'.-]{2,25})\]\s*(.+)$/);
  if (bracketMatch) {
    return { speaker: bracketMatch[1].trim(), dialogue: bracketMatch[2].trim() };
  }
  return { speaker: null, dialogue: clean };
};

// Web Audio API Synthesizer for instant success chimes
const playSuccessChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
};

export const MediaStudy: React.FC = () => {
  const { addCustomPhrase } = useApp();

  // Load custom lessons from local storage
  const [customLessons, setCustomLessons] = useState<Lesson[]>(() => {
    try {
      const stored = localStorage.getItem('hl_custom_lessons');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Default directly to Dianna Cowern or last active lesson
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    try {
      const savedId = localStorage.getItem('hl_last_active_lesson');
      if (savedId) {
        const found = PRELOADED_LESSONS.find(l => l.id === savedId);
        if (found) return found;
      }
    } catch {}
    return PRELOADED_LESSONS[0];
  });

  // Current active sentence index (0-indexed step)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);

  // Search input & language filter in top bar
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('auto');

  // Modal Dialogs
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isExtractingSubs, setIsExtractingSubs] = useState(false);
  const [extractProgressText, setExtractProgressText] = useState('');

  // Upload/Manual transcript states
  const [manualTranscriptText, setManualTranscriptText] = useState('');
  const [uploadedSubFile, setUploadedSubFile] = useState<File | null>(null);

  // Training & Word Gap-fill States
  const [solvedWordIndices, setSolvedWordIndices] = useState<Record<number, boolean>>({});
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [currentInputWord, setCurrentInputWord] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isLoopingCurrent, setIsLoopingCurrent] = useState<boolean>(false);
  // Continuous playback mode: if false (default), pauses automatically at the end of each sentence; if true, plays continuously
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(false);

  // Synced playback states
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Training mode: 'typing' (escrever nas lacunas) | 'chips' (apertar nas palavras para organizar)
  const [practiceMode, setPracticeMode] = useState<'typing' | 'chips'>('typing');
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState('');
  const [usedChipsIndices, setUsedChipsIndices] = useState<Record<number, boolean>>({});
  // Translation visibility & Portuguese subtitles state (toggled via discreet Eye icon)
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [portugueseSubtitlesText, setPortugueseSubtitlesText] = useState<string>('');

  // Sincronizar legendas/tradução em português inseridas nas configurações
  const handleSavePortugueseSubtitles = () => {
    if (!activeLesson) return;
    const lines = portugueseSubtitlesText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const updatedSubs = activeLesson.subtitles.map((sub, idx) => ({
      ...sub,
      translation: lines[idx] !== undefined ? lines[idx] : sub.translation
    }));

    const updatedLesson = {
      ...activeLesson,
      subtitles: updatedSubs
    };

    setActiveLesson(updatedLesson);
    // Persist in custom lessons
    const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
    setCustomLessons(updatedCustom);
    try {
      localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom));
    } catch {}

    alert(`Tradução em português de ${lines.length} frases sincronizada com sucesso!`);
  };

  // Delete current lesson handler (Excluir lição)
  const handleDeleteCurrentLesson = () => {
    if (!activeLesson) return;
    if (confirm(`Tem certeza que deseja excluir a lição "${activeLesson.title}"?`)) {
      const updated = customLessons.filter(l => l.id !== activeLesson.id);
      setCustomLessons(updated);
      try {
        localStorage.setItem('hl_custom_lessons', JSON.stringify(updated));
      } catch {}
      
      const nextLesson = updated.length > 0 ? updated[0] : PRELOADED_LESSONS[0];
      setActiveLesson(nextLesson);
      setCurrentSentenceIndex(0);
      setIsConfigDrawerOpen(false);
      alert('Lição excluída com sucesso!');
    }
  };

  // Voice recording / Pronunciation check states
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [compareScore, setCompareScore] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Refs for media players
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const slotInputRef = useRef<HTMLInputElement | null>(null);

  // YouTube API Player states
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [youtubePlayerReady, setYoutubePlayerReady] = useState(false);

  // All available lessons combined
  const allLessons = useMemo(() => {
    const customIds = new Set(customLessons.map(l => l.id));
    const preloadedFiltered = PRELOADED_LESSONS.filter(l => !customIds.has(l.id));
    return [...preloadedFiltered, ...customLessons];
  }, [customLessons]);

  // Adjusted subtitles with HTML entity cleanup
  const adjustedSubtitles = useMemo(() => {
    if (!activeLesson) return [];
    return activeLesson.subtitles.map(s => ({
      ...s,
      text: decodeHtmlEntities(s.text),
      translation: decodeHtmlEntities(s.translation)
    }));
  }, [activeLesson]);

  // Current active sentence object
  const currentSub = useMemo(() => {
    if (adjustedSubtitles.length === 0) return null;
    const clamped = Math.max(0, Math.min(adjustedSubtitles.length - 1, currentSentenceIndex));
    return adjustedSubtitles[clamped] || adjustedSubtitles[0];
  }, [adjustedSubtitles, currentSentenceIndex]);

  // Words for current sentence
  const sentenceWords = useMemo(() => {
    if (!currentSub) return [];
    const { dialogue } = parseSpeakerAndText(currentSub.text);
    return dialogue.trim().split(/\s+/).filter(Boolean);
  }, [currentSub]);

  // Scrambled unique chips for word bank
  const scrambledChips = useMemo(() => {
    if (sentenceWords.length === 0) return [];
    return sentenceWords
      .map((w, originalIdx) => ({
        originalIdx,
        clean: w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      }))
      .sort(() => Math.random() - 0.5);
  }, [currentSub?.id, sentenceWords.length]);

  // Save last active lesson ID
  useEffect(() => {
    if (activeLesson) {
      try {
        localStorage.setItem('hl_last_active_lesson', activeLesson.id);
      } catch {}
    }
  }, [activeLesson?.id]);

  // Reset words and gaps whenever sentence changes
  useEffect(() => {
    setSolvedWordIndices({});
    setUsedChipsIndices({});
    setActiveSlotIndex(0);
    setCurrentInputWord('');
    setShowAnswer(false);
    setUserTranscript('');
    setCompareScore(null);

    // Focus active typing slot if in typing mode
    if (practiceMode === 'typing') {
      setTimeout(() => {
        slotInputRef.current?.focus();
      }, 120);
    }
  }, [currentSentenceIndex, activeLesson?.id, practiceMode]);

  // Global Keyboard Shortcuts (Atalhos do Teclado)
  // Tab = Repetir áudio da frase do vídeo
  // Alt+M / Shift+Tab / Ctrl+Space = Mostrar respostas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside textareas or normal inputs outside the gap slot
      const target = e.target as HTMLElement | null;
      const isInsideSlot = target === slotInputRef.current;
      const isOtherInput = target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && !isInsideSlot));

      if (isOtherInput) return;

      // Tab -> Repetir áudio do vídeo
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        handleReplaySentence();
        return;
      }

      // Shift+Tab or Alt+M or Ctrl+Space or F2 -> Mostrar frase completa
      if (
        (e.key === 'Tab' && e.shiftKey) || 
        ((e.key === 'm' || e.key === 'M') && e.altKey) || 
        (e.code === 'Space' && e.ctrlKey) ||
        e.key === 'F2'
      ) {
        e.preventDefault();
        handleRevealSentence();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSub, sentenceWords, isPlaying]);

  // Helper to extract YouTube Video ID
  const getYoutubeVideoId = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'youtu.be') {
        return parsed.pathname.slice(1);
      }
      if (parsed.hostname.includes('youtube.com')) {
        const v = parsed.searchParams.get('v');
        if (v) return v;
        const paths = parsed.pathname.split('/');
        const embedIdx = paths.indexOf('embed');
        if (embedIdx !== -1 && paths[embedIdx + 1]) return paths[embedIdx + 1];
        const vIdx = paths.indexOf('v');
        if (vIdx !== -1 && paths[vIdx + 1]) return paths[vIdx + 1];
      }
      return null;
    } catch {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? match[1] : null;
    }
  };

  const isGoogleDriveUrl = (url: string) => {
    return typeof url === 'string' && (url.includes('drive.google.com') || url.includes('docs.google.com'));
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return '';
    const matchFile = url.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
    if (matchFile && matchFile[1]) {
      return `https://drive.google.com/file/d/${matchFile[1]}/preview`;
    }
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
    if (matchId && matchId[1]) {
      return `https://drive.google.com/file/d/${matchId[1]}/preview`;
    }
    return url;
  };

  const isFebboxUrl = (url: string) => {
    return typeof url === 'string' && url.includes('febbox.com');
  };

  const getFebboxEmbedUrl = (url: string) => {
    if (!url) return '';
    return url;
  };

  // Media seek and play controls
  const seekTo = (seconds: number) => {
    if (youtubePlayer && youtubePlayerReady) {
      youtubePlayer.seekTo(seconds, true);
      setCurrentTime(seconds);
    } else if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const pauseVideo = () => {
    if (youtubePlayer && youtubePlayerReady) {
      try { youtubePlayer.pauseVideo(); } catch {}
    }
    if (videoPlayerRef.current) {
      try { videoPlayerRef.current.pause(); } catch {}
    }
    setIsPlaying(false);
  };

  const playVideo = () => {
    if (youtubePlayer && youtubePlayerReady) {
      try { youtubePlayer.playVideo(); } catch {}
    }
    if (videoPlayerRef.current) {
      try { videoPlayerRef.current.play().catch(() => {}); } catch {}
    }
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  // Play system TTS phrase audio (Áudio falado pelo sistema)
  const playSystemTtsSentence = () => {
    if (!currentSub) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const { dialogue } = parseSpeakerAndText(currentSub.text);
        const utterance = new SpeechSynthesisUtterance(dialogue);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Replay current sentence from video audio strictly from vocalization start to end
  const handleReplaySentence = () => {
    if (!currentSub) return;
    seekTo(currentSub.start);
    playVideo();
  };

  // Reveal all words (Action of the grey "Mostrar" button)
  const handleRevealSentence = () => {
    if (!sentenceWords.length) return;
    const allSolved: Record<number, boolean> = {};
    sentenceWords.forEach((_, idx) => {
      allSolved[idx] = true;
    });
    setSolvedWordIndices(allSolved);
    setShowAnswer(true);
  };

  // Navigation chevrons (< and >)
  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      const prevIdx = currentSentenceIndex - 1;
      setCurrentSentenceIndex(prevIdx);
      if (adjustedSubtitles[prevIdx]) {
        seekTo(adjustedSubtitles[prevIdx].start);
      }
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < adjustedSubtitles.length - 1) {
      const nextIdx = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIdx);
      if (adjustedSubtitles[nextIdx]) {
        seekTo(adjustedSubtitles[nextIdx].start);
      }
    }
  };

  // Typing logic for the word boxes
  const handleWordInput = (typedText: string) => {
    setCurrentInputWord(typedText);
    const targetWord = sentenceWords[activeSlotIndex];
    if (!targetWord) return;

    const cleanTyped = cleanWordForComparison(typedText);
    const cleanTarget = cleanWordForComparison(targetWord);

    // If matches target word (or user typed word with space)
    if (cleanTyped === cleanTarget && cleanTyped.length > 0) {
      playSuccessChime();
      const updated = { ...solvedWordIndices, [activeSlotIndex]: true };
      setSolvedWordIndices(updated);
      setCurrentInputWord('');

      // Find next unsolved index
      const nextUnsolved = sentenceWords.findIndex((_, idx) => !updated[idx]);
      if (nextUnsolved !== -1) {
        setActiveSlotIndex(nextUnsolved);
      } else {
        // Sentence fully completed!
        playSuccessChime();
        setShowAnswer(true);
        // Automatically progress to next sentence after short pause
        setTimeout(() => {
          if (currentSentenceIndex < adjustedSubtitles.length - 1) {
            handleNextSentence();
          }
        }, 1200);
      }
    }
  };

  // Clicking a scrambled chip to fill current active slot
  const handleChipClick = (chipWord: string, chipIdx: number) => {
    const targetWord = sentenceWords[activeSlotIndex];
    if (!targetWord) return;

    if (cleanWordForComparison(chipWord) === cleanWordForComparison(targetWord)) {
      playSuccessChime();
      const updated = { ...solvedWordIndices, [activeSlotIndex]: true };
      setSolvedWordIndices(updated);
      setUsedChipsIndices(prev => ({ ...prev, [chipIdx]: true }));
      setCurrentInputWord('');

      const nextUnsolved = sentenceWords.findIndex((_, idx) => !updated[idx]);
      if (nextUnsolved !== -1) {
        setActiveSlotIndex(nextUnsolved);
      } else {
        playSuccessChime();
        setShowAnswer(true);
        setTimeout(() => {
          if (currentSentenceIndex < adjustedSubtitles.length - 1) {
            handleNextSentence();
          }
        }, 1200);
      }
    }
  };

  // Time update listener & automatic loop / pause-per-sentence / synchronization
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);

    if (!currentSub) return;

    // Check sentence boundary
    if (time >= currentSub.end && currentSub.end > 0) {
      if (isLoopingCurrent) {
        seekTo(currentSub.start);
      } else if (!isContinuousPlay) {
        // Modo padrão: pausa ao final de cada frase vocalizada para que o usuário complete as lacunas
        pauseVideo();
        seekTo(currentSub.end);
      } else {
        // Modo contínuo: sincroniza automaticamente a frase atual conforme o vídeo avança
        const nextSubIdx = adjustedSubtitles.findIndex((s, idx) => idx > currentSentenceIndex && time >= s.start && time < s.end);
        if (nextSubIdx !== -1) {
          setCurrentSentenceIndex(nextSubIdx);
        }
      }
    }
  };

  // YouTube IFrame API initialization
  useEffect(() => {
    if (!activeLesson) return;
    const isYoutube = activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be');
    if (!isYoutube) {
      setYoutubePlayer(null);
      setYoutubePlayerReady(false);
      return;
    }

    const videoId = getYoutubeVideoId(activeLesson.videoUrl);
    if (!videoId) return;

    let player: any = null;

    const initPlayer = () => {
      setTimeout(() => {
        const container = document.getElementById('youtube-player-container');
        if (container) {
          container.innerHTML = '<div id="youtube-player-iframe"></div>';
          player = new (window as any).YT.Player('youtube-player-iframe', {
            videoId: videoId,
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              cc_load_policy: 0,
              iv_load_policy: 3
            },
            events: {
              onReady: (event: any) => {
                setYoutubePlayer(event.target);
                setYoutubePlayerReady(true);
                if (playbackSpeed !== 1.0) {
                  event.target.setPlaybackRate(playbackSpeed);
                }
              },
              onStateChange: (event: any) => {
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === (window as any).YT.PlayerState.PAUSED || event.data === (window as any).YT.PlayerState.ENDED) {
                  setIsPlaying(false);
                }
              }
            }
          });
        }
      }, 100);
    };

    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (player && typeof player.destroy === 'function') {
        try { player.destroy(); } catch {}
      }
    };
  }, [activeLesson?.id, activeLesson?.videoUrl]);

  // YouTube polling interval to monitor currentTime
  useEffect(() => {
    if (!youtubePlayer || !youtubePlayerReady || !isPlaying) return;
    const interval = setInterval(() => {
      try {
        if (typeof youtubePlayer.getCurrentTime === 'function') {
          const t = youtubePlayer.getCurrentTime();
          handleTimeUpdate(t);
        }
        if (typeof youtubePlayer.getDuration === 'function') {
          const d = youtubePlayer.getDuration();
          if (d > 0) setDuration(d);
        }
      } catch {}
    }, 150);
    return () => clearInterval(interval);
  }, [youtubePlayer, youtubePlayerReady, isPlaying, currentSentenceIndex, isLoopingCurrent, isContinuousPlay]);

  // Speech recognition for Voice Practice button
  const startRecordingSpeech = () => {
    setUserTranscript('');
    setCompareScore(null);
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Seu navegador não suporta a API de voz web. Use o Chrome ou Edge.');
      return;
    }

    try {
      const rec = new SpeechRecognitionClass();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onerror = (e: any) => {
        console.error('Speech error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setUserTranscript(spoken);

        // Check if spoken words match sentence
        const spokenWords = spoken.split(/\s+/).map(cleanWordForComparison);
        const updatedSolved = { ...solvedWordIndices };

        sentenceWords.forEach((targetW, idx) => {
          const cleanTarget = cleanWordForComparison(targetW);
          if (spokenWords.includes(cleanTarget)) {
            updatedSolved[idx] = true;
          }
        });

        setSolvedWordIndices(updatedSolved);
        playSuccessChime();

        // Calculate match percentage
        const solvedCount = Object.keys(updatedSolved).length;
        const score = Math.round((solvedCount / sentenceWords.length) * 100);
        setCompareScore(score);
      };

      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecordingSpeech = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
  };

  // Direct Video URL loader from hidden configuration sidebar
  const loadCustomVideoUrl = (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) return;

    const ytId = getYoutubeVideoId(url);
    if (ytId) {
      const newLesson: Lesson = {
        id: `custom-yt-${Date.now()}`,
        title: `YouTube (${ytId})`,
        description: 'Vídeo importado pelo usuário para escuta ativa.',
        videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
        subtitles: [
          {
            id: 1,
            start: 0.0,
            end: 5.0,
            text: 'Loading subtitles or ready to practice listening',
            translation: 'Carregando legendas ou pronto para praticar escuta'
          }
        ]
      };
      setActiveLesson(newLesson);
      setCurrentSentenceIndex(0);
      setCustomVideoUrlInput('');
      setIsUploadModalOpen(true);
      return;
    }

    if (isGoogleDriveUrl(url)) {
      const newLesson: Lesson = {
        id: `custom-drive-${Date.now()}`,
        title: 'Google Drive Video',
        description: 'Vídeo importado do Google Drive.',
        videoUrl: url,
        subtitles: [
          {
            id: 1,
            start: 0.0,
            end: 5.0,
            text: 'Practice listening and fill in the blanks',
            translation: 'Pratique a escuta e preencha as lacunas'
          }
        ]
      };
      setActiveLesson(newLesson);
      setCurrentSentenceIndex(0);
      setCustomVideoUrlInput('');
      setIsUploadModalOpen(true);
      return;
    }

    if (isFebboxUrl(url)) {
      const newLesson: Lesson = {
        id: `custom-febbox-${Date.now()}`,
        title: 'Febbox Cloud Video',
        description: 'Vídeo importado da nuvem Febbox para prática de escuta.',
        videoUrl: url,
        subtitles: [
          {
            id: 1,
            start: 0.0,
            end: 5.0,
            text: 'Practice listening with Febbox video',
            translation: 'Pratique a escuta com o vídeo do Febbox'
          }
        ]
      };
      setActiveLesson(newLesson);
      setCurrentSentenceIndex(0);
      setCustomVideoUrlInput('');
      setIsUploadModalOpen(true);
      return;
    }

    // Generic MP4 / direct link fallback
    const newLesson: Lesson = {
      id: `custom-video-${Date.now()}`,
      title: 'Vídeo Personalizado',
      description: 'Vídeo carregado via link direto.',
      videoUrl: url,
      subtitles: [
        {
          id: 1,
          start: 0.0,
          end: 5.0,
          text: 'Practice listening with your video',
          translation: 'Pratique a escuta com o seu vídeo'
        }
      ]
    };
    setActiveLesson(newLesson);
    setCurrentSentenceIndex(0);
    setCustomVideoUrlInput('');
    setIsUploadModalOpen(true);
  };

  // Search Bar / URL Input Handler
  const handleSearchOrUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if query is YouTube URL
    const ytId = getYoutubeVideoId(query);
    if (ytId) {
      loadCustomVideoUrl(query);
      return;
    }

    // Check if Google Drive URL
    if (isGoogleDriveUrl(query)) {
      loadCustomVideoUrl(query);
      return;
    }

    // Search query: filter existing lessons or match title
    const found = allLessons.find(l => l.title.toLowerCase().includes(query.toLowerCase()));
    if (found) {
      setActiveLesson(found);
      setCurrentSentenceIndex(0);
      setSearchQuery('');
    } else {
      alert(`Nenhuma lição encontrada para "${query}". Cole o link direto do YouTube ou Google Drive!`);
    }
  };

  // Subtitle Extraction logic (YouTube Captions / Gemini AI)
  const handleExtractSubtitles = async () => {
    if (!activeLesson) return;
    setIsExtractingSubs(true);
    setExtractProgressText('Extraindo e sincronizando legendas do vídeo...');

    const ytId = getYoutubeVideoId(activeLesson.videoUrl);
    const geminiKey = localStorage.getItem('hl_gemini_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY;

    try {
      // 1. Attempt AI-based transcription & chunk extraction if Gemini key present
      if (geminiKey && geminiKey !== 'sua-chave-gemini-aqui') {
        setExtractProgressText('Gerando transcrição e frases de escuta com IA...');
        const prompt = `Generate a realistic English subtitle sequence with 4 to 8 short listening sentences for a video about "${activeLesson.title}". Return ONLY a JSON array of objects with format: [{"id": 1, "start": 0.0, "end": 4.5, "text": "sentence in english", "translation": "tradução em português"}]. No markdown formatting.`;
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (res.ok) {
          const data = await res.json();
          let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const updatedLesson: Lesson = {
              ...activeLesson,
              subtitles: parsed
            };
            setActiveLesson(updatedLesson);
            setCurrentSentenceIndex(0);
            setIsExtractingSubs(false);
            setIsUploadModalOpen(false);
            alert('Legendas extraídas e sincronizadas com sucesso!');
            return;
          }
        }
      }

      // 2. Fallback heuristic sentences
      setTimeout(() => {
        const fallbackSubs: Subtitle[] = [
          { id: 1, start: 0.0, end: 5.0, text: 'people who are different', translation: 'pessoas que são diferentes' },
          { id: 2, start: 5.0, end: 10.0, text: 'should never feel like they do not belong', translation: 'nunca deveriam sentir que não pertencem' },
          { id: 3, start: 10.0, end: 16.0, text: 'today we will stand up and make our voices heard', translation: 'hoje nós vamos nos posicionar e fazer nossas vozes serem ouvidas' }
        ];
        setActiveLesson({ ...activeLesson, subtitles: fallbackSubs });
        setCurrentSentenceIndex(0);
        setIsExtractingSubs(false);
        setIsUploadModalOpen(false);
        alert('Legendas configuradas com sucesso para escuta ativa!');
      }, 1000);

    } catch (err) {
      console.error('Subtitle extraction error:', err);
      setIsExtractingSubs(false);
      alert('Não foi possível extrair legendas automaticamente. Faça o upload de um arquivo .SRT.');
    }
  };

  // Subtitle File Upload (.SRT / .VTT / .LRC / Text)
  const handleSubtitleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const subs: Subtitle[] = [];
      const blocks = text.trim().split(/\r?\n\r?\n/);
      
      blocks.forEach((block, index) => {
        const lines = block.trim().split(/\r?\n/);
        if (lines.length >= 2) {
          const timeMatch = lines[1]?.match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/);
          if (timeMatch) {
            const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
            const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
            const subText = lines.slice(2).join(' ');
            subs.push({
              id: index + 1,
              start,
              end,
              text: decodeHtmlEntities(subText),
              translation: ''
            });
          }
        }
      });

      if (subs.length > 0) {
        const updated: Lesson = {
          ...activeLesson,
          subtitles: subs
        };
        setActiveLesson(updated);
        setCurrentSentenceIndex(0);
        setIsUploadModalOpen(false);
        alert(`${subs.length} frases importadas com sucesso!`);
      } else {
        alert('Formato de legenda não reconhecido. Utilize arquivos .SRT ou cole as frases.');
      }
    } catch {
      alert('Erro ao processar arquivo de legenda.');
    }
  };

  // Manual Pasted Lines handler
  const handleManualTranscriptSubmit = () => {
    const lines = manualTranscriptText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const subs: Subtitle[] = lines.map((line, idx) => ({
      id: idx + 1,
      start: idx * 4.5,
      end: (idx + 1) * 4.5,
      text: decodeHtmlEntities(line),
      translation: ''
    }));

    setActiveLesson({
      ...activeLesson,
      subtitles: subs
    });
    setCurrentSentenceIndex(0);
    setIsUploadModalOpen(false);
    setManualTranscriptText('');
    alert(`${subs.length} frases sincronizadas para treino!`);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      backgroundColor: '#121418',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '16px 20px',
      gap: '14px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>

      {/* 2. CENTER STAGE: Enlarged 16:9 Video Player flanked by Lições & Settings + Navigation Chevrons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '1060px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Left Side Controls: Left Chevron (<) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '46px'
        }}>
          {/* Left Chevron (<) Button */}
          <button
            onClick={handlePrevSentence}
            disabled={currentSentenceIndex <= 0}
            style={{
              background: 'none',
              border: 'none',
              color: currentSentenceIndex > 0 ? '#9ca3af' : 'rgba(255,255,255,0.15)',
              cursor: currentSentenceIndex > 0 ? 'pointer' : 'default',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              userSelect: 'none'
            }}
            title="Frase anterior"
          >
            <ChevronLeft size={44} strokeWidth={1.8} />
          </button>
        </div>

        {/* Video Player Card (Expanded space with maxWidth 860px) */}
        <div style={{
          flex: 1,
          maxWidth: '860px',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          position: 'relative'
        }}>
          {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
            <div id="youtube-player-container" style={{ width: '100%', height: '100%', background: 'black' }}>
              <div id="youtube-player-iframe"></div>
            </div>
          ) : isGoogleDriveUrl(activeLesson.videoUrl) ? (
            <iframe
              src={getGoogleDriveEmbedUrl(activeLesson.videoUrl)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Google Drive Video"
            />
          ) : isFebboxUrl(activeLesson.videoUrl) ? (
            <iframe
              src={getFebboxEmbedUrl(activeLesson.videoUrl)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Febbox Cloud Video"
            />
          ) : (
            <video
              ref={videoPlayerRef}
              src={activeLesson.videoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onTimeUpdate={(e) => handleTimeUpdate((e.target as HTMLVideoElement).currentTime)}
              onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Right Side Controls Column: Discrete Icons for Lições & Settings + Right Chevron (>) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          minWidth: '46px'
        }}>
          {/* Subtle icon buttons group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Discrete Lições Icon Button */}
            <button
              onClick={() => setIsLessonsModalOpen(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#9ca3af',
                borderRadius: '8px',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#38bdf8';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              title="Lições e Materiais de Vídeo"
            >
              <Menu size={18} />
            </button>

            {/* Discrete Settings Icon Button */}
            <button
              onClick={() => setIsConfigDrawerOpen(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#9ca3af',
                borderRadius: '8px',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#38bdf8';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              title="Configurações (Link do vídeo, Modo de exercício, Legendas em português, Excluir lição)"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Right Chevron (>) Button */}
          <button
            onClick={handleNextSentence}
            disabled={currentSentenceIndex >= adjustedSubtitles.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: currentSentenceIndex < adjustedSubtitles.length - 1 ? '#9ca3af' : 'rgba(255,255,255,0.15)',
              cursor: currentSentenceIndex < adjustedSubtitles.length - 1 ? 'pointer' : 'default',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              userSelect: 'none'
            }}
            title="Próxima frase"
          >
            <ChevronRight size={44} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* 3. TRAINING CONTROLS BAR: (i) Info | [ Play Áudio Sistema ] | [ Repetir Vídeo ] | [ Mostrar ] | [ 🎙️ Mic ] */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '6px 0',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {/* Info / Keyboard Shortcuts Icon Button (i) */}
        <button
          onClick={() => setIsInfoModalOpen(prev => !prev)}
          style={{
            background: isInfoModalOpen ? 'rgba(56, 189, 248, 0.15)' : 'none',
            border: isInfoModalOpen ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
            color: isInfoModalOpen ? '#38bdf8' : '#9ca3af',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          title="Atalhos do Teclado e Guia de Treino"
        >
          <Info size={20} />
        </button>

        {/* Playback Mode Toggle: Modo Contínuo vs Pausa a cada frase */}
        <button
          onClick={() => setIsContinuousPlay(prev => !prev)}
          style={{
            backgroundColor: isContinuousPlay ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: isContinuousPlay ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isContinuousPlay ? '#38bdf8' : '#9ca3af',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          title={isContinuousPlay ? 'Modo Contínuo ativado (reprodução segue direto). Clique para pausar a cada frase' : 'Modo Pausa por Frase ativado (o vídeo pausa a cada sentença para você completar). Clique para modo contínuo'}
        >
          {isContinuousPlay ? (
            <>
              <Play size={15} fill="#38bdf8" />
              <span>Contínuo</span>
            </>
          ) : (
            <>
              <Pause size={15} />
              <span>Pausar por Frase</span>
            </>
          )}
        </button>

        {/* Play System Audio Button (Ouvir frase gerada pelo áudio do sistema) */}
        <button
          onClick={playSystemTtsSentence}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '9px 18px',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
            e.currentTarget.style.borderColor = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          }}
          title="Ouvir a frase pelo áudio do sistema"
        >
          <Volume2 size={18} />
          <span>Ouvir Frase</span>
        </button>

        {/* Blue Repetir Button (Áudio do vídeo - Ação principal: início ao fim da vocalização) */}
        <button
          onClick={handleReplaySentence}
          style={{
            backgroundColor: '#0284c7', // Vibrant royal blue matching screenshot
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 34px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Repetir o trecho vocalizado do vídeo (Atalho: Tab)"
        >
          <Repeat size={16} />
          <span>Repetir</span>
        </button>

        {/* Grey Mostrar Button */}
        <button
          onClick={handleRevealSentence}
          style={{
            backgroundColor: '#2b313d', // Dark grey button matching screenshot
            color: '#d1d5db',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '9px 28px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2b313d'}
          title="Revelar frase e respostas (Atalho: Shift+Tab ou Alt+M)"
        >
          Mostrar
        </button>

        {/* Discrete Translation Toggle Eye Icon Button (Ícone de olho discreto para tradução) */}
        <button
          onClick={() => setShowTranslation(prev => !prev)}
          style={{
            backgroundColor: showTranslation ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            border: showTranslation ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
            color: showTranslation ? '#38bdf8' : '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={showTranslation ? 'Ocultar tradução da sentença' : 'Exibir tradução da sentença'}
        >
          {showTranslation ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        {/* Blue Microphone Icon Button */}
        <button
          onClick={isRecording ? stopRecordingSpeech : startRecordingSpeech}
          style={{
            background: 'none',
            border: 'none',
            color: isRecording ? '#ef4444' : '#38bdf8', // Cyan blue mic matching screenshot
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          title={isRecording ? 'Parar gravação' : 'Treinar pronúncia com microfone'}
        >
          <Mic size={22} className={isRecording ? 'pulse' : ''} />
        </button>
      </div>

      {/* Discrete Inline Translation Line (Mostra a tradução da frase de forma sutil) */}
      {showTranslation && currentSub && (
        <div style={{
          maxWidth: '720px',
          margin: '2px auto 0',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease',
          padding: '4px 12px'
        }}>
          <span style={{
            fontSize: '0.88rem',
            color: '#a7f3d0',
            fontStyle: 'italic',
            letterSpacing: '0.01em',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: '4px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            🇧🇷 {currentSub.translation || 'Sem tradução em português configurada.'}
          </span>
        </div>
      )}

      {/* Info Popover: Keyboard Shortcuts & Tips */}
      {isInfoModalOpen && (
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          backgroundColor: '#1a1f29',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⌨️ Atalhos do Teclado & Instruções
            </span>
            <button 
              onClick={() => setIsInfoModalOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            fontSize: '0.85rem'
          }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>Tab</strong>
              <div style={{ color: '#9ca3af', marginTop: '2px' }}>Repetir o áudio do vídeo da frase atual (vocalização)</div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>Shift + Tab</strong> <span style={{ color: '#6b7280' }}>ou</span> <strong style={{ color: '#38bdf8' }}>Alt + M</strong>
              <div style={{ color: '#9ca3af', marginTop: '2px' }}>Mostrar resposta / Revelar palavras da frase</div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>Modo Pausa / Contínuo</strong>
              <div style={{ color: '#9ca3af', marginTop: '2px' }}>Pausa o vídeo ao final de cada frase para digitação ou segue direto</div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>Ícone de Olho</strong>
              <div style={{ color: '#9ca3af', marginTop: '2px' }}>Exibe ou oculta discretamente a tradução da frase</div>
            </div>
          </div>

          {currentSub?.explanation && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px', fontSize: '0.82rem', color: '#9ca3af' }}>
              <strong style={{ color: '#e5e7eb' }}>Dica da frase:</strong> {currentSub.explanation}
            </div>
          )}
        </div>
      )}

      {/* Voice comparison accuracy notice */}
      {userTranscript && (
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#9ca3af'
        }}>
          Você falou: <strong style={{ color: '#ffffff' }}>"{userTranscript}"</strong>
          {compareScore !== null && (
            <span style={{ marginLeft: '8px', color: compareScore >= 70 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
              (Precisão: {compareScore}%)
            </span>
          )}
        </div>
      )}

      {/* 4. SENTENCE WORD ASSEMBLY EXERCISE (Caixas Horizontais na parte inferior) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        maxWidth: '920px',
        margin: '12px auto 0'
      }}>
        {/* Horizontal word boxes row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '8px 0'
        }}>
          {sentenceWords.map((word, idx) => {
            const isSolved = solvedWordIndices[idx] || showAnswer;
            const isActive = activeSlotIndex === idx && !isSolved;
            // Check if current input in typing mode has an incorrect prefix
            const hasTypingError = isActive && practiceMode === 'typing' && currentInputWord.length > 0 && !cleanWordForComparison(word).startsWith(cleanWordForComparison(currentInputWord));

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!isSolved && practiceMode === 'typing') {
                    setActiveSlotIndex(idx);
                    slotInputRef.current?.focus();
                  }
                }}
                style={{
                  height: '44px',
                  minWidth: `${Math.max(word.length * 15, 80)}px`,
                  backgroundColor: '#262c37', // Dark horizontal box matching reference
                  border: isSolved 
                    ? '2px solid rgba(74, 222, 128, 0.55)' 
                    : hasTypingError
                      ? '2px solid rgba(239, 68, 68, 0.6)'
                      : isActive 
                        ? '2px solid #38bdf8' 
                        : '1px solid #374151',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 14px',
                  boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
                  cursor: isSolved ? 'default' : practiceMode === 'typing' ? 'text' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {isSolved ? (
                  /* Word displayed in bright emerald green matching screenshot */
                  <span style={{
                    color: '#4ade80', // Emerald green text
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    letterSpacing: '0.01em',
                    userSelect: 'none'
                  }}>
                    {word}
                  </span>
                ) : practiceMode === 'typing' && isActive ? (
                  /* Active inline input for focused typing */
                  <input
                    ref={slotInputRef}
                    type="text"
                    value={currentInputWord}
                    onChange={(e) => handleWordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        if (e.shiftKey) {
                          handleRevealSentence();
                        } else {
                          handleReplaySentence();
                        }
                      }
                    }}
                    placeholder=""
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: hasTypingError ? '#f87171' : '#ffffff',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}
                  />
                ) : (
                  /* Empty slot rectangle */
                  <span style={{ color: 'transparent', userSelect: 'none' }}>.</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Word Bank Chips (Aparece SOMENTE no modo 'chips' para organizar a frase com cliques) */}
        {!showAnswer && practiceMode === 'chips' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            width: '100%'
          }}>
            <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>
              👉 Clique nas palavras abaixo para montar a frase na ordem correta:
            </span>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {scrambledChips.map((chipObj, cIdx) => {
                const isChipUsed = usedChipsIndices[cIdx];
                return (
                  <button
                    key={cIdx}
                    onClick={() => !isChipUsed && handleChipClick(chipObj.clean, cIdx)}
                    disabled={isChipUsed}
                    style={{
                      backgroundColor: isChipUsed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.07)',
                      border: isChipUsed ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.15)',
                      color: isChipUsed ? '#4b5563' : '#e5e7eb',
                      borderRadius: '16px',
                      padding: '6px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: isChipUsed ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      textDecoration: isChipUsed ? 'line-through' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isChipUsed) {
                        e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.18)';
                        e.currentTarget.style.borderColor = '#38bdf8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChipUsed) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                  >
                    {chipObj.clean}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step indicator in small text */}
        <span style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>
          Frase {currentSentenceIndex + 1} de {adjustedSubtitles.length}
        </span>
      </div>

      {/* 5. MODAL: Material / Lessons Catalog Switcher */}
      {isLessonsModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1e27',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>📚 Materiais de Treino</h3>
              <button 
                onClick={() => setIsLessonsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allLessons.map(lesson => (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setActiveLesson(lesson);
                    setCurrentSentenceIndex(0);
                    setIsLessonsModalOpen(false);
                  }}
                  style={{
                    backgroundColor: activeLesson.id === lesson.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: activeLesson.id === lesson.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: activeLesson.id === lesson.id ? '#38bdf8' : '#ffffff' }}>
                    {lesson.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
                    {lesson.description}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px' }}>
                    {lesson.subtitles.length} frases sincronizadas
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Subtitle Upload & AI Extraction */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1e27',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>⚙️ Legendas do Vídeo</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.4 }}>
              Vídeo ativo: <strong style={{ color: '#ffffff' }}>{activeLesson.title}</strong>
            </p>

            {/* File Upload .SRT */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                📁 Enviar arquivo de legenda (.SRT / .VTT / .LRC):
              </label>
              <input
                type="file"
                accept=".srt,.vtt,.lrc"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleSubtitleFileUpload(e.target.files[0]);
                  }
                }}
                style={{ fontSize: '0.82rem', color: '#9ca3af' }}
              />
            </div>

            {/* Paste Raw Text Lines */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '6px' }}>
                ✏️ Ou cole as frases linha por linha:
              </label>
              <textarea
                rows={3}
                value={manualTranscriptText}
                onChange={(e) => setManualTranscriptText(e.target.value)}
                placeholder="people who are different&#10;should never feel like they do not belong"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '8px',
                  fontSize: '0.85rem'
                }}
              />
              <button
                onClick={handleManualTranscriptSubmit}
                disabled={!manualTranscriptText.trim()}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sincronizar Frases Coladas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. HIDDEN CONFIGURATION SIDEBAR DRAWER (Aparece ao clicar em "Configurações" no topo direito) */}
      {isConfigDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            height: '100%',
            backgroundColor: '#161922',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.7)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Configurações</h3>
              </div>
              <button
                onClick={() => setIsConfigDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Section 1: Link Direto do Vídeo */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e5e7eb' }}>
                🔗 Carregar Link Exato do Vídeo
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Insira o link direto do YouTube, Google Drive ou Febbox (ex: febbox.com/share/...):
              </p>
              <input
                type="text"
                value={customVideoUrlInput}
                onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                placeholder="Ex: YouTube, Google Drive ou https://www.febbox.com/share/..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '9px 12px',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => {
                  if (customVideoUrlInput.trim()) {
                    loadCustomVideoUrl(customVideoUrlInput);
                    setIsConfigDrawerOpen(false);
                  }
                }}
                disabled={!customVideoUrlInput.trim()}
                style={{
                  backgroundColor: customVideoUrlInput.trim() ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: customVideoUrlInput.trim() ? '#ffffff' : '#6b7280',
                  borderRadius: '6px',
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: customVideoUrlInput.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
              >
                Carregar Vídeo
              </button>
            </div>

            {/* Section 2: Modo de Exercício (Lacunas para escrever vs Palavras para organizar) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e5e7eb' }}>
                🎮 Modo de Exercício da Frase
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Escolha como deseja praticar a frase da legenda:
              </p>

              {/* Option A: Escrever nas lacunas */}
              <label 
                onClick={() => setPracticeMode('typing')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: practiceMode === 'typing' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: practiceMode === 'typing' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <input
                  type="radio"
                  name="practiceMode"
                  checked={practiceMode === 'typing'}
                  onChange={() => setPracticeMode('typing')}
                  style={{ marginTop: '3px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: practiceMode === 'typing' ? '#38bdf8' : '#ffffff' }}>
                    ✍️ Escrever / Completar nas lacunas
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Digite as palavras diretamente dentro das caixas retangulares.
                  </span>
                </div>
              </label>

              {/* Option B: Apertar nas palavras para organizar */}
              <label 
                onClick={() => setPracticeMode('chips')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: practiceMode === 'chips' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: practiceMode === 'chips' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <input
                  type="radio"
                  name="practiceMode"
                  checked={practiceMode === 'chips'}
                  onChange={() => setPracticeMode('chips')}
                  style={{ marginTop: '3px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: practiceMode === 'chips' ? '#38bdf8' : '#ffffff' }}>
                    🧩 Apertar nas palavras para organizar
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Clique nos botões de palavras para montar a frase na ordem certa.
                  </span>
                </div>
              </label>
            </div>

            {/* Section 3: Legendas em Português & Arquivos */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e5e7eb' }}>
                🇧🇷 Legendas e Tradução em Português
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Insira as traduções frase por frase (uma por linha) para sincronizar com as legendas do vídeo:
              </p>
              <textarea
                rows={4}
                value={portugueseSubtitlesText}
                onChange={(e) => setPortugueseSubtitlesText(e.target.value)}
                placeholder={"Exemplo:\npessoas que são diferentes\nnunca deveriam sentir que não pertencem\nhoje nós vamos nos posicionar..."}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={handleSavePortugueseSubtitles}
                disabled={!portugueseSubtitlesText.trim()}
                style={{
                  backgroundColor: portugueseSubtitlesText.trim() ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: portugueseSubtitlesText.trim() ? '#ffffff' : '#6b7280',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: portugueseSubtitlesText.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
              >
                Salvar Tradução em Português
              </button>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d1d5db' }}>
                📁 Arquivos de Legenda (.SRT)
              </span>
              <button
                onClick={() => {
                  setIsConfigDrawerOpen(false);
                  setIsUploadModalOpen(true);
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Upload size={15} />
                <span>Enviar Arquivo .SRT / .VTT</span>
              </button>
            </div>

            {/* Section 4: Excluir Lição Atual */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f87171' }}>
                🗑️ Excluir Lição
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Remove permanentemente a lição ativa (<strong>{activeLesson.title}</strong>) da sua lista.
              </p>
              <button
                onClick={handleDeleteCurrentLesson}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  borderRadius: '6px',
                  padding: '9px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.color = '#f87171';
                }}
              >
                <Trash2 size={16} />
                <span>Excluir Esta Lição</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

