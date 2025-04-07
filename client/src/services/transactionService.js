import api from './api';

/**
 * Service for transaction related API calls
 */
const transactionService = {
  /**
   * Get all transactions with optional filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.type - Filter by transaction type (income/expense)
   * @param {string} filters.category - Filter by category ID
   * @param {string} filters.startDate - Filter by start date
   * @param {string} filters.endDate - Filter by end date
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.limit - Items per page for pagination
   * @param {string} filters.sortBy - Sort field and direction (e.g. 'date:desc')
   * @returns {Promise} - Promise with transactions data
   */
  getTransactions: async (filters = {}) => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  /**
   * Get a single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise} - Promise with transaction data
   */
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @param {string} transactionData.description - Transaction description
   * @param {number} transactionData.amount - Transaction amount
   * @param {string} transactionData.type - Transaction type (income/expense)
   * @param {string} transactionData.date - Transaction date
   * @param {string} transactionData.category - Category ID (required for expenses)
   * @param {string} transactionData.notes - Optional notes
   * @returns {Promise} - Promise with created transaction data
   */
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  /**
   * Update a transaction
   * @param {string} id - Transaction ID
   * @param {Object} transactionData - Updated transaction data
   * @returns {Promise} - Promise with updated transaction data
   */
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise} - Promise with success status
   */
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Get transaction statistics
   * @param {Object} filters - Optional filters
   * @param {string} filters.startDate - Filter by start date
   * @param {string} filters.endDate - Filter by end date
   * @returns {Promise} - Promise with transaction statistics
   */
  getTransactionStats: async (filters = {}) => {
    const response = await api.get('/transactions/stats', { params: filters });
    return response.data;
  }
};

export default transactionService;