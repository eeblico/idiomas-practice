import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { cloudSyncService } from '../services/cloudSync';
import { 
  Video, Upload, Link2, Play, Pause, RotateCcw, 
  ChevronRight, ChevronLeft, Repeat, Volume2, Mic, Info, Star, Bookmark, Share2, 
  ArrowLeft, Download, RefreshCw, X, HelpCircle, Check, Sparkles, Menu,
  Copy, Plus, Maximize, Minimize, Eye, EyeOff, Expand, Shrink, Settings
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
  owe: {
    word: 'owe',
    type: 'verbo',
    pronunciation: '/oʊ/',
    definition: 'Ter a obrigação de pagar ou devolver algo a alguém (financeiramente ou moralmente).',
    context_meaning: 'Ter uma dívida financeira ou moral. Na frase "No, you owe me 20 bucks", indica que Francis deve dinheiro a Malcolm.',
    examples: [
      { sentence: 'I owe you a favor.', translation: 'Eu te devo um favor.' },
      { sentence: 'How much do I owe you?', translation: 'Quanto eu te devo?' }
    ],
    native_usages: [
      'Nativos usam "owe" no dia a dia para dívidas monetárias e também favores/agradecimentos.'
    ],
    chunks: [
      { expression: 'I owe you one', meaning: 'Fico te devendo uma / Muito obrigado', example: 'Thanks for the ride, I owe you one. (Obrigado pela carona, fico te devendo uma.)' }
    ]
  },
  bad: {
    word: 'bad',
    type: 'adjetivo',
    pronunciation: '/bæd/',
    definition: 'Ruim, mau, desagradável ou prejudicial.',
    context_meaning: 'Refere-se ao lado negativo de uma situação. Na frase "The bad thing is", introduz o problema principal da lição.',
    examples: [
      { sentence: 'The weather is really bad today.', translation: 'O tempo está muito ruim hoje.' },
      { sentence: 'He had a bad dream last night.', translation: 'Ele teve um sonho ruim ontem à noite.' }
    ],
    native_usages: [
      'Usado frequentemente em expressões coloquiais como "my bad" (erro meu / desculpa).'
    ],
    chunks: [
      { expression: 'not bad', meaning: 'nada mal / bom', example: 'How is your work? Not bad! (Como está o trabalho? Nada mal!)' },
      { expression: 'too bad', meaning: 'que pena / lamentável', example: 'It is too bad that you cannot come. (É uma pena que você não possa vir.)' }
    ]
  },
  anniversary: {
    word: 'anniversary',
    type: 'substantivo',
    pronunciation: '/ˌæn.ɪˈvɜː.sər.i/',
    definition: 'Aniversário de comemoração de um evento anual histórico, casamento ou fundação.',
    context_meaning: 'Comemoração anual de casamento. Na frase "Mom and Dad\'s anniversary", refere-se ao aniversário de casamento dos pais.',
    examples: [
      { sentence: 'Today is their wedding anniversary.', translation: 'Hoje é o aniversário de casamento deles.' },
      { sentence: 'Happy anniversary!', translation: 'Feliz aniversário de casamento/namoro!' }
    ],
    native_usages: [
      'Atenção: Diferente de "birthday", que é usado estritamente para o aniversário de nascimento de uma pessoa.'
    ],
    chunks: [
      { expression: 'wedding anniversary', meaning: 'aniversário de casamento', example: 'They celebrated their 10th wedding anniversary. (Eles celebraram seu 10º aniversário de casamento.)' }
    ]
  },
  you: {
    word: 'you',
    type: 'pronome',
    pronunciation: '/juː/',
    definition: 'Você ou vocês (segunda pessoa do singular ou plural).',
    context_meaning: 'Pronome direto ou oblíquo usado para se referir ao interlocutor.',
    examples: [
      { sentence: 'I see you.', translation: 'Eu vejo você.' },
      { sentence: 'You are my friend.', translation: 'Você é meu amigo.' }
    ],
    native_usages: [
      'Em conversas informais, "you" costuma ser abreviado ou falado rapidamente como "ya".'
    ],
    chunks: [
      { expression: 'you know', meaning: 'sabe? / tipo assim', example: 'It was great, you know? (Foi ótimo, sabe?)' }
    ]
  },
  cool: {
    word: 'cool',
    type: 'adjetivo / gíria',
    pronunciation: '/kuːl/',
    definition: 'Fresco (temperatura) ou legal, bacana, descolado.',
    context_meaning: 'Expressão de concordância informal ("legal", "beleza", "tudo bem").',
    examples: [
      { sentence: 'He is a cool guy.', translation: 'Ele é um cara legal.' },
      { sentence: 'Keep cool.', translation: 'Mantenha a calma.' }
    ],
    native_usages: [
      'Gíria extremamente comum em todo o mundo para demonstrar aprovação imediata.'
    ],
    chunks: [
      { expression: 'cool down', meaning: 'esfriar a cabeça / acalmar-se', example: 'Give him time to cool down. (Dê tempo para ele se acalmar.)' }
    ]
  },
  trouble: {
    word: 'trouble',
    type: 'substantivo / verbo',
    pronunciation: '/ˈtrʌb.l̩/',
    definition: 'Problema, dificuldade, preocupação, apuros ou encrenca.',
    context_meaning: 'Estar em apuros ou encrenca. Na frase "You\'re not in trouble, Malcolm", significa que ele não fez nada de errado e não sofrerá consequências ou punições.',
    examples: [
      { sentence: 'He got into trouble at school.', translation: 'Ele se meteu em encrenca na escola.' },
      { sentence: 'Sorry to cause you trouble.', translation: 'Desculpe causar problemas para você.' }
    ],
    native_usages: [
      'A expressão "in trouble" é comumente usada para pessoas sob punição ou em dificuldades financeiras/legais.',
      'A frase "get into trouble" significa se meter em encrenca.'
    ],
    chunks: [
      { expression: 'in trouble', meaning: 'encrencado / em apuros', example: 'I am in trouble. (Estou encrencado.)' },
      { expression: 'ask for trouble', meaning: 'procurar sarna pra se coçar', example: 'Don\'t do that, you are asking for trouble. (Não faça isso, você está procurando encrenca.)' }
    ]
  }
};

// --- 3 Pre-loaded High-Fidelity Lessons ---
const PRELOADED_LESSONS: Lesson[] = [
  {
    id: 'malcolm-phone',
    title: 'Malcolm in the Middle - Cena do Telefone',
    description: 'Estude ritmo e entonação natural de diálogos rápidos em inglês.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // 15s clip
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 1.6,
        text: 'The bad thing is,',
        translation: 'A parte ruim é,',
        explanation: 'The bad thing = a parte ruim.',
        words: [
          { text: 'The', start: 0.0, end: 0.4 },
          { text: 'bad', start: 0.4, end: 0.9 },
          { text: 'thing', start: 0.9, end: 1.3 },
          { text: 'is,', start: 1.3, end: 1.6 }
        ]
      },
      {
        id: 2,
        start: 1.6,
        end: 4.0,
        text: 'no one else in the family ever bothers to remember anything.',
        translation: 'ninguém mais na família se importa em lembrar de nada.',
        explanation: 'bothers = se importa/incomoda.',
        words: [
          { text: 'no', start: 1.6, end: 2.0 },
          { text: 'one', start: 2.0, end: 2.3 },
          { text: 'else', start: 2.3, end: 2.6 },
          { text: 'in', start: 2.6, end: 2.8 },
          { text: 'the', start: 2.8, end: 3.0 },
          { text: 'family', start: 3.0, end: 3.4 },
          { text: 'ever', start: 3.4, end: 3.7 },
          { text: 'bothers', start: 3.7, end: 4.0 }
        ]
      },
      {
        id: 3,
        start: 4.0,
        end: 5.2,
        text: 'Hey Francis,',
        translation: 'Ei Francis,',
        explanation: 'Hey Francis = ei Francis.',
        words: [
          { text: 'Hey', start: 4.0, end: 4.5 },
          { text: 'Francis,', start: 4.5, end: 5.2 }
        ]
      },
      {
        id: 4,
        start: 5.2,
        end: 9.0,
        text: "you told me to remind you about Mom and Dad's anniversary.",
        translation: 'você me disse para te lembrar do aniversário da mamãe e do papai.',
        explanation: "told me to remind = me disse para lembrar. Dad's = do papai.",
        words: [
          { text: 'you', start: 5.2, end: 5.7 },
          { text: 'told', start: 5.7, end: 6.2 },
          { text: 'me', start: 6.2, end: 6.6 },
          { text: 'to', start: 6.6, end: 7.0 },
          { text: 'remind', start: 7.0, end: 7.6 },
          { text: 'you', start: 7.6, end: 8.0 },
          { text: 'about', start: 8.0, end: 8.4 },
          { text: 'Mom', start: 8.4, end: 8.7 },
          { text: 'and', start: 8.7, end: 9.0 }
        ]
      },
      {
        id: 5,
        start: 9.0,
        end: 15.0,
        text: 'No, you owe me 20 bucks.',
        translation: 'Não, você me deve 20 pratas.',
        explanation: 'owe me = me deve. bucks = dólares/pratas.',
        words: [
          { text: 'No,', start: 9.0, end: 9.8 },
          { text: 'you', start: 9.8, end: 10.8 },
          { text: 'owe', start: 10.8, end: 11.8 },
          { text: 'me', start: 11.8, end: 12.8 },
          { text: '20', start: 12.8, end: 13.8 },
          { text: 'bucks.', start: 13.8, end: 15.0 }
        ]
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
        end: 1.5,
        text: 'Cool.',
        translation: 'Legal.',
        explanation: 'Cool = legal/beleza.',
        words: [
          { text: 'Cool.', start: 0.0, end: 1.5 }
        ]
      },
      {
        id: 2,
        start: 1.5,
        end: 4.0,
        text: 'Thanks, man.',
        translation: 'Valeu, cara.',
        explanation: 'Thanks, man = valeu cara.',
        words: [
          { text: 'Thanks,', start: 1.5, end: 3.0 },
          { text: 'man.', start: 3.0, end: 4.0 }
        ]
      },
      {
        id: 3,
        start: 4.0,
        end: 8.0,
        text: 'I owe you one.',
        translation: 'Fico te devendo uma.',
        explanation: 'I owe you one = fico te devendo uma.',
        words: [
          { text: 'I', start: 4.0, end: 5.0 },
          { text: 'owe', start: 5.0, end: 6.0 },
          { text: 'you', start: 6.0, end: 7.0 },
          { text: 'one.', start: 7.0, end: 8.0 }
        ]
      },
      {
        id: 4,
        start: 8.0,
        end: 15.0,
        text: 'No, you owe me 20.',
        translation: 'Não, você me deve 20.',
        explanation: 'owe me = me deve.',
        words: [
          { text: 'No,', start: 8.0, end: 9.5 },
          { text: 'you', start: 9.5, end: 11.0 },
          { text: 'owe', start: 11.0, end: 12.5 },
          { text: 'me', start: 12.5, end: 13.5 },
          { text: '20.', start: 13.5, end: 15.0 }
        ]
      }
    ]
  },
  {
    id: 'ai-ted-talk',
    title: 'TED Talk - O Futuro dos Idiomas com IA',
    description: 'Treine vocabulário formal e acadêmico sobre tecnologia.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 2.0,
        text: 'Artificial intelligence',
        translation: 'A inteligência artificial',
        explanation: 'Artificial intelligence = inteligência artificial.',
        words: [
          { text: 'Artificial', start: 0.0, end: 0.8 },
          { text: 'intelligence', start: 0.8, end: 1.6 },
          { text: 'is', start: 1.6, end: 2.0 }
        ]
      },
      {
        id: 2,
        start: 2.0,
        end: 5.0,
        text: 'is changing the way we learn languages.',
        translation: 'está mudando o jeito que aprendemos idiomas.',
        explanation: 'changing the way = mudando o jeito.',
        words: [
          { text: 'changing', start: 2.0, end: 2.8 },
          { text: 'the', start: 2.8, end: 3.2 },
          { text: 'way', start: 3.2, end: 3.8 },
          { text: 'we', start: 3.8, end: 4.2 },
          { text: 'learn', start: 4.2, end: 4.6 },
          { text: 'languages.', start: 4.6, end: 5.0 }
        ]
      },
      {
        id: 3,
        start: 5.0,
        end: 8.0,
        text: 'By listening to real media,',
        translation: 'Ao ouvir mídias reais,',
        explanation: 'By listening = ao ouvir.',
        words: [
          { text: 'By', start: 5.0, end: 5.6 },
          { text: 'listening', start: 5.6, end: 6.4 },
          { text: 'to', start: 6.4, end: 6.8 },
          { text: 'real', start: 6.8, end: 7.4 },
          { text: 'media,', start: 7.4, end: 8.0 }
        ]
      },
      {
        id: 4,
        start: 8.0,
        end: 10.0,
        text: 'you acquire vocabulary naturally.',
        translation: 'você adquire vocabulário naturalmente.',
        explanation: 'acquire = adquire.',
        words: [
          { text: 'you', start: 8.0, end: 8.4 },
          { text: 'acquire', start: 8.4, end: 9.0 },
          { text: 'vocabulary', start: 9.0, end: 9.6 },
          { text: 'naturally.', start: 9.6, end: 10.0 }
        ]
      },
      {
        id: 5,
        start: 10.0,
        end: 12.8,
        text: 'Repetition and active recall',
        translation: 'Repetição e recordação ativa',
        explanation: 'active recall = recordação ativa.',
        words: [
          { text: 'Repetition', start: 10.0, end: 11.0 },
          { text: 'and', start: 11.0, end: 11.5 },
          { text: 'active', start: 11.5, end: 12.2 },
          { text: 'recall', start: 12.2, end: 12.8 }
        ]
      },
      {
        id: 6,
        start: 12.8,
        end: 15.0,
        text: 'are the keys to long-term memory.',
        translation: 'são as chaves para a memória de longo prazo.',
        explanation: 'long-term = longo prazo.',
        words: [
          { text: 'are', start: 12.8, end: 13.2 },
          { text: 'the', start: 13.2, end: 13.6 },
          { text: 'keys', start: 13.6, end: 14.0 },
          { text: 'to', start: 14.0, end: 14.3 },
          { text: 'memory.', start: 14.3, end: 15.0 }
        ]
      }
    ]
  }
];

