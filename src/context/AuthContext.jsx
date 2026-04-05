import { createContext, useState, useContext, useEffect } from 'react';

import { api } from "../utils/apiConfig"

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
        
        const response = await api.get(`/auth/me`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (response.status < 400) {
          const data = await response.data;
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          // Токен невалидный
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post(`/auth/login`, JSON.stringify({ email, password }), {
        headers: {
          "Content-Type": 'application/json'
        }
      });

      const data = await response.data;

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { success: false, message: 'Ошибка сети' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post(`/auth/register`, JSON.stringify(userData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.data;

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { success: false, message: 'Ошибка сети' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (updatedUserData) => {
    const mergedUser = { ...user, ...updatedUserData };
    setUser(mergedUser);

  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    token,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};