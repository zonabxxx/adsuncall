import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api/api';

// Vytvorenie kontextu
const AuthContext = createContext();

// Provider komponent
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Načítanie uloženého stavu pri štarte
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading stored authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Prihlásenie používateľa
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.login(email, password);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      } else {
        setError('Nesprávna odpoveď zo servera');
        return false;
      }
    } catch (error) {
      setError(error.message || 'Prihlásenie zlyhalo');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Registrácia používateľa
  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.register(name, email, password);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      } else {
        setError('Nesprávna odpoveď zo servera');
        return false;
      }
    } catch (error) {
      setError(error.message || 'Registrácia zlyhala');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Odhlásenie používateľa
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Kontext hodnoty
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook pre používanie auth kontextu
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 