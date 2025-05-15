import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Základná URL pre API
const BASE_URL = 'http://localhost:5001/api';

// Vytvorenie axios inštancie s prednastavenými hodnotami
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pre pridanie auth tokenu do requestov
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa prihlásiť' };
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/users', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa zaregistrovať' };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa načítať profil' };
  }
};

// Calls API
export const getCalls = async () => {
  try {
    const response = await api.get('/calls');
    return response.data;
  } catch (error) {
    console.error('Get calls error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa načítať hovory' };
  }
};

export const getCall = async (callId) => {
  try {
    const response = await api.get(`/calls/${callId}`);
    return response.data;
  } catch (error) {
    console.error('Get call error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa načítať hovor' };
  }
};

export const createCall = async (callData) => {
  try {
    const response = await api.post('/calls', callData);
    return response.data;
  } catch (error) {
    console.error('Create call error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa vytvoriť hovor' };
  }
};

export const updateCall = async (callId, callData) => {
  try {
    const response = await api.put(`/calls/${callId}`, callData);
    return response.data;
  } catch (error) {
    console.error('Update call error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa aktualizovať hovor' };
  }
};

export const deleteCall = async (callId) => {
  try {
    const response = await api.delete(`/calls/${callId}`);
    return response.data;
  } catch (error) {
    console.error('Delete call error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa vymazať hovor' };
  }
};

// Clients API
export const getClients = async () => {
  try {
    const response = await api.get('/clients');
    return response.data;
  } catch (error) {
    console.error('Get clients error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa načítať klientov' };
  }
};

export const getClient = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Get client error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa načítať klienta' };
  }
};

export const createClient = async (clientData) => {
  try {
    const response = await api.post('/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Create client error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa vytvoriť klienta' };
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    console.error('Update client error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa aktualizovať klienta' };
  }
};

export const deleteClient = async (clientId) => {
  try {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Delete client error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Nepodarilo sa vymazať klienta' };
  }
};

export default api; 