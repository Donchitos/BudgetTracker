import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT
} from '../types';

import authService from '../../services/authService';

/**
 * Load user - get current user data
 */
export const loadUser = () => async (dispatch) => {
  try {
    // Only attempt to load user if there's a token
    if (!authService.isAuthenticated()) {
      return dispatch({ type: AUTH_ERROR });
    }

    const res = await authService.getCurrentUser();
    
    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

/**
 * Register user
 * @param {Object} formData - User registration data
 */
export const register = (formData) => async (dispatch) => {
  try {
    const res = await authService.register(formData);
    
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res
    });
    
    // Load user data after successful registration
    dispatch(loadUser());
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Registration failed';
    
    dispatch({
      type: REGISTER_FAIL,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 */
export const login = (email, password) => async (dispatch) => {
  try {
    const res = await authService.login(email, password);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res
    });
    
    // Load user data after successful login
    dispatch(loadUser());
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Login failed';
    
    dispatch({
      type: LOGIN_FAIL,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * Logout user
 */
export const logout = () => (dispatch) => {
  authService.logout();
  
  dispatch({
    type: LOGOUT
  });
};