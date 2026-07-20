const DB_NAME = 'PortfolioCompassDB';
const DB_VERSION = 1;

const STORES = {
  STUDENTS_LIST: 'studentsList',
  STUDENTS_DETAIL: 'studentsDetail',
  CACHE_METADATA: 'cacheMetadata',
};

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Students list cache
      if (!database.objectStoreNames.contains(STORES.STUDENTS_LIST)) {
        database.createObjectStore(STORES.STUDENTS_LIST, { keyPath: 'id' });
      }

      // Individual student details cache
      if (!database.objectStoreNames.contains(STORES.STUDENTS_DETAIL)) {
        database.createObjectStore(STORES.STUDENTS_DETAIL, { keyPath: 'id' });
      }

      // Cache metadata (timestamps, expiration)
      if (!database.objectStoreNames.contains(STORES.CACHE_METADATA)) {
        database.createObjectStore(STORES.CACHE_METADATA, { keyPath: 'key' });
      }
    };
  });
};

export const getFromCache = async (storeName, key) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(new Error('Failed to read from cache'));
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllFromCache = async (storeName) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to read from cache'));
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveToCache = async (storeName, data) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onerror = () => reject(new Error('Failed to save to cache'));
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteFromCache = async (storeName, key) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(new Error('Failed to delete from cache'));
    request.onsuccess = () => resolve(request.result);
  });
};

export const clearStore = async (storeName) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(new Error('Failed to clear cache'));
    request.onsuccess = () => resolve(request.result);
  });
};

export const getCacheMetadata = async (key) => {
  return getFromCache(STORES.CACHE_METADATA, key);
};

export const setCacheMetadata = async (key, value) => {
  return saveToCache(STORES.CACHE_METADATA, { key, ...value, timestamp: Date.now() });
};

export { STORES };
