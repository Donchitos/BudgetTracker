import { 
  GET_RECURRING_TRANSACTIONS,
  GET_RECURRING_TRANSACTIONS_SUCCESS,
  GET_RECURRING_TRANSACTIONS_FAIL,
  GET_RECURRING_TRANSACTION,
  GET_RECURRING_TRANSACTION_SUCCESS,
  GET_RECURRING_TRANSACTION_FAIL,
  CREATE_RECURRING_TRANSACTION,
  CREATE_RECURRING_TRANSACTION_SUCCESS,
  CREATE_RECURRING_TRANSACTION_FAIL,
  UPDATE_RECURRING_TRANSACTION,
  UPDATE_RECURRING_TRANSACTION_SUCCESS,
  UPDATE_RECURRING_TRANSACTION_FAIL,
  DELETE_RECURRING_TRANSACTION,
  DELETE_RECURRING_TRANSACTION_SUCCESS,
  DELETE_RECURRING_TRANSACTION_FAIL,
  TOGGLE_RECURRING_TRANSACTION,
  TOGGLE_RECURRING_TRANSACTION_SUCCESS,
  TOGGLE_RECURRING_TRANSACTION_FAIL,
  GENERATE_TRANSACTIONS,
  GENERATE_TRANSACTIONS_SUCCESS,
  GENERATE_TRANSACTIONS_FAIL,
  CLEAR_RECURRING_TRANSACTION_ERROR
} from '../types';
import api from '../../services/api';

/**
 * Get all recurring transactions
 * @param {Object} params - Query parameters
 * @returns {Function} - Redux thunk function
 */
export const getRecurringTransactions = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_RECURRING_TRANSACTIONS });
    
    const response = await api.get('/recurring-transactions', { params });
    
    dispatch({
      type: GET_RECURRING_TRANSACTIONS_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_RECURRING_TRANSACTIONS_FAIL,
      payload: err.response?.data?.message || 'Error fetching recurring transactions'
    });
  }
};

/**
 * Get a single recurring transaction by ID
 * @param {string} id - Recurring transaction ID
 * @returns {Function} - Redux thunk function
 */
export const getRecurringTransaction = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_RECURRING_TRANSACTION });
    
    const response = await api.get(`/recurring-transactions/${id}`);
    
    dispatch({
      type: GET_RECURRING_TRANSACTION_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_RECURRING_TRANSACTION_FAIL,
      payload: err.response?.data?.message || 'Error fetching recurring transaction'
    });
  }
};

/**
 * Create a new recurring transaction
 * @param {Object} transactionData - Recurring transaction data
 * @returns {Function} - Redux thunk function
 */
export const createRecurringTransaction = (transactionData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_RECURRING_TRANSACTION });
    
    const response = await api.post('/recurring-transactions', transactionData);
    
    dispatch({
      type: CREATE_RECURRING_TRANSACTION_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: CREATE_RECURRING_TRANSACTION_FAIL,
      payload: err.response?.data?.message || 'Error creating recurring transaction'
    });
    
    throw err;
  }
};

/**
 * Update an existing recurring transaction
 * @param {string} id - Recurring transaction ID
 * @param {Object} transactionData - Updated transaction data
 * @returns {Function} - Redux thunk function
 */
export const updateRecurringTransaction = (id, transactionData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_RECURRING_TRANSACTION });
    
    const response = await api.put(`/recurring-transactions/${id}`, transactionData);
    
    dispatch({
      type: UPDATE_RECURRING_TRANSACTION_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: UPDATE_RECURRING_TRANSACTION_FAIL,
      payload: err.response?.data?.message || 'Error updating recurring transaction'
    });
    
    throw err;
  }
};

/**
 * Delete a recurring transaction
 * @param {string} id - Recurring transaction ID
 * @returns {Function} - Redux thunk function
 */
export const deleteRecurringTransaction = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_RECURRING_TRANSACTION });
    
    await api.delete(`/recurring-transactions/${id}`);
    
    dispatch({
      type: DELETE_RECURRING_TRANSACTION_SUCCESS,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: DELETE_RECURRING_TRANSACTION_FAIL,
      payload: err.response?.data?.message || 'Error deleting recurring transaction'
    });
    
    throw err;
  }
};

/**
 * Toggle a recurring transaction's active status
 * @param {string} id - Recurring transaction ID
 * @returns {Function} - Redux thunk function
 */
export const toggleRecurringTransaction = (id) => async (dispatch) => {
  try {
    dispatch({ type: TOGGLE_RECURRING_TRANSACTION });
    
    const response = await api.put(`/recurring-transactions/${id}/toggle`);
    
    dispatch({
      type: TOGGLE_RECURRING_TRANSACTION_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: TOGGLE_RECURRING_TRANSACTION_FAIL,
      payload: err.response?.data?.message || 'Error toggling recurring transaction'
    });
    
    throw err;
  }
};

/**
 * Generate transactions from recurring transactions
 * @param {Object} options - Generation options (until, recurringTransactionId)
 * @returns {Function} - Redux thunk function
 */
export const generateTransactions = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GENERATE_TRANSACTIONS });
    
    const response = await api.post('/recurring-transactions/generate', options);
    
    dispatch({
      type: GENERATE_TRANSACTIONS_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: GENERATE_TRANSACTIONS_FAIL,
      payload: err.response?.data?.message || 'Error generating transactions'
    });
    
    throw err;
  }
};

/**
 * Clear recurring transaction errors
 * @returns {Object} - Action object
 */
export const clearRecurringTransactionError = () => ({
  type: CLEAR_RECURRING_TRANSACTION_ERROR
});