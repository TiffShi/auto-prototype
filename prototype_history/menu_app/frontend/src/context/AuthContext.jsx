import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosClient from '../api/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  const persistAuth = useCallback((tokenValue, userData) => {
    localStorage.setItem('auth_token', tokenValue);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      persistAuth(data.access_token, data.user);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const register = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/register', { email, password });
      persistAuth(data.access_token, data.user);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}