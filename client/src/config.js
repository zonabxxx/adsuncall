// Global configuration
const config = {
  // Base API URL - when in development, use direct server URL
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? '' // Empty for production - will use relative paths with proxy
    : 'http://localhost:5001',
  
  // Returns full API path based on environment
  getApiUrl: (path) => {
    return `${config.apiBaseUrl}${path}`; 
  }
};

export default config; 