import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../api/api';
import { useAuth } from './AuthContext';

// Vytvorenie kontextu
const ClientsContext = createContext();

// Provider komponent
export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Načítanie klientov pri prihlásení
  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  // Načítanie zoznamu klientov
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      setError(error.message || 'Nepodarilo sa načítať klientov');
    } finally {
      setIsLoading(false);
    }
  };

  // Načítanie detailu klienta
  const fetchClientDetail = async (clientId) => {
    try {
      setIsLoading(true);
      setError(null);
      return await api.getClient(clientId);
    } catch (error) {
      setError(error.message || 'Nepodarilo sa načítať detail klienta');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Vytvorenie nového klienta
  const createClient = async (clientData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newClient = await api.createClient(clientData);
      setClients((prevClients) => [...prevClients, newClient]);
      return newClient;
    } catch (error) {
      setError(error.message || 'Nepodarilo sa vytvoriť klienta');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Aktualizácia klienta
  const updateClient = async (clientId, clientData) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedClient = await api.updateClient(clientId, clientData);
      setClients((prevClients) =>
        prevClients.map((client) => (client._id === clientId ? updatedClient : client))
      );
      return updatedClient;
    } catch (error) {
      setError(error.message || 'Nepodarilo sa aktualizovať klienta');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Vymazanie klienta
  const deleteClient = async (clientId) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteClient(clientId);
      setClients((prevClients) => prevClients.filter((client) => client._id !== clientId));
      return true;
    } catch (error) {
      setError(error.message || 'Nepodarilo sa vymazať klienta');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Vyhľadávanie klientov podľa mena
  const searchClients = (query) => {
    if (!query) return clients;
    const lowerCaseQuery = query.toLowerCase();
    return clients.filter(client => 
      client.name?.toLowerCase().includes(lowerCaseQuery) || 
      client.phone?.toLowerCase().includes(lowerCaseQuery) ||
      client.email?.toLowerCase().includes(lowerCaseQuery)
    );
  };

  // Kontext hodnoty
  const value = {
    clients,
    isLoading,
    error,
    fetchClients,
    fetchClientDetail,
    createClient,
    updateClient,
    deleteClient,
    searchClients
  };

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
};

// Hook pre používanie clients kontextu
export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
};

export default ClientsContext; 