import {
  GET_TRANSACTIONS,
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  DELETE_TRANSACTION,
  TRANSACTION_ERROR,
  CLEAR_TRANSACTIONS
} from '../types';

const initialState = {
  transactions: [],
  pagination: null,
  loading: true,
  error: null
};

export default function transactionReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TRANSACTIONS:
      return {
        ...state,
        transactions: payload.data,
        pagination: payload.pagination,
        loading: false,
        error: null
      };
    case ADD_TRANSACTION:
      return {
        ...state,
        transactions: [payload, ...state.transactions],
        loading: false,
        error: null
      };
    case UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction._id === payload._id ? payload : transaction
        ),
        loading: false,
        error: null
      };
    case DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction._id !== payload),
        loading: false,
        error: null
      };
    case TRANSACTION_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_TRANSACTIONS:
      return {
        ...state,
        transactions: [],
        pagination: null,
        loading: true,
        error: null
      };
    default:
      return state;
  }
}