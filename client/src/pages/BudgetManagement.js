import React from 'react';
import { Box, Typography, Container, Tabs, Tab, Paper, Divider, Button, Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import MonthlyBudgetCycle from '../components/budget/MonthlyBudgetCycle';
import BudgetAdjustmentTool from '../components/budget/BudgetAdjustmentTool';
import BudgetVsActualChart from '../components/dashboard/BudgetVsActualChart';
import CategoryBudgetAlerts from '../components/dashboard/CategoryBudgetAlerts';

/**
 * BudgetManagement page
 * 
 * Combines all budget-related features in one centralized location, including:
 * - Monthly budget cycle tracking
 * - Budget vs. actual visualizations
 * - Category budget alerts
 * - Budget adjustment tools
 */
const BudgetManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.hash ? location.hash.substring(1) : 'overview';
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    navigate(`#${newValue}`);
  };
  
  // Navigate to budget templates page
  const handleNavigateToTemplates = () => {
    navigate('/budget-templates');
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Budget Management</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleNavigateToTemplates}
          >
            Budget Templates
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your budget cycles, track spending against budget, and receive alerts when approaching limits.
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Adjust Budget" value="adjust" />
            <Tab label="Analysis" value="analysis" />
          </Tabs>
        </Paper>
        
        {/* Overview Tab */}
        {currentTab === 'overview' && (
          <Box>
            <CategoryBudgetAlerts />
            <MonthlyBudgetCycle />
            <BudgetVsActualChart />
          </Box>
        )}
        
        {/* Adjust Budget Tab */}
        {currentTab === 'adjust' && (
          <Box>
            <BudgetAdjustmentTool />
          </Box>
        )}
        
        {/* Analysis Tab */}
        {currentTab === 'analysis' && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <BudgetVsActualChart />
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Budget Efficiency</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    Advanced budget analysis features will be available in a future update. Stay tuned!
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BudgetManagement;