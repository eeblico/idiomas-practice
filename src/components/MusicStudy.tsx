import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Music, Plus, Trash2, ArrowLeft, CheckCircle, 
  HelpCircle, X, RotateCcw, Youtube, Languages, Eye, EyeOff, Info,
  Play, Pause, Headphones, MessageSquare, Star, Edit2, ChevronRight, Settings, Repeat
} from 'lucide-react';

interface Song {
  id: string;
  language_id: string;
  title: string;
  artist: string;
  youtube_url: string;
  lyrics: string;
  translation: string;
}

// Preloaded classics for all 7 languages
const PRELOADED_SONGS: Song[] = [
  {
    id: 'preloaded-en-yesterday',
    language_id: 'en',
    title: 'Yesterday',
    artist: 'The Beatles',
    youtube_url: 'https://www.youtube.com/watch?v=jo505ZyaCbA',
    lyrics: `Yesterday, all my troubles seemed so far away
Now it looks as though they're here to stay
Oh, I believe in yesterday

Suddenly, I'm not half the man I used to be
There's a shadow hanging over me
Oh, yesterday came suddenly

Why she had to go, I don't know, she wouldn't say
I said something wrong, now I long for yesterday

Yesterday, love was such an easy game to play
Now I need a place to hide away
Oh, I believe in yesterday`,
    translation: `Ontem, todos os meus problemas pareciam tão distantes
Agora parece que eles estão aqui para ficar
Oh, eu acredito no ontem

De repente, não sou nem metade do homem que eu costumava ser
Há uma sombra pairando sobre mim
Oh, o ontem veio de repente

Por que ela teve que ir, eu não sei, ela não quis dizer
Eu disse algo errado, agora eu anseio pelo ontem

Ontem, o amor era um jogo tão fácil de se jogar
Agora eu preciso de um lugar para me esconder
Oh, eu acredito no ontem`
  },
  {
    id: 'preloaded-es-camisa',
    language_id: 'es',
    title: 'La Camisa Negra',
    artist: 'Juanes',
    youtube_url: 'https://www.youtube.com/watch?v=kRt2sRyup6A',
    lyrics: `Tengo la camisa negra
Hoy mi amor está de luto
Hoy tengo en el alma una pena
Y es por culpa de tu embrujo

Hoy sé que ya no me quieres
Y eso es lo que mais me hiere
Que tengo la camisa negra
Y una pena que me duele

Mal parece que solo me quedé
Y fue pura todita tu mentira
Que maldita mala suerte la mía
Aquel día te encontré`,
    translation: `Tenho a camisa preta
Hoje meu amor está de luto
Hoje tenho na alma uma pena
E é por culpa do seu feitiço

Hoje sei que você já não me ama
E isso é o que mais me fere
Pois tenho a camisa preta
E uma dor que me dói

Parece ruim que eu tenha ficado sozinho
E foi tudo uma mentira sua
Que maldita má sorte a minha
Naquele dia em que te encontrei`
  },
  {
    id: 'preloaded-fr-vie',
    language_id: 'fr',
    title: 'La Vie En Rose',
    artist: 'Édith Piaf',
    youtube_url: 'https://www.youtube.com/watch?v=kFzViYkZtb4',
    lyrics: `Quand il me prend dans ses bras
Il me parle tout bas
Je vois la vie en rose

Il me dit des mots d'amour
Des mots de tous les jours
Et ça me fait quelque chose

Il est entré dans mon cœur
Une part de bonheur
Dont je connais la cause`,
    translation: `Quando ele me pega em seus braços
Ele fala baixinho comigo
Eu vejo a vida em cor-de-rosa

Ele me diz palavras de amor
Palavras de todos os dias
E isso mexe comigo

Ele entrou no meu coração
Uma parte de felicidade
Da qual eu conheço a causa`
  },
  {
    id: 'preloaded-it-bella',
    language_id: 'it',
    title: 'Bella Ciao',
    artist: 'Canto Popolare',
    youtube_url: 'https://www.youtube.com/watch?v=4CI3lhyg15c',
    lyrics: `Una mattina mi son svegliato
O bella ciao, bella ciao, bella ciao, ciao, ciao
Una mattina mi son svegliato
E ho trovato l'invasore

O partigiano, portami via
O bella ciao, bella ciao, bella ciao, ciao, ciao
O partigiano, portami via
Ché mi sento di morir`,
    translation: `Uma manhã eu acordei
Oh bela tchau, bela tchau, bela tchau, tchau, tchau
Uma manhã eu acordei
E encontrei o invasor

Oh guerrilheiro, leve-me embora
Oh bela tchau, bela tchau, bela tchau, tchau, tchau
Oh guerrilheiro, leve-me embora
Porque sinto que vou morrer`
  },
  {
    id: 'preloaded-de-luftballons',
    language_id: 'de',
    title: '99 Luftballons',
    artist: 'Nena',
    youtube_url: 'https://www.youtube.com/watch?v=Fpu5a01860Y',
    lyrics: `Hast du etwas Zeit für mich
Dann singe ich ein Lied für dich
Von neunundneunzig Luftballons
Auf ihrem Weg zum Horizont

Denkst du vielleicht grad an mich
Dann singe ich ein Lied für dich
Von neunundneunzig Luftballons
Und dass sowas von sowas kommt`,
    translation: `Você tem um pouco de tempo para mim?
Então cantarei uma música para você
De noventa e nove balões
A caminho do horizonte

Você talvez esteja pensando em mim agora?
Então cantarei uma música para você
De noventa e nove balões
E de como algo assim acontece`
  },
  {
    id: 'preloaded-ru-katyusha',
    language_id: 'ru',
    title: 'Katyusha (Катюша)',
    artist: 'Red Army Choir',
    youtube_url: 'https://www.youtube.com/watch?v=7J__ZdvsZaE',
    lyrics: `Rastsvetali yabloni i grushi
Poplyli tumany nad rekoy
Vykhodila na bereg Katyusha
Na vysokiy bereg na krutoy

Vykhodila, pesnyu zavodila
Pro stepnogo, sizogo orla
Pro togo, kogo iskrenne lyubila
Pro togo, ch'i pis'ma beregla`,
    translation: `Floresciam macieiras e pereiras
Flutuavam névoas sobre o rio
Katiusha saía à margem
À margem alta e íngreme

Saía e entoava uma canção
Sobre a águia cinzenta da estepe
Sobre aquele que ela sinceramente amava
Sobre aquele cujas cartas ela guardava`
  },
  {
    id: 'preloaded-zh-moon',
    language_id: 'zh',
    title: 'The Moon Represents My Heart (月亮代表我的心)',
    artist: 'Teresa Teng',
    youtube_url: 'https://www.youtube.com/watch?v=BJz8oqaV_aM',
    lyrics: `Ni wen wo ai ni you duo shen
Wo ai ni you ji fen
Wo de qing ye zhen
Wo de ai ye zhen
Yue liang dai biao wo de xin

Ni wen wo ai ni you duo shen
Wo ai ni you ji fen
Wo de qing bu yi
Wo de ai bu bian
Yue liang dai biao wo de xin`,
    translation: `Você me pergunta o quão profundo é meu amor
O quanto eu te amo
Meus sentimentos são reais
Meu amor é real
A lua representa o meu coração

Você me pergunta o quão profundo é meu amor
O quanto eu te amo
Meu carinho não vai mudar
Meu amor não mudará
A lua representa o meu coração`
  }
];

