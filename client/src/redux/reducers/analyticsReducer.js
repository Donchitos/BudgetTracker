import {
  GET_SPENDING_TRENDS,
  GET_SPENDING_TRENDS_SUCCESS,
  GET_SPENDING_TRENDS_FAIL,
  GET_INCOME_VS_EXPENSE,
  GET_INCOME_VS_EXPENSE_SUCCESS,
  GET_INCOME_VS_EXPENSE_FAIL,
  GET_BUDGET_VS_ACTUAL,
  GET_BUDGET_VS_ACTUAL_SUCCESS,
  GET_BUDGET_VS_ACTUAL_FAIL,
  GET_YEARLY_SUMMARY,
  GET_YEARLY_SUMMARY_SUCCESS,
  GET_YEARLY_SUMMARY_FAIL,
  GET_FINANCIAL_INSIGHTS,
  GET_FINANCIAL_INSIGHTS_SUCCESS,
  GET_FINANCIAL_INSIGHTS_FAIL,
  GET_FINANCIAL_REPORT,
  GET_FINANCIAL_REPORT_SUCCESS,
  GET_FINANCIAL_REPORT_FAIL,
  GET_FINANCIAL_HEALTH,
  GET_FINANCIAL_HEALTH_SUCCESS,
  GET_FINANCIAL_HEALTH_FAIL,
  CLEAR_ANALYTICS_ERROR
} from '../types';

// Initial state
const initialState = {
  spendingTrends: {
    data: [],
    loading: false,
    error: null
  },
  incomeVsExpense: {
    data: [],
    loading: false,
    error: null
  },
  budgetVsActual: {
    data: null,
    loading: false,
    error: null
  },
  yearlySummary: {
    data: null,
    loading: false,
    error: null
  },
  financialInsights: {
    data: null,
    loading: false,
    error: null
  },
  financialReport: {
    data: null,
    loading: false,
    error: null
  },
  financialHealth: {
    data: null,
    loading: false,
    error: null
  },
  error: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    // Spending Trends
    case GET_SPENDING_TRENDS:
      return {
        ...state,
        spendingTrends: {
          ...state.spendingTrends,
          loading: true,
          error: null
        }
      };
    case GET_SPENDING_TRENDS_SUCCESS:
      return {
        ...state,
        spendingTrends: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_SPENDING_TRENDS_FAIL:
      return {
        ...state,
        spendingTrends: {
          ...state.spendingTrends,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Income vs Expense
    case GET_INCOME_VS_EXPENSE:
      return {
        ...state,
        incomeVsExpense: {
          ...state.incomeVsExpense,
          loading: true,
          error: null
        }
      };
    case GET_INCOME_VS_EXPENSE_SUCCESS:
      return {
        ...state,
        incomeVsExpense: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_INCOME_VS_EXPENSE_FAIL:
      return {
        ...state,
        incomeVsExpense: {
          ...state.incomeVsExpense,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Budget vs Actual
    case GET_BUDGET_VS_ACTUAL:
      return {
        ...state,
        budgetVsActual: {
          ...state.budgetVsActual,
          loading: true,
          error: null
        }
      };
    case GET_BUDGET_VS_ACTUAL_SUCCESS:
      return {
        ...state,
        budgetVsActual: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_BUDGET_VS_ACTUAL_FAIL:
      return {
        ...state,
        budgetVsActual: {
          ...state.budgetVsActual,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Yearly Summary
    case GET_YEARLY_SUMMARY:
      return {
        ...state,
        yearlySummary: {
          ...state.yearlySummary,
          loading: true,
          error: null
        }
      };
    case GET_YEARLY_SUMMARY_SUCCESS:
      return {
        ...state,
        yearlySummary: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_YEARLY_SUMMARY_FAIL:
      return {
        ...state,
        yearlySummary: {
          ...state.yearlySummary,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Financial Insights
    case GET_FINANCIAL_INSIGHTS:
      return {
        ...state,
        financialInsights: {
          ...state.financialInsights,
          loading: true,
          error: null
        }
      };
    case GET_FINANCIAL_INSIGHTS_SUCCESS:
      return {
        ...state,
        financialInsights: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_FINANCIAL_INSIGHTS_FAIL:
      return {
        ...state,
        financialInsights: {
          ...state.financialInsights,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Financial Report
    case GET_FINANCIAL_REPORT:
      return {
        ...state,
        financialReport: {
          ...state.financialReport,
          loading: true,
          error: null
        }
      };
    case GET_FINANCIAL_REPORT_SUCCESS:
      return {
        ...state,
        financialReport: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_FINANCIAL_REPORT_FAIL:
      return {
        ...state,
        financialReport: {
          ...state.financialReport,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Financial Health
    case GET_FINANCIAL_HEALTH:
      return {
        ...state,
        financialHealth: {
          ...state.financialHealth,
          loading: true,
          error: null
        }
      };
    case GET_FINANCIAL_HEALTH_SUCCESS:
      return {
        ...state,
        financialHealth: {
          data: action.payload,
          loading: false,
          error: null
        }
      };
    case GET_FINANCIAL_HEALTH_FAIL:
      return {
        ...state,
        financialHealth: {
          ...state.financialHealth,
          loading: false,
          error: action.payload
        },
        error: action.payload
      };
    
    // Clear Error
    case CLEAR_ANALYTICS_ERROR:
      return {
        ...state,
        spendingTrends: {
          ...state.spendingTrends,
          error: null
        },
        incomeVsExpense: {
          ...state.incomeVsExpense,
          error: null
        },
        budgetVsActual: {
          ...state.budgetVsActual,
          error: null
        },
        yearlySummary: {
          ...state.yearlySummary,
          error: null
        },
        financialInsights: {
          ...state.financialInsights,
          error: null
        },
        financialReport: {
          ...state.financialReport,
          error: null
        },
        financialHealth: {
          ...state.financialHealth,
          error: null
        },
        error: null
      };
    
    default:
      return state;
  }
}