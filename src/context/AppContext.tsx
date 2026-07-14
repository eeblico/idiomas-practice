import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { syncService } from '../services/sync';
import { calculateSM2, calculateFibonacciSpacing } from '../services/sm2';
import seedData from '../data/seedData.json';

// Types
export interface Language {
  id: string;
  name: string;
  flag_emoji: string;
}

export interface Category {
  id: string;
  language_id: string;
  name: string;
  description: string;
}

export interface Phrase {
  id: string;
  language_id: string;
  category_id: string;
  text: string;
  translation: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audio_url: string | null;
  voice_name: string;
  speed: number;
  order_index?: number;
  tags?: string[];
}

export interface LocalReviewItem {
  phrase_id: string;
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  next_review_date: string;
  last_reviewed_at: string;
}

export interface GuestProgress {
  reviewItems: Record<string, LocalReviewItem>;
  favorites: string[];
  streak: number;
  lastPracticeDate: string | null;
  dailyGoalCount: Record<string, number>; // date_string -> count
}

interface AppContextType {
  user: any;
  loading: boolean;
  online: boolean;
  languages: Language[];
  categories: Category[];
  phrases: Phrase[];
  activeTab: 'dashboard' | 'resources' | 'islands' | 'practice' | 'review' | 'stats' | 'settings' | 'admin' | 'media' | 'music' | 'vocabulary';
  setActiveTab: (tab: 'dashboard' | 'resources' | 'islands' | 'practice' | 'review' | 'stats' | 'settings' | 'admin' | 'media' | 'music' | 'vocabulary') => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  activeIslandId: string | null;
  setActiveIslandId: (id: string | null) => void;
  
  // Progress/Stats
  streak: number;
  dailyGoalProgress: number;
  completedToday: number;
  dailyTarget: number;
  favorites: string[];
  reviewsDueCount: number;
  reviewItems: Record<string, any>;

