import axios from 'axios';
import config from '../../config';

const API_URL = config.apiBaseUrl + '/api/calls/';

// Create new call
const createCall = async (callData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log('callService - Sending data to API:', callData);
  
  try {
    const response = await axios.post(API_URL, callData, config);
    console.log('callService - API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('callService - API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get all calls
const getCalls = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);

  return response.data;
};

// Get today's calls
const getTodaysCalls = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    console.log('Získavam všetky volania...');
    const allCallsResponse = await axios.get(API_URL, config);
    const allCalls = allCallsResponse.data;
    console.log('Všetky volania:', allCalls);
    
    if (allCalls && allCalls.length > 0) {
      // Získanie aktuálneho dátumu (bez času) v lokálnom časovom pásme
      const now = new Date();
      const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      console.log('Aktuálny lokálny dátum:', todayLocal);
      
      // Filtrujem volania pre zobrazenie v notifikáciách:
      const relevantCalls = allCalls.filter(call => {
        // Ignorovať záznamy bez dátumu
        if (!call.callDate && !call.nextActionDate) return false;
        
        // Normalizovaný status pre porovnanie (odstránenie medzier, malé písmená)
        const normalizedStatus = call.status ? call.status.toLowerCase().replace(/\s+/g, '') : '';
        const isRelevantStatus = normalizedStatus === 'scheduled' || normalizedStatus === 'inprogress';
        
        // Ak nie je v relevantnom stave, nezobrazovať
        if (!isRelevantStatus) return false;
        
        // Kontrola callDate - či je to dnes
        if (call.callDate) {
          // Vytvorenie len dátumu (bez času) z callDate
          const callDate = new Date(call.callDate);
          const callDateLocal = new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate());
          
          // Ak je callDate dnešný dátum, zobraziť
          if (callDateLocal.getTime() === todayLocal.getTime()) {
            console.log('Volanie zahrnuté - dnešný callDate:', call);
            return true;
          }
        }
        
        // Kontrola nextActionDate - či je to dnes
        if (call.nextActionDate) {
          const nextActionDate = new Date(call.nextActionDate);
          const nextActionDateLocal = new Date(
            nextActionDate.getFullYear(), 
            nextActionDate.getMonth(), 
            nextActionDate.getDate()
          );
          
          // Ak je nextActionDate dnešný dátum, zobraziť
          if (nextActionDateLocal.getTime() === todayLocal.getTime()) {
            console.log('Volanie zahrnuté - dnešný nextActionDate:', call);
            return true;
          }
        }
        
        return false;
      });
      
      console.log('Relevantné volania pre zobrazenie:', relevantCalls);
      return relevantCalls;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching today calls:', error);
    if (error.response) {
      console.error('  Response data:', error.response.data);
      console.error('  Response status:', error.response.status);
    }
    throw error;
  }
};

// Get calls for a specific client
const getClientCalls = async (clientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'client/' + clientId, config);

  return response.data;
};

// Get call by ID
const getCall = async (callId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + callId, config);

  return response.data;
};

// Update call
const updateCall = async (callId, callData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + callId, callData, config);

  return response.data;
};

// Delete call
const deleteCall = async (callId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + callId, config);

  return response.data;
};

const callService = {
  createCall,
  getCalls,
  getTodaysCalls,
  getClientCalls,
  getCall,
  updateCall,
  deleteCall,
};

export default callService; 