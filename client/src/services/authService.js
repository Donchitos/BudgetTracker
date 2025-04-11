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
    console.log('authService - Sending registration request to:', '/auth/register');
    try {
      const response = await api.post('/auth/register', userData);
      console.log('authService - Registration response:', response.data);
      // Don't store token in localStorage directly after registration
      // Let users explicitly log in after registering
      return response.data;
    } catch (error) {
      console.error('authService - Registration error:', error);
      throw error;
    }
  },

  /**
   * Login a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Promise with user data and token
   */
  login: async (email, password) => {
    console.log('authService - Sending login request to:', '/auth/login');
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
    console.log('authService - Sending get user request to:', '/auth/me');
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