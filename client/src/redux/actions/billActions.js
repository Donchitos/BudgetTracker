import {
  GET_BILLS,
  GET_BILL,
  ADD_BILL,
  UPDATE_BILL,
  DELETE_BILL,
  MARK_BILL_PAID,
  BILL_ERROR,
  CLEAR_BILLS,
  GET_UPCOMING_BILLS,
  GET_OVERDUE_BILLS
} from '../types';

import billService from '../../services/billService';

/**
 * Get all bills with optional filtering
 * @param {Object} params - Optional parameters for filtering
 */
export const getBills = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: CLEAR_BILLS });
    
    const res = await billService.getBills(params);
    
    dispatch({
      type: GET_BILLS,
      payload: res
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch bills'
    });
    
    throw err;
  }
};

/**
 * Get a single bill by ID
 * @param {string} id - Bill ID
 */
export const getBill = (id) => async (dispatch) => {
  try {
    const res = await billService.getBill(id);
    
    dispatch({
      type: GET_BILL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch bill'
    });
    
    throw err;
  }
};

/**
 * Create a new bill
 * @param {Object} billData - Bill data
 */
export const addBill = (billData) => async (dispatch) => {
  try {
    const res = await billService.createBill(billData);
    
    dispatch({
      type: ADD_BILL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to create bill'
    });
    
    throw err;
  }
};

/**
 * Update a bill
 * @param {string} id - Bill ID
 * @param {Object} billData - Updated bill data
 */
export const updateBill = (id, billData) => async (dispatch) => {
  try {
    const res = await billService.updateBill(id, billData);
    
    dispatch({
      type: UPDATE_BILL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to update bill'
    });
    
    throw err;
  }
};

/**
 * Delete a bill
 * @param {string} id - Bill ID
 */
export const deleteBill = (id) => async (dispatch) => {
  try {
    await billService.deleteBill(id);
    
    dispatch({
      type: DELETE_BILL,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to delete bill'
    });
    
    throw err;
  }
};

/**
 * Mark a bill as paid
 * @param {string} id - Bill ID
 * @param {Object} paymentData - Payment data
 */
export const markBillAsPaid = (id, paymentData = {}) => async (dispatch) => {
  try {
    const res = await billService.markBillAsPaid(id, paymentData);
    
    dispatch({
      type: MARK_BILL_PAID,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to mark bill as paid'
    });
    
    throw err;
  }
};

/**
 * Get upcoming bills (due in the next X days)
 * @param {number} days - Number of days to look ahead
 */
export const getUpcomingBills = (days = 7) => async (dispatch) => {
  try {
    const res = await billService.getUpcomingBills(days);
    
    dispatch({
      type: GET_UPCOMING_BILLS,
      payload: res
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch upcoming bills'
    });
    
    throw err;
  }
};

/**
 * Get overdue bills
 */
export const getOverdueBills = () => async (dispatch) => {
  try {
    const res = await billService.getOverdueBills();
    
    dispatch({
      type: GET_OVERDUE_BILLS,
      payload: res
    });
    
    return res;
  } catch (err) {
    dispatch({
      type: BILL_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch overdue bills'
    });
    
    throw err;
  }
};