import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState({});
  const [newAchievements, setNewAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const previousAchievementsRef = useRef({});

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.getAchievements();
      if (response.success) {
        const currentAchievements = response.achievements;
        
        // Проверяем новые достижения (только те, которые стали завершёнными и ещё не просмотрены)
        const newCompleted = [];
        Object.entries(currentAchievements).forEach(([key, achievement]) => {
          const previous = previousAchievementsRef.current[key];
          const justCompletedNow = achievement.is_completed && (!previous || !previous.is_completed);
          const notViewed = !achievement.is_viewed;
          if (justCompletedNow && notViewed) {
            newCompleted.push(achievement);
          }
        });
        
        if (newCompleted.length > 0) {
          setNewAchievements(prev => [...prev, ...newCompleted]);
        }
        
        setAchievements(currentAchievements);
        previousAchievementsRef.current = currentAchievements;
      } else {
        setError('Не удалось загрузить достижения');
      }
    } catch (error) {
      console.error('Ошибка загрузки достижений:', error);
      setError('Ошибка загрузки достижений');
    } finally {
      setLoading(false);
    }
  };

  const loadUnviewedAchievements = async () => {
    try {
      const response = await apiClient.getUnviewedAchievements();
      if (response.success) {
        setNewAchievements(response.achievements);
      }
    } catch (error) {
      console.error('Ошибка загрузки непросмотренных достижений:', error);
    }
  };

  const removeNewAchievement = async (achievementId) => {
    try {
      // Отмечаем достижение как просмотренное
      await apiClient.markAchievementAsViewed(achievementId);
      // Удаляем из списка новых достижений
      setNewAchievements(prev => prev.filter(achievement => achievement.id !== achievementId));
    } catch (error) {
      console.error('Ошибка отметки достижения как просмотренного:', error);
    }
  };

  const clearNewAchievements = async () => {
    try {
      // Отмечаем все достижения как просмотренные
      await apiClient.markAllAchievementsAsViewed();
      // Очищаем список новых достижений
      setNewAchievements([]);
    } catch (error) {
      console.error('Ошибка отметки всех достижений как просмотренных:', error);
    }
  };

  useEffect(() => {
    loadAchievements();
    loadUnviewedAchievements();
    
    // Периодически проверяем новые достижения
    const interval = setInterval(() => {
      loadAchievements();
      loadUnviewedAchievements();
    }, 30000); // каждые 30 секунд
    
    return () => clearInterval(interval);
  }, []);

  return {
    achievements,
    newAchievements,
    loading,
    error,
    loadAchievements,
    loadUnviewedAchievements,
    removeNewAchievement,
    clearNewAchievements
  };
}; 