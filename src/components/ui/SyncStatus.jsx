import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { RefreshCw, Wifi, WifiOff, CheckCircle, Clock } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

const SyncStatus = ({ className = "" }) => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncProgress,
    pendingChanges,
    forceSync
  } = useOffline();

  const formatLastSync = (date) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes}м`;
    if (hours < 24) return `${hours}ч`;
    return 'Давно';
  };

  if (!isOnline) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <WifiOff className="h-4 w-4 text-orange-500" />
        <span className="text-sm text-orange-600 font-medium">Офлайн</span>
        {pendingChanges > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {pendingChanges}
          </Badge>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
        <span className="text-sm text-blue-600 font-medium">
          Синхронизация {Math.round(syncProgress)}%
        </span>
      </div>
    );
  }

  if (pendingChanges > 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Wifi className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-blue-600 font-medium">Готово к синхронизации</span>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {pendingChanges}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={forceSync}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Обновить
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span className="text-sm text-green-600 font-medium">Синхронизировано</span>
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>{formatLastSync(lastSyncTime)}</span>
      </div>
    </div>
  );
};

export default SyncStatus;
