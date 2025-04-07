import {
  GET_SAVINGS_GOALS,
  GET_SAVINGS_GOAL,
  ADD_SAVINGS_GOAL,
  UPDATE_SAVINGS_GOAL,
  DELETE_SAVINGS_GOAL,
  ADD_CONTRIBUTION,
  GET_SAVINGS_SUMMARY,
  SAVINGS_ERROR,
  CLEAR_SAVINGS_GOALS
} from '../types';

import savingsService from '../../services/savingsService';

/**
 * Get all savings goals with optional filtering
 * @param {Object} params - Optional parameters for filtering
 */
export const getSavingsGoals = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: CLEAR_SAVINGS_GOALS });
    
    const res = await savingsService.getSavingsGoals(params);
    
    dispatch({
      type: GET_SAVINGS_GOALS,
      payload: res
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch savings goals'
    });
    
    throw err;
  }
};

/**
 * Get a single savings goal by ID
 * @param {string} id - Savings goal ID
 */
export const getSavingsGoal = (id) => async (dispatch) => {
  try {
    const res = await savingsService.getSavingsGoal(id);
    
    dispatch({
      type: GET_SAVINGS_GOAL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch savings goal'
    });
    
    throw err;
  }
};

/**
 * Create a new savings goal
 * @param {Object} goalData - Savings goal data
 */
export const addSavingsGoal = (goalData) => async (dispatch) => {
  try {
    const res = await savingsService.createSavingsGoal(goalData);
    
    dispatch({
      type: ADD_SAVINGS_GOAL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to create savings goal'
    });
    
    throw err;
  }
};

/**
 * Update a savings goal
 * @param {string} id - Savings goal ID
 * @param {Object} goalData - Updated savings goal data
 */
export const updateSavingsGoal = (id, goalData) => async (dispatch) => {
  try {
    const res = await savingsService.updateSavingsGoal(id, goalData);
    
    dispatch({
      type: UPDATE_SAVINGS_GOAL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to update savings goal'
    });
    
    throw err;
  }
};

/**
 * Delete a savings goal
 * @param {string} id - Savings goal ID
 */
export const deleteSavingsGoal = (id) => async (dispatch) => {
  try {
    await savingsService.deleteSavingsGoal(id);
    
    dispatch({
      type: DELETE_SAVINGS_GOAL,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to delete savings goal'
    });
    
    throw err;
  }
};

/**
 * Add a contribution to a savings goal
 * @param {string} id - Savings goal ID
 * @param {Object} contributionData - Contribution data
 */
export const addContribution = (id, contributionData) => async (dispatch) => {
  try {
    const res = await savingsService.addContribution(id, contributionData);
    
    dispatch({
      type: ADD_CONTRIBUTION,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to add contribution'
    });
    
    throw err;
  }
};

/**
 * Get savings summary data
 */
export const getSavingsSummary = () => async (dispatch) => {
  try {
    const res = await savingsService.getSavingsSummary();
    
    dispatch({
      type: GET_SAVINGS_SUMMARY,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: SAVINGS_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch savings summary'
    });
    
    throw err;
  }
};