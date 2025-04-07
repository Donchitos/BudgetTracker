import {
  GET_EXPENSE_FORECAST,
  GET_EXPENSE_FORECAST_SUCCESS,
  GET_EXPENSE_FORECAST_FAIL,
  GET_CASHFLOW_PREDICTION,
  GET_CASHFLOW_PREDICTION_SUCCESS,
  GET_CASHFLOW_PREDICTION_FAIL,
  CLEAR_FORECAST_ERROR
} from '../types';
import api from '../../services/api';

/**
 * Get expense forecast
 * @param {Object} options - Options for forecast
 * @returns {Function} - Redux thunk function
 */
export const getExpenseForecast = (options = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_EXPENSE_FORECAST });
    
    // Build query string
    const params = new URLSearchParams();
    if (options.months) params.append('months', options.months);
    if (options.includeSavings !== undefined) params.append('includeSavings', options.includeSavings);
    if (options.includeIncome !== undefined) params.append('includeIncome', options.includeIncome);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/forecast/expenses${queryString}`);
    
    dispatch({
      type: GET_EXPENSE_FORECAST_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_EXPENSE_FORECAST_FAIL,
      payload: err.response?.data?.message || 'Error fetching expense forecast'
    });
    
    throw err;
  }
};

/**
 * Get cashflow prediction
 * @returns {Function} - Redux thunk function
 */
export const getCashflowPrediction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_CASHFLOW_PREDICTION });
    
    const response = await api.get('/forecast/cashflow');
    
    dispatch({
      type: GET_CASHFLOW_PREDICTION_SUCCESS,
      payload: response.data.data
    });
    
    return response.data.data;
  } catch (err) {
    dispatch({
      type: GET_CASHFLOW_PREDICTION_FAIL,
      payload: err.response?.data?.message || 'Error fetching cashflow prediction'
    });
    
    throw err;
  }
};

/**
 * Clear forecast error
 * @returns {Object} - Action object
 */
export const clearForecastError = () => ({
  type: CLEAR_FORECAST_ERROR
});