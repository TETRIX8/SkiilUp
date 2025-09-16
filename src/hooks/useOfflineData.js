import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { offlineApiClient } from '../lib/offlineApi';

export const useOfflineData = () => {
  const { isAuthenticated, user } = useAuth();
  const { isOnline, forceSync } = useOffline();
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);

  // Предварительная загрузка данных при авторизации
  useEffect(() => {
    if (isAuthenticated && isOnline && !preloadComplete) {
      preloadData();
    }
  }, [isAuthenticated, isOnline, preloadComplete]);

  const preloadData = async () => {
    setIsPreloading(true);
    try {
      await offlineApiClient.preloadData();
      setPreloadComplete(true);
    } catch (error) {
      console.error('Preload failed:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  const refreshData = async () => {
    if (isOnline) {
      await forceSync();
    }
  };

  return {
    isPreloading,
    preloadComplete,
    refreshData
  };
};
