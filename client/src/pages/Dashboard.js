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

/**
 * Dashboard component with customizable widgets
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  
  // Track Redux store initialization for safe rendering
  const [isStoreReady, setIsStoreReady] = useState(false);
  
  // Widget configuration with visibility settings
  const [widgets, setWidgets] = useState([
    { id: 'summary-cards', name: 'Summary Cards', visible: true, safeToRender: true },
    { id: 'category-alerts', name: 'Category Budget Alerts', visible: true, safeToRender: false },
    { id: 'expense-chart', name: 'Expense Breakdown', visible: true, safeToRender: false },
    { id: 'recent-transactions', name: 'Recent Transactions', visible: true, safeToRender: false },
    { id: 'budget-vs-actual', name: 'Budget vs. Actual', visible: true, safeToRender: false },
    { id: 'spending-trends', name: 'Spending Trends', visible: true, safeToRender: false },
    { id: 'savings-goals', name: 'Savings Goals', visible: true, safeToRender: false },
    { id: 'bill-reminders', name: 'Bill Reminders', visible: true, safeToRender: false }
  ]);
  
  // Load data and preferences
  useEffect(() => {
    // Fetch data
    dispatch(getCategories());
    dispatch(getTransactions());
    
    // Load saved preferences
    try {
      const savedPreferences = localStorage.getItem('dashboardPreferences');
      if (savedPreferences) {
        setWidgets(JSON.parse(savedPreferences));
      }
    } catch (err) {
      console.error('Error loading dashboard preferences:', err);
    }
    
    // Setup event listener for preference updates
    const handlePreferencesUpdated = (event) => {
      if (event.detail && event.detail.widgets) {
        setWidgets(event.detail.widgets);
      }
    };
    
    window.addEventListener('dashboardPreferencesUpdated', handlePreferencesUpdated);
    
    // Cleanup
    return () => {
      window.removeEventListener('dashboardPreferencesUpdated', handlePreferencesUpdated);
    };
  }, [dispatch]);
  
  // Mark all widgets as safe to render for demo mode
  useEffect(() => {
    // In demo mode, we want to avoid errors from missing Redux data
    // This will make all widgets considered safe to render
    setWidgets(prevWidgets =>
      prevWidgets.map(widget => ({
        ...widget,
        safeToRender: true  // Make all widgets safe to render
      }))
    );
    setIsStoreReady(true);
  }, []);
  
  // Helper to check if a widget should be rendered
  const isWidgetVisible = (id) => {
    const widget = widgets.find(w => w.id === id);
    return widget && widget.visible && widget.safeToRender;
  };
  
  // Save preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem('dashboardPreferences', JSON.stringify(widgets));
  };
  
  // Toggle widget visibility
  const toggleWidget = (id) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    );
    setWidgets(updatedWidgets);
    
    // Save updated preferences
    localStorage.setItem('dashboardPreferences', JSON.stringify(updatedWidgets));
    
    // Dispatch custom event for other components to react
    window.dispatchEvent(
      new CustomEvent('dashboardPreferencesUpdated', { 
        detail: { widgets: updatedWidgets } 
      })
    );
  };

  // Mobile view
  if (isMobile) {
    return <MobileDashboard />;
  }
  
  // Render desktop dashboard with customizable widgets
  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      {/* Dashboard Customizer - Allows toggling widgets */}
      <DashboardCustomizer 
        widgets={widgets} 
        onToggleWidget={toggleWidget}
        onSave={savePreferences}
      />
      
      {/* Summary Cards Section */}
      {isWidgetVisible('summary-cards') && <SummaryCards />}
      
      {/* Budget Alerts Section */}
      {isWidgetVisible('category-alerts') && (
        <Box sx={{ mb: 3, mt: 3 }}>
          <CategoryBudgetAlerts />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Expense Breakdown Chart */}
        {isWidgetVisible('expense-chart') && (
          <Grid item xs={12} md={8}>
            <ExpensePieChart />
          </Grid>
        )}
        
        {/* Recent Transactions */}
        {isWidgetVisible('recent-transactions') && (
          <Grid item xs={12} md={4}>
            <RecentTransactions />
          </Grid>
        )}
        
        {/* Budget vs Actual Chart */}
        {isWidgetVisible('budget-vs-actual') && (
          <Grid item xs={12}>
            <BudgetVsActualChart />
          </Grid>
        )}
        
        {/* Spending Trends Chart */}
        {isWidgetVisible('spending-trends') && (
          <Grid item xs={12}>
            <SpendingTrendsChart />
          </Grid>
        )}
        
        {/* Savings Goals Dashboard */}
        {isWidgetVisible('savings-goals') && (
          <Grid item xs={12} md={4}>
            <SavingsGoalDashboard />
          </Grid>
        )}
        
        {/* Bill Reminders */}
        {isWidgetVisible('bill-reminders') && (
          <Grid item xs={12} md={8}>
            <BillReminders />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;