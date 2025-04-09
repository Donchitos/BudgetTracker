import axios from 'axios';

// Create axios instance with base URL from environment variables
// Log baseURL configuration
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API Base URL configured as:', baseUrl);

const api = axios.create({
  baseURL: baseUrl + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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
      
      // Redirect to login if needed
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;