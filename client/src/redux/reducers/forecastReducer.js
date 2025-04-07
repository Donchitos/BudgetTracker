import {
  GET_EXPENSE_FORECAST,
  GET_EXPENSE_FORECAST_SUCCESS,
  GET_EXPENSE_FORECAST_FAIL,
  GET_CASHFLOW_PREDICTION,
  GET_CASHFLOW_PREDICTION_SUCCESS,
  GET_CASHFLOW_PREDICTION_FAIL,
  CLEAR_FORECAST_ERROR
} from '../types';

// Initial state
const initialState = {
  expenseForecast: {
    data: null,
    loading: false,
    error: null
  },
  cashflowPrediction: {
    data: null,
    loading: false,
    error: null
  },
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    // Expense Forecast
    case GET_EXPENSE_FORECAST:
      return {
        ...state,
        expenseForecast: {
          ...state.expenseForecast,
          loading: true,
          error: null
        }
      };
    case GET_EXPENSE_FORECAST_SUCCESS:
      return {
        ...state,
        expenseForecast: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_EXPENSE_FORECAST_FAIL:
      return {
        ...state,
        expenseForecast: {
          ...state.expenseForecast,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Cashflow Prediction
    case GET_CASHFLOW_PREDICTION:
      return {
        ...state,
        cashflowPrediction: {
          ...state.cashflowPrediction,
          loading: true,
          error: null
        }
      };
    case GET_CASHFLOW_PREDICTION_SUCCESS:
      return {
        ...state,
        cashflowPrediction: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_CASHFLOW_PREDICTION_FAIL:
      return {
        ...state,
        cashflowPrediction: {
          ...state.cashflowPrediction,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Clear Error
    case CLEAR_FORECAST_ERROR:
      return {
        ...state,
        expenseForecast: {
          ...state.expenseForecast,
          error: null
        },
        cashflowPrediction: {
          ...state.cashflowPrediction,
          error: null
        },
        error: null
      };
    
    default:
      return state;
  }
}