// --- IndexedDB Persistance for Custom Local Media Files ---
const dbName = 'MediaStudyDB';
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

const cleanDuplicatePhrases = (text: string): string => {
  let prevText = '';
  let cleaned = text.replace(/\s+/g, ' ').trim();
  for (let i = 0; i < 5; i++) {
    prevText = cleaned;
    cleaned = cleaned.replace(/\b(.+?)(?:\s+\1\b)+/gi, '$1');
    if (cleaned === prevText) break;
  }
  return cleaned;
};

const splitLineByLength = (text: string, maxWords: number = 10): string[] => {
  const words = text.split(' ');
  if (words.length <= maxWords) return [text];
  const result: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    result.push(words.slice(i, i + maxWords).join(' '));
  }
  return result;
};

const splitSubtitleText = (text: string): string[] => {
  const clean = cleanDuplicatePhrases(text);
  const parts = clean.split(/(?<=[.?!])\s+/);
  const result: string[] = [];
  parts.forEach(part => {
    if (part.split(' ').length > 12 && part.includes(',')) {
      const subParts = part.split(/(?<=[,])\s+/);
      subParts.forEach(sp => {
        if (sp.split(' ').length > 10) {
          result.push(...splitLineByLength(sp.trim(), 10));
        } else {
          result.push(sp.trim());
        }
      });
    } else if (part.split(' ').length > 10) {
      result.push(...splitLineByLength(part, 10));
    } else {
      result.push(part);
    }
  });
  return result;
};

