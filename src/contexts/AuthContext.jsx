// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Предполагается, что apiClient.setToken(token) устанавливает токен для будущих запросов
        apiClient.setToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);

      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token); // Предполагаем, что токен возвращается
      localStorage.setItem('user', JSON.stringify(response.user));

      // Устанавливаем токен в apiClient для будущих запросов
      apiClient.setToken(response.token);

      return response;
    } catch (error) {
      // Убедитесь, что токен очищен в случае ошибки входа
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiClient.setToken(null); // Очищаем токен в apiClient
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // apiClient.logout(); // Если у вашего apiClient есть метод logout, который делает запрос
    // Очищаем состояние контекста
    setUser(null);
    setIsAuthenticated(false);
    // Очищаем localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Очищаем токен в apiClient
    apiClient.setToken(null);
  };

  const verifyEmail = async (token) => {
    try {
      const response = await apiClient.verifyEmail(token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiClient.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await apiClient.resetPassword(token, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await apiClient.resendVerification(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // --- НОВАЯ ФУНКЦИЯ ---
  // Функция для обновления данных пользователя в состоянии контекста
  const updateUser = (updatedUserData) => {
    if (updatedUserData && typeof updatedUserData === 'object') {
      // Обновляем локальное состояние
      setUser(prevUser => {
        const newUser = { ...prevUser, ...updatedUserData };
        // Также обновляем данные в localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
      });
    }
    // Можно также добавить логику, если updatedUserData - это полностью новый объект пользователя
    // else if (updatedUserData !== undefined) {
    //   setUser(updatedUserData);
    //   localStorage.setItem('user', JSON.stringify(updatedUserData));
    // }
  };
  // ---------------------

  // --- Добавляем updateUser в value ---
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    updateUser, // <-- ДОБАВЛЕНО
  };
  // ------------------------------------

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
