import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Tooltip,
  IconButton
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth,
  isToday,
  getDaysInMonth,
  differenceInDays
} from 'date-fns';
import { getCategories } from '../../redux/actions/categoryActions';
import { getTransactions } from '../../redux/actions/transactionActions';

/**
 * MonthlyBudgetCycle component
 * 
 * Displays and manages budget cycles with clear delineation of periods and rollover options
 */
const MonthlyBudgetCycle = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(state => state.categories);
  const { transactions } = useSelector(state => state.transactions);
  
  // State for selected month and budget period
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [budgetPeriodType, setBudgetPeriodType] = useState('calendar');
  const [enableRollover, setEnableRollover] = useState(false);
  const [budgetCycleData, setBudgetCycleData] = useState(null);
  
  // Load data when component mounts
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getTransactions());
  }, [dispatch]);
  
  // Calculate budget period dates
  const getBudgetPeriodDates = (date) => {
    const calendarMonth = {
      start: startOfMonth(date),
      end: endOfMonth(date)
    };
    
    // For this demo, we'll just use calendar month
    // In a real app, you might calculate custom periods too
    return calendarMonth;
  };
  
  // Navigate to previous month
  const handlePreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };
  
  // Navigate to next month
  const handleNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Navigate to current month
  const handleCurrentMonth = () => {
    setSelectedDate(new Date());
  };
  
  // Toggle rollover setting
  const handleRolloverToggle = () => {
    setEnableRollover(!enableRollover);
  };
  
  // Handle budget period type change
  const handlePeriodTypeChange = (e) => {
    setBudgetPeriodType(e.target.value);
  };
  
  // Calculate budget cycle progress percentage
  const calculateProgress = (start, end) => {
    const today = new Date();
    if (today < start) return 0;
    if (today > end) return 100;
    
    const totalDays = differenceInDays(end, start) + 1;
    const daysElapsed = differenceInDays(today, start) + 1;
    return Math.round((daysElapsed / totalDays) * 100);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate budget cycle statistics
  useEffect(() => {
    if (!categories || !transactions) return;
    
    const periodDates = getBudgetPeriodDates(selectedDate);
    const { start, end } = periodDates;
    
    // Filter transactions to current period
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
    
    // Calculate total budget and spending
    const totalBudget = categories.reduce((sum, category) => sum + (category.budget || 0), 0);
    
    const totalSpent = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate remaining amount and daily budget
    const remaining = totalBudget - totalSpent;
    const daysInPeriod = getDaysInMonth(selectedDate);
    const daysRemaining = differenceInDays(end, new Date()) + 1;
    const dailyBudget = totalBudget / daysInPeriod;
    
    // Only calculate daily remaining if days remaining > 0
    const dailyRemaining = daysRemaining > 0 ? remaining / daysRemaining : 0;
    
    // Calculate rollover amount from previous month (simplified)
    const rolloverAmount = enableRollover ? Math.max(0, 500) : 0; // Simplified for demo
    
    // Progress percentage
    const progressPercentage = calculateProgress(start, end);
    
    // Days elapsed
    const daysElapsed = daysInPeriod - daysRemaining;
    
    // Set budget cycle data
    setBudgetCycleData({
      periodStart: start,
      periodEnd: end,
      totalBudget,
      totalSpent,
      totalIncome,
      remaining,
      rolloverAmount,
      daysInPeriod,
      daysElapsed,
      daysRemaining,
      dailyBudget,
      dailyRemaining,
      progressPercentage,
      isCurrentMonth: isSameMonth(selectedDate, new Date())
    });
  }, [selectedDate, categories, transactions, enableRollover, budgetPeriodType]);
  
  if (categoriesLoading || !budgetCycleData) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Monthly Budget Cycle</Typography>
        <Tooltip title="Information about your budget cycle and spending patterns for the selected period">
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Month navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handlePreviousMonth} size="small">
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        
        <Typography variant="h6" sx={{ mx: 2, flexGrow: 1, textAlign: 'center' }}>
          {format(selectedDate, 'MMMM yyyy')}
        </Typography>
        
        <IconButton onClick={handleNextMonth} size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
        
        {!budgetCycleData.isCurrentMonth && (
          <Button 
            startIcon={<TodayIcon />} 
            onClick={handleCurrentMonth} 
            size="small" 
            variant="outlined" 
            sx={{ ml: 2 }}
          >
            Current Month
          </Button>
        )}
      </Box>
      
      {/* Budget period and rollover settings */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="budget-period-label">Budget Period</InputLabel>
            <Select
              labelId="budget-period-label"
              value={budgetPeriodType}
              label="Budget Period"
              onChange={handlePeriodTypeChange}
            >
              <MenuItem value="calendar">Calendar Month</MenuItem>
              <MenuItem value="custom" disabled>Custom Period (Pro)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={enableRollover}
                onChange={handleRolloverToggle}
                color="primary"
              />
            }
            label="Enable Budget Rollover"
          />
          <Tooltip title="When enabled, unspent budget will roll over to the next month">
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      
      {/* Budget cycle progress */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Budget Cycle Progress
          </Typography>
          
          <Box sx={{ position: 'relative', height: 24, bgcolor: theme.palette.grey[200], borderRadius: 1, mb: 1 }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${budgetCycleData.progressPercentage}%`,
                bgcolor: budgetCycleData.progressPercentage > 95 
                  ? theme.palette.error.main 
                  : budgetCycleData.progressPercentage > 75 
                    ? theme.palette.warning.main 
                    : theme.palette.success.main,
                borderRadius: 1,
                transition: 'width 0.5s ease-in-out'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: budgetCycleData.progressPercentage > 50 
                    ? '#fff' 
                    : theme.palette.text.primary 
                }}
              >
                {budgetCycleData.progressPercentage}% Complete
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">
              {format(budgetCycleData.periodStart, 'MMM d')}
            </Typography>
            <Typography variant="caption">
              Day {budgetCycleData.daysElapsed} of {budgetCycleData.daysInPeriod}
            </Typography>
            <Typography variant="caption">
              {format(budgetCycleData.periodEnd, 'MMM d')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* Budget summary */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total Budget
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(budgetCycleData.totalBudget)}
              </Typography>
              {budgetCycleData.rolloverAmount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    label={`+${formatCurrency(budgetCycleData.rolloverAmount)} Rollover`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.3)', 
                      color: 'inherit',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total Spent
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(budgetCycleData.totalSpent)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {(budgetCycleData.totalSpent / budgetCycleData.totalBudget * 100).toFixed(0)}% of budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Remaining Budget
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(budgetCycleData.remaining)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <KeyboardDoubleArrowRightIcon sx={{ fontSize: 14, mr: 0.5 }} />
                <Typography variant="caption">
                  {formatCurrency(budgetCycleData.dailyRemaining)} / day remaining
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total Income
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(budgetCycleData.totalIncome)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Days Remaining: {budgetCycleData.daysRemaining}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Daily budget indicator */}
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Daily Budget: <strong>{formatCurrency(budgetCycleData.dailyBudget)}</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" align="right">
              Next Budget Cycle: <strong>{format(addMonths(budgetCycleData.periodStart, 1), 'MMMM d, yyyy')}</strong>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MonthlyBudgetCycle;