export const MediaStudy: React.FC = () => {
  const { toggleFavorite, favorites, addCustomPhrase, targetLanguage } = useApp();

  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isTheaterFullscreen, setIsTheaterFullscreen] = useState(false);
  const [hideOriginals, setHideOriginals] = useState(false);
  const [hideTranslations, setHideTranslations] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const [individuallyHiddenCards, setIndividuallyHiddenCards] = useState<Record<number, boolean>>({});
  const [inlineGeminiKey, setInlineGeminiKey] = useState(() => {
    return localStorage.getItem('hl_gemini_key') || '';
  });

  const handleAddAsCustomPhrase = async (sub: Subtitle) => {
    try {
      await addCustomPhrase(
        sub.text,
        sub.translation,
        sub.explanation || 'Adicionado a partir do Shadowing.',
        'medium',
        'Fenrir',
        1.0
      );
      alert('Sentença adicionada com sucesso à sua ilha personalizada ("📚 Shadowing Vocab")!');
    } catch (err) {
      console.error('Error adding custom phrase:', err);
      alert('Erro ao salvar frase personalizada.');
    }
  };

  const handleAddWordToIsland = async () => {
    if (!wordExplainData) return;
    try {
      // Build a rich Markdown explanation for the flashcard containing all contextual data
      let explanationMarkdown = `Tipo: ${wordExplainData.type || 'vocábulo'} | Pronúncia: ${wordExplainData.pronunciation || '/.../'}\n\n`;
      
      if (wordExplainData.context_meaning) {
        explanationMarkdown += `💡 **Significado no Contexto:**\n${wordExplainData.context_meaning}\n\n`;
      } else {
        explanationMarkdown += `💡 **Significado no Contexto:**\n${wordExplainData.definition}\n\n`;
      }
      
      if (wordExplainData.examples && Array.isArray(wordExplainData.examples) && wordExplainData.examples.length > 0) {
        explanationMarkdown += `📝 **Exemplos de Uso:**\n`;
        wordExplainData.examples.forEach((ex: any) => {
          explanationMarkdown += `- *${ex.sentence}*\n  (Trad: ${ex.translation})\n`;
        });
        explanationMarkdown += `\n`;
      } else if (wordExplainData.example) {
        explanationMarkdown += `📝 **Exemplo de Uso:**\n- *${wordExplainData.example}*\n\n`;
      }

      if (wordExplainData.native_usages && Array.isArray(wordExplainData.native_usages) && wordExplainData.native_usages.length > 0) {
        explanationMarkdown += `🗣️ **Formas usadas por Nativos:**\n`;
        wordExplainData.native_usages.forEach((usage: string) => {
          explanationMarkdown += `- ${usage}\n`;
        });
        explanationMarkdown += `\n`;
      }

      if (wordExplainData.chunks && Array.isArray(wordExplainData.chunks) && wordExplainData.chunks.length > 0) {
        explanationMarkdown += `🔗 **Chunks e Expressões:**\n`;
        wordExplainData.chunks.forEach((chk: any) => {
          explanationMarkdown += `- **${chk.expression}**: ${chk.meaning}\n  *Ex: ${chk.example || ''}*\n`;
        });
      } else if (wordExplainData.chunk_explanation) {
        explanationMarkdown += `🔗 **Chunks e Expressões:**\n${wordExplainData.chunk_explanation}\n`;
      }

      await addCustomPhrase(
        wordExplainData.word,
        wordExplainData.context_meaning || wordExplainData.definition,
        explanationMarkdown.trim(),
        'medium',
        'Fenrir',
        1.0
      );
      alert(`Palavra "${wordExplainData.word}" adicionada com sucesso à sua ilha personalizada ("📚 Shadowing Vocab")!`);
    } catch (err) {
      console.error('Error adding custom word:', err);
      alert('Erro ao salvar palavra personalizada.');
    }
  };

  // --- Core States ---
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [customLessons, setCustomLessons] = useState<Lesson[]>(() => {
    try {
      const stored = localStorage.getItem('hl_custom_lessons');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Importer screen states
  const [importFormOpen, setImportFormOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'video' | 'audio'>('video');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingProgressText, setLoadingProgressText] = useState('');

  // Custom subtitles update states
  const [isSubtitleConfigModalOpen, setIsSubtitleConfigModalOpen] = useState(false);
  const [isSubSettingsOpen, setIsSubSettingsOpen] = useState(false);
  const [newSubtitleFile, setNewSubtitleFile] = useState<File | null>(null);
  const [loadingNewSubtitle, setLoadingNewSubtitle] = useState(false);
  const [newSubProgressText, setNewSubProgressText] = useState('');

  // Synced playback states
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [subtitleDelay, setSubtitleDelay] = useState(0.0); // Subtitle delay in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [loopCountTarget, setLoopCountTarget] = useState<number>(0); // 0 = off, 1 = 1x, 2 = 2x, 3 = 3x, 5 = 5x, -1 = infinite
  const [loopCountCurrent, setLoopCountCurrent] = useState<number>(0);
  const loopCurrent = loopCountTarget !== 0;

  // Subtitle custom styling states (color and word spacing)
  const [subtitleColor, setSubtitleColor] = useState<string>(() => {
    return localStorage.getItem('hl_subtitle_color') || '#ffffff';
  });
  const [wordSpacing, setWordSpacing] = useState<number>(() => {
    const saved = localStorage.getItem('hl_subtitle_spacing');
    return saved ? parseInt(saved, 10) : 6;
  });

  // Active step flow (Ouvir, Entender, Imitar, Comparar)
  const [studyStep, setStudyStep] = useState<'ouvir' | 'entender' | 'imitar' | 'comparar'>('ouvir');

  // Word explanation popup state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedWordContext, setSelectedWordContext] = useState<string | null>(null);
  const [wordExplainData, setWordExplainData] = useState<any>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Voice recording & Shadowing states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAvailable, setRecordingAvailable] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [compareScore, setCompareScore] = useState<number | null>(null);

  // Miraa layout widget states
  const [pinCurrent, setPinCurrent] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [loadingSentenceExplain, setLoadingSentenceExplain] = useState(false);
  const [sentenceExplainData, setSentenceExplainData] = useState<string | null>(null);

  const [microphoneStatusText, setMicrophoneStatusText] = useState('');

  // Refs for media players
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const subtitleScrollRef = useRef<HTMLDivElement | null>(null);

  // YouTube API Player states
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [youtubePlayerReady, setYoutubePlayerReady] = useState(false);

  // State to hold the active or last active subtitle to avoid layout shifts/flashing
  const [lastActiveSubtitle, setLastActiveSubtitle] = useState<Subtitle | null>(null);

  // --- Subtitle Parser Helpers ---
  const parseSRT = (data: string): Subtitle[] => {
    const subs: Subtitle[] = [];
    const blocks = data.trim().split(/\r?\n\r?\n/);
    
    blocks.forEach((block, index) => {
      const lines = block.trim().split(/\r?\n/);
      if (lines.length >= 3) {
        const id = parseInt(lines[0]) || index + 1;
        const timeMatch = lines[1].match(/(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)/);
        if (timeMatch) {
          const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
          const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
          const text = lines.slice(2).join(' ');
          
          subs.push({ id, start, end, text, translation: '' });
        }
      }
    });
    return subs;
  };

  const parseLRC = (data: string): Subtitle[] => {
    const subs: Subtitle[] = [];
    const lines = data.split(/\r?\n/);
    let id = 1;
    
    lines.forEach((line) => {
      const match = line.trim().match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const ms = parseInt(match[3]) * 10;
        const start = minutes * 60 + seconds + ms / 1000;
        const text = match[4].trim();
        if (text) {
          subs.push({ id: id++, start, end: start + 4, text, translation: '' });
        }
      }
    });
    
    for (let i = 0; i < subs.length - 1; i++) {
      subs[i].end = subs[i+1].start;
    }
    return subs;
  };

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
        if (paths.includes('embed')) {
          return paths[paths.indexOf('embed') + 1];
        }
        if (paths.includes('v')) {
          return paths[paths.indexOf('v') + 1];
        }
      }
    } catch (e) {
      // fallback
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Google Translate free GTX API — translates from the study language into Brazilian Portuguese
  const translateText = async (text: string): Promise<string> => {
    try {
      // sl = study language (source), tl = pt (native / interface language)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${targetLanguage}&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json[0].map((item: any) => item[0]).join('');
    } catch {
      return `[Tradução] ${text}`;
    }
  };

  // Optimized Batch Translator (translates chunks in parallel to avoid mismatches and improve speed)
  const translateSubtitlesBatch = async (subs: Subtitle[]): Promise<Subtitle[]> => {
    const result = [...subs];
    const batchSize = 5;
    for (let i = 0; i < result.length; i += batchSize) {
      setLoadingProgressText(`Traduzindo legendas: ${Math.round((i / result.length) * 100)}%`);
      const chunk = result.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(async (sub) => {
          sub.translation = await translateText(sub.text);
        })
      );
    }
    return result;
  };

  // --- Subtitles Synchronization & Derived Data ---
  const adjustedSubtitles = useMemo(() => {
    if (!activeLesson) return [];
    return activeLesson.subtitles.map(s => {
      // Shift subtitle timings by the subtitleDelay
      const shiftedStart = Math.max(0, s.start + subtitleDelay);
      const shiftedEnd = Math.max(0, s.end + subtitleDelay);
      
      // Also shift word timings if present
      const shiftedWords = s.words?.map(w => ({
        ...w,
        start: Math.max(0, w.start + subtitleDelay),
        end: Math.max(0, w.end + subtitleDelay)
      }));

      return {
        ...s,
        start: shiftedStart,
        end: shiftedEnd,
        words: shiftedWords
      };
    });
  }, [activeLesson, subtitleDelay]);

  const activeSubtitle = useMemo(() => {
    if (!activeLesson) return null;
    return adjustedSubtitles.find(s => currentTime >= s.start && currentTime <= s.end) || null;
  }, [adjustedSubtitles, currentTime]);

  const isSubtitleActive = useMemo(() => {
    if (!activeSubtitle || !lastActiveSubtitle) return false;
    return activeSubtitle.id === lastActiveSubtitle.id;
  }, [activeSubtitle, lastActiveSubtitle]);

  const shouldShowSubtitleText = useMemo(() => {
    if (!isPlaying || pinCurrent || loopCurrent) return true;
    if (activeSubtitle !== null) return true;
    if (!lastActiveSubtitle) return false;
    
    // Find the next subtitle in timeline
    const nextSub = adjustedSubtitles.find(s => s.start > currentTime);
    
    // If the gap since the last subtitle ended is small (< 0.8s) 
    // OR the gap until the next subtitle starts is small (< 0.8s)
    const timeSinceLastEnd = currentTime - lastActiveSubtitle.end;
    const timeToNextStart = nextSub ? nextSub.start - currentTime : Infinity;
    
    if (timeSinceLastEnd < 0.8 || timeToNextStart < 0.8) {
      return true;
    }
    
    return false;
  }, [isPlaying, activeSubtitle, lastActiveSubtitle, currentTime, adjustedSubtitles, pinCurrent, loopCurrent]);

  const activeWordIndex = useMemo(() => {
    if (!activeSubtitle || !activeSubtitle.words) return -1;
    
    // Find exact active word from word timings
    const idx = activeSubtitle.words.findIndex(w => currentTime >= w.start && currentTime <= w.end);
    if (idx !== -1) return idx;

    // Mathematical estimation fallback if playing inside range
    const dur = activeSubtitle.end - activeSubtitle.start;
    if (dur > 0 && currentTime >= activeSubtitle.start && currentTime <= activeSubtitle.end) {
      const progress = (currentTime - activeSubtitle.start) / dur;
      return Math.min(Math.floor(progress * activeSubtitle.words.length), activeSubtitle.words.length - 1);
    }
    return -1;
  }, [activeSubtitle, currentTime]);

  // --- Looping and Time Updates Ticks ---
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    
    // Handle loop repetition mode using lastActiveSubtitle so it is robust to silence gaps
    if (loopCurrent && lastActiveSubtitle) {
      if (time >= lastActiveSubtitle.end || time < lastActiveSubtitle.start) {
        if (loopCountTarget === -1) {
          // Infinite loop
          seekTo(lastActiveSubtitle.start);
        } else {
          // N-repetition loop
          if (loopCountCurrent < loopCountTarget) {
            seekTo(lastActiveSubtitle.start);
            setLoopCountCurrent(prev => prev + 1);
          } else {
            // Repetitions finished, disable loop and let it play normally
            setLoopCountTarget(0);
            setLoopCountCurrent(0);
          }
        }
      }
    }
  };

  const handleTimeUpdateRef = useRef(handleTimeUpdate);
  useEffect(() => {
    handleTimeUpdateRef.current = handleTimeUpdate;
  });

  const seekTo = (seconds: number) => {
    if (youtubePlayer && youtubePlayerReady) {
      youtubePlayer.seekTo(seconds, true);
      setCurrentTime(seconds);
    } else if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    } else if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (youtubePlayer && youtubePlayerReady) youtubePlayer.pauseVideo();
      if (videoPlayerRef.current) videoPlayerRef.current.pause();
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      if (youtubePlayer && youtubePlayerReady) youtubePlayer.playVideo();
      if (videoPlayerRef.current) videoPlayerRef.current.play().catch(() => {});
      if (audioPlayerRef.current) audioPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Adjust playback speed
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (youtubePlayer && youtubePlayerReady) youtubePlayer.setPlaybackRate(speed);
    if (videoPlayerRef.current) videoPlayerRef.current.playbackRate = speed;
    if (audioPlayerRef.current) audioPlayerRef.current.playbackRate = speed;
  };

  // Jump phrase isolada previous/next
  const skipPhrase = (direction: 'prev' | 'next') => {
    if (!activeLesson || adjustedSubtitles.length === 0) return;
    const subs = adjustedSubtitles;
    
    let nextIdx = 0;
    const curIdx = subs.findIndex(s => lastActiveSubtitle?.id === s.id);

    if (curIdx === -1) {
      nextIdx = subs.findIndex(s => s.start > currentTime);
      if (nextIdx === -1) nextIdx = subs.length - 1;
    } else {
      if (direction === 'prev') {
        nextIdx = Math.max(0, curIdx - 1);
      } else {
        nextIdx = Math.min(subs.length - 1, curIdx + 1);
      }
    }
    seekTo(subs[nextIdx].start + 0.1);
  };

  // --- YouTube IFrame API Setup ---
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
              cc_load_policy: 0,  // Hide CC by default
              iv_load_policy: 3   // Hide annotations
            },
            events: {
              onReady: (event: any) => {
                setYoutubePlayer(event.target);
                setYoutubePlayerReady(true);
                if (playbackSpeed !== 1.0) {
                  event.target.setPlaybackRate(playbackSpeed);
                }
                // Unload native YouTube captions modules to prevent dual overlap
                try {
                  if (typeof event.target.unloadModule === 'function') {
                    event.target.unloadModule('captions');
                    event.target.unloadModule('cc');
                  }
                } catch (e) {
                  console.error('Failed to unload YouTube captions:', e);
                }
              },
              onStateChange: (event: any) => {
                if (event.data === 1) {
                  setIsPlaying(true);
                } else {
                  setIsPlaying(false);
                }
              }
            }
          });
        }
      }, 50);
    };

    const checkAndInit = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
      } else {
        const interval = setInterval(() => {
          if ((window as any).YT && (window as any).YT.Player) {
            clearInterval(interval);
            initPlayer();
          }
        }, 100);
      }
    };

    if (!(window as any).YT) {
      const existingTag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingTag) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      const oldCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof oldCallback === 'function') oldCallback();
        checkAndInit();
      };
      checkAndInit();
    } else {
      checkAndInit();
    }

    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
      setYoutubePlayer(null);
      setYoutubePlayerReady(false);
    };
  }, [activeLesson]);

  // YouTube Player progress timer polling (polls always when loaded to keep scrolls and highlights synchronized)
  useEffect(() => {
    if (!youtubePlayer || !youtubePlayerReady) return;

    const interval = setInterval(() => {
      try {
        const time = youtubePlayer.getCurrentTime();
        if (typeof time === 'number') {
          handleTimeUpdateRef.current(time);
        }
      } catch (e) {
        // ignore errors
      }
    }, 50);

    return () => clearInterval(interval);
  }, [youtubePlayer, youtubePlayerReady]);

  // Reset practice states and subtitle delay when the active lesson itself changes
  useEffect(() => {
    setPinCurrent(false);
    setInfoOpen(false);
    setSentenceExplainData(null);
    setCompareScore(null);
    setUserTranscript('');
    setRecordingAvailable(false);
    setSubtitleDelay(0.0); // Reset sync offset for new lesson
    
    if (activeLesson && activeLesson.subtitles.length > 0) {
      setLastActiveSubtitle(activeLesson.subtitles[0]);
    } else {
      setLastActiveSubtitle(null);
    }
  }, [activeLesson?.id]);

  const togglePlayRef = useRef(togglePlay);
  const skipPhraseRef = useRef(skipPhrase);

  useEffect(() => {
    togglePlayRef.current = togglePlay;
    skipPhraseRef.current = skipPhrase;
  });

  // Keyboard shortcuts (Space = play/pause, A = previous sentence, D = next/advance sentence, S = loop cycle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in text fields/inputs
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
      }

      const key = e.key.toLowerCase();
      if (e.code === 'Space' || e.key === ' ') {
        // For Space, also ignore if focused on a button or link to let the browser's default click trigger instead
        if (activeEl) {
          const tagName = activeEl.tagName.toLowerCase();
          const role = activeEl.getAttribute('role');
          if (tagName === 'button' || tagName === 'a' || role === 'button') {
            return;
          }
        }
        e.preventDefault(); // Prevent page scroll down on space key
        togglePlayRef.current();
      } else if (key === 'a') {
        skipPhraseRef.current('prev');
      } else if (key === 'd') {
        skipPhraseRef.current('next');
      } else if (key === 's') {
        setLoopCountTarget(prev => {
          if (prev === 0) return 1;
          if (prev === 1) return 2;
          if (prev === 2) return 3;
          if (prev === 3) return 5;
          if (prev === 5) return -1; // -1 represents infinite
          return 0; // go back to off
        });
        setLoopCountCurrent(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update lastActiveSubtitle reference when subtitleDelay changes to preserve the currently active sentence
  useEffect(() => {
    if (lastActiveSubtitle && adjustedSubtitles.length > 0) {
      const counterpart = adjustedSubtitles.find(s => s.id === lastActiveSubtitle.id);
      if (counterpart) {
        setLastActiveSubtitle(counterpart);
      }
    }
  }, [subtitleDelay]);

  // Keep track of the last active subtitle to avoid UI layout flashing during timeline gaps
  useEffect(() => {
    if (activeSubtitle && !pinCurrent) {
      setLastActiveSubtitle(activeSubtitle);
    }
  }, [activeSubtitle, pinCurrent]);

  // Reset loop repetition count on subtitle change
  useEffect(() => {
    setLoopCountCurrent(0);
  }, [lastActiveSubtitle?.id]);

  // Auto-scroll subtitles to keep active subtitle positioned directly below video player
  useEffect(() => {
    if (!lastActiveSubtitle || !subtitleScrollRef.current) return;
    
    const container = subtitleScrollRef.current;
    const activeEl = container.querySelector('.subtitle-block-card.active') as HTMLElement;
    
    if (activeEl) {
      const elemTop = activeEl.offsetTop;
      
      container.scrollTo({
        top: elemTop - 10,
        behavior: 'smooth'
      });
    }
  }, [lastActiveSubtitle?.id]);

  // Disable body and app-content scrolling/overflow when video is fullscreen
  useEffect(() => {
    if (isTheaterFullscreen) {
      document.body.style.overflow = 'hidden';
      const appContent = document.querySelector('.app-content') as HTMLElement;
      if (appContent) {
        appContent.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
      const appContent = document.querySelector('.app-content') as HTMLElement;
      if (appContent) {
        appContent.style.overflow = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      const appContent = document.querySelector('.app-content') as HTMLElement;
      if (appContent) {
        appContent.style.overflow = '';
      }
    };
  }, [isTheaterFullscreen]);

  // High-frequency polling loop for HTML5 video/audio elements to guarantee real-time word highlights
  useEffect(() => {
    if (!isPlaying) return;
    const isYoutube = activeLesson?.videoUrl.includes('youtube.com') || activeLesson?.videoUrl.includes('youtu.be');
    if (isYoutube) return;

    const interval = setInterval(() => {
      const activeEl = videoPlayerRef.current || audioPlayerRef.current;
      if (activeEl) {
        handleTimeUpdateRef.current(activeEl.currentTime);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, activeLesson?.id]);

  // --- YouTube Subtitle Fetching API Parser ---
  const handleCustomImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let srcUrl = '';
    let loadedSubs: Subtitle[] = [];
    setLoadingMedia(true);
    setLoadingProgressText('Iniciando carregamento da mídia...');

    try {
      if (youtubeUrl.trim()) {
        const videoId = getYoutubeVideoId(youtubeUrl);
        if (!videoId) {
          alert('Link do YouTube inválido!');
          setLoadingMedia(false);
          return;
        }

        srcUrl = youtubeUrl;
        setLoadingProgressText('Buscando transcrição no youtube-transcript.ai...');

        // 1. Fetch transcript from public CORS-enabled endpoint
        const transcriptUrl = `https://youtube-transcript.ai/transcript/${videoId}.txt`;
        const res = await fetch(transcriptUrl);
        
        if (res.ok) {
          const text = await res.text();
          const lines = text.split('\n');
          const tempSubs: { start: number; text: string }[] = [];

          lines.forEach((line) => {
            // Match timestamp in markdown [m:ss] or [h:mm:ss]
            const match = line.match(/^\[(?:(\d+):)?(\d+):(\d+)\]\s*(.*)/);
            if (match) {
              const hours = match[1] ? parseInt(match[1]) : 0;
              const minutes = parseInt(match[2]);
              const seconds = parseInt(match[3]);
              const start = hours * 3600 + minutes * 60 + seconds;
              const subText = match[4].trim();
              if (subText) {
                tempSubs.push({ start, text: subText });
              }
            }
          });

          let subId = 1;
          for (let i = 0; i < tempSubs.length; i++) {
            const currentBlock = tempSubs[i];
            const nextBlock = tempSubs[i + 1];
            
            // Calculate actual duration based on next block start time
            const start = currentBlock.start;
            const end = nextBlock ? nextBlock.start : start + 6.0;
            const duration = end - start;

            // Clean duplicates and split into smaller lines/cards
            const cleanedText = cleanDuplicatePhrases(currentBlock.text);
            const parts = splitSubtitleText(cleanedText);
            
            const totalChars = parts.reduce((sum, p) => sum + p.length, 0) || 1;
            let currentStart = start;
            
            parts.forEach((part) => {
              const partDur = duration * (part.length / totalChars);
              loadedSubs.push({
                id: subId++,
                start: currentStart,
                end: currentStart + partDur,
                text: part,
                translation: ''
              });
              currentStart += partDur;
            });
          }

          // Set end times dynamically
          for (let i = 0; i < loadedSubs.length - 1; i++) {
            loadedSubs[i].end = loadedSubs[i+1].start;
          }
        }
      } else if (mediaFile) {
        srcUrl = URL.createObjectURL(mediaFile);
        
        if (subtitleFile) {
          setLoadingProgressText('Lendo arquivo de legenda local...');
          const text = await subtitleFile.text();
          if (subtitleFile.name.endsWith('.srt')) {
            loadedSubs = parseSRT(text);
          } else if (subtitleFile.name.endsWith('.lrc')) {
            loadedSubs = parseLRC(text);
          }
        }
      } else {
        alert('Por favor, cole um link do YouTube ou envie um arquivo de mídia local!');
        setLoadingMedia(false);
        return;
      }

      // Fallback subtitles if none parsed
      if (loadedSubs.length === 0) {
        setLoadingProgressText('Nenhuma legenda encontrada. Criando legendas automáticas...');
        loadedSubs = [
          { id: 1, start: 0.0, end: 4.0, text: 'Welcome to this listening shadowing session.', translation: '' },
          { id: 2, start: 4.0, end: 8.0, text: 'We will practice rhythm, speaking cadence, and active recall.', translation: '' },
          { id: 3, start: 8.0, end: 14.0, text: 'Click on any word to get real-time AI-powered definitions.', translation: '' }
        ];
      }

      // 2. Translate subtitles to Portuguese using Google Translate
      setLoadingProgressText('Traduzindo legendas para português...');
      loadedSubs = await translateSubtitlesBatch(loadedSubs);

      // 3. Generate word-level timings
      loadedSubs = loadedSubs.map(s => {
        const words = s.text.split(/\s+/);
        const wList = words.map((word, idx) => {
          const wordDur = (s.end - s.start) / words.length;
          return {
            text: word,
            start: s.start + idx * wordDur,
            end: s.start + (idx + 1) * wordDur
          };
        });
        return { ...s, words: wList };
      });

      const newLessonId = `custom-${Date.now()}`;
      if (mediaFile) {
        await saveFileToDB(newLessonId, mediaFile);
      }

      const newLesson: Lesson = {
        id: newLessonId,
        title: mediaFile ? mediaFile.name : 'YouTube Video Importado',
        description: 'Estudo de vídeo customizado',
        videoUrl: srcUrl,
        subtitles: loadedSubs
      };

      // Save to custom lessons database list
      const nextCustomLessons = [newLesson, ...customLessons];
      setCustomLessons(nextCustomLessons);
      localStorage.setItem('hl_custom_lessons', JSON.stringify(nextCustomLessons));
      cloudSyncService.pushToCloud({ customLessons: nextCustomLessons });

      setActiveLesson(newLesson);
      setImportFormOpen(false);
      setYoutubeUrl('');
      setMediaFile(null);
      setSubtitleFile(null);
      setCurrentTime(0);
      setLoopCountTarget(0);
      setLoopCountCurrent(0);
      setIsPlaying(false);

    } catch (err) {
      console.error('Import failed:', err);
      alert('Falha ao processar mídia. Verifique a conexão ou se o vídeo possui CC/Legendas públicas.');
    } finally {
      setLoadingMedia(false);
      setLoadingProgressText('');
    }
  };

  const handleUpdateSubtitles = async () => {
    if (!activeLesson || !newSubtitleFile) return;
    setLoadingNewSubtitle(true);
    setNewSubProgressText('Lendo arquivo de legenda...');

    try {
      const text = await newSubtitleFile.text();
      let loadedSubs: Subtitle[] = [];

      if (newSubtitleFile.name.endsWith('.srt')) {
        loadedSubs = parseSRT(text);
      } else if (newSubtitleFile.name.endsWith('.lrc')) {
        loadedSubs = parseLRC(text);
      } else {
        alert('Formato de arquivo não suportado! Use apenas .srt ou .lrc');
        setLoadingNewSubtitle(false);
        return;
      }

      if (loadedSubs.length === 0) {
        alert('Nenhuma legenda válida pôde ser extraída do arquivo.');
        setLoadingNewSubtitle(false);
        return;
      }

      // 2. Translate subtitles to Portuguese
      setNewSubProgressText('Traduzindo legendas para português...');
      loadedSubs = await translateSubtitlesBatch(loadedSubs);

      // 3. Generate word-level timings
      setNewSubProgressText('Gerando marcas temporais de palavras...');
      loadedSubs = loadedSubs.map(s => {
        const words = s.text.split(/\s+/);
        const wList = words.map((word, idx) => {
          const wordDur = (s.end - s.start) / words.length;
          return {
            text: word,
            start: s.start + idx * wordDur,
            end: s.start + (idx + 1) * wordDur
          };
        });
        return { ...s, words: wList };
      });

      // 4. Update the active lesson
      const updatedLesson: Lesson = {
        ...activeLesson,
        subtitles: loadedSubs
      };

      // 5. Save to custom lessons (convert preloaded to custom if necessary)
      let nextCustomLessons = [...customLessons];
      const existingIdx = customLessons.findIndex(l => l.id === activeLesson.id);

      if (existingIdx !== -1) {
        nextCustomLessons[existingIdx] = updatedLesson;
      } else {
        const customId = `custom-sub-${activeLesson.id}`;
        const clonedLesson: Lesson = {
          ...updatedLesson,
          id: customId,
          title: `${activeLesson.title} (Customizado)`
        };
        nextCustomLessons = [clonedLesson, ...nextCustomLessons];
        setActiveLesson(clonedLesson);
      }

      setCustomLessons(nextCustomLessons);
      localStorage.setItem('hl_custom_lessons', JSON.stringify(nextCustomLessons));
      cloudSyncService.pushToCloud({ customLessons: nextCustomLessons });

      if (existingIdx !== -1) {
        setActiveLesson(updatedLesson);
      }

      setIsSubtitleConfigModalOpen(false);
      setNewSubtitleFile(null);
      alert('Legendas atualizadas com sucesso!');
    } catch (err) {
      console.error('Failed to update subtitles:', err);
      alert('Ocorreu um erro ao processar as novas legendas.');
    } finally {
      setLoadingNewSubtitle(false);
      setNewSubProgressText('');
    }
  };

  // --- speech comparison logic (Dictation Comparison) ---
  const startRecordingSpeech = () => {
    setUserTranscript('');
    setCompareScore(null);
    setRecordingAvailable(false);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setMicrophoneStatusText('SpeechRecognition API não suportada neste navegador.');
      setIsRecording(true); // triggers manual typing modal
      return;
    }

    try {
      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setMicrophoneStatusText('Ouvindo fala... Repita a frase!');
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setMicrophoneStatusText(`Erro: ${event.error}. Use o fallback de digitação.`);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        setRecordingAvailable(true);
        
        if (lastActiveSubtitle) {
          const score = calculateSimilarityScore(transcript, lastActiveSubtitle.text);
          setCompareScore(score);
        }
      };

      rec.start();
    } catch (err) {
      console.error('Speech recognition failed to init:', err);
      setMicrophoneStatusText('Falha ao inicializar microfone.');
      setIsRecording(true);
    }
  };

  const stopRecordingSpeech = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const calculateSimilarityScore = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const s2 = str2.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    
    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;
    
    const w1 = s1.split(/\s+/);
    const w2 = s2.split(/\s+/);
    
    let matches = 0;
    w1.forEach(word => {
      if (w2.includes(word)) matches++;
    });
    
    const score = (matches / Math.max(w1.length, w2.length)) * 100;
    return Math.round(score);
  };

  const handleManualCompareSubmit = (text: string) => {
    setUserTranscript(text);
    setRecordingAvailable(true);
    if (lastActiveSubtitle) {
      const score = calculateSimilarityScore(text, lastActiveSubtitle.text);
      setCompareScore(score);
    }
  };

  // --- Word Explanation (Gemini API or Local Dictionary) ---
  const handleWordClick = async (word: string, phraseText: string) => {
    // Automatically pause playback during lookup so the user can study
    if (youtubePlayer && youtubePlayerReady) {
      try { youtubePlayer.pauseVideo(); } catch (e) {}
    }
    if (videoPlayerRef.current) {
      try { videoPlayerRef.current.pause(); } catch (e) {}
    }
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
    }
    setIsPlaying(false);

    const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    setSelectedWord(cleanWord);
    setSelectedWordContext(phraseText);
    setLoadingExplanation(true);
    setWordExplainData(null);

    // 1. Check offline dictionary first (instant return for pre-curated terms)
    if (OFFLINE_DICTIONARY[cleanWord]) {
      setTimeout(() => {
        setWordExplainData(OFFLINE_DICTIONARY[cleanWord]);
        setLoadingExplanation(false);
      }, 300);
      return;
    }

    // 2. Fetch from Gemini if API key configured
    const geminiKey = localStorage.getItem('hl_gemini_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'sua-chave-gemini-aqui') {
      try {
        const prompt = `Translate and explain the word "${cleanWord}" in the context of the sentence "${phraseText}". 
Support Portuguese as the explanation language.
Return a JSON object with strictly the following keys:
{
  "word": "${cleanWord}",
  "type": "noun, verb, adjective, adverb, expression, etc.",
  "pronunciation": "IPA pronunciation, e.g. /oʊ/",
  "definition": "General dictionary definition in Portuguese",
  "context_meaning": "Specific meaning of the word in the context of the sentence '${phraseText}' in Portuguese",
  "examples": [
    { "sentence": "Example sentence 1 in English", "translation": "Translation of example 1 in Portuguese" },
    { "sentence": "Example sentence 2 in English", "translation": "Translation of example 2 in Portuguese" }
  ],
  "native_usages": [
    "Tip on native usage 1 (colloquialism, contractions, spoken nuances, formal vs informal) in Portuguese",
    "Tip on native usage 2 in Portuguese"
  ],
  "chunks": [
    { "expression": "Common collocation or chunk containing the word", "meaning": "Meaning of this expression in Portuguese", "example": "English example sentence using this expression (with Portuguese translation)" }
  ]
}
Do not wrap in markdown code blocks like \`\`\`json. Return strictly raw JSON.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.ok) {
          const json = await res.json();
          let text = json.candidates[0].content.parts[0].text || '';
          // Strip markdown code block wrappers if present to ensure robust JSON parsing
          text = text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
          const parsed = JSON.parse(text);
          setWordExplainData(parsed);
          setLoadingExplanation(false);
          return;
        }
      } catch (err) {
        console.error('Gemini API word explanation failed:', err);
      }
    }

    // 3. Free Fallback Dictionary & Translation API (No API key required)
    try {
      const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`;
      const dictRes = await fetch(dictUrl);
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        if (dictData && dictData[0]) {
          const entry = dictData[0];
          const pronunciation = entry.phonetic || (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) || '/.../';
          const meaning = entry.meanings[0] || {};
          const partOfSpeech = meaning.partOfSpeech || 'vocábulo';
          const rawDef = meaning.definitions && meaning.definitions[0] ? meaning.definitions[0].definition : '';
          const rawEx = meaning.definitions && meaning.definitions[0] ? meaning.definitions[0].example : '';
          
          // Translate definition to Portuguese using MyMemory API
          let definitionPt = rawDef;
          if (rawDef) {
            try {
              const transUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawDef)}&langpair=en|pt`;
              const transRes = await fetch(transUrl);
              if (transRes.ok) {
                const transData = await transRes.json();
                definitionPt = transData.responseData.translatedText || rawDef;
              }
            } catch (e) {
              console.error('MyMemory translate definition failed:', e);
            }
          }

          // Translate example to Portuguese
          let exampleTrans = '';
          if (rawEx) {
            try {
              const transUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(rawEx)}&langpair=en|pt`;
              const transRes = await fetch(transUrl);
              if (transRes.ok) {
                const transData = await transRes.json();
                exampleTrans = transData.responseData.translatedText || '';
              }
            } catch (e) {
              console.error('MyMemory translate example failed:', e);
            }
          }

          // Generate contextual sentence translation to explain usage
          let contextExplanation = `Na frase "${phraseText}", a palavra '${cleanWord}' está sendo usada como ${partOfSpeech}.`;
          if (phraseText) {
            try {
              const transUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phraseText)}&langpair=en|pt`;
              const transRes = await fetch(transUrl);
              if (transRes.ok) {
                const transData = await transRes.json();
                const transPhrase = transData.responseData.translatedText || '';
                contextExplanation = `Na frase "${phraseText}" (traduzida como "${transPhrase}"), a palavra '${cleanWord}' desempenha o papel de ${partOfSpeech} e refere-se a: ${definitionPt}`;
              }
            } catch (e) {
              console.error('MyMemory translate phrase failed:', e);
            }
          }

          setWordExplainData({
            word: cleanWord,
            type: partOfSpeech,
            pronunciation: pronunciation,
            definition: definitionPt,
            context_meaning: contextExplanation,
            examples: rawEx ? [{ sentence: rawEx, translation: exampleTrans }] : [],
            native_usages: [
              `No inglês falado e cotidiano, '${cleanWord}' funciona frequentemente como ${partOfSpeech}.`
            ],
            chunks: []
          });
          setLoadingExplanation(false);
          return;
        }
      }
    } catch (err) {
      console.error('Free fallback APIs failed:', err);
    }

    // 4. Clean Static Fallback (If all else fails / offline)
    setTimeout(() => {
      setWordExplainData({
        word: cleanWord,
        type: 'vocábulo',
        pronunciation: '/.../',
        definition: `Significado contextual de '${cleanWord}'.`,
        context_meaning: `A palavra '${cleanWord}' é usada na frase "${phraseText}" para compor o sentido geral da declaração.`,
        examples: [
          { sentence: `This is a contextual example featuring ${cleanWord}.`, translation: `Este é um exemplo de uso contendo a palavra ${cleanWord}.` }
        ],
        native_usages: [
          `Utilizado comumente por nativos em contextos normais de conversação.`
        ],
        chunks: []
      });
      setLoadingExplanation(false);
    }, 600);
  };

  const speakWord = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleExplainSentence = async (sub: Subtitle) => {
    setLoadingSentenceExplain(true);
    setSentenceExplainData(null);
    setInfoOpen(true);

    const geminiKey = localStorage.getItem('hl_gemini_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'sua-chave-gemini-aqui') {
      try {
        const prompt = `Explain the sentence "${sub.text}" (translated as "${sub.translation}") in Portuguese. Provide a breakdown of key vocabulary, grammatical structures, and common expressions/chunks used in it. Return response in simple, neat markdown formatting.`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates[0].content.parts[0].text;
          setSentenceExplainData(text);
          setLoadingSentenceExplain(false);
          return;
        }
      } catch (err) {
        console.error('Gemini sentence explanation failed:', err);
      }
    }

    // Fallback Mock Explanation
    setTimeout(() => {
      setSentenceExplainData(`### Estrutura da Frase\nA frase representa um diálogo cotidiano.\n\n- **Vocabulário:** Vocábulos comuns para conversas rápidas.\n- **Chunks:** Expressões e chunks idiomáticos mais comuns.\n\n*(Configure uma chave API Gemini nas Configurações para obter explicações completas por inteligência artificial)*`);
      setLoadingSentenceExplain(false);
    }, 600);
  };

  const exportSRT = () => {
    if (!activeLesson) return;
    let srtText = '';
    activeLesson.subtitles.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const pad = (num: number, size: number) => ('000' + num).slice(-size);
        const hrs = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        const secs = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 1000);
        return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
      };
      srtText += `${idx + 1}\n${formatTime(s.start)} --> ${formatTime(s.end)}\n${s.text}\n${s.translation}\n\n`;
    });

    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeLesson.title}.srt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Combine preloaded and custom imported lessons
  const allLessons = useMemo(() => {
    const customIds = new Set(customLessons.map(l => l.id));
    const preloadedFiltered = PRELOADED_LESSONS.filter(l => !customIds.has(l.id));
    return [...customLessons, ...preloadedFiltered];
  }, [customLessons]);

  const handleDeleteCustomLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCustom = customLessons.filter(l => l.id !== lessonId);
    setCustomLessons(nextCustom);
    localStorage.setItem('hl_custom_lessons', JSON.stringify(nextCustom));
    try {
      await deleteFileFromDB(lessonId);
    } catch (err) {
      console.error('Failed to delete file from DB:', err);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
      
      {/* Importer Form Header if no lesson loaded */}
      {!activeLesson ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header row with hamburger button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Shadowing 🎙️</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Selecione um conteúdo para estudar ou importe sua própria mídia.
              </p>
            </div>
            
            {/* Hamburger Sandwich button to show import controls */}
            <button 
              onClick={() => setImportFormOpen(prev => !prev)}
              className={`btn ${importFormOpen ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '30px' }}
            >
              {importFormOpen ? <X size={18} /> : <Menu size={18} />}
              <span>Importar Mídia</span>
            </button>
          </div>

          {/* Import Setup Box (Collapsible) */}
          {importFormOpen && (
            <div className="glass-card scale-in" style={{ padding: '24px', border: '1px dashed var(--accent)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>📥 Importar Vídeo ou Áudio</h3>
              
              <form onSubmit={handleCustomImport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <button 
                    type="button" 
                    className={`settings-btn ${importType === 'video' ? 'active' : ''}`}
                    onClick={() => setImportType('video')}
                  >
                    🎞️ Vídeo / Link YouTube
                  </button>
                  <button 
                    type="button" 
                    className={`settings-btn ${importType === 'audio' ? 'active' : ''}`}
                    onClick={() => setImportType('audio')}
                  >
                    🎙️ Podcast / Áudio Local
                  </button>
                </div>

                {/* URL Import */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link2 size={14} /> Link do Vídeo (YouTube)
                  </label>
                  <input 
                    type="url"
                    className="input-text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      setMediaFile(null);
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Media file upload */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={14} /> Arquivo de Mídia ({importType === 'video' ? 'MP4/MKV' : 'MP3/WAV'})
                    </label>
                    <input 
                      type="file"
                      className="input-text"
                      accept={importType === 'video' ? 'video/*' : 'audio/*'}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setMediaFile(e.target.files[0]);
                          setYoutubeUrl('');
                        }
                      }}
                    />
                  </div>

                  {/* Subtitles local upload */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📖 Legendas Opcionais (.SRT / .LRC)
                    </label>
                    <input 
                      type="file"
                      className="input-text"
                      accept=".srt,.lrc"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setSubtitleFile(e.target.files[0]);
                      }}
                    />
                  </div>
                </div>

                {loadingMedia ? (
                  <div style={{ textAlign: 'center', padding: '10px', color: 'var(--accent)', fontWeight: 600 }}>
                    <RefreshCw className="spin" size={16} style={{ display: 'inline-block', marginRight: '8px' }} />
                    {loadingProgressText}
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                    Processar e Importar Legendas
                  </button>
                )}

              </form>
            </div>
          )}

          {/* Popular Gallery Lessons */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Materiais de Estudo</h3>
            <div className="learning-grid">
              {allLessons.map(lesson => {
                const isCustom = lesson.id.startsWith('custom-');
                return (
                  <div 
                    key={lesson.id}
                    className={`learning-card ${isCustom ? 'learning-card-orange' : 'learning-card-purple'}`}
                    onClick={async () => {
                      let finalLesson = { ...lesson };
                      if (isCustom && !lesson.videoUrl.includes('youtube.com') && !lesson.videoUrl.includes('youtu.be')) {
                        try {
                          const fileBlob = await getFileFromDB(lesson.id);
                          if (fileBlob) {
                            finalLesson.videoUrl = URL.createObjectURL(fileBlob);
                          }
                        } catch (err) {
                          console.error('Failed to load file from IndexedDB:', err);
                        }
                      }
                      setActiveLesson(finalLesson);
                      setCurrentTime(0);
                      setLoopCountTarget(0);
                      setLoopCountCurrent(0);
                      setIsPlaying(false);
                    }}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
                  >
                    <div>
                      <div className="learning-card-icon">{isCustom ? '📥' : '📺'}</div>
                      <h4 className="learning-card-title">{lesson.title}</h4>
                      <p className="learning-card-desc">{lesson.description}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span className="badge badge-easy">
                        {lesson.subtitles.length} frases
                      </span>

                      {isCustom && (
                        <button 
                          onClick={(e) => handleDeleteCustomLesson(lesson.id, e)}
                          style={{
                            background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', padding: '2px 8px', fontWeight: 700
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // --- Interactive Media Player Study View ---
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button 
              onClick={() => {
                stopRecordingSpeech();
                setActiveLesson(null);
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <ArrowLeft size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Voltar aos Materiais</span>
            </button>

            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              {activeLesson.title}
            </h4>
          </div>

          {/* Main Content Grid: [Left: Player & Subtitles] [Right: Dictionary / IA Panel] */}
          <div className="media-study-layout">
            
            {/* Left Column: Player & Scrolling Transcripts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', height: '100%' }}>
              
              {/* Media Player Card */}
              <div className="glass-card" style={isTheaterFullscreen ? {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backgroundColor: 'black',
                borderRadius: 0,
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                margin: 0,
                overflow: 'hidden'
              } : {
                padding: '0', 
                overflow: 'hidden', 
                border: '1px solid var(--border)', 
                position: 'relative'
              }}>
                {/* Exit Fullscreen Button */}
                {isTheaterFullscreen && (
                  <button 
                    onClick={() => setIsTheaterFullscreen(false)}
                    style={{
                      position: 'absolute', top: '20px', left: '20px', zIndex: 1010,
                      background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
                      width: '40px', height: '40px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Sair do modo tela cheia"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}

                {/* Cinema Mode Button (Expand/Shrink Height inside page) */}
                {!isTheaterFullscreen && (
                  <button 
                    onClick={() => setIsCinemaMode(prev => !prev)}
                    style={{
                      position: 'absolute', top: '12px', right: '50px', zIndex: 10,
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
                      transition: 'all 0.2s ease'
                    }}
                    title={isCinemaMode ? 'Contrair altura' : 'Expandir altura'}
                  >
                    {isCinemaMode ? <Shrink size={16} /> : <Expand size={16} />}
                  </button>
                )}

                {/* Fullscreen Mode Button (Full Viewport Overlay) */}
                <button 
                  onClick={() => setIsTheaterFullscreen(prev => !prev)}
                  style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
                    transition: 'all 0.2s ease'
                  }}
                  title={isTheaterFullscreen ? 'Sair da tela cheia' : 'Modo tela cheia'}
                >
                  {isTheaterFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>

                {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                  // YouTube embedded player target element
                  <div id="youtube-player-container" style={{ width: '100%', height: isTheaterFullscreen ? '0' : (isCinemaMode ? '380px' : '240px'), flex: isTheaterFullscreen ? 1 : 'none', background: 'black', transition: 'height 0.3s ease' }}>
                    <div id="youtube-player-iframe"></div>
                  </div>
                ) : (
                  // HTML5 video element player with play/pause click overlay
                  <div 
                    onMouseEnter={() => setIsPlayerHovered(true)}
                    onMouseLeave={() => setIsPlayerHovered(false)}
                    style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: isTheaterFullscreen ? '0' : (isCinemaMode ? '380px' : '240px'), 
                      flex: isTheaterFullscreen ? 1 : 'none', 
                      overflow: 'hidden' 
                    }}
                  >
                    <video 
                      ref={videoPlayerRef}
                      src={activeLesson.videoUrl}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'block', 
                        backgroundColor: 'black', 
                        objectFit: 'contain', 
                        transition: 'all 0.3s ease' 
                      }}
                      onTimeUpdate={(e) => handleTimeUpdate((e.target as HTMLVideoElement).currentTime)}
                      onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                      onPlay={(e) => {
                        setIsPlaying(true);
                        (e.target as HTMLVideoElement).playbackRate = playbackSpeed;
                      }}
                      onPause={() => setIsPlaying(false)}
                    />
                    
                    {/* Play/Pause Overlay Button */}
                    <div 
                      onClick={togglePlay}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,0.1)',
                        zIndex: 5
                      }}
                    >
                      <div 
                        style={{
                          background: 'rgba(12, 13, 21, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '50%',
                          width: '56px',
                          height: '56px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                          opacity: !isPlaying || isPlayerHovered ? 1 : 0,
                          transition: 'opacity 0.2s ease, transform 0.2s ease',
                          transform: !isPlaying || isPlayerHovered ? 'scale(1)' : 'scale(0.8)'
                        }}
                      >
                        {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: '3px' }} />}
                      </div>
                    </div>

                    {/* Custom Bottom Controls Bar */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(12, 13, 21, 0.95) 0%, rgba(12, 13, 21, 0.4) 70%, rgba(12, 13, 21, 0) 100%)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        zIndex: 10,
                        opacity: !isPlaying || isPlayerHovered ? 1 : 0,
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        transform: !isPlaying || isPlayerHovered ? 'translateY(0)' : 'translateY(10px)',
                        pointerEvents: !isPlaying || isPlayerHovered ? 'auto' : 'none'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Play/Pause Button */}
                      <button
                        onClick={togglePlay}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        title={isPlaying ? 'Pausar' : 'Reproduzir'}
                      >
                        {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" style={{ marginLeft: '1px' }} />}
                      </button>

                      {/* Current Time / Duration */}
                      <span style={{ fontSize: '0.75rem', color: 'white', fontFamily: 'monospace', minWidth: '85px', userSelect: 'none' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      {/* Timeline Slider */}
                      <input 
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={(e) => seekTo(parseFloat(e.target.value))}
                        style={{
                          flex: 1,
                          accentColor: '#10b981',
                          height: '4px',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          background: 'rgba(255, 255, 255, 0.3)',
                          outline: 'none'
                        }}
                      />

                      {/* Speed Adjuster */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2px 8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                        <button 
                          onClick={() => {
                            const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                            const curIdx = speeds.indexOf(playbackSpeed);
                            if (curIdx > 0) changeSpeed(speeds[curIdx - 1]);
                          }}
                          style={{ background: 'none', border: 'none', color: 'white', padding: '0 4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                          title="Diminuir velocidade"
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'white', minWidth: '24px', textAlign: 'center' }}>
                          {playbackSpeed}x
                        </span>
                        <button 
                          onClick={() => {
                            const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                            const curIdx = speeds.indexOf(playbackSpeed);
                            if (curIdx !== -1 && curIdx < speeds.length - 1) changeSpeed(speeds[curIdx + 1]);
                          }}
                          style={{ background: 'none', border: 'none', color: 'white', padding: '0 4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                          title="Aumentar velocidade"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Large Active Subtitle Banner */}
                {lastActiveSubtitle && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isTheaterFullscreen ? '32px 24px' : '20px 16px',
                    background: 'rgba(12, 13, 21, 0.95)',
                    borderTop: '1px solid var(--border)',
                    width: '100%',
                    transition: 'all 0.3s ease'
                  }}>
                    {/* Fade Transition Wrapper */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100%',
                      opacity: shouldShowSubtitleText ? 1 : 0,
                      transition: 'opacity 0.1s ease',
                      visibility: shouldShowSubtitleText ? 'visible' : 'hidden'
                    }}>
                      {/* Source Subtitle (Cohesive Sentence) */}
                      <div style={{
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: '900px',
                        marginBottom: '10px',
                        lineHeight: 1.45
                      }}>
                        {(hideOriginals || individuallyHiddenCards[lastActiveSubtitle.id]) && !revealedCards[lastActiveSubtitle.id] ? (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedCards(prev => ({ ...prev, [lastActiveSubtitle.id]: true }));
                            }}
                            style={{ 
                              filter: 'blur(6px)', 
                              cursor: 'pointer', 
                              transition: 'filter 0.2s',
                              fontSize: isTheaterFullscreen ? '2.2rem' : '1.6rem',
                              fontWeight: 700,
                              color: subtitleColor,
                              textAlign: 'center',
                              userSelect: 'none'
                            }}
                            title="Clique para revelar"
                          >
                            {lastActiveSubtitle.text}
                          </span>
                        ) : (
                          lastActiveSubtitle.text.split(/\s+/).map((w, wIdx) => {
                            const cleanedW = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
                            const isWordSelected = selectedWord === cleanedW && selectedWordContext === lastActiveSubtitle.text;
                            return (
                              <React.Fragment key={wIdx}>
                                <span 
                                  className={`subtitle-word ${isWordSelected ? 'selected' : ''}`}
                                  style={{ 
                                    fontSize: isTheaterFullscreen ? '2.2rem' : '1.6rem', 
                                    fontWeight: 700,
                                    color: isWordSelected ? 'var(--accent)' : subtitleColor,
                                    marginRight: `${wordSpacing}px`,
                                    display: 'inline-block'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWordClick(w, lastActiveSubtitle.text);
                                  }}
                                >
                                  {w}
                                </span>
                              </React.Fragment>
                            );
                          })
                        )}
                      </div>

                      {/* Translation Subtitle */}
                      <div style={{
                        fontSize: isTheaterFullscreen ? '1.4rem' : '1.1rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: '900px',
                        lineHeight: 1.4,
                        fontWeight: 500
                      }}>
                        {(hideTranslations || individuallyHiddenCards[lastActiveSubtitle.id]) && !revealedCards[lastActiveSubtitle.id] ? (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedCards(prev => ({ ...prev, [lastActiveSubtitle.id]: true }));
                            }}
                            style={{ filter: 'blur(6px)', cursor: 'pointer', transition: 'filter 0.2s', userSelect: 'none' }}
                            title="Clique para revelar a tradução"
                          >
                            {lastActiveSubtitle.translation || 'Tradução oculta'}
                          </span>
                        ) : (
                          lastActiveSubtitle.translation
                        )}
                      </div>

                      {/* Subtitle Banner Quick Action Buttons */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '14px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        {/* Voltar Sentença */}
                        <button 
                          onClick={() => skipPhrase('prev')}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Voltar uma sentença (Anterior)"
                        >
                          <ChevronLeft size={15} />
                        </button>

                        {/* Falar a frase inteira */}
                        <button 
                          onClick={() => speakWord(lastActiveSubtitle.text)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Falar a frase inteira"
                        >
                          <Volume2 size={15} />
                        </button>

                        {/* Avançar Sentença */}
                        <button 
                          onClick={() => skipPhrase('next')}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Avançar uma sentença (Próxima)"
                        >
                          <ChevronRight size={15} />
                        </button>

                        {/* Salvar na Ilha */}
                        <button 
                          onClick={() => handleAddAsCustomPhrase(lastActiveSubtitle)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = '#10b981';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Salvar esta sentença na ilha personalizada"
                        >
                          <Plus size={15} />
                        </button>

                        {/* Looping de Sentença Cíclico */}
                        <button 
                          onClick={() => {
                            setLoopCountTarget(prev => {
                              if (prev === 0) return 1;
                              if (prev === 1) return 2;
                              if (prev === 2) return 3;
                              if (prev === 3) return 5;
                              if (prev === 5) return -1; // -1 = infinite
                              return 0; // off
                            });
                            setLoopCountCurrent(0);
                          }}
                          style={{
                            background: loopCurrent ? 'var(--accent-glow)' : 'rgba(255, 255, 255, 0.05)',
                            border: loopCurrent ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '0 10px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: loopCurrent ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                          onMouseEnter={(e) => {
                            if (!loopCurrent) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loopCurrent) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }
                          }}
                          title="Repetir sentença continuamente (clique várias vezes para mudar repetições)"
                        >
                          <RotateCcw size={13} className={loopCurrent ? 'spin' : ''} />
                          <span>
                            {loopCountTarget === 0 && 'Loop'}
                            {loopCountTarget > 0 && `${loopCountTarget}x`}
                            {loopCountTarget === -1 && '∞'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitles Toolbar Toggles - Row 1 */}
              <div style={{ display: 'flex', gap: '10px', padding: '0 4px', alignItems: 'center', flexWrap: 'nowrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Legendas:</span>
                <button
                  onClick={() => setHideOriginals(prev => !prev)}
                  style={{
                    background: hideOriginals ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                    border: hideOriginals ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: hideOriginals ? 'var(--accent)' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Ocultar ou mostrar o texto original de todas as frases"
                >
                  {hideOriginals ? <EyeOff size={12} /> : <Eye size={12} />}
                  Originais
                </button>

                <button
                  onClick={() => setHideTranslations(prev => !prev)}
                  style={{
                    background: hideTranslations ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                    border: hideTranslations ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: hideTranslations ? 'var(--accent)' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Ocultar ou mostrar a tradução de todas as frases"
                >
                  {hideTranslations ? <EyeOff size={12} /> : <Eye size={12} />}
                  Traduções
                </button>

                <button
                  onClick={() => setIsSubtitleConfigModalOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: 'auto',
                    transition: 'all 0.15s ease'
                  }}
                  title="Configurar/Enviar nova legenda (.srt/.lrc) para este vídeo"
                >
                  <Upload size={12} />
                  Legenda
                </button>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => setIsSubSettingsOpen(prev => !prev)}
                    style={{
                      background: isSubSettingsOpen ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                      border: isSubSettingsOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
                      color: isSubSettingsOpen ? 'var(--accent)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title="Ajustar cores e espaçamento das legendas"
                  >
                    <Settings size={14} className={isSubSettingsOpen ? 'spin' : ''} />
                  </button>

                  {isSubSettingsOpen && (
                    <div className="scale-in glass-card" style={{ 
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      zIndex: 100,
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '12px', 
                      padding: '12px 16px', 
                      width: '260px',
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-md)', 
                      boxShadow: 'var(--shadow-lg)'
                    }}>
                      {/* Color Selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cor da Fonte:</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[
                            { name: 'Branco', value: '#ffffff' },
                            { name: 'Amarelo', value: '#facc15' },
                            { name: 'Ciano', value: '#22d3ee' },
                            { name: 'Verde', value: '#4ade80' }
                          ].map((c) => (
                            <button
                              key={c.value}
                              onClick={() => {
                                setSubtitleColor(c.value);
                                localStorage.setItem('hl_subtitle_color', c.value);
                              }}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: c.value,
                                border: subtitleColor === c.value ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                padding: 0,
                                boxShadow: subtitleColor === c.value ? '0 0 8px var(--accent)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                      {/* Word Spacing Slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            Espaço das Palavras:
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {wordSpacing}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={20}
                          step={1}
                          value={wordSpacing}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setWordSpacing(val);
                            localStorage.setItem('hl_subtitle_spacing', val.toString());
                          }}
                          style={{
                            width: '100%',
                            accentColor: '#10b981',
                            height: '4px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '2px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitles scrolling list */}
              <div className="subtitles-scroll-panel" ref={subtitleScrollRef} style={{ flex: 1, minHeight: 0 }}>
                {adjustedSubtitles.map((sub, idx) => {
                  const isActive = lastActiveSubtitle?.id === sub.id;
                  const isOriginalHidden = (hideOriginals || individuallyHiddenCards[sub.id]) && !revealedCards[sub.id];
                  const isTranslationHidden = (hideTranslations || individuallyHiddenCards[sub.id]) && !revealedCards[sub.id];

                  return (
                    <div 
                      key={sub.id}
                      className={`subtitle-block-card ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        seekTo(sub.start + 0.1);
                        if (pinCurrent) {
                          setLastActiveSubtitle(sub);
                        }
                      }}
                    >
                      <span className="subtitle-time-badge">
                        ⌛ {formatTime(sub.start)}
                      </span>
                      
                      {/* Subtitle Words Pills */}
                      {isOriginalHidden ? (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealedCards(prev => ({ ...prev, [sub.id]: true }));
                          }}
                          style={{ 
                            filter: 'blur(5px)', 
                            cursor: 'pointer', 
                            userSelect: 'none',
                            transition: 'filter 0.2s',
                            fontSize: '1.05rem', 
                            fontWeight: 600, 
                            color: 'var(--text-primary)', 
                            lineHeight: 1.4,
                            padding: '4px 0'
                          }}
                          title="Clique para revelar o texto original"
                        >
                          {sub.text}
                        </div>
                      ) : (
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: subtitleColor, lineHeight: 1.45 }}>
                          {sub.text.split(/\s+/).map((w, wIdx) => {
                            const cleanedW = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
                            const isWordSelected = selectedWord === cleanedW && selectedWordContext === sub.text;

                            return (
                              <React.Fragment key={wIdx}>
                                <span 
                                  className={`subtitle-word ${isWordSelected ? 'selected' : ''}`}
                                  style={{
                                    color: isWordSelected ? 'var(--accent)' : subtitleColor,
                                    marginRight: `${wordSpacing}px`,
                                    display: 'inline-block'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWordClick(w, sub.text);
                                  }}
                                >
                                  {w}
                                </span>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        {isTranslationHidden ? (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedCards(prev => ({ ...prev, [sub.id]: true }));
                            }}
                            style={{ 
                              filter: 'blur(5px)', 
                              cursor: 'pointer', 
                              userSelect: 'none',
                              fontSize: '0.85rem', 
                              color: 'var(--text-secondary)', 
                              flex: 1,
                              padding: '2px 0' 
                            }}
                            title="Clique para revelar a tradução"
                          >
                            {sub.translation || 'Tradução oculta'}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
                            {sub.translation}
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                          {/* Copy button */}
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(sub.text);
                              alert('Copiado para a área de transferência!');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Copiar frase"
                          >
                            <Copy size={14} />
                          </button>

                          {/* Add Custom Phrase button */}
                          <button 
                            onClick={() => handleAddAsCustomPhrase(sub)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title="Adicionar à minha ilha personalizada"
                          >
                            <Plus size={14} />
                          </button>

                          {/* Individual Card Toggle Eye button */}
                          <button 
                            onClick={() => {
                              const currentlyHidden = isOriginalHidden || isTranslationHidden;
                              if (currentlyHidden) {
                                setRevealedCards(prev => ({ ...prev, [sub.id]: true }));
                                setIndividuallyHiddenCards(prev => ({ ...prev, [sub.id]: false }));
                              } else {
                                setIndividuallyHiddenCards(prev => ({ ...prev, [sub.id]: true }));
                                setRevealedCards(prev => ({ ...prev, [sub.id]: false }));
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title={isOriginalHidden || isTranslationHidden ? "Mostrar transcrição" : "Ocultar transcrição"}
                          >
                            {isOriginalHidden || isTranslationHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Active Block Sub-Controls (matching screenshot dashboard) */}
                      {isActive && (
                        <div className="scale-in" style={{ display: 'flex', flexDirection: 'column', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '12px', paddingTop: '12px' }} onClick={(e) => e.stopPropagation()}>
                          
                          {/* Timeline Seek Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {formatTime(currentTime)}
                            </span>
                            <input 
                              type="range"
                              min={0}
                              max={duration || 100}
                              step={0.1}
                              value={currentTime}
                              onChange={(e) => seekTo(parseFloat(e.target.value))}
                              style={{
                                flex: 1,
                                accentColor: '#10b981',
                                height: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {formatTime(duration)}
                            </span>
                          </div>

                          {/* Control Actions Row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                              
                              {/* Fixar (Pin/Lock Active Subtitle) */}
                              <button 
                                onClick={() => setPinCurrent(prev => !prev)}
                                style={{
                                  background: 'none', border: 'none', color: pinCurrent ? '#10b981' : 'var(--text-muted)',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700
                                }}
                                title="Fixar frase atual"
                              >
                                <Bookmark size={16} fill={pinCurrent ? '#10b981' : 'none'} style={{ transition: 'all 0.15s' }} />
                                <span>Fixar</span>
                              </button>

                              {/* Info (Sentence explanations breakdown) */}
                              <button 
                                onClick={() => setInfoOpen(prev => !prev)}
                                style={{
                                  background: 'none', border: 'none', color: infoOpen ? '#10b981' : 'var(--text-muted)',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700
                                }}
                                title="Explicação da frase"
                              >
                                <Info size={16} />
                                <span>Info</span>
                              </button>

                              {/* Loop (Loop sentence audio) */}
                              <button 
                                onClick={() => {
                                  setLoopCountTarget(prev => {
                                    if (prev === 0) return 1;
                                    if (prev === 1) return 2;
                                    if (prev === 2) return 3;
                                    if (prev === 3) return 5;
                                    if (prev === 5) return -1;
                                    return 0;
                                  });
                                  setLoopCountCurrent(0);
                                }}
                                style={{
                                  background: 'none', border: 'none', color: loopCurrent ? '#10b981' : 'var(--text-muted)',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700
                                }}
                                title="Repetir frase atual continuamente (clique várias vezes para mudar repetições)"
                              >
                                <RotateCcw size={16} style={{ color: loopCurrent ? '#10b981' : 'inherit' }} />
                                <span>
                                  {loopCountTarget === 0 && 'Loop'}
                                  {loopCountTarget > 0 && `${loopCountTarget}x`}
                                  {loopCountTarget === -1 && 'Loop ∞'}
                                </span>
                              </button>

                              {/* Vel (Playback Speed Customized Adjuster) */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '2px 8px', border: '1px solid var(--border)' }}>
                                  <button 
                                    onClick={() => {
                                      const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                                      const curIdx = speeds.indexOf(playbackSpeed);
                                      if (curIdx > 0) changeSpeed(speeds[curIdx - 1]);
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0 4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                                    title="Diminuir velocidade"
                                  >
                                    -
                                  </button>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: '32px', textAlign: 'center', color: playbackSpeed !== 1.0 ? '#10b981' : 'var(--text-secondary)' }}>
                                    {playbackSpeed}x
                                  </span>
                                  <button 
                                    onClick={() => {
                                      const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                                      const curIdx = speeds.indexOf(playbackSpeed);
                                      if (curIdx !== -1 && curIdx < speeds.length - 1) changeSpeed(speeds[curIdx + 1]);
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0 4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                                    title="Aumentar velocidade"
                                  >
                                    +
                                  </button>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>Velocidade</span>
                              </div>

                              {/* Subtitle Sync Offset Adjuster */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '2px 8px', border: '1px solid var(--border)' }}>
                                  <button 
                                    onClick={() => setSubtitleDelay(prev => Number((prev - 0.1).toFixed(1)))}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0 4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                                    title="Adiantar legendas (0.1s)"
                                  >
                                    -
                                  </button>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: '42px', textAlign: 'center', color: subtitleDelay !== 0.0 ? '#10b981' : 'var(--text-secondary)' }}>
                                    {subtitleDelay > 0 ? `+${subtitleDelay}` : subtitleDelay}s
                                  </span>
                                  <button 
                                    onClick={() => setSubtitleDelay(prev => Number((prev + 0.1).toFixed(1)))}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0 4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                                    title="Atrasar legendas (0.1s)"
                                  >
                                    +
                                  </button>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>Sinc. Legenda</span>
                              </div>

                            </div>

                            {/* Right side circular buttons (Play/Pause and Mic next to each other, exact same dimensions) */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              
                              {/* Circle Play/Pause Button */}
                              <button 
                                onClick={() => togglePlay()}
                                style={{
                                  background: isPlaying ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                  border: isPlaying ? '1px solid #10b981' : '1px solid var(--border)',
                                  borderRadius: '50%',
                                  width: '38px',
                                  height: '38px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: isPlaying ? '#10b981' : 'var(--text-secondary)',
                                  boxShadow: isPlaying ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                                title={isPlaying ? 'Pausar vídeo' : 'Tocar vídeo'}
                              >
                                {isPlaying ? <Pause size={16} fill={isPlaying ? '#10b981' : 'none'} /> : <Play size={16} fill="none" />}
                              </button>

                              {/* Circle Mic Button */}
                              {isRecording ? (
                                <button 
                                  onClick={() => stopRecordingSpeech()}
                                  style={{
                                    background: 'var(--danger)', border: 'none', borderRadius: '50%', width: '38px', height: '38px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
                                    boxShadow: '0 0 10px var(--danger-glow)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Parar gravação"
                                >
                                  <Pause size={16} fill="white" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => startRecordingSpeech()}
                                  style={{
                                    background: '#10b981', border: 'none', borderRadius: '50%', width: '38px', height: '38px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
                                    boxShadow: '0 0 10px var(--success-glow)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Gravar para comparar"
                                >
                                  <Mic size={16} />
                                </button>
                              )}

                            </div>
                          </div>

                          {/* Info panel inside active card */}
                          {infoOpen && (
                            <div className="scale-in" style={{
                              marginTop: '12px',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '12px',
                              fontSize: '0.85rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                💡 Explicação & Chunks da Frase
                              </div>
                              
                              {loadingSentenceExplain ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '6px 0' }}>
                                  <RefreshCw className="spin" size={14} /> Explanando frase por IA...
                                </div>
                              ) : sentenceExplainData ? (
                                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                  {sentenceExplainData}
                                </div>
                              ) : (
                                <>
                                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    {sub.explanation || 'Sem explicação local pré-carregada. Solicite uma explicação detalhada usando Inteligência Artificial abaixo.'}
                                  </p>
                                  <button
                                    onClick={() => handleExplainSentence(sub)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', width: '100%' }}
                                  >
                                    <Sparkles size={12} /> Explicar Frase com IA
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Dictation Score feedback */}
                          {recordingAvailable && compareScore !== null && (
                            <div className="scale-in" style={{
                              marginTop: '12px',
                              background: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.15)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pronúncia Acurácia:</span>
                                <span style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 800,
                                  color: compareScore >= 80 ? 'var(--success)' : compareScore >= 50 ? 'var(--warning)' : 'var(--danger)'
                                }}>{compareScore}%</span>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                Falou: <strong style={{ color: 'white' }}>"{userTranscript}"</strong>
                              </span>
                            </div>
                          )}

                          {/* Fallback Typing box if SpeechRecognition fails */}
                          {isRecording && !((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && (
                            <div style={{
                              marginTop: '12px',
                              background: 'rgba(255,255,255,0.02)',
                              padding: '10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px dashed var(--border)'
                            }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Digite o que falou (Simulação de fala):
                              </span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                  type="text"
                                  className="input-text"
                                  style={{ padding: '6px', flex: 1, fontSize: '0.8rem' }}
                                  placeholder="Digite o que falou..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleManualCompareSubmit((e.target as HTMLInputElement).value);
                                      setIsRecording(false);
                                    }
                                  }}
                                />
                                <button 
                                  className="btn btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                                    handleManualCompareSubmit(input.value);
                                    setIsRecording(false);
                                  }}
                                >
                                  Ok
                                </button>
                                <button 
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => setIsRecording(false)}
                                >
                                  Canc
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Right Sidebar Panel */}
            <aside className={`explanation-sidebar ${selectedWord !== null || infoOpen ? '' : 'collapsed'}`}>
              
              {/* Close Header for Sliding Sidebar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Detalhes do Estudo
                </span>
                <button 
                  onClick={() => {
                    setSelectedWord(null);
                    setSelectedWordContext(null);
                    setInfoOpen(false);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Fechar painel"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* IA Explanation block header */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} /> Explicação IA do Vocabulário
                </h3>
                
                {selectedWord ? (
                  loadingExplanation ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <RefreshCw className="spin" size={18} style={{ margin: '0 auto 8px' }} />
                      Analisando com a Inteligência Artificial...
                    </div>
                  ) : wordExplainData ? (
                    <div className="word-explain-card" style={{ gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                            {wordExplainData.word}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => speakWord(wordExplainData.word)}
                            title="Falar palavra"
                          >
                            <Volume2 size={14} />
                          </button>

                          <button 
                            className="btn-icon" 
                            onClick={handleAddWordToIsland}
                            title="Salvar palavra na ilha de vocabulário"
                            style={{ color: 'var(--accent)' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Word info (Type & Pronunciation) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '-4px' }}>
                        {wordExplainData.pronunciation && (
                          <span style={{ 
                            fontFamily: 'var(--font-mono, monospace)', 
                            background: 'var(--bg-tertiary)', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)'
                          }}>
                            [{wordExplainData.pronunciation}]
                          </span>
                        )}
                        {wordExplainData.type && (
                          <span style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            color: 'var(--accent)', 
                            background: 'rgba(124, 58, 237, 0.08)', 
                            border: '1px solid rgba(124, 58, 237, 0.15)', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            letterSpacing: '0.03em'
                          }}>
                            {wordExplainData.type}
                          </span>
                        )}
                      </div>

                      {/* General Definition */}
                      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                          Definição Geral
                        </span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                          {wordExplainData.definition}
                        </p>
                      </div>

                      {/* Context Meaning (Cyan Callout Card) */}
                      {(wordExplainData.context_meaning || wordExplainData.definition) && (
                        <div style={{ 
                          background: 'rgba(6, 182, 212, 0.05)', 
                          borderLeft: '4px solid #06b6d4', 
                          borderRadius: '4px', 
                          padding: '10px'
                        }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                            <Sparkles size={11} /> Significado no Contexto
                          </span>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                            {wordExplainData.context_meaning || wordExplainData.definition}
                          </p>
                        </div>
                      )}

                      {/* Usage Examples List */}
                      {wordExplainData.examples && Array.isArray(wordExplainData.examples) && wordExplainData.examples.length > 0 ? (
                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            Exemplos de Uso
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {wordExplainData.examples.map((ex: any, i: number) => (
                              <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600, margin: '0 0 2px 0', fontStyle: 'italic', lineHeight: 1.35 }}>
                                  "{ex.sentence || ex.phrase}"
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                                  {ex.translation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : wordExplainData.example ? (
                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                            Exemplo de Uso
                          </span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                            "{wordExplainData.example}"
                          </p>
                        </div>
                      ) : null}

                      {/* Native Usages Card */}
                      {wordExplainData.native_usages && Array.isArray(wordExplainData.native_usages) && wordExplainData.native_usages.length > 0 && (
                        <div style={{ 
                          background: 'rgba(245, 158, 11, 0.05)', 
                          borderLeft: '4px solid #f59e0b', 
                          borderRadius: '4px', 
                          padding: '10px'
                        }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '6px', letterSpacing: '0.02em' }}>
                            🗣️ Formas Usadas por Nativos
                          </span>
                          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px', lineHeight: 1.35 }}>
                            {wordExplainData.native_usages.map((usage: string, i: number) => (
                              <li key={i}>{usage}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Chunks Card */}
                      {wordExplainData.chunks && Array.isArray(wordExplainData.chunks) && wordExplainData.chunks.length > 0 ? (
                        <div style={{ 
                          background: 'rgba(139, 92, 246, 0.05)', 
                          borderLeft: '4px solid #8b5cf6', 
                          borderRadius: '4px', 
                          padding: '10px'
                        }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#8b5cf6', display: 'block', marginBottom: '6px', letterSpacing: '0.02em' }}>
                            🔗 Chunks e Colocações
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {wordExplainData.chunks.map((chk: any, i: number) => (
                              <div key={i} style={{ fontSize: '0.75rem', lineHeight: 1.35 }}>
                                <strong style={{ color: 'white' }}>{chk.expression}</strong>: <span style={{ color: 'var(--text-secondary)' }}>{chk.meaning}</span>
                                {chk.example && (
                                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                                    ex: {chk.example}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : wordExplainData.chunk_explanation ? (
                        <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '2px' }}>
                            Expressão / Chunk
                          </span>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3, margin: 0 }}>
                            {wordExplainData.chunk_explanation}
                          </p>
                        </div>
                      ) : null}

                      {/* Warning and Inline Input if Gemini Key is missing */}
                      {(!localStorage.getItem('hl_gemini_key') || localStorage.getItem('hl_gemini_key') === 'sua-chave-gemini-aqui') && (
                        <div style={{
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.15)',
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--warning)',
                          lineHeight: 1.35,
                          marginTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div>
                            ⚠️ <strong>Chave API Gemini Ausente:</strong> Cole sua chave abaixo para ver explicações em tempo real:
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="password"
                              placeholder="Cole sua chave aqui..."
                              value={inlineGeminiKey}
                              onChange={(e) => setInlineGeminiKey(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                color: 'white'
                              }}
                            />
                            <button
                              onClick={() => {
                                if (inlineGeminiKey.trim()) {
                                  localStorage.setItem('hl_gemini_key', inlineGeminiKey.trim());
                                  alert('Chave salva com sucesso! Buscando explicação com Gemini...');
                                  if (selectedWord && selectedWordContext) {
                                    handleWordClick(selectedWord, selectedWordContext);
                                  }
                                }
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              Salvar
                            </button>
                          </div>
                          <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.7rem' }}>
                            Obter chave Gemini grátis
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Não foi possível gerar a explicação.
                    </div>
                  )
                ) : (
                  <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    💡 <strong>Dica:</strong> Toque em qualquer palavra das legendas acima para abrir a tradução automática e explicação gramatical por IA.
                  </div>
                )}
              </div>

              {/* Action Tools: Save and Export */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Ferramentas da Aula
                </span>

                {/* Save active phrase to favorites */}
                {activeSubtitle && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    onClick={() => toggleFavorite(activeSubtitle.id.toString())}
                  >
                    <Star size={14} fill={favorites.includes(activeSubtitle.id.toString()) ? 'currentColor' : 'none'} />
                    {favorites.includes(activeSubtitle.id.toString()) ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
                  </button>
                )}

                {/* Export subtitle SRT */}
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  onClick={exportSRT}
                >
                  <Download size={14} /> Exportar Legendas (.SRT)
                </button>
              </div>

            </aside>

          </div>

        </div>
      )}

      {/* Loading Overlay */}
      {loadingMedia && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: '16px',
          color: 'white'
        }}>
          <div className="glass-card scale-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--accent)' }}>
            <RefreshCw className="spin" size={36} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Processando Mídia</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{loadingProgressText}</p>
          </div>
        </div>
      )}

      {/* Subtitles Configurator Modal */}
      {isSubtitleConfigModalOpen && (
        <div className="practice-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="practice-modal-content" style={{ maxWidth: '450px' }}>
            <div className="practice-modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚙️ Configurar Legendas do Vídeo
              </h3>
              <button 
                onClick={() => {
                  setIsSubtitleConfigModalOpen(false);
                  setNewSubtitleFile(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="practice-modal-body" style={{ gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Envie um arquivo de legenda local (<strong>.SRT</strong> ou <strong>.LRC</strong>) para substituir as legendas de: <strong style={{ color: 'white' }}>{activeLesson?.title}</strong>.
              </p>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Selecionar Arquivo de Legenda (.srt / .lrc)
                </label>
                <input 
                  type="file"
                  className="input-text"
                  accept=".srt,.lrc"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setNewSubtitleFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {loadingNewSubtitle ? (
                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--accent)', fontWeight: 600 }}>
                  <RefreshCw className="spin" size={16} style={{ display: 'inline-block', marginRight: '8px' }} />
                  {newSubProgressText}
                </div>
              ) : (
                <button 
                  onClick={handleUpdateSubtitles}
                  disabled={!newSubtitleFile}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Substituir Legendas
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
