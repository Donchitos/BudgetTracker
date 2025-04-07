import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Container, Paper, Grid, Divider, Alert } from '@mui/material';
import RecurringTransactionList from '../components/transactions/RecurringTransactionList';
import { getCategories } from '../redux/actions/categoryActions';
import { getRecurringTransactions } from '../redux/actions/recurringTransactionActions';

/**
 * RecurringTransactions page
 * 
 * Displays and manages all recurring transactions
 */
const RecurringTransactions = () => {
  const dispatch = useDispatch();
  
  // Fetch necessary data on component mount
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getRecurringTransactions());
  }, [dispatch]);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Recurring Transactions
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your regularly occurring income and expenses. Set up recurring transactions to track bills, 
          subscriptions, salary deposits, and other repeating financial events.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Why Use Recurring Transactions?
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Plan Ahead
                    </Typography>
                    <Typography variant="body2">
                      Visualize your future cash flow by setting up all your recurring income and expenses.
                      Know exactly what's coming in and going out each month.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Never Miss a Bill
                    </Typography>
                    <Typography variant="body2">
                      Get reminded of upcoming bills and recurring expenses before they're due.
                      Avoid late fees and keep your finances in order.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Track Regular Expenses
                    </Typography>
                    <Typography variant="body2">
                      Automatically keep track of subscriptions, memberships, and other recurring costs
                      to identify where your money is going each month.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
              >
                Tip: Recurring transactions will appear on your forecast and help calculate your projected
                cash flow for upcoming months.
              </Alert>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <RecurringTransactionList />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RecurringTransactions;