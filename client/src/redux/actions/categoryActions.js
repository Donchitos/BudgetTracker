import {
  GET_CATEGORIES,
  ADD_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  CATEGORY_ERROR,
  CLEAR_CATEGORIES
} from '../types';

import categoryService from '../../services/categoryService';

/**
 * Get all categories
 */
export const getCategories = () => async (dispatch) => {
  try {
    dispatch({ type: CLEAR_CATEGORIES });
    
    const res = await categoryService.getCategories();
    
    dispatch({
      type: GET_CATEGORIES,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch categories'
    });
  }
};

/**
 * Add a new category
 * @param {Object} categoryData - Category data to create
 */
export const addCategory = (categoryData) => async (dispatch) => {
  try {
    const res = await categoryService.createCategory(categoryData);
    
    dispatch({
      type: ADD_CATEGORY,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: err.response?.data?.message || 'Failed to create category'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to create category');
  }
};

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 */
export const updateCategory = (id, categoryData) => async (dispatch) => {
  try {
    const res = await categoryService.updateCategory(id, categoryData);
    
    dispatch({
      type: UPDATE_CATEGORY,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: err.response?.data?.message || 'Failed to update category'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to update category');
  }
};

/**
 * Delete a category
 * @param {string} id - Category ID to delete
 */
export const deleteCategory = (id) => async (dispatch) => {
  try {
    await categoryService.deleteCategory(id);
    
    dispatch({
      type: DELETE_CATEGORY,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: CATEGORY_ERROR,
      payload: err.response?.data?.message || 'Failed to delete category'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to delete category');
  }
};