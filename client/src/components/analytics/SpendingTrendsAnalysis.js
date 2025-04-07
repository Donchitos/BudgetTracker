import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { getSpendingTrends } from '../../redux/actions/analyticsActions';

const SpendingTrendsAnalysis = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { data, loading, error } = useSelector(state => state.analytics.spendingTrends);
  const { categories } = useSelector(state => state.categories);
  
  // State for chart options
  const [months, setMonths] = useState(6);
  const [chartType, setChartType] = useState('line');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showTotal, setShowTotal] = useState(true);
  
  // Fetch spending trends data
  useEffect(() => {
    dispatch(getSpendingTrends({ 
      months,
      categories: selectedCategories.length > 0 ? selectedCategories : []
    }));
  }, [dispatch, months, selectedCategories]);
  
  // Handle chart type change
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  // Handle months change
  const handleMonthsChange = (event) => {
    setMonths(parseInt(event.target.value));
  };
  
  // Handle category selection
  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCategories(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Generate colors for categories
  const getCategoryColor = (categoryName, index) => {
    // Try to find the category in the redux store to use its color
    const category = categories?.find(c => c.name === categoryName);
    if (category && category.color) {
      return category.color;
    }
    
    // Fallback colors
    const defaultColors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
      '#9c27b0', // purple
      '#795548', // brown
      '#607d8b', // blue-grey
      '#009688', // teal
    ];
    
    return defaultColors[index % defaultColors.length];
  };
  
  if (loading && !data.length) {
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
  
  if (!data || data.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Spending trends data is not available.
      </Alert>
    );
  }
  
  // Process data for the chart
  // Get all category names from the data
  const allCategories = new Set();
  data.forEach(month => {
    Object.keys(month.categories).forEach(category => {
      allCategories.add(category);
    });
  });
  
  const categoryNames = Array.from(allCategories);
  
  // Prepare the chart data
  const chartData = data.map(month => {
    const monthData = {
      month: month.month,
      total: month.total
    };
    
    // Add all categories
    categoryNames.forEach(category => {
      monthData[category] = month.categories[category] || 0;
    });
    
    return monthData;
  });
  
  // Filter categories to display based on selection
  const displayCategories = selectedCategories.length > 0 
    ? categoryNames.filter(cat => selectedCategories.includes(cat))
    : categoryNames;
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Spending Trends Analysis
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="months-select-label">Time Range</InputLabel>
            <Select
              labelId="months-select-label"
              id="months-select"
              value={months}
              label="Time Range"
              onChange={handleMonthsChange}
            >
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
          >
            <ToggleButton value="line">
              Line
            </ToggleButton>
            <ToggleButton value="area">
              Area
            </ToggleButton>
            <ToggleButton value="bar">
              Bar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          {/* Chart */}
          <Box sx={{ height: 400, mb: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {showTotal && (
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total" 
                      stroke="#000000" 
                      strokeWidth={2}
                      dot={true}
                    />
                  )}
                  {displayCategories.map((category, index) => (
                    <Line 
                      key={category}
                      type="monotone" 
                      dataKey={category} 
                      name={category}
                      stroke={getCategoryColor(category, index)}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {displayCategories.map((category, index) => (
                    <Area 
                      key={category}
                      type="monotone" 
                      dataKey={category} 
                      name={category}
                      fill={getCategoryColor(category, index)}
                      stroke={getCategoryColor(category, index)}
                      stackId="1"
                    />
                  ))}
                </AreaChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  {showTotal && chartType !== 'area' && (
                    <Bar dataKey="total" name="Total" fill="#000000" />
                  )}
                  {displayCategories.map((category, index) => (
                    <Bar 
                      key={category}
                      dataKey={category} 
                      name={category}
                      fill={getCategoryColor(category, index)}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          {/* Category Selection */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Categories
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                label="Show Total"
                color={showTotal ? 'primary' : 'default'}
                onClick={() => setShowTotal(!showTotal)}
                variant={showTotal ? 'filled' : 'outlined'}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select categories to display:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categoryNames.map((category, index) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                    } else {
                      setSelectedCategories([...selectedCategories, category]);
                    }
                  }}
                  color={selectedCategories.includes(category) ? 'primary' : 'default'}
                  sx={{ 
                    bgcolor: selectedCategories.includes(category) 
                      ? undefined 
                      : getCategoryColor(category, index) + '40', // Add transparency
                    mb: 1
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SpendingTrendsAnalysis;