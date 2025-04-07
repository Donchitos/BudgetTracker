import {
  GET_DASHBOARD_DATA,
  DASHBOARD_ERROR
} from '../types';

import dashboardService from '../../services/dashboardService';

/**
 * Get dashboard summary data
 * @param {Object} params - Optional parameters for date range
 */
export const getDashboardSummary = (params = {}) => async (dispatch) => {
  try {
    const res = await dashboardService.getDashboardSummary(params);
    
    dispatch({
      type: GET_DASHBOARD_DATA,
      payload: {
        summary: res.data
      }
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: DASHBOARD_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch dashboard summary'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to fetch dashboard summary');
  }
};

/**
 * Get expense breakdown by category
 * @param {Object} params - Optional parameters for date range
 */
export const getExpenseBreakdown = (params = {}) => async (dispatch) => {
  try {
    const res = await dashboardService.getExpenseBreakdown(params);
    
    dispatch({
      type: GET_DASHBOARD_DATA,
      payload: {
        expenseBreakdown: res.data
      }
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: DASHBOARD_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch expense breakdown'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to fetch expense breakdown');
  }
};

/**
 * Get budget vs actual comparison
 * @param {Object} params - Optional parameters for date range
 */
export const getBudgetVsActual = (params = {}) => async (dispatch) => {
  try {
    const res = await dashboardService.getBudgetVsActual(params);
    
    dispatch({
      type: GET_DASHBOARD_DATA,
      payload: {
        budgetVsActual: res.data
      }
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: DASHBOARD_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch budget vs actual data'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to fetch budget vs actual data');
  }
};

/**
 * Get spending trends over time
 * @param {Object} params - Optional parameters for date range
 */
export const getSpendingTrends = (params = {}) => async (dispatch) => {
  try {
    const res = await dashboardService.getSpendingTrends(params);
    
    dispatch({
      type: GET_DASHBOARD_DATA,
      payload: {
        spendingTrends: res.data
      }
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: DASHBOARD_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch spending trends'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to fetch spending trends');
  }
};

/**
 * Get all dashboard data at once
 * @param {Object} params - Optional parameters for date range
 */
export const getAllDashboardData = (params = {}) => async (dispatch) => {
  try {
    const [summary, expenseBreakdown, budgetVsActual, spendingTrends] = await Promise.all([
      dashboardService.getDashboardSummary(params),
      dashboardService.getExpenseBreakdown(params),
      dashboardService.getBudgetVsActual(params),
      dashboardService.getSpendingTrends(params)
    ]);
    
    dispatch({
      type: GET_DASHBOARD_DATA,
      payload: {
        summary: summary.data,
        expenseBreakdown: expenseBreakdown.data,
        budgetVsActual: budgetVsActual.data,
        spendingTrends: spendingTrends.data
      }
    });
    
    return {
      summary: summary.data,
      expenseBreakdown: expenseBreakdown.data,
      budgetVsActual: budgetVsActual.data,
      spendingTrends: spendingTrends.data
    };
  } catch (err) {
    dispatch({
      type: DASHBOARD_ERROR,
      payload: err.response?.data?.message || 'Failed to fetch dashboard data'
    });
    
    throw new Error(err.response?.data?.message || 'Failed to fetch dashboard data');
  }
};