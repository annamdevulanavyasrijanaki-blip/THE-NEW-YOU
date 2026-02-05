import { SavedLook } from '../types';

const DB_NAME = 'newYouClosetDB';
const DB_VERSION = 2; // Bumped version to force store creation

export const STORES = {
  CALENDAR: 'calendar',
  PERSONALIZATION: 'personalization',
  GLOWUP: 'glowup',
  SETTINGS: 'settings',
  CLOSET: 'savedLooks',
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log("Database upgrade required. Current stores:", Array.from(db.objectStoreNames));
      
      if (!db.objectStoreNames.contains(STORES.CALENDAR)) {
        db.createObjectStore(STORES.CALENDAR, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PERSONALIZATION)) {
        db.createObjectStore(STORES.PERSONALIZATION, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.GLOWUP)) {
        db.createObjectStore(STORES.GLOWUP, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.CLOSET)) {
        db.createObjectStore(STORES.CLOSET, { keyPath: 'id' });
        console.log("Created object store:", STORES.CLOSET);
      }
    };

    request.onsuccess = () => {
      console.log("IndexedDB Initialized Successfully");
      resolve(request.result);
    };
    request.onerror = () => {
      console.error("IndexedDB Initialization Error:", request.error);
      reject(request.error);
    };
  });
};

const getStore = async (storeName: string, mode: IDBTransactionMode) => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

export const db = {
  async put(storeName: string, data: any) {
    try {
      const store = await getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`DB Put Error [${storeName}]:`, e);
      // LocalStorage Fallback for Settings only
      if (storeName === STORES.SETTINGS) {
        localStorage.setItem(`fallback_${data.key}`, JSON.stringify(data.value));
      }
    }
  },

  async get(storeName: string, key: string) {
    try {
      const store = await getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      if (storeName === STORES.SETTINGS) {
        const val = localStorage.getItem(`fallback_${key}`);
        return val ? { key, value: JSON.parse(val) } : undefined;
      }
      return undefined;
    }
  },

  async getAll(storeName: string) {
    try {
      const store = await getStore(storeName, 'readonly');
      return new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`DB GetAll Error [${storeName}]:`, e);
      return [];
    }
  },

  async delete(storeName: string, key: string) {
    try {
      const store = await getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`DB Delete Error [${storeName}]:`, e);
    }
  },

  async clear(storeName: string) {
    try {
      const store = await getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`DB Clear Error [${storeName}]:`, e);
    }
  }
};
