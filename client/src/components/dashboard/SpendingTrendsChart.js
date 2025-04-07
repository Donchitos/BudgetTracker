import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { getSpendingTrends } from '../../redux/actions/dashboardActions';

const SpendingTrendsChart = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('6months');
  const [view, setView] = useState('both'); // 'income', 'expenses', or 'both'
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let params = {};
        
        // Set date range based on selected period
        const now = new Date();
        if (period === '3months') {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 2);
          threeMonthsAgo.setDate(1);
          params.startDate = threeMonthsAgo.toISOString().split('T')[0];
        } else if (period === '6months') {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 5);
          sixMonthsAgo.setDate(1);
          params.startDate = sixMonthsAgo.toISOString().split('T')[0];
        } else if (period === '12months') {
          const yearAgo = new Date();
          yearAgo.setFullYear(now.getFullYear() - 1);
          yearAgo.setMonth(now.getMonth() + 1);
          yearAgo.setDate(1);
          params.startDate = yearAgo.toISOString().split('T')[0];
        }
        
        params.endDate = now.toISOString().split('T')[0];
        
        const response = await dispatch(getSpendingTrends(params));
        
        if (response && response.trends) {
          setData(response.trends);
        } else {
          setData([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load spending trends');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, period]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  const handleViewChange = (e, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1,
            border: '1px solid #ccc',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry) => (
            <Box key={entry.dataKey} sx={{ color: entry.color, my: 0.5 }}>
              <Typography variant="body2">
                {entry.name}: {formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 380,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Spending Trends
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view"
          >
            <ToggleButton value="income" aria-label="income">
              Income
            </ToggleButton>
            <ToggleButton value="expenses" aria-label="expenses">
              Expenses
            </ToggleButton>
            <ToggleButton value="both" aria-label="both">
              Both
            </ToggleButton>
          </ToggleButtonGroup>
          
          <FormControl size="small" sx={{ width: 140 }}>
            <InputLabel id="period-select-label">Period</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              label="Period"
              onChange={handlePeriodChange}
            >
              <MenuItem value="3months">3 Months</MenuItem>
              <MenuItem value="6months">6 Months</MenuItem>
              <MenuItem value="12months">12 Months</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="textSecondary">No spending data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {(view === 'income' || view === 'both') && (
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#4caf50" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            )}
            {(view === 'expenses' || view === 'both') && (
              <Line 
                type="monotone" 
                dataKey="expenses" 
                name="Expenses" 
                stroke="#f44336" 
                strokeWidth={2} 
              />
            )}
            {view === 'both' && (
              <Line 
                type="monotone" 
                dataKey="balance" 
                name="Balance" 
                stroke="#2196f3" 
                strokeDasharray="5 5" 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default SpendingTrendsChart;