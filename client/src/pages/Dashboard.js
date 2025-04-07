import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Grid } from '@mui/material';
import SummaryCards from '../components/dashboard/SummaryCards';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import MobileDashboard from '../components/dashboard/MobileDashboard';
import { useIsMobile } from '../utils/responsiveUtils';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SpendingTrendsChart from '../components/dashboard/SpendingTrendsChart';
import BudgetVsActualChart from '../components/dashboard/BudgetVsActualChart';
import BillReminders from '../components/dashboard/BillReminders';
import SavingsGoalDashboard from '../components/dashboard/SavingsGoalDashboard';
import CategoryBudgetAlerts from '../components/dashboard/CategoryBudgetAlerts';
import DashboardCustomizer from '../components/dashboard/DashboardCustomizer';
import { getCategories } from '../redux/actions/categoryActions';
import { getTransactions } from '../redux/actions/transactionActions';

const Dashboard = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  
  // Default dashboard widgets configuration
  const defaultWidgets = [
    { id: 'summary-cards', name: 'Summary Cards', visible: true },
    { id: 'category-alerts', name: 'Category Budget Alerts', visible: true },
    { id: 'expense-chart', name: 'Expense Breakdown', visible: true },
    { id: 'recent-transactions', name: 'Recent Transactions', visible: true },
    { id: 'budget-vs-actual', name: 'Budget vs. Actual', visible: true },
    { id: 'spending-trends', name: 'Spending Trends', visible: true },
    { id: 'savings-goals', name: 'Savings Goals', visible: true },
    { id: 'bill-reminders', name: 'Bill Reminders', visible: true }
  ];
  
  // State for dashboard widgets configuration
  const [widgets, setWidgets] = useState(defaultWidgets);
  
  useEffect(() => {
    // Load data when component mounts
    dispatch(getCategories());
    dispatch(getTransactions());
    
    // Load saved dashboard preferences from localStorage
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      try {
        setWidgets(JSON.parse(savedPreferences));
      } catch (err) {
        console.error('Error loading dashboard preferences:', err);
      }
    }
    
    // Listen for dashboard preferences updates
    const handlePreferencesUpdated = (event) => {
      setWidgets(event.detail.widgets);
    };
    
    window.addEventListener('dashboardPreferencesUpdated', handlePreferencesUpdated);
    
    return () => {
      window.removeEventListener('dashboardPreferencesUpdated', handlePreferencesUpdated);
    };
  }, [dispatch]);
  
  if (isMobile) {
    return <MobileDashboard />;
  }
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <DashboardCustomizer />
      
      {/* Summary Cards Section */}
      {widgets.find(w => w.id === 'summary-cards')?.visible && <SummaryCards />}
      
      {/* Budget Alerts Section */}
      {widgets.find(w => w.id === 'category-alerts')?.visible && (
        <Box sx={{ mb: 3, mt: 3 }}>
          <CategoryBudgetAlerts />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Expense Breakdown Chart */}
        {widgets.find(w => w.id === 'expense-chart')?.visible && (
          <Grid item xs={12} md={8}>
            <ExpensePieChart />
          </Grid>
        )}
        
        {/* Recent Transactions */}
        {widgets.find(w => w.id === 'recent-transactions')?.visible && (
          <Grid item xs={12} md={4}>
            <RecentTransactions />
          </Grid>
        )}
        
        {/* Budget vs Actual Chart */}
        {widgets.find(w => w.id === 'budget-vs-actual')?.visible && (
          <Grid item xs={12}>
            <BudgetVsActualChart />
          </Grid>
        )}
        
        {/* Spending Trends Chart */}
        {widgets.find(w => w.id === 'spending-trends')?.visible && (
          <Grid item xs={12}>
            <SpendingTrendsChart />
          </Grid>
        )}
        
        {/* Savings Goals Dashboard */}
        {widgets.find(w => w.id === 'savings-goals')?.visible && (
          <Grid item xs={12} md={4}>
            <SavingsGoalDashboard />
          </Grid>
        )}
        
        {/* Bill Reminders */}
        {widgets.find(w => w.id === 'bill-reminders')?.visible && (
          <Grid item xs={12} md={8}>
            <BillReminders />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;