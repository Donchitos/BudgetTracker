import api from './api';

/**
 * Service for authentication related API calls
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise} - Promise with user data and token
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Login a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Promise with user data and token
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Logout a user
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    // Optional: call backend to invalidate token on server
    // await api.get('/auth/logout');
  },

  /**
   * Get current user data
   * @returns {Promise} - Promise with user data
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has a token
   */
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService;