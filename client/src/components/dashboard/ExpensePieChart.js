import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Paper, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getExpenseBreakdown } from '../../redux/actions/dashboardActions';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658'];

const ExpensePieChart = ({ compact = false }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [period, setPeriod] = useState('current');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const fetchData = async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
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
        
        const response = await dispatch(getExpenseBreakdown(params));
        
        if (response && response.categories) {
          setData(response.categories.map(category => ({
            name: category.name,
            value: category.amount,
            percentage: category.percentage,
            color: category.color || CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)]
          })));
          
          setTotalExpenses(response.totalExpenses || 0);
        } else {
          setData([]);
          setTotalExpenses(0);
        }
        setLoading(false);
        setRefreshing(false);
      } catch (err) {
        setError(err.message || 'Failed to load expense breakdown');
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchData(false);
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
  
  // Custom tooltip to show amount and percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.name}
          </Typography>
          <Typography variant="body2">
            Amount: {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: compact ? 1 : 2,
        display: 'flex',
        flexDirection: 'column',
        height: compact ? 'auto' : 380,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Expense Breakdown
        </Typography>
        {!compact && (
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
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: compact ? 180 : '100%' }}>
          <CircularProgress size={compact ? 24 : 40} />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: compact ? 180 : '100%', p: 2 }}>
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => {
              setRefreshing(true);
              dispatch(getExpenseBreakdown({}))
                .then(response => {
                  if (response && response.categories) {
                    setData(response.categories.map(category => ({
                      name: category.name,
                      value: category.amount,
                      percentage: category.percentage,
                      color: category.color || CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)]
                    })));
                    setTotalExpenses(response.totalExpenses || 0);
                  } else {
                    setData([]);
                    setTotalExpenses(0);
                  }
                  setError(null);
                })
                .catch(err => {
                  setError(err.message || 'Failed to load expense breakdown');
                })
                .finally(() => {
                  setRefreshing(false);
                });
            }}
            startIcon={refreshing ? <CircularProgress size={16} /> : null}
            disabled={refreshing}
            sx={{ mt: 1 }}
          >
            {refreshing ? 'Refreshing...' : 'Retry'}
          </Button>
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: compact ? 180 : '100%' }}>
          <Typography color="textSecondary" variant={compact ? "body2" : "body1"}>
            No expense data available
          </Typography>
        </Box>
      ) : (
        <React.Fragment>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h5" color="text.secondary">
              {formatCurrency(totalExpenses)}
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={compact ? 30 : 60}
                outerRadius={compact ? 50 : 90}
                paddingAngle={2}
                label={compact ? false : ({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                labelLine={compact ? false : false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </React.Fragment>
      )}
    </Paper>
  );
};

export default ExpensePieChart;