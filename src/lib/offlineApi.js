// src/lib/offlineApi.js - Офлайн-совместимый API клиент
import { apiClient } from './api';
import {
  saveDisciplines, getDisciplines, getDiscipline,
  saveTopics, getTopics, getTopicsByDiscipline, getTopic,
  saveAssignments, getAssignments, getAssignmentsByTopic, getAssignment,
  saveAchievements, getAchievements, getAchievementsByUser,
  saveUserData, getUserData
} from './db';

class OfflineApiClient {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Общий метод для офлайн-совместимых запросов
  async request(endpoint, options = {}, cacheKey = null) {
    const API_BASE_HOST = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
      ? import.meta.env.VITE_BACKEND_URL
      : ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL)
        ? process.env.REACT_APP_BACKEND_URL
        : 'https://tetrixuno.ddns.net');
    const API_BASE_URL = `${API_BASE_HOST}/api`;
    const url = `${API_BASE_URL}${endpoint}`;
    
    if (this.isOnline) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...apiClient.getHeaders(),
            ...options.headers
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Кэшируем данные если указан ключ
          if (cacheKey) {
            await saveUserData(cacheKey, data);
          }
          
          return data;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        console.error('Online request failed:', error);
        // Пробуем получить из кэша
        if (cacheKey) {
          const cached = await getUserData(cacheKey);
          if (cached) {
            return cached;
          }
        }
        throw error;
      }
    } else {
      // Офлайн режим - возвращаем кэшированные данные
      if (cacheKey) {
        const cached = await getUserData(cacheKey);
        if (cached) {
          return cached;
        }
      }
      throw new Error('Offline: Data not available in cache');
    }
  }

  // Дисциплины
  async getDisciplines() {
    try {
      const data = await this.request('/disciplines/', {}, 'disciplines');
      // Обрабатываем данные - API может возвращать объект с массивом или просто массив
      const disciplines = Array.isArray(data) ? data : (data.disciplines || data.data || []);
      if (disciplines.length > 0) {
        await saveDisciplines(disciplines);
      }
      return data; // Возвращаем оригинальный ответ для совместимости
    } catch (error) {
      const cached = await getDisciplines();
      if (cached.length > 0) {
        return { disciplines: cached };
      }
      throw error;
    }
  }

  async getDiscipline(id) {
    try {
      const data = await this.request(`/disciplines/${id}`, {}, `discipline_${id}`);
      return data;
    } catch (error) {
      const cached = await getDiscipline(id);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  // Темы
  async getTopics(disciplineId = null) {
    try {
      const endpoint = disciplineId ? `/topics/?discipline_id=${disciplineId}` : '/topics/';
      const cacheKey = disciplineId ? `topics_discipline_${disciplineId}` : 'topics';
      const data = await this.request(endpoint, {}, cacheKey);
      // Обрабатываем данные - API может возвращать объект с массивом или просто массив
      const topics = Array.isArray(data) ? data : (data.topics || data.data || []);
      if (topics.length > 0) {
        await saveTopics(topics);
      }
      return data; // Возвращаем оригинальный ответ для совместимости
    } catch (error) {
      const cached = disciplineId ? await getTopicsByDiscipline(disciplineId) : await getTopics();
      if (cached.length > 0) {
        return { topics: cached };
      }
      throw error;
    }
  }

  async getTopic(id) {
    try {
      const data = await this.request(`/topics/${id}`, {}, `topic_${id}`);
      return data;
    } catch (error) {
      const cached = await getTopic(id);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  // Задания
  async getAssignments() {
    try {
      const data = await this.request('/assignments/', {}, 'assignments');
      // Обрабатываем данные - API может возвращать объект с массивом или просто массив
      const assignments = Array.isArray(data) ? data : (data.assignments || data.data || []);
      if (assignments.length > 0) {
        await saveAssignments(assignments);
      }
      return data; // Возвращаем оригинальный ответ для совместимости
    } catch (error) {
      const cached = await getAssignments();
      if (cached.length > 0) {
        return { assignments: cached };
      }
      throw error;
    }
  }

  async getAssignment(id) {
    try {
      const data = await this.request(`/assignments/${id}`, {}, `assignment_${id}`);
      return data;
    } catch (error) {
      const cached = await getAssignment(id);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  async getAssignmentsByTopic(topicId) {
    try {
      const data = await this.request(`/assignments/topic/${topicId}`, {}, `assignments_topic_${topicId}`);
      return data;
    } catch (error) {
      const cached = await getAssignmentsByTopic(topicId);
      if (cached.length > 0) {
        return cached;
      }
      throw error;
    }
  }

  // Достижения
  async getAchievements() {
    try {
      const data = await this.request('/achievements/', {}, 'achievements');
      // Обрабатываем данные - API может возвращать объект с массивом или просто массив
      const achievements = Array.isArray(data) ? data : (data.achievements || data.data || []);
      if (achievements.length > 0) {
        await saveAchievements(achievements);
      }
      return data; // Возвращаем оригинальный ответ для совместимости
    } catch (error) {
      const cached = await getAchievements();
      if (cached.length > 0) {
        return { achievements: cached };
      }
      throw error;
    }
  }

  async getUserStats() {
    try {
      return await this.request('/achievements/stats', {}, 'user_stats');
    } catch (error) {
      const cached = await getUserData('user_stats');
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  // Отправки заданий
  async getMySubmissions() {
    try {
      const data = await this.request('/submissions/my', {}, 'my_submissions');
      // Обрабатываем данные - API может возвращать объект с массивом или просто массив
      const submissions = Array.isArray(data) ? data : (data.submissions || data.data || []);
      return data; // Возвращаем оригинальный ответ для совместимости
    } catch (error) {
      const cached = await getUserData('my_submissions');
      if (cached) {
        return { submissions: cached };
      }
      throw error;
    }
  }

  async createSubmission(submissionData) {
    try {
      const data = await this.request('/submissions/', {
        method: 'POST',
        body: JSON.stringify(submissionData)
      }, 'my_submissions');
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateSubmission(id, submissionData) {
    try {
      const data = await this.request(`/submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(submissionData)
      }, 'my_submissions');
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Достижения - запись событий
  async recordVisit() {
    try {
      return await this.request('/achievements/visit', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error recording visit:', error);
      // Не выбрасываем ошибку, так как это не критично
    }
  }

  async recordSubmission(assignmentId, submittedAt = null) {
    try {
      return await this.request('/achievements/submission', {
        method: 'POST',
        body: JSON.stringify({
          assignment_id: assignmentId,
          submitted_at: submittedAt
        })
      });
    } catch (error) {
      console.error('Error recording submission:', error);
    }
  }

  async recordPerfectScore() {
    try {
      return await this.request('/achievements/perfect-score', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error recording perfect score:', error);
    }
  }

  async recordTopicCompletion(topicId) {
    try {
      return await this.request('/achievements/topic-completion', {
        method: 'POST',
        body: JSON.stringify({
          topic_id: topicId
        })
      });
    } catch (error) {
      console.error('Error recording topic completion:', error);
    }
  }

  async recordHelpfulComment() {
    try {
      return await this.request('/achievements/helpful-comment', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error recording helpful comment:', error);
    }
  }

  async getUnviewedAchievements() {
    try {
      return await this.request('/achievements/unviewed', {}, 'unviewed_achievements');
    } catch (error) {
      const cached = await getUserData('unviewed_achievements');
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  async markAchievementAsViewed(achievementType) {
    try {
      return await this.request('/achievements/mark-viewed', {
        method: 'POST',
        body: JSON.stringify({
          achievement_type: achievementType
        })
      });
    } catch (error) {
      console.error('Error marking achievement as viewed:', error);
    }
  }

  async markAllAchievementsAsViewed() {
    try {
      return await this.request('/achievements/mark-all-viewed', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking all achievements as viewed:', error);
    }
  }

  // Синхронизация всех данных
  async syncAllData() {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      // Загружаем все основные данные
      const [disciplines, topics, assignments, achievements] = await Promise.all([
        this.getDisciplines(),
        this.getTopics(),
        this.getAssignments(),
        this.getAchievements()
      ]);

      return {
        disciplines,
        topics,
        assignments,
        achievements,
        syncedAt: new Date()
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Предварительная загрузка данных для офлайн работы
  async preloadData() {
    if (!this.isOnline) return;

    try {
      console.log('Preloading data for offline use...');
      await this.syncAllData();
      console.log('Data preloaded successfully');
    } catch (error) {
      console.error('Preload failed:', error);
    }
  }
}

export const offlineApiClient = new OfflineApiClient();
