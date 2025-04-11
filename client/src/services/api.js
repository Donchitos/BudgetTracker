import axios from 'axios';

// Create axios instance with base URL from environment variables
// Log baseURL configuration
// Remove any trailing '/api' to avoid duplication
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Strip any trailing slash for consistency
const cleanBaseUrl = baseUrl.endsWith('/api')
  ? baseUrl
  : baseUrl + '/api';
console.log('API Base URL configured as:', cleanBaseUrl);

// The actual value used by axios is baseUrl without /api
// The /api prefix will be added by the route-specific methods
const api = axios.create({
  baseURL: cleanBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('Actual axios baseURL:', api.defaults.baseURL);

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.config?.url, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Clear auth state if token is invalid or expired
      localStorage.removeItem('token');
      
      // Don't forcibly redirect - let Redux auth state and React Router handle redirections
      // This prevents redirect loops when the app is initializing
    }
    
    return Promise.reject(error);
  }
);

export default api;