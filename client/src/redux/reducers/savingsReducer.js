import {
  GET_SAVINGS_GOALS,
  GET_SAVINGS_GOALS_SUCCESS,
  GET_SAVINGS_GOALS_FAIL,
  GET_SAVINGS_GOAL,
  GET_SAVINGS_GOAL_SUCCESS,
  GET_SAVINGS_GOAL_FAIL,
  CREATE_SAVINGS_GOAL,
  CREATE_SAVINGS_GOAL_SUCCESS,
  CREATE_SAVINGS_GOAL_FAIL,
  UPDATE_SAVINGS_GOAL,
  UPDATE_SAVINGS_GOAL_SUCCESS,
  UPDATE_SAVINGS_GOAL_FAIL,
  DELETE_SAVINGS_GOAL,
  DELETE_SAVINGS_GOAL_SUCCESS,
  DELETE_SAVINGS_GOAL_FAIL,
  ADD_CONTRIBUTION,
  ADD_CONTRIBUTION_SUCCESS,
  ADD_CONTRIBUTION_FAIL,
  COMPLETE_SAVINGS_GOAL,
  COMPLETE_SAVINGS_GOAL_SUCCESS,
  COMPLETE_SAVINGS_GOAL_FAIL,
  GET_SAVINGS_STATS,
  GET_SAVINGS_STATS_SUCCESS,
  GET_SAVINGS_STATS_FAIL,
  CLEAR_SAVINGS_GOAL_ERROR
} from '../types';

const initialState = {
  savingsGoals: [],
  savingsGoal: null,
  stats: null,
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    // Get all savings goals
    case GET_SAVINGS_GOALS:
      return {
        ...state,
        loading: true
      };
    case GET_SAVINGS_GOALS_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoals: action.payload.data
      };
    case GET_SAVINGS_GOALS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Get single savings goal
    case GET_SAVINGS_GOAL:
      return {
        ...state,
        loading: true
      };
    case GET_SAVINGS_GOAL_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoal: action.payload.data
      };
    case GET_SAVINGS_GOAL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Create savings goal
    case CREATE_SAVINGS_GOAL:
      return {
        ...state,
        loading: true
      };
    case CREATE_SAVINGS_GOAL_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoals: [
          action.payload.data,
          ...state.savingsGoals
        ]
      };
    case CREATE_SAVINGS_GOAL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Update savings goal
    case UPDATE_SAVINGS_GOAL:
      return {
        ...state,
        loading: true
      };
    case UPDATE_SAVINGS_GOAL_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoals: state.savingsGoals.map(goal =>
          goal._id === action.payload.data._id ? action.payload.data : goal
        ),
        savingsGoal: action.payload.data
      };
    case UPDATE_SAVINGS_GOAL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Delete savings goal
    case DELETE_SAVINGS_GOAL:
      return {
        ...state,
        loading: true
      };
    case DELETE_SAVINGS_GOAL_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoals: state.savingsGoals.filter(
          goal => goal._id !== action.payload
        )
      };
    case DELETE_SAVINGS_GOAL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Add contribution
    case ADD_CONTRIBUTION:
      return {
        ...state,
        loading: true
      };
    case ADD_CONTRIBUTION_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoal: action.payload.data,
        savingsGoals: state.savingsGoals.map(goal =>
          goal._id === action.payload.data._id ? action.payload.data : goal
        )
      };
    case ADD_CONTRIBUTION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Complete/change status of savings goal
    case COMPLETE_SAVINGS_GOAL:
      return {
        ...state,
        loading: true
      };
    case COMPLETE_SAVINGS_GOAL_SUCCESS:
      return {
        ...state,
        loading: false,
        savingsGoal: action.payload.data,
        savingsGoals: state.savingsGoals.map(goal =>
          goal._id === action.payload.data._id ? action.payload.data : goal
        )
      };
    case COMPLETE_SAVINGS_GOAL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Get savings statistics
    case GET_SAVINGS_STATS:
      return {
        ...state,
        loading: true
      };
    case GET_SAVINGS_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: action.payload.data
      };
    case GET_SAVINGS_STATS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Clear error
    case CLEAR_SAVINGS_GOAL_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
}