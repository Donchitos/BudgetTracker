import {
  GET_DASHBOARD_DATA,
  DASHBOARD_ERROR
} from '../types';

const initialState = {
  summary: null,
  expenseBreakdown: null,
  budgetVsActual: null,
  spendingTrends: null,
  loading: true,
  error: null
};

export default function dashboardReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_DASHBOARD_DATA:
      return {
        ...state,
        ...payload, // Spread in any of summary, expenseBreakdown, budgetVsActual, spendingTrends
        loading: false,
        error: null
      };
    case DASHBOARD_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
}