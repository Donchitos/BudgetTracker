import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Skeleton,
  Button,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { alpha } from '@mui/material/styles';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * BudgetVsActualChart component
 * 
 * Interactive chart comparing budgeted vs. actual spending by category
 */
const BudgetVsActualChart = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get categories with fallback for demo mode
  const categoryState = useSelector(state => state.category);
  const categories = categoryState?.categories || [];
  
  // Get transactions with fallback for demo mode
  const transactionState = useSelector(state => state.transaction);
  const transactions = transactionState?.transactions || [];
  
  // Chart data and UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('current');
  const [viewMode, setViewMode] = useState('byCategory');
  const [chartData, setChartData] = useState([]);
  
  // Calculate chart data based on transactions and categories
  useEffect(() => {
    if (!categories || !transactions) {
      setLoading(false);
      return;
    }
    
    // Set loading state on first load only
    if (chartData.length === 0 && !refreshing) {
      setLoading(true);
    }
    
    // Get date range based on selected timeframe
    const getDateRange = () => {
      const now = new Date();
      
      switch (timeframe) {
        case 'current':
          return {
            start: startOfMonth(now),
            end: endOfMonth(now),
            label: format(now, 'MMMM yyyy')
          };
        case '1month':
          const lastMonth = subMonths(now, 1);
          return {
            start: startOfMonth(lastMonth),
            end: endOfMonth(lastMonth),
            label: format(lastMonth, 'MMMM yyyy')
          };
        case '3month':
          const threeMonthsAgo = subMonths(now, 3);
          return {
            start: startOfMonth(threeMonthsAgo),
            end: endOfMonth(now),
            label: `${format(threeMonthsAgo, 'MMM')} - ${format(now, 'MMM yyyy')}`
          };
        default:
          return {
            start: startOfMonth(now),
            end: endOfMonth(now),
            label: format(now, 'MMMM yyyy')
          };
      }
    };
    
    // Get transactions within date range
    const { start, end } = getDateRange();
    const filteredTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date >= start && date <= end && transaction.type === 'expense';
    });
    
    if (viewMode === 'byCategory') {
      // Create chart data by category
      const categoryData = categories
        .filter(category => category.budget > 0) // Only include categories with budgets
        .map(category => {
          const spending = filteredTransactions
            .filter(t => t.category && t.category._id === category._id)
            .reduce((sum, t) => sum + t.amount, 0);
            
          const budget = category.budget;
          const percentage = budget > 0 ? (spending / budget) * 100 : 0;
          
          return {
            name: category.name,
            budget,
            actual: spending,
            percentage,
            difference: budget - spending,
            color: category.color || getRandomColor(category.name)
          };
        })
        .filter(item => item.budget > 0 || item.actual > 0) // Only include items with budget or spending
        .sort((a, b) => b.actual - a.actual); // Sort by actual spending (highest first)
        
      setChartData(categoryData);
    } else {
      // Create chart data by month (for timeframes > 1 month)
      // This is simplified for now - would be expanded for multi-month analysis
      const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
      const totalSpending = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      setChartData([
        {
          name: 'Total Budget',
          budget: totalBudget,
          actual: totalSpending,
          percentage: totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0,
          difference: totalBudget - totalSpending
        }
      ]);
    }
    
    // Clear loading and error states
    setLoading(false);
    setRefreshing(false);
    setError(null);
    
  }, [categories, transactions, timeframe, viewMode]);
  
  // Get random color based on string
  const getRandomColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const color = `#${((hash & 0xFFFFFF) | 0x1000000).toString(16).substring(1)}`;
    const lighterColor = alpha(color, 0.7);
    
    return color;
  };
  
  // Custom formatter for currency values in the chart tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const budgetValue = formatCurrency(data.budget);
      const actualValue = formatCurrency(data.actual);
      const difference = formatCurrency(data.difference);
      const isOverBudget = data.difference < 0;
      
      return (
        <Paper elevation={2} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Budget:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{budgetValue}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Actual:</Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'medium',
                color: isOverBudget ? 'error.main' : 'success.main' 
              }}
            >
              {actualValue}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {isOverBudget ? 'Over Budget:' : 'Remaining:'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold',
                color: isOverBudget ? 'error.main' : 'success.main' 
              }}
            >
              {isOverBudget ? `-${formatCurrency(Math.abs(data.difference))}` : difference}
            </Typography>
          </Box>
          {data.percentage !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                % of Budget:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {data.percentage.toFixed(0)}%
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }
    
    return null;
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };
  
  // Handle view mode change
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    // In a real implementation, you might want to fetch fresh data from the server
    // For now, we'll just simulate a refresh with a timeout
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">Budget vs. Actual</Typography>
          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              sx={{ ml: 1 }}
            >
              {refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="View details information about your budget vs actual spending">
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl size="small" fullWidth>
            <InputLabel id="timeframe-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-label"
              value={timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
              disabled={loading || refreshing}
            >
              <MenuItem value="current">Current Month</MenuItem>
              <MenuItem value="1month">Last Month</MenuItem>
              <MenuItem value="3month">Last 3 Months</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl size="small" fullWidth>
            <InputLabel id="view-mode-label">View</InputLabel>
            <Select
              labelId="view-mode-label"
              value={viewMode}
              label="View"
              onChange={handleViewModeChange}
              disabled={loading || refreshing}
            >
              <MenuItem value="byCategory">By Category</MenuItem>
              <MenuItem value="overall">Overall</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {loading ? (
        <Box sx={{ height: 300, mt: 1 }}>
          <Skeleton variant="rectangular" height={250} animation="wave" />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Skeleton variant="text" width="60%" />
          </Box>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Try Again'}
          </Button>
        </Box>
      ) : chartData.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No budget data available for this period
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small"
            sx={{ mt: 1 }}
          >
            Refresh
          </Button>
        </Box>
      ) : (
        <Box sx={{ height: 300, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={viewMode === 'overall' ? 60 : 20}
              barGap={viewMode === 'overall' ? 0 : 2}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: theme.palette.divider }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
                tickLine={false}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                payload={[
                  { value: 'Budget', type: 'square', color: theme.palette.primary.main },
                  { value: 'Actual', type: 'square', color: theme.palette.secondary.main }
                ]}
              />
              <Bar 
                dataKey="budget" 
                name="Budget" 
                fill={theme.palette.primary.main} 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="actual" 
                name="Actual" 
                fill={theme.palette.secondary.main} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
      
      {/* Loading overlay for refresh */}
      {refreshing && !loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Chart summary info */}
      {chartData.length > 0 && !loading && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Total Budget
              </Typography>
              <Typography variant="subtitle1">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.budget, 0))}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Total Spent
              </Typography>
              <Typography variant="subtitle1">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.actual, 0))}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Remaining
              </Typography>
              <Typography
                variant="subtitle1"
                color={chartData.reduce((sum, item) => sum + item.difference, 0) < 0 ? 'error.main' : 'success.main'}
              >
                {formatCurrency(chartData.reduce((sum, item) => sum + item.difference, 0))}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default BudgetVsActualChart;