import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import { getCategories } from '../redux/actions/categoryActions';
import { getTransactions } from '../redux/actions/transactionActions';
import MonthlyBudgetCycle from '../components/budget/MonthlyBudgetCycle';
import BudgetAdjustmentTool from '../components/budget/BudgetAdjustmentTool';
import { Link } from 'react-router-dom';

const BudgetManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  
  // Load data when component mounts
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getTransactions());
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Budget Management
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/categories"
        >
          Manage Categories
        </Button>
      </Box>
      
      {/* Tabs for different budget tools */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="budget management tabs"
        >
          <Tab label="Monthly Budget Cycle" />
          <Tab label="Budget Adjustment Tool" />
        </Tabs>
      </Box>
      
      <Grid container spacing={3}>
        {/* Conditional rendering based on active tab */}
        {activeTab === 0 ? (
          <Grid item xs={12}>
            <MonthlyBudgetCycle />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <BudgetAdjustmentTool />
          </Grid>
        )}
        
        {/* Quick links to budget-related features */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Tools
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    component={Link}
                    to="/budget-templates"
                  >
                    Budget Templates
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    component={Link}
                    to="/reports"
                  >
                    Budget Reports
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    component={Link}
                    to="/transactions"
                  >
                    Transactions
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    component={Link}
                    to="/"
                  >
                    Dashboard
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetManagement;