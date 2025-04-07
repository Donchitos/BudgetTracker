import {
  GET_SAVINGS_GOALS,
  GET_SAVINGS_GOAL,
  ADD_SAVINGS_GOAL,
  UPDATE_SAVINGS_GOAL,
  DELETE_SAVINGS_GOAL,
  ADD_CONTRIBUTION,
  GET_SAVINGS_SUMMARY,
  SAVINGS_ERROR,
  CLEAR_SAVINGS_GOALS
} from '../types';

const initialState = {
  savingsGoals: [],
  goal: null,
  summary: null,
  pagination: null,
  loading: true,
  error: null
};

export default function savingsReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_SAVINGS_GOALS:
      return {
        ...state,
        savingsGoals: payload.data,
        pagination: payload.pagination,
        loading: false,
        error: null
      };
    
    case GET_SAVINGS_GOAL:
      return {
        ...state,
        goal: payload,
        loading: false,
        error: null
      };
    
    case ADD_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: [payload, ...state.savingsGoals],
        loading: false,
        error: null
      };
    
    case UPDATE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(goal =>
          goal._id === payload._id ? payload : goal
        ),
        goal: state.goal?._id === payload._id ? payload : state.goal,
        loading: false,
        error: null
      };
    
    case DELETE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(goal => goal._id !== payload),
        goal: state.goal?._id === payload ? null : state.goal,
        loading: false,
        error: null
      };
    
    case ADD_CONTRIBUTION:
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(goal =>
          goal._id === payload._id ? payload : goal
        ),
        goal: state.goal?._id === payload._id ? payload : state.goal,
        loading: false,
        error: null
      };
    
    case GET_SAVINGS_SUMMARY:
      return {
        ...state,
        summary: payload,
        loading: false,
        error: null
      };
    
    case SAVINGS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    
    case CLEAR_SAVINGS_GOALS:
      return {
        ...state,
        savingsGoals: [],
        pagination: null,
        loading: true,
        error: null
      };
    
    default:
      return state;
  }
}