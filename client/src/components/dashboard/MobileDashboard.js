import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  IconButton, 
  CircularProgress, 
  Alert, 
  Snackbar,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Skeleton,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Components
import SummaryCards from './SummaryCards';
import ExpensePieChart from './ExpensePieChart';
import RecentTransactions from './RecentTransactions';
import BillReminders from './BillReminders';
import CategoryBudgetAlerts from './CategoryBudgetAlerts';
import SavingsGoalDashboard from './SavingsGoalDashboard';
import QuickAddTransactionDialog from '../transactions/QuickAddTransactionDialog';

// Utilities
import { useResponsiveBreakpoints } from '../../utils/responsiveUtils';

/**
 * Enhanced Mobile-optimized Dashboard component with improved UX
 */
const MobileDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsiveBreakpoints();
  
  // State management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [navValue, setNavValue] = useState(0);
  
  // Ref for pull-to-refresh functionality
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const thresholdPassed = useRef(false);
  const [pullProgress, setPullProgress] = useState(0);
  
  // Get alerts count for badges
  useEffect(() => {
    // This would normally come from Redux state
    setNotificationCount(3); // Example count
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Dispatch any necessary refresh actions here
      await Promise.all([
        // Example: dispatch(fetchTransactions()),
        // dispatch(fetchBudgets()),
        // dispatch(fetchBills()),
        // Simulating API calls with timeouts
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
      setPullProgress(0);
      thresholdPassed.current = false;
    }
  }, [dispatch]);

  // Pull-to-refresh touch handlers
  const handleTouchStart = useCallback((e) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current) return;
    
    currentY.current = e.touches[0].clientY;
    const pullDistance = currentY.current - startY.current;
    
    if (pullDistance > 0) {
      e.preventDefault();
      const progress = Math.min(pullDistance / 80, 1);
      setPullProgress(progress);
      
      if (progress === 1) {
        thresholdPassed.current = true;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    
    isPulling.current = false;
    if (thresholdPassed.current) {
      handleRefresh();
    } else {
      setPullProgress(0);
    }
  }, [handleRefresh]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Navigation change handler
  const handleNavChange = (event, newValue) => {
    setNavValue(newValue);
    
    switch(newValue) {
      case 0: // Dashboard - do nothing as we're already here
        break;
      case 1: // Transactions
        navigate('/transactions');
        break;
      case 2: // Reports
        navigate('/reports');
        break;
      case 3: // Settings
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  // Quick Add transaction handlers
  const handleQuickAddOpen = () => {
    setQuickAddOpen(true);
  };
  
  const handleQuickAddClose = () => {
    setQuickAddOpen(false);
  };

  return (
    <Box 
      sx={{ position: 'relative', pb: 7 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      {/* Pull to refresh indicator */}
      {pullProgress > 0 && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: pullProgress * 60, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            transition: pullProgress === 1 ? 'none' : 'height 0.2s'
          }}
        >
          <CircularProgress 
            size={30} 
            variant={thresholdPassed.current ? "indeterminate" : "determinate"} 
            value={pullProgress * 100} 
          />
        </Box>
      )}

      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <IconButton 
            color="primary" 
            aria-label="notifications"
            size="medium" 
            sx={{ ml: 1 }}
            onClick={() => navigate('/notifications')}
          >
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
        <IconButton
          color="primary"
          aria-label="refresh"
          size="medium"
          onClick={handleRefresh}
          disabled={isRefreshing}
          sx={{ height: 48, width: 48 }} // Larger tap target
        >
          {isRefreshing ? <CircularProgress size={24} /> : <SyncIcon fontSize="medium" />}
        </IconButton>
      </Box>
      
      {/* Success notification */}
      <Snackbar 
        open={refreshSuccess} 
        autoHideDuration={3000} 
        onClose={() => setRefreshSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Dashboard updated successfully
        </Alert>
      </Snackbar>
      
      {/* Tab navigation for different dashboard views */}
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        variant="fullWidth" 
        sx={{ mb: 2 }}
        aria-label="dashboard views"
      >
        <Tab label="Overview" />
        <Tab label="Transactions" />
        <Tab label="Budget" />
      </Tabs>
      
      {/* Tab content panels */}
      <Box role="tabpanel" hidden={currentTab !== 0}>
        {currentTab === 0 && (
          <>
            {/* Summary Cards section */}
            <SummaryCards />
            
            {/* Quick action buttons - Larger, more touch-friendly */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2 }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<AddIcon />}
                onClick={handleQuickAddOpen}
                sx={{ 
                  flex: 1, 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                Add Transaction
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                component={RouterLink}
                to="/reports" 
                sx={{ 
                  flex: 1, 
                  py: 1.5, 
                  borderRadius: 2
                }}
              >
                View Reports
              </Button>
            </Box>
            
            {/* Budget Alerts */}
            <Box sx={{ mb: 3 }}>
              <CategoryBudgetAlerts />
            </Box>
            
            {/* Bill Reminders */}
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Upcoming Bills
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <BillReminders />
            </Paper>
          </>
        )}
      </Box>
      
      <Box role="tabpanel" hidden={currentTab !== 1}>
        {currentTab === 1 && (
          <>
            {/* Recent Transactions - Enhanced for better mobile usability */}
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  Recent Transactions
                </Typography>
                <Button 
                  component={RouterLink}
                  to="/transactions"
                  size="medium"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ height: 40, minWidth: 80 }} // Larger tap target
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {/* Using enhanced mobile-optimized transaction list */}
              <RecentTransactions compact enhancedMobile />
            </Paper>
            
            {/* Expense breakdown */}
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Expense Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 260 }}> {/* Taller for better visibility */}
                <ExpensePieChart compact />
              </Box>
            </Paper>
          </>
        )}
      </Box>
      
      <Box role="tabpanel" hidden={currentTab !== 2}>
        {currentTab === 2 && (
          <>
            {/* Budget status */}
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Budget Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box height={240}>
                {/* Budget vs Actual chart would go here */}
              </Box>
              <Button 
                component={RouterLink} 
                to="/budget" 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2, py: 1 }}
              >
                Manage Budget
              </Button>
            </Paper>
            
            {/* Savings Goals */}
            <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Savings Goals
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SavingsGoalDashboard compact enhanced />
            </Paper>
          </>
        )}
      </Box>
      
      {/* Bottom Navigation Bar */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10,
          boxShadow: 3
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={navValue}
          onChange={handleNavChange}
          showLabels
          sx={{ height: 60 }} // Taller for easier tapping
        >
          <BottomNavigationAction 
            label="Dashboard" 
            icon={<HomeIcon />} 
            sx={{ py: 1.5 }} // Increased padding for better tap target
          />
          <BottomNavigationAction 
            label="Transactions" 
            icon={<AccountBalanceWalletIcon />} 
            sx={{ py: 1.5 }}
          />
          <BottomNavigationAction 
            label="Reports" 
            icon={<AssessmentIcon />} 
            sx={{ py: 1.5 }}
          />
          <BottomNavigationAction 
            label="Settings" 
            icon={<SettingsIcon />} 
            sx={{ py: 1.5 }}
          />
        </BottomNavigation>
      </Paper>
      
      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add transaction" 
        sx={{ 
          position: 'fixed', 
          bottom: 76, 
          right: 16, 
          zIndex: 11,
          width: 64,
          height: 64
        }}
        onClick={handleQuickAddOpen}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </Fab>
      
      {/* Quick Add Transaction Dialog */}
      <QuickAddTransactionDialog
        open={quickAddOpen}
        onClose={handleQuickAddClose}
        fullScreen={isMobile} // Use fullscreen on mobile for better UX
      />
    </Box>
  );
};

export default MobileDashboard;