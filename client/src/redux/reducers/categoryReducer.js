import {
  GET_CATEGORIES,
  ADD_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  CATEGORY_ERROR,
  CLEAR_CATEGORIES
} from '../types';

const initialState = {
  categories: [],
  loading: true,
  error: null
};

export default function categoryReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_CATEGORIES:
      return {
        ...state,
        categories: payload,
        loading: false,
        error: null
      };
    case ADD_CATEGORY:
      return {
        ...state,
        categories: [payload, ...state.categories],
        loading: false,
        error: null
      };
    case UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(category =>
          category._id === payload._id ? payload : category
        ),
        loading: false,
        error: null
      };
    case DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(category => category._id !== payload),
        loading: false,
        error: null
      };
    case CATEGORY_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_CATEGORIES:
      return {
        ...state,
        categories: [],
        loading: true,
        error: null
      };
    default:
      return state;
  }
}