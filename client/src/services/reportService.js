import api from './api';

/**
 * Service for report related API calls
 */
const reportService = {
  /**
   * Get income and expense report
   * @param {Object} params - Report parameters
   * @param {string} params.startDate - Start date in YYYY-MM-DD format
   * @param {string} params.endDate - End date in YYYY-MM-DD format
   * @param {string} params.format - Response format (json or csv)
   * @returns {Promise} - Promise with report data
   */
  getIncomeExpenseReport: async (params = {}) => {
    // For CSV format, use responseType blob
    if (params.format === 'csv') {
      const response = await api.get('/reports/income-expense', { 
        params,
        responseType: 'blob' 
      });
      return response;
    }
    
    const response = await api.get('/reports/income-expense', { params });
    return response.data;
  },

  /**
   * Get budget report (budget vs actual spending)
   * @param {Object} params - Report parameters
   * @param {string} params.startDate - Start date in YYYY-MM-DD format
   * @param {string} params.endDate - End date in YYYY-MM-DD format
   * @param {string} params.format - Response format (json or csv)
   * @returns {Promise} - Promise with report data
   */
  getBudgetReport: async (params = {}) => {
    // For CSV format, use responseType blob
    if (params.format === 'csv') {
      const response = await api.get('/reports/budget', { 
        params,
        responseType: 'blob' 
      });
      return response;
    }
    
    const response = await api.get('/reports/budget', { params });
    return response.data;
  },

  /**
   * Get savings goals report
   * @param {Object} params - Report parameters
   * @param {string} params.format - Response format (json or csv)
   * @returns {Promise} - Promise with report data
   */
  getSavingsReport: async (params = {}) => {
    // For CSV format, use responseType blob
    if (params.format === 'csv') {
      const response = await api.get('/reports/savings', { 
        params,
        responseType: 'blob' 
      });
      return response;
    }
    
    const response = await api.get('/reports/savings', { params });
    return response.data;
  },

  /**
   * Get bills report
   * @param {Object} params - Report parameters
   * @param {string} params.format - Response format (json or csv)
   * @returns {Promise} - Promise with report data
   */
  getBillsReport: async (params = {}) => {
    // For CSV format, use responseType blob
    if (params.format === 'csv') {
      const response = await api.get('/reports/bills', { 
        params,
        responseType: 'blob' 
      });
      return response;
    }
    
    const response = await api.get('/reports/bills', { params });
    return response.data;
  },

  /**
   * Get full financial report
   * @param {Object} params - Report parameters
   * @param {string} params.startDate - Start date in YYYY-MM-DD format
   * @param {string} params.endDate - End date in YYYY-MM-DD format
   * @param {string} params.format - Response format (json or csv)
   * @returns {Promise} - Promise with report data
   */
  getFullReport: async (params = {}) => {
    // For CSV format, use responseType blob
    if (params.format === 'csv') {
      const response = await api.get('/reports/all', { 
        params,
        responseType: 'blob' 
      });
      return response;
    }
    
    const response = await api.get('/reports/all', { params });
    return response.data;
  },

  /**
   * Helper to download a blob as a file
   * @param {Blob} blob - The blob data to download
   * @param {string} filename - Name for the downloaded file
   */
  downloadBlob: (blob, filename) => {
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    
    // Append to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default reportService;