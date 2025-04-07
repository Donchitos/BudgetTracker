import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine
} from 'recharts';
import { getCashflowPrediction } from '../../redux/actions/forecastActions';

/**
 * Cashflow Prediction component
 * Shows predicted income, expenses, and cash flow for upcoming months
 */
const CashflowPrediction = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { data, loading, error } = useSelector(state => state.forecast.cashflowPrediction);
  
  // Load cashflow prediction when component mounts
  useEffect(() => {
    dispatch(getCashflowPrediction());
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
        Cashflow prediction data is not available.
      </Alert>
    );
  }
  
  const { cashflow, topCategories, insights, summary } = data;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Get icon for insight
  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return <TrendingUpIcon color="success" />;
      case 'negative':
        return <TrendingDownIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        3-Month Cashflow Prediction
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Predicted Income
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(summary.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Predicted Expenses
              </Typography>
              <Typography variant="h5" color="error">
                {formatCurrency(summary.totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Net Cashflow
              </Typography>
              <Typography 
                variant="h5" 
                color={summary.netCashflow >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(summary.netCashflow)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Predicted Savings Rate
              </Typography>
              <Typography 
                variant="h5" 
                color={summary.savingsRate >= 15 ? 'success.main' : 
                       summary.savingsRate >= 5 ? 'warning.main' : 'error.main'}
              >
                {summary.savingsRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Cashflow Chart */}
      <Typography variant="h6" gutterBottom>
        Monthly Breakdown
      </Typography>
      
      <Box sx={{ height: 350, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={cashflow}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" tickFormatter={(value) => `$${value}`} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value, name) => {
              if (name === 'savingsRate') return [`${value.toFixed(1)}%`, 'Savings Rate'];
              return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)];
            }} />
            <Legend />
            <Bar yAxisId="left" dataKey="income" fill={theme.palette.success.main} name="Income" />
            <Bar yAxisId="left" dataKey="expenses" fill={theme.palette.error.main} name="Expenses" />
            <Line yAxisId="left" type="monotone" dataKey="net" stroke={theme.palette.primary.main} name="Net Cashflow" />
            <Line yAxisId="right" type="monotone" dataKey="savingsRate" stroke={theme.palette.secondary.main} name="Savings Rate" />
            <ReferenceLine yAxisId="left" y={0} stroke="#000" />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      
      <Grid container spacing={3}>
        {/* Top Expense Categories */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Top Expense Categories
          </Typography>
          
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCategories}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                <Bar dataKey="amount" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        {/* Insights */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Financial Insights
          </Typography>
          
          <List>
            {insights.map((insight, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemIcon>
                  {getInsightIcon(insight.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {insight.title}
                    </Typography>
                  }
                  secondary={insight.description}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Prediction Disclaimer */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          These predictions are based on your historical transactions, recurring transactions, and budget templates. 
          Actual results may vary based on unexpected expenses or income changes.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default CashflowPrediction;