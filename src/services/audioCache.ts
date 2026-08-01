// Service to cache audio blobs in IndexedDB for 100% offline mobile playback
const DB_NAME = 'hl_offline_audio_db';
const STORE_NAME = 'audio_blobs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const audioCacheService = {
  // Get cached blob or fetch & store in IndexedDB
  async getPlayableAudio(phraseId: string, text: string, langCode: string): Promise<string> {
    const langMapping: Record<string, string> = {
      en: 'en',
      es: 'es',
      fr: 'fr',
      it: 'it',
      de: 'de',
      zh: 'zh-CN',
      ru: 'ru'
    };
    const targetLang = langMapping[langCode] || 'en';
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${targetLang}&client=tw-ob`;

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const cachedBlob: Blob | undefined = await new Promise((res) => {
        const req = store.get(phraseId);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(undefined);
      });

      if (cachedBlob) {
        return URL.createObjectURL(cachedBlob);
      }

      // If online, fetch and cache blob in IndexedDB
      if (navigator.onLine) {
        const resp = await fetch(fallbackUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          const writeTx = db.transaction(STORE_NAME, 'readwrite');
          writeTx.objectStore(STORE_NAME).put(blob, phraseId);
          return URL.createObjectURL(blob);
        }
      }
    } catch (e) {
      console.warn('IndexedDB audio cache warning:', e);
    }

    return fallbackUrl;
  }
};
