import api from './api';

/**
 * Service for dashboard related API calls
 */
const dashboardService = {
  /**
   * Get dashboard summary data (income, expenses, balance, recent transactions)
   * @param {Object} params - Optional parameters
   * @param {string} params.startDate - Start date for period
   * @param {string} params.endDate - End date for period
   * @returns {Promise} - Promise with dashboard summary data
   */
  getDashboardSummary: async (params = {}) => {
    const response = await api.get('/dashboard/summary', { params });
    return response.data;
  },

  /**
   * Get expense breakdown by category
   * @param {Object} params - Optional parameters
   * @param {string} params.startDate - Start date for period
   * @param {string} params.endDate - End date for period
   * @returns {Promise} - Promise with expense breakdown data
   */
  getExpenseBreakdown: async (params = {}) => {
    const response = await api.get('/dashboard/expense-breakdown', { params });
    return response.data;
  },

  /**
   * Get budget vs actual comparison by category
   * @param {Object} params - Optional parameters
   * @param {string} params.startDate - Start date for period
   * @param {string} params.endDate - End date for period
   * @returns {Promise} - Promise with budget vs actual data
   */
  getBudgetVsActual: async (params = {}) => {
    const response = await api.get('/dashboard/budget-actual', { params });
    return response.data;
  },

  /**
   * Get spending trends over time
   * @param {Object} params - Optional parameters
   * @param {string} params.startDate - Start date for period
   * @param {string} params.endDate - End date for period
   * @returns {Promise} - Promise with spending trends data
   */
  getSpendingTrends: async (params = {}) => {
    const response = await api.get('/dashboard/spending-trends', { params });
    return response.data;
  }
};

export default dashboardService;