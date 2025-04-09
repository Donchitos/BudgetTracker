import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Button,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { useSelector } from 'react-redux';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isWithinInterval,
  startOfYear,
  endOfYear,
  getMonth,
  subYears, addYears
} from 'date-fns';
import { Bar, Line, Pie } from 'react-chartjs-2';
import DownloadIcon from '@mui/icons-material/Download';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const VIEW_MODES = {
  OVERVIEW: 0,
  TRENDS: 1,
  BREAKDOWN: 2
};

const TIME_PERIODS = {
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all'
};

const CategorySpendingAnalysis = () => {
  const transactionState = useSelector(state => state.transaction);
  const { transactions = [], loading = false } = transactionState || {};
  
  const categoryState = useSelector(state => state.category);
  const { categories = [] } = categoryState || {};
  
  // View state
  const [viewMode, setViewMode] = useState(VIEW_MODES.OVERVIEW);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Report data
  const [reportData, setReportData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  
  // Generate report data when params change
  useEffect(() => {
    if (!transactions || transactions.length === 0 || !categories) return;
    
    let startDate, endDate;
    
    // Determine date range based on selected time period
    switch (timePeriod) {
      case TIME_PERIODS.MONTH:
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        break;
      case TIME_PERIODS.QUARTER:
        // Start from beginning of current month minus 2 months
        startDate = startOfMonth(subMonths(selectedDate, 2));
        endDate = endOfMonth(selectedDate);
        break;
      case TIME_PERIODS.YEAR:
        startDate = startOfYear(selectedDate);
        endDate = endOfYear(selectedDate);
        break;
      case TIME_PERIODS.ALL:
        // Get earliest and latest transaction dates
        const dates = transactions.map(t => new Date(t.date));
        startDate = new Date(Math.min(...dates));
        endDate = new Date(Math.max(...dates));
        break;
      default:
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
    }
    
    // Generate reports based on the current view mode
    generateOverviewReport(startDate, endDate);
    
    if (viewMode === VIEW_MODES.TRENDS) {
      generateTrendReport(startDate, endDate);
    }
    
    if (viewMode === VIEW_MODES.BREAKDOWN) {
      generateBreakdownReport(startDate, endDate);
    }
    
  }, [transactions, categories, timePeriod, selectedDate, viewMode, selectedCategory]);
  
  // Generate overview report
  const generateOverviewReport = (startDate, endDate) => {
    // Filter transactions for the selected period
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate }) &&
             transaction.type === 'expense';
    });
    
    // Filter by selected category if not 'all'
    const filteredTransactions = selectedCategory === 'all' ? 
      periodTransactions : 
      periodTransactions.filter(transaction => {
        const categoryId = transaction.category ? 
          (typeof transaction.category === 'object' ? transaction.category._id : transaction.category) : 
          null;
        return categoryId === selectedCategory;
      });
    
    // Calculate total expense
    const totalExpense = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = {};
    
    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.category ? 
        (typeof transaction.category === 'object' ? transaction.category._id : transaction.category) : 
        'uncategorized';
      
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = {
          amount: 0,
          transactions: []
        };
      }
      
      expensesByCategory[categoryId].amount += transaction.amount;
      expensesByCategory[categoryId].transactions.push(transaction);
    });
    
    // Convert to array and add category details
    const categoryData = Object.keys(expensesByCategory).map(categoryId => {
      let name = 'Uncategorized';
      let color = '#cccccc';
      
      if (categoryId !== 'uncategorized') {
        const category = categories.find(c => c._id === categoryId);
        if (category) {
          name = category.name;
          color = category.color;
        }
      }
      
      // Group by subcategory if available
      const subcategories = {};
      expensesByCategory[categoryId].transactions.forEach(transaction => {
        const subcategory = transaction.subcategory || 'None';
        
        if (!subcategories[subcategory]) {
          subcategories[subcategory] = {
            amount: 0,
            count: 0
          };
        }
        
        subcategories[subcategory].amount += transaction.amount;
        subcategories[subcategory].count += 1;
      });
      
      // Convert subcategories to array
      const subcategoryData = Object.keys(subcategories).map(subName => ({
        name: subName,
        amount: subcategories[subName].amount,
        count: subcategories[subName].count,
        percentage: totalExpense > 0 ? 
          (subcategories[subName].amount / totalExpense) * 100 : 0
      }));
      
      // Sort by amount
      subcategoryData.sort((a, b) => b.amount - a.amount);
      
      return {
        categoryId,
        name,
        color,
        amount: expensesByCategory[categoryId].amount,
        percentage: totalExpense > 0 ? 
          (expensesByCategory[categoryId].amount / totalExpense) * 100 : 0,
        transactionCount: expensesByCategory[categoryId].transactions.length,
        subcategories: subcategoryData,
        averageTransaction: expensesByCategory[categoryId].transactions.length > 0 ?
          expensesByCategory[categoryId].amount / expensesByCategory[categoryId].transactions.length : 0
      };
    });
    
    // Sort categories by amount (highest first)
    categoryData.sort((a, b) => b.amount - a.amount);
    
    // Set report data
    setReportData({
      period: {
        startDate,
        endDate
      },
      summary: {
        totalExpense,
        transactionCount: filteredTransactions.length,
        categoryCount: categoryData.length,
      },
      categoryData
    });
  };
  
  // Generate trend report
  const generateTrendReport = (startDate, endDate) => {
    // For trend analysis, we'll look at spending over time
    // If the period is a month, we'll show daily trends
    // If quarter, we'll show weekly trends
    // If year, we'll show monthly trends
    // If all time, we'll show quarterly trends
    
    let timeGroups = [];
    let timeFormat = '';
    
    switch (timePeriod) {
      case TIME_PERIODS.MONTH:
        // Daily trends - create array of days in the month
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          timeGroups.push({
            start: new Date(d),
            end: new Date(d),
            label: format(d, 'd')
          });
        }
        timeFormat = 'MM/dd';
        break;
        
      case TIME_PERIODS.QUARTER:
        // Weekly trends
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
          const weekEnd = new Date(d);
          weekEnd.setDate(d.getDate() + 6);
          
          if (weekEnd > endDate) {
            weekEnd.setTime(endDate.getTime());
          }
          
          timeGroups.push({
            start: new Date(d),
            end: weekEnd,
            label: `${format(d, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
          });
          
          // If we've reached the end, break
          if (weekEnd.getTime() === endDate.getTime()) break;
        }
        timeFormat = 'MM/dd';
        break;
        
      case TIME_PERIODS.YEAR:
        // Monthly trends
        for (let m = 0; m < 12; m++) {
          const monthStart = new Date(selectedDate.getFullYear(), m, 1);
          const monthEnd = new Date(selectedDate.getFullYear(), m + 1, 0);
          
          // Skip months that are outside our date range
          if (monthEnd < startDate || monthStart > endDate) continue;
          
          timeGroups.push({
            start: monthStart,
            end: monthEnd,
            label: format(monthStart, 'MMM')
          });
        }
        timeFormat = 'MMM';
        break;
        
      case TIME_PERIODS.ALL:
        // Calculate yearly or quarterly trends based on span
        const yearDiff = endDate.getFullYear() - startDate.getFullYear();
        
        if (yearDiff >= 3) {
          // Yearly trends for longer periods
          for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
            const yearStart = new Date(y, 0, 1);
            const yearEnd = new Date(y, 11, 31);
            timeGroups.push({
              start: yearStart,
              end: yearEnd,
              label: y.toString()
            });
          }
          timeFormat = 'yyyy';
        } else {
          // Quarterly trends for shorter periods
          const startYear = startDate.getFullYear();
          const startQuarter = Math.floor(startDate.getMonth() / 3);
          
          const endYear = endDate.getFullYear();
          const endQuarter = Math.floor(endDate.getMonth() / 3);
          
          for (let y = startYear; y <= endYear; y++) {
            const firstQuarter = (y === startYear) ? startQuarter : 0;
            const lastQuarter = (y === endYear) ? endQuarter : 3;
            
            for (let q = firstQuarter; q <= lastQuarter; q++) {
              const quarterStart = new Date(y, q * 3, 1);
              const quarterEnd = new Date(y, (q + 1) * 3, 0);
              
              timeGroups.push({
                start: quarterStart,
                end: quarterEnd,
                label: `Q${q + 1} ${y}`
              });
            }
          }
          timeFormat = 'QQQ yyyy';
        }
        break;
        
      default:
        break;
    }
    
    // Calculate spending for each category in each time period
    const categoryTimeSeries = {};
    
    // Initialize with all categories if not filtering
    if (selectedCategory === 'all') {
      categories.forEach(category => {
        categoryTimeSeries[category._id] = {
          name: category.name,
          color: category.color,
          data: timeGroups.map(group => ({ 
            period: group.label, 
            amount: 0,
            timeRange: `${format(group.start, 'MM/dd/yyyy')} - ${format(group.end, 'MM/dd/yyyy')}` 
          }))
        };
      });
      
      // Add uncategorized
      categoryTimeSeries['uncategorized'] = {
        name: 'Uncategorized',
        color: '#cccccc',
        data: timeGroups.map(group => ({ 
          period: group.label, 
          amount: 0,
          timeRange: `${format(group.start, 'MM/dd/yyyy')} - ${format(group.end, 'MM/dd/yyyy')}` 
        }))
      };
    } else {
      // Just initialize the selected category
      const category = categories.find(c => c._id === selectedCategory);
      if (category) {
        categoryTimeSeries[category._id] = {
          name: category.name,
          color: category.color,
          data: timeGroups.map(group => ({ 
            period: group.label, 
            amount: 0,
            timeRange: `${format(group.start, 'MM/dd/yyyy')} - ${format(group.end, 'MM/dd/yyyy')}` 
          }))
        };
      }
    }
    
    // Calculate totals for each time period
    const totalByPeriod = timeGroups.map(group => ({
      period: group.label,
      amount: 0,
      timeRange: `${format(group.start, 'MM/dd/yyyy')} - ${format(group.end, 'MM/dd/yyyy')}`
    }));
    
    // Filter transactions for the selected period
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate }) &&
             transaction.type === 'expense';
    });
    
    // Add transactions to the appropriate time period and category
    periodTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const categoryId = transaction.category ? 
        (typeof transaction.category === 'object' ? transaction.category._id : transaction.category) : 
        'uncategorized';
      
      // Skip if we're filtering by category and this isn't the selected one
      if (selectedCategory !== 'all' && categoryId !== selectedCategory) {
        return;
      }
      
      // Find the time period this transaction belongs to
      const periodIndex = timeGroups.findIndex(group => 
        isWithinInterval(transactionDate, { start: group.start, end: group.end })
      );
      
      if (periodIndex === -1) return; // Skip if not in any period
      
      // Add to category time series
      if (categoryTimeSeries[categoryId]) {
        categoryTimeSeries[categoryId].data[periodIndex].amount += transaction.amount;
      }
      
      // Add to total
      totalByPeriod[periodIndex].amount += transaction.amount;
    });
    
    // Prepare chart data
    const labels = timeGroups.map(group => group.label);
    
    const datasets = Object.values(categoryTimeSeries).map(category => ({
      label: category.name,
      data: category.data.map(period => period.amount),
      backgroundColor: category.color,
      borderColor: category.color,
      borderWidth: 1
    }));
    
    // Add total dataset if showing all categories
    if (selectedCategory === 'all') {
      datasets.push({
        label: 'Total',
        data: totalByPeriod.map(period => period.amount),
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth: 2,
        fill: false,
        type: 'line',
        order: 0
      });
    }
    
    // Set trend data
    setTrendData({
      chartData: {
        labels,
        datasets
      },
      timeFormat,
      categoryTimeSeries: Object.values(categoryTimeSeries),
      totalByPeriod
    });
  };
  
  // Generate breakdown report
  const generateBreakdownReport = (startDate, endDate) => {
    // Filter transactions for the selected period
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate }) &&
             transaction.type === 'expense';
    });
    
    // If a specific category is selected, filter for it
    const filteredTransactions = selectedCategory === 'all' ? 
      periodTransactions : 
      periodTransactions.filter(transaction => {
        const categoryId = transaction.category ? 
          (typeof transaction.category === 'object' ? transaction.category._id : transaction.category) : 
          null;
        return categoryId === selectedCategory;
      });
    
    // Group by subcategory and tags
    const subcategories = {};
    const tags = {};
    
    filteredTransactions.forEach(transaction => {
      // Process subcategory
      const subcategory = transaction.subcategory || 'None';
      
      if (!subcategories[subcategory]) {
        subcategories[subcategory] = {
          amount: 0,
          count: 0,
          transactions: []
        };
      }
      
      subcategories[subcategory].amount += transaction.amount;
      subcategories[subcategory].count += 1;
      subcategories[subcategory].transactions.push(transaction);
      
      // Process tags
      if (transaction.tags && transaction.tags.length > 0) {
        transaction.tags.forEach(tag => {
          if (!tags[tag]) {
            tags[tag] = {
              amount: 0,
              count: 0,
              transactions: []
            };
          }
          
          tags[tag].amount += transaction.amount;
          tags[tag].count += 1;
          tags[tag].transactions.push(transaction);
        });
      }
    });
    
    // Calculate total expense
    const totalExpense = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Convert subcategories to array
    const subcategoryData = Object.keys(subcategories).map(name => ({
      name,
      amount: subcategories[name].amount,
      count: subcategories[name].count,
      percentage: totalExpense > 0 ? 
        (subcategories[name].amount / totalExpense) * 100 : 0,
      transactions: subcategories[name].transactions
    }));
    
    // Convert tags to array
    const tagData = Object.keys(tags).map(name => ({
      name,
      amount: tags[name].amount,
      count: tags[name].count,
      percentage: totalExpense > 0 ? 
        (tags[name].amount / totalExpense) * 100 : 0,
      transactions: tags[name].transactions
    }));
    
    // Sort by amount
    subcategoryData.sort((a, b) => b.amount - a.amount);
    tagData.sort((a, b) => b.amount - a.amount);
    
    // Prepare chart data for subcategories
    const subcategoryChartData = {
      labels: subcategoryData.slice(0, 10).map(s => s.name),
      datasets: [
        {
          data: subcategoryData.slice(0, 10).map(s => s.amount),
          backgroundColor: subcategoryData.slice(0, 10).map((_, index) => 
            `hsl(${index * 36}, 70%, 60%)`
          ),
          borderWidth: 1
        }
      ]
    };
    
    // Prepare chart data for tags
    const tagChartData = {
      labels: tagData.slice(0, 10).map(t => t.name),
      datasets: [
        {
          data: tagData.slice(0, 10).map(t => t.amount),
          backgroundColor: tagData.slice(0, 10).map((_, index) => 
            `hsl(${index * 36}, 70%, 60%)`
          ),
          borderWidth: 1
        }
      ]
    };
    
    // Set breakdown data
    setBreakdownData({
      subcategories: subcategoryData,
      tags: tagData,
      charts: {
        subcategory: subcategoryChartData,
        tag: tagChartData
      },
      totalExpense
    });
  };
  
  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };
  
  // Handle time period change
  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };
  
  // Handle category selection change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  // Handle date navigation
  const handlePreviousDate = () => {
    switch (timePeriod) {
      case TIME_PERIODS.MONTH:
        setSelectedDate(prevDate => subMonths(prevDate, 1));
        break;
      case TIME_PERIODS.QUARTER:
        setSelectedDate(prevDate => subMonths(prevDate, 3));
        break;
      case TIME_PERIODS.YEAR:
        setSelectedDate(prevDate => subYears(prevDate, 1));
        break;
      default:
        break;
    }
  };
  
  const handleNextDate = () => {
    const today = new Date();
    let shouldUpdate = true;
    
    switch (timePeriod) {
      case TIME_PERIODS.MONTH:
        if (getMonth(addMonths(selectedDate, 1)) > getMonth(today)) {
          shouldUpdate = false;
        }
        if (shouldUpdate) {
          setSelectedDate(prevDate => addMonths(prevDate, 1));
        }
        break;
      case TIME_PERIODS.QUARTER:
        if (getMonth(addMonths(selectedDate, 3)) > getMonth(today)) {
          shouldUpdate = false;
        }
        if (shouldUpdate) {
          setSelectedDate(prevDate => addMonths(prevDate, 3));
        }
        break;
      case TIME_PERIODS.YEAR:
        if (addYears(selectedDate, 1).getFullYear() > today.getFullYear()) {
          shouldUpdate = false;
        }
        if (shouldUpdate) {
          setSelectedDate(prevDate => addYears(prevDate, 1));
        }
        break;
      default:
        break;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get time period label
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case TIME_PERIODS.MONTH:
        return format(selectedDate, 'MMMM yyyy');
      case TIME_PERIODS.QUARTER:
        return `${format(startOfMonth(subMonths(selectedDate, 2)), 'MMMM')} - ${format(selectedDate, 'MMMM yyyy')}`;
      case TIME_PERIODS.YEAR:
        return format(selectedDate, 'yyyy');
      case TIME_PERIODS.ALL:
        return 'All Time';
      default:
        return '';
    }
  };
  
  // Download report as CSV
  const downloadReportCSV = () => {
    if (!reportData) return;
    
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += `Category Spending Analysis - ${getTimePeriodLabel()}\n\n`;
    
    // Add summary
    csvContent += "SUMMARY\n";
    csvContent += `Total Expense,${reportData.summary.totalExpense}\n`;
    csvContent += `Transaction Count,${reportData.summary.transactionCount}\n`;
    csvContent += `Category Count,${reportData.summary.categoryCount}\n\n`;
    
    // Add category data
    csvContent += "CATEGORIES\n";
    csvContent += "Category,Amount,Percentage,Transaction Count,Average Transaction\n";
    reportData.categoryData.forEach(category => {
      csvContent += `${category.name},${category.amount},${category.percentage.toFixed(1)}%,${category.transactionCount},${category.averageTransaction.toFixed(2)}\n`;
    });
    csvContent += "\n";
    
    // Add subcategory data if in breakdown mode
    if (viewMode === VIEW_MODES.BREAKDOWN && breakdownData) {
      csvContent += "SUBCATEGORIES\n";
      csvContent += "Subcategory,Amount,Percentage,Transaction Count\n";
      breakdownData.subcategories.forEach(sub => {
        csvContent += `${sub.name},${sub.amount},${sub.percentage.toFixed(1)}%,${sub.count}\n`;
      });
      csvContent += "\n";
      
      csvContent += "TAGS\n";
      csvContent += "Tag,Amount,Percentage,Transaction Count\n";
      breakdownData.tags.forEach(tag => {
        csvContent += `${tag.name},${tag.amount},${tag.percentage.toFixed(1)}%,${tag.count}\n`;
      });
      csvContent += "\n";
    }
    
    // Add trend data if in trend mode
    if (viewMode === VIEW_MODES.TRENDS && trendData) {
      csvContent += "TRENDS\n";
      csvContent += "Period,";
      trendData.categoryTimeSeries.forEach(category => {
        csvContent += `${category.name},`;
      });
      csvContent += "Total\n";
      
      for (let i = 0; i < trendData.chartData.labels.length; i++) {
        csvContent += `${trendData.chartData.labels[i]},`;
        trendData.categoryTimeSeries.forEach(category => {
          csvContent += `${category.data[i].amount},`;
        });
        csvContent += `${trendData.totalByPeriod[i].amount}\n`;
      }
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `category_analysis_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };
  
  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = formatCurrency(context.raw);
            const percentage = context.dataset.data[context.dataIndex] / 
              context.dataset.data.reduce((a, b) => a + b, 0) * 100;
            return `${label}: ${value} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };
  
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.raw);
            return `${label}: ${value}`;
          }
        }
      }
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ width: '100%', my: 4 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Category Spending Analysis
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadReportCSV}
            disabled={!reportData}
          >
            Export CSV
          </Button>
        </Stack>
      </Box>
      
      {/* Control Panel */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timePeriod}
                onChange={handleTimePeriodChange}
                label="Time Period"
              >
                <MenuItem value={TIME_PERIODS.MONTH}>Month</MenuItem>
                <MenuItem value={TIME_PERIODS.QUARTER}>Quarter</MenuItem>
                <MenuItem value={TIME_PERIODS.YEAR}>Year</MenuItem>
                <MenuItem value={TIME_PERIODS.ALL}>All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem 
                    key={category._id} 
                    value={category._id}
                    sx={{ 
                      '&::before': {
                        content: '""',
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: category.color || '#ccc',
                        marginRight: '8px'
                      }
                    }}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {timePeriod !== TIME_PERIODS.ALL && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton onClick={handlePreviousDate}>
                  <NavigateBeforeIcon />
                </IconButton>
                
                <Typography variant="h6" sx={{ mx: 2 }}>
                  {getTimePeriodLabel()}
                </Typography>
                
                <IconButton onClick={handleNextDate}>
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* View Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<PieChartIcon />} label="Overview" value={VIEW_MODES.OVERVIEW} />
          <Tab icon={<TimelineIcon />} label="Trends" value={VIEW_MODES.TRENDS} />
          <Tab icon={<TableChartIcon />} label="Breakdown" value={VIEW_MODES.BREAKDOWN} />
        </Tabs>
      </Paper>
      
      {!reportData ? (
        <Alert severity="info">
          No data available for the selected period.
        </Alert>
      ) : (
        <>
          {/* Overview View */}
          {viewMode === VIEW_MODES.OVERVIEW && (
            <>
              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardHeader title="Total Expenses" />
                    <CardContent>
                      <Typography variant="h5" color="error">
                        {formatCurrency(reportData.summary.totalExpense)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardHeader title="Transaction Count" />
                    <CardContent>
                      <Typography variant="h5">
                        {reportData.summary.transactionCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardHeader title="Avg. Transaction" />
                    <CardContent>
                      <Typography variant="h5">
                        {formatCurrency(reportData.summary.totalExpense / 
                         (reportData.summary.transactionCount || 1))}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Category Pie Chart */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Expenses by Category
                    </Typography>
                    
                    <Box sx={{ height: 350 }}>
                      {reportData.categoryData.length > 0 ? (
                        <Pie 
                          data={{
                            labels: reportData.categoryData.map(c => c.name),
                            datasets: [
                              {
                                data: reportData.categoryData.map(c => c.amount),
                                backgroundColor: reportData.categoryData.map(c => c.color),
                                borderWidth: 1
                              }
                            ]
                          }} 
                          options={pieChartOptions} 
                        />
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Typography variant="body1" color="text.secondary">
                            No expense data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Categories
                    </Typography>
                    
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">% of Total</TableCell>
                            <TableCell align="right">Transactions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.categoryData.slice(0, 10).map(category => (
                            <TableRow key={category.categoryId}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: category.color,
                                      mr: 1
                                    }}
                                  />
                                  {category.name}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(category.amount)}
                              </TableCell>
                              <TableCell align="right">
                                {category.percentage.toFixed(1)}%
                              </TableCell>
                              <TableCell align="right">
                                {category.transactionCount}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Trends View */}
          {viewMode === VIEW_MODES.TRENDS && trendData && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Spending Trends Over Time
              </Typography>
              
              <Box sx={{ height: 400, mb: 4 }}>
                <Line 
                  data={trendData.chartData} 
                  options={lineChartOptions} 
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Trend Data
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      {trendData.categoryTimeSeries.map(category => (
                        <TableCell key={category.name} align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color,
                                mr: 1
                              }}
                            />
                            {category.name}
                          </Box>
                        </TableCell>
                      ))}
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trendData.chartData.labels.map((label, index) => (
                      <TableRow key={label}>
                        <TableCell>
                          <Tooltip title={trendData.totalByPeriod[index].timeRange}>
                            <Typography>{label}</Typography>
                          </Tooltip>
                        </TableCell>
                        {trendData.categoryTimeSeries.map(category => (
                          <TableCell key={`${category.name}-${label}`} align="right">
                            {formatCurrency(category.data[index].amount)}
                          </TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(trendData.totalByPeriod[index].amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          
          {/* Breakdown View */}
          {viewMode === VIEW_MODES.BREAKDOWN && breakdownData && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Subcategory Breakdown
                    </Typography>
                    
                    <Box sx={{ height: 300, mb: 3 }}>
                      {breakdownData.subcategories.length > 0 ? (
                        <Pie 
                          data={breakdownData.charts.subcategory} 
                          options={pieChartOptions} 
                        />
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Typography variant="body1" color="text.secondary">
                            No subcategory data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Subcategory</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">% of Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {breakdownData.subcategories.slice(0, 5).map((sub, index) => (
                            <TableRow key={index}>
                              <TableCell>{sub.name}</TableCell>
                              <TableCell align="right">{formatCurrency(sub.amount)}</TableCell>
                              <TableCell align="right">{sub.percentage.toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Tag Breakdown
                    </Typography>
                    
                    <Box sx={{ height: 300, mb: 3 }}>
                      {breakdownData.tags.length > 0 ? (
                        <Pie 
                          data={breakdownData.charts.tag} 
                          options={pieChartOptions} 
                        />
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Typography variant="body1" color="text.secondary">
                            No tag data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tag</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">% of Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {breakdownData.tags.slice(0, 5).map((tag, index) => (
                            <TableRow key={index}>
                              <TableCell>{tag.name}</TableCell>
                              <TableCell align="right">{formatCurrency(tag.amount)}</TableCell>
                              <TableCell align="right">{tag.percentage.toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default CategorySpendingAnalysis;