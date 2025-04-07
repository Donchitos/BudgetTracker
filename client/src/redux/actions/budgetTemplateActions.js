import {
  GET_BUDGET_TEMPLATES,
  GET_BUDGET_TEMPLATE,
  ADD_BUDGET_TEMPLATE,
  UPDATE_BUDGET_TEMPLATE,
  DELETE_BUDGET_TEMPLATE,
  GET_DEFAULT_TEMPLATE,
  APPLY_TEMPLATE,
  TEMPLATE_ERROR,
  CLEAR_TEMPLATES
} from '../types';

import budgetTemplateService from '../../services/budgetTemplateService';

/**
 * Get all budget templates
 * @param {Object} params - Optional parameters for filtering
 */
export const getBudgetTemplates = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: CLEAR_TEMPLATES });
    
    const res = await budgetTemplateService.getBudgetTemplates(params);
    
    dispatch({
      type: GET_BUDGET_TEMPLATES,
      payload: res
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch budget templates'
    });
    
    throw err;
  }
};

/**
 * Get a single budget template by ID
 * @param {string} id - Budget template ID
 */
export const getBudgetTemplate = (id) => async (dispatch) => {
  try {
    const res = await budgetTemplateService.getBudgetTemplate(id);
    
    dispatch({
      type: GET_BUDGET_TEMPLATE,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch budget template'
    });
    
    throw err;
  }
};

/**
 * Create a new budget template
 * @param {Object} templateData - Budget template data
 */
export const addBudgetTemplate = (templateData) => async (dispatch) => {
  try {
    const res = await budgetTemplateService.createBudgetTemplate(templateData);
    
    dispatch({
      type: ADD_BUDGET_TEMPLATE,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to create budget template'
    });
    
    throw err;
  }
};

/**
 * Update a budget template
 * @param {string} id - Budget template ID
 * @param {Object} templateData - Updated template data
 */
export const updateBudgetTemplate = (id, templateData) => async (dispatch) => {
  try {
    const res = await budgetTemplateService.updateBudgetTemplate(id, templateData);
    
    dispatch({
      type: UPDATE_BUDGET_TEMPLATE,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to update budget template'
    });
    
    throw err;
  }
};

/**
 * Delete a budget template
 * @param {string} id - Budget template ID
 */
export const deleteBudgetTemplate = (id) => async (dispatch) => {
  try {
    await budgetTemplateService.deleteBudgetTemplate(id);
    
    dispatch({
      type: DELETE_BUDGET_TEMPLATE,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to delete budget template'
    });
    
    throw err;
  }
};

/**
 * Get default budget template
 */
export const getDefaultTemplate = () => async (dispatch) => {
  try {
    const res = await budgetTemplateService.getDefaultTemplate();
    
    dispatch({
      type: GET_DEFAULT_TEMPLATE,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch default budget template'
    });
    
    throw err;
  }
};

/**
 * Apply budget template to categories
 * @param {string} id - Budget template ID
 */
export const applyBudgetTemplate = (id) => async (dispatch) => {
  try {
    const res = await budgetTemplateService.applyBudgetTemplate(id);
    
    dispatch({
      type: APPLY_TEMPLATE,
      payload: { id, message: res.message }
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: TEMPLATE_ERROR,
      payload: err.response?.data?.message || 'Failed to apply budget template'
    });
    
    throw err;
  }
};