import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineIcon from '@mui/icons-material/Timeline';

import SavingsGoalList from '../components/savings/SavingsGoalList';
import SavingsGoalForm from '../components/savings/SavingsGoalForm';
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addContribution,
  changeSavingsGoalStatus,
  getSavingsStats
} from '../redux/actions/savingsGoalActions';

const Savings = () => {
  const dispatch = useDispatch();
  const savingsState = useSelector(state => state.savings);
  const { savingsGoals = [], stats = null, loading = false, error = null } = savingsState || {};
  const [createFormOpen, setCreateFormOpen] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    dispatch(getSavingsGoals());
    dispatch(getSavingsStats());
  }, [dispatch]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Handle creating a new goal
  const handleCreateGoal = async (goalData) => {
    try {
      await dispatch(createSavingsGoal(goalData));
      setCreateFormOpen(false);
      dispatch(getSavingsStats()); // Refresh stats after creating a goal
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };
  
  // Handle updating a goal
  const handleUpdateGoal = async (goalId, goalData) => {
    try {
      await dispatch(updateSavingsGoal(goalId, goalData));
      dispatch(getSavingsStats()); // Refresh stats after updating a goal
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };
  
  // Handle deleting a goal
  const handleDeleteGoal = async (goalId) => {
    try {
      await dispatch(deleteSavingsGoal(goalId));
      dispatch(getSavingsStats()); // Refresh stats after deleting a goal
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };
  
  // Handle adding a contribution
  const handleAddContribution = async (goalId, contributionData) => {
    try {
      await dispatch(addContribution(goalId, contributionData));
      dispatch(getSavingsStats()); // Refresh stats after adding a contribution
    } catch (err) {
      console.error('Error adding contribution:', err);
    }
  };
  
  // Handle changing goal status
  const handleChangeGoalStatus = async (goalId, status) => {
    try {
      await dispatch(changeSavingsGoalStatus(goalId, status));
      dispatch(getSavingsStats()); // Refresh stats after changing status
    } catch (err) {
      console.error('Error changing goal status:', err);
    }
  };
  
  // Render the savings stats
  const renderSavingsStats = () => {
    if (!stats) return null;
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Savings
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(stats.totalCurrentAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {formatCurrency(stats.totalTargetAmount)} goal amount
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.completionPercentage} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Active Goals
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.inProgressGoals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalGoals} goals total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Completed Goals
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.completedGoals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.completedGoals > 0 && (
                  <>
                    {Math.round((stats.completedGoals / stats.totalGoals) * 100)}% completion rate
                  </>
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimelineIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Remaining
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(stats.remainingAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                to reach all active goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Savings Goals
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateFormOpen(true)}
        >
          New Savings Goal
        </Button>
      </Box>
      
      {/* Display error message if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Savings stats cards */}
      {loading ? (
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        renderSavingsStats()
      )}
      
      {/* Savings goals list */}
      <SavingsGoalList
        savingsGoals={savingsGoals}
        loading={loading}
        error={error}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onAddContribution={handleAddContribution}
        onChangeGoalStatus={handleChangeGoalStatus}
      />
      
      {/* Create goal form dialog */}
      <SavingsGoalForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSubmit={handleCreateGoal}
      />
    </Box>
  );
};

export default Savings;