import { supabase } from './supabase';
import { calculateSM2, calculateFibonacciSpacing } from './sm2';

export interface OfflineResponse {
  phrase_id: string;
  difficulty_rating: 'easy' | 'medium' | 'hard';
  is_correct: boolean;
  created_at: string;
}

export interface OfflineFavorite {
  phrase_id: string;
  is_favorite: boolean;
  created_at: string;
}

const RESPONSES_KEY = 'hl_offline_responses';
const FAVORITES_KEY = 'hl_offline_favorites';

export const syncService = {
  // Save response locally when offline
  saveResponseOffline(response: Omit<OfflineResponse, 'created_at'>): void {
    const responses = this.getOfflineResponses();
    responses.push({
      ...response,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
  },

  getOfflineResponses(): OfflineResponse[] {
    try {
      const data = localStorage.getItem(RESPONSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearOfflineResponses(): void {
    localStorage.removeItem(RESPONSES_KEY);
  },

  // Save favorite status locally when offline
  saveFavoriteOffline(phraseId: string, isFavorite: boolean): void {
    const favorites = this.getOfflineFavorites();
    // Remove existing if any
    const filtered = favorites.filter(f => f.phrase_id !== phraseId);
    filtered.push({
      phrase_id: phraseId,
      is_favorite: isFavorite,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  },

  getOfflineFavorites(): OfflineFavorite[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearOfflineFavorites(): void {
    localStorage.removeItem(FAVORITES_KEY);
  },

  // Sync offline data to Supabase
  async syncOfflineData(userId: string): Promise<{ responsesSynced: number; favoritesSynced: number }> {
    const offlineResponses = this.getOfflineResponses();
    const offlineFavorites = this.getOfflineFavorites();

    let responsesSynced = 0;
    let favoritesSynced = 0;

    if (offlineResponses.length > 0) {
      for (const resp of offlineResponses) {
        try {
          // 1. Insert user response record
          const { error: respError } = await supabase.from('user_responses').insert({
            user_id: userId,
            phrase_id: resp.phrase_id,
            difficulty_rating: resp.difficulty_rating,
            is_correct: resp.is_correct,
            created_at: resp.created_at
          });

          if (respError) throw respError;

          // 2. Fetch existing review_item to update SM2 progress
          const { data: reviewData } = await supabase
            .from('review_items')
            .select('*')
            .eq('user_id', userId)
            .eq('phrase_id', resp.phrase_id)
            .maybeSingle();

          const prevReps = reviewData ? reviewData.repetitions : 0;
          const prevInterval = reviewData ? reviewData.interval_days : 0;
          const prevEF = reviewData ? parseFloat(reviewData.ease_factor) : 2.5;

          const algo = localStorage.getItem('hl_review_algorithm') || 'fibonacci';
          const nextParams = algo === 'fibonacci' 
            ? calculateFibonacciSpacing(prevReps, resp.difficulty_rating)
            : calculateSM2(prevReps, prevInterval, prevEF, resp.difficulty_rating);

          const { error: reviewError } = await supabase.from('review_items').upsert({
            user_id: userId,
            phrase_id: resp.phrase_id,
            repetitions: nextParams.repetitions,
            interval_days: nextParams.intervalDays,
            ease_factor: nextParams.easeFactor,
            next_review_date: nextParams.nextReviewDate.toISOString(),
            last_reviewed_at: resp.created_at
          });

          if (reviewError) throw reviewError;
          responsesSynced++;
        } catch (err) {
          console.error(`Failed to sync response for phrase ${resp.phrase_id}:`, err);
        }
      }
      this.clearOfflineResponses();
    }

    if (offlineFavorites.length > 0) {
      for (const fav of offlineFavorites) {
        try {
          if (fav.is_favorite) {
            await supabase.from('favorites').upsert({
              user_id: userId,
              phrase_id: fav.phrase_id
            });
          } else {
            await supabase.from('favorites')
              .delete()
              .eq('user_id', userId)
              .eq('phrase_id', fav.phrase_id);
          }
          favoritesSynced++;
        } catch (err) {
          console.error(`Failed to sync favorite for phrase ${fav.phrase_id}:`, err);
        }
      }
      this.clearOfflineFavorites();
    }

    return { responsesSynced, favoritesSynced };
  }
};
