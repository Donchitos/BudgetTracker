import {
  GET_TRANSACTIONS,
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  DELETE_TRANSACTION,
  TRANSACTION_ERROR,
  CLEAR_TRANSACTIONS
} from '../types';

import transactionService from '../../services/transactionService';

/**
 * Get all transactions with optional filtering
 * @param {Object} filters - Optional filters for transactions
 */
export const getTransactions = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: CLEAR_TRANSACTIONS });
    
    const res = await transactionService.getTransactions(filters);
    
    dispatch({
      type: GET_TRANSACTIONS,
      payload: res
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: TRANSACTION_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch transactions'
    });
  }
};

/**
 * Add a new transaction
 * @param {Object} transactionData - Transaction data to create
 */
export const addTransaction = (transactionData) => async (dispatch) => {
  try {
    const res = await transactionService.createTransaction(transactionData);
    
    dispatch({
      type: ADD_TRANSACTION,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: TRANSACTION_ERROR,
      payload: err.response?.data?.message || 'Failed to create transaction'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to create transaction');
  }
};

/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Object} transactionData - Updated transaction data
 */
export const updateTransaction = (id, transactionData) => async (dispatch) => {
  try {
    const res = await transactionService.updateTransaction(id, transactionData);
    
    dispatch({
      type: UPDATE_TRANSACTION,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: TRANSACTION_ERROR,
      payload: err.response?.data?.message || 'Failed to update transaction'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to update transaction');
  }
};

/**
 * Delete a transaction
 * @param {string} id - Transaction ID to delete
 */
export const deleteTransaction = (id) => async (dispatch) => {
  try {
    await transactionService.deleteTransaction(id);
    
    dispatch({
      type: DELETE_TRANSACTION,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: TRANSACTION_ERROR,
      payload: err.response?.data?.message || 'Failed to delete transaction'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to delete transaction');
  }
};

/**
 * Get transaction statistics
 * @param {Object} filters - Optional filters
 */
export const getTransactionStats = async (filters = {}) => {
  try {
    const res = await transactionService.getTransactionStats(filters);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch transaction statistics');
  }
};