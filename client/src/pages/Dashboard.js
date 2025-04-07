import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Grid } from '@mui/material';
import SummaryCards from '../components/dashboard/SummaryCards';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SpendingTrendsChart from '../components/dashboard/SpendingTrendsChart';
import { getCategories } from '../redux/actions/categoryActions';

const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Load categories when component mounts (needed for charts)
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards Section */}
      <SummaryCards />
      
      <Grid container spacing={3}>
        {/* Expense Breakdown Chart */}
        <Grid item xs={12} md={8}>
          <ExpensePieChart />
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={4}>
          <RecentTransactions />
        </Grid>
        
        {/* Spending Trends Chart */}
        <Grid item xs={12}>
          <SpendingTrendsChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;