interface ScrambledWord {
  id: string;
  text: string;  // original e.g. "Yesterday,"
  clean: string; // clean lowercase e.g. "yesterday"
}

export const MusicStudy: React.FC = () => {
  const { targetLanguage } = useApp();

  // --- States ---
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [songSettingsOpen, setSongSettingsOpen] = useState(false);
  const [studyTab, setStudyTab] = useState<'lyrics' | 'cloze' | 'reorder'>('lyrics');

  // Add song form states
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newTranslation, setNewTranslation] = useState('');

  // Local storage lists for music-specific favorites and stars
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hl_music_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [phraseStars, setPhraseStars] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('hl_music_stars');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Autoplay and card control settings
  const [repetitions, setRepetitions] = useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [pauseDuration, setPauseDuration] = useState<number>(0.5);
  const [infiniteLoop, setInfiniteLoop] = useState<boolean>(() => {
    return localStorage.getItem('hl_music_infinite_loop') === 'true';
  });
  const [showReplayDropdown, setShowReplayDropdown] = useState<boolean>(false);
  const [showTargetOnly, setShowTargetOnly] = useState(false);
  const [showTranslationOnly, setShowTranslationOnly] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Line editing states
  const [editingLineIdx, setEditingLineIdx] = useState<number | null>(null);
  const [editLineText, setEditLineText] = useState('');
  const [editLineTranslation, setEditLineTranslation] = useState('');

  // Single sentence addition states (inside settings modal)
  const [addSingleLyric, setAddSingleLyric] = useState('');
  const [addSingleTrans, setAddSingleTrans] = useState('');

  // Batch import states (inside settings modal)
  const [batchImportInput, setBatchImportInput] = useState('');
  const [batchImportMode, setBatchImportMode] = useState<'append' | 'overwrite'>('append');

  // Cloze Game States
  const [hiddenWordPositions, setHiddenWordPositions] = useState<Record<string, { original: string; clean: string }>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [clozeSubmitted, setClozeSubmitted] = useState(false);
  const [clozeScore, setClozeScore] = useState<{ correct: number; total: number } | null>(null);

  // Word Scramble Game States
  const [selectedScrambleLineIdx, setSelectedScrambleLineIdx] = useState<number>(0);
  const [scrambledWords, setScrambledWords] = useState<ScrambledWord[]>([]);
  const [orderedWords, setOrderedWords] = useState<ScrambledWord[]>([]);
  const [reorderSubmitted, setReorderSubmitted] = useState(false);
  const [reorderCorrect, setReorderCorrect] = useState<boolean | null>(null);

  // Refs for Autoplay Shadowing
  const playbackSpeedRef = useRef(playbackSpeed);
  const repetitionsRef = useRef(repetitions);
  const pauseDurationRef = useRef(pauseDuration);
  const infiniteLoopRef = useRef(infiniteLoop);
  const currentRepRef = useRef(1);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const activeAudioResolveRef = useRef<(() => void) | null>(null);

  // Sync refs with state
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);
  useEffect(() => { repetitionsRef.current = repetitions; }, [repetitions]);
  useEffect(() => { pauseDurationRef.current = pauseDuration; }, [pauseDuration]);
  useEffect(() => { infiniteLoopRef.current = infiniteLoop; }, [infiniteLoop]);

  // Save infinite loop handler
  const saveInfiniteLoop = (val: boolean) => {
    setInfiniteLoop(val);
    localStorage.setItem('hl_music_infinite_loop', String(val));
  };

  // --- Load Songs ---
  useEffect(() => {
    const loadSongs = () => {
      const stored = localStorage.getItem('hl_custom_songs');
      const custom: Song[] = stored ? JSON.parse(stored) : [];
      setSongs([...PRELOADED_SONGS, ...custom]);
    };
    loadSongs();
  }, [addModalOpen]);

  // Filtered catalog by current language
  const filteredSongs = useMemo(() => {
    return songs.filter(s => s.language_id === targetLanguage);
  }, [songs, targetLanguage]);

  // Get Youtube Video ID
  const youtubeId = useMemo(() => {
    if (!activeSong) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = activeSong.youtube_url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [activeSong]);

  // Split lyrics and translations into aligned lists
  const songLines = useMemo(() => {
    if (!activeSong) return [];
    const lyricLines = activeSong.lyrics.split('\n');
    const transLines = activeSong.translation.split('\n');
    const maxLength = Math.max(lyricLines.length, transLines.length);

    const aligned = [];
    for (let i = 0; i < maxLength; i++) {
      aligned.push({
        lyric: lyricLines[i] || '',
        translation: transLines[i] || ''
      });
    }
    return aligned;
  }, [activeSong]);

  // Clean lines (removing empty spacers) for practice and scramble games
  const cleanSongLines = useMemo(() => {
    return songLines.map((line, idx) => ({
      ...line,
      originalIdx: idx
    })).filter(l => l.lyric.trim() !== '');
  }, [songLines]);

  // --- TTS Audio Player Helper ---
  const speakLine = (text: string, langCode: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel();
        
        if (activeAudioResolveRef.current) {
          try { activeAudioResolveRef.current(); } catch (e) {}
          activeAudioResolveRef.current = null;
        }
        activeAudioResolveRef.current = resolve;

        const utterance = new SpeechSynthesisUtterance(text);
        activeUtteranceRef.current = utterance;
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
      } catch (err) {
        activeUtteranceRef.current = null;
        resolve();
      }
    });
  };

  // Stop Autoplay player
  const stopPlayer = () => {
    setIsPlaying(false);
    setPlayingIndex(null);
    window.speechSynthesis.cancel();
    activeUtteranceRef.current = null;
    if (activeAudioResolveRef.current) {
      try { activeAudioResolveRef.current(); } catch (e) {}
      activeAudioResolveRef.current = null;
    }
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  // Sequential Autoplay Shadowing Effect
  useEffect(() => {
    if (!isPlaying || !activeSong) return;

    const runAutoplay = async () => {
      if (playingIndex === null || playingIndex >= cleanSongLines.length) {
        if (infiniteLoopRef.current) {
          currentRepRef.current = 1;
          setPlayingIndex(0);
        } else {
          stopPlayer();
        }
        return;
      }

      const line = cleanSongLines[playingIndex];
      const cardId = `song-card-${activeSong.id}-${line.originalIdx}`;
      const elem = document.getElementById(cardId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Auto reveal translation if enabled
      setRevealedCards(prev => ({ ...prev, [`${activeSong.id}-${line.originalIdx}`]: true }));

      // Repetitions Loop
      for (let r = currentRepRef.current; r <= repetitionsRef.current; r++) {
        if (!isPlaying) return;
        currentRepRef.current = r;

        await speakLine(line.lyric, activeSong.language_id || targetLanguage);

        if (r < repetitionsRef.current && isPlaying) {
          await new Promise(res => {
            autoplayTimerRef.current = setTimeout(res, pauseDurationRef.current * 1000) as any;
          });
        }
      }

      // Wait between lines
      if (isPlaying) {
        currentRepRef.current = 1;
        await new Promise(res => {
          autoplayTimerRef.current = setTimeout(res, pauseDurationRef.current * 1000) as any;
        });
        setPlayingIndex(prev => (prev !== null ? prev + 1 : null));
      }
    };

    runAutoplay();

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, playingIndex, cleanSongLines, activeSong]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopPlayer();
  }, []);

  const togglePlayAutoplay = () => {
    if (isPlaying) {
      stopPlayer();
    } else {
      if (cleanSongLines.length === 0) return;
      setIsPlaying(true);
      setPlayingIndex(0);
      currentRepRef.current = 1;
    }
  };

  const handleCardClick = (lineText: string, index: number) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      activeUtteranceRef.current = null;
      if (activeAudioResolveRef.current) {
        try { activeAudioResolveRef.current(); } catch (e) {}
        activeAudioResolveRef.current = null;
      }
      currentRepRef.current = 1;
      setPlayingIndex(index);
    } else {
      speakLine(lineText, activeSong?.language_id || targetLanguage);
    }
  };

  // --- Favorites & Stars Handlers ---
  const toggleFavorite = (lineKey: string) => {
    const nextFavs = favorites.includes(lineKey)
      ? favorites.filter(k => k !== lineKey)
      : [...favorites, lineKey];
    setFavorites(nextFavs);
    localStorage.setItem('hl_music_favorites', JSON.stringify(nextFavs));
  };

  const handleRateStars = (lineKey: string, stars: number) => {
    const nextStars = { ...phraseStars, [lineKey]: stars };
    setPhraseStars(nextStars);
    localStorage.setItem('hl_music_stars', JSON.stringify(nextStars));
  };

  // --- Line Management (Single Edit, Add, Delete, Batch Import/Export) ---
  const startEditLine = (originalIdx: number, lyric: string, translation: string) => {
    setEditingLineIdx(originalIdx);
    setEditLineText(lyric);
    setEditLineTranslation(translation);
  };

  const saveEditLine = () => {
    if (!activeSong || editingLineIdx === null) return;

    const lyricsLines = activeSong.lyrics.split('\n');
    const transLines = activeSong.translation.split('\n');

    lyricsLines[editingLineIdx] = editLineText.trim();
    transLines[editingLineIdx] = editLineTranslation.trim();

    saveUpdatedSongLines(lyricsLines, transLines);
    setEditingLineIdx(null);
  };

  const deleteLine = (originalIdx: number) => {
    if (!activeSong) return;
    if (!window.confirm("Deseja realmente excluir esta linha da música?")) return;

    const lyricsLines = activeSong.lyrics.split('\n');
    const transLines = activeSong.translation.split('\n');

    lyricsLines.splice(originalIdx, 1);
    transLines.splice(originalIdx, 1);

    saveUpdatedSongLines(lyricsLines, transLines);
    setEditingLineIdx(null);
  };

  const handleAddSingleLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSong || !addSingleLyric.trim() || !addSingleTrans.trim()) return;

    const lyricsLines = activeSong.lyrics.split('\n');
    const transLines = activeSong.translation.split('\n');

    lyricsLines.push(addSingleLyric.trim());
    transLines.push(addSingleTrans.trim());

    saveUpdatedSongLines(lyricsLines, transLines);
    setAddSingleLyric('');
    setAddSingleTrans('');
    alert("Nova linha adicionada no final com sucesso!");
  };

  const handleBatchImportLines = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSong || !batchImportInput.trim()) return;

    const rows = batchImportInput.split('\n');
    const newLyrics: string[] = [];
    const newTranslations: string[] = [];

    rows.forEach(row => {
      if (!row.trim()) return;
      let parts = row.split(';');
      if (parts.length < 2) parts = row.split('\t');
      if (parts.length < 2) parts = row.split(',');

      const lyric = parts[0]?.trim() || '';
      const trans = parts[1]?.trim() || '';
      if (lyric) {
        newLyrics.push(lyric);
        newTranslations.push(trans);
      }
    });

    if (newLyrics.length === 0) {
      alert("Nenhum verso válido encontrado para importação.");
      return;
    }

    let finalLyrics = activeSong.lyrics.split('\n');
    let finalTrans = activeSong.translation.split('\n');

    if (batchImportMode === 'overwrite') {
      finalLyrics = newLyrics;
      finalTrans = newTranslations;
    } else {
      finalLyrics = [...finalLyrics, ...newLyrics];
      finalTrans = [...finalTrans, ...newTranslations];
    }

    saveUpdatedSongLines(finalLyrics, finalTrans);
    setBatchImportInput('');
    alert(`Sucesso! Importados ${newLyrics.length} versos.`);
  };

  const handleSpreadsheetImportLines = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSong) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const rows = text.split('\n');
      const newLyrics: string[] = [];
      const newTranslations: string[] = [];

      rows.forEach(row => {
        if (!row.trim()) return;
        let parts = row.split(';');
        if (parts.length < 2) parts = row.split('\t');
        if (parts.length < 2) parts = row.split(',');

        const lyric = parts[0]?.trim() || '';
        const trans = parts[1]?.trim() || '';

        if (lyric.toLowerCase() === 'original' || lyric.toLowerCase() === 'texto' || lyric.toLowerCase() === 'frase') {
          return; // Skip header
        }

        if (lyric) {
          newLyrics.push(lyric);
          newTranslations.push(trans);
        }
      });

      if (newLyrics.length === 0) {
        alert("Nenhum verso válido encontrado no arquivo.");
        return;
      }

      let finalLyrics = activeSong.lyrics.split('\n');
      let finalTrans = activeSong.translation.split('\n');

      if (batchImportMode === 'overwrite') {
        finalLyrics = newLyrics;
        finalTrans = newTranslations;
      } else {
        finalLyrics = [...finalLyrics, ...newLyrics];
        finalTrans = [...finalTrans, ...newTranslations];
      }

      saveUpdatedSongLines(finalLyrics, finalTrans);
      e.target.value = '';
      alert(`Sucesso! Importados ${newLyrics.length} versos do arquivo CSV.`);
    };
    reader.readAsText(file);
  };

  const handleExportLinesSpreadsheet = () => {
    if (!activeSong || songLines.length === 0) return;

    const headers = 'Original;Tradução\n';
    const rows = songLines.map(line => {
      const lyric = line.lyric.replace(/"/g, '""');
      const trans = line.translation.replace(/"/g, '""');
      return `"${lyric}";"${trans}"`;
    }).join('\n');

    const csvContent = '\uFEFF' + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = activeSong.title.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'musica';
    link.download = `letra_${sanitizedTitle}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveUpdatedSongLines = (lyrics: string[], translations: string[]) => {
    if (!activeSong) return;

    const updatedSong: Song = {
      ...activeSong,
      lyrics: lyrics.join('\n'),
      translation: translations.join('\n')
    };

    // Update state
    setActiveSong(updatedSong);

    // Save custom songs to localStorage
    const stored = localStorage.getItem('hl_custom_songs');
    const custom: Song[] = stored ? JSON.parse(stored) : [];
    const updatedCustom = custom.map(s => s.id === activeSong.id ? updatedSong : s);
    localStorage.setItem('hl_custom_songs', JSON.stringify(updatedCustom));
  };

  // --- Game 1: Prepare Cloze Test ---
  const initClozeGame = (song: Song) => {
    const lines = song.lyrics.split('\n');
    const positions: Record<string, { original: string; clean: string }> = {};
    
    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const words = trimmed.split(/\s+/);
      const candidates: number[] = [];

      words.forEach((word, wordIdx) => {
        const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim();
        if (clean.length > 3) {
          candidates.push(wordIdx);
        }
      });

      if (candidates.length > 0) {
        const numToHide = candidates.length >= 5 ? 2 : 1;
        const chosenIndices: number[] = [];
        for (let i = 0; i < numToHide; i++) {
          const selectIndex = (line.length + i) % candidates.length;
          const targetWordIdx = candidates[selectIndex];
          if (!chosenIndices.includes(targetWordIdx)) {
            chosenIndices.push(targetWordIdx);
          }
        }

        chosenIndices.forEach(wordIdx => {
          const original = words[wordIdx];
          const clean = original.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim();
          positions[`${lineIdx}-${wordIdx}`] = { original, clean };
        });
      }
    });

    setHiddenWordPositions(positions);
    setUserAnswers({});
    setClozeSubmitted(false);
    setClozeScore(null);
  };

  const handleClozeCheck = () => {
    let correctCount = 0;
    const totalCount = Object.keys(hiddenWordPositions).length;

    Object.entries(hiddenWordPositions).forEach(([key, value]) => {
      const userAnswer = (userAnswers[key] || '').trim().toLowerCase();
      const correctAnswer = value.clean.toLowerCase();

      const normalizedUser = userAnswer.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedCorrect = correctAnswer.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (normalizedUser === normalizedCorrect) {
        correctCount++;
      }
    });

    setClozeScore({ correct: correctCount, total: totalCount });
    setClozeSubmitted(true);
  };

  const handleClozeReset = () => {
    if (activeSong) {
      initClozeGame(activeSong);
    }
  };

  // --- Game 2: Prepare Word Scramble Game ---
  const initScrambleGame = (song: Song, lineIdx: number = 0) => {
    const lines = song.lyrics.split('\n').map((l, i) => ({ text: l.trim(), originalIdx: i })).filter(l => l.text !== '');
    if (lines.length === 0) return;

    const actualIdx = Math.min(lineIdx, lines.length - 1);
    setSelectedScrambleLineIdx(actualIdx);
    setReorderSubmitted(false);
    setReorderCorrect(null);
    setOrderedWords([]);

    const targetLine = lines[actualIdx].text;
    const rawWords = targetLine.split(/\s+/);

    const wordsWithIds: ScrambledWord[] = rawWords.map((word, i) => ({
      id: `word-${actualIdx}-${i}`,
      text: word,
      clean: word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim().toLowerCase()
    }));

    const scrambled = [...wordsWithIds].sort(() => 0.5 - Math.random());
    setScrambledWords(scrambled);
  };

  const handleMoveToOrderedWord = (word: ScrambledWord) => {
    if (reorderSubmitted) return;
    setScrambledWords(prev => prev.filter(w => w.id !== word.id));
    setOrderedWords(prev => [...prev, word]);
  };

  const handleRemoveFromOrderedWord = (word: ScrambledWord) => {
    if (reorderSubmitted) return;
    setOrderedWords(prev => prev.filter(w => w.id !== word.id));
    setScrambledWords(prev => [...prev, word]);
  };

  const handleScrambleCheck = () => {
    const cleanLines = activeSong?.lyrics.split('\n').map(l => l.trim()).filter(l => l !== '') || [];
    const targetLine = cleanLines[selectedScrambleLineIdx];
    const originalWords = targetLine.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim().toLowerCase());

    if (orderedWords.length !== originalWords.length) return;

    let isCorrect = true;
    for (let i = 0; i < originalWords.length; i++) {
      if (orderedWords[i].clean !== originalWords[i]) {
        isCorrect = false;
        break;
      }
    }

    setReorderCorrect(isCorrect);
    setReorderSubmitted(true);
  };

  const handleNextScrambleLine = () => {
    const cleanLines = activeSong?.lyrics.split('\n').map(l => l.trim()).filter(l => l !== '') || [];
    if (selectedScrambleLineIdx + 1 < cleanLines.length) {
      initScrambleGame(activeSong!, selectedScrambleLineIdx + 1);
    }
  };

  const handleScrambleReset = () => {
    if (activeSong) {
      initScrambleGame(activeSong, selectedScrambleLineIdx);
    }
  };

  // --- Handlers ---
  const handleSelectSong = (song: Song) => {
    setActiveSong(song);
    setStudyTab('lyrics');
    initClozeGame(song);
    initScrambleGame(song, 0);
  };

  const handleBackToLibrary = () => {
    stopPlayer();
    setActiveSong(null);
    setClozeSubmitted(false);
    setReorderSubmitted(false);
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim() || !newUrl.trim() || !newLyrics.trim() || !newTranslation.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newSong: Song = {
      id: `custom-song-${Date.now()}`,
      language_id: targetLanguage,
      title: newTitle.trim(),
      artist: newArtist.trim(),
      youtube_url: newUrl.trim(),
      lyrics: newLyrics.trim(),
      translation: newTranslation.trim()
    };

    const stored = localStorage.getItem('hl_custom_songs');
    const custom: Song[] = stored ? JSON.parse(stored) : [];
    const updated = [newSong, ...custom];
    localStorage.setItem('hl_custom_songs', JSON.stringify(updated));

    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setNewLyrics('');
    setNewTranslation('');
    setAddModalOpen(false);

    alert(`Música "${newSong.title}" adicionada com sucesso!`);
  };

  const handleDeleteSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Deseja realmente excluir esta música?")) return;

    const stored = localStorage.getItem('hl_custom_songs');
    const custom: Song[] = stored ? JSON.parse(stored) : [];
    const updated = custom.filter(s => s.id !== songId);
    localStorage.setItem('hl_custom_songs', JSON.stringify(updated));
    setSongs(prev => prev.filter(s => s.id !== songId));

    if (activeSong?.id === songId) {
      setActiveSong(null);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* ── Library View (Selection) ── */}
      {!activeSong ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Music size={24} style={{ color: 'var(--accent)' }} />
                <span>Estudar com Músicas</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Aprenda vocabulário, melhore a escuta e divirta-se jogando com as letras.
              </p>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setAddModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <Plus size={16} /> Adicionar Música
            </button>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            marginTop: '8px'
          }}>
            {filteredSongs.map((song) => {
              const isPreloaded = song.id.startsWith('preloaded-');
              return (
                <div 
                  key={song.id}
                  className="glass-card list-card"
                  onClick={() => handleSelectSong(song)}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    height: '140px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.title}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.artist}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '1.3rem',
                      background: 'rgba(255,255,255,0.05)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPreloaded ? '🌟' : '🎵'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: isPreloaded ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)',
                      color: isPreloaded ? 'var(--accent)' : 'var(--text-muted)'
                    }}>
                      {isPreloaded ? 'Coleção Padrão' : 'Personalizada'}
                    </span>

                    {!isPreloaded && (
                      <button 
                        onClick={(e) => handleDeleteSong(song.id, e)}
                        className="btn-icon"
                        style={{ color: 'var(--danger)', background: 'none', border: 'none', padding: '4px' }}
                        title="Excluir música"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSongs.length === 0 && (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border)'
              }}>
                Nenhuma música cadastrada para este idioma. Clique em "Adicionar Música" no topo para começar!
              </div>
            )}
          </div>
        </div>
      ) : (
        
        // ── Arena View (Active Study) ──
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
          
          {/* Active Song Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button 
              onClick={handleBackToLibrary}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <ArrowLeft size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Biblioteca</span>
            </button>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', textAlign: 'right' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Estudando Música
                </span>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {activeSong.title} — <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{activeSong.artist}</span>
                </h4>
              </div>
              <button 
                className="btn-icon"
                onClick={() => setSongSettingsOpen(true)}
                title="Configurações e Lote da Música"
                style={{ width: '38px', height: '38px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Split Workspace Layout */}
          <div className="music-split-layout">
            
            {/* Left column: YouTube Video and Details */}
            <div className="music-left-panel">
              
              {/* YouTube Card */}
              <div className="glass-card" style={{ padding: '10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {youtubeId ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
                      title={activeSong.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '200px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)'
                  }}>
                    <Youtube size={32} />
                    <span style={{ fontSize: '0.8rem' }}>Link do YouTube inválido ou ausente</span>
                  </div>
                )}
              </div>

              {/* Instructions / Info Box */}
              <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} /> Como praticar?
                </span>
                
                {studyTab === 'lyrics' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Dê o <strong>Play</strong> no vídeo para escutar a música. Leia a letra no idioma original na coluna esquerda e confira a tradução à direita para enriquecer seu vocabulário.
                  </p>
                )}

                {studyTab === 'cloze' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Jogo Letra Oculta</strong>: Algumas palavras foram ocultadas com caixas de texto. Ouça a música com atenção, preencha os espaços em branco e clique em <strong>Verificar Respostas</strong> para testar seu listening!
                  </p>
                )}

                {studyTab === 'reorder' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Jogo Reorganizar Palavras</strong>: Escolha uma linha da música. Clique nas palavras embaralhadas na ordem correta em que aparecem no verso da música. Clique em <strong>Verificar Ordenação</strong> para conferir.
                  </p>
                )}
              </div>
            </div>

            {/* Right column: Interactive Tabs and games */}
            <div className="music-right-panel">
              
              {/* Tabs Switcher */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <button
                  onClick={() => { stopPlayer(); setStudyTab('lyrics'); }}
                  className={`tab-btn ${studyTab === 'lyrics' ? 'active' : ''}`}
                  style={{
                    flex: 1, padding: '14px 10px', background: 'none', border: 'none',
                    color: studyTab === 'lyrics' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', borderBottom: studyTab === 'lyrics' ? '2px solid var(--accent)' : '2px solid transparent'
                  }}
                >
                  Letra (Sentenças)
                </button>
                <button
                  onClick={() => { stopPlayer(); setStudyTab('cloze'); initClozeGame(activeSong); }}
                  className={`tab-btn ${studyTab === 'cloze' ? 'active' : ''}`}
                  style={{
                    flex: 1, padding: '14px 10px', background: 'none', border: 'none',
                    color: studyTab === 'cloze' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', borderBottom: studyTab === 'cloze' ? '2px solid var(--accent)' : '2px solid transparent'
                  }}
                >
                  Jogo: Letra Oculta
                </button>
                <button
                  onClick={() => { stopPlayer(); setStudyTab('reorder'); initScrambleGame(activeSong, 0); }}
                  className={`tab-btn ${studyTab === 'reorder' ? 'active' : ''}`}
                  style={{
                    flex: 1, padding: '14px 10px', background: 'none', border: 'none',
                    color: studyTab === 'reorder' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', borderBottom: studyTab === 'reorder' ? '2px solid var(--accent)' : '2px solid transparent'
                  }}
                >
                  Jogo: Reorganizar Palavras
                </button>
              </div>

              {/* Tab Workspace content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                
                {/* 1. Lyrics and translation (Island Practice Mode) */}
                {studyTab === 'lyrics' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Autoplay Shadowing banner */}
                    <div className="autoplay-banner" style={{ margin: 0 }}>
                      <div className="autoplay-controls-group">
                        <button 
                          onClick={togglePlayAutoplay}
                          style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            background: isPlaying ? 'var(--danger)' : 'var(--accent)',
                            border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                            {isPlaying ? 'Autoplay rodando...' : 'Autoplay Shadowing'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Treinar audição sequencial
                          </span>
                        </div>
                      </div>

                      <div className="autoplay-controls-group" style={{ gap: '6px' }}>
                        
                        {/* Dropdown for Replay Options (Repetitions + Infinite Loop) */}
                        <div style={{ position: 'relative' }}>
                          <button 
                            className={`settings-btn ${infiniteLoop ? 'active' : ''}`}
                            style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setShowReplayDropdown(prev => !prev)}
                          >
                            <Repeat size={12} />
                            <span>Rep {repetitions}x {infiniteLoop && '∞'}</span>
                          </button>

                          {showReplayDropdown && (
                            <>
                              {/* Backdrop to close dropdown on outer click */}
                              <div 
                                style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 99 }}
                                onClick={() => setShowReplayDropdown(false)}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                zIndex: 100,
                                minWidth: '180px',
                                boxShadow: 'var(--shadow-md)',
                                animation: 'scaleIn 0.15s ease-out'
                              }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', textAlign: 'left' }}>
                                  Repetições por Frase
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => { setRepetitions(num); }}
                                      className={`settings-btn ${repetitions === num ? 'active' : ''}`}
                                      style={{ padding: '4px 8px', flex: 1, fontSize: '0.75rem', minWidth: '28px' }}
                                    >
                                      {num}x
                                    </button>
                                  ))}
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                                <button
                                  type="button"
                                  onClick={() => { saveInfiniteLoop(!infiniteLoop); }}
                                  className={`settings-btn ${infiniteLoop ? 'active' : ''}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 10px',
                                    fontSize: '0.75rem',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                >
                                  <span>Loop Infinito (Lista)</span>
                                  <Repeat size={12} style={{ color: infiniteLoop ? 'white' : 'var(--text-muted)' }} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        <button 
                          className={`btn-icon ${showTargetOnly ? 'active' : ''}`}
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => {
                            setShowTargetOnly(prev => !prev);
                            if (!showTargetOnly) setShowTranslationOnly(false);
                          }}
                          title="Apenas idioma original"
                        >
                          <Headphones size={14} />
                        </button>

                        <button 
                          className={`btn-icon ${showTranslationOnly ? 'active' : ''}`}
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => {
                            setShowTranslationOnly(prev => !prev);
                            if (!showTranslationOnly) setShowTargetOnly(false);
                          }}
                          title="Apenas tradução"
                        >
                          <MessageSquare size={14} />
                        </button>

                        <button
                          className="settings-btn"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          onClick={() => {
                            const speeds = [0.8, 1.0, 1.25, 1.5, 2.0];
                            const idx = speeds.indexOf(playbackSpeed);
                            setPlaybackSpeed(speeds[(idx + 1) % speeds.length]);
                          }}
                        >
                          {playbackSpeed}x
                        </button>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {cleanSongLines.map((line, idx) => {
                        const lineKey = `${activeSong.id}-${line.originalIdx}`;
                        const isCardPlaying = isPlaying && playingIndex === idx;
                        const isCardFavorite = favorites.includes(lineKey);
                        const isCardRevealed = revealedCards[lineKey] || false;
                        const starsCount = phraseStars[lineKey] || 0;

                        if (editingLineIdx === line.originalIdx) {
                          return (
                            <form 
                              key={line.originalIdx}
                              onSubmit={(e) => { e.preventDefault(); saveEditLine(); }}
                              className="glass-card scale-in"
                              style={{
                                padding: '16px',
                                border: '1px solid var(--accent)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Editar Frase da Letra</strong>
                                <button 
                                  type="button" 
                                  className="settings-btn" 
                                  style={{ border: 'none', padding: '2px 8px', fontSize: '0.7rem' }} 
                                  onClick={() => setEditingLineIdx(null)}
                                >
                                  Cancelar
                                </button>
                              </div>

                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.7rem' }}>Texto Original</label>
                                <input 
                                  type="text"
                                  className="input-text"
                                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px 10px' }}
                                  value={editLineText}
                                  onChange={(e) => setEditLineText(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.7rem' }}>Tradução em Português</label>
                                <input 
                                  type="text"
                                  className="input-text"
                                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px 10px' }}
                                  value={editLineTranslation}
                                  onChange={(e) => setEditLineTranslation(e.target.value)}
                                  required
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>
                                  Salvar Alterações
                                </button>
                                <button 
                                  type="button"
                                  className="btn"
                                  onClick={() => deleteLine(line.originalIdx)}
                                  style={{
                                    padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer',
                                    background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)'
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
                            key={line.originalIdx}
                            id={`song-card-${activeSong.id}-${line.originalIdx}`}
                            className={`phrase-list-card ${isCardPlaying ? 'playing' : ''}`}
                            onClick={() => handleCardClick(line.lyric, idx)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="phrase-card-content-layout">
                              <div className="phrase-card-meta-group">
                                <span className="phrase-card-number">
                                  #{idx + 1}
                                </span>

                                {/* Favorite star */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(lineKey); }}
                                  style={{ background: 'none', border: 'none', color: isCardFavorite ? '#eab308' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '2px' }}
                                >
                                  <Star size={13} fill={isCardFavorite ? '#eab308' : 'none'} />
                                </button>

                                {/* Edit Line button */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); startEditLine(line.originalIdx, line.lyric, line.translation); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '2px' }}
                                  title="Editar linha"
                                >
                                  <Edit2 size={13} />
                                </button>
                              </div>

                              {/* Play Individual button */}
                              <button 
                                className="phrase-card-play-btn"
                                onClick={(e) => { e.stopPropagation(); handleCardClick(line.lyric, idx); }}
                                style={{ background: 'none', border: 'none', color: isCardPlaying ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '2px' }}
                              >
                                <Play size={15} fill={isCardPlaying ? 'currentColor' : 'none'} />
                              </button>

                              {/* Card Text Content */}
                              <div className="phrase-card-text-block">
                                
                                {showTargetOnly && (
                                  <>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      {line.lyric}
                                    </span>
                                    {isCardRevealed ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          {line.translation}
                                        </span>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setRevealedCards(prev => ({ ...prev, [lineKey]: false })); }}
                                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                          <EyeOff size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setRevealedCards(prev => ({ ...prev, [lineKey]: true })); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, textAlign: 'left' }}
                                      >
                                        Ver tradução
                                      </button>
                                    )}
                                  </>
                                )}

                                {showTranslationOnly && (
                                  <>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      {line.translation}
                                    </span>
                                    {isCardRevealed ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                                          {line.lyric}
                                        </span>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setRevealedCards(prev => ({ ...prev, [lineKey]: false })); }}
                                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                          <EyeOff size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setRevealedCards(prev => ({ ...prev, [lineKey]: true })); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, textAlign: 'left' }}
                                      >
                                        Ver original
                                      </button>
                                    )}
                                  </>
                                )}

                                {!showTargetOnly && !showTranslationOnly && (
                                  <>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      {line.lyric}
                                    </span>
                                    {isCardRevealed ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                          {line.translation}
                                        </span>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setRevealedCards(prev => ({ ...prev, [lineKey]: false })); }}
                                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                        >
                                          <EyeOff size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setRevealedCards(prev => ({ ...prev, [lineKey]: true })); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, textAlign: 'left' }}
                                      >
                                        Toque para revelar
                                      </button>
                                    )}
                                  </>
                                )}

                              </div>

                              {/* 5-Star Ratings */}
                              <div className="phrase-stars-container">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star}
                                    size={13}
                                    className={`phrase-star ${star <= starsCount ? 'active' : ''}`}
                                    fill={star <= starsCount ? 'currentColor' : 'none'}
                                    onClick={(e) => { e.stopPropagation(); handleRateStars(lineKey, star); }}
                                  />
                                ))}
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* 2. Cloze / Fill in the Blanks Game */}
                {studyTab === 'cloze' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Score Bar */}
                    {clozeScore !== null && (
                      <div className="glass-card" style={{
                        padding: '12px 20px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.2rem' }}>🏆</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Seu Resultado:</span>
                        </div>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: clozeScore.correct === clozeScore.total ? 'var(--success)' : 'var(--accent)'
                        }}>
                          {clozeScore.correct} / {clozeScore.total} acertos ({Math.round((clozeScore.correct / clozeScore.total) * 100)}%)
                        </span>
                      </div>
                    )}

                    {/* Lyrics with Inputs */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      lineHeight: '2'
                    }}>
                      {activeSong.lyrics.split('\n').map((line, lineIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={lineIdx} style={{ height: '16px' }} />;

                        const words = trimmed.split(/\s+/);

                        return (
                          <div key={lineIdx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                            {words.map((word, wordIdx) => {
                              const key = `${lineIdx}-${wordIdx}`;
                              const isHidden = hiddenWordPositions[key];

                              if (isHidden) {
                                const cleanTarget = isHidden.clean;
                                const userVal = userAnswers[key] || '';
                                const isUserCorrect = userVal.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === cleanTarget.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                                return (
                                  <span key={wordIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
                                    <input 
                                      type="text"
                                      value={userVal}
                                      disabled={clozeSubmitted}
                                      onChange={(e) => {
                                        setUserAnswers(prev => ({
                                          ...prev,
                                          [key]: e.target.value
                                        }));
                                      }}
                                      placeholder={`${cleanTarget.length} letras`}
                                      style={{
                                        background: clozeSubmitted 
                                          ? (isUserCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)')
                                          : 'rgba(255,255,255,0.05)',
                                        border: clozeSubmitted
                                          ? (isUserCorrect ? '1px solid var(--success)' : '1px solid var(--danger)')
                                          : '1px solid var(--border)',
                                        borderRadius: '4px',
                                        color: clozeSubmitted 
                                          ? (isUserCorrect ? '#10b981' : '#ef4444')
                                          : 'white',
                                        padding: '2px 6px',
                                        width: `${Math.max(60, cleanTarget.length * 8 + 14)}px`,
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        outline: 'none',
                                        fontFamily: 'monospace'
                                      }}
                                    />
                                    
                                    {/* Show correction on top if wrong */}
                                    {clozeSubmitted && !isUserCorrect && (
                                      <span style={{
                                        fontSize: '0.7rem',
                                        color: '#10b981',
                                        fontWeight: 700,
                                        marginLeft: '4px'
                                      }} title="Resposta Correta">
                                        ({cleanTarget})
                                      </span>
                                    )}
                                  </span>
                                );
                              }

                              return <span key={wordIdx}>{word}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions Panel */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      {!clozeSubmitted ? (
                        <button 
                          className="btn btn-primary" 
                          onClick={handleClozeCheck}
                          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <CheckCircle size={16} /> Verificar Respostas
                        </button>
                      ) : (
                        <button 
                          className="btn" 
                          onClick={handleClozeReset}
                          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                        >
                          <RotateCcw size={16} /> Jogar Novamente
                        </button>
                      )}
                    </div>

                  </div>
                )}

                {/* 3. Reorganizar Palavras Game */}
                {studyTab === 'reorder' && cleanSongLines.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Line selector dropdown */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Escolha a Frase:</span>
                      <select 
                        className="input-text"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', maxWidth: '280px' }}
                        value={selectedScrambleLineIdx}
                        onChange={(e) => initScrambleGame(activeSong!, parseInt(e.target.value))}
                      >
                        {cleanSongLines.map((line, idx) => (
                          <option key={idx} value={idx}>
                            Frase #{idx + 1}: {line.translation ? (line.translation.length > 35 ? line.translation.substring(0, 35) + '...' : line.translation) : `Frase ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target translation prompt (Hiding English answer and guiding the user) */}
                    <div className="glass-card" style={{ padding: '14px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                        Tradução (Monte a frase correspondente em inglês)
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {cleanSongLines[selectedScrambleLineIdx]?.translation || `Frase ${selectedScrambleLineIdx + 1}`}
                      </span>
                    </div>

                    {/* Word Board layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Box 1: Scrambled Words */}
                      <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '12px' }}>
                          Palavras Embaralhadas (Clique para ordenar)
                        </span>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {scrambledWords.map(word => (
                            <button
                              key={word.id}
                              onClick={() => handleMoveToOrderedWord(word)}
                              disabled={reorderSubmitted}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                cursor: reorderSubmitted ? 'default' : 'pointer',
                                fontSize: '0.8rem',
                                transition: 'all 0.15s',
                                outline: 'none'
                              }}
                            >
                              {word.text}
                            </button>
                          ))}

                          {scrambledWords.length === 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                              Todas as palavras foram posicionadas!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Box 2: Ordered list assembled by user */}
                      <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.25)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success)', display: 'block', marginBottom: '12px' }}>
                          Sua Construção (Clique para remover)
                        </span>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', alignItems: 'center' }}>
                          {orderedWords.map((word, idx) => {
                            const cleanLines = activeSong?.lyrics.split('\n').map(l => l.trim()).filter(l => l !== '') || [];
                            const targetLine = cleanLines[selectedScrambleLineIdx];
                            const originalWords = targetLine.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').trim().toLowerCase());
                            const isCorrectPosition = word.clean === originalWords[idx];

                            return (
                              <button
                                key={word.id}
                                onClick={() => handleRemoveFromOrderedWord(word)}
                                disabled={reorderSubmitted}
                                style={{
                                  background: reorderSubmitted 
                                    ? (isCorrectPosition ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)')
                                    : 'rgba(124,58,237,0.05)',
                                  border: reorderSubmitted
                                    ? (isCorrectPosition ? '1px solid var(--success)' : '1px solid var(--danger)')
                                    : '1px dashed var(--accent)',
                                  color: reorderSubmitted 
                                    ? (isCorrectPosition ? '#10b981' : '#ef4444')
                                    : 'white',
                                  padding: '8px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  cursor: reorderSubmitted ? 'default' : 'pointer',
                                  fontSize: '0.85rem',
                                  outline: 'none'
                                }}
                              >
                                {word.text}
                              </button>
                            );
                          })}

                          {orderedWords.length === 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                              Monte a frase clicando nas palavras acima...
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Result and Next line actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                      {reorderCorrect !== null && (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: reorderCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          border: reorderCorrect ? '1px solid var(--success)' : '1px solid var(--danger)',
                          fontSize: '0.85rem',
                          color: reorderCorrect ? '#10b981' : '#ef4444',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {reorderCorrect ? (
                            <>🎉 Excelente! Frase montada na ordem correta!</>
                          ) : (
                            <>❌ A ordem de algumas palavras não está correta. Tente novamente.</>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {!reorderSubmitted ? (
                          <button
                            className="btn btn-primary"
                            disabled={orderedWords.length === 0}
                            onClick={handleScrambleCheck}
                            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <CheckCircle size={16} /> Verificar Ordenação
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn"
                              onClick={handleScrambleReset}
                              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                            >
                              <RotateCcw size={16} /> Jogar Novamente
                            </button>
                            
                            {reorderCorrect && selectedScrambleLineIdx + 1 < cleanSongLines.length && (
                              <button
                                className="btn btn-primary"
                                onClick={handleNextScrambleLine}
                                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                Próxima Frase <ChevronRight size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── Add Custom Song Modal ── */}
      {addModalOpen && (
        <div className="practice-modal-overlay" onClick={() => setAddModalOpen(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            
            {/* Modal Header */}
            <div className="practice-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <Music size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Adicionar Nova Música</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crie um novo ambiente de estudo musical</span>
                </div>
              </div>
              <button 
                onClick={() => setAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="practice-modal-body" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', padding: '20px' }}>
              <form onSubmit={handleAddSong} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Título da Música</label>
                    <input 
                      type="text" 
                      className="input-text" 
                      style={{ width: '100%' }}
                      placeholder="e.g. Imagine" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Artista / Banda</label>
                    <input 
                      type="text" 
                      className="input-text" 
                      style={{ width: '100%' }}
                      placeholder="e.g. John Lennon" 
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Link do Vídeo no YouTube</label>
                  <input 
                    type="url" 
                    className="input-text" 
                    style={{ width: '100%' }}
                    placeholder="e.g. https://www.youtube.com/watch?v=YkgkThdzWik" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', background: 'rgba(124,58,237,0.05)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(124,58,237,0.2)', alignItems: 'center' }}>
                  <Info size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Instrução Importante:</strong> Para que os jogos funcionem perfeitamente e as traduções fiquem alinhadas, cole a letra original e a tradução linha por linha (a linha 1 da tradução deve ser o significado exato da linha 1 da letra).
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Letra Original</label>
                    <textarea 
                      className="input-text" 
                      style={{ width: '100%', minHeight: '160px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                      placeholder="Imagine there's no heaven&#10;It's easy if you try..." 
                      value={newLyrics}
                      onChange={(e) => setNewLyrics(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Tradução em Português</label>
                    <textarea 
                      className="input-text" 
                      style={{ width: '100%', minHeight: '160px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                      placeholder="Imagine que não há paraíso&#10;É fácil se você tentar..." 
                      value={newTranslation}
                      onChange={(e) => setNewTranslation(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                  Salvar Música na Coleção
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ── Active Song Settings & Batch Management Modal ── */}
      {songSettingsOpen && activeSong && (
        <div className="practice-modal-overlay" onClick={() => setSongSettingsOpen(false)}>
          <div className="practice-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            
            {/* Modal Header */}
            <div className="practice-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <Settings size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Configurações e Lote: {activeSong.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gerencie frases, importação/exportação e player</span>
                </div>
              </div>
              <button 
                onClick={() => setSongSettingsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="practice-modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Practice Settings (Reps, Pause, Speed, Loop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    1. Configurações de Prática
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Repetições do Autoplay</label>
                      <div className="settings-buttons-row">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button 
                            key={num} 
                            type="button"
                            className={`settings-btn ${repetitions === num ? 'active' : ''}`}
                            onClick={() => setRepetitions(num)}
                            style={{ flex: 1, padding: '6px 0' }}
                          >
                            {num}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Pausa entre Versos</label>
                      <div className="settings-buttons-row">
                        {[0, 0.5, 1, 1.5, 2, 3].map(sec => (
                          <button 
                            key={sec} 
                            type="button"
                            className={`settings-btn ${pauseDuration === sec ? 'active' : ''}`}
                            onClick={() => setPauseDuration(sec)}
                            style={{ flex: 1, padding: '6px 0', fontSize: '0.7rem' }}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '8px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Velocidade do Áudio ({playbackSpeed}x)</label>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.25"
                        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Repetição Infinita (Playlist Loop)</label>
                      <div className="settings-buttons-row">
                        <button 
                          type="button" className={`settings-btn ${infiniteLoop ? 'active' : ''}`}
                          onClick={() => saveInfiniteLoop(true)}
                          style={{ flex: 1, padding: '6px 0' }}
                        >
                          Ativado
                        </button>
                        <button 
                          type="button" className={`settings-btn ${!infiniteLoop ? 'active' : ''}`}
                          onClick={() => saveInfiniteLoop(false)}
                          style={{ flex: 1, padding: '6px 0' }}
                        >
                          Desativado
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Add Single Sentence / Line */}
                <form onSubmit={handleAddSingleLine} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    2. Adicionar Frase (Verso Único)
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Texto Original</label>
                      <input 
                        type="text" className="input-text" style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }}
                        placeholder="e.g. All you need is love" required
                        value={addSingleLyric} onChange={(e) => setAddSingleLyric(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Tradução em Português</label>
                      <input 
                        type="text" className="input-text" style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }}
                        placeholder="e.g. Tudo que você precisa é amor" required
                        value={addSingleTrans} onChange={(e) => setAddSingleTrans(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
                    Adicionar Verso
                  </button>
                </form>

                {/* 3. Batch Import / Export Planilha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>3. Importar / Exportar Letra em Lote</span>
                    <button 
                      type="button" className="settings-btn" style={{ fontSize: '0.7rem', padding: '2px 8px', border: '1px solid var(--border)' }}
                      onClick={handleExportLinesSpreadsheet}
                    >
                      Exportar Planilha (CSV)
                    </button>
                  </h4>

                  <form onSubmit={handleBatchImportLines} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
                        <button 
                          type="button" className={`settings-btn ${batchImportMode === 'append' ? 'active' : ''}`}
                          style={{ fontSize: '0.7rem', padding: '4px 8px', border: 'none' }}
                          onClick={() => setBatchImportMode('append')}
                        >
                          Adicionar ao Final
                        </button>
                        <button 
                          type="button" className={`settings-btn ${batchImportMode === 'overwrite' ? 'active' : ''}`}
                          style={{ fontSize: '0.7rem', padding: '4px 8px', border: 'none' }}
                          onClick={() => setBatchImportMode('overwrite')}
                        >
                          Substituir Letra Atual
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input 
                          type="file" accept=".csv,.txt,.tsv" style={{ display: 'none' }}
                          id="song-csv-import-file" onChange={handleSpreadsheetImportLines}
                        />
                        <label 
                          htmlFor="song-csv-import-file" className="btn"
                          style={{ fontSize: '0.7rem', padding: '6px 12px', cursor: 'pointer', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                        >
                          Selecionar Arquivo CSV
                        </label>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>
                        Cole a letra (formato: `Original;Tradução` por linha)
                      </label>
                      <textarea 
                        className="input-text"
                        style={{ width: '100%', minHeight: '120px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.78rem', padding: '8px' }}
                        placeholder="Yesterday;Ontem&#10;Love was such an easy game;O amor era um jogo tão fácil"
                        value={batchImportInput}
                        onChange={(e) => setBatchImportInput(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
                      Importar Lote
                    </button>
                  </form>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default MusicStudy;
