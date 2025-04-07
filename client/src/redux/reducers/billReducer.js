import {
  GET_BILLS,
  GET_BILL,
  ADD_BILL,
  UPDATE_BILL,
  DELETE_BILL,
  MARK_BILL_PAID,
  BILL_ERROR,
  CLEAR_BILLS,
  GET_UPCOMING_BILLS,
  GET_OVERDUE_BILLS
} from '../types';

const initialState = {
  bills: [],
  bill: null,
  upcomingBills: [],
  overdueBills: [],
  pagination: null,
  loading: true,
  error: null
};

export default function billReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_BILLS:
      return {
        ...state,
        bills: payload.data,
        pagination: payload.pagination,
        loading: false,
        error: null
      };
    
    case GET_BILL:
      return {
        ...state,
        bill: payload,
        loading: false,
        error: null
      };
    
    case ADD_BILL:
      return {
        ...state,
        bills: [payload, ...state.bills],
        loading: false,
        error: null
      };
    
    case UPDATE_BILL:
      return {
        ...state,
        bills: state.bills.map(bill =>
          bill._id === payload._id ? payload : bill
        ),
        bill: payload,
        loading: false,
        error: null
      };
    
    case DELETE_BILL:
      return {
        ...state,
        bills: state.bills.filter(bill => bill._id !== payload),
        loading: false,
        error: null
      };
    
    case MARK_BILL_PAID:
      // Need to handle differently depending on whether it's a recurring bill
      // If it's recurring, update it, but if one-time, might need to filter it out
      return {
        ...state,
        bills: state.bills.map(bill =>
          bill._id === payload._id ? payload : bill
        ),
        bill: payload,
        // Also update in upcoming or overdue if present
        upcomingBills: state.upcomingBills.filter(bill => bill._id !== payload._id),
        overdueBills: state.overdueBills.filter(bill => bill._id !== payload._id),
        loading: false,
        error: null
      };
    
    case GET_UPCOMING_BILLS:
      return {
        ...state,
        upcomingBills: payload.data,
        loading: false,
        error: null
      };
    
    case GET_OVERDUE_BILLS:
      return {
        ...state,
        overdueBills: payload.data,
        loading: false,
        error: null
      };
    
    case BILL_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    
    case CLEAR_BILLS:
      return {
        ...state,
        bills: [],
        pagination: null,
        loading: true,
        error: null
      };
    
    default:
      return state;
  }
}