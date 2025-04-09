import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  useTheme,
  Tooltip,
  IconButton,
  Badge,
  Zoom,
  Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter
} from 'recharts';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, isSameMonth } from 'date-fns';

/**
 * Component for analyzing spending patterns, anomalies, and trends
 */
const SpendingPatternAnalytics = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const transactionState = useSelector(state => state.transaction);
  const { transactions = [], loading: transactionsLoading = false } = transactionState || {};
  
  const categoryState = useSelector(state => state.category);
  const { categories = [] } = categoryState || {};
  
  // State for analytics
  const [period, setPeriod] = useState('last6Months');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [comparisonMonth, setComparisonMonth] = useState(1); // 1 month ago
  const [anomaliesFound, setAnomaliesFound] = useState([]);
  
  // Run analysis when period changes or transactions update
  useEffect(() => {
    if (transactions) {
      analyzeSpendingPatterns();
    }
  }, [transactions, period, comparisonMonth]);
  
  // Calculate date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    let startDate;
    
    switch (period) {
      case 'last3Months':
        startDate = subMonths(today, 3);
        break;
      case 'last6Months':
        startDate = subMonths(today, 6);
        break;
      case 'lastYear':
        startDate = subMonths(today, 12);
        break;
      default:
        startDate = subMonths(today, 6);
    }
    
    return {
      start: startOfMonth(startDate),
      end: endOfMonth(today)
    };
  };
  
  // Analyze spending patterns
  const analyzeSpendingPatterns = () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateRange = getDateRange();
      
      // Filter transactions within date range
      const filteredTransactions = transactions.filter(tx => 
        tx.type === 'expense' &&
        isWithinInterval(new Date(tx.date), dateRange)
      );
      
      if (filteredTransactions.length === 0) {
        setError('No transactions found for the selected period');
        setLoading(false);
        return;
      }
      
      // Group transactions by month and category
      const spendingByMonth = groupTransactionsByMonth(filteredTransactions);
      const spendingByCategory = groupTransactionsByCategory(filteredTransactions);
      
      // Calculate month-over-month changes
      const monthlyTrends = calculateMonthlyTrends(spendingByMonth);
      
      // Calculate top spending categories
      const topCategories = calculateTopCategories(spendingByCategory);
      
      // Detect spending anomalies
      const anomalies = detectAnomalies(spendingByMonth, spendingByCategory);
      setAnomaliesFound(anomalies);
      
      // Calculate spending distribution by day of week
      const spendingByDayOfWeek = calculateSpendingByDayOfWeek(filteredTransactions);
      
      // Calculate recurring patterns
      const recurringPatterns = detectRecurringPatterns(filteredTransactions);
      
      // Calculate budget efficiency
      const budgetEfficiency = calculateBudgetEfficiency(filteredTransactions);
      
      // Month-to-month comparison data
      const comparisonData = generateMonthComparisonData(spendingByMonth, comparisonMonth);
      
      // Calculate future projections
      const projections = projectFutureSpending(spendingByMonth);
      
      // Set results
      setAnalysisResults({
        spendingByMonth,
        spendingByCategory,
        monthlyTrends,
        topCategories,
        anomalies,
        spendingByDayOfWeek,
        recurringPatterns,
        budgetEfficiency,
        comparisonData,
        projections,
        dateRange
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error analyzing spending patterns', err);
      setError('An error occurred while analyzing your spending patterns');
      setLoading(false);
    }
  };
  
  // Group transactions by month
  const groupTransactionsByMonth = (transactions) => {
    const months = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = {
          key: monthKey,
          month: monthLabel,
          total: 0,
          transactions: []
        };
      }
      
      months[monthKey].total += tx.amount;
      months[monthKey].transactions.push(tx);
    });
    
    // Convert to array and sort by month
    return Object.values(months).sort((a, b) => a.key.localeCompare(b.key));
  };
  
  // Group transactions by category
  const groupTransactionsByCategory = (transactions) => {
    const categoryMap = {};
    
    transactions.forEach(tx => {
      const categoryId = tx.category?._id || tx.category;
      
      if (!categoryId) return;
      
      if (!categoryMap[categoryId]) {
        const category = categories?.find(c => c._id === categoryId);
        
        categoryMap[categoryId] = {
          id: categoryId,
          name: category?.name || 'Unknown',
          color: category?.color || '#999999',
          total: 0,
          transactions: []
        };
      }
      
      categoryMap[categoryId].total += tx.amount;
      categoryMap[categoryId].transactions.push(tx);
    });
    
    // Convert to array and sort by total
    return Object.values(categoryMap).sort((a, b) => b.total - a.total);
  };
  
  // Calculate monthly spending trends
  const calculateMonthlyTrends = (spendingByMonth) => {
    if (spendingByMonth.length < 2) return [];
    
    const trends = [];
    
    for (let i = 1; i < spendingByMonth.length; i++) {
      const currentMonth = spendingByMonth[i];
      const previousMonth = spendingByMonth[i - 1];
      
      const change = currentMonth.total - previousMonth.total;
      const percentChange = previousMonth.total !== 0
        ? (change / previousMonth.total) * 100
        : 0;
      
      trends.push({
        month: currentMonth.month,
        previousMonth: previousMonth.month,
        currentTotal: currentMonth.total,
        previousTotal: previousMonth.total,
        change,
        percentChange
      });
    }
    
    return trends;
  };
  
  // Calculate top spending categories
  const calculateTopCategories = (spendingByCategory) => {
    // Top 5 categories by total amount
    return spendingByCategory.slice(0, 5);
  };
  
  // Detect spending anomalies
  const detectAnomalies = (spendingByMonth, spendingByCategory) => {
    const anomalies = [];
    
    // Check for month-to-month anomalies
    if (spendingByMonth.length >= 2) {
      for (let i = 1; i < spendingByMonth.length; i++) {
        const currentMonth = spendingByMonth[i];
        const previousMonth = spendingByMonth[i - 1];
        
        const percentChange = previousMonth.total !== 0
          ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
          : 0;
        
        // Consider it an anomaly if spending increased or decreased by 30% or more
        if (Math.abs(percentChange) >= 30) {
          anomalies.push({
            type: 'monthly',
            month: currentMonth.month,
            previousMonth: previousMonth.month,
            currentTotal: currentMonth.total,
            previousTotal: previousMonth.total,
            percentChange,
            isIncrease: percentChange > 0
          });
        }
      }
    }
    
    // Check for category anomalies
    spendingByCategory.forEach(category => {
      // Average transaction amount
      const avgAmount = category.total / category.transactions.length;
      
      // Standard deviation
      const variance = category.transactions.reduce((sum, tx) => {
        return sum + Math.pow(tx.amount - avgAmount, 2);
      }, 0) / category.transactions.length;
      
      const stdDev = Math.sqrt(variance);
      
      // Look for outlier transactions (2+ standard deviations from mean)
      category.transactions.forEach(tx => {
        if (Math.abs(tx.amount - avgAmount) > 2 * stdDev && tx.amount >= 100) {
          anomalies.push({
            type: 'transaction',
            transactionId: tx._id,
            date: format(new Date(tx.date), 'MMM d, yyyy'),
            description: tx.description,
            amount: tx.amount,
            category: category.name,
            avgCategoryAmount: avgAmount
          });
        }
      });
    });
    
    return anomalies;
  };
  
  // Calculate spending by day of week
  const calculateSpendingByDayOfWeek = (transactions) => {
    const days = [
      { name: 'Sunday', value: 0, count: 0 },
      { name: 'Monday', value: 0, count: 0 },
      { name: 'Tuesday', value: 0, count: 0 },
      { name: 'Wednesday', value: 0, count: 0 },
      { name: 'Thursday', value: 0, count: 0 },
      { name: 'Friday', value: 0, count: 0 },
      { name: 'Saturday', value: 0, count: 0 }
    ];
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      days[dayOfWeek].value += tx.amount;
      days[dayOfWeek].count += 1;
    });
    
    // Calculate average per day
    days.forEach(day => {
      day.average = day.count > 0 ? day.value / day.count : 0;
    });
    
    return days;
  };
  
  // Detect recurring patterns
  const detectRecurringPatterns = (transactions) => {
    // This is a simplified implementation - in a real app this would be more sophisticated
    // Here we'll just look for transactions with similar descriptions that occur monthly
    
    const descriptionMap = {};
    
    transactions.forEach(tx => {
      // Skip transactions with low amounts
      if (tx.amount < 20) return;
      
      const normalizedDesc = tx.description.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!descriptionMap[normalizedDesc]) {
        descriptionMap[normalizedDesc] = {
          description: tx.description,
          occurrences: [],
          amounts: []
        };
      }
      
      descriptionMap[normalizedDesc].occurrences.push(new Date(tx.date));
      descriptionMap[normalizedDesc].amounts.push(tx.amount);
    });
    
    // Filter to find likely recurring transactions (3+ occurrences)
    const recurringPatterns = Object.values(descriptionMap)
      .filter(pattern => pattern.occurrences.length >= 3)
      .map(pattern => {
        // Calculate average amount
        const avgAmount = pattern.amounts.reduce((sum, amount) => sum + amount, 0) / pattern.amounts.length;
        
        // Calculate consistency (are the amounts similar?)
        const amountDeviation = Math.sqrt(
          pattern.amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / pattern.amounts.length
        );
        
        const consistencyScore = Math.max(0, 100 - (amountDeviation / avgAmount * 100));
        
        return {
          description: pattern.description,
          frequency: pattern.occurrences.length,
          avgAmount,
          lastDate: new Date(Math.max(...pattern.occurrences)),
          consistencyScore
        };
      })
      // Filter out patterns with low consistency
      .filter(pattern => pattern.consistencyScore > 70)
      // Sort by frequency and consistency
      .sort((a, b) => b.frequency - a.frequency);
    
    return recurringPatterns.slice(0, 5); // Top 5 patterns
  };
  
  // Calculate budget efficiency
  const calculateBudgetEfficiency = (transactions) => {
    if (!categories) return null;
    
    const categoryWithBudget = categories.filter(cat => cat.budget && cat.budget > 0);
    
    if (categoryWithBudget.length === 0) return null;
    
    const efficiency = categoryWithBudget.map(category => {
      // Calculate spending in this category
      const spent = transactions
        .filter(tx => (tx.category?._id || tx.category) === category._id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      // Calculate efficiency score
      const efficiency = category.budget > 0 ? Math.min(100, (spent / category.budget) * 100) : 0;
      
      return {
        categoryId: category._id,
        name: category.name,
        budget: category.budget,
        spent,
        remaining: Math.max(0, category.budget - spent),
        efficiency,
        status: efficiency <= 85 ? 'good' : efficiency <= 100 ? 'warning' : 'over'
      };
    });
    
    // Calculate overall efficiency
    const totalBudget = efficiency.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = efficiency.reduce((sum, cat) => sum + cat.spent, 0);
    
    const overallEfficiency = {
      totalBudget,
      totalSpent,
      remaining: Math.max(0, totalBudget - totalSpent),
      efficiency: totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0,
      categoriesCount: efficiency.length,
      onBudgetCount: efficiency.filter(cat => cat.efficiency <= 100).length,
      overBudgetCount: efficiency.filter(cat => cat.efficiency > 100).length
    };
    
    return {
      categories: efficiency,
      overall: overallEfficiency
    };
  };
  
  // Generate month comparison data
  const generateMonthComparisonData = (spendingByMonth, monthsBack) => {
    if (spendingByMonth.length <= monthsBack) {
      return null;
    }
    
    const currentMonth = spendingByMonth[spendingByMonth.length - 1];
    const previousMonth = spendingByMonth[spendingByMonth.length - 1 - monthsBack];
    
    // Map transactions to categories
    const getCategorySummary = (monthData) => {
      const categoryMap = {};
      
      monthData.transactions.forEach(tx => {
        const categoryId = tx.category?._id || tx.category;
        
        if (!categoryId) return;
        
        if (!categoryMap[categoryId]) {
          const category = categories?.find(c => c._id === categoryId);
          
          categoryMap[categoryId] = {
            id: categoryId,
            name: category?.name || 'Unknown',
            color: category?.color || '#999999',
            total: 0
          };
        }
        
        categoryMap[categoryId].total += tx.amount;
      });
      
      return Object.values(categoryMap);
    };
    
    const currentCategories = getCategorySummary(currentMonth);
    const previousCategories = getCategorySummary(previousMonth);
    
    // Calculate changes by category
    const categoryChanges = [];
    
    currentCategories.forEach(currentCat => {
      const previousCat = previousCategories.find(cat => cat.id === currentCat.id);
      
      const change = previousCat ? currentCat.total - previousCat.total : currentCat.total;
      const percentChange = previousCat && previousCat.total > 0
        ? (change / previousCat.total) * 100
        : 100;
      
      categoryChanges.push({
        id: currentCat.id,
        name: currentCat.name,
        color: currentCat.color,
        currentTotal: currentCat.total,
        previousTotal: previousCat ? previousCat.total : 0,
        change,
        percentChange
      });
    });
    
    // Look for categories present in previous month but not current month
    previousCategories.forEach(prevCat => {
      const exists = categoryChanges.some(cat => cat.id === prevCat.id);
      if (!exists) {
        categoryChanges.push({
          id: prevCat.id,
          name: prevCat.name,
          color: prevCat.color,
          currentTotal: 0,
          previousTotal: prevCat.total,
          change: -prevCat.total,
          percentChange: -100
        });
      }
    });
    
    // Sort by absolute change
    categoryChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    
    return {
      currentMonth: currentMonth.month,
      previousMonth: previousMonth.month,
      currentTotal: currentMonth.total,
      previousTotal: previousMonth.total,
      totalChange: currentMonth.total - previousMonth.total,
      totalPercentChange: previousMonth.total > 0
        ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
        : 0,
      categoryChanges
    };
  };
  
  // Project future spending
  const projectFutureSpending = (spendingByMonth) => {
    if (spendingByMonth.length < 3) return null;
    
    // Calculate average monthly change
    let totalChange = 0;
    
    for (let i = 1; i < spendingByMonth.length; i++) {
      totalChange += spendingByMonth[i].total - spendingByMonth[i-1].total;
    }
    
    const avgChange = totalChange / (spendingByMonth.length - 1);
    
    // Project next 3 months
    const lastMonth = spendingByMonth[spendingByMonth.length - 1];
    const projection = [];
    
    for (let i = 1; i <= 3; i++) {
      const projectedDate = new Date(new Date(lastMonth.key + '-01').getFullYear(), new Date(lastMonth.key + '-01').getMonth() + i, 1);
      
      projection.push({
        month: format(projectedDate, 'MMM yyyy'),
        total: Math.max(0, lastMonth.total + (avgChange * i)),
        isProjection: true
      });
    }
    
    // Include last 3 real months for comparison
    const comparison = spendingByMonth.slice(-3).map(month => ({
      month: month.month,
      total: month.total,
      isProjection: false
    }));
    
    return [...comparison, ...projection];
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage for display
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          Spending Pattern Analysis
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl 
            variant="outlined" 
            size="small" 
            sx={{ 
              m: 1, 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiSelect-icon': {
                color: 'white',
              }
            }}
          >
            <InputLabel id="period-select-label">Time Period</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              label="Time Period"
            >
              <MenuItem value="last3Months">Last 3 Months</MenuItem>
              <MenuItem value="last6Months">Last 6 Months</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Analysis">
            <IconButton 
              color="inherit" 
              onClick={analyzeSpendingPatterns}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="Spending Overview" 
            icon={<TimelineIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Month Comparison" 
            icon={<CompareArrowsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge 
                color="error" 
                badgeContent={anomaliesFound.length} 
                max={99}
                showZero={false}
              >
                Anomalies & Insights
              </Badge>
            }
            icon={<WarningIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Budget Efficiency" 
            icon={<CheckCircleIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {/* Loading or error state */}
      {loading && !analysisResults ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Analyzing your spending patterns...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      ) : !analysisResults ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No spending data available for analysis.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={analyzeSpendingPatterns}
          >
            Analyze Spending Patterns
          </Button>
        </Box>
      ) : (
        // Tab content
        <Box sx={{ p: 3 }}>
          {/* Tab 1: Spending Overview */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Monthly Spending Trend */}
              <Grid item xs={12} lg={8}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader 
                    title="Monthly Spending Trend" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={analysisResults.spendingByMonth}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <ChartTooltip formatter={(value) => [`$${value}`, 'Total Spending']} />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke={theme.palette.primary.main} 
                            fill={theme.palette.primary.main} 
                            fillOpacity={0.2} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    {analysisResults.monthlyTrends.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recent Trend:
                        </Typography>
                        
                        {analysisResults.monthlyTrends.slice(-1).map((trend, index) => (
                          <Chip
                            key={index}
                            icon={trend.percentChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                            label={`${trend.month}: ${formatPercentage(trend.percentChange)} from ${trend.previousMonth}`}
                            color={trend.percentChange > 10 ? 'error' : trend.percentChange < -10 ? 'success' : 'default'}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Top Spending Categories */}
              <Grid item xs={12} lg={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader 
                    title="Top Spending Categories" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analysisResults.topCategories}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="total"
                            nameKey="name"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {analysisResults.topCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Top Categories:
                      </Typography>
                      
                      {analysisResults.topCategories.slice(0, 3).map((category, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: category.color,
                                mr: 1
                              }}
                            />
                            <Typography variant="body2">{category.name}</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(category.total)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Day of Week Spending */}
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Spending by Day of Week" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analysisResults.spendingByDayOfWeek}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <ChartTooltip formatter={(value) => [`$${value}`, 'Average Spending']} />
                          <Bar dataKey="average" fill={theme.palette.primary.main} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        You spend the most on {
                          analysisResults.spendingByDayOfWeek.reduce(
                            (maxDay, day) => day.average > maxDay.average ? day : maxDay, 
                            { name: 'N/A', average: 0 }
                          ).name
                        }.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Future Projections */}
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Spending Projections" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    {analysisResults.projections ? (
                      <>
                        <Box sx={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                              data={analysisResults.projections}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis tickFormatter={(value) => `$${value}`} />
                              <ChartTooltip formatter={(value) => [`$${value}`, 'Projected Spending']} />
                              <Bar 
                                dataKey="total" 
                                fill={theme.palette.primary.main} 
                                fillOpacity={d => d.isProjection ? 0.5 : 1} 
                                strokeWidth={d => d.isProjection ? 0 : 1}
                              />
                              <Line
                                dataKey="total"
                                strokeDasharray="5 5"
                                stroke={theme.palette.secondary.main}
                                strokeWidth={2}
                                dot={false}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Based on your recent spending patterns, the dashed line shows projected spending for the next 3 months.
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Not enough data to generate projections. We need at least 3 months of data.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Recurring Spending Patterns */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Recurring Spending Patterns" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    {analysisResults.recurringPatterns && analysisResults.recurringPatterns.length > 0 ? (
                      <Grid container spacing={2}>
                        {analysisResults.recurringPatterns.map((pattern, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" noWrap gutterBottom>
                                  {pattern.description}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="h6" color="primary">
                                    {formatCurrency(pattern.avgAmount)}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={`${pattern.frequency} occurrences`}
                                    color="secondary"
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  Last seen: {format(pattern.lastDate, 'MMM d, yyyy')}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: '100%',
                                      bgcolor: theme.palette.grey[300],
                                      height: 4,
                                      borderRadius: 5
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: `${Math.min(100, pattern.consistencyScore)}%`,
                                        bgcolor: pattern.consistencyScore > 90 
                                          ? theme.palette.success.main 
                                          : pattern.consistencyScore > 80 
                                            ? theme.palette.warning.main 
                                            : theme.palette.primary.main,
                                        height: 4,
                                        borderRadius: 5
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    {Math.round(pattern.consistencyScore)}%
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No significant recurring patterns detected.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Tab 2: Month Comparison */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Compare Current Month To</InputLabel>
                    <Select
                      value={comparisonMonth}
                      onChange={(e) => setComparisonMonth(e.target.value)}
                      label="Compare Current Month To"
                    >
                      <MenuItem value={1}>Previous Month</MenuItem>
                      <MenuItem value={3}>3 Months Ago</MenuItem>
                      <MenuItem value={6}>6 Months Ago</MenuItem>
                      <MenuItem value={12}>12 Months Ago</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              
              {analysisResults.comparisonData ? (
                <>
                  {/* Summary Cards */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Current Month
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {analysisResults.comparisonData.currentMonth}
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(analysisResults.comparisonData.currentTotal)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Compared to
                            </Typography>
                            <Typography variant="h5" color="secondary">
                              {analysisResults.comparisonData.previousMonth}
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(analysisResults.comparisonData.previousTotal)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Change
                            </Typography>
                            <Typography 
                              variant="h5" 
                              color={analysisResults.comparisonData.totalChange < 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(analysisResults.comparisonData.totalChange)}
                            </Typography>
                            <Typography 
                              variant="h6"
                              color={analysisResults.comparisonData.totalPercentChange < 0 ? 'success.main' : 'error.main'}
                            >
                              {formatPercentage(analysisResults.comparisonData.totalPercentChange)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Category Changes */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Category Changes" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analysisResults.comparisonData.categoryChanges}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                              <YAxis type="category" dataKey="name" width={150} />
                              <ChartTooltip
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={(value) => `Category: ${value}`}
                              />
                              <Bar 
                                dataKey="change" 
                                fill={theme.palette.primary.main}
                                shape={(props) => {
                                  const { x, y, width, height, change } = props;
                                  return (
                                    <rect
                                      x={change < 0 ? x + width : x}
                                      y={y}
                                      width={Math.abs(width)}
                                      height={height}
                                      fill={change < 0 ? theme.palette.success.main : theme.palette.error.main}
                                    />
                                  );
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Detailed Category Changes */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Detailed Category Comparison" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <TableContainer sx={{ maxHeight: 440 }}>
                          <Table stickyHeader aria-label="sticky table" size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">{analysisResults.comparisonData.currentMonth}</TableCell>
                                <TableCell align="right">{analysisResults.comparisonData.previousMonth}</TableCell>
                                <TableCell align="right">Change</TableCell>
                                <TableCell align="right">% Change</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {analysisResults.comparisonData.categoryChanges.map((category) => (
                                <TableRow 
                                  key={category.id}
                                  sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    bgcolor: Math.abs(category.percentChange) > 50 ? 
                                      alpha(category.percentChange > 0 ? theme.palette.error.main : theme.palette.success.main, 0.1) : 
                                      'inherit'
                                  }}
                                >
                                  <TableCell component="th" scope="row">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          bgcolor: category.color,
                                          mr: 1
                                        }}
                                      />
                                      {category.name}
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">{formatCurrency(category.currentTotal)}</TableCell>
                                  <TableCell align="right">{formatCurrency(category.previousTotal)}</TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: category.change < 0 ? theme.palette.success.main : theme.palette.error.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {formatCurrency(category.change)}
                                  </TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: category.percentChange < 0 ? theme.palette.success.main : theme.palette.error.main
                                    }}
                                  >
                                    {isFinite(category.percentChange) ? formatPercentage(category.percentChange) : 'N/A'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ m: 3 }}>
                    Not enough monthly data available for comparison. You need at least {comparisonMonth + 1} months of data to use this feature.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
          
          {/* Tab 3: Anomalies & Insights */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Summary */}
              <Grid item xs={12}>
                <Alert 
                  severity={analysisResults.anomalies.length > 0 ? "warning" : "success"}
                  icon={analysisResults.anomalies.length > 0 ? <WarningIcon /> : <CheckCircleIcon />}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="subtitle1">
                    {analysisResults.anomalies.length > 0 
                      ? `We found ${analysisResults.anomalies.length} spending anomalies in your data.`
                      : "No significant spending anomalies detected in your data."
                    }
                  </Typography>
                  <Typography variant="body2">
                    {analysisResults.anomalies.length > 0 
                      ? "These represent unusual spending patterns that may require your attention."
                      : "Your spending patterns appear to be consistent and within normal ranges."
                    }
                  </Typography>
                </Alert>
              </Grid>
              
              {/* Monthly Anomalies */}
              {analysisResults.anomalies.filter(a => a.type === 'monthly').length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Unusual Monthly Spending" 
                      titleTypographyProps={{ variant: 'h6' }}
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        {analysisResults.anomalies
                          .filter(a => a.type === 'monthly')
                          .map((anomaly, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  bgcolor: anomaly.isIncrease 
                                    ? theme.palette.error.main + '10' 
                                    : theme.palette.success.main + '10',
                                  borderColor: anomaly.isIncrease 
                                    ? theme.palette.error.main 
                                    : theme.palette.success.main,
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    {anomaly.isIncrease 
                                      ? <TrendingUpIcon color="error" sx={{ mr: 1 }} /> 
                                      : <TrendingDownIcon color="success" sx={{ mr: 1 }} />
                                    }
                                    <Typography variant="subtitle1">
                                      {anomaly.month}
                                    </Typography>
                                  </Box>
                                  
                                  <Typography variant="h6" color={anomaly.isIncrease ? "error" : "success"}>
                                    {formatPercentage(anomaly.percentChange)}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {anomaly.isIncrease 
                                      ? `Spending increased from ${formatCurrency(anomaly.previousTotal)} to ${formatCurrency(anomaly.currentTotal)}`
                                      : `Spending decreased from ${formatCurrency(anomaly.previousTotal)} to ${formatCurrency(anomaly.currentTotal)}`
                                    }
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {/* Transaction Anomalies */}
              {analysisResults.anomalies.filter(a => a.type === 'transaction').length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Unusual Transactions" 
                      titleTypographyProps={{ variant: 'h6' }}
                    />
                    <Divider />
                    <CardContent>
                      <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="sticky table" size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="right">Typical Amount</TableCell>
                              <TableCell align="right">Difference</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analysisResults.anomalies
                              .filter(a => a.type === 'transaction')
                              .map((anomaly) => (
                                <TableRow 
                                  key={anomaly.transactionId}
                                  sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    bgcolor: theme.palette.warning.main + '10'
                                  }}
                                >
                                  <TableCell>{anomaly.date}</TableCell>
                                  <TableCell>{anomaly.description}</TableCell>
                                  <TableCell>{anomaly.category}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(anomaly.amount)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(anomaly.avgCategoryAmount)}
                                  </TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: anomaly.amount > anomaly.avgCategoryAmount 
                                        ? theme.palette.error.main 
                                        : theme.palette.success.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {formatPercentage(
                                      ((anomaly.amount - anomaly.avgCategoryAmount) / anomaly.avgCategoryAmount) * 100
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {/* Insights */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Spending Insights" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Insight 1: Top Spending Category */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Top Spending Category
                            </Typography>
                            
                            {analysisResults.topCategories.length > 0 && (
                              <>
                                <Typography variant="h6" color="primary">
                                  {analysisResults.topCategories[0].name}
                                </Typography>
                                
                                <Typography variant="body1">
                                  {formatCurrency(analysisResults.topCategories[0].total)}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {analysisResults.topCategories.length > 1 ? (
                                    <>
                                      That's {formatPercentage((
                                        (analysisResults.topCategories[0].total - analysisResults.topCategories[1].total) / 
                                        analysisResults.topCategories[1].total
                                      ) * 100)} more than your second highest category, {analysisResults.topCategories[1].name}.
                                    </>
                                  ) : (
                                    'This category represents a significant portion of your spending.'
                                  )}
                                </Typography>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Insight 2: Spending Pattern */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Spending Trajectory
                            </Typography>
                            
                            {analysisResults.monthlyTrends.length >= 2 && (
                              <>
                                {/* Calculate average trend over last 3 months */}
                                {(() => {
                                  const recentTrends = analysisResults.monthlyTrends.slice(-3);
                                  const avgChange = recentTrends.reduce(
                                    (sum, trend) => sum + trend.percentChange, 0
                                  ) / recentTrends.length;
                                  
                                  const isIncreasing = avgChange > 3;
                                  const isDecreasing = avgChange < -3;
                                  const isStable = !isIncreasing && !isDecreasing;
                                  
                                  return (
                                    <>
                                      <Typography 
                                        variant="h6" 
                                        color={
                                          isIncreasing 
                                            ? 'error.main' 
                                            : isDecreasing 
                                              ? 'success.main' 
                                              : 'primary.main'
                                        }
                                      >
                                        {isIncreasing 
                                          ? 'Increasing' 
                                          : isDecreasing 
                                            ? 'Decreasing' 
                                            : 'Stable'
                                        }
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        {isIncreasing 
                                          ? <TrendingUpIcon color="error" sx={{ mr: 1 }} /> 
                                          : isDecreasing 
                                            ? <TrendingDownIcon color="success" sx={{ mr: 1 }} />
                                            : <TimelineIcon color="primary" sx={{ mr: 1 }} />
                                        }
                                        <Typography variant="body1">
                                          {formatPercentage(avgChange)} average change
                                        </Typography>
                                      </Box>
                                      
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {isIncreasing 
                                          ? 'Your spending has been trending upward recently. You might want to review your budget.' 
                                          : isDecreasing 
                                            ? 'Your spending has been trending downward. Great job managing your expenses!' 
                                            : 'Your spending has been relatively stable over the past few months.'
                                        }
                                      </Typography>
                                    </>
                                  );
                                })()}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Insight 3: Weekday vs Weekend */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Weekday vs Weekend
                            </Typography>
                            
                            {(() => {
                              // Calculate weekday vs weekend averages
                              const weekdayData = analysisResults.spendingByDayOfWeek.slice(1, 6); // Mon-Fri
                              const weekendData = [
                                analysisResults.spendingByDayOfWeek[0], // Sun
                                analysisResults.spendingByDayOfWeek[6]  // Sat
                              ];
                              
                              const weekdayAvg = weekdayData.reduce(
                                (sum, day) => sum + day.average, 0
                              ) / weekdayData.length;
                              
                              const weekendAvg = weekendData.reduce(
                                (sum, day) => sum + day.average, 0
                              ) / weekendData.length;
                              
                              const percentDiff = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100;
                              
                              return (
                                <>
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        Weekday Avg:
                                      </Typography>
                                      <Typography variant="h6">
                                        {formatCurrency(weekdayAvg)}
                                      </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        Weekend Avg:
                                      </Typography>
                                      <Typography variant="h6" color={weekendAvg > weekdayAvg ? 'error.main' : 'inherit'}>
                                        {formatCurrency(weekendAvg)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                  
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {Math.abs(percentDiff) < 10 
                                        ? 'Your spending is fairly consistent between weekdays and weekends.' 
                                        : weekendAvg > weekdayAvg 
                                          ? `You spend ${formatPercentage(percentDiff)} more on weekends than weekdays.` 
                                          : `You spend ${formatPercentage(-percentDiff)} more on weekdays than weekends.`
                                      }
                                    </Typography>
                                  </Box>
                                </>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Tab 4: Budget Efficiency */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              {analysisResults.budgetEfficiency ? (
                <>
                  {/* Overall Efficiency */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Overall Budget Efficiency
                              </Typography>
                              
                              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress
                                  variant="determinate"
                                  value={analysisResults.budgetEfficiency.overall.efficiency}
                                  size={120}
                                  thickness={5}
                                  sx={{
                                    color: analysisResults.budgetEfficiency.overall.efficiency <= 85
                                      ? theme.palette.success.main
                                      : analysisResults.budgetEfficiency.overall.efficiency <= 100
                                        ? theme.palette.warning.main
                                        : theme.palette.error.main
                                  }}
                                />
                                <Box
                                  sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Typography
                                    variant="h5"
                                    component="div"
                                    color="text.primary"
                                  >
                                    {Math.round(analysisResults.budgetEfficiency.overall.efficiency)}%
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {analysisResults.budgetEfficiency.overall.efficiency <= 85
                                  ? 'Well under budget!'
                                  : analysisResults.budgetEfficiency.overall.efficiency <= 100
                                    ? 'Close to budget limit'
                                    : 'Over budget'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Budget Summary
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Total Budget:
                                  </Typography>
                                  <Typography variant="h6">
                                    {formatCurrency(analysisResults.budgetEfficiency.overall.totalBudget)}
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Total Spent:
                                  </Typography>
                                  <Typography variant="h6" 
                                    color={
                                      analysisResults.budgetEfficiency.overall.totalSpent > analysisResults.budgetEfficiency.overall.totalBudget 
                                        ? 'error.main' 
                                        : 'inherit'
                                    }
                                  >
                                    {formatCurrency(analysisResults.budgetEfficiency.overall.totalSpent)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Remaining:
                            </Typography>
                            <Typography 
                              variant="h6" 
                              color={
                                analysisResults.budgetEfficiency.overall.remaining > 0 
                                  ? 'success.main' 
                                  : 'error.main'
                              }
                            >
                              {formatCurrency(analysisResults.budgetEfficiency.overall.remaining)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Categories Status
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip
                                icon={<CheckCircleIcon />}
                                label={`${analysisResults.budgetEfficiency.overall.onBudgetCount} categories within budget`}
                                color="success"
                                variant="outlined"
                              />
                              
                              {analysisResults.budgetEfficiency.overall.overBudgetCount > 0 && (
                                <Chip
                                  icon={<WarningIcon />}
                                  label={`${analysisResults.budgetEfficiency.overall.overBudgetCount} categories over budget`}
                                  color="error"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Category Efficiency */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Category Budget Efficiency" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analysisResults.budgetEfficiency.categories}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" tickFormatter={(value) => `${value}%`} domain={[0, 120]} />
                              <YAxis type="category" dataKey="name" width={150} />
                              <ChartTooltip
                                formatter={(value) => `${value.toFixed(1)}%`}
                                labelFormatter={(name) => `Category: ${name}`}
                              />
                              <Bar 
                                dataKey="efficiency" 
                                name="Budget Usage"
                                fill={theme.palette.primary.main}
                                shape={(props) => {
                                  const { x, y, width, height, efficiency } = props;
                                  return (
                                    <rect
                                      x={x}
                                      y={y}
                                      width={Math.min(width, x + (120 * width / 100))}
                                      height={height}
                                      fill={
                                        efficiency <= 85
                                          ? theme.palette.success.main
                                          : efficiency <= 100
                                            ? theme.palette.warning.main
                                            : theme.palette.error.main
                                      }
                                    />
                                  );
                                }}
                              />
                              <ReferenceLine x={100} stroke="red" strokeDasharray="3 3" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Category Details */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Budget Details by Category" 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <Divider />
                      <CardContent>
                        <TableContainer sx={{ maxHeight: 440 }}>
                          <Table stickyHeader aria-label="sticky table" size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Budget</TableCell>
                                <TableCell align="right">Spent</TableCell>
                                <TableCell align="right">Remaining</TableCell>
                                <TableCell align="right">Usage %</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {analysisResults.budgetEfficiency.categories.map((category) => (
                                <TableRow 
                                  key={category.categoryId}
                                  sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    bgcolor: category.status === 'over'
                                      ? theme.palette.error.main + '10'
                                      : category.status === 'warning'
                                        ? theme.palette.warning.main + '10'
                                        : 'inherit'
                                  }}
                                >
                                  <TableCell component="th" scope="row">
                                    {category.name}
                                  </TableCell>
                                  <TableCell align="right">{formatCurrency(category.budget)}</TableCell>
                                  <TableCell align="right">{formatCurrency(category.spent)}</TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: category.remaining > 0 ? theme.palette.success.main : theme.palette.error.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {formatCurrency(category.remaining)}
                                  </TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ 
                                      color: category.status === 'over'
                                        ? theme.palette.error.main
                                        : category.status === 'warning'
                                          ? theme.palette.warning.main
                                          : theme.palette.success.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {category.efficiency.toFixed(1)}%
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={
                                        category.status === 'over'
                                          ? 'Over Budget'
                                          : category.status === 'warning'
                                            ? 'Near Limit'
                                            : 'On Budget'
                                      }
                                      color={
                                        category.status === 'over'
                                          ? 'error'
                                          : category.status === 'warning'
                                            ? 'warning'
                                            : 'success'
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ m: 3 }}>
                    No budget data available for analysis. Add budgets to your categories to see budget efficiency metrics.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SpendingPatternAnalytics;