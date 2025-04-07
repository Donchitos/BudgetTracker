import api from './api';

/**
 * Service for savings goal related API calls
 */
const savingsService = {
  /**
   * Get all savings goals with optional filtering
   * @param {Object} params - Optional parameters for filtering
   * @returns {Promise} - Promise with savings goals data
   */
  getSavingsGoals: async (params = {}) => {
    const response = await api.get('/savings', { params });
    return response.data;
  },

  /**
   * Get a single savings goal by ID
   * @param {string} id - Savings goal ID
   * @returns {Promise} - Promise with savings goal data
   */
  getSavingsGoal: async (id) => {
    const response = await api.get(`/savings/${id}`);
    return response.data;
  },

  /**
   * Create a new savings goal
   * @param {Object} goalData - Savings goal data
   * @returns {Promise} - Promise with created savings goal data
   */
  createSavingsGoal: async (goalData) => {
    const response = await api.post('/savings', goalData);
    return response.data;
  },

  /**
   * Update a savings goal
   * @param {string} id - Savings goal ID
   * @param {Object} goalData - Updated savings goal data
   * @returns {Promise} - Promise with updated savings goal data
   */
  updateSavingsGoal: async (id, goalData) => {
    const response = await api.put(`/savings/${id}`, goalData);
    return response.data;
  },

  /**
   * Delete a savings goal
   * @param {string} id - Savings goal ID
   * @returns {Promise} - Promise with success status
   */
  deleteSavingsGoal: async (id) => {
    const response = await api.delete(`/savings/${id}`);
    return response.data;
  },

  /**
   * Add a contribution to a savings goal
   * @param {string} id - Savings goal ID
   * @param {Object} contributionData - Contribution data
   * @param {number} contributionData.amount - Contribution amount
   * @param {string} contributionData.notes - Optional notes for the contribution
   * @returns {Promise} - Promise with updated savings goal data
   */
  addContribution: async (id, contributionData) => {
    const response = await api.post(`/savings/${id}/contribute`, contributionData);
    return response.data;
  },

  /**
   * Get savings summary data
   * @returns {Promise} - Promise with savings summary data
   */
  getSavingsSummary: async () => {
    const response = await api.get('/savings/summary');
    return response.data;
  }
};

export default savingsService;