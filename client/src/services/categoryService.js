import api from './api';

/**
 * Service for category related API calls
 */
const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} - Promise with categories data
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Get a single category by ID
   * @param {string} id - Category ID
   * @returns {Promise} - Promise with category data
   */
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name
   * @param {string} categoryData.color - Category color (hex)
   * @param {string} categoryData.icon - Category icon name
   * @param {number} categoryData.budget - Category budget amount
   * @returns {Promise} - Promise with created category data
   */
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} - Promise with updated category data
   */
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise} - Promise with success status
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;