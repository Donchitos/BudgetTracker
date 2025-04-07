import {
  GET_BILLS,
  GET_BILLS_SUCCESS,
  GET_BILLS_FAIL,
  GET_BILL,
  GET_BILL_SUCCESS,
  GET_BILL_FAIL,
  CREATE_BILL,
  CREATE_BILL_SUCCESS,
  CREATE_BILL_FAIL,
  UPDATE_BILL,
  UPDATE_BILL_SUCCESS,
  UPDATE_BILL_FAIL,
  DELETE_BILL,
  DELETE_BILL_SUCCESS,
  DELETE_BILL_FAIL,
  MARK_BILL_PAID,
  MARK_BILL_PAID_SUCCESS,
  MARK_BILL_PAID_FAIL,
  GET_UPCOMING_BILLS,
  GET_UPCOMING_BILLS_SUCCESS,
  GET_UPCOMING_BILLS_FAIL,
  GET_BILL_STATS,
  GET_BILL_STATS_SUCCESS,
  GET_BILL_STATS_FAIL,
  CLEAR_BILL_ERROR
} from '../types';
import api from '../../services/api';

/**
 * Get all bills
 * @param {Object} params - Query parameters (optional)
 * @returns {Function} - Redux thunk function
 */
export const getBills = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_BILLS });
    
    const response = await api.get('/bills', { params });
    
    dispatch({
      type: GET_BILLS_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_BILLS_FAIL,
      payload: err.response?.data?.message || 'Error fetching bills'
    });
  }
};

/**
 * Get a single bill by ID
 * @param {string} id - Bill ID
 * @returns {Function} - Redux thunk function
 */
export const getBill = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_BILL });
    
    const response = await api.get(`/bills/${id}`);
    
    dispatch({
      type: GET_BILL_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_BILL_FAIL,
      payload: err.response?.data?.message || 'Error fetching bill'
    });
  }
};

/**
 * Create a new bill
 * @param {Object} billData - Bill data
 * @returns {Function} - Redux thunk function
 */
export const createBill = (billData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_BILL });
    
    const response = await api.post('/bills', billData);
    
    dispatch({
      type: CREATE_BILL_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: CREATE_BILL_FAIL,
      payload: err.response?.data?.message || 'Error creating bill'
    });
    
    throw err;
  }
};

/**
 * Update an existing bill
 * @param {string} id - Bill ID
 * @param {Object} billData - Updated bill data
 * @returns {Function} - Redux thunk function
 */
export const updateBill = (id, billData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_BILL });
    
    const response = await api.put(`/bills/${id}`, billData);
    
    dispatch({
      type: UPDATE_BILL_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: UPDATE_BILL_FAIL,
      payload: err.response?.data?.message || 'Error updating bill'
    });
    
    throw err;
  }
};

/**
 * Delete a bill
 * @param {string} id - Bill ID
 * @returns {Function} - Redux thunk function
 */
export const deleteBill = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_BILL });
    
    await api.delete(`/bills/${id}`);
    
    dispatch({
      type: DELETE_BILL_SUCCESS,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: DELETE_BILL_FAIL,
      payload: err.response?.data?.message || 'Error deleting bill'
    });
    
    throw err;
  }
};

/**
 * Mark bill as paid
 * @param {string} id - Bill ID
 * @param {Object} paymentData - Payment data
 * @returns {Function} - Redux thunk function
 */
export const markBillAsPaid = (id, paymentData) => async (dispatch) => {
  try {
    dispatch({ type: MARK_BILL_PAID });
    
    const response = await api.put(`/bills/${id}/pay`, paymentData);
    
    dispatch({
      type: MARK_BILL_PAID_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: MARK_BILL_PAID_FAIL,
      payload: err.response?.data?.message || 'Error marking bill as paid'
    });
    
    throw err;
  }
};

/**
 * Skip bill payment
 * @param {string} id - Bill ID
 * @returns {Function} - Redux thunk function
 */
export const skipBillPayment = (id) => async (dispatch) => {
  try {
    dispatch({ type: MARK_BILL_PAID });
    
    const response = await api.put(`/bills/${id}/skip`);
    
    dispatch({
      type: MARK_BILL_PAID_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: MARK_BILL_PAID_FAIL,
      payload: err.response?.data?.message || 'Error skipping bill payment'
    });
    
    throw err;
  }
};

/**
 * Get upcoming bills and reminders
 * @param {number} days - Number of days to look ahead (default: 7)
 * @returns {Function} - Redux thunk function
 */
export const getUpcomingBills = (days = 7) => async (dispatch) => {
  try {
    dispatch({ type: GET_UPCOMING_BILLS });
    
    const response = await api.get('/bills/upcoming', { params: { days } });
    
    dispatch({
      type: GET_UPCOMING_BILLS_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_UPCOMING_BILLS_FAIL,
      payload: err.response?.data?.message || 'Error fetching upcoming bills'
    });
  }
};

/**
 * Get bill statistics
 * @returns {Function} - Redux thunk function
 */
export const getBillStats = () => async (dispatch) => {
  try {
    dispatch({ type: GET_BILL_STATS });
    
    const response = await api.get('/bills/stats');
    
    dispatch({
      type: GET_BILL_STATS_SUCCESS,
      payload: response.data
    });
  } catch (err) {
    dispatch({
      type: GET_BILL_STATS_FAIL,
      payload: err.response?.data?.message || 'Error fetching bill statistics'
    });
  }
};

/**
 * Clear bill error
 * @returns {Object} - Action object
 */
export const clearBillError = () => ({
  type: CLEAR_BILL_ERROR
});