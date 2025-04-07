import { combineReducers } from 'redux';
import authReducer from './authReducer';
// We'll add more reducers as we develop them

export default combineReducers({
  auth: authReducer,
  // Additional reducers will be added here
});