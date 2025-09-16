import React, { useState, useEffect } from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { getStorageStats, clearAllData } from '../../lib/db';
import { offlineApiClient } from '../../lib/offlineApi';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const OfflineDemo = () => {
  const { isOnline, isSyncing, lastSyncTime, syncProgress, pendingChanges, forceSync } = useOffline();
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [cachedDataInfo, setCachedDataInfo] = useState({});

  const loadStats = async () => {
    try {
      const storageStats = await getStorageStats();
      setStats(storageStats);
      
      // Загружаем информацию о кэшированных данных
      const cachedInfo = await offlineApiClient.hasCachedData();
      setCachedDataInfo(cachedInfo);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const testOfflineFunctionality = async () => {
    setIsLoading(true);
    const results = [];

    try {
      // Тест 1: Загрузка дисциплин
      results.push({ test: 'Загрузка дисциплин', status: 'loading' });
      const disciplines = await offlineApiClient.getDisciplines();
      results.push({ 
        test: 'Загрузка дисциплин', 
        status: 'success', 
        data: `${disciplines.length} дисциплин загружено` 
      });

      // Тест 2: Загрузка тем
      results.push({ test: 'Загрузка тем', status: 'loading' });
      const topics = await offlineApiClient.getTopics();
      results.push({ 
        test: 'Загрузка тем', 
        status: 'success', 
        data: `${topics.length} тем загружено` 
      });

      // Тест 3: Загрузка заданий
      results.push({ test: 'Загрузка заданий', status: 'loading' });
      const assignments = await offlineApiClient.getAssignments();
      results.push({ 
        test: 'Загрузка заданий', 
        status: 'success', 
        data: `${assignments.length} заданий загружено` 
      });

      // Тест 4: Загрузка достижений
      results.push({ test: 'Загрузка достижений', status: 'loading' });
      const achievements = await offlineApiClient.getAchievements();
      results.push({ 
        test: 'Загрузка достижений', 
        status: 'success', 
        data: `${achievements.length} достижений загружено` 
      });

    } catch (error) {
      results.push({ 
        test: 'Ошибка тестирования', 
        status: 'error', 
        data: error.message 
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearCache = async () => {
    try {
      await clearAllData();
      await loadStats();
      setTestResults([]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const formatLastSync = (date) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return 'Давно';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Офлайн функциональность</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Статус соединения */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">
                  {isOnline ? 'Подключено к интернету' : 'Офлайн режим'}
                </p>
                <p className="text-sm text-gray-500">
                  Последняя синхронизация: {formatLastSync(lastSyncTime)}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? 'Онлайн' : 'Офлайн'}
            </Badge>
          </div>

          {/* Статус синхронизации */}
          {isSyncing && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="font-medium text-blue-700">Синхронизация данных...</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
              <p className="text-sm text-blue-600 mt-1">{Math.round(syncProgress)}% завершено</p>
            </div>
          )}

          {/* Ожидающие изменения */}
          {pendingChanges > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-700">
                    {pendingChanges} изменений ожидают синхронизации
                  </span>
                </div>
                <Button size="sm" onClick={forceSync} disabled={!isOnline}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Синхронизировать
                </Button>
              </div>
            </div>
          )}

          {/* Статистика хранилища */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.disciplines || 0}</p>
              <p className="text-sm text-gray-500">Дисциплины</p>
              {cachedDataInfo.hasDisciplines && (
                <Badge variant="secondary" className="text-xs mt-1">Кэшировано</Badge>
              )}
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.topics || 0}</p>
              <p className="text-sm text-gray-500">Темы</p>
              {cachedDataInfo.hasTopics && (
                <Badge variant="secondary" className="text-xs mt-1">Кэшировано</Badge>
              )}
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.assignments || 0}</p>
              <p className="text-sm text-gray-500">Задания</p>
              {cachedDataInfo.hasAssignments && (
                <Badge variant="secondary" className="text-xs mt-1">Кэшировано</Badge>
              )}
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.achievements || 0}</p>
              <p className="text-sm text-gray-500">Достижения</p>
              {cachedDataInfo.hasAchievements && (
                <Badge variant="secondary" className="text-xs mt-1">Кэшировано</Badge>
              )}
            </div>
          </div>

          {/* Информация о кэшированных данных */}
          {cachedDataInfo.totalCached > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-700">
                    Данные доступны для офлайн работы
                  </p>
                  <p className="text-sm text-green-600">
                    Всего кэшировано: {cachedDataInfo.totalCached} элементов
                  </p>
                </div>
              </div>
            </div>
          )}

          {cachedDataInfo.totalCached === 0 && !isOnline && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-700">
                    Нет кэшированных данных
                  </p>
                  <p className="text-sm text-orange-600">
                    Подключитесь к интернету для загрузки данных
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Дополнительная статистика */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-600">{stats.cache || 0}</p>
              <p className="text-sm text-gray-500">Кэш запросов</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-orange-600">{stats.queue || 0}</p>
              <p className="text-sm text-gray-500">В очереди</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-indigo-600">{stats.userData || 0}</p>
              <p className="text-sm text-gray-500">Пользовательские данные</p>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testOfflineFunctionality} 
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Тестировать офлайн функциональность</span>
            </Button>
            
            <Button 
              onClick={forceSync} 
              disabled={!isOnline || isSyncing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Принудительная синхронизация</span>
            </Button>
            
            <Button 
              onClick={clearCache} 
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Очистить кэш</span>
            </Button>
          </div>

          {/* Результаты тестирования */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Результаты тестирования:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  {result.status === 'loading' && (
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                  )}
                  {result.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {result.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="flex-1">{result.test}</span>
                  {result.data && (
                    <Badge variant="secondary" className="text-xs">
                      {result.data}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineDemo;

