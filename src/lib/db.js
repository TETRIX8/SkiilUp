// src/lib/db.js - IndexedDB helper
const DB_NAME = 'skillup-db';
const DB_VERSION = 1;
const STORE_CACHE = 'cache';
const STORE_QUEUE = 'queue';
const STORE_FILES = 'files';
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_CACHE)) db.createObjectStore(STORE_CACHE, { keyPath: 'url' });
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const s = db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
        s.createIndex('by_ts', 'timestamp');
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) db.createObjectStore(STORE_FILES, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function withStore(name, mode, run){
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(name, mode);
    const store = tx.objectStore(name);
    const res = run(store);
    tx.oncomplete = () => resolve(res);
    tx.onerror = () => reject(tx.error);
  });
}
export async function cacheGet(url){ return withStore(STORE_CACHE, 'readonly', s => s.get(url)); }
export async function cacheSet(url, data){
  const rec = { url, data, timestamp: Date.now(), expires: Date.now() + 86400000 };
  return withStore(STORE_CACHE, 'readwrite', s => s.put(rec));
}
export async function queueAdd(item){
  const rec = { ...item, timestamp: Date.now(), retries: 0 };
  return withStore(STORE_QUEUE, 'readwrite', s => s.add(rec));
}
export async function queueGetAll(){ return withStore(STORE_QUEUE, 'readonly', s => s.getAll()); }
export async function queueRemove(id){ return withStore(STORE_QUEUE, 'readwrite', s => s.delete(id)); }
export async function fileSave(file){ const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`; await withStore(STORE_FILES,'readwrite', s=>s.put({id,file})); return id; }
export async function fileGet(id){ const r = await withStore(STORE_FILES,'readonly', s=>s.get(id)); return r ? r.file : null; }
