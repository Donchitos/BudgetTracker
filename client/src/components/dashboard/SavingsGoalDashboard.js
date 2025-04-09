import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import { format, differenceInDays } from 'date-fns';
import { getSavingsGoals, getSavingsStats } from '../../redux/actions/savingsGoalActions';

const SavingsGoalDashboard = () => {
  const dispatch = useDispatch();
  const savingsState = useSelector(state => state.savings);
  const { savingsGoals = [], stats = null, loading = false } = savingsState || {};
  
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
  
  // Get days remaining until target date
  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    return Math.max(0, differenceInDays(new Date(targetDate), new Date()));
  };
  
  // Format date as month/day/year
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MM/dd/yyyy');
  };
  
  // Get progress percentage
  const getProgressPercentage = (goal) => {
    if (!goal || goal.targetAmount <= 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };
  
  // Get color based on progress and time remaining
  const getProgressColor = (goal) => {
    const progressPercentage = getProgressPercentage(goal);
    
    if (progressPercentage >= 95) {
      return 'success';
    }
    
    const daysRemaining = getDaysRemaining(goal.targetDate);
    if (daysRemaining === 0) {
      return 'error';
    }
    
    // Calculate expected progress based on time elapsed
    const totalDays = differenceInDays(
      new Date(goal.targetDate),
      new Date(goal.startDate)
    );
    
    const daysElapsed = totalDays - daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    
    if (progressPercentage < expectedProgress * 0.7) {
      return 'error';
    }
    
    if (progressPercentage < expectedProgress * 0.9) {
      return 'warning';
    }
    
    return 'primary';
  };
  
  // Filter active goals
  const activeGoals = savingsGoals
    .filter(goal => goal.status === 'in_progress')
    .sort((a, b) => getDaysRemaining(a.targetDate) - getDaysRemaining(b.targetDate));
  
  // Get high priority and upcoming goals
  const priorityGoals = activeGoals
    .filter(goal => goal.priority === 'high' || getDaysRemaining(goal.targetDate) <= 30)
    .slice(0, 3);
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Savings Goals</Typography>
        </Box>
        
        {loading ? (
          <LinearProgress />
        ) : stats ? (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(stats.totalCurrentAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Saved
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">
                    {stats.inProgressGoals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Goals
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main">
                    {stats.completedGoals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : null}
        
        <Divider sx={{ my: 2 }} />
        
        {priorityGoals.length > 0 ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Priority Goals
            </Typography>
            
            <Stack spacing={2}>
              {priorityGoals.map(goal => (
                <Box key={goal._id} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" noWrap title={goal.name}>
                      {goal.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getDaysRemaining(goal.targetDate) <= 7 ? (
                        <Chip 
                          size="small" 
                          color="error" 
                          icon={<TimerIcon />} 
                          label={`${getDaysRemaining(goal.targetDate)} days left`}
                        />
                      ) : getDaysRemaining(goal.targetDate) <= 30 ? (
                        <Chip 
                          size="small" 
                          color="warning" 
                          icon={<TimerIcon />} 
                          label={`${getDaysRemaining(goal.targetDate)} days left`}
                        />
                      ) : goal.priority === 'high' ? (
                        <Chip 
                          size="small" 
                          color="error" 
                          label="High Priority"
                        />
                      ) : null}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressPercentage(goal)} 
                        color={getProgressColor(goal)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {getProgressPercentage(goal).toFixed(0)}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)} by {formatDate(goal.targetDate)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" color="text.secondary">
              No active savings goals
            </Typography>
            <Button
              component={RouterLink}
              to="/savings"
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
            >
              Create a Savings Goal
            </Button>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button 
          component={RouterLink} 
          to="/savings" 
          endIcon={<ArrowForwardIcon />}
          size="small"
        >
          Manage Goals
        </Button>
      </CardActions>
    </Card>
  );
};

export default SavingsGoalDashboard;