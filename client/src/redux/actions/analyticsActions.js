import {
  GET_SPENDING_TRENDS,
  GET_SPENDING_TRENDS_SUCCESS,
  GET_SPENDING_TRENDS_FAIL,
  GET_INCOME_VS_EXPENSE,
  GET_INCOME_VS_EXPENSE_SUCCESS,
  GET_INCOME_VS_EXPENSE_FAIL,
  GET_BUDGET_VS_ACTUAL,
  GET_BUDGET_VS_ACTUAL_SUCCESS,
  GET_BUDGET_VS_ACTUAL_FAIL,
  GET_YEARLY_SUMMARY,
  GET_YEARLY_SUMMARY_SUCCESS,
  GET_YEARLY_SUMMARY_FAIL,
  GET_FINANCIAL_INSIGHTS,
  GET_FINANCIAL_INSIGHTS_SUCCESS,
  GET_FINANCIAL_INSIGHTS_FAIL,
  GET_FINANCIAL_REPORT,
  GET_FINANCIAL_REPORT_SUCCESS,
  GET_FINANCIAL_REPORT_FAIL,
  GET_FINANCIAL_HEALTH,
  GET_FINANCIAL_HEALTH_SUCCESS,
  GET_FINANCIAL_HEALTH_FAIL,
  CLEAR_ANALYTICS_ERROR
} from '../types';
import api from '../../services/api';

/**
 * Get spending trends data
 * @param {Object} options - Query options
 * @returns {Function} - Redux thunk function
 */
export const getSpendingTrends = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_SPENDING_TRENDS });
    
    // Build query string
    const params = new URLSearchParams();
    if (options.months) params.append('months', options.months);
    if (options.categories) params.append('categories', options.categories.join(','));
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/analytics/spending-trends${queryString}`);
    
    dispatch({
      type: GET_SPENDING_TRENDS_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_SPENDING_TRENDS_FAIL,
      payload: err.response?.data?.message || 'Error fetching spending trends'
    });
    
    throw err;
  }
};

/**
 * Get income vs expense trends
 * @param {Object} options - Query options
 * @returns {Function} - Redux thunk function
 */
export const getIncomeVsExpenseTrends = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_INCOME_VS_EXPENSE });
    
    // Build query string
    const params = new URLSearchParams();
    if (options.months) params.append('months', options.months);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/analytics/income-expense${queryString}`);
    
    dispatch({
      type: GET_INCOME_VS_EXPENSE_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_INCOME_VS_EXPENSE_FAIL,
      payload: err.response?.data?.message || 'Error fetching income vs expense data'
    });
    
    throw err;
  }
};

/**
 * Get budget vs actual comparison
 * @param {Object} options - Query options
 * @returns {Function} - Redux thunk function
 */
export const getBudgetVsActual = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_BUDGET_VS_ACTUAL });
    
    // Build query string
    const params = new URLSearchParams();
    if (options.month) params.append('month', options.month);
    if (options.year) params.append('year', options.year);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/analytics/budget-actual${queryString}`);
    
    dispatch({
      type: GET_BUDGET_VS_ACTUAL_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_BUDGET_VS_ACTUAL_FAIL,
      payload: err.response?.data?.message || 'Error fetching budget vs actual data'
    });
    
    throw err;
  }
};

/**
 * Get yearly financial summary
 * @param {Object} options - Query options
 * @returns {Function} - Redux thunk function
 */
export const getYearlySummary = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_YEARLY_SUMMARY });
    
    // Build query string
    const params = new URLSearchParams();
    if (options.year) params.append('year', options.year);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/analytics/yearly-summary${queryString}`);
    
    dispatch({
      type: GET_YEARLY_SUMMARY_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_YEARLY_SUMMARY_FAIL,
      payload: err.response?.data?.message || 'Error fetching yearly summary'
    });
    
    throw err;
  }
};

/**
 * Get financial insights and recommendations
 * @returns {Function} - Redux thunk function
 */
export const getFinancialInsights = () => async (dispatch) => {
  try {
    dispatch({ type: GET_FINANCIAL_INSIGHTS });
    
    const response = await api.get('/analytics/insights');
    
    dispatch({
      type: GET_FINANCIAL_INSIGHTS_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_FINANCIAL_INSIGHTS_FAIL,
      payload: err.response?.data?.message || 'Error fetching financial insights'
    });
    
    throw err;
  }
};

/**
 * Generate comprehensive financial report
 * @param {Object} options - Report options
 * @returns {Function} - Redux thunk function
 */
export const generateFinancialReport = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_FINANCIAL_REPORT });
    
    // Build query string
    const params = new URLSearchParams();
    if (options.period) params.append('period', options.period);
    if (options.year) params.append('year', options.year);
    if (options.month) params.append('month', options.month);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/analytics/report${queryString}`);
    
    dispatch({
      type: GET_FINANCIAL_REPORT_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_FINANCIAL_REPORT_FAIL,
      payload: err.response?.data?.message || 'Error generating financial report'
    });
    
    throw err;
  }
};

/**
 * Get financial health score
 * @returns {Function} - Redux thunk function
 */
export const getFinancialHealthScore = () => async (dispatch) => {
  try {
    dispatch({ type: GET_FINANCIAL_HEALTH });
    
    const response = await api.get('/analytics/health-score');
    
    dispatch({
      type: GET_FINANCIAL_HEALTH_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_FINANCIAL_HEALTH_FAIL,
      payload: err.response?.data?.message || 'Error fetching financial health score'
    });
    
    throw err;
  }
};

/**
 * Clear analytics error
 * @returns {Object} - Action object
 */
export const clearAnalyticsError = () => ({
  type: CLEAR_ANALYTICS_ERROR
});