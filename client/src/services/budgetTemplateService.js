import api from './api';

/**
 * Service for budget template related API calls
 */
const budgetTemplateService = {
  /**
   * Get all budget templates
   * @param {Object} params - Optional parameters for filtering
   * @returns {Promise} - Promise with templates data
   */
  getBudgetTemplates: async (params = {}) => {
    const response = await api.get('/budget-templates', { params });
    return response.data;
  },

  /**
   * Get a single budget template by ID
   * @param {string} id - Budget template ID
   * @returns {Promise} - Promise with template data
   */
  getBudgetTemplate: async (id) => {
    const response = await api.get(`/budget-templates/${id}`);
    return response.data;
  },

  /**
   * Create a new budget template
   * @param {Object} templateData - Budget template data
   * @returns {Promise} - Promise with created template data
   */
  createBudgetTemplate: async (templateData) => {
    const response = await api.post('/budget-templates', templateData);
    return response.data;
  },

  /**
   * Update a budget template
   * @param {string} id - Budget template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise} - Promise with updated template data
   */
  updateBudgetTemplate: async (id, templateData) => {
    const response = await api.put(`/budget-templates/${id}`, templateData);
    return response.data;
  },

  /**
   * Delete a budget template
   * @param {string} id - Budget template ID
   * @returns {Promise} - Promise with success status
   */
  deleteBudgetTemplate: async (id) => {
    const response = await api.delete(`/budget-templates/${id}`);
    return response.data;
  },

  /**
   * Get default budget template
   * @returns {Promise} - Promise with default template data
   */
  getDefaultTemplate: async () => {
    const response = await api.get('/budget-templates/default');
    return response.data;
  },

  /**
   * Apply budget template to categories
   * @param {string} id - Budget template ID
   * @returns {Promise} - Promise with success status
   */
  applyBudgetTemplate: async (id) => {
    const response = await api.post(`/budget-templates/${id}/apply`);
    return response.data;
  }
};

export default budgetTemplateService;