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
  Search, FileText, Languages, Trash2, FastForward, Rewind, Keyboard,
  StepForward, PauseCircle
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
  subtitleSource?: 'youtube_auto' | 'srt_file' | 'manual_text' | 'preloaded';
  rawTranscriptText?: string;
  portugueseRawText?: string;
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

// Limpeza avançada de cifras, notas musicais (♪, ♫, etc.) e descrições de áudio para músicas/Shadowing
export const cleanLyricsAndChords = (raw: string): string => {
  if (!raw) return '';
  return raw
    // 1. Remove notas e símbolos musicais (Unicode e emojis: ♪, ♫, ♩, ♬, 🎵, etc.)
    .replace(/[♪♫♩♬♭♮♯🎵🎶🎼]/gu, '')
    // 2. Remove cifras em colchetes ou parênteses: [C], [Am], [G7], [F#m], [Bb/D], (Em), etc.
    .replace(/[\[\(]\s*[A-G][b#]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][b#]?)?\s*[\]\)]/gi, '')
    // 3. Remove descrições de áudio comuns de legendas: [Music], [Música], (Applause), [Instrumental], etc.
    .replace(/[\[\(][^\]\)]*(?:music|música|musica|applause|aplausos|laughter|risos|cheering|cheers|instrumental|intro|outro|solo|guitar|drums|chorus|refrão|verse|verso|bridge|ponte|audio|áudio|vocalizing|singing|beatboxing|whistling|piano|synth|bass|drop|screaming|sighs|gasp|crying|groan|groaning|chuckle|giggle)[^\]\)]*[\]\)]/gi, '')
    // 4. Remove colchetes ou parênteses vazios ou com pontuação órfã
    .replace(/[\[\(][\s.,!?:;*~_^-]*[\]\)]/g, '')
    // 5. Remove cifras isoladas fora de colchetes que não sejam palavras do vocabulário (ex: C#m, F#m, Gmaj7, Asus4, Bdim, G7)
    .replace(/\b(?:[A-G][b#](?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][b#]?)?|[A-G](?:m|maj|min|dim|aug|sus|add)[0-9]*(?:\/[A-G][b#]?)?|[A-G]7(?:\/[A-G][b#]?)?)\b/g, '')
    // 6. Normaliza espaços múltiplos
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const cleanWordForComparison = (w: string): string => {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const parseSpeakerAndText = (rawText: string): { speaker: string | null; dialogue: string } => {
  const decoded = decodeHtmlEntities(rawText);
  const clean = cleanLyricsAndChords(decoded);
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
  const { addCustomPhrase, categories, targetLanguage, addCustomCategory } = useApp();

  // Island configuration for saving sentences (+)
  const [targetMacroIsland, setTargetMacroIsland] = useState<string>(() => {
    return localStorage.getItem('hl_media_macro_island') || 'influence';
  });
  const [targetIslandId, setTargetIslandId] = useState<string>(() => {
    return localStorage.getItem('hl_media_island_id') || '';
  });
  const [isSentenceSaved, setIsSentenceSaved] = useState<boolean>(false);

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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExtractingSubs, setIsExtractingSubs] = useState(false);
  const [extractProgressText, setExtractProgressText] = useState('');

  // Upload/Manual transcript states
  const [manualTranscriptText, setManualTranscriptText] = useState('');
  const [uploadedSubFile, setUploadedSubFile] = useState<File | null>(null);

  // Training & Word Gap-fill States
  const [solvedWordIndices, setSolvedWordIndices] = useState<Record<number, boolean>>({});
  const [revealedSlotIndices, setRevealedSlotIndices] = useState<Record<number, boolean>>({});
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [currentInputWord, setCurrentInputWord] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isLoopingCurrent, setIsLoopingCurrent] = useState<boolean>(false);
  // Continuous playback mode: if false (default), pauses automatically at the end of each sentence; if true, plays continuously
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(false);
  // Auto-advance vs Manual Hold after sentence gap completion
  // false (default): Direct mode - speaks sentence via TTS, pauses briefly for user repetition, and auto-advances
  // true: Manual mode - speaks sentence via TTS and stays/holds on current sentence, awaiting manual user click
  const [isManualAdvance, setIsManualAdvance] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hl_media_manual_advance') === 'true';
    } catch {
      return false;
    }
  });
  const isManualAdvanceRef = useRef<boolean>(isManualAdvance);
  useEffect(() => {
    isManualAdvanceRef.current = isManualAdvance;
  }, [isManualAdvance]);

  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleManualAdvance = () => {
    setIsManualAdvance(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('hl_media_manual_advance', String(nextVal));
      } catch {}
      return nextVal;
    });
  };

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
  // Translation visibility & Portuguese subtitles state (toggled via discreet Eye icon, default true)
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [portugueseSubtitlesText, setPortugueseSubtitlesText] = useState<string>('');

  // New Lesson modal states
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonEnglishText, setNewLessonEnglishText] = useState('');
  const [newLessonPortugueseText, setNewLessonPortugueseText] = useState('');
  const [newLessonEnglishFile, setNewLessonEnglishFile] = useState<File | null>(null);
  const [newLessonPortugueseFile, setNewLessonPortugueseFile] = useState<File | null>(null);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  // Sync settings input and Portuguese text whenever active lesson changes
  useEffect(() => {
    if (activeLesson) {
      setCustomVideoUrlInput(activeLesson.videoUrl || '');
      if (activeLesson.portugueseRawText) {
        setPortugueseSubtitlesText(activeLesson.portugueseRawText);
      } else if (activeLesson.subtitles?.length) {
        setPortugueseSubtitlesText(activeLesson.subtitles.map(s => s.translation).filter(Boolean).join('\n'));
      } else {
        setPortugueseSubtitlesText('');
      }
    }
  }, [activeLesson?.id]);

  // Sincronizar legendas/tradução em português inseridas nas configurações em texto
  const handleSavePortugueseSubtitles = () => {
    if (!activeLesson) return;
    const lines = portugueseSubtitlesText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const updatedSubs = activeLesson.subtitles.map((sub, idx) => ({
      ...sub,
      translation: lines[idx] !== undefined ? lines[idx] : sub.translation
    }));

    const updatedLesson: Lesson = {
      ...activeLesson,
      subtitles: updatedSubs,
      portugueseRawText: lines.join('\n')
    };

    setActiveLesson(updatedLesson);
    const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
    if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updatedLesson);
    setCustomLessons(updatedCustom);
    try {
      localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom));
    } catch {}

    alert(`Tradução em português de ${lines.length} frases sincronizada com sucesso!`);
  };

  // Upload de arquivo de legenda em português (.SRT / .VTT)
  const handlePortugueseSrtUpload = async (file: File) => {
    if (!activeLesson) return;
    try {
      const text = await file.text();
      const blocks = text.trim().split(/\r?\n\r?\n/);
      const ptLines: string[] = [];
      blocks.forEach((block) => {
        const lines = block.trim().split(/\r?\n/);
        if (lines.length >= 2) {
          const subText = cleanLyricsAndChords(decodeHtmlEntities(lines.slice(2).join(' ').trim()));
          if (subText) ptLines.push(subText);
        }
      });
      if (ptLines.length === 0) {
        ptLines.push(...text.split(/\r?\n/).map(l => cleanLyricsAndChords(decodeHtmlEntities(l.trim()))).filter(Boolean));
      }

      if (ptLines.length > 0) {
        const updatedSubs = activeLesson.subtitles.map((sub, idx) => ({
          ...sub,
          translation: ptLines[idx] !== undefined ? ptLines[idx] : sub.translation
        }));
        const updatedLesson: Lesson = {
          ...activeLesson,
          subtitles: updatedSubs,
          portugueseRawText: ptLines.join('\n')
        };
        setActiveLesson(updatedLesson);
        setPortugueseSubtitlesText(ptLines.join('\n'));
        const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
        if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updatedLesson);
        setCustomLessons(updatedCustom);
        try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
        alert(`Arquivo de legenda em português (.SRT) sincronizado com sucesso (${ptLines.length} frases)!`);
      } else {
        alert('Nenhum texto de legenda encontrado no arquivo.');
      }
    } catch {
      alert('Erro ao processar o arquivo de legenda em português.');
    }
  };

  // Tradução automática sob demanda de todas as legendas da lição atual
  const handleAutoTranslateCurrentLesson = async () => {
    if (!activeLesson?.subtitles?.length) return;
    try {
      const translated = await autoTranslateSubtitles(
        activeLesson.subtitles.map(s => ({ ...s, translation: '' }))
      );
      const ptText = translated.map(s => s.translation).filter(Boolean).join('\n');
      const updatedLesson: Lesson = {
        ...activeLesson,
        subtitles: translated,
        portugueseRawText: ptText
      };
      setActiveLesson(updatedLesson);
      setPortugueseSubtitlesText(ptText);
      const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
      if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updatedLesson);
      setCustomLessons(updatedCustom);
      try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
      alert(`Tradução automática gerada para ${translated.length} frases!`);
    } catch {
      alert('Erro ao traduzir legendas automaticamente.');
    }
  };

  // Toggle tradução com garantia de preenchimento automático se faltar tradução
  const toggleTranslation = async () => {
    const nextVal = !showTranslation;
    setShowTranslation(nextVal);
    if (nextVal && currentSub && (!currentSub.translation || !currentSub.translation.trim())) {
      try {
        const translatedSubs = await autoTranslateSubtitles(activeLesson.subtitles);
        const updatedLesson: Lesson = {
          ...activeLesson,
          subtitles: translatedSubs,
          portugueseRawText: translatedSubs.map(s => s.translation).filter(Boolean).join('\n')
        };
        setActiveLesson(updatedLesson);
        const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
        if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updatedLesson);
        setCustomLessons(updatedCustom);
        try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
      } catch (err) {
        console.warn('Auto translation error on toggle:', err);
      }
    }
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

  // Adjusted subtitles: Limpeza avançada de cifras, notas musicais ♪ e remoção de trechos puramente instrumentais
  const adjustedSubtitles = useMemo(() => {
    if (!activeLesson) return [];
    return activeLesson.subtitles
      .map(s => {
        const cleanedText = cleanLyricsAndChords(decodeHtmlEntities(s.text));
        const cleanedTrans = cleanLyricsAndChords(decodeHtmlEntities(s.translation || ''));
        return {
          ...s,
          text: cleanedText,
          translation: cleanedTrans
        };
      })
      .filter(s => {
        // Ignora trechos que contenham apenas notas musicais/cifras sem palavras reais faladas ou cantadas
        return /[a-zA-Z0-9\u00C0-\u017F]/.test(s.text);
      });
  }, [activeLesson]);

  // Current active sentence object
  const currentSub = useMemo(() => {
    if (adjustedSubtitles.length === 0) return null;
    const clamped = Math.max(0, Math.min(adjustedSubtitles.length - 1, currentSentenceIndex));
    return adjustedSubtitles[clamped] || adjustedSubtitles[0];
  }, [adjustedSubtitles, currentSentenceIndex]);

  // Words for current sentence (Exclui estritamente notas musicais ♪, cifras e símbolos de transcrição das lacunas)
  const sentenceWords = useMemo(() => {
    if (!currentSub) return [];
    const { dialogue } = parseSpeakerAndText(currentSub.text);
    const cleaned = cleanLyricsAndChords(dialogue);
    return cleaned
      .trim()
      .split(/\s+/)
      .filter(w => /[a-zA-Z0-9\u00C0-\u017F]/.test(w));
  }, [currentSub]);

  // Scrambled unique chips for word bank (excluindo notas musicais ♪ e símbolos de cifra)
  const scrambledChips = useMemo(() => {
    if (sentenceWords.length === 0) return [];
    return sentenceWords
      .map((w, originalIdx) => ({
        originalIdx,
        clean: w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?♪♫♩♬♭♮♯🎵🎶🎼]/gu, '').trim()
      }))
      .filter(c => c.clean.length > 0)
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

  // Garantia: Auto-tradução imediata em segundo plano se a lição ativa contiver frases sem tradução em português
  useEffect(() => {
    if (!activeLesson?.subtitles || activeLesson.subtitles.length === 0) return;
    const missingTranslations = activeLesson.subtitles.some(s => !s.translation || !s.translation.trim());
    if (missingTranslations) {
      autoTranslateSubtitles(activeLesson.subtitles).then(translated => {
        if (translated.some((s, idx) => s.translation !== activeLesson.subtitles[idx]?.translation)) {
          setActiveLesson(prev => {
            if (!prev || prev.id !== activeLesson.id) return prev;
            return {
              ...prev,
              subtitles: translated,
              portugueseRawText: prev.portugueseRawText || translated.map(s => s.translation).filter(Boolean).join('\n')
            };
          });
        }
      }).catch(err => console.warn('Erro ao auto-traduzir lição ativa:', err));
    }
  }, [activeLesson?.id, activeLesson?.subtitles?.length]);

  // Garantia: Auto-traduz a frase atual imediatamente se ela não tiver tradução
  useEffect(() => {
    if (!currentSub || (currentSub.translation && currentSub.translation.trim())) return;
    const clean = cleanLyricsAndChords(currentSub.text);
    if (!clean) return;
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(clean)}`)
      .then(res => res.json())
      .then(data => {
        const pt = data?.[0]?.map((p: any) => p[0]).join('') || '';
        if (pt) {
          setActiveLesson(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              subtitles: prev.subtitles.map(s => s.id === currentSub.id ? { ...s, translation: pt } : s)
            };
          });
        }
      })
      .catch(() => {});
  }, [currentSub?.id, currentSub?.text]);

  // Reset words and gaps whenever sentence changes
  useEffect(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setSolvedWordIndices({});
    setUsedChipsIndices({});
    setRevealedSlotIndices({});
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

    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      try { window.speechSynthesis?.cancel(); } catch {}
    };
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

  const isIframeVideo = isFebboxUrl(activeLesson?.videoUrl) || isGoogleDriveUrl(activeLesson?.videoUrl);

  // Media seek and play controls
  const seekTo = (seconds: number) => {
    if (youtubePlayer && youtubePlayerReady) {
      youtubePlayer.seekTo(seconds, true);
      setCurrentTime(seconds);
    } else if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    } else if (isIframeVideo) {
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
        const clean = cleanLyricsAndChords(dialogue).trim();
        const utterance = new SpeechSynthesisUtterance(clean || dialogue);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Speaks sentence with TTS and triggers callback when vocalization finishes
  const speakSentenceWithCallback = (text: string, onSpeechEnd?: () => void) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const { dialogue } = parseSpeakerAndText(text);
        const cleanText = cleanLyricsAndChords(dialogue).trim();
        if (!cleanText) {
          onSpeechEnd?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;

        let called = false;
        const finish = () => {
          if (!called) {
            called = true;
            onSpeechEnd?.();
          }
        };

        utterance.onend = () => {
          finish();
        };

        utterance.onerror = (e) => {
          console.warn('TTS vocalization error:', e);
          finish();
        };

        // Safety fallback timer in case speech synthesis stalls or loses focus
        const wordsCount = cleanText.split(/\s+/).length;
        const safetyTimeoutMs = Math.max(2500, wordsCount * 450 + 1500);
        setTimeout(() => {
          finish();
        }, safetyTimeoutMs);

        window.speechSynthesis.speak(utterance);
      } else {
        onSpeechEnd?.();
      }
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      onSpeechEnd?.();
    }
  };

  // Replay current sentence from video audio strictly from vocalization start to end
  const handleReplaySentence = () => {
    if (!currentSub) return;
    seekTo(currentSub.start);
    if (isIframeVideo) {
      playSystemTtsSentence();
    } else {
      playVideo();
    }
  };

  // Toggle reveal / hide words (Ação do ícone da esquerda: mostrar ou ocultar tudo)
  const handleRevealSentence = () => {
    if (!sentenceWords.length) return;
    if (showAnswer) {
      // Já está mostrando tudo: esconde e limpa as lacunas para o usuário tentar preencher
      setSolvedWordIndices({});
      setUsedChipsIndices({});
      setRevealedSlotIndices({});
      setShowAnswer(false);
      setActiveSlotIndex(0);
      setCurrentInputWord('');
      if (practiceMode === 'typing') {
        setTimeout(() => slotInputRef.current?.focus(), 60);
      }
    } else {
      // Mostra todas as palavras
      const allSolved: Record<number, boolean> = {};
      sentenceWords.forEach((_, idx) => {
        allSolved[idx] = true;
      });
      setSolvedWordIndices(allSolved);
      setShowAnswer(true);
    }
  };

  // Toggle reveal / hide specific gap (Ação do ícone da direita: exclusivamente mostra ou oculta a lacuna onde está o cursor)
  const handleToggleCurrentSlot = () => {
    if (!sentenceWords.length) return;
    const targetIdx = activeSlotIndex;
    const isCurrentlyVisible = Boolean(revealedSlotIndices[targetIdx] || solvedWordIndices[targetIdx] || showAnswer);

    if (isCurrentlyVisible) {
      // Ocultar / desvisualizar aquela lacuna em específico onde está o cursor
      setRevealedSlotIndices(prev => ({ ...prev, [targetIdx]: false }));
      setSolvedWordIndices(prev => {
        const copy = { ...prev };
        delete copy[targetIdx];
        return copy;
      });
      setCurrentInputWord('');
      if (practiceMode === 'typing') {
        setTimeout(() => slotInputRef.current?.focus(), 50);
      }
    } else {
      // Visualizar / mostrar aquela lacuna em específico onde está o cursor
      playSuccessChime();
      setRevealedSlotIndices(prev => ({ ...prev, [targetIdx]: true }));
      if (practiceMode === 'typing') {
        setTimeout(() => slotInputRef.current?.focus(), 50);
      }
    }
  };

  // Helper para obter a tradução correspondente da palavra embaixo de cada lacuna (sem cifras ou notas)
  const getWordTranslation = (idx: number): string => {
    if (!currentSub || !currentSub.translation) return '';
    const cleanTrans = cleanLyricsAndChords(currentSub.translation);
    const translationTokens = cleanTrans.trim().split(/\s+/).filter(w => /[a-zA-Z0-9\u00C0-\u017F]/.test(w));
    if (!translationTokens.length || idx < 0 || idx >= sentenceWords.length) return '';

    // Se for a última lacuna da frase, junta os tokens restantes da tradução para não perder nenhuma palavra
    if (idx === sentenceWords.length - 1 && translationTokens.length >= sentenceWords.length) {
      return translationTokens.slice(idx).join(' ');
    }
    return translationTokens[idx] || '';
  };

  // Save current sentence to target Island (PopLab / influence by default)
  const handleSaveSentenceToIsland = async () => {
    if (!currentSub || !currentSub.text) return;
    try {
      let resolvedIslandId = targetIslandId;

      if (!resolvedIslandId || !categories.some(c => c.id === resolvedIslandId)) {
        const existingPopLab = categories.find(c => 
          (c.language_id === targetLanguage || !c.language_id) &&
          (c.name.toLowerCase().includes('poplab') || c.name.toLowerCase().includes('pop lab'))
        );
        if (existingPopLab) {
          resolvedIslandId = existingPopLab.id;
        } else {
          const macroName = targetMacroIsland || 'influence';
          resolvedIslandId = await addCustomCategory('PopLab', `Ilha PopLab - Diálogos, Filmes e Músicas [${macroName}] [poplab]`);
        }
        setTargetIslandId(resolvedIslandId);
        localStorage.setItem('hl_media_island_id', resolvedIslandId);
      }

      await addCustomPhrase(
        currentSub.text.trim(),
        currentSub.translation?.trim() || '',
        currentSub.explanation?.trim() || `Cena: ${activeLesson.title}`,
        'medium',
        'Fenrir',
        1.0,
        resolvedIslandId
      );

      setIsSentenceSaved(true);
      playSuccessChime();
      setTimeout(() => setIsSentenceSaved(false), 2500);
    } catch (err) {
      console.error('Erro ao salvar sentença na ilha:', err);
      alert('Erro ao salvar sentença.');
    }
  };

  // Seek relative backward/forward 5 seconds (Avançar e voltar 5 a 10s discretos)
  const seekRelative = (deltaSeconds: number) => {
    const target = Math.max(0, currentTime + deltaSeconds);
    seekTo(target);
  };

  // Navigation chevrons (< and >)
  const handlePrevSentence = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    try { window.speechSynthesis?.cancel(); } catch {}
    if (currentSentenceIndex > 0) {
      const prevIdx = currentSentenceIndex - 1;
      setCurrentSentenceIndex(prevIdx);
      if (adjustedSubtitles[prevIdx]) {
        seekTo(adjustedSubtitles[prevIdx].start);
      }
    }
  };

  const handleNextSentence = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    try { window.speechSynthesis?.cancel(); } catch {}
    if (currentSentenceIndex < adjustedSubtitles.length - 1) {
      const nextIdx = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIdx);
      if (adjustedSubtitles[nextIdx]) {
        seekTo(adjustedSubtitles[nextIdx].start);
      }
    }
  };

  // Centralized handler called when sentence gap filling is completed
  const handleSentenceCompletion = () => {
    playSuccessChime();
    setShowAnswer(true);

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    if (!currentSub) return;

    // Aguarda o pequeno efeito sonoro (250ms) terminar e então vocaliza a frase inteira
    setTimeout(() => {
      speakSentenceWithCallback(currentSub.text, () => {
        // Se o modo manual estiver ATIVADO, o sistema NÃO avança automaticamente.
        // O áudio foi falado, o usuário pode ouvir, repetir no seu próprio ritmo e clicar manualmente para avançar.
        if (isManualAdvanceRef.current) {
          return;
        }

        // Se desativado (modo direto normal):
        // Concede um intervalo confortável (~1600ms) para o usuário repetir em voz alta antes de passar para a próxima frase
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          if (currentSentenceIndex < adjustedSubtitles.length - 1) {
            handleNextSentence();
          }
        }, 1600);
      });
    }, 250);
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
      setRevealedSlotIndices(prev => ({ ...prev, [activeSlotIndex]: false }));
      setCurrentInputWord('');

      // Find next unsolved index
      const nextUnsolved = sentenceWords.findIndex((_, idx) => !updated[idx]);
      if (nextUnsolved !== -1) {
        setActiveSlotIndex(nextUnsolved);
      } else {
        // Sentence fully completed!
        handleSentenceCompletion();
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
      setRevealedSlotIndices(prev => ({ ...prev, [activeSlotIndex]: false }));
      setUsedChipsIndices(prev => ({ ...prev, [chipIdx]: true }));
      setCurrentInputWord('');

      const nextUnsolved = sentenceWords.findIndex((_, idx) => !updated[idx]);
      if (nextUnsolved !== -1) {
        setActiveSlotIndex(nextUnsolved);
      } else {
        // Sentence fully completed!
        handleSentenceCompletion();
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

  // Virtual Playback Clock for Cross-Origin Iframe videos (Febbox & Google Drive)
  useEffect(() => {
    if (!isIframeVideo || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const nextTime = +(prev + 0.2).toFixed(2);
        handleTimeUpdate(nextTime);
        return nextTime;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isIframeVideo, isPlaying, currentSentenceIndex, isLoopingCurrent, isContinuousPlay, currentSub]);

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
  const loadCustomVideoUrl = async (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) return;

    const ytId = getYoutubeVideoId(url);
    if (ytId) {
      // Cria a lição provisória
      const newLessonId = `custom-yt-${Date.now()}`;
      const provisionalLesson: Lesson = {
        id: newLessonId,
        title: `YouTube (${ytId})`,
        description: 'Vídeo importado pelo usuário para escuta ativa.',
        videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
        subtitles: [
          {
            id: 1,
            start: 0.0,
            end: 5.0,
            text: 'Buscando legendas automáticas do YouTube...',
            translation: 'Buscando legendas...'
          }
        ]
      };
      setActiveLesson(provisionalLesson);
      setCurrentSentenceIndex(0);
      setCustomVideoUrlInput('');

      // Tenta captar a legenda do YouTube automaticamente caso o usuário não forneça
      setIsExtractingSubs(true);
      setExtractProgressText('Captando legendas originais do YouTube...');
      try {
        const autoSubs = await fetchYouTubeCaptions(ytId);
        if (autoSubs && autoSubs.length > 0) {
          const loadedLesson: Lesson = {
            ...provisionalLesson,
            subtitles: autoSubs
          };
          setActiveLesson(loadedLesson);
          const updatedCustom = [...customLessons.filter(l => l.id !== loadedLesson.id), loadedLesson];
          setCustomLessons(updatedCustom);
          try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
          setIsExtractingSubs(false);
          return;
        }
      } catch (err) {
        console.warn('Auto fetch subtitle error:', err);
      }
      setIsExtractingSubs(false);
      // Se não captou automaticamente, abre modal para upload de arquivo .SRT ou colar legendas
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

  // Criar nova lição personalizada com suporte a links de vídeo (YouTube, Drive, Febbox), legendas em inglês (SRT ou texto) e legendas em português (SRT, texto ou tradução automática)
  const handleCreateNewLesson = async () => {
    if (!newLessonVideoUrl.trim()) {
      alert('Por favor, informe o link do vídeo (YouTube, Google Drive, Febbox ou arquivo direto).');
      return;
    }
    setIsCreatingLesson(true);

    try {
      let parsedSubs: Subtitle[] = [];
      let subSource: 'youtube_auto' | 'srt_file' | 'manual_text' | 'preloaded' = 'manual_text';
      let rawEng = '';

      // 1. Legenda em inglês
      if (newLessonEnglishFile) {
        const text = await newLessonEnglishFile.text();
        rawEng = text;
        subSource = 'srt_file';
        const blocks = text.trim().split(/\r?\n\r?\n/);
        blocks.forEach((block, index) => {
          const lines = block.trim().split(/\r?\n/);
          if (lines.length >= 2) {
            const timeMatch = lines[1]?.match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/);
            if (timeMatch) {
              const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
              const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
              const subText = cleanLyricsAndChords(decodeHtmlEntities(lines.slice(2).join(' ')));
              if (subText && /[a-zA-Z0-9\u00C0-\u017F]/.test(subText)) {
                parsedSubs.push({
                  id: parsedSubs.length + 1,
                  start,
                  end,
                  text: subText,
                  translation: ''
                });
              }
            }
          }
        });
      } else if (newLessonEnglishText.trim()) {
        rawEng = newLessonEnglishText.trim();
        subSource = 'manual_text';
        const lines = newLessonEnglishText
          .split(/\r?\n/)
          .map(l => cleanLyricsAndChords(decodeHtmlEntities(l.trim())))
          .filter(l => /[a-zA-Z0-9\u00C0-\u017F]/.test(l));
        parsedSubs = lines.map((line, idx) => ({
          id: idx + 1,
          start: idx * 4.5,
          end: (idx + 1) * 4.5,
          text: line,
          translation: ''
        }));
      } else {
        // Tentar captar do YouTube caso seja link do YouTube
        const ytId = getYoutubeVideoId(newLessonVideoUrl.trim());
        if (ytId) {
          const ytCaptions = await fetchYouTubeCaptions(ytId);
          if (ytCaptions && ytCaptions.length > 0) {
            parsedSubs = ytCaptions;
            subSource = 'youtube_auto';
            rawEng = ytCaptions.map(s => s.text).join('\n');
          }
        }
      }

      if (parsedSubs.length === 0) {
        parsedSubs = [
          { id: 1, start: 0.0, end: 5.0, text: 'Practice listening with this video', translation: 'Pratique a escuta com este vídeo' }
        ];
      }

      // 2. Legenda em português (tradução)
      let rawPt = '';
      let ptLines: string[] = [];
      if (newLessonPortugueseFile) {
        const ptText = await newLessonPortugueseFile.text();
        rawPt = ptText;
        const ptBlocks = ptText.trim().split(/\r?\n\r?\n/);
        ptBlocks.forEach((block) => {
          const lines = block.trim().split(/\r?\n/);
          if (lines.length >= 2) {
            const subText = cleanLyricsAndChords(decodeHtmlEntities(lines.slice(2).join(' ').trim()));
            if (subText) ptLines.push(subText);
          }
        });
        if (ptLines.length === 0) {
          ptLines = ptText.split(/\r?\n/).map(l => cleanLyricsAndChords(decodeHtmlEntities(l.trim()))).filter(Boolean);
        }
      } else if (newLessonPortugueseText.trim()) {
        rawPt = newLessonPortugueseText.trim();
        ptLines = newLessonPortugueseText.split(/\r?\n/).map(l => cleanLyricsAndChords(decodeHtmlEntities(l.trim()))).filter(Boolean);
      }

      if (ptLines.length > 0) {
        parsedSubs = parsedSubs.map((s, idx) => ({
          ...s,
          translation: ptLines[idx] || s.translation
        }));
      } else {
        // Auto-traduz caso o usuário não tenha inserido legenda em português
        parsedSubs = await autoTranslateSubtitles(parsedSubs);
        rawPt = parsedSubs.map(s => s.translation).join('\n');
      }

      const createdLesson: Lesson = {
        id: `custom-lesson-${Date.now()}`,
        title: newLessonTitle.trim() || `Nova Lição (${parsedSubs.length} frases)`,
        description: `Lição personalizada (${parsedSubs.length} frases sincronizadas).`,
        videoUrl: newLessonVideoUrl.trim(),
        subtitles: parsedSubs,
        subtitleSource: subSource,
        rawTranscriptText: rawEng || parsedSubs.map(s => s.text).join('\n'),
        portugueseRawText: rawPt || parsedSubs.map(s => s.translation).join('\n')
      };

      const updatedCustom = [...customLessons, createdLesson];
      setCustomLessons(updatedCustom);
      try {
        localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom));
      } catch {}

      setActiveLesson(createdLesson);
      setCurrentSentenceIndex(0);
      setIsNewLessonModalOpen(false);
      // Limpa os campos
      setNewLessonTitle('');
      setNewLessonVideoUrl('');
      setNewLessonEnglishText('');
      setNewLessonPortugueseText('');
      setNewLessonEnglishFile(null);
      setNewLessonPortugueseFile(null);
      alert(`Nova lição "${createdLesson.title}" adicionada com sucesso!`);
    } catch (err) {
      console.error('Error creating lesson:', err);
      alert('Erro ao criar lição. Verifique os dados fornecidos.');
    } finally {
      setIsCreatingLesson(false);
    }
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

  // Automatic translation helper (Traduz frases de legendas automaticamente para português)
  const autoTranslateSubtitles = async (subs: Subtitle[]): Promise<Subtitle[]> => {
    try {
      const translated = await Promise.all(
        subs.map(async (s) => {
          if (s.translation && s.translation.trim().length > 0) return s;
          try {
            const cleanText = s.text.replace(/^[A-Za-z0-9\s'.-]{2,20}:\s*/, '').trim();
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(cleanText)}`);
            if (res.ok) {
              const data = await res.json();
              const ptText = data?.[0]?.map((part: any) => part[0]).join('') || '';
              return { ...s, translation: ptText || s.translation };
            }
          } catch {}
          return s;
        })
      );
      return translated;
    } catch {
      return subs;
    }
  };

  // Subtitle Extraction logic (YouTube Captions / Gemini AI)
  // Fetch actual YouTube subtitles from the video
  const fetchYouTubeCaptions = async (videoId: string): Promise<Subtitle[] | null> => {
    try {
      // 1. Try local Vite dev server /api/youtube-transcript endpoint
      const response = await fetch(`/api/youtube-transcript?videoId=${encodeURIComponent(videoId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.transcript) && data.transcript.length > 0) {
          const subs: Subtitle[] = data.transcript
            .map((item: any, idx: number) => {
              const startSec = Math.max(0, Math.round(((item.offset || 0) / 1000) * 10) / 10);
              const durationSec = Math.max(1.8, Math.round(((item.duration || 3000) / 1000) * 10) / 10);
              const cleanTxt = cleanLyricsAndChords(decodeHtmlEntities((item.text || '').replace(/\n+/g, ' ')));
              return {
                id: idx + 1,
                start: startSec,
                end: Math.round((startSec + durationSec) * 10) / 10,
                text: cleanTxt,
                translation: ''
              };
            })
            .filter((s: Subtitle) => s.text.length > 0 && /[a-zA-Z0-9\u00C0-\u017F]/.test(s.text));

          if (subs.length > 0) {
            // Auto translate the English sentences to Portuguese
            const withTranslation = await autoTranslateSubtitles(subs);
            return withTranslation;
          }
        }
      }
    } catch (err) {
      console.warn('Endpoint /api/youtube-transcript failed, attempting client-side fallback:', err);
    }

    // 2. Client-side fallback via open CORS proxies if running in pure static/Vercel
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const pageRes = await fetch(proxyUrl);
      if (pageRes.ok) {
        const html = await pageRes.text();
        const captionIdx = html.indexOf('"captionTracks":');
        if (captionIdx !== -1) {
          const endIdx = html.indexOf(']', captionIdx);
          const rawTracks = html.slice(captionIdx + '"captionTracks":'.length, endIdx + 1);
          const tracks = JSON.parse(rawTracks);
          const selectedTrack = tracks.find((t: any) => t.languageCode === 'en' || (t.vssId && t.vssId.includes('en'))) || tracks[0];
          if (selectedTrack?.baseUrl) {
            const timedRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(selectedTrack.baseUrl)}`);
            const xml = await timedRes.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');
            const textNodes = xmlDoc.getElementsByTagName('text');
            if (textNodes.length > 0) {
              const subs: Subtitle[] = [];
              for (let i = 0; i < textNodes.length; i++) {
                const node = textNodes[i];
                const start = parseFloat(node.getAttribute('start') || '0');
                const dur = parseFloat(node.getAttribute('dur') || '3');
                const content = cleanLyricsAndChords(decodeHtmlEntities(node.textContent || ''));
                if (content && /[a-zA-Z0-9\u00C0-\u017F]/.test(content)) {
                  subs.push({
                    id: subs.length + 1,
                    start,
                    end: Math.round((start + dur) * 10) / 10,
                    text: content,
                    translation: ''
                  });
                }
              }
              if (subs.length > 0) return await autoTranslateSubtitles(subs);
            }
          }
        }
      }
    } catch {}

    return null;
  };

  // Subtitle Extraction logic (YouTube Captions / Gemini AI)
  const handleExtractSubtitles = async () => {
    if (!activeLesson) return;
    setIsExtractingSubs(true);
    setExtractProgressText('Captando legendas originais do YouTube...');

    const ytId = getYoutubeVideoId(activeLesson.videoUrl);

    try {
      // 1. Tentar captar a legenda real do YouTube caso exista
      if (ytId) {
        const ytSubs = await fetchYouTubeCaptions(ytId);
        if (ytSubs && ytSubs.length > 0) {
          const withTrans = await autoTranslateSubtitles(ytSubs);
          const updatedLesson: Lesson = {
            ...activeLesson,
            subtitles: withTrans,
            subtitleSource: 'youtube_auto',
            rawTranscriptText: withTrans.map(s => s.text).join('\n'),
            portugueseRawText: withTrans.map(s => s.translation).filter(Boolean).join('\n')
          };
          setActiveLesson(updatedLesson);
          setCurrentSentenceIndex(0);
          setIsExtractingSubs(false);
          setIsUploadModalOpen(false);
          // Persist in custom lessons
          const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
          if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updatedLesson);
          setCustomLessons(updatedCustom);
          try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
          alert(`Legendas do YouTube captadas e traduzidas com sucesso! (${withTrans.length} frases sincronizadas)`);
          return;
        }
      }

      // 2. Attempt AI-based transcription & chunk extraction if Gemini key present
      const geminiKey = localStorage.getItem('hl_gemini_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (geminiKey && geminiKey !== 'sua-chave-gemini-aqui') {
        setExtractProgressText('Gerando frases de escuta com IA...');
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
            const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updatedLesson : l);
            if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updatedLesson);
            setCustomLessons(updatedCustom);
            try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
            alert('Legendas geradas com sucesso para escuta ativa!');
            return;
          }
        }
      }

      // 3. Fallback heuristic sentences
      setTimeout(() => {
        const fallbackSubs: Subtitle[] = [
          { id: 1, start: 0.0, end: 5.0, text: 'people who are different', translation: 'pessoas que são diferentes' },
          { id: 2, start: 5.0, end: 10.0, text: 'should never feel like they do not belong', translation: 'nunca deveriam sentir que não pertencem' },
          { id: 3, start: 10.0, end: 16.0, text: 'today we will stand up and make our voices heard', translation: 'hoje nós vamos nos posicionar e fazer nossas vozes serem ouvidas' }
        ];
        const updatedLesson = { ...activeLesson, subtitles: fallbackSubs };
        setActiveLesson(updatedLesson);
        setCurrentSentenceIndex(0);
        setIsExtractingSubs(false);
        setIsUploadModalOpen(false);
        alert('Legendas configuradas com sucesso para escuta ativa!');
      }, 1000);

    } catch (err) {
      console.error('Subtitle extraction error:', err);
      setIsExtractingSubs(false);
      alert('Não foi possível captar legendas automaticamente deste vídeo. Faça o upload de um arquivo .SRT.');
    }
  };

  // Subtitle File Upload (.SRT / .VTT / .LRC / Text) - SEMPRE TEM PRIORIDADE MÁXIMA
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
            const subText = cleanLyricsAndChords(decodeHtmlEntities(lines.slice(2).join(' ')));
            if (subText && /[a-zA-Z0-9\u00C0-\u017F]/.test(subText)) {
              subs.push({
                id: subs.length + 1,
                start,
                end,
                text: subText,
                translation: ''
              });
            }
          }
        }
      });

      if (subs.length > 0) {
        // Traduz automaticamente caso ainda não possua tradução em português
        const translatedSubs = await autoTranslateSubtitles(subs);
        // Prioridade máxima: Sobrescreve as legendas da lição atual com as legendas do arquivo do usuário
        const updated: Lesson = {
          ...activeLesson,
          subtitles: translatedSubs,
          subtitleSource: 'srt_file',
          rawTranscriptText: text.slice(0, 500)
        };
        setActiveLesson(updated);
        setCurrentSentenceIndex(0);
        setIsUploadModalOpen(false);
        // Persistir na lista de custom lessons
        const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updated : l);
        if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updated);
        setCustomLessons(updatedCustom);
        try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
        alert(`Prioridade aplicada: Legenda personalizada carregada e traduzida (${subs.length} frases sincronizadas na tela)!`);
      } else {
        alert('Formato de legenda não reconhecido. Utilize arquivos .SRT ou cole as frases.');
      }
    } catch {
      alert('Erro ao processar arquivo de legenda.');
    }
  };

  // Manual Pasted Lines handler - Prioridade máxima sobre legendas automáticas
  const handleManualTranscriptSubmit = async () => {
    const lines = manualTranscriptText
      .split(/\r?\n/)
      .map(l => cleanLyricsAndChords(decodeHtmlEntities(l.trim())))
      .filter(l => /[a-zA-Z0-9\u00C0-\u017F]/.test(l));
    if (!lines.length) return;

    const subs: Subtitle[] = lines.map((line, idx) => ({
      id: idx + 1,
      start: idx * 4.5,
      end: (idx + 1) * 4.5,
      text: line,
      translation: ''
    }));

    // Traduz automaticamente as linhas fornecidas
    const translatedSubs = await autoTranslateSubtitles(subs);

    const updated: Lesson = {
      ...activeLesson,
      subtitles: translatedSubs,
      subtitleSource: 'manual_text',
      rawTranscriptText: lines.join('\n')
    };
    setActiveLesson(updated);
    setCurrentSentenceIndex(0);
    setIsUploadModalOpen(false);
    setManualTranscriptText('');
    const updatedCustom = customLessons.map(l => l.id === activeLesson.id ? updated : l);
    if (!updatedCustom.some(l => l.id === activeLesson.id)) updatedCustom.push(updated);
    setCustomLessons(updatedCustom);
    try { localStorage.setItem('hl_custom_lessons', JSON.stringify(updatedCustom)); } catch {}
    alert(`Prioridade aplicada: ${subs.length} frases manuais sincronizadas e traduzidas na tela com o vídeo!`);
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
            {/* 1. Discrete Lições Icon Button */}
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

            {/* 2. Discrete Adicionar Nova Lição Icon Button (+) */}
            <button
              onClick={() => setIsNewLessonModalOpen(true)}
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
              title="Adicionar Nova Lição"
            >
              <Plus size={18} />
            </button>

            {/* 3. Discrete Settings Icon Button */}
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
              title="Configurações (Características, Legendas, Vídeo, Excluir lição)"
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

      {/* 3. TRAINING CONTROLS BAR: (i) Info | [ -5s ] | [ Play/Pausa Frase ] | [ Ouvir Frase ] | [ +5s ] | [ Repetir ] | [ Mostrar ] | [ 👁️ Tradução ] | [ 🎙️ Mic ] */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '6px 0',
        width: '100%',
        flexWrap: 'wrap'
      }}>

        {/* Rewind 5s Button (Voltar 5 segundos) */}
        <button
          onClick={() => seekRelative(-5)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
          title="Voltar 5 segundos"
        >
          <Rewind size={18} />
        </button>

        {/* Playback Mode Toggle: Modo Contínuo vs Pausa a cada frase (Apenas ícone não colorido, sem texto) */}
        <button
          onClick={() => setIsContinuousPlay(prev => !prev)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
          title={isContinuousPlay ? 'Modo Contínuo ativado (Clique para pausar a cada frase)' : 'Modo Pausa por Frase ativado (Clique para modo contínuo)'}
        >
          {isContinuousPlay ? <Play size={18} /> : <Pause size={18} />}
        </button>

        {/* Looping Current Sentence Toggle Button (Repetir sentença em looping contínuo) */}
        <button
          onClick={() => setIsLoopingCurrent(prev => !prev)}
          style={{
            backgroundColor: isLoopingCurrent ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: isLoopingCurrent ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isLoopingCurrent ? '#38bdf8' : '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isLoopingCurrent) {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoopingCurrent) {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          title={isLoopingCurrent ? 'Repetição em looping ATIVADA (Repete esta frase continuamente)' : 'Repetir em looping contínuo (Clique para ativar)'}
        >
          <RotateCcw size={18} style={{ transform: isLoopingCurrent ? 'rotate(-45deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Toggle Modo Direto vs Pausa Manual após completar lacunas (Apenas ícone discreto, sem texto) */}
        <button
          type="button"
          onClick={toggleManualAdvance}
          style={{
            backgroundColor: isManualAdvance ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: isManualAdvance ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isManualAdvance ? '#38bdf8' : '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            height: '36px',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            if (!isManualAdvance) {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isManualAdvance) {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          title={isManualAdvance 
            ? "Modo Manual ATIVADO: fala a frase e aguarda seu clique para avançar (Clique para modo direto)" 
            : "Avanço Direto: fala a frase e avança automaticamente para a próxima (Clique para ativar modo manual)"}
        >
          {isManualAdvance ? <PauseCircle size={18} /> : <StepForward size={18} />}
        </button>

        {/* Play System Audio Button (Ouvir frase gerada pelo áudio do sistema - Apenas ícone não colorido, sem texto) */}
        <button
          onClick={playSystemTtsSentence}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
          title="Ouvir a frase pelo áudio do sistema"
        >
          <Volume2 size={18} />
        </button>

        {/* FastForward 5s Button (Avançar 5 segundos) */}
        <button
          onClick={() => seekRelative(5)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#9ca3af',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
          title="Avançar 5 segundos"
        >
          <FastForward size={18} />
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

        {/* Dual Split Icon Button (Apenas Ícones: Mostrar Tudo | Mostrar/Ocultar Lacuna do Cursor) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '36px',
            boxSizing: 'border-box'
          }}
        >
          {/* Ícone da Esquerda: Mostrar Tudo */}
          <button
            type="button"
            onClick={handleRevealSentence}
            style={{
              background: 'transparent',
              border: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
              color: showAnswer ? '#38bdf8' : '#9ca3af',
              padding: '0 10px',
              height: '100%',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = showAnswer ? '#38bdf8' : '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={showAnswer ? "Ocultar todas as respostas e limpar lacunas" : "Mostrar todas as palavras da sentença"}
          >
            <FileText size={17} />
          </button>

          {/* Ícone da Direita: Mostrar ou Ocultar a Lacuna Específica (onde está o cursor) */}
          <button
            type="button"
            onClick={handleToggleCurrentSlot}
            style={{
              background: 'transparent',
              border: 'none',
              color: (revealedSlotIndices[activeSlotIndex] || solvedWordIndices[activeSlotIndex]) ? '#38bdf8' : '#9ca3af',
              padding: '0 10px',
              height: '100%',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = (revealedSlotIndices[activeSlotIndex] || solvedWordIndices[activeSlotIndex]) ? '#38bdf8' : '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Visualizar ou ocultar a lacuna em específico onde está o cursor"
          >
            <HelpCircle size={17} />
          </button>
        </div>

        {/* Discrete Translation Toggle Eye Icon Button (Ícone de olho discreto para tradução) */}
        <button
          onClick={toggleTranslation}
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
          title={showTranslation ? 'Ocultar tradução das frases e lacunas' : 'Exibir tradução das frases e lacunas'}
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

        {/* Add Sentence to Island (+) Button (Próximo ao microfone) */}
        <button
          type="button"
          onClick={handleSaveSentenceToIsland}
          style={{
            background: isSentenceSaved ? 'rgba(16, 185, 129, 0.2)' : 'none',
            border: isSentenceSaved ? '1px solid #10b981' : 'none',
            color: isSentenceSaved ? '#10b981' : '#38bdf8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={isSentenceSaved ? "Frase salva na Ilha PopLab!" : "Salvar esta frase na Ilha PopLab (Influence)"}
        >
          {isSentenceSaved ? <Check size={20} /> : <Plus size={20} />}
        </button>
      </div>


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
            const isPeeked = Boolean(revealedSlotIndices[idx]);
            const isActive = activeSlotIndex === idx && !isSolved && !isPeeked;
            // Check if current input in typing mode has an incorrect prefix
            const hasTypingError = isActive && practiceMode === 'typing' && currentInputWord.length > 0 && !cleanWordForComparison(word).startsWith(cleanWordForComparison(currentInputWord));
            const wordTranslation = getWordTranslation(idx);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {/* Retângulo da lacuna */}
                <div
                  onClick={() => {
                    if (practiceMode === 'typing') {
                      setActiveSlotIndex(idx);
                      if (revealedSlotIndices[idx]) {
                        // Se clicar na lacuna que foi revelada pelo botão, desvisualiza para digitar
                        setRevealedSlotIndices(prev => ({ ...prev, [idx]: false }));
                      }
                      slotInputRef.current?.focus();
                    }
                  }}
                  style={{
                    height: '44px',
                    minWidth: `${Math.max(word.length * 15, 80)}px`,
                    backgroundColor: '#262c37', // Dark horizontal box matching reference
                    border: isSolved 
                      ? '2px solid rgba(74, 222, 128, 0.55)' 
                      : isPeeked
                        ? '2px solid #38bdf8'
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
                    boxShadow: (isActive || isPeeked) ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
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
                  ) : isPeeked ? (
                    /* Word peeked/revealed specifically via gap button */
                    <span style={{
                      color: '#38bdf8', // Bright cyan for peeked slot
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

                {/* Tradução da palavra embaixo de cada lacuna */}
                {showTranslation && (
                  <span style={{
                    fontSize: '0.82rem',
                    color: '#6ee7b7',
                    fontWeight: 600,
                    textAlign: 'center',
                    userSelect: 'none',
                    maxWidth: `${Math.max(word.length * 16, 85)}px`,
                    wordBreak: 'break-word',
                    lineHeight: 1.2,
                    minHeight: '18px'
                  }}>
                    {wordTranslation}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Linha discreta da tradução completa da frase logo abaixo do grupo de lacunas */}
        {showTranslation && currentSub && (
          <div style={{
            maxWidth: '720px',
            margin: '2px auto 0',
            textAlign: 'center',
            padding: '4px 12px'
          }}>
            <span style={{
              fontSize: '0.86rem',
              color: '#a7f3d0',
              fontStyle: 'italic',
              background: 'rgba(16, 185, 129, 0.08)',
              padding: '4px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              🇧🇷 {currentSub.translation || 'Traduzindo para o português...'}
            </span>
          </div>
        )}

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

      {/* 5. SIDEBAR DRAWER: Material / Lessons Catalog Switcher */}
      {isLessonsModalOpen && (
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
            gap: '16px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Menu size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Lições e Materiais</h3>
              </div>
              <button 
                onClick={() => setIsLessonsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Nova Lição Quick Action inside Drawer */}
            <button
              onClick={() => {
                setIsLessonsModalOpen(false);
                setIsNewLessonModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)'}
            >
              <Plus size={16} />
              <span>Adicionar Nova Lição</span>
            </button>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                      {lesson.subtitles.length} frases sincronizadas
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                      {lesson.videoUrl.includes('youtube') ? 'YouTube' : isGoogleDriveUrl(lesson.videoUrl) ? 'Drive' : isFebboxUrl(lesson.videoUrl) ? 'Febbox' : 'MP4'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SIDEBAR DRAWER: Subtitle Upload & AI Extraction */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            height: '100%',
            backgroundColor: '#161922',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.7)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
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
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={handleManualTranscriptSubmit}
                  disabled={!manualTranscriptText.trim()}
                  style={{
                    backgroundColor: manualTranscriptText.trim() ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: manualTranscriptText.trim() ? '#ffffff' : '#6b7280',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: manualTranscriptText.trim() ? 'pointer' : 'default'
                  }}
                >
                  Sincronizar Frases Coladas (Prioridade Máxima)
                </button>
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Captar Legenda do YouTube button */}
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#38bdf8' }}>
                🎬 Captar Legenda do YouTube
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Caso você não adicione um arquivo ou frases manuais, o app capta e preenche a legenda original do YouTube automaticamente. Se você adicionar uma legenda personalizada, ela terá prioridade na sincronização.
              </p>
              <button
                onClick={handleExtractSubtitles}
                disabled={isExtractingSubs}
                style={{
                  marginTop: '4px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: isExtractingSubs ? 'default' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isExtractingSubs ? extractProgressText || 'Captando...' : 'Captar Legenda do YouTube'}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Ícone discreto de Atalhos do Teclado */}
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(prev => !prev)}
                  style={{
                    backgroundColor: isShortcutsOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: isShortcutsOpen ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isShortcutsOpen ? '#38bdf8' : '#9ca3af',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="Atalhos do Teclado e Instruções"
                >
                  <Keyboard size={18} />
                </button>
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
            </div>

            {/* Section: Atalhos do Teclado & Instruções (Ícone discreto com expansão) */}
            <div style={{
              backgroundColor: isShortcutsOpen ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255, 255, 255, 0.04)',
              border: isShortcutsOpen ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all 0.2s'
            }}>
              <div
                onClick={() => setIsShortcutsOpen(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    backgroundColor: isShortcutsOpen ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                    border: isShortcutsOpen ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isShortcutsOpen ? '#38bdf8' : '#9ca3af'
                  }}>
                    <Keyboard size={17} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isShortcutsOpen ? '#38bdf8' : '#e5e7eb', display: 'block' }}>
                      Atalhos do Teclado & Instruções
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#9ca3af' }}>
                      Tab, Shift+Tab, modo contínuo, ícones
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isShortcutsOpen ? '#38bdf8' : '#9ca3af',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isShortcutsOpen ? 'Ocultar' : 'Exibir'}
                </button>
              </div>

              {isShortcutsOpen && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.82rem',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Tab</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Repetir o trecho de áudio/vídeo da frase atual (vocalização)</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Shift + Tab</strong> <span style={{ color: '#6b7280' }}>ou</span> <strong style={{ color: '#38bdf8' }}>Alt + M</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Mostrar todas as palavras da sentença / Limpar respostas</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Ícone Play/Pausa</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Alterna entre pausar a cada frase para você digitar ou seguir contínuo</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Ícone de Olho</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Exibe ou oculta discretamente a tradução sob cada lacuna e abaixo da frase</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Ícone de Ajuda (Lacuna)</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Visualiza ou oculta exclusivamente a palavra da lacuna em que o cursor está posicionado</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Ícone + (Próximo ao Mic)</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Salva a sentença atual na Ilha PopLab (Influence) para repetição espaçada (SRS)</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Ícone de Looping</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Repete a vocalização da frase atual continuamente em looping</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Ícone de Avanço / Modo Manual</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>
                      <span style={{ color: '#e5e7eb' }}>Desativado (Normal):</span> ao concluir as lacunas, o áudio fala a frase e avança automaticamente.<br />
                      <span style={{ color: '#e5e7eb' }}>Ativado (Manual):</span> o áudio fala a frase para você repetir e aguarda o seu clique (&gt;) para avançar.
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong style={{ color: '#38bdf8' }}>Setas (&lt; e &gt;)</strong>
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>Navega entre a frase anterior e a próxima frase da lição</div>
                  </div>

                  {currentSub?.explanation && (
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px', fontSize: '0.8rem', color: '#9ca3af' }}>
                      <strong style={{ color: '#e5e7eb' }}>Dica da frase atual:</strong> {currentSub.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 0: Características Salvas da Lição */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>
                📋 Características Salvas da Lição
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#9ca3af' }}>Título:</span>
                  <strong style={{ color: '#ffffff', textAlign: 'right', maxWidth: '240px', wordBreak: 'break-word' }}>{activeLesson.title}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#9ca3af' }}>Tipo de Mídia:</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}>
                    {activeLesson.videoUrl.includes('youtube') || activeLesson.videoUrl.includes('youtu.be') ? '🎬 YouTube'
                      : isGoogleDriveUrl(activeLesson.videoUrl) ? '📁 Google Drive'
                      : isFebboxUrl(activeLesson.videoUrl) ? '☁️ Febbox Cloud'
                      : '🎥 Vídeo Direto (MP4)'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#9ca3af' }}>Legenda Logada:</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}>
                    {activeLesson.subtitleSource === 'srt_file' ? '📁 Arquivo .SRT'
                      : activeLesson.subtitleSource === 'manual_text' ? '✏️ Texto Manual'
                      : activeLesson.subtitleSource === 'youtube_auto' ? '🎬 Captada do YouTube'
                      : '✨ Predefinida / Integrada'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ color: '#9ca3af' }}>Frases Sincronizadas:</span>
                  <strong style={{ color: '#ffffff' }}>{activeLesson.subtitles.length} frases</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ color: '#9ca3af' }}>Link Salvo do Vídeo:</span>
                  <span style={{
                    color: '#60a5fa',
                    fontSize: '0.76rem',
                    wordBreak: 'break-all',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {activeLesson.videoUrl}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ color: '#9ca3af' }}>Texto da Legenda Salvo (Inglês):</span>
                  <div style={{
                    maxHeight: '80px',
                    overflowY: 'auto',
                    fontSize: '0.75rem',
                    color: '#d1d5db',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {activeLesson.rawTranscriptText || activeLesson.subtitles.map(s => s.text).join('\n')}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span style={{ color: '#9ca3af' }}>Texto da Tradução Salvo (Português):</span>
                  <div style={{
                    maxHeight: '80px',
                    overflowY: 'auto',
                    fontSize: '0.75rem',
                    color: '#a7f3d0',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {activeLesson.portugueseRawText || activeLesson.subtitles.map(s => s.translation).filter(Boolean).join('\n') || 'Tradução automática ativada sob demanda.'}
                  </div>
                </div>
              </div>
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
                🔗 Carregar / Alterar Link do Vídeo
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

            {/* Section 3: Legendas em Português & Arquivos SRT */}
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
                Insira as traduções frase por frase (uma por linha), envie um arquivo .SRT em português ou gere a tradução automaticamente:
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSavePortugueseSubtitles}
                  disabled={!portugueseSubtitlesText.trim()}
                  style={{
                    flex: 1,
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
                  Salvar Tradução em Texto
                </button>

                <button
                  onClick={handleAutoTranslateCurrentLesson}
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Traduzir todas as frases da lição automaticamente com Google Translate"
                >
                  ⚡ Traduzir com IA
                </button>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d1d5db' }}>
                📁 Enviar Legenda em Português (.SRT / .VTT):
              </span>
              <input
                type="file"
                accept=".srt,.vtt,.lrc"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handlePortugueseSrtUpload(e.target.files[0]);
                  }
                }}
                style={{ fontSize: '0.8rem', color: '#9ca3af' }}
              />
            </div>

            {/* Section 4: Legendas em Inglês (.SRT / Arquivo) */}
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
                📁 Legendas em Inglês (.SRT / YouTube)
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Envie um novo arquivo .SRT ou capte as legendas originais do vídeo:
              </p>
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
                  padding: '9px 12px',
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
                <span>Gerenciar Legendas (.SRT / Texto / YouTube)</span>
              </button>
            </div>

            {/* Section 4.5: Destino para Salvar Frases (+) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e5e7eb' }}>
                  🏝️ Destino para Salvar Sentenças (+)
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Ao clicar no ícone <strong>+</strong> próximo ao microfone, a frase da legenda é salva diretamente nesta ilha para suas sessões de repetição espaçada (SRS).
              </p>

              {/* Macro-Ilha (Clima) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d1d5db' }}>
                  Macro-Ilha:
                </label>
                <select
                  value={targetMacroIsland}
                  onChange={(e) => {
                    setTargetMacroIsland(e.target.value);
                    localStorage.setItem('hl_media_macro_island', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="influence">Influence - Conexão & Impacto (Padrão)</option>
                  <option value="flow">Flow - Identidade & Rotina</option>
                  <option value="deepwork">Deep Work - Analítico & Negócios</option>
                  <option value="explorer">Explorer - Lúdico & Descoberta</option>
                </select>
              </div>

              {/* Ilha Específica */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d1d5db' }}>
                  Ilha Específica:
                </label>
                <select
                  value={targetIslandId}
                  onChange={(e) => {
                    setTargetIslandId(e.target.value);
                    localStorage.setItem('hl_media_island_id', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">PopLab (Padrão - Cultura Pop / Shadowing)</option>
                  {categories
                    .filter(c => !c.language_id || c.language_id === targetLanguage)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Section 5: Excluir Lição Atual */}
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

      {/* 8. SIDEBAR DRAWER: Adicionar Nova Lição */}
      {isNewLessonModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            height: '100%',
            backgroundColor: '#161922',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.7)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={22} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Adicionar Nova Lição</h3>
              </div>
              <button
                onClick={() => setIsNewLessonModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.4 }}>
              Cadastre um novo vídeo e suas legendas. Suporta links do <strong>YouTube</strong>, <strong>Google Drive</strong>, <strong>Febbox</strong> ou arquivos diretos MP4.
            </p>

            {/* Título da Lição */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e5e7eb' }}>
                📌 Título da Lição (Opcional):
              </label>
              <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Ex: Entrevista Naturalizer / Cena Malcolm"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '9px 12px',
                  fontSize: '0.84rem'
                }}
              />
            </div>

            {/* Link do Vídeo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e5e7eb' }}>
                🔗 Link do Vídeo (Obrigatório):
              </label>
              <input
                type="text"
                value={newLessonVideoUrl}
                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/... ou https://www.febbox.com/share/... ou Drive"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '9px 12px',
                  fontSize: '0.84rem'
                }}
              />
            </div>

            {/* Legenda em Inglês (Opcional: SRT ou Texto) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#38bdf8' }}>
                🇬🇧 Legenda em Inglês (Opcional - Arquivo .SRT ou Texto)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>Arquivo .SRT / .VTT:</span>
                <input
                  type="file"
                  accept=".srt,.vtt,.lrc"
                  onChange={(e) => setNewLessonEnglishFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '0.8rem', color: '#9ca3af' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>Ou cole o texto linha por linha:</span>
                <textarea
                  rows={2}
                  value={newLessonEnglishText}
                  onChange={(e) => setNewLessonEnglishText(e.target.value)}
                  placeholder="people who are different&#10;should never feel like they do not belong"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '8px',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                * Se não fornecer legenda para links do YouTube, o app tentará captar automaticamente.
              </span>
            </div>

            {/* Legenda em Português / Tradução (Opcional: SRT ou Texto) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#10b981' }}>
                🇧🇷 Tradução em Português (Opcional - Arquivo .SRT ou Texto)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>Arquivo .SRT em português:</span>
                <input
                  type="file"
                  accept=".srt,.vtt,.lrc"
                  onChange={(e) => setNewLessonPortugueseFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '0.8rem', color: '#9ca3af' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>Ou cole as traduções linha por linha:</span>
                <textarea
                  rows={2}
                  value={newLessonPortugueseText}
                  onChange={(e) => setNewLessonPortugueseText(e.target.value)}
                  placeholder="pessoas que são diferentes&#10;nunca deveriam sentir que não pertencem"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '8px',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                * Se deixar em branco, o sistema traduzirá as frases para o português automaticamente!
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCreateNewLesson}
              disabled={isCreatingLesson || !newLessonVideoUrl.trim()}
              style={{
                backgroundColor: newLessonVideoUrl.trim() ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                color: newLessonVideoUrl.trim() ? '#ffffff' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: newLessonVideoUrl.trim() && !isCreatingLesson ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <Plus size={18} />
              <span>{isCreatingLesson ? 'Processando e Traduzindo...' : 'Criar Lição e Começar'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

