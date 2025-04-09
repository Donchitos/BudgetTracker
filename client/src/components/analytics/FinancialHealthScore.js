import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaidIcon from '@mui/icons-material/Paid';
import { getFinancialHealthScore } from '../../redux/actions/analyticsActions';

const FinancialHealthScore = () => {
  const dispatch = useDispatch();
  const analyticsState = useSelector(state => state.analytics);
  const { financialHealth = {} } = analyticsState || {};
  const { data = null, loading = false, error = null } = financialHealth || {};
  
  useEffect(() => {
    dispatch(getFinancialHealthScore());
  }, [dispatch]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Financial health data is not available.
      </Alert>
    );
  }
  
  const { score, rating, components, insights, recommendations } = data;
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 70) return '#8bc34a'; // Light Green
    if (score >= 60) return '#ffeb3b'; // Yellow
    if (score >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };
  
  const scoreColor = getScoreColor(score);
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Financial Health Score
      </Typography>
      
      <Grid container spacing={3}>
        {/* Score Display */}
        <Grid item xs={12} md={4}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}>
            <Box sx={{ 
              position: 'relative', 
              width: 180, 
              height: 180, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CircularProgress 
                variant="determinate" 
                value={score} 
                size={180}
                thickness={6}
                sx={{ 
                  color: scoreColor,
                  position: 'absolute',
                  zIndex: 1
                }}
              />
              <CircularProgress 
                variant="determinate" 
                value={100} 
                size={180}
                thickness={6}
                sx={{ 
                  color: 'grey.200',
                  position: 'absolute',
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column' 
              }}>
                <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
                  {score}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  out of 100
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h5" sx={{ mt: 2, color: scoreColor, fontWeight: 'bold' }}>
              {rating}
            </Typography>
          </Box>
        </Grid>
        
        {/* Score Components */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Components
          </Typography>
          
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <SavingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Savings Rate" 
                secondary={`${components.savingsRate.value.toFixed(1)}% of income saved`} 
              />
              <Chip 
                label={`+${components.savingsRate.score}`} 
                color={components.savingsRate.score > 15 ? 'success' : 'primary'} 
                size="small" 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <AccountBalanceIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Budget Adherence" 
                secondary={
                  components.budgetAdherence.overBudget === 0 
                    ? 'All spending within budget' 
                    : `${components.budgetAdherence.overBudget} categories over budget`
                } 
              />
              <Chip 
                label={`+${components.budgetAdherence.score}`} 
                color={components.budgetAdherence.score > 10 ? 'success' : 'primary'} 
                size="small" 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <PaidIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Income/Expense Ratio" 
                secondary={`${(components.incomeExpenseRatio.value * 100).toFixed(1)}% of income spent`} 
              />
              <Chip 
                label={`+${components.incomeExpenseRatio.score}`} 
                color={components.incomeExpenseRatio.score > 8 ? 'success' : 'primary'} 
                size="small" 
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Insights & Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Key Insights
          </Typography>
          
          <List disablePadding>
            {insights.map((insight, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {insight.type === 'positive' && <TrendingUpIcon color="success" />}
                  {insight.type === 'negative' && <TrendingDownIcon color="error" />}
                  {insight.type === 'warning' && <WarningIcon color="warning" />}
                  {insight.type === 'neutral' && <InfoIcon color="info" />}
                </ListItemIcon>
                <ListItemText 
                  primary={insight.title} 
                  secondary={insight.description} 
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          
          <List disablePadding>
            {recommendations.map((recommendation, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={recommendation.title} 
                  secondary={recommendation.description} 
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FinancialHealthScore;