import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Button, IconButton, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import SummaryCards from './SummaryCards';
import ExpensePieChart from './ExpensePieChart';
import RecentTransactions from './RecentTransactions';
import BillReminders from './BillReminders';
import CategoryBudgetAlerts from './CategoryBudgetAlerts';
import SavingsGoalDashboard from './SavingsGoalDashboard';

/**
 * Mobile-optimized Dashboard component that reorganizes content for smaller screens
 */
const MobileDashboard = () => {
  // Track loading state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Dispatch any necessary refresh actions here
      // For demo, we'll use a timeout to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Dashboard
        </Typography>
        <IconButton
          color="primary"
          aria-label="refresh"
          size="small"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <CircularProgress size={20} /> : <SyncIcon />}
        </IconButton>
      </Box>
      
      {/* Summary Cards section */}
      <SummaryCards />
      
      {/* Quick action buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 1 }}>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/transactions"
          sx={{ flex: 1 }}
        >
          Add Transaction
        </Button>
        
        <Button 
          variant="outlined" 
          size="small"
          component={RouterLink}
          to="/reports" 
          sx={{ flex: 1 }}
        >
          View Reports
        </Button>
      </Box>
      
      {/* Budget Alerts - Critical information first */}
      <Box sx={{ mb: 2 }}>
        <CategoryBudgetAlerts />
      </Box>
      
      {/* Bill Reminders - Important for mobile users to see upcoming bills */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
          Upcoming Bills
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <BillReminders />
      </Paper>
      
      {/* Recent Transactions - Compact list for mobile */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
            Recent Transactions
          </Typography>
          <Button 
            component={RouterLink}
            to="/transactions"
            size="small"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontSize: '0.75rem' }}
          >
            All
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <RecentTransactions compact />
      </Paper>
      
      {/* Expense breakdown - More visual */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
          Expense Breakdown
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ height: 220 }}>
          <ExpensePieChart compact />
        </Box>
      </Paper>
      
      {/* Savings Goals - Important for financial planning */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
          Savings Goals
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <SavingsGoalDashboard compact />
      </Paper>
      
      {/* Additional quick links for mobile navigation */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Quick Access
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            component={RouterLink} 
            to="/budget"
            sx={{ fontSize: '0.75rem' }}
          >
            Budget
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            component={RouterLink} 
            to="/categories"
            sx={{ fontSize: '0.75rem' }}
          >
            Categories
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            component={RouterLink} 
            to="/bills"
            sx={{ fontSize: '0.75rem' }}
          >
            Bills
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            component={RouterLink} 
            to="/savings"
            sx={{ fontSize: '0.75rem' }}
          >
            Savings
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MobileDashboard;