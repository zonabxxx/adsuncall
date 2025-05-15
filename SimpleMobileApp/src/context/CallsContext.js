import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../api/api';
import { useAuth } from './AuthContext';

// Vytvorenie kontextu
const CallsContext = createContext();

// Provider komponent
export const CallsProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Načítanie hovorov pri prihlásení
  useEffect(() => {
    if (isAuthenticated) {
      fetchCalls();
    }
  }, [isAuthenticated]);

  // Načítanie zoznamu hovorov
  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getCalls();
      setCalls(data);
    } catch (error) {
      setError(error.message || 'Nepodarilo sa načítať hovory');
    } finally {
      setIsLoading(false);
    }
  };

  // Načítanie detailu hovoru
  const fetchCallDetail = async (callId) => {
    try {
      setIsLoading(true);
      setError(null);
      return await api.getCall(callId);
    } catch (error) {
      setError(error.message || 'Nepodarilo sa načítať detail hovoru');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Vytvorenie nového hovoru
  const createCall = async (callData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newCall = await api.createCall(callData);
      setCalls((prevCalls) => [...prevCalls, newCall]);
      return newCall;
    } catch (error) {
      setError(error.message || 'Nepodarilo sa vytvoriť hovor');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Aktualizácia hovoru
  const updateCall = async (callId, callData) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCall = await api.updateCall(callId, callData);
      setCalls((prevCalls) =>
        prevCalls.map((call) => (call._id === callId ? updatedCall : call))
      );
      return updatedCall;
    } catch (error) {
      setError(error.message || 'Nepodarilo sa aktualizovať hovor');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Vymazanie hovoru
  const deleteCall = async (callId) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteCall(callId);
      setCalls((prevCalls) => prevCalls.filter((call) => call._id !== callId));
      return true;
    } catch (error) {
      setError(error.message || 'Nepodarilo sa vymazať hovor');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrovanie hovorov podľa stavu
  const getCallsByStatus = (status) => {
    return calls.filter(call => call.status === status);
  };

  // Filtrovanie nadchádzajúcich hovorov (v budúcnosti)
  const getUpcomingCalls = () => {
    const now = new Date();
    return calls.filter(call => {
      const callDate = new Date(call.scheduledAt || call.date);
      return callDate > now;
    });
  };

  // Kontext hodnoty
  const value = {
    calls,
    isLoading,
    error,
    fetchCalls,
    fetchCallDetail,
    createCall,
    updateCall,
    deleteCall,
    getCallsByStatus,
    getUpcomingCalls
  };

  return <CallsContext.Provider value={value}>{children}</CallsContext.Provider>;
};

// Hook pre používanie calls kontextu
export const useCalls = () => {
  const context = useContext(CallsContext);
  if (!context) {
    throw new Error('useCalls must be used within a CallsProvider');
  }
  return context;
};

export default CallsContext; 