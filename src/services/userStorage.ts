/**
 * userStorage.ts
 * Robust dual-persistence offline storage for NoClima:
 * 1. Fast synchronous reads/writes via localStorage
 * 2. Deep persistent transactional storage via IndexedDB (never cleared on browser close/reboot)
 * 3. Export & import full JSON backup capabilities
 */

const DB_NAME = 'noclima_user_db';
const DB_VERSION = 1;
const STORE_NAME = 'user_data';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Low level IndexedDB set
async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[userStorage] IndexedDB put failed for ${key}:`, err);
  }
}

// Low level IndexedDB get
async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[userStorage] IndexedDB get failed for ${key}:`, err);
    return null;
  }
}

export interface UserBackupData {
  version: number;
  exportedAt: string;
  songs: any[];
  customPhrases?: any[];
  customCategories?: any[];
  guestProgress?: any;
}

export const userStorage = {
  /**
   * Save custom songs to BOTH localStorage and IndexedDB
   */
  async saveSongs(songs: any[]): Promise<void> {
    try {
      localStorage.setItem('hl_custom_songs', JSON.stringify(songs));
    } catch (e) {
      console.warn('[userStorage] localStorage quota exceeded or error:', e);
    }
    await idbSet('hl_custom_songs', songs);
  },

  /**
   * Retrieve custom songs: checks localStorage first; if empty, checks IndexedDB
   */
  async getSongs(): Promise<any[]> {
    let localSongs: any[] = [];
    try {
      const stored = localStorage.getItem('hl_custom_songs');
      if (stored) {
        localSongs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[userStorage] Error parsing local songs:', e);
    }

    if (localSongs && localSongs.length > 0) {
      // Keep IndexedDB synced in background
      idbSet('hl_custom_songs', localSongs).catch(() => {});
      return localSongs;
    }

    // LocalStorage was empty or cleared: attempt restoring from IndexedDB
    try {
      const idbSongs = await idbGet<any[]>('hl_custom_songs');
      if (idbSongs && Array.isArray(idbSongs) && idbSongs.length > 0) {
        console.info(`[userStorage] Restored ${idbSongs.length} songs from persistent IndexedDB!`);
        try {
          localStorage.setItem('hl_custom_songs', JSON.stringify(idbSongs));
        } catch {}
        return idbSongs;
      }
    } catch (err) {
      console.warn('[userStorage] Error fetching songs from IndexedDB:', err);
    }

    return [];
  },

  /**
   * Export all user data as a JSON file downloadable by the user
   */
  async exportBackup(): Promise<string> {
    const songs = await this.getSongs();
    let customPhrases: any[] = [];
    let customCategories: any[] = [];
    let guestProgress: any = {};

    try {
      customPhrases = JSON.parse(localStorage.getItem('hl_custom_phrases') || '[]');
      customCategories = JSON.parse(localStorage.getItem('hl_custom_categories') || '[]');
      guestProgress = JSON.parse(localStorage.getItem('hl_guest_progress') || '{}');
    } catch {}

    const backup: UserBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      songs,
      customPhrases,
      customCategories,
      guestProgress
    };

    return JSON.stringify(backup, null, 2);
  },

  /**
   * Import data from a backup JSON string
   */
  async importBackup(jsonString: string): Promise<{ success: boolean; songsCount: number; message: string }> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, songsCount: 0, message: 'Arquivo de backup inválido.' };
      }

      let importedSongsCount = 0;
      if (Array.isArray(data.songs)) {
        const currentSongs = await this.getSongs();
        const currentIds = new Set(currentSongs.map((s: any) => s.id));
        const merged = [...currentSongs];

        for (const s of data.songs) {
          if (!currentIds.has(s.id)) {
            merged.push(s);
            importedSongsCount++;
          }
        }

        await this.saveSongs(merged);
      }

      if (Array.isArray(data.customPhrases) && data.customPhrases.length > 0) {
        localStorage.setItem('hl_custom_phrases', JSON.stringify(data.customPhrases));
        await idbSet('hl_custom_phrases', data.customPhrases);
      }

      if (Array.isArray(data.customCategories) && data.customCategories.length > 0) {
        localStorage.setItem('hl_custom_categories', JSON.stringify(data.customCategories));
        await idbSet('hl_custom_categories', data.customCategories);
      }

      return {
        success: true,
        songsCount: importedSongsCount,
        message: `Backup restaurado com sucesso! ${importedSongsCount} novas músicas importadas.`
      };
    } catch (err: any) {
      return { success: false, songsCount: 0, message: `Erro ao importar: ${err.message}` };
    }
  }
};
