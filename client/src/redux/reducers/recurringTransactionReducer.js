import {
  GET_RECURRING_TRANSACTIONS,
  GET_RECURRING_TRANSACTIONS_SUCCESS,
  GET_RECURRING_TRANSACTIONS_FAIL,
  GET_RECURRING_TRANSACTION,
  GET_RECURRING_TRANSACTION_SUCCESS,
  GET_RECURRING_TRANSACTION_FAIL,
  CREATE_RECURRING_TRANSACTION,
  CREATE_RECURRING_TRANSACTION_SUCCESS,
  CREATE_RECURRING_TRANSACTION_FAIL,
  UPDATE_RECURRING_TRANSACTION,
  UPDATE_RECURRING_TRANSACTION_SUCCESS,
  UPDATE_RECURRING_TRANSACTION_FAIL,
  DELETE_RECURRING_TRANSACTION,
  DELETE_RECURRING_TRANSACTION_SUCCESS,
  DELETE_RECURRING_TRANSACTION_FAIL,
  TOGGLE_RECURRING_TRANSACTION,
  TOGGLE_RECURRING_TRANSACTION_SUCCESS,
  TOGGLE_RECURRING_TRANSACTION_FAIL,
  GENERATE_TRANSACTIONS,
  GENERATE_TRANSACTIONS_SUCCESS,
  GENERATE_TRANSACTIONS_FAIL,
  CLEAR_RECURRING_TRANSACTION_ERROR
} from '../types';

const initialState = {
  recurringTransactions: [],
  recurringTransaction: null,
  loading: false,
  error: null,
  generationResult: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    // Get all recurring transactions
    case GET_RECURRING_TRANSACTIONS:
      return {
        ...state,
        loading: true
      };
    case GET_RECURRING_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        recurringTransactions: action.payload.data
      };
    case GET_RECURRING_TRANSACTIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Get single recurring transaction
    case GET_RECURRING_TRANSACTION:
      return {
        ...state,
        loading: true
      };
    case GET_RECURRING_TRANSACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        recurringTransaction: action.payload.data
      };
    case GET_RECURRING_TRANSACTION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Create recurring transaction
    case CREATE_RECURRING_TRANSACTION:
      return {
        ...state,
        loading: true
      };
    case CREATE_RECURRING_TRANSACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        recurringTransactions: [
          action.payload.data,
          ...state.recurringTransactions
        ]
      };
    case CREATE_RECURRING_TRANSACTION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Update recurring transaction
    case UPDATE_RECURRING_TRANSACTION:
      return {
        ...state,
        loading: true
      };
    case UPDATE_RECURRING_TRANSACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        recurringTransactions: state.recurringTransactions.map(transaction =>
          transaction._id === action.payload.data._id ? action.payload.data : transaction
        ),
        recurringTransaction: action.payload.data
      };
    case UPDATE_RECURRING_TRANSACTION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Delete recurring transaction
    case DELETE_RECURRING_TRANSACTION:
      return {
        ...state,
        loading: true
      };
    case DELETE_RECURRING_TRANSACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        recurringTransactions: state.recurringTransactions.filter(
          transaction => transaction._id !== action.payload
        )
      };
    case DELETE_RECURRING_TRANSACTION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Toggle recurring transaction active status
    case TOGGLE_RECURRING_TRANSACTION:
      return {
        ...state,
        loading: true
      };
    case TOGGLE_RECURRING_TRANSACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        recurringTransactions: state.recurringTransactions.map(transaction =>
          transaction._id === action.payload.data._id ? action.payload.data : transaction
        ),
        recurringTransaction: 
          state.recurringTransaction && state.recurringTransaction._id === action.payload.data._id
            ? action.payload.data
            : state.recurringTransaction
      };
    case TOGGLE_RECURRING_TRANSACTION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Generate transactions
    case GENERATE_TRANSACTIONS:
      return {
        ...state,
        loading: true,
        generationResult: null
      };
    case GENERATE_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        generationResult: action.payload
      };
    case GENERATE_TRANSACTIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Clear error
    case CLEAR_RECURRING_TRANSACTION_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
}