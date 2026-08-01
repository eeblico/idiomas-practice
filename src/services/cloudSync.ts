import { supabase } from './supabase';

const SYNC_CODE_KEY = 'hl_cloud_sync_code';

export interface CloudUserData {
  sync_code: string;
  user_id?: string;
  customPhrases: any[];
  customCategories: any[];
  categoryOverrides: Record<string, any>;
  phraseOverrides: Record<string, any>;
  customLessons: any[];
  customSongs: any[];
  deletedPhraseIds: string[];
  guestProgress: any;
  updated_at: string;
}

export const generateSyncCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'HL-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const cloudSyncService = {
  // Get active 6-digit sync code
  getSyncCode(): string {
    let code = localStorage.getItem(SYNC_CODE_KEY);
    if (!code) {
      code = generateSyncCode();
      localStorage.setItem(SYNC_CODE_KEY, code);
    }
    return code;
  },

  // Update sync code (e.g. connecting mobile device to desktop)
  setSyncCode(code: string): string {
    const formatted = code.trim().toUpperCase();
    localStorage.setItem(SYNC_CODE_KEY, formatted);
    return formatted;
  },

  // Push local user content and edits to Supabase Cloud
  async pushToCloud(data: Partial<CloudUserData>): Promise<boolean> {
    const syncCode = this.getSyncCode();
    try {
      const payload = {
        sync_code: syncCode,
        data_json: {
          customPhrases: data.customPhrases ?? JSON.parse(localStorage.getItem('hl_custom_phrases') || '[]'),
          customCategories: data.customCategories ?? JSON.parse(localStorage.getItem('hl_custom_categories') || '[]'),
          categoryOverrides: data.categoryOverrides ?? JSON.parse(localStorage.getItem('hl_category_overrides') || '{}'),
          phraseOverrides: data.phraseOverrides ?? JSON.parse(localStorage.getItem('hl_phrase_overrides') || '{}'),
          customLessons: data.customLessons ?? JSON.parse(localStorage.getItem('hl_custom_lessons') || '[]'),
          customSongs: data.customSongs ?? JSON.parse(localStorage.getItem('hl_custom_songs') || '[]'),
          deletedPhraseIds: data.deletedPhraseIds ?? JSON.parse(localStorage.getItem('hl_deleted_phrases') || '[]'),
          guestProgress: data.guestProgress ?? JSON.parse(localStorage.getItem('hl_guest_progress') || '{}'),
        },
        updated_at: new Date().toISOString()
      };

      // Try upserting into user_sync_data table in Supabase
      const { error } = await supabase
        .from('user_sync_data')
        .upsert(payload, { onConflict: 'sync_code' });

      if (error) {
        console.warn('Supabase cloud sync upsert warning:', error.message);
        // Fallback: try user_settings table
        await supabase
          .from('user_settings')
          .upsert({ user_id: syncCode, settings: payload.data_json }, { onConflict: 'user_id' });
      }

      return true;
    } catch (err) {
      console.warn('Could not push to Supabase Cloud (offline or DB unreachable):', err);
      return false;
    }
  },

  // Pull all content from Supabase Cloud for this sync code
  async pullFromCloud(targetCode?: string): Promise<CloudUserData | null> {
    const code = targetCode ? targetCode.trim().toUpperCase() : this.getSyncCode();
    try {
      // 1. Try user_sync_data table
      const { data, error } = await supabase
        .from('user_sync_data')
        .select('*')
        .eq('sync_code', code)
        .maybeSingle();

      if (data && data.data_json) {
        return {
          sync_code: code,
          customPhrases: data.data_json.customPhrases || [],
          customCategories: data.data_json.customCategories || [],
          categoryOverrides: data.data_json.categoryOverrides || {},
          phraseOverrides: data.data_json.phraseOverrides || {},
          customLessons: data.data_json.customLessons || [],
          customSongs: data.data_json.customSongs || [],
          deletedPhraseIds: data.data_json.deletedPhraseIds || [],
          guestProgress: data.data_json.guestProgress || {},
          updated_at: data.updated_at || new Date().toISOString()
        };
      }

      // 2. Try user_settings fallback
      const { data: fallbackData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', code)
        .maybeSingle();

      if (fallbackData && fallbackData.settings) {
        const s = fallbackData.settings;
        return {
          sync_code: code,
          customPhrases: s.customPhrases || [],
          customCategories: s.customCategories || [],
          categoryOverrides: s.categoryOverrides || {},
          phraseOverrides: s.phraseOverrides || {},
          customLessons: s.customLessons || [],
          customSongs: s.customSongs || [],
          deletedPhraseIds: s.deletedPhraseIds || [],
          guestProgress: s.guestProgress || {},
          updated_at: new Date().toISOString()
        };
      }

      return null;
    } catch (err) {
      console.warn('Could not pull from Supabase Cloud:', err);
      return null;
    }
  }
};
