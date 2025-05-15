import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, getUserProfile } from '../api/api';

// Vytvorenie AuthContext
const AuthContext = createContext();

// Custom hook pre prístup ku kontextu
export const useAuth = () => useContext(AuthContext);

// AuthProvider komponent
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    token: null,
    isLoading: true,
    error: null
  });

  // Načítanie údajov o prihlásení z AsyncStorage pri štarte
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          setAuthState({
            isLoggedIn: true,
            user: JSON.parse(userData),
            token,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            token: null,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({
          isLoggedIn: false,
          user: null,
          token: null,
          isLoading: false,
          error: 'Nepodarilo sa načítať stav prihlásenia'
        });
      }
    };

    loadAuthState();
  }, []);

  // Prihlásenie používateľa
  const loginUser = async (email, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await login(email, password);
      
      // Uloženie údajov do AsyncStorage
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      setAuthState({
        isLoggedIn: true,
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Nesprávne prihlasovacie údaje' 
      }));
      return { success: false, error: error.message || 'Nesprávne prihlasovacie údaje' };
    }
  };

  // Registrácia používateľa
  const registerUser = async (name, email, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await register(name, email, password);
      
      // Automatické prihlásenie po registrácii
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      setAuthState({
        isLoggedIn: true,
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Chyba pri registrácii'
      }));
      return { success: false, error: error.message || 'Chyba pri registrácii' };
    }
  };

  // Odhlásenie používateľa
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setAuthState({
        isLoggedIn: false,
        user: null,
        token: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Aktualizácia profilu používateľa
  const updateUserProfile = async () => {
    if (!authState.token) return;
    
    try {
      const userData = await getUserProfile(authState.token);
      
      // Aktualizácia lokálnych údajov
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setAuthState(prev => ({
        ...prev,
        user: userData
      }));
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  // Hodnoty poskytované kontextom
  const authContextValue = {
    authState,
    loginUser,
    registerUser,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 