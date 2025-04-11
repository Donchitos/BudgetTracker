import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';

// Redux actions
import { loadUser } from './redux/actions/authActions';

// Layout
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routes/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Bills from './pages/Bills';
import Savings from './pages/Savings';
import Reports from './pages/Reports';
import BudgetTemplates from './pages/BudgetTemplates';
import BudgetManagement from './pages/BudgetManagement';
import RecurringTransactions from './pages/RecurringTransactions';
import ImportExport from './pages/ImportExport';
import Analytics from './pages/Analytics';
import FinancialPlanning from './pages/FinancialPlanning';
import Forecast from './pages/Forecast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';

const App = () => {
  const dispatch = useDispatch();

  // Load user when app mounts
  useEffect(() => {
    // Only attempt to load user data if there's a token
    if (localStorage.getItem('token')) {
      console.log('App.js: Found token, loading user data');
      dispatch(loadUser());
    } else {
      console.log('App.js: No token found, skipping loadUser');
    }
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Protected routes - will only be accessible if authenticated */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="bills" element={<Bills />} />
            <Route path="savings" element={<Savings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="budget-templates" element={<BudgetTemplates />} />
            <Route path="recurring-transactions" element={<RecurringTransactions />} />
            <Route path="budget" element={<BudgetManagement />} />
            <Route path="import-export" element={<ImportExport />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="financial-planning" element={<FinancialPlanning />} />
            <Route path="forecast" element={<Forecast />} />
          </Route>
        </Route>
      </Routes>
    </Box>
  );
};

export default App;