import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Fade
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getDashboardSummary } from '../../redux/actions/dashboardActions';

const SummaryCards = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [period, setPeriod] = useState('current');
  
  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      try {
        let params = {};
        
        // Set date range based on selected period
        const now = new Date();
        if (period === 'current') {
          // Current month
          params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          params.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (period === 'last') {
          // Last month
          params.startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
          params.endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        } else if (period === 'year') {
          // Year to date
          params.startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          params.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        }
        
        const response = await dispatch(getDashboardSummary(params));
        
        if (response) {
          setSummaryData({
            income: response.income || 0,
            expenses: response.expenses || 0,
            balance: response.balance || 0
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
        setLoading(false);
      }
    };
    
    fetchSummaryData();
  }, [dispatch, period]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  if (error) {
    return (
      <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
        <Typography color="error" variant="body2">
          <strong>Error loading financial summary:</strong> {error}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => {
            setLoading(true);
            setError(null);
            dispatch(getDashboardSummary({
              period: period
            })).catch(err => {
              setError(err.message || 'Failed to load summary data');
              setLoading(false);
            });
          }}
          sx={{ mt: 1 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Financial Summary
        </Typography>
        <FormControl size="small" sx={{ width: { xs: 120, sm: 150 } }}>
          <InputLabel id="period-select-label">Period</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={period}
            label="Period"
            onChange={handlePeriodChange}
          >
            <MenuItem value="current">This Month</MenuItem>
            <MenuItem value="last">Last Month</MenuItem>
            <MenuItem value="year">Year to Date</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {/* Income Card */}
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 140,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    opacity: 0.1, 
                    transform: 'rotate(15deg)' 
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 120, color: 'success.main' }} />
                </Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  Total Income
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 'auto' }}>
                  {formatCurrency(summaryData.income)}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Expenses Card */}
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 140,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    opacity: 0.1, 
                    transform: 'rotate(15deg)' 
                  }}
                >
                  <TrendingDownIcon sx={{ fontSize: 120, color: 'error.main' }} />
                </Box>
                <Typography variant="h6" color="error" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h4" component="div" sx={{ mt: 'auto' }}>
                  {formatCurrency(summaryData.expenses)}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Balance Card */}
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 140,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    opacity: 0.1, 
                    transform: 'rotate(15deg)' 
                  }}
                >
                  <AccountBalanceIcon sx={{ fontSize: 120, color: 'info.main' }} />
                </Box>
                <Typography variant="h6" color="success" gutterBottom>
                  Balance
                </Typography>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    mt: 'auto',
                    color: summaryData.balance >= 0 ? 'success.main' : 'error.main' 
                  }}
                >
                  {formatCurrency(summaryData.balance)}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummaryCards;