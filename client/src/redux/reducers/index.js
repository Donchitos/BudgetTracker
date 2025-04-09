/**
 * Root reducer that combines all reducers for the Redux store
 */
import { combineReducers } from 'redux';
import authReducer from './authReducer';
import categoryReducer from './categoryReducer';
import transactionReducer from './transactionReducer';
import billReducer from './billReducer';
import savingsReducer from './savingsReducer';
import budgetTemplateReducer from './budgetTemplateReducer';
import analyticsReducer from './analyticsReducer';
import forecastReducer from './forecastReducer';

// Default states to ensure components don't error out in demo mode
const initialCategory = {
  categories: [],
  loading: false,
  error: null
};

const initialTransaction = {
  transactions: [],
  loading: false,
  error: null
};

// Create a safe reducer that ensures a default state is always returned
const createSafeReducer = (reducer, initialState) => (state, action) => {
  if (state === undefined) {
    return initialState;
  }
  return reducer(state, action);
};

export default combineReducers({
  auth: authReducer,
  category: createSafeReducer(categoryReducer, initialCategory),
  transaction: createSafeReducer(transactionReducer, initialTransaction),
  bill: billReducer,
  savings: savingsReducer,
  budgetTemplate: budgetTemplateReducer,
  analytics: analyticsReducer,
  forecast: forecastReducer
});