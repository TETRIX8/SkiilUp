import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

export const useRating = () => {
  const [studentsRating, setStudentsRating] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadAllRatingData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Загружаем все данные рейтинга параллельно
      const [studentsResponse, myRatingResponse, leaderboardResponse, statsResponse] = await Promise.all([
        apiClient.getStudentsRating(),
        apiClient.getMyRating(),
        apiClient.getLeaderboard(50),
        apiClient.getRatingStats()
      ]);

      if (studentsResponse.success) {
        setStudentsRating(studentsResponse.students || []);
      }

      if (myRatingResponse.success) {
        setMyRating(myRatingResponse.rating || null);
      }

      if (leaderboardResponse.success) {
        setLeaderboard(leaderboardResponse.leaderboard || []);
      }

      if (statsResponse.success) {
        setRatingStats(statsResponse.stats || null);
      }

    } catch (error) {
      console.error('Ошибка загрузки данных рейтинга:', error);
      setError('Ошибка загрузки данных рейтинга. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRating = useCallback(async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const [studentsResponse, myRatingResponse, leaderboardResponse, statsResponse] = await Promise.all([
        apiClient.getStudentsRating(),
        apiClient.getMyRating(),
        apiClient.getLeaderboard(50),
        apiClient.getRatingStats()
      ]);

      if (studentsResponse.success) {
        setStudentsRating(studentsResponse.students || []);
      }

      if (myRatingResponse.success) {
        setMyRating(myRatingResponse.rating || null);
      }

      if (leaderboardResponse.success) {
        setLeaderboard(leaderboardResponse.leaderboard || []);
      }

      if (statsResponse.success) {
        setRatingStats(statsResponse.stats || null);
      }

    } catch (error) {
      console.error('Ошибка обновления данных рейтинга:', error);
      setError('Ошибка обновления данных рейтинга');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadSubjectRating = useCallback(async (subjectId) => {
    try {
      const response = await apiClient.getSubjectRating(subjectId);
      return response.success ? response.ratings : [];
    } catch (error) {
      console.error('Ошибка загрузки рейтинга по предмету:', error);
      return [];
    }
  }, []);

  const loadStudentHistory = useCallback(async (studentId, days = 30) => {
    try {
      const response = await apiClient.getStudentRatingHistory(studentId, days);
      return response.success ? response.history : [];
    } catch (error) {
      console.error('Ошибка загрузки истории студента:', error);
      return [];
    }
  }, []);

  // Автоматическая загрузка данных при монтировании
  useEffect(() => {
    loadAllRatingData();
  }, [loadAllRatingData]);

  // Автоматическое обновление каждые 5 минут
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRating();
    }, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(interval);
  }, [refreshRating]);

  return {
    // Данные
    studentsRating,
    myRating,
    leaderboard,
    ratingStats,
    
    // Состояние
    loading,
    error,
    refreshing,
    
    // Методы
    loadAllRatingData,
    refreshRating,
    loadSubjectRating,
    loadStudentHistory,
    
    // Утилиты
    getMyPosition: () => myRating?.position || null,
    getMyScore: () => myRating?.total_score || 0,
    getMyChange: () => myRating?.change || 0,
    getTotalStudents: () => ratingStats?.total_students || 0,
    getAverageScore: () => ratingStats?.average_score || 0,
    getTopScore: () => ratingStats?.top_score || 0,
    getActiveStudents: () => ratingStats?.active_students || 0,
  };
};
