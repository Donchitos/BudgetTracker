import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';
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
import { getCategories } from '../redux/actions/categoryActions';
import { getTransactions } from '../redux/actions/transactionActions';

const Dashboard = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  
  // Load data when component mounts (needed for charts)
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getTransactions());
  }, [dispatch]);
  
  // Render mobile optimized dashboard on small screens
  if (isMobile) {
    return <MobileDashboard />;
  }
  
  // Render regular dashboard on larger screens
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards Section */}
      <SummaryCards />
      
      {/* Budget Alerts Section */}
      <Box sx={{ mb: 3, mt: 3 }}>
        <CategoryBudgetAlerts />
      </Box>
      
      <Grid container spacing={3}>
        {/* Expense Breakdown Chart */}
        <Grid item xs={12} md={8}>
          <ExpensePieChart />
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={4}>
          <RecentTransactions />
        </Grid>
        
        {/* Budget vs Actual Chart */}
        <Grid item xs={12}>
          <BudgetVsActualChart />
        </Grid>
        
        {/* Spending Trends Chart */}
        <Grid item xs={12}>
          <SpendingTrendsChart />
        </Grid>
        
        {/* Savings Goals Dashboard */}
        <Grid item xs={12} md={4}>
          <SavingsGoalDashboard />
        </Grid>
        
        {/* Bill Reminders */}
        <Grid item xs={12} md={8}>
          <BillReminders />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;