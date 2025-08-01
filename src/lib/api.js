// src/lib/api.js
const API_BASE_URL = 'https://tetrixuno.duckdns.org/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Проверяем Content-Type ответа
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Если ответ не JSON, выводим текст для диагностики
        const text = await response.text();
        console.error('Non-JSON response received:', {
          url,
          status: response.status,
          contentType,
          text: text.substring(0, 500) // Первые 500 символов
        });
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(token) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async resendVerification(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // --- НОВЫЙ МЕТОД ДЛЯ ОБНОВЛЕНИЯ ПРОФИЛЯ ---
  async updateProfile(profileData) {
    return this.request('/auth/profile', { // Путь соответствует новому эндпоинту
      method: 'PUT', // Метод соответствует новому эндпоинту
      body: JSON.stringify(profileData),
    });
  }
  // ------------------------------------------

  // Disciplines endpoints
  async getDisciplines() {
    return this.request('/disciplines/');
  }

  async getDiscipline(id) {
    return this.request(`/disciplines/${id}`);
  }

  async createDiscipline(disciplineData) {
    return this.request('/disciplines/', {
      method: 'POST',
      body: JSON.stringify(disciplineData),
    });
  }

  async updateDiscipline(id, disciplineData) {
    return this.request(`/disciplines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(disciplineData),
    });
  }

  async deleteDiscipline(id) {
    return this.request(`/disciplines/${id}`, {
      method: 'DELETE',
    });
  }

  // Topics endpoints (updated for disciplines)
  async getTopics(disciplineId = null) {
    const params = disciplineId ? `?discipline_id=${disciplineId}` : '';
    return this.request(`/topics/${params}`);
  }

  async getTopicsByDiscipline(disciplineId) {
    return this.request(`/topics/by-discipline/${disciplineId}`);
  }

  async getTopic(id) {
    return this.request(`/topics/${id}`);
  }

  async createTopic(topicData) {
    return this.request('/topics/', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  }

  async updateTopic(id, topicData) {
    return this.request(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
  }

  async deleteTopic(id) {
    return this.request(`/topics/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyTopics() {
    return this.request('/topics/my');
  }

  // Assignments endpoints
  async getAssignments() {
    return this.request('/assignments/');
  }

  async getAssignment(id) {
    return this.request(`/assignments/${id}`);
  }

  async createAssignment(assignmentData) {
    return this.request('/assignments/', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async updateAssignment(id, assignmentData) {
    return this.request(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssignment(id) {
    return this.request(`/assignments/${id}`, {
      method: 'DELETE',
    });
  }

  async getAssignmentsByTopic(topicId) {
    return this.request(`/assignments/topic/${topicId}`);
  }

  // Submissions endpoints
  async getSubmissions() {
    return this.request('/submissions/');
  }

  async getSubmission(id) {
    return this.request(`/submissions/${id}`);
  }

  async createSubmission(submissionData) {
    return this.request('/submissions/', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async updateSubmission(id, submissionData) {
    return this.request(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    });
  }

  async deleteSubmission(id) {
    return this.request(`/submissions/${id}`, {
      method: 'DELETE',
    });
  }

  async getSubmissionsByAssignment(assignmentId) {
    return this.request(`/submissions/assignment/${assignmentId}`);
  }

  async getMySubmissions() {
    return this.request('/submissions/my');
  }

  // Admin endpoints
  async getPendingUsers() {
    return this.request('/admin/pending-users');
  }

  async getAllUsers() {
    return this.request('/admin/all-users');
  }

  async approveUser(userId) {
    return this.request(`/admin/approve-user/${userId}`, {
      method: 'POST',
    });
  }

  async rejectUser(userId) {
    return this.request(`/admin/reject-user/${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleUserVerification(userId) {
    return this.request(`/admin/toggle-user-verification/${userId}`, {
      method: 'POST',
    });
  }

  logout() {
    this.setToken(null);
  }
  // src/lib/api.js (внутри класса ApiClient)

  // --- НОВЫЕ МЕТОДЫ ДЛЯ РЕЗЕРВНОГО КОПИРОВАНИЯ ---
  async backupDatabase() {
    // Этот метод немного отличается, так как ожидает файл, а не JSON
    const url = `${API_BASE_URL}/admin/backup`;
    const config = {
      headers: this.getHeaders(),
      method: 'GET',
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Backup failed');
      }

      // Получаем имя файла из заголовков ответа
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'database_backup.sql';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Создаем blob из тела ответа
      const blob = await response.blob();

      // Создаем ссылку для скачивания
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename); // Имя файла из заголовка
      document.body.appendChild(link);
      link.click();

      // Очищаем ссылку
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'Backup downloaded successfully' };
    } catch (error) {
      console.error('API Backup Request failed:', error);
      throw error;
    }
  }

  async restoreDatabase(backupFile) {
    // Этот метод отправляет файл
    const url = `${API_BASE_URL}/admin/restore`;
    
    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('backup_file', backupFile);

    // Получаем заголовки, но НЕ устанавливаем Content-Type, так как браузер сделает это сам
    // с правильной границей (boundary) для multipart/form-data
    const headers = this.getHeaders();
    // Удаляем Content-Type, чтобы браузер мог установить его правильно
    delete headers['Content-Type'];

    const config = {
      headers: headers,
      method: 'POST',
      body: formData, // Тело запроса - FormData
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Restore failed');
      }

      return data; // { message: '...' }
    } catch (error) {
      console.error('API Restore Request failed:', error);
      throw error;
    }
  }
  // ---------------------------------------------------

  // Достижения
  async getAchievements() {
    return this.request('/achievements/');
  }

  async getUserStats() {
    return this.request('/achievements/stats');
  }

  async recordVisit() {
    return this.request('/achievements/visit', {
      method: 'POST'
    });
  }

  async recordSubmission(assignmentId, submittedAt = null) {
    return this.request('/achievements/submission', {
      method: 'POST',
      body: JSON.stringify({
        assignment_id: assignmentId,
        submitted_at: submittedAt
      })
    });
  }

  async recordPerfectScore() {
    return this.request('/achievements/perfect-score', {
      method: 'POST'
    });
  }

  async recordTopicCompletion(topicId) {
    return this.request('/achievements/topic-completion', {
      method: 'POST',
      body: JSON.stringify({
        topic_id: topicId
      })
    });
  }

  async recordHelpfulComment() {
    return this.request('/achievements/helpful-comment', {
      method: 'POST'
    });
  }

  async getUnviewedAchievements() {
    return this.request('/achievements/unviewed');
  }

  async markAchievementAsViewed(achievementType) {
    return this.request('/achievements/mark-viewed', {
      method: 'POST',
      body: JSON.stringify({
        achievement_type: achievementType
      })
    });
  }

  async markAllAchievementsAsViewed() {
    return this.request('/achievements/mark-all-viewed', {
      method: 'POST'
    });
  }

}

export const apiClient = new ApiClient();
