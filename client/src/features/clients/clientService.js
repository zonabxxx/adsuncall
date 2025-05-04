import axios from 'axios';

const API_URL = '/api/clients/';

// Konfigurácia Axios pre lepšie spracovanie timeoutov
const axiosInstance = axios.create({
  timeout: 10000, // 10 sekúnd timeout
  retries: 3,
  retryDelay: 1000
});

// Interceptor pre spracovanie chýb pripojenia
axiosInstance.interceptors.response.use(null, async (error) => {
  const { config } = error;
  
  // Ak nemáme konfiguráciu alebo už sme dosiahli počet opakovaní, vyhodíme chybu
  if (!config || !config.retries) {
    return Promise.reject(error);
  }
  
  // Počet zostávajúcich pokusov
  config.retryCount = config.retryCount || 0;
  
  // Ak sme vyčerpali pokusy, vyhodíme chybu
  if (config.retryCount >= config.retries) {
    return Promise.reject(error);
  }
  
  // Zvýšime počítadlo pokusov
  config.retryCount += 1;
  
  // Čakáme pred opakovaním požiadavky
  const delay = new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
  
  // Opakujeme požiadavku
  await delay;
  return axiosInstance(config);
});

// Create new client
const createClient = async (clientData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axiosInstance.post(API_URL, clientData, config);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Server is not responding.');
    }
    if (!error.response) {
      throw new Error('Network error. Could not connect to the server.');
    }
    throw error;
  }
};

// Get all clients
const getClients = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axiosInstance.get(API_URL, config);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Server is not responding.');
    }
    if (!error.response) {
      throw new Error('Network error. Could not connect to the server.');
    }
    throw error;
  }
};

// Get client by ID
const getClient = async (clientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axiosInstance.get(API_URL + clientId, config);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Server is not responding.');
    }
    if (!error.response) {
      throw new Error('Network error. Could not connect to the server.');
    }
    throw error;
  }
};

// Update client
const updateClient = async (clientId, clientData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axiosInstance.put(API_URL + clientId, clientData, config);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Server is not responding.');
    }
    if (!error.response) {
      throw new Error('Network error. Could not connect to the server.');
    }
    throw error;
  }
};

// Delete client
const deleteClient = async (clientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axiosInstance.delete(API_URL + clientId, config);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Server is not responding.');
    }
    if (!error.response) {
      throw new Error('Network error. Could not connect to the server.');
    }
    throw error;
  }
};

const clientService = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
};

export default clientService; 