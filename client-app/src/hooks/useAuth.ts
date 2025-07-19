import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { AuthUser, LoginForm, RegisterForm } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Проверяем токен на сервере
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (error: any) {
      console.error('Auth check failed:', error);
      // Если токен недействителен, очищаем его
      localStorage.removeItem('auth_token');
      apiClient.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData: LoginForm) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.login(formData.email, formData.password);
      
      if (response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем совпадение паролей
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      const { confirmPassword, ...registerData } = formData;
      const response = await apiClient.register(registerData);
      
      if (response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка регистрации';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    try {
      setLoading(true);
      setError(null);

      const updatedUser = await apiClient.updateProfile(profileData);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка обновления профиля';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuth,
  };
};