  // Actions
  submitPracticeResult: (phraseId: string, rating: 'easy' | 'medium' | 'hard') => Promise<void>;
  markPhraseAsSeen: (phraseId: string) => Promise<void>;
  markPhrasesAsSeen: (phraseIds: string[]) => Promise<void>;
  toggleFavorite: (phraseId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  addCustomPhrase: (
    text: string,
    translation: string,
    explanation: string,
    difficulty: 'easy' | 'medium' | 'hard',
    voiceName: string,
    speed: number,
    targetCategoryId?: string
  ) => Promise<void>;
  addCustomPhrasesBatch: (
    items: { text: string; translation: string; explanation: string }[]
  ) => Promise<void>;
  reviewAlgorithm: 'sm2' | 'fibonacci';
  setReviewAlgorithm: (algo: 'sm2' | 'fibonacci') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  updatePhrase: (phraseId: string, updatedFields: Partial<Phrase>) => void;
  reorderPhrases: (categoryId: string, phraseId: string, newPositionOneIndexed: number) => void;
  phraseStars: Record<string, number>;
  updatePhraseStars: (phraseId: string, starCount: number) => Promise<void>;
  archivedPhrases: string[];
  suspendedPhrases: string[];
  toggleArchivePhrase: (phraseId: string) => void;
  toggleSuspendPhrase: (phraseId: string) => void;
  updatePhraseTags: (phraseId: string, tags: string[]) => void;
  deletePhrase: (phraseId: string) => void;
  customCategories: Category[];
  addCustomCategory: (name: string, description: string) => Promise<string>;
  deleteCustomCategory: (categoryId: string) => Promise<void>;
  recentIslandIds: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_GUEST_KEY = 'hl_guest_progress';
const LOCAL_LANG_KEY = 'hl_target_language';
const LOCAL_ISLAND_KEY = 'hl_active_island';

// Canonical list of all supported study languages
export const AVAILABLE_LANGUAGES: Language[] = [
  { id: 'en', name: 'Inglês',   flag_emoji: '🇺🇸' },
  { id: 'es', name: 'Espanhol', flag_emoji: '🇪🇸' },
  { id: 'fr', name: 'Francês',  flag_emoji: '🇫🇷' },
  { id: 'it', name: 'Italiano', flag_emoji: '🇮🇹' },
  { id: 'de', name: 'Alemão',   flag_emoji: '🇩🇪' },
  { id: 'zh', name: 'Mandarim', flag_emoji: '🇨🇳' },
  { id: 'ru', name: 'Russo',    flag_emoji: '🇷🇺' },
];

// Category Name overrides map to standard Portuguese titles
export const CATEGORY_NAME_OVERRIDES: Record<string, string> = {
  "300 spartan: the language survival kit": "O Kit de Sobrevivência",
  "kit de sobrevivência": "O Kit de Sobrevivência",
  "kit de sobrevivencia": "O Kit de Sobrevivência",
  "300 questions & answers - part 1": "300 Perguntas e Respostas – Parte 1",
  "300 questions & answers - part 2": "300 Perguntas e Respostas – Parte 2",
  "300 questions & answers - part 3": "300 Perguntas e Respostas – Parte 3",
  "300 perguntas e respostas - parte 1": "300 Perguntas e Respostas – Parte 1",
  "300 perguntas e respostas - parte 2": "300 Perguntas e Respostas – Parte 2",
  "300 perguntas e respostas - parte 3": "300 Perguntas e Respostas – Parte 3",
  "padrões de linguagem 1": "Padrões de Linguagem – Parte 1",
  "padrões de linguagem - parte 2": "Padrões de Linguagem – Parte 2",
  "padrões de linguagem - parte 3": "Padrões de Linguagem – Parte 3",
  "language patterns - part 1": "Padrões de Linguagem – Parte 1",
  "language patterns - part 2": "Padrões de Linguagem – Parte 2",
  "language patterns - part 3": "Padrões de Linguagem – Parte 3",
  "localização e direções": "Localização e Direções",
  "location & directions": "Localização e Direções",
  "falar sobre si mesmo": "Falar Sobre Si Mesmo",
  "talking about yourself": "Falar Sobre Si Mesmo",
  "hora": "Horas e Horários",
  "time": "Horas e Horários",
  "rotina diária": "Rotina Diária",
  "daily routine": "Rotina Diária",
  "hábitos": "Hábitos",
  "habits": "Hábitos",
  "aprendizado de idiomas": "Aprendizado de Idiomas",
  "language learning": "Aprendizado de Idiomas",
  "suas primeiras 100 frases": "Suas Primeiras 100 Frases",
  "100 basic sentences": "Suas Primeiras 100 Frases"
};

const sanitizeCategoryName = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  return CATEGORY_NAME_OVERRIDES[normalized] || name;
};

const DEFAULT_GUEST_PROGRESS: GuestProgress = {
  reviewItems: {},
  favorites: [],
  streak: 0,
  lastPracticeDate: null,
  dailyGoalCount: {}
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  
  // Catalog Data
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [customPhrases, setCustomPhrases] = useState<Phrase[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  // Navigation / Choices
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resources' | 'islands' | 'practice' | 'review' | 'stats' | 'settings' | 'admin' | 'media' | 'music' | 'vocabulary'>('dashboard');
  const [targetLanguage, setTargetLanguageState] = useState<string>('en');
  const [activeIslandId, setActiveIslandIdState] = useState<string | null>(null);
  const [recentIslandIds, setRecentIslandIds] = useState<string[]>([]);

  const [reviewAlgorithm, setReviewAlgorithmState] = useState<'sm2' | 'fibonacci'>(() => {
    return (localStorage.getItem('hl_review_algorithm') as 'sm2' | 'fibonacci') || 'fibonacci';
  });

  const setReviewAlgorithm = (algo: 'sm2' | 'fibonacci') => {
    setReviewAlgorithmState(algo);
    localStorage.setItem('hl_review_algorithm', algo);
  };

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('hl_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('hl_theme', theme);
  }, [theme]);

  // User Progress / Stats (Merged between guest and authenticated user)
  const [guestProgress, setGuestProgress] = useState<GuestProgress>(DEFAULT_GUEST_PROGRESS);
  const [dbProgress, setDbProgress] = useState<{
    streak: number;
    favorites: string[];
    reviewItems: Record<string, any>;
    dailyGoalCount: number;
  }>({
    streak: 0,
    favorites: [],
    reviewItems: {},
    dailyGoalCount: 0
  });

  const dailyTarget = 10; // Default goal count per day

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set target language wrapper
  const setTargetLanguage = (lang: string) => {
    setTargetLanguageState(lang);
    localStorage.setItem(LOCAL_LANG_KEY, lang);
    setActiveIslandId(null);
  };

  // Set active island wrapper
  const setActiveIslandId = (id: string | null) => {
    setActiveIslandIdState(id);
    if (id) {
      localStorage.setItem(LOCAL_ISLAND_KEY, id);
      try {
        const langKey = `hl_recent_islands_${targetLanguage}`;
        const storedRecent = localStorage.getItem(langKey);
        let list: string[] = storedRecent ? JSON.parse(storedRecent) : [];
        list = [id, ...list.filter(x => x !== id)].slice(0, 6);
        localStorage.setItem(langKey, JSON.stringify(list));
        setRecentIslandIds(list);
      } catch (e) {
        console.error('Error updating recent islands:', e);
      }
    } else {
      localStorage.removeItem(LOCAL_ISLAND_KEY);
    }
  };

  // Load guest progress from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_GUEST_KEY);
      if (stored) {
        setGuestProgress(JSON.parse(stored));
      }
      const storedLang = localStorage.getItem(LOCAL_LANG_KEY);
      if (storedLang) {
        setTargetLanguageState(storedLang);
      }
      const storedIsland = localStorage.getItem(LOCAL_ISLAND_KEY);
      if (storedIsland) {
        setActiveIslandIdState(storedIsland);
      }
      const storedCustom = localStorage.getItem('hl_custom_phrases');
      if (storedCustom) {
        setCustomPhrases(JSON.parse(storedCustom));
      }
      const storedCustomCats = localStorage.getItem('hl_custom_categories');
      if (storedCustomCats) {
        setCustomCategories(JSON.parse(storedCustomCats));
      }
      
      const activeLang = storedLang || 'en';
      const langKey = `hl_recent_islands_${activeLang}`;
      const storedRecent = localStorage.getItem(langKey);
      if (storedRecent) {
        setRecentIslandIds(JSON.parse(storedRecent));
      }
    } catch (e) {
      console.error('Error loading guest progress / custom phrases:', e);
    }
  }, []);

  // Load recent islands whenever target language changes
  useEffect(() => {
    try {
      const langKey = `hl_recent_islands_${targetLanguage}`;
      const storedRecent = localStorage.getItem(langKey);
      setRecentIslandIds(storedRecent ? JSON.parse(storedRecent) : []);
    } catch (e) {
      setRecentIslandIds([]);
    }
  }, [targetLanguage]);

  // Save guest progress helper
  const saveGuestProgress = (updated: GuestProgress) => {
    setGuestProgress(updated);
    localStorage.setItem(LOCAL_GUEST_KEY, JSON.stringify(updated));
  };

  // Fetch catalog (languages, islands/categories, phrases)
  const refreshCatalog = async () => {
    try {
      // 1. Fetch Languages
      const { data: langData } = await supabase.from('languages').select('*');
      if (langData && langData.length > 0) {
        // Merge DB languages with our canonical list so all 7 are always available
        const dbIds = new Set(langData.map((l: Language) => l.id));
        const extra = AVAILABLE_LANGUAGES.filter(l => !dbIds.has(l.id));
        setLanguages([...langData, ...extra]);
      } else {
        setLanguages(AVAILABLE_LANGUAGES);
      }

      const setCategoriesWithOverride = (cats: Category[]) => {
        const overridden = cats.map(c => ({
          ...c,
          name: sanitizeCategoryName(c.name)
        }));
        setCategories(overridden);
      };

      // 2. Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData && catData.length > 0) {
        setCategoriesWithOverride(catData);
      } else {
        setCategoriesWithOverride(seedData.categories);
      }

      // 3. Fetch Phrases (published only)
      const { data: phraseData } = await supabase
        .from('phrases')
        .select('*')
        .eq('is_published', true);
      if (phraseData && phraseData.length > 0) {
        setPhrases(phraseData as Phrase[]);
      } else {
        setPhrases(seedData.phrases as Phrase[]);
      }
    } catch (err) {
      console.warn('Error fetching Supabase catalog. Offline or database not configured yet.', err);
      
      const setCategoriesWithOverride = (cats: Category[]) => {
        const overridden = cats.map(c => ({
          ...c,
          name: sanitizeCategoryName(c.name)
        }));
        setCategories(overridden);
      };

      // Local seeds fallback — always expose all 7 languages
      setLanguages(AVAILABLE_LANGUAGES);
      setCategoriesWithOverride(seedData.categories);
      setPhrases(seedData.phrases as Phrase[]);
    }
  };

  // Auth setup and sync trigger
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
        // Sync any offline items from guest period
        syncService.syncOfflineData(session.user.id).then(() => {
          loadUserData(session.user.id);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
        syncService.syncOfflineData(session.user.id).then(() => {
          loadUserData(session.user.id);
        });
      } else {
        setLoading(false);
        setDbProgress({
          streak: 0,
          favorites: [],
          reviewItems: {},
          dailyGoalCount: 0
        });
      }
    });

    refreshCatalog();

    return () => subscription.unsubscribe();
  }, [online]);

  // Load authenticated user stats from Supabase
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      // 1. Load Profile (streak)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      // 2. Load Favorites
      const { data: favs } = await supabase
        .from('favorites')
        .select('phrase_id')
        .eq('user_id', userId);
      const favoriteIds = favs?.map(f => f.phrase_id) || [];

      // 3. Load Review Items
      const { data: reviews } = await supabase
        .from('review_items')
        .select('*')
        .eq('user_id', userId);
      const reviewMap: Record<string, any> = {};
      reviews?.forEach(item => {
        reviewMap[item.phrase_id] = item;
      });

      // 4. Load Daily Goals for today
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: goal } = await supabase
        .from('daily_goals')
        .select('completed_phrases')
        .eq('user_id', userId)
        .eq('date', todayStr)
        .maybeSingle();

      setDbProgress({
        streak: profile?.streak || 0,
        favorites: favoriteIds,
        reviewItems: reviewMap,
        dailyGoalCount: goal?.completed_phrases || 0
      });
    } catch (err) {
      console.error('Error loading DB user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Streak update utility (calculates and updates streak)
  const getUpdatedStreak = (lastDateStr: string | null, currentStreak: number): number => {
    if (!lastDateStr) return 1;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0,0,0,0);
    
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return currentStreak; // Already practiced today, keep streak
    } else if (diffDays === 1) {
      return currentStreak + 1; // Practiced yesterday, increment streak
    } else {
      return 1; // Streak broken, start fresh
    }
  };

  // Log active recall response (SM2 review and goal updates)
  const submitPracticeResult = async (phraseId: string, rating: 'easy' | 'medium' | 'hard') => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Persist practiced date locally for calendar tracking logs
    try {
      const storedDates = localStorage.getItem('hl_practiced_dates');
      const datesList: string[] = storedDates ? JSON.parse(storedDates) : [];
      if (!datesList.includes(todayStr)) {
        datesList.push(todayStr);
        localStorage.setItem('hl_practiced_dates', JSON.stringify(datesList));
      }
      
      // Log daily study counts for contribution calendar grid
      const storedCounts = localStorage.getItem('hl_study_daily_counts');
      const counts: Record<string, number> = storedCounts ? JSON.parse(storedCounts) : {};
      counts[todayStr] = (counts[todayStr] || 0) + 1;
      localStorage.setItem('hl_study_daily_counts', JSON.stringify(counts));

      // Log estimated study time (15 seconds per active recall review card)
      const totalTime = Number(localStorage.getItem('hl_stats_total_study_time_sec') || '0') + 15;
      localStorage.setItem('hl_stats_total_study_time_sec', String(totalTime));
    } catch (e) {
      console.warn('Failed to update local telemetry logs', e);
    }

    if (user) {
      // 1. Authenticated User flow - database updates
      if (online) {
        try {
          // Log User Response
          await supabase.from('user_responses').insert({
            user_id: user.id,
            phrase_id: phraseId,
            difficulty_rating: rating,
            is_correct: rating !== 'hard'
          });

          // Calculate review parameters (SM2 or Fibonacci)
          const prevReview = dbProgress.reviewItems[phraseId];
          const prevReps = prevReview ? prevReview.repetitions : 0;
          const prevInterval = prevReview ? prevReview.interval_days : 0;
          const prevEF = prevReview ? parseFloat(prevReview.ease_factor) : 2.5;

          const sm2 = reviewAlgorithm === 'fibonacci'
            ? calculateFibonacciSpacing(prevReps, rating)
            : calculateSM2(prevReps, prevInterval, prevEF, rating);

          await supabase.from('review_items').upsert({
            user_id: user.id,
            phrase_id: phraseId,
            repetitions: sm2.repetitions,
            interval_days: sm2.intervalDays,
            ease_factor: sm2.easeFactor,
            next_review_date: sm2.nextReviewDate.toISOString(),
            last_reviewed_at: new Date().toISOString()
          });

          // Increment Daily Goals Completed
          const newGoalCompleted = dbProgress.dailyGoalCount + 1;
          await supabase.from('daily_goals').upsert({
            user_id: user.id,
            date: todayStr,
            completed_phrases: newGoalCompleted
          });

          // Update profile streak and last_practice_date
          const lastPractice = dbProgress.streak > 0 ? todayStr : null; // simplified
          const { data: profile } = await supabase.from('profiles').select('last_practice_date').eq('id', user.id).single();
          const nextStreak = getUpdatedStreak(profile?.last_practice_date || null, dbProgress.streak);
          
          await supabase.from('profiles').update({
            streak: nextStreak,
            last_practice_date: todayStr
          }).eq('id', user.id);

          // Update local state directly
          setDbProgress(prev => ({
            ...prev,
            streak: nextStreak,
            dailyGoalCount: newGoalCompleted,
            reviewItems: {
              ...prev.reviewItems,
              [phraseId]: {
                phrase_id: phraseId,
                repetitions: sm2.repetitions,
                interval_days: sm2.intervalDays,
                ease_factor: sm2.easeFactor,
                next_review_date: sm2.nextReviewDate.toISOString()
              }
            }
          }));

        } catch (err) {
          console.error('Failed to log session in database, saving offline...', err);
          syncService.saveResponseOffline({
            phrase_id: phraseId,
            difficulty_rating: rating,
            is_correct: rating !== 'hard'
          });
        }
      } else {
        // Logged in but offline
        syncService.saveResponseOffline({
          phrase_id: phraseId,
          difficulty_rating: rating,
          is_correct: rating !== 'hard'
        });
      }
    } else {
      // 2. Guest User Flow - localStorage updates
      const updated = { ...guestProgress };
      
      // Calculate local review parameters (SM2 or Fibonacci)
      const prevReview = updated.reviewItems[phraseId];
      const prevReps = prevReview ? prevReview.repetitions : 0;
      const prevInterval = prevReview ? prevReview.interval_days : 0;
      const prevEF = prevReview ? prevReview.ease_factor : 2.5;

      const sm2 = reviewAlgorithm === 'fibonacci'
        ? calculateFibonacciSpacing(prevReps, rating)
        : calculateSM2(prevReps, prevInterval, prevEF, rating);

      updated.reviewItems[phraseId] = {
        phrase_id: phraseId,
        repetitions: sm2.repetitions,
        interval_days: sm2.intervalDays,
        ease_factor: sm2.easeFactor,
        next_review_date: sm2.nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString()
      };

      // Daily goal
      updated.dailyGoalCount[todayStr] = (updated.dailyGoalCount[todayStr] || 0) + 1;

      // Streak calculation
      updated.streak = getUpdatedStreak(updated.lastPracticeDate, updated.streak);
      updated.lastPracticeDate = todayStr;

      saveGuestProgress(updated);
    }
  };

  // Mark phrase as seen (initialize review progress with repetitions=0, next_review_date=now)
  const markPhraseAsSeen = async (phraseId: string) => {
    const currentReviewItems = user ? dbProgress.reviewItems : guestProgress.reviewItems;
    if (currentReviewItems[phraseId]) return;

    const todayStr = new Date().toISOString();
    const initReview = {
      phrase_id: phraseId,
      repetitions: 0,
      interval_days: 1,
      ease_factor: 2.5,
      next_review_date: todayStr,
      last_reviewed_at: todayStr
    };

    if (user) {
      if (online) {
        try {
          await supabase.from('review_items').upsert({
            user_id: user.id,
            phrase_id: phraseId,
            repetitions: 0,
            interval_days: 1,
            ease_factor: 2.5,
            next_review_date: todayStr,
            last_reviewed_at: todayStr
          });
          setDbProgress(prev => ({
            ...prev,
            reviewItems: {
              ...prev.reviewItems,
              [phraseId]: initReview
            }
          }));
        } catch (e) {
          console.error('Failed to mark phrase as seen in Supabase:', e);
        }
      }
    } else {
      const updated = { ...guestProgress };
      updated.reviewItems[phraseId] = initReview;
      saveGuestProgress(updated);
    }
  };

  // Mark multiple phrases as seen in batch
  const markPhrasesAsSeen = async (phraseIds: string[]) => {
    const currentReviewItems = user ? dbProgress.reviewItems : guestProgress.reviewItems;
    const newIds = phraseIds.filter(id => !currentReviewItems[id]);
    if (newIds.length === 0) return;

    const todayStr = new Date().toISOString();
    const initReviews: Record<string, any> = {};
    const dbUpserts: any[] = [];

    newIds.forEach(id => {
      const record = {
        phrase_id: id,
        repetitions: 0,
        interval_days: 1,
        ease_factor: 2.5,
        next_review_date: todayStr,
        last_reviewed_at: todayStr
      };
      initReviews[id] = record;
      if (user) {
        dbUpserts.push({
          user_id: user.id,
          phrase_id: id,
          repetitions: 0,
          interval_days: 1,
          ease_factor: 2.5,
          next_review_date: todayStr,
          last_reviewed_at: todayStr
        });
      }
    });

    if (user) {
      if (online && dbUpserts.length > 0) {
        try {
          await supabase.from('review_items').upsert(dbUpserts);
          setDbProgress(prev => ({
            ...prev,
            reviewItems: {
              ...prev.reviewItems,
              ...initReviews
            }
          }));
        } catch (e) {
          console.error('Failed to mark phrases as seen in Supabase:', e);
        }
      }
    } else {
      const updated = { ...guestProgress };
      updated.reviewItems = {
        ...updated.reviewItems,
        ...initReviews
      };
      saveGuestProgress(updated);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (phraseId: string) => {
    if (user) {
      const isFav = dbProgress.favorites.includes(phraseId);
      const nextFavorites = isFav 
        ? dbProgress.favorites.filter(id => id !== phraseId)
        : [...dbProgress.favorites, phraseId];

      setDbProgress(prev => ({ ...prev, favorites: nextFavorites }));

      if (online) {
        try {
          if (isFav) {
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('phrase_id', phraseId);
          } else {
            await supabase.from('favorites').insert({ user_id: user.id, phrase_id: phraseId });
          }
        } catch (err) {
          console.error('Error modifying favorites in Supabase, caching offline:', err);
          syncService.saveFavoriteOffline(phraseId, !isFav);
        }
      } else {
        syncService.saveFavoriteOffline(phraseId, !isFav);
      }
    } else {
      // Guest favorite
      const updated = { ...guestProgress };
      const isFav = updated.favorites.includes(phraseId);
      updated.favorites = isFav
        ? updated.favorites.filter(id => id !== phraseId)
        : [...updated.favorites, phraseId];
      
      saveGuestProgress(updated);
    }
  };

  // Deriving Stats for UI
  const streak = user ? dbProgress.streak : guestProgress.streak;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = user 
    ? dbProgress.dailyGoalCount 
    : (guestProgress.dailyGoalCount[todayStr] || 0);
  const dailyGoalProgress = Math.min(Math.round((completedToday / dailyTarget) * 100), 100);

  const favorites = user ? dbProgress.favorites : guestProgress.favorites;

  // Add new custom phrase locally and try to push to Supabase (if admin)
  const addCustomPhrase = async (
    text: string,
    translation: string,
    explanation: string,
    difficulty: 'easy' | 'medium' | 'hard',
    voiceName: string,
    speed: number,
    targetCategoryId?: string
  ) => {
    const categoryId = targetCategoryId || activeIslandId || `shadowing-vocab-${targetLanguage}`;

    const newPhrase: Phrase = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      language_id: targetLanguage,
      category_id: categoryId,
      text,
      translation,
      explanation,
      difficulty,
      audio_url: null,
      voice_name: voiceName,
      speed
    };

    // 1. Update local state
    const nextCustom = [...customPhrases, newPhrase];
    setCustomPhrases(nextCustom);
    localStorage.setItem('hl_custom_phrases', JSON.stringify(nextCustom));

    // 2. Try to save to Supabase if admin
    const isAdmin = user?.email === 'admin@hyperlingua.app' || user?.user_metadata?.role === 'admin';
    if (user && online && isAdmin) {
      try {
        const { error } = await supabase.from('phrases').insert({
          id: newPhrase.id,
          language_id: newPhrase.language_id,
          category_id: newPhrase.category_id,
          text: newPhrase.text,
          translation: newPhrase.translation,
          explanation: newPhrase.explanation,
          difficulty: newPhrase.difficulty,
          voice_name: newPhrase.voice_name,
          speed: newPhrase.speed,
          is_published: true
        });

        if (error) {
          console.warn('Could not insert phrase in Supabase database:', error.message);
        } else {
          // If successfully added to Supabase, add to the audio generation queue!
          await supabase.from('audio_generation_queue').insert({
            phrase_id: newPhrase.id,
            text: newPhrase.text,
            voice_name: newPhrase.voice_name,
            speed: newPhrase.speed,
            status: 'pending'
          });
          console.log('Phrase and audio queue item added online successfully.');
        }
      } catch (err) {
        console.error('Error adding phrase to online database:', err);
      }
    }

    // Always queue the new phrase for spaced repetition review
    await markPhraseAsSeen(newPhrase.id);
  };

  const addCustomPhrasesBatch = async (
    items: { text: string; translation: string; explanation: string }[]
  ) => {
    const categoryId = activeIslandId || `shadowing-vocab-${targetLanguage}`;
    const isAdmin = user?.email === 'admin@hyperlingua.app' || user?.user_metadata?.role === 'admin';

    const newPhrases: Phrase[] = items.map(item => ({
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      language_id: targetLanguage,
      category_id: categoryId,
      text: item.text,
      translation: item.translation,
      explanation: item.explanation,
      difficulty: 'medium',
      audio_url: null,
      voice_name: 'Fenrir',
      speed: 1.0
    }));

    // 1. Update local state
    const nextCustom = [...customPhrases, ...newPhrases];
    setCustomPhrases(nextCustom);
    localStorage.setItem('hl_custom_phrases', JSON.stringify(nextCustom));

    // 2. Queue all phraseIds for local review in batch
    const phraseIds = newPhrases.map(p => p.id);
    await markPhrasesAsSeen(phraseIds);

    // 3. Try to save to Supabase in batch if admin
    if (user && online && isAdmin && newPhrases.length > 0) {
      try {
        const insertRows = newPhrases.map(p => ({
          id: p.id,
          language_id: p.language_id,
          category_id: p.category_id,
          text: p.text,
          translation: p.translation,
          explanation: p.explanation,
          difficulty: p.difficulty,
          voice_name: p.voice_name,
          speed: p.speed,
          is_published: true
        }));

        const { error } = await supabase.from('phrases').insert(insertRows);
        if (error) {
          console.warn('Could not batch insert phrases in Supabase:', error.message);
        } else {
          // If successfully added to Supabase, add to the audio generation queue!
          const queueRows = newPhrases.map(p => ({
            phrase_id: p.id,
            text: p.text,
            voice_name: p.voice_name,
            speed: p.speed,
            status: 'pending'
          }));
          await supabase.from('audio_generation_queue').insert(queueRows);
        }
      } catch (err) {
        console.error('Error batch adding phrases to online database:', err);
      }
    }
  };

  const [phraseOverrides, setPhraseOverrides] = useState<Record<string, Partial<Phrase>>>(() => {
    try {
      const stored = localStorage.getItem('hl_phrase_overrides');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const updatePhrase = (phraseId: string, updatedFields: Partial<Phrase>) => {
    const nextOverrides = {
      ...phraseOverrides,
      [phraseId]: {
        ...phraseOverrides[phraseId],
        ...updatedFields
      }
    };
    setPhraseOverrides(nextOverrides);
    localStorage.setItem('hl_phrase_overrides', JSON.stringify(nextOverrides));
    
    // Also update customPhrases if it is in customPhrases list
    const isCustom = customPhrases.some(p => p.id === phraseId);
    if (isCustom) {
      const nextCustom = customPhrases.map(p => p.id === phraseId ? { ...p, ...updatedFields } : p);
      setCustomPhrases(nextCustom);
      localStorage.setItem('hl_custom_phrases', JSON.stringify(nextCustom));
    }
  };

  const reorderPhrases = (categoryId: string, phraseId: string, newPositionOneIndexed: number) => {
    const categoryPhrases = filteredPhrases.filter(p => p.category_id === categoryId);
    const phraseToMove = categoryPhrases.find(p => p.id === phraseId);
    if (!phraseToMove) return;

    const remaining = categoryPhrases.filter(p => p.id !== phraseId);
    const targetIdx = Math.max(0, Math.min(newPositionOneIndexed - 1, remaining.length));
    const reorderedList = [...remaining];
    reorderedList.splice(targetIdx, 0, phraseToMove);

    let nextOverrides = { ...phraseOverrides };
    let nextCustom = [...customPhrases];
    let overridesChanged = false;
    let customChanged = false;

    reorderedList.forEach((p, index) => {
      const newOrder = index + 1;
      nextOverrides = {
        ...nextOverrides,
        [p.id]: {
          ...nextOverrides[p.id],
          order_index: newOrder
        }
      };
      overridesChanged = true;

      const isCustom = nextCustom.some(cp => cp.id === p.id);
      if (isCustom) {
        nextCustom = nextCustom.map(cp => cp.id === p.id ? { ...cp, order_index: newOrder } : cp);
        customChanged = true;
      }
    });

    if (overridesChanged) {
      setPhraseOverrides(nextOverrides);
      localStorage.setItem('hl_phrase_overrides', JSON.stringify(nextOverrides));
    }
    if (customChanged) {
      setCustomPhrases(nextCustom);
      localStorage.setItem('hl_custom_phrases', JSON.stringify(nextCustom));
    }
  };

  const [phraseStars, setPhraseStarsState] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('hl_phrase_stars');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const updatePhraseStars = async (phraseId: string, starCount: number) => {
    const nextStars = { ...phraseStars, [phraseId]: starCount };
    setPhraseStarsState(nextStars);
    localStorage.setItem('hl_phrase_stars', JSON.stringify(nextStars));

    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (starCount === 5) difficulty = 'easy';
    else if (starCount <= 2) difficulty = 'hard';

    await submitPracticeResult(phraseId, difficulty);
  };

  const [archivedPhrases, setArchivedPhrases] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hl_archived_phrases');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [suspendedPhrases, setSuspendedPhrases] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hl_suspended_phrases');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleArchivePhrase = (phraseId: string) => {
    setArchivedPhrases(prev => {
      const next = prev.includes(phraseId) ? prev.filter(id => id !== phraseId) : [...prev, phraseId];
      localStorage.setItem('hl_archived_phrases', JSON.stringify(next));
      return next;
    });
  };

  const toggleSuspendPhrase = (phraseId: string) => {
    setSuspendedPhrases(prev => {
      const next = prev.includes(phraseId) ? prev.filter(id => id !== phraseId) : [...prev, phraseId];
      localStorage.setItem('hl_suspended_phrases', JSON.stringify(next));
      return next;
    });
  };

  const updatePhraseTags = (phraseId: string, tags: string[]) => {
    const nextOverrides = { 
      ...phraseOverrides, 
      [phraseId]: { ...phraseOverrides[phraseId], tags } 
    };
    setPhraseOverrides(nextOverrides);
    localStorage.setItem('hl_phrase_overrides', JSON.stringify(nextOverrides));
  };

  const [deletedPhraseIds, setDeletedPhraseIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hl_deleted_phrases');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const deletePhrase = (phraseId: string) => {
    const nextDeleted = [...deletedPhraseIds, phraseId];
    setDeletedPhraseIds(nextDeleted);
    localStorage.setItem('hl_deleted_phrases', JSON.stringify(nextDeleted));

    // Remove from custom phrases
    const nextCustom = customPhrases.filter(p => p.id !== phraseId);
    setCustomPhrases(nextCustom);
    localStorage.setItem('hl_custom_phrases', JSON.stringify(nextCustom));
  };

  const addCustomCategory = async (name: string, description: string): Promise<string> => {
    const newCategory: Category = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      language_id: targetLanguage,
      name,
      description
    };
    const nextCustom = [...customCategories, newCategory];
    setCustomCategories(nextCustom);
    localStorage.setItem('hl_custom_categories', JSON.stringify(nextCustom));
    return newCategory.id;
  };

  const deleteCustomCategory = async (categoryId: string) => {
    const nextCustomCats = customCategories.filter(c => c.id !== categoryId);
    setCustomCategories(nextCustomCats);
    localStorage.setItem('hl_custom_categories', JSON.stringify(nextCustomCats));

    const nextCustomPhrases = customPhrases.filter(p => p.category_id !== categoryId);
    setCustomPhrases(nextCustomPhrases);
    localStorage.setItem('hl_custom_phrases', JSON.stringify(nextCustomPhrases));

    if (activeIslandId === categoryId) {
      setActiveIslandId(null);
    }
  };

  // Filter categories by selected language and append default shadowing category
  const filteredCategories = useMemo(() => {
    const defaultShadowingCategory: Category = {
      id: `shadowing-vocab-${targetLanguage}`,
      language_id: targetLanguage,
      name: '📚 Shadowing Vocab',
      description: 'Frases coletadas durante a prática de Shadowing.'
    };
    const allCategories = [
      ...categories,
      ...customCategories.filter(cc => !categories.some(c => c.id === cc.id))
    ];
    const list = allCategories.filter(c => c.language_id === targetLanguage);
    if (list.some(c => c.id === defaultShadowingCategory.id)) {
      return list;
    }
    return [...list, defaultShadowingCategory];
  }, [categories, customCategories, targetLanguage]);

  // Merge database phrases with custom phrases and filter by selected language
  const filteredPhrases = useMemo(() => {
    const all = [
      ...phrases,
      ...customPhrases.filter(cp => !phrases.some(p => p.id === cp.id))
    ];
    
    // Filter out deleted phrases
    const nonDeleted = all.filter(p => !deletedPhraseIds.includes(p.id));
    
    const overridden = nonDeleted.map(p => {
      const override = phraseOverrides[p.id];
      const merged = override ? { ...p, ...override } : p;
      
      const isDefaultPhrase = phrases.some(dp => dp.id === p.id);
      if (isDefaultPhrase) {
        const userHasCustomExplanation = override && override.explanation !== undefined;
        if (!userHasCustomExplanation) {
          return { ...merged, explanation: '' };
        }
      }
      return merged;
    });

    const langPhrases = overridden.filter(p => p.language_id === targetLanguage);

    return [...langPhrases].sort((a, b) => {
      const aOrder = a.order_index !== undefined ? a.order_index : 999999;
      const bOrder = b.order_index !== undefined ? b.order_index : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.id.localeCompare(b.id);
    });
  }, [phrases, customPhrases, targetLanguage, phraseOverrides, deletedPhraseIds]);

  // Filter favorites by active language phrases
  const filteredFavorites = useMemo(() => {
    const rawFavs = user ? dbProgress.favorites : guestProgress.favorites;
    const activePhrasesSet = new Set(filteredPhrases.map(p => p.id));
    return rawFavs.filter(id => activePhrasesSet.has(id));
  }, [user, dbProgress.favorites, guestProgress.favorites, filteredPhrases]);

  const reviewItems = useMemo(() => {
    return user ? dbProgress.reviewItems : guestProgress.reviewItems;
  }, [user, dbProgress.reviewItems, guestProgress.reviewItems]);

  // Spaced Repetition Due Checks (filtered by active language, excluding archived/suspended)
  const reviewsDueCount = useMemo(() => {
    const activeReviews = Object.values(reviewItems);
    const activePhrasesSet = new Set(filteredPhrases.map(p => p.id));
    return activeReviews.filter(item => {
      return activePhrasesSet.has(item.phrase_id) && 
             !archivedPhrases.includes(item.phrase_id) && 
             !suspendedPhrases.includes(item.phrase_id);
    }).length;
  }, [reviewItems, filteredPhrases, archivedPhrases, suspendedPhrases]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        online,
        languages,
        categories: filteredCategories,
        phrases: filteredPhrases,
        activeTab,
        setActiveTab,
        targetLanguage,
        setTargetLanguage,
        activeIslandId,
        setActiveIslandId,
        
        streak,
        dailyGoalProgress,
        completedToday,
        dailyTarget,
        favorites: filteredFavorites,
        reviewsDueCount,
        reviewItems,
        
        submitPracticeResult,
        markPhraseAsSeen,
        markPhrasesAsSeen,
        toggleFavorite,
        signOut,
        refreshCatalog,
        addCustomPhrase,
        addCustomPhrasesBatch,
        reviewAlgorithm,
        setReviewAlgorithm,
        theme,
        toggleTheme,
        updatePhrase,
        reorderPhrases,
        phraseStars,
        updatePhraseStars,
        archivedPhrases,
        suspendedPhrases,
        toggleArchivePhrase,
        toggleSuspendPhrase,
        updatePhraseTags,
        deletePhrase,
        customCategories,
        addCustomCategory,
        deleteCustomCategory,
        recentIslandIds
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
