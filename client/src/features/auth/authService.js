import axios from 'axios';
import config from '../../config';

const API_PATH = '/api/users/';

// Register user
const register = async (userData) => {
  const response = await axios.post(config.getApiUrl(API_PATH), userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(config.getApiUrl(API_PATH + 'login'), userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  register,
  login,
  logout,
};

export default authService; 