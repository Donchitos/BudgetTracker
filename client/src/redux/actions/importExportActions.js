import {
  IMPORT_TRANSACTIONS,
  IMPORT_TRANSACTIONS_SUCCESS,
  IMPORT_TRANSACTIONS_FAIL,
  VALIDATE_IMPORT_FILE,
  VALIDATE_IMPORT_FILE_SUCCESS,
  VALIDATE_IMPORT_FILE_FAIL,
  IMPORT_SETTINGS,
  IMPORT_SETTINGS_SUCCESS,
  IMPORT_SETTINGS_FAIL,
  EXPORT_TRANSACTIONS,
  EXPORT_TRANSACTIONS_SUCCESS,
  EXPORT_TRANSACTIONS_FAIL,
  EXPORT_SETTINGS,
  EXPORT_SETTINGS_SUCCESS,
  EXPORT_SETTINGS_FAIL,
  CLEAR_IMPORT_EXPORT_STATUS
} from '../types';
import api from '../../services/api';

/**
 * Import transactions from CSV file
 * @param {FormData} formData - Form data with file and import options
 * @returns {Function} - Redux thunk function
 */
export const importTransactions = (formData) => async (dispatch) => {
  try {
    dispatch({ type: IMPORT_TRANSACTIONS });
    
    const response = await api.post('/import/transactions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    dispatch({
      type: IMPORT_TRANSACTIONS_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: IMPORT_TRANSACTIONS_FAIL,
      payload: err.response?.data?.message || 'Error importing transactions'
    });
    
    throw err;
  }
};

/**
 * Validate import file structure
 * @param {FormData} formData - Form data with file
 * @returns {Function} - Redux thunk function
 */
export const validateImportFile = (formData) => async (dispatch) => {
  try {
    dispatch({ type: VALIDATE_IMPORT_FILE });
    
    const response = await api.post('/import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    dispatch({
      type: VALIDATE_IMPORT_FILE_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: VALIDATE_IMPORT_FILE_FAIL,
      payload: err.response?.data?.message || 'Error validating import file'
    });
    
    throw err;
  }
};

/**
 * Import application settings from JSON file
 * @param {FormData} formData - Form data with settings file
 * @returns {Function} - Redux thunk function
 */
export const importSettings = (formData) => async (dispatch) => {
  try {
    dispatch({ type: IMPORT_SETTINGS });
    
    const response = await api.post('/import/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    dispatch({
      type: IMPORT_SETTINGS_SUCCESS,
      payload: response.data
    });
    
    return response.data;
  } catch (err) {
    dispatch({
      type: IMPORT_SETTINGS_FAIL,
      payload: err.response?.data?.message || 'Error importing settings'
    });
    
    throw err;
  }
};

/**
 * Export transactions as CSV
 * This function will trigger a file download instead of storing in redux
 * @param {Object} exportOptions - Export options
 * @returns {Function} - Redux thunk function
 */
export const exportTransactions = (exportOptions = {}) => async (dispatch) => {
  try {
    dispatch({ type: EXPORT_TRANSACTIONS });
    
    // Build query params
    const params = new URLSearchParams();
    
    // Add export options to query params
    Object.keys(exportOptions).forEach(key => {
      params.append(key, exportOptions[key]);
    });
    
    // Create URL with params
    const url = `/export/transactions?${params.toString()}`;
    
    // Use the browser to download the file
    window.location.href = `${api.defaults.baseURL}${url}`;
    
    dispatch({
      type: EXPORT_TRANSACTIONS_SUCCESS
    });
  } catch (err) {
    dispatch({
      type: EXPORT_TRANSACTIONS_FAIL,
      payload: err.message || 'Error exporting transactions'
    });
    
    throw err;
  }
};

/**
 * Export application settings as JSON
 * This function will trigger a file download instead of storing in redux
 * @param {Object} exportOptions - Settings to include in export
 * @returns {Function} - Redux thunk function
 */
export const exportSettings = (exportOptions = {}) => async (dispatch) => {
  try {
    dispatch({ type: EXPORT_SETTINGS });
    
    // Build query params
    const params = new URLSearchParams();
    
    // Add export options to query params
    Object.keys(exportOptions).forEach(key => {
      params.append(key, exportOptions[key]);
    });
    
    // Create URL with params
    const url = `/export/settings?${params.toString()}`;
    
    // Use the browser to download the file
    window.location.href = `${api.defaults.baseURL}${url}`;
    
    dispatch({
      type: EXPORT_SETTINGS_SUCCESS
    });
  } catch (err) {
    dispatch({
      type: EXPORT_SETTINGS_FAIL,
      payload: err.message || 'Error exporting settings'
    });
    
    throw err;
  }
};

/**
 * Download import template CSV
 * This function will trigger a file download
 * @returns {Function} - Redux thunk function
 */
export const downloadImportTemplate = () => async () => {
  try {
    // Use the browser to download the file
    window.location.href = `${api.defaults.baseURL}/import/template`;
  } catch (err) {
    console.error('Error downloading import template:', err);
    throw err;
  }
};

/**
 * Clear import/export status
 * @returns {Object} - Action object
 */
export const clearImportExportStatus = () => ({
  type: CLEAR_IMPORT_EXPORT_STATUS
});