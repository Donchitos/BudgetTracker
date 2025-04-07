import {
  GET_BILLS,
  GET_BILLS_SUCCESS,
  GET_BILLS_FAIL,
  GET_BILL,
  GET_BILL_SUCCESS,
  GET_BILL_FAIL,
  CREATE_BILL,
  CREATE_BILL_SUCCESS,
  CREATE_BILL_FAIL,
  UPDATE_BILL,
  UPDATE_BILL_SUCCESS,
  UPDATE_BILL_FAIL,
  DELETE_BILL,
  DELETE_BILL_SUCCESS,
  DELETE_BILL_FAIL,
  MARK_BILL_PAID,
  MARK_BILL_PAID_SUCCESS,
  MARK_BILL_PAID_FAIL,
  GET_UPCOMING_BILLS,
  GET_UPCOMING_BILLS_SUCCESS,
  GET_UPCOMING_BILLS_FAIL,
  GET_BILL_STATS,
  GET_BILL_STATS_SUCCESS,
  GET_BILL_STATS_FAIL,
  CLEAR_BILL_ERROR
} from '../types';

const initialState = {
  bills: [],
  bill: null,
  upcomingBills: null,
  reminders: [],
  stats: null,
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    // Get all bills
    case GET_BILLS:
      return {
        ...state,
        loading: true
      };
    case GET_BILLS_SUCCESS:
      return {
        ...state,
        loading: false,
        bills: action.payload.data
      };
    case GET_BILLS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Get single bill
    case GET_BILL:
      return {
        ...state,
        loading: true
      };
    case GET_BILL_SUCCESS:
      return {
        ...state,
        loading: false,
        bill: action.payload.data
      };
    case GET_BILL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Create bill
    case CREATE_BILL:
      return {
        ...state,
        loading: true
      };
    case CREATE_BILL_SUCCESS:
      return {
        ...state,
        loading: false,
        bills: [
          action.payload.data,
          ...state.bills
        ]
      };
    case CREATE_BILL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Update bill
    case UPDATE_BILL:
      return {
        ...state,
        loading: true
      };
    case UPDATE_BILL_SUCCESS:
      return {
        ...state,
        loading: false,
        bills: state.bills.map(bill =>
          bill._id === action.payload.data._id ? action.payload.data : bill
        ),
        bill: action.payload.data
      };
    case UPDATE_BILL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Delete bill
    case DELETE_BILL:
      return {
        ...state,
        loading: true
      };
    case DELETE_BILL_SUCCESS:
      return {
        ...state,
        loading: false,
        bills: state.bills.filter(
          bill => bill._id !== action.payload
        )
      };
    case DELETE_BILL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Mark bill as paid (or skip payment)
    case MARK_BILL_PAID:
      return {
        ...state,
        loading: true
      };
    case MARK_BILL_PAID_SUCCESS:
      return {
        ...state,
        loading: false,
        bills: state.bills.map(bill =>
          bill._id === action.payload.data._id ? action.payload.data : bill
        ),
        bill: action.payload.data
      };
    case MARK_BILL_PAID_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Get upcoming bills and reminders
    case GET_UPCOMING_BILLS:
      return {
        ...state,
        loading: true
      };
    case GET_UPCOMING_BILLS_SUCCESS:
      return {
        ...state,
        loading: false,
        upcomingBills: action.payload.data.upcomingBills,
        overdueBills: action.payload.data.overdueBills,
        reminders: action.payload.data.reminders
      };
    case GET_UPCOMING_BILLS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Get bill statistics
    case GET_BILL_STATS:
      return {
        ...state,
        loading: true
      };
    case GET_BILL_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: action.payload.data
      };
    case GET_BILL_STATS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Clear error
    case CLEAR_BILL_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
}