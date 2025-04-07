import React, { useEffect, useState } from 'react';
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
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  TextField
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getBudgetVsActual } from '../../redux/actions/analyticsActions';

const BudgetVsActualAnalysis = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.analytics.budgetVsActual);
  
  // Current month and year for filter
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  
  // Fetch data based on filters
  useEffect(() => {
    dispatch(getBudgetVsActual({ month, year }));
  }, [dispatch, month, year]);
  
  // Handle month change
  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };
  
  // Format dollar amount
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'over_budget':
        return '#f44336'; // Red
      case 'warning':
        return '#ff9800'; // Orange
      case 'on_track':
        return '#4caf50'; // Green
      default:
        return '#2196f3'; // Blue
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'over_budget':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'on_track':
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };
  
  // Generate months for select
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  // Generate years for select (current year and 2 previous years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];
  
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
        Budget vs actual data is not available.
      </Alert>
    );
  }
  
  // Prepare data for the chart
  const chartData = data.categories
    .filter(cat => cat.budget > 0) // Only include categories with a budget
    .map(category => ({
      name: category.name,
      budget: category.budget,
      actual: category.actual,
      remaining: category.remaining > 0 ? category.remaining : 0,
      overspent: category.remaining < 0 ? Math.abs(category.remaining) : 0,
      percentUsed: category.percentUsed,
      status: category.status
    }))
    .sort((a, b) => b.percentUsed - a.percentUsed); // Sort by highest percentage first
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Budget vs Actual Analysis
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ width: 140 }}>
            <InputLabel id="month-select-label">Month</InputLabel>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={month}
              label="Month"
              onChange={handleMonthChange}
            >
              {months.map(m => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ width: 100 }}>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={year}
              label="Year"
              onChange={handleYearChange}
            >
              {years.map(y => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h5">
                {formatCurrency(data.summary.totalBudget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h5" color={data.summary.totalSpent > data.summary.totalBudget ? 'error.main' : 'text.primary'}>
                {formatCurrency(data.summary.totalSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h5" color={data.summary.totalRemaining < 0 ? 'error.main' : 'success.main'}>
                {formatCurrency(data.summary.totalRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Budget Used
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(data.summary.percentUsed, 100)} 
                    color={
                      data.summary.percentUsed >= 100 ? 'error' : 
                      data.summary.percentUsed >= 85 ? 'warning' : 
                      'success'
                    }
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(data.summary.percentUsed)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Budget vs Actual Chart */}
      <Typography variant="h6" gutterBottom>
        Category Breakdown
      </Typography>
      
      <Box sx={{ height: 400, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barGap={0}
            barCategoryGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <RechartsTooltip 
              formatter={(value, name) => [`$${value}`, name === 'remaining' ? 'Remaining' : name === 'overspent' ? 'Overspent' : name]}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#8884d8" />
            <Bar dataKey="actual" name="Actual Spent" fill="#82ca9d">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Detailed Category Table */}
      <Typography variant="h6" gutterBottom>
        Detailed Budget Status
      </Typography>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Budget</TableCell>
              <TableCell align="right">Actual</TableCell>
              <TableCell align="right">Remaining</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.categories.map((category) => (
              <TableRow key={category.name}>
                <TableCell component="th" scope="row">
                  {category.name}
                </TableCell>
                <TableCell align="right">{formatCurrency(category.budget)}</TableCell>
                <TableCell align="right">{formatCurrency(category.actual)}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    color: category.remaining < 0 ? 'error.main' : 
                           category.remaining === 0 ? 'warning.main' : 
                           'success.main'
                  }}
                >
                  {formatCurrency(category.remaining)}
                </TableCell>
                <TableCell>
                  <Tooltip title={`${Math.round(category.percentUsed)}% of budget used`}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(category.percentUsed, 100)} 
                          color={
                            category.percentUsed >= 100 ? 'error' : 
                            category.percentUsed >= 85 ? 'warning' : 
                            'success'
                          }
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(category.percentUsed)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  {getStatusIcon(category.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BudgetVsActualAnalysis;