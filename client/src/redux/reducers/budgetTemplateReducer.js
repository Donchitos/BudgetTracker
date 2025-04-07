import {
  GET_BUDGET_TEMPLATES,
  GET_BUDGET_TEMPLATE,
  ADD_BUDGET_TEMPLATE,
  UPDATE_BUDGET_TEMPLATE,
  DELETE_BUDGET_TEMPLATE,
  GET_DEFAULT_TEMPLATE,
  APPLY_TEMPLATE,
  TEMPLATE_ERROR,
  CLEAR_TEMPLATES
} from '../types';

const initialState = {
  budgetTemplates: [],
  template: null,
  defaultTemplate: null,
  pagination: null,
  loading: true,
  error: null,
  applySuccess: false,
  applyMessage: ''
};

export default function budgetTemplateReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_BUDGET_TEMPLATES:
      return {
        ...state,
        budgetTemplates: payload.data,
        pagination: payload.pagination,
        loading: false,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    case GET_BUDGET_TEMPLATE:
      return {
        ...state,
        template: payload,
        loading: false,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    case ADD_BUDGET_TEMPLATE:
      return {
        ...state,
        budgetTemplates: [payload, ...state.budgetTemplates],
        loading: false,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    case UPDATE_BUDGET_TEMPLATE:
      return {
        ...state,
        budgetTemplates: state.budgetTemplates.map(template =>
          template._id === payload._id ? payload : template
        ),
        template: state.template?._id === payload._id ? payload : state.template,
        defaultTemplate: payload.isDefault ? payload : 
                        (state.defaultTemplate && state.defaultTemplate._id === payload._id) ? 
                        null : state.defaultTemplate,
        loading: false,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    case DELETE_BUDGET_TEMPLATE:
      return {
        ...state,
        budgetTemplates: state.budgetTemplates.filter(template => template._id !== payload),
        template: state.template?._id === payload ? null : state.template,
        defaultTemplate: state.defaultTemplate?._id === payload ? null : state.defaultTemplate,
        loading: false,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    case GET_DEFAULT_TEMPLATE:
      return {
        ...state,
        defaultTemplate: payload,
        loading: false,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    case APPLY_TEMPLATE:
      return {
        ...state,
        loading: false,
        error: null,
        applySuccess: true,
        applyMessage: payload.message
      };
    
    case TEMPLATE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
        applySuccess: false,
        applyMessage: ''
      };
    
    case CLEAR_TEMPLATES:
      return {
        ...state,
        budgetTemplates: [],
        pagination: null,
        loading: true,
        error: null,
        applySuccess: false,
        applyMessage: ''
      };
    
    default:
      return state;
  }
}