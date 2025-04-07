import { combineReducers } from 'redux';
import authReducer from './authReducer';
import categoryReducer from './categoryReducer';
import transactionReducer from './transactionReducer';
import dashboardReducer from './dashboardReducer';
import billReducer from './billReducer';
import savingsReducer from './savingsReducer';
import budgetTemplateReducer from './budgetTemplateReducer';
import recurringTransactionReducer from './recurringTransactionReducer';
import analyticsReducer from './analyticsReducer';
import forecastReducer from './forecastReducer';

export default combineReducers({
  auth: authReducer,
  categories: categoryReducer,
  transactions: transactionReducer,
  dashboard: dashboardReducer,
  bills: billReducer,
  savings: savingsReducer,
  budgetTemplates: budgetTemplateReducer,
  recurringTransactions: recurringTransactionReducer,
  analytics: analyticsReducer,
  forecast: forecastReducer
});