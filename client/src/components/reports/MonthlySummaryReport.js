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
  Tooltip
} from '@mui/material';
import { useSelector } from 'react-redux';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isWithinInterval
} from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import DownloadIcon from '@mui/icons-material/Download';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const MonthlySummaryReport = () => {
  const transactionState = useSelector(state => state.transaction);
  const { transactions = [], loading = false } = transactionState || {};
  
  const categoryState = useSelector(state => state.category);
  const { categories = [] } = categoryState || {};
  
  // State for current month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  
  // Calculate report data whenever transactions or selected month changes
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;
    
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);
    
    // Generate report data for current month
    generateMonthlyReport(startDate, endDate, setReportData);
    
    // Generate report data for previous month (for comparison)
    const prevMonthStart = startOfMonth(subMonths(currentMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
    generateMonthlyReport(prevMonthStart, prevMonthEnd, setPreviousMonthData);
    
  }, [transactions, currentMonth, categories]);
  
  // Generate monthly report data
  const generateMonthlyReport = (startDate, endDate, setDataFunction) => {
    // Filter transactions for the selected month
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });
    
    // Calculate income total
    const incomeTransactions = monthTransactions.filter(t => t.type === 'income');
    const incomeTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate expense total
    const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');
    const expenseTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate balance
    const balance = incomeTotal - expenseTotal;
    
    // Group expenses by category
    const expensesByCategory = {};
    
    expenseTransactions.forEach(transaction => {
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
      
      return {
        categoryId,
        name,
        color,
        amount: expensesByCategory[categoryId].amount,
        percentage: expenseTotal > 0 ? 
          (expensesByCategory[categoryId].amount / expenseTotal) * 100 : 0,
        transactions: expensesByCategory[categoryId].transactions
      };
    });
    
    // Sort categories by amount (highest first)
    categoryData.sort((a, b) => b.amount - a.amount);
    
    // Group income by source (using description as proxy for source)
    const incomeBySource = {};
    
    incomeTransactions.forEach(transaction => {
      const source = transaction.description;
      
      if (!incomeBySource[source]) {
        incomeBySource[source] = {
          amount: 0,
          transactions: []
        };
      }
      
      incomeBySource[source].amount += transaction.amount;
      incomeBySource[source].transactions.push(transaction);
    });
    
    // Convert to array
    const incomeData = Object.keys(incomeBySource).map(source => {
      return {
        source,
        amount: incomeBySource[source].amount,
        percentage: incomeTotal > 0 ? 
          (incomeBySource[source].amount / incomeTotal) * 100 : 0,
        transactions: incomeBySource[source].transactions
      };
    });
    
    // Sort income sources by amount (highest first)
    incomeData.sort((a, b) => b.amount - a.amount);
    
    // Set report data
    setDataFunction({
      period: {
        startDate,
        endDate
      },
      summary: {
        income: incomeTotal,
        expenses: expenseTotal,
        balance,
        transactionCount: monthTransactions.length,
        incomeCount: incomeTransactions.length,
        expenseCount: expenseTransactions.length,
        savingsRate: incomeTotal > 0 ? (balance / incomeTotal) * 100 : 0
      },
      categoryData,
      incomeData,
      transactions: monthTransactions
    });
  };
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate month-over-month change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, percentage: 0 };
    
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return {
      value: change,
      percentage
    };
  };
  
  // Get trend icon based on change percentage
  const getTrendIcon = (changePercentage, positiveIsGood = true) => {
    if (Math.abs(changePercentage) < 1) {
      return <TrendingFlatIcon />;
    }
    
    if (changePercentage > 0) {
      return positiveIsGood ? 
        <TrendingUpIcon color="success" /> : 
        <TrendingUpIcon color="error" />;
    }
    
    return positiveIsGood ? 
      <TrendingDownIcon color="error" /> : 
      <TrendingDownIcon color="success" />;
  };
  
  // Prepare chart data for expenses by category
  const prepareCategoryChartData = () => {
    if (!reportData) return null;
    
    return {
      labels: reportData.categoryData.slice(0, 7).map(c => c.name),
      datasets: [
        {
          data: reportData.categoryData.slice(0, 7).map(c => c.amount),
          backgroundColor: reportData.categoryData.slice(0, 7).map(c => c.color),
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for income vs expenses
  const prepareIncomeExpenseChartData = () => {
    if (!reportData) return null;
    
    return {
      labels: ['Income', 'Expenses'],
      datasets: [
        {
          data: [reportData.summary.income, reportData.summary.expenses],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for month-over-month comparison
  const prepareTrendChartData = () => {
    if (!reportData || !previousMonthData) return null;
    
    return {
      labels: ['Income', 'Expenses', 'Balance'],
      datasets: [
        {
          label: format(subMonths(currentMonth, 1), 'MMMM yyyy'),
          data: [
            previousMonthData.summary.income,
            previousMonthData.summary.expenses,
            previousMonthData.summary.balance
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: format(currentMonth, 'MMMM yyyy'),
          data: [
            reportData.summary.income,
            reportData.summary.expenses,
            reportData.summary.balance
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Download report as CSV
  const downloadReportCSV = () => {
    if (!reportData) return;
    
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += `Monthly Summary Report - ${format(currentMonth, 'MMMM yyyy')}\n\n`;
    
    // Add summary
    csvContent += "SUMMARY\n";
    csvContent += `Income,${reportData.summary.income}\n`;
    csvContent += `Expenses,${reportData.summary.expenses}\n`;
    csvContent += `Balance,${reportData.summary.balance}\n`;
    csvContent += `Savings Rate,${reportData.summary.savingsRate.toFixed(1)}%\n\n`;
    
    // Add expense categories
    csvContent += "EXPENSES BY CATEGORY\n";
    csvContent += "Category,Amount,Percentage\n";
    reportData.categoryData.forEach(category => {
      csvContent += `${category.name},${category.amount},${category.percentage.toFixed(1)}%\n`;
    });
    csvContent += "\n";
    
    // Add income sources
    csvContent += "INCOME SOURCES\n";
    csvContent += "Source,Amount,Percentage\n";
    reportData.incomeData.forEach(source => {
      csvContent += `${source.source},${source.amount},${source.percentage.toFixed(1)}%\n`;
    });
    csvContent += "\n";
    
    // Add all transactions
    csvContent += "TRANSACTIONS\n";
    csvContent += "Date,Type,Description,Amount,Category\n";
    reportData.transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      const category = transaction.category ? 
        (typeof transaction.category === 'object' ? transaction.category.name : 'Unknown') : 
        'Uncategorized';
      csvContent += `${date},${transaction.type},${transaction.description},${transaction.amount},${category}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monthly_report_${format(currentMonth, 'yyyy-MM')}.csv`);
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
      }
    }
  };
  
  const barChartOptions = {
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
            return formatCurrency(context.raw);
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
          Monthly Summary Report
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={handlePreviousMonth}>
            <NavigateBeforeIcon />
          </IconButton>
          
          <Typography variant="h6">
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          
          <IconButton 
            onClick={handleNextMonth}
            disabled={isWithinInterval(new Date(), { 
              start: startOfMonth(currentMonth), 
              end: endOfMonth(currentMonth) 
            })}
          >
            <NavigateNextIcon />
          </IconButton>
          
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
      
      {!reportData ? (
        <Alert severity="info">
          No data available for the selected month.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader title="Income" />
                <CardContent>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(reportData.summary.income)}
                  </Typography>
                  
                  {previousMonthData && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateChange(
                        reportData.summary.income, 
                        previousMonthData.summary.income
                      ).percentage)}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {calculateChange(
                          reportData.summary.income, 
                          previousMonthData.summary.income
                        ).percentage.toFixed(1)}% from last month
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader title="Expenses" />
                <CardContent>
                  <Typography variant="h5" color="error">
                    {formatCurrency(reportData.summary.expenses)}
                  </Typography>
                  
                  {previousMonthData && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateChange(
                        reportData.summary.expenses, 
                        previousMonthData.summary.expenses
                      ).percentage, false)}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {calculateChange(
                          reportData.summary.expenses, 
                          previousMonthData.summary.expenses
                        ).percentage.toFixed(1)}% from last month
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader title="Balance" />
                <CardContent>
                  <Typography 
                    variant="h5" 
                    color={reportData.summary.balance >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(reportData.summary.balance)}
                  </Typography>
                  
                  {previousMonthData && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateChange(
                        reportData.summary.balance, 
                        previousMonthData.summary.balance
                      ).percentage)}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {calculateChange(
                          reportData.summary.balance, 
                          previousMonthData.summary.balance
                        ).percentage.toFixed(1)}% from last month
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader title="Savings Rate" />
                <CardContent>
                  <Typography 
                    variant="h5" 
                    color={reportData.summary.savingsRate >= 0 ? 'success.main' : 'error.main'}
                  >
                    {reportData.summary.savingsRate.toFixed(1)}%
                  </Typography>
                  
                  {previousMonthData && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateChange(
                        reportData.summary.savingsRate, 
                        previousMonthData.summary.savingsRate
                      ).percentage)}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {calculateChange(
                          reportData.summary.savingsRate, 
                          previousMonthData.summary.savingsRate
                        ).percentage.toFixed(1)}% from last month
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Expenses by Category
                </Typography>
                
                <Box sx={{ height: 300 }}>
                  {prepareCategoryChartData() && (
                    <Pie 
                      data={prepareCategoryChartData()} 
                      options={pieChartOptions} 
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Income vs Expenses
                </Typography>
                
                <Box sx={{ height: 300 }}>
                  {prepareIncomeExpenseChartData() && (
                    <Bar 
                      data={prepareIncomeExpenseChartData()} 
                      options={barChartOptions} 
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Month over Month Comparison */}
          {previousMonthData && (
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Month over Month Comparison
              </Typography>
              
              <Box sx={{ height: 300 }}>
                {prepareTrendChartData() && (
                  <Bar 
                    data={prepareTrendChartData()} 
                    options={barChartOptions} 
                  />
                )}
              </Box>
            </Paper>
          )}
          
          {/* Category Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Expense Categories
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">% of Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.categoryData.map(category => (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Income Sources
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">% of Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.incomeData.map((source, index) => (
                        <TableRow key={index}>
                          <TableCell>{source.source}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(source.amount)}
                          </TableCell>
                          <TableCell align="right">
                            {source.percentage.toFixed(1)}%
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
    </Box>
  );
};

export default MonthlySummaryReport;