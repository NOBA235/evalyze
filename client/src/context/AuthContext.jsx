import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('evalyze_token');
        const savedUser = localStorage.getItem('evalyze_user');
        
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Validate that the parsed user has required fields
          if (parsedUser && parsedUser._id && parsedUser.role) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Invalid user data, clean up
            console.warn('Invalid user data found, cleaning up');
            localStorage.removeItem('evalyze_token');
            localStorage.removeItem('evalyze_user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No token or user data
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clean up corrupted data
        localStorage.removeItem('evalyze_token');
        localStorage.removeItem('evalyze_user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Optional: Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'evalyze_token' || e.key === 'evalyze_user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      
      if (!data?.user || !data?.token) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('evalyze_token', data.token);
      localStorage.setItem('evalyze_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await authAPI.register(formData);
      
      if (!data?.user || !data?.token) {
        throw new Error('Invalid registration response');
      }

      localStorage.setItem('evalyze_token', data.token);
      localStorage.setItem('evalyze_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('evalyze_token');
    localStorage.removeItem('evalyze_user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Optional: Call backend to invalidate token
    try {
      authAPI.logout?.(); // If you have a logout endpoint
    } catch (error) {
      console.warn('Backend logout failed:', error);
    }
  }, []);

  // Update user function (useful for profile updates)
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('evalyze_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null || context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;