import {
  GET_SAVINGS_GOALS,
  GET_SAVINGS_GOALS_SUCCESS,
  GET_SAVINGS_GOALS_FAIL,
  GET_SAVINGS_GOAL,
  GET_SAVINGS_GOAL_SUCCESS,
  GET_SAVINGS_GOAL_FAIL,
  CREATE_SAVINGS_GOAL,
  CREATE_SAVINGS_GOAL_SUCCESS,
  CREATE_SAVINGS_GOAL_FAIL,
  UPDATE_SAVINGS_GOAL,
  UPDATE_SAVINGS_GOAL_SUCCESS,
  UPDATE_SAVINGS_GOAL_FAIL,
  DELETE_SAVINGS_GOAL,
  DELETE_SAVINGS_GOAL_SUCCESS,
  DELETE_SAVINGS_GOAL_FAIL,
  ADD_CONTRIBUTION,
  ADD_CONTRIBUTION_SUCCESS,
  ADD_CONTRIBUTION_FAIL,
  COMPLETE_SAVINGS_GOAL,
  COMPLETE_SAVINGS_GOAL_SUCCESS,
  COMPLETE_SAVINGS_GOAL_FAIL,
  GET_SAVINGS_STATS,
  GET_SAVINGS_STATS_SUCCESS,
  GET_SAVINGS_STATS_FAIL,
  CLEAR_SAVINGS_GOAL_ERROR
} from '../types';
import api from '../../services/api';

/**
 * Get all savings goals
 * @param {Object} params - Query parameters (optional)
 * @returns {Function} - Redux thunk function
 */
export const getSavingsGoals = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_SAVINGS_GOALS });
    
    const response = await api.get('/savings', { params });
    
    dispatch({
      type: GET_SAVINGS_GOALS_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_SAVINGS_GOALS_FAIL,
      payload: err.response?.data?.message || 'Error fetching savings goals'
    });
  }
};

/**
 * Get a single savings goal by ID
 * @param {string} id - Savings goal ID
 * @returns {Function} - Redux thunk function
 */
export const getSavingsGoal = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_SAVINGS_GOAL });
    
    const response = await api.get(`/savings/${id}`);
    
    dispatch({
      type: GET_SAVINGS_GOAL_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_SAVINGS_GOAL_FAIL,
      payload: err.response?.data?.message || 'Error fetching savings goal'
    });
  }
};

/**
 * Create a new savings goal
 * @param {Object} goalData - Savings goal data
 * @returns {Function} - Redux thunk function
 */
export const createSavingsGoal = (goalData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_SAVINGS_GOAL });
    
    const response = await api.post('/savings', goalData);
    
    dispatch({
      type: CREATE_SAVINGS_GOAL_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: CREATE_SAVINGS_GOAL_FAIL,
      payload: err.response?.data?.message || 'Error creating savings goal'
    });
    
    throw err;
  }
};

/**
 * Update an existing savings goal
 * @param {string} id - Savings goal ID
 * @param {Object} goalData - Updated goal data
 * @returns {Function} - Redux thunk function
 */
export const updateSavingsGoal = (id, goalData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_SAVINGS_GOAL });
    
    const response = await api.put(`/savings/${id}`, goalData);
    
    dispatch({
      type: UPDATE_SAVINGS_GOAL_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: UPDATE_SAVINGS_GOAL_FAIL,
      payload: err.response?.data?.message || 'Error updating savings goal'
    });
    
    throw err;
  }
};

/**
 * Delete a savings goal
 * @param {string} id - Savings goal ID
 * @returns {Function} - Redux thunk function
 */
export const deleteSavingsGoal = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_SAVINGS_GOAL });
    
    await api.delete(`/savings/${id}`);
    
    dispatch({
      type: DELETE_SAVINGS_GOAL_SUCCESS,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: DELETE_SAVINGS_GOAL_FAIL,
      payload: err.response?.data?.message || 'Error deleting savings goal'
    });
    
    throw err;
  }
};

/**
 * Add a contribution to a savings goal
 * @param {string} id - Savings goal ID
 * @param {Object} contributionData - Contribution data (amount, notes)
 * @returns {Function} - Redux thunk function
 */
export const addContribution = (id, contributionData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_CONTRIBUTION });
    
    const response = await api.post(`/savings/${id}/contributions`, contributionData);
    
    dispatch({
      type: ADD_CONTRIBUTION_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: ADD_CONTRIBUTION_FAIL,
      payload: err.response?.data?.message || 'Error adding contribution'
    });
    
    throw err;
  }
};

/**
 * Change savings goal status (complete/cancel)
 * @param {string} id - Savings goal ID
 * @param {string} status - New status (completed, cancelled, in_progress)
 * @returns {Function} - Redux thunk function
 */
export const changeSavingsGoalStatus = (id, status) => async (dispatch) => {
  try {
    dispatch({ type: COMPLETE_SAVINGS_GOAL });
    
    const response = await api.put(`/savings/${id}/status`, { status });
    
    dispatch({
      type: COMPLETE_SAVINGS_GOAL_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: COMPLETE_SAVINGS_GOAL_FAIL,
      payload: err.response?.data?.message || 'Error changing savings goal status'
    });
    
    throw err;
  }
};

/**
 * Get savings goals statistics
 * @returns {Function} - Redux thunk function
 */
export const getSavingsStats = () => async (dispatch) => {
  try {
    dispatch({ type: GET_SAVINGS_STATS });
    
    const response = await api.get('/savings/stats');
    
    dispatch({
      type: GET_SAVINGS_STATS_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_SAVINGS_STATS_FAIL,
      payload: err.response?.data?.message || 'Error fetching savings statistics'
    });
  }
};

/**
 * Clear savings goal errors
 * @returns {Object} - Action object
 */
export const clearSavingsGoalError = () => ({
  type: CLEAR_SAVINGS_GOAL_ERROR
});