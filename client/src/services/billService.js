import api from './api';

/**
 * Service for bill related API calls
 */
const billService = {
  /**
   * Get all bills with optional filtering
   * @param {Object} params - Optional parameters for filtering
   * @returns {Promise} - Promise with bills data
   */
  getBills: async (params = {}) => {
    const response = await api.get('/bills', { params });
    return response.data;
  },

  /**
   * Get a single bill by ID
   * @param {string} id - Bill ID
   * @returns {Promise} - Promise with bill data
   */
  getBill: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  /**
   * Create a new bill
   * @param {Object} billData - Bill data
   * @returns {Promise} - Promise with created bill data
   */
  createBill: async (billData) => {
    const response = await api.post('/bills', billData);
    return response.data;
  },

  /**
   * Update a bill
   * @param {string} id - Bill ID
   * @param {Object} billData - Updated bill data
   * @returns {Promise} - Promise with updated bill data
   */
  updateBill: async (id, billData) => {
    const response = await api.put(`/bills/${id}`, billData);
    return response.data;
  },

  /**
   * Delete a bill
   * @param {string} id - Bill ID
   * @returns {Promise} - Promise with success status
   */
  deleteBill: async (id) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },

  /**
   * Mark a bill as paid
   * @param {string} id - Bill ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - Promise with updated bill data
   */
  markBillAsPaid: async (id, paymentData = {}) => {
    const response = await api.put(`/bills/${id}/pay`, paymentData);
    return response.data;
  },

  /**
   * Get upcoming bills (due in the next X days)
   * @param {number} days - Number of days to look ahead
   * @returns {Promise} - Promise with upcoming bills data
   */
  getUpcomingBills: async (days = 7) => {
    const response = await api.get('/bills/upcoming', { params: { days } });
    return response.data;
  },

  /**
   * Get overdue bills
   * @returns {Promise} - Promise with overdue bills data
   */
  getOverdueBills: async () => {
    const response = await api.get('/bills/overdue');
    return response.data;
  }
};

export default billService;