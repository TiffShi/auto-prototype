import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialise auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_info');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await axiosClient.post('/auth/login', { username, password });
    const { access_token, username: uname, user_id } = response.data;

    const userInfo = { username: uname, user_id };

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_info', JSON.stringify(userInfo));

    setToken(access_token);
    setUser(userInfo);

    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout — clear client state regardless
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}