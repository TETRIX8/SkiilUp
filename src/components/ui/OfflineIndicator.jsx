import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const OfflineIndicator = () => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncProgress,
    pendingChanges,
    showOfflineBanner,
    forceSync,
    setShowOfflineBanner
  } = useOffline();

  const formatLastSync = (date) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  if (!showOfflineBanner && isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Офлайн баннер */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <WifiOff className="h-5 w-5 animate-pulse" />
                <div>
                  <p className="font-semibold">Нет подключения к интернету</p>
                  <p className="text-sm opacity-90">
                    Работаем в офлайн режиме • {pendingChanges} изменений ожидают синхронизации
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOfflineBanner(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <AlertCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Индикатор синхронизации */}
      {isOnline && (isSyncing || pendingChanges > 0) && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isSyncing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Wifi className="h-5 w-5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">
                      {isSyncing ? 'Синхронизация данных...' : 'Готово к синхронизации'}
                    </p>
                    <span className="text-sm">
                      {isSyncing ? `${Math.round(syncProgress)}%` : `${pendingChanges} изменений`}
                    </span>
                  </div>
                  
                  {/* Прогресс бар */}
                  {isSyncing && (
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${syncProgress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Информация о последней синхронизации */}
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs opacity-90">
                      Последняя синхронизация: {formatLastSync(lastSyncTime)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Кнопка принудительной синхронизации */}
              {!isSyncing && pendingChanges > 0 && (
                <button
                  onClick={forceSync}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Обновить</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Успешная синхронизация */}
      {isOnline && !isSyncing && pendingChanges === 0 && lastSyncTime && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">Все данные синхронизированы</p>
                  <p className="text-xs opacity-90">
                    Последнее обновление: {formatLastSync(lastSyncTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOfflineBanner(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <AlertCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;