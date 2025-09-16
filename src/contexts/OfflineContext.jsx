import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cacheGet, cacheSet, queueAdd, queueGetAll, queueRemove } from '../lib/db';
import { syncManager } from '../lib/sync';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // Отслеживание изменений в сети
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Проверка количества ожидающих изменений
  useEffect(() => {
    const checkPendingChanges = async () => {
      try {
        const items = await queueGetAll();
        setPendingChanges(items.length);
      } catch (error) {
        console.error('Error checking pending changes:', error);
      }
    };

    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 5000);
    return () => clearInterval(interval);
  }, []);

  // Синхронизация данных
  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const items = await queueGetAll();
      const totalItems = items.length;

      for (let i = 0; i < totalItems; i++) {
        const item = items[i];
        try {
          const response = await fetch(item.url, item.config);
          if (response.ok) {
            await queueRemove(item.id);
            setSyncProgress(((i + 1) / totalItems) * 100);
          }
        } catch (error) {
          console.error('Sync error for item:', item, error);
        }
      }

      setLastSyncTime(new Date());
      setPendingChanges(0);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isOnline, isSyncing]);

  // Принудительная синхронизация
  const forceSync = useCallback(async () => {
    if (isOnline) {
      await syncData();
    }
  }, [isOnline, syncData]);

  // Кэширование данных
  const cacheData = useCallback(async (key, data) => {
    try {
      await cacheSet(key, data);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }, []);

  // Получение данных из кэша
  const getCachedData = useCallback(async (key) => {
    try {
      const cached = await cacheGet(key);
      return cached?.data || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }, []);

  // Добавление запроса в очередь для офлайн синхронизации
  const queueRequest = useCallback(async (url, config) => {
    try {
      await queueAdd({ url, config });
      setPendingChanges(prev => prev + 1);
    } catch (error) {
      console.error('Queue error:', error);
    }
  }, []);

  // Офлайн-совместимый запрос
  const offlineRequest = useCallback(async (url, config = {}) => {
    if (isOnline) {
      try {
        const response = await fetch(url, config);
        if (response.ok) {
          const data = await response.json();
          // Кэшируем успешный ответ
          await cacheData(url, data);
          return data;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        console.error('Online request failed:', error);
        // Если запрос не удался, пробуем получить из кэша
        const cached = await getCachedData(url);
        if (cached) {
          return cached;
        }
        throw error;
      }
    } else {
      // В офлайн режиме возвращаем кэшированные данные
      const cached = await getCachedData(url);
      if (cached) {
        return cached;
      }
      // Если данных нет в кэше, добавляем запрос в очередь
      await queueRequest(url, config);
      throw new Error('Offline: Data not available in cache');
    }
  }, [isOnline, cacheData, getCachedData, queueRequest]);

  const value = {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncProgress,
    pendingChanges,
    showOfflineBanner,
    syncData,
    forceSync,
    cacheData,
    getCachedData,
    queueRequest,
    offlineRequest,
    setShowOfflineBanner
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};