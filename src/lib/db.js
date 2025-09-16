// src/lib/db.js - IndexedDB helper
const DB_NAME = 'skillup-db';
const DB_VERSION = 2;
const STORE_CACHE = 'cache';
const STORE_QUEUE = 'queue';
const STORE_FILES = 'files';
const STORE_DISCIPLINES = 'disciplines';
const STORE_TOPICS = 'topics';
const STORE_ASSIGNMENTS = 'assignments';
const STORE_ACHIEVEMENTS = 'achievements';
const STORE_USER_DATA = 'userData';
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      
      // Основные хранилища
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const s = db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
        s.createIndex('by_ts', 'timestamp');
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
      
      // Хранилища для данных приложения
      if (!db.objectStoreNames.contains(STORE_DISCIPLINES)) {
        const s = db.createObjectStore(STORE_DISCIPLINES, { keyPath: 'id' });
        s.createIndex('by_name', 'name');
        s.createIndex('by_updated', 'updated_at');
      }
      if (!db.objectStoreNames.contains(STORE_TOPICS)) {
        const s = db.createObjectStore(STORE_TOPICS, { keyPath: 'id' });
        s.createIndex('by_discipline', 'discipline_id');
        s.createIndex('by_updated', 'updated_at');
      }
      if (!db.objectStoreNames.contains(STORE_ASSIGNMENTS)) {
        const s = db.createObjectStore(STORE_ASSIGNMENTS, { keyPath: 'id' });
        s.createIndex('by_topic', 'topic_id');
        s.createIndex('by_updated', 'updated_at');
      }
      if (!db.objectStoreNames.contains(STORE_ACHIEVEMENTS)) {
        const s = db.createObjectStore(STORE_ACHIEVEMENTS, { keyPath: 'id' });
        s.createIndex('by_user', 'user_id');
        s.createIndex('by_type', 'type');
      }
      if (!db.objectStoreNames.contains(STORE_USER_DATA)) {
        const s = db.createObjectStore(STORE_USER_DATA, { keyPath: 'key' });
        s.createIndex('by_type', 'type');
      }
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

// Функции для работы с дисциплинами
export async function saveDisciplines(disciplines) {
  return withStore(STORE_DISCIPLINES, 'readwrite', s => {
    disciplines.forEach(discipline => s.put(discipline));
  });
}

export async function getDisciplines() {
  return withStore(STORE_DISCIPLINES, 'readonly', s => s.getAll());
}

export async function getDiscipline(id) {
  return withStore(STORE_DISCIPLINES, 'readonly', s => s.get(id));
}

// Функции для работы с темами
export async function saveTopics(topics) {
  return withStore(STORE_TOPICS, 'readwrite', s => {
    topics.forEach(topic => s.put(topic));
  });
}

export async function getTopics() {
  return withStore(STORE_TOPICS, 'readonly', s => s.getAll());
}

export async function getTopicsByDiscipline(disciplineId) {
  return withStore(STORE_TOPICS, 'readonly', s => {
    const index = s.index('by_discipline');
    return index.getAll(disciplineId);
  });
}

export async function getTopic(id) {
  return withStore(STORE_TOPICS, 'readonly', s => s.get(id));
}

// Функции для работы с заданиями
export async function saveAssignments(assignments) {
  return withStore(STORE_ASSIGNMENTS, 'readwrite', s => {
    assignments.forEach(assignment => s.put(assignment));
  });
}

export async function getAssignments() {
  return withStore(STORE_ASSIGNMENTS, 'readonly', s => s.getAll());
}

export async function getAssignmentsByTopic(topicId) {
  return withStore(STORE_ASSIGNMENTS, 'readonly', s => {
    const index = s.index('by_topic');
    return index.getAll(topicId);
  });
}

export async function getAssignment(id) {
  return withStore(STORE_ASSIGNMENTS, 'readonly', s => s.get(id));
}

// Функции для работы с достижениями
export async function saveAchievements(achievements) {
  return withStore(STORE_ACHIEVEMENTS, 'readwrite', s => {
    achievements.forEach(achievement => s.put(achievement));
  });
}

export async function getAchievements() {
  return withStore(STORE_ACHIEVEMENTS, 'readonly', s => s.getAll());
}

export async function getAchievementsByUser(userId) {
  return withStore(STORE_ACHIEVEMENTS, 'readonly', s => {
    const index = s.index('by_user');
    return index.getAll(userId);
  });
}

// Функции для работы с пользовательскими данными
export async function saveUserData(key, data, type = 'general') {
  return withStore(STORE_USER_DATA, 'readwrite', s => 
    s.put({ key, data, type, timestamp: Date.now() })
  );
}

export async function getUserData(key) {
  const result = await withStore(STORE_USER_DATA, 'readonly', s => s.get(key));
  return result ? result.data : null;
}

export async function getAllUserData() {
  return withStore(STORE_USER_DATA, 'readonly', s => s.getAll());
}

// Функция для очистки всех данных
export async function clearAllData() {
  const stores = [STORE_DISCIPLINES, STORE_TOPICS, STORE_ASSIGNMENTS, STORE_ACHIEVEMENTS, STORE_USER_DATA];
  for (const storeName of stores) {
    await withStore(storeName, 'readwrite', s => s.clear());
  }
}

// Функция для получения статистики хранилища
export async function getStorageStats() {
  const stats = {};
  const stores = [STORE_DISCIPLINES, STORE_TOPICS, STORE_ASSIGNMENTS, STORE_ACHIEVEMENTS, STORE_USER_DATA, STORE_CACHE, STORE_QUEUE];
  
  for (const storeName of stores) {
    try {
      const count = await withStore(storeName, 'readonly', s => s.count());
      stats[storeName] = count;
    } catch (error) {
      stats[storeName] = 0;
    }
  }
  
  return stats;
}
