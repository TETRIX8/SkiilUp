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
    const url = `${apiClient.API_BASE_URL || 'https://tetrixuno.ddns.net/api'}${endpoint}`;
    
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
      await saveDisciplines(data);
      return data;
    } catch (error) {
      const cached = await getDisciplines();
      if (cached.length > 0) {
        return cached;
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
      await saveTopics(data);
      return data;
    } catch (error) {
      const cached = disciplineId ? await getTopicsByDiscipline(disciplineId) : await getTopics();
      if (cached.length > 0) {
        return cached;
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
      await saveAssignments(data);
      return data;
    } catch (error) {
      const cached = await getAssignments();
      if (cached.length > 0) {
        return cached;
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
      await saveAchievements(data);
      return data;
    } catch (error) {
      const cached = await getAchievements();
      if (cached.length > 0) {
        return cached;
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
