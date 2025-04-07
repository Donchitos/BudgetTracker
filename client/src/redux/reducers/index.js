import { combineReducers } from 'redux';
import authReducer from './authReducer';
import categoryReducer from './categoryReducer';
import transactionReducer from './transactionReducer';
import dashboardReducer from './dashboardReducer';

export default combineReducers({
  auth: authReducer,
  categories: categoryReducer,
  transactions: transactionReducer,
  dashboard: dashboardReducer
});