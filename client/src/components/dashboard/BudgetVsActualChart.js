import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const BudgetVsActualChart = () => {
  const { loading, error, data } = useSelector(state => state.dashboard);
  const { categories } = useSelector(state => state.categories);
  const { transactions } = useSelector(state => state.transactions);
  
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState('current'); // 'current', 'previous', 'last3', 'last6'
  
  // Generate data for the chart based on categories, their budgets, and actual spending
  useEffect(() => {
    if (!categories || !transactions) return;
    
    // Get date range based on selected period
    const today = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'previous':
        startDate = startOfMonth(subMonths(today, 1));
        endDate = endOfMonth(subMonths(today, 1));
        break;
      case 'last3':
        startDate = startOfMonth(subMonths(today, 3));
        endDate = endOfMonth(today);
        break;
      case 'last6':
        startDate = startOfMonth(subMonths(today, 6));
        endDate = endOfMonth(today);
        break;
      case 'current':
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
    }
    
    // Filter transactions by date range and expense type
    const filteredTransactions = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) >= startDate && 
      new Date(t.date) <= endDate
    );
    
    // Calculate spending by category
    const spendingByCategory = {};
    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.category ? transaction.category._id : 'uncategorized';
      
      if (!spendingByCategory[categoryId]) {
        spendingByCategory[categoryId] = 0;
      }
      
      spendingByCategory[categoryId] += transaction.amount;
    });
    
    // Prepare data for chart
    const labels = [];
    const budgetData = [];
    const actualData = [];
    const backgroundColors = [];
    const borderColors = [];
    
    // Only include categories with budget > 0 or actual spending > 0
    categories
      .filter(category => category.budget > 0 || spendingByCategory[category._id] > 0)
      .sort((a, b) => {
        // Sort by spending (highest first)
        const spendingA = spendingByCategory[a._id] || 0;
        const spendingB = spendingByCategory[b._id] || 0;
        return spendingB - spendingA;
      })
      .slice(0, 10) // Limit to top 10 categories
      .forEach(category => {
        labels.push(category.name);
        budgetData.push(category.budget || 0);
        actualData.push(spendingByCategory[category._id] || 0);
        
        // Determine colors based on budget vs actual
        const budget = category.budget || 0;
        const actual = spendingByCategory[category._id] || 0;
        const isOverBudget = actual > budget && budget > 0;
        
        // Set colors - use category color for budget, and derived colors for actual
        const baseColor = category.color || '#2196f3';
        const lighterColor = adjustColorLightness(baseColor, 0.2); // Lighter for budget
        
        backgroundColors.push(isOverBudget ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)');
        borderColors.push(isOverBudget ? '#f44336' : '#4caf50');
      });
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Budget',
          data: budgetData,
          backgroundColor: 'rgba(33, 150, 243, 0.5)',
          borderColor: '#2196f3',
          borderWidth: 1
        },
        {
          label: 'Actual',
          data: actualData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    });
  }, [categories, transactions, period]);
  
  // Helper function to adjust color lightness
  const adjustColorLightness = (hex, percent) => {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Adjust lightness
    r = Math.floor(r + (255 - r) * percent);
    g = Math.floor(g + (255 - g) * percent);
    b = Math.floor(b + (255 - b) * percent);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };
  
  // Format date for display
  const formatDateRange = () => {
    const today = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'previous':
        startDate = startOfMonth(subMonths(today, 1));
        endDate = endOfMonth(subMonths(today, 1));
        break;
      case 'last3':
        startDate = startOfMonth(subMonths(today, 3));
        endDate = endOfMonth(today);
        break;
      case 'last6':
        startDate = startOfMonth(subMonths(today, 6));
        endDate = endOfMonth(today);
        break;
      case 'current':
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
    }
    
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };
  
  // Calculate total budget and spending
  const calculateTotals = () => {
    if (!chartData) return { budget: 0, actual: 0, difference: 0, percentUsed: 0 };
    
    const totalBudget = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
    const totalActual = chartData.datasets[1].data.reduce((sum, val) => sum + val, 0);
    const difference = totalBudget - totalActual;
    const percentUsed = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
    
    return { budget: totalBudget, actual: totalActual, difference, percentUsed };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const totals = calculateTotals();
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.raw);
          }
        }
      }
    }
  };
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="Budget vs. Actual Spending" 
        action={
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={period}
              onChange={handlePeriodChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="current">Current Month</MenuItem>
              <MenuItem value="previous">Previous Month</MenuItem>
              <MenuItem value="last3">Last 3 Months</MenuItem>
              <MenuItem value="last6">Last 6 Months</MenuItem>
            </Select>
          </FormControl>
        }
        subheader={formatDateRange()}
      />
      <Divider />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !chartData ? (
          <Alert severity="info">No data available for the selected period.</Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Budget</Typography>
                <Typography variant="h6">{formatCurrency(totals.budget)}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Actual Spending</Typography>
                <Typography variant="h6">{formatCurrency(totals.actual)}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Difference</Typography>
                <Typography 
                  variant="h6" 
                  color={totals.difference >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(Math.abs(totals.difference))} 
                  {totals.difference >= 0 ? ' Under' : ' Over'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Budget Used</Typography>
                <Typography 
                  variant="h6" 
                  color={
                    totals.percentUsed > 100 ? 'error.main' : 
                    totals.percentUsed > 90 ? 'warning.main' : 
                    'success.main'
                  }
                >
                  {totals.percentUsed}%
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ height: 300 }}>
              <Bar data={chartData} options={options} />
            </Box>
            
            {/* Alert for over-budget categories */}
            {chartData.datasets[1].data.some((actual, index) => 
              actual > chartData.datasets[0].data[index] && chartData.datasets[0].data[index] > 0
            ) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You have categories that are over budget. Consider adjusting your spending or increasing your budget.
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetVsActualChart;