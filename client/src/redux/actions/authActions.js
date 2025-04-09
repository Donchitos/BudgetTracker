import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT
} from '../types';

import authService from '../../services/authService';

/**
 * Load user - get current user data
 */
export const loadUser = () => async (dispatch) => {
  try {
    // Only attempt to load user if there's a token
    if (!authService.isAuthenticated()) {
      return dispatch({ type: AUTH_ERROR });
    }

    const res = await authService.getCurrentUser();
    
    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

/**
 * Register user
 * @param {Object} formData - User registration data
 */
export const register = (formData) => async (dispatch) => {
  try {
    const res = await authService.register(formData);
    
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res
    });
    
    // Load user data after successful registration
    dispatch(loadUser());
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Registration failed';
    
    dispatch({
      type: REGISTER_FAIL,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 */
export const login = (email, password) => async (dispatch) => {
  try {
    const res = await authService.login(email, password);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res
    });
    
    // Load user data after successful login
    dispatch(loadUser());
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Login failed';
    
    dispatch({
      type: LOGIN_FAIL,
      payload: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * Demo login - for testing without server
 * Initializes the entire Redux store with mock data
 */
export const demoLogin = () => (dispatch) => {
  // Create demo data
  const demoToken = 'demo-token-12345';
  const demoUser = {
    _id: '1234567890',
    name: 'Demo User',
    email: 'demo@example.com'
  };
  
  // Set token in localStorage
  localStorage.setItem('token', demoToken);
  
  // Dispatch login success
  dispatch({
    type: LOGIN_SUCCESS,
    payload: {
      token: demoToken,
      user: demoUser
    }
  });
  
  // Manually dispatch user loaded
  dispatch({
    type: USER_LOADED,
    payload: demoUser
  });
  
  // Initialize mock categories
  const mockCategories = [
    { _id: 'cat1', name: 'Housing', color: '#4CAF50', icon: 'home', budget: 1000 },
    { _id: 'cat2', name: 'Food', color: '#2196F3', icon: 'restaurant', budget: 500 },
    { _id: 'cat3', name: 'Transportation', color: '#FF9800', icon: 'directions_car', budget: 300 },
    { _id: 'cat4', name: 'Entertainment', color: '#9C27B0', icon: 'movie', budget: 200 },
    { _id: 'cat5', name: 'Healthcare', color: '#F44336', icon: 'local_hospital', budget: 400 }
  ];
  
  // Initialize mock transactions
  const mockTransactions = [
    { _id: 'trans1', description: 'Rent', amount: 800, type: 'expense', category: 'cat1', date: new Date().toISOString(), tags: ['housing', 'monthly'] },
    { _id: 'trans2', description: 'Groceries', amount: 120, type: 'expense', category: 'cat2', date: new Date().toISOString(), tags: ['food'] },
    { _id: 'trans3', description: 'Gas', amount: 40, type: 'expense', category: 'cat3', date: new Date().toISOString(), tags: ['car'] },
    { _id: 'trans4', description: 'Movie tickets', amount: 30, type: 'expense', category: 'cat4', date: new Date().toISOString(), tags: ['entertainment'] },
    { _id: 'trans5', description: 'Salary', amount: 3000, type: 'income', category: null, date: new Date().toISOString(), tags: ['monthly', 'income'] }
  ];
  
  // Initialize mock bills
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const mockBills = [
    { _id: 'bill1', name: 'Rent', amount: 800, dueDate: nextMonth.toISOString(), category: 'cat1', isPaid: false, isRecurring: true, frequency: 'monthly' },
    { _id: 'bill2', name: 'Internet', amount: 60, dueDate: nextMonth.toISOString(), category: 'cat1', isPaid: false, isRecurring: true, frequency: 'monthly' },
    { _id: 'bill3', name: 'Phone Bill', amount: 45, dueDate: today.toISOString(), category: 'cat1', isPaid: true, isRecurring: true, frequency: 'monthly' }
  ];
  
  // Initialize mock savings goals
  const mockSavingsGoals = [
    { _id: 'goal1', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 2500, targetDate: nextMonth.toISOString(), isCompleted: false },
    { _id: 'goal2', name: 'Vacation', targetAmount: 2000, currentAmount: 500, targetDate: nextMonth.toISOString(), isCompleted: false }
  ];

  // Initialize mock budget templates
  const mockBudgetTemplates = [
    { _id: 'template1', name: 'Default Budget', categories: mockCategories, isDefault: true }
  ];
  
  // Initialize mock financial health
  const mockFinancialHealth = {
    score: 75,
    status: 'Good',
    details: [
      { category: 'Savings', score: 8, maxScore: 10, suggestion: 'You\'re on the right track!' },
      { category: 'Spending', score: 7, maxScore: 10, suggestion: 'Consider reducing discretionary spending.' },
      { category: 'Debt', score: 9, maxScore: 10, suggestion: 'Great job keeping debt low.' }
    ]
  };

  // Populate Categories
  dispatch({
    type: 'GET_CATEGORIES',
    payload: mockCategories
  });
  
  // Populate Transactions
  dispatch({
    type: 'GET_TRANSACTIONS',
    payload: {
      data: mockTransactions,
      pagination: {
        page: 1,
        limit: 10,
        total: mockTransactions.length,
        pages: 1
      }
    }
  });
  
  // Populate Bills
  dispatch({
    type: 'GET_BILLS_SUCCESS',
    payload: { data: mockBills }
  });

  // Populate Upcoming Bills & Reminders
  dispatch({
    type: 'GET_UPCOMING_BILLS_SUCCESS',
    payload: {
      data: {
        upcomingBills: mockBills.filter(b => !b.isPaid),
        overdueBills: mockBills.filter(b => !b.isPaid && new Date(b.dueDate) < today),
        reminders: mockBills.filter(b => !b.isPaid)
      }
    }
  });
  
  // Populate Savings Goals
  dispatch({
    type: 'GET_SAVINGS_GOALS_SUCCESS',
    payload: { data: mockSavingsGoals }
  });
  
  // Populate Budget Templates
  dispatch({
    type: 'GET_BUDGET_TEMPLATES',
    payload: {
      data: mockBudgetTemplates,
      pagination: {
        page: 1,
        limit: 10,
        total: mockBudgetTemplates.length,
        pages: 1
      }
    }
  });
  
  // Populate Analytics data
  dispatch({
    type: 'GET_FINANCIAL_HEALTH_SUCCESS',
    payload: mockFinancialHealth
  });
  
  // Populate Dashboard data
  dispatch({
    type: 'GET_DASHBOARD_DATA_SUCCESS',
    payload: {
      summary: {
        income: 3000,
        expenses: 1000,
        balance: 2000
      },
      recentTransactions: mockTransactions.slice(0, 3)
    }
  });
  
  // Populate Expense Breakdown
  dispatch({
    type: 'GET_EXPENSE_BREAKDOWN_SUCCESS',
    payload: {
      categories: mockCategories.map(cat => ({
        ...cat,
        amount: 200,
        percentage: 20
      })),
      totalExpenses: 1000
    }
  });
  
  // Populate Budget vs Actual
  dispatch({
    type: 'GET_BUDGET_VS_ACTUAL_SUCCESS',
    payload: {
      categories: mockCategories.map(cat => ({
        ...cat,
        budgeted: cat.budget,
        actual: cat.budget * 0.8
      }))
    }
  });
  
  console.log('Demo login complete: Redux store initialized with mock data');
};

/**
 * Logout user
 */
export const logout = () => (dispatch) => {
  authService.logout();
  
  dispatch({
    type: LOGOUT
  });
};