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

const initialState = {
  loading: false,
  importResults: null,
  fileValidation: null,
  importSettingsResults: null,
  exportStatus: null,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    // Import Transactions
    case IMPORT_TRANSACTIONS:
      return {
        ...state,
        loading: true,
        importResults: null,
        error: null
      };
    case IMPORT_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        importResults: action.payload.data
      };
    case IMPORT_TRANSACTIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Validate Import File
    case VALIDATE_IMPORT_FILE:
      return {
        ...state,
        loading: true,
        fileValidation: null,
        error: null
      };
    case VALIDATE_IMPORT_FILE_SUCCESS:
      return {
        ...state,
        loading: false,
        fileValidation: action.payload.data
      };
    case VALIDATE_IMPORT_FILE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Import Settings
    case IMPORT_SETTINGS:
      return {
        ...state,
        loading: true,
        importSettingsResults: null,
        error: null
      };
    case IMPORT_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        importSettingsResults: action.payload.data
      };
    case IMPORT_SETTINGS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Export Transactions
    case EXPORT_TRANSACTIONS:
      return {
        ...state,
        loading: true,
        exportStatus: 'pending',
        error: null
      };
    case EXPORT_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        exportStatus: 'success'
      };
    case EXPORT_TRANSACTIONS_FAIL:
      return {
        ...state,
        loading: false,
        exportStatus: 'failed',
        error: action.payload
      };
    
    // Export Settings
    case EXPORT_SETTINGS:
      return {
        ...state,
        loading: true,
        exportStatus: 'pending',
        error: null
      };
    case EXPORT_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        exportStatus: 'success'
      };
    case EXPORT_SETTINGS_FAIL:
      return {
        ...state,
        loading: false,
        exportStatus: 'failed',
        error: action.payload
      };
    
    // Clear Status
    case CLEAR_IMPORT_EXPORT_STATUS:
      return {
        ...state,
        importResults: null,
        fileValidation: null,
        importSettingsResults: null,
        exportStatus: null,
        error: null
      };
    
    default:
      return state;
  }
}