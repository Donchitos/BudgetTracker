import React, { useEffect, useState } from 'react';
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
  useTheme,
  Button,
  Skeleton,
  Fade,
  IconButton,
  useMediaQuery,
  Menu,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data, loading, error } = useSelector(state => state.forecast.cashflowPrediction);
  
  // Local state for enhanced UI experience
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [predictionMonths, setPredictionMonths] = useState(3);
  const [includeRecurring, setIncludeRecurring] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Load cashflow prediction when component mounts
  useEffect(() => {
    dispatch(getCashflowPrediction({
      months: predictionMonths,
      includeRecurring
    }));
  }, [dispatch, predictionMonths, includeRecurring]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Get fresh prediction data
    dispatch(getCashflowPrediction({
      months: predictionMonths,
      includeRecurring
    }))
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  };
  
  // Handle settings toggle
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };
  
  // Handle months slider change
  const handleMonthsChange = (event, newValue) => {
    setPredictionMonths(newValue);
  };
  
  // Handle recurring transactions toggle
  const handleRecurringToggle = (event) => {
    setIncludeRecurring(event.target.checked);
  };
  
  // Menu handlers
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Generate skeleton placeholders for loading state
  const renderSkeletons = () => (
    <Fade in={loading && !refreshing}>
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
        
        <Skeleton variant="text" width="200px" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={350} sx={{ mb: 3, borderRadius: 1 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="180px" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="160px" height={30} sx={{ mb: 2 }} />
            {[1, 2, 3].map((item) => (
              <Box sx={{ display: 'flex', mb: 2 }} key={item}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="90%" height={20} />
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
  
  // Error display with retry button
  if (error && !refreshing && !loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Cash Flow Prediction</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </Box>
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Paper>
    );
  }
  
  // Show no data message
  if (!data && !loading && !error) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Cash Flow Prediction</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Loading...' : 'Generate Prediction'}
          </Button>
        </Box>
        <Alert severity="info" sx={{ mt: 2 }}>
          Cashflow prediction data is not available. Generate a prediction to see your future financial outlook.
        </Alert>
      </Paper>
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
    <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
      {/* Header with controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom={false}>
          {predictionMonths}-Month Cashflow Prediction
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Refresh predictions">
            <IconButton
              color="primary"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              size="small"
              sx={{ mr: 1 }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Prediction settings">
            <IconButton
              color={showSettings ? "primary" : "default"}
              onClick={handleSettingsToggle}
              size="small"
              sx={{ mr: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreHorizIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              handleMenuClose();
              // Add export functionality here
            }}>
              Export Prediction Data
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              // Add methodology info dialog here
            }}>
              Prediction Methodology
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Settings panel */}
      <Fade in={showSettings}>
        <Box sx={{
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.background.default,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle1" gutterBottom>Prediction Settings</Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Prediction Period: {predictionMonths} months
              </Typography>
              <Slider
                value={predictionMonths}
                onChange={handleMonthsChange}
                step={1}
                marks={[
                  { value: 1, label: '1m' },
                  { value: 3, label: '3m' },
                  { value: 6, label: '6m' },
                  { value: 12, label: '12m' }
                ]}
                min={1}
                max={12}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeRecurring}
                    onChange={handleRecurringToggle}
                    color="primary"
                  />
                }
                label="Include recurring transactions"
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>
      
      {/* Loading skeleton */}
      {loading && !refreshing && renderSkeletons()}
      
      {/* Actual content - only show when we have data and not in the initial loading state */}
      <Fade in={!loading || (refreshing && data)}>
        <Box sx={{ visibility: loading && !refreshing ? 'hidden' : 'visible', position: 'relative' }}>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
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
              <Card elevation={3} sx={{
                borderLeft: `4px solid ${theme.palette.error.main}`,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
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
              <Card elevation={3} sx={{
                borderLeft: summary.netCashflow >= 0 ? `4px solid ${theme.palette.success.main}` : `4px solid ${theme.palette.error.main}`,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
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
              <Card elevation={3} sx={{
                borderLeft: summary.savingsRate >= 15 ? `4px solid ${theme.palette.success.main}` :
                          summary.savingsRate >= 5 ? `4px solid ${theme.palette.warning.main}` :
                          `4px solid ${theme.palette.error.main}`,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
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
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            Monthly Breakdown
            <Tooltip title="This chart shows your predicted income, expenses, and savings rate for each month in the forecast period">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
                <ChartTooltip formatter={(value, name) => {
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
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                Top Expense Categories
                <Tooltip title="These are your highest spending categories based on the prediction period">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
                    <ChartTooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                    <Bar dataKey="amount" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            {/* Insights */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                Financial Insights
                <Tooltip title="These insights are based on analysis of your financial data and predicted trends">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <List>
                {insights.map((insight, index) => (
                  <ListItem 
                    key={index} 
                    alignItems="flex-start"
                    sx={{
                      transition: 'background-color 0.2s ease',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      },
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {getInsightIcon(insight.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {insight.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {insight.description}
                        </Typography>
                      }
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
              These predictions are based on your historical transactions{includeRecurring ? ', recurring transactions,' : ''} and budget templates. 
              Actual results may vary based on unexpected expenses or income changes. 
              <Button 
                size="small" 
                color="inherit" 
                sx={{ ml: 1, textTransform: 'none', textDecoration: 'underline' }}
                onClick={() => {
                  // Could open a more detailed methodology explanation here
                }}
              >
                Learn more
              </Button>
            </Typography>
          </Alert>
          
          {/* Overlay when refreshing */}
          {refreshing && (
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
                zIndex: 5,
                borderRadius: 1
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Updating predictions...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Fade>
    </Paper>
  );
};

export default CashflowPrediction;