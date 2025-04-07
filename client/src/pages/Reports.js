import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  Button, 
  Alert,
  CircularProgress,
  TextField,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

import reportService from '../services/reportService';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

// Report type tabs 
const REPORT_TYPES = {
  INCOME_EXPENSE: 0,
  BUDGET: 1,
  SAVINGS: 2,
  BILLS: 3,
  FULL: 4
};

// Tab labels
const TAB_LABELS = [
  { label: 'Income & Expenses', icon: <AccountBalanceIcon /> },
  { label: 'Budget', icon: <AssessmentIcon /> },
  { label: 'Savings Goals', icon: <SavingsIcon /> },
  { label: 'Bills', icon: <ReceiptIcon /> },
  { label: 'Full Report', icon: <ReceiptLongIcon /> }
];

const Reports = () => {
  // State for the current report tab
  const [reportType, setReportType] = useState(REPORT_TYPES.INCOME_EXPENSE);
  
  // State for date range
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  
  // State for reports
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setReportType(newValue);
    setReportData(null);
  };
  
  // Format date for API
  const formatDateForApi = (date) => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Generate report
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    
    try {
      let response;
      
      // Parameters common to date-based reports
      const dateParams = {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate)
      };
      
      // Generate the appropriate report based on the selected tab
      switch (reportType) {
        case REPORT_TYPES.INCOME_EXPENSE:
          response = await reportService.getIncomeExpenseReport(dateParams);
          break;
          
        case REPORT_TYPES.BUDGET:
          response = await reportService.getBudgetReport(dateParams);
          break;
          
        case REPORT_TYPES.SAVINGS:
          response = await reportService.getSavingsReport();
          break;
          
        case REPORT_TYPES.BILLS:
          response = await reportService.getBillsReport();
          break;
          
        case REPORT_TYPES.FULL:
          response = await reportService.getFullReport(dateParams);
          break;
          
        default:
          throw new Error('Invalid report type');
      }
      
      setReportData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Export report to CSV
  const exportToCsv = async () => {
    try {
      setLoading(true);
      
      let response;
      const params = {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        format: 'csv'
      };
      
      // Get report in CSV format
      switch (reportType) {
        case REPORT_TYPES.INCOME_EXPENSE:
          response = await reportService.getIncomeExpenseReport(params);
          break;
          
        case REPORT_TYPES.BUDGET:
          response = await reportService.getBudgetReport(params);
          break;
          
        case REPORT_TYPES.SAVINGS:
          response = await reportService.getSavingsReport({ format: 'csv' });
          break;
          
        case REPORT_TYPES.BILLS:
          response = await reportService.getBillsReport({ format: 'csv' });
          break;
          
        case REPORT_TYPES.FULL:
          response = await reportService.getFullReport(params);
          break;
          
        default:
          throw new Error('Invalid report type');
      }
      
      // Generate filename
      const reportTypes = ['income-expense', 'budget', 'savings', 'bills', 'full'];
      const fileName = `${reportTypes[reportType]}-report-${formatDateForApi(new Date())}.csv`;
      
      // Download the file
      reportService.downloadBlob(response.data, fileName);
    } catch (err) {
      setError('Failed to export report: ' + (err.message || ''));
      console.error('Error exporting report:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Render Income/Expense Report
  const renderIncomeExpenseReport = () => {
    if (!reportData) return null;
    
    const { period, summary, categories, transactions } = reportData;
    
    // Prepare chart data
    const chartData = {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          label: 'Expenses by Category',
          data: categories.map(cat => cat.amount),
          backgroundColor: categories.map(cat => cat.color || '#ccc'),
          borderWidth: 1
        }
      ]
    };
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Income & Expense Report
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {formatDateForDisplay(period.startDate)} - {formatDateForDisplay(period.endDate)}
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Income" />
              <CardContent>
                <Typography variant="h4" color="primary">
                  {formatCurrency(summary.income)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Expenses" />
              <CardContent>
                <Typography variant="h4" color="error">
                  {formatCurrency(summary.expenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Balance" />
              <CardContent>
                <Typography 
                  variant="h4" 
                  color={summary.balance >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.balance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              {categories.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No expense data for this period
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Top Expense Categories
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.slice(0, 5).map((category) => (
                      <TableRow key={category.categoryId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color || '#ccc',
                                mr: 1
                              }}
                            />
                            {category.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(category.amount)}</TableCell>
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
        </Grid>
      </Box>
    );
  };
  
  // Render Budget Report
  const renderBudgetReport = () => {
    if (!reportData) return null;
    
    const { period, summary, categories } = reportData;
    
    // Prepare chart data
    const chartData = {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          label: 'Budget',
          data: categories.map(cat => cat.budget),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Actual Spending',
          data: categories.map(cat => cat.spent),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Budget Report
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {formatDateForDisplay(period.startDate)} - {formatDateForDisplay(period.endDate)}
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Total Budget" />
              <CardContent>
                <Typography variant="h4" color="primary">
                  {formatCurrency(summary.totalBudget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Total Spent" />
              <CardContent>
                <Typography variant="h4" color="error">
                  {formatCurrency(summary.totalSpent)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Remaining" />
              <CardContent>
                <Typography 
                  variant="h4" 
                  color={(summary.totalBudget - summary.totalSpent) >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.totalBudget - summary.totalSpent)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Budget vs Actual Spending
              </Typography>
              {categories.length > 0 ? (
                <Box sx={{ height: 400 }}>
                  <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No budget data for this period
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Budget Details
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Budget</TableCell>
                      <TableCell align="right">Spent</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell align="right">% Used</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow 
                        key={category.categoryId}
                        sx={{
                          backgroundColor: 
                            category.status === 'over' ? 'error.light' :
                            category.status === 'warning' ? 'warning.light' :
                            'inherit'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color || '#ccc',
                                mr: 1
                              }}
                            />
                            {category.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(category.budget)}</TableCell>
                        <TableCell align="right">{formatCurrency(category.spent)}</TableCell>
                        <TableCell align="right">{formatCurrency(category.remaining)}</TableCell>
                        <TableCell align="right">
                          {category.percentUsed.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          {category.status === 'over' ? 'Over Budget' :
                           category.status === 'warning' ? 'Warning' : 'Good'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render Savings Report
  const renderSavingsReport = () => {
    if (!reportData) return null;
    
    const { summary, goals } = reportData;
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Savings Goals Report
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Total Saved" />
              <CardContent>
                <Typography variant="h4" color="primary">
                  {formatCurrency(summary.totalSaved)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Total Target" />
              <CardContent>
                <Typography variant="h4">
                  {formatCurrency(summary.totalTarget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Goals" />
              <CardContent>
                <Typography variant="body1">
                  {summary.completedGoals} of {summary.totalGoals} completed
                </Typography>
                <Typography variant="body1">
                  {summary.activeGoals} in progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Savings Goals Details
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Goal Name</TableCell>
                  <TableCell align="right">Current Amount</TableCell>
                  <TableCell align="right">Target Amount</TableCell>
                  <TableCell align="right">Progress</TableCell>
                  <TableCell align="right">Target Date</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {goals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>{goal.name}</TableCell>
                    <TableCell align="right">{formatCurrency(goal.currentAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(goal.targetAmount)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={goal.progressPercentage > 100 ? 100 : goal.progressPercentage}
                            color={
                              goal.isCompleted ? "success" :
                              goal.progressPercentage > 75 ? "success" :
                              goal.progressPercentage > 50 ? "warning" :
                              "error"
                            }
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${Math.round(goal.progressPercentage)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatDateForDisplay(goal.targetDate)}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={goal.isCompleted ? "Completed" : "In Progress"} 
                        color={goal.isCompleted ? "success" : "primary"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };
  
  // Render Bills Report
  const renderBillsReport = () => {
    if (!reportData) return null;
    
    const { summary, upcomingBills, overdueBills, paidBills } = reportData;
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Bills Report
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Upcoming Bills" />
              <CardContent>
                <Typography variant="h4" color="primary">
                  {formatCurrency(summary.totalUpcomingAmount)}
                </Typography>
                <Typography variant="body2">
                  {summary.upcomingBills} bills due
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Overdue Bills" />
              <CardContent>
                <Typography variant="h4" color="error">
                  {formatCurrency(summary.totalOverdueAmount)}
                </Typography>
                <Typography variant="body2">
                  {summary.overdueBills} bills overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Paid Bills" />
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(summary.totalPaidAmount)}
                </Typography>
                <Typography variant="body2">
                  {summary.paidBills} bills paid
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {overdueBills.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="error">
              Overdue Bills
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.name}</TableCell>
                      <TableCell align="right">{formatCurrency(bill.amount)}</TableCell>
                      <TableCell align="right">{formatDateForDisplay(bill.dueDate)}</TableCell>
                      <TableCell>{bill.frequency}</TableCell>
                      <TableCell>
                        {bill.category ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: bill.category.color || '#ccc',
                                mr: 1
                              }}
                            />
                            {bill.category.name}
                          </Box>
                        ) : (
                          'Uncategorized'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        {upcomingBills.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Upcoming Bills
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.name}</TableCell>
                      <TableCell align="right">{formatCurrency(bill.amount)}</TableCell>
                      <TableCell align="right">{formatDateForDisplay(bill.dueDate)}</TableCell>
                      <TableCell>{bill.frequency}</TableCell>
                      <TableCell>
                        {bill.category ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: bill.category.color || '#ccc',
                                mr: 1
                              }}
                            />
                            {bill.category.name}
                          </Box>
                        ) : (
                          'Uncategorized'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        {paidBills.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="success.main">
              Paid Bills
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paidBills.slice(0, 5).map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.name}</TableCell>
                      <TableCell align="right">{formatCurrency(bill.amount)}</TableCell>
                      <TableCell align="right">{formatDateForDisplay(bill.dueDate)}</TableCell>
                      <TableCell>{bill.frequency}</TableCell>
                      <TableCell>
                        {bill.category ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: bill.category.color || '#ccc',
                                mr: 1
                              }}
                            />
                            {bill.category.name}
                          </Box>
                        ) : (
                          'Uncategorized'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    );
  };
  
  // Render Full Report
  const renderFullReport = () => {
    if (!reportData) return null;
    
    const { period, finances, activity, status } = reportData;
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Full Financial Report
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {formatDateForDisplay(period.startDate)} - {formatDateForDisplay(period.endDate)}
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Financial Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Income & Expenses</Typography>
              <Divider sx={{ mb: 1 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Income:</Typography>
                  <Typography>{formatCurrency(finances.income)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Expenses:</Typography>
                  <Typography>{formatCurrency(finances.expenses)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight="bold">Balance:</Typography>
                  <Typography fontWeight="bold" 
                    color={finances.balance >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(finances.balance)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Assets & Liabilities</Typography>
              <Divider sx={{ mb: 1 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Savings:</Typography>
                  <Typography>{formatCurrency(finances.savingsTotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Upcoming Bills:</Typography>
                  <Typography>{formatCurrency(finances.upcomingBills)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight="bold">Net Worth:</Typography>
                  <Typography fontWeight="bold"
                    color={finances.netWorth >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(finances.netWorth)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Activity Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" align="center">
                    {activity.transactionCount}
                  </Typography>
                  <Typography variant="body2" align="center">
                    Transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" align="center">
                    {activity.categoryCount}
                  </Typography>
                  <Typography variant="body2" align="center">
                    Categories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" align="center">
                    {activity.billCount}
                  </Typography>
                  <Typography variant="body2" align="center">
                    Bills
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" align="center">
                    {activity.savingsGoalCount}
                  </Typography>
                  <Typography variant="body2" align="center">
                    Savings Goals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Status Alerts
          </Typography>
          
          <Grid container spacing={2}>
            {status.overBudgetCategories > 0 && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {status.overBudgetCategories} categories are over budget
                </Alert>
              </Grid>
            )}
            
            {status.overdueBills > 0 && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {status.overdueBills} bills are overdue
                </Alert>
              </Grid>
            )}
            
            {status.completedSavingsGoals > 0 && (
              <Grid item xs={12}>
                <Alert severity="success">
                  {status.completedSavingsGoals} savings goals completed
                </Alert>
              </Grid>
            )}
            
            {status.overBudgetCategories === 0 && status.overdueBills === 0 && (
              <Grid item xs={12}>
                <Alert severity="success">
                  Your finances are in good shape! No categories over budget and no overdue bills.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    );
  };
  
  // Render the appropriate report content based on the selected tab
  const renderReportContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (!reportData) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Click "Generate Report" to view the report
          </Typography>
        </Box>
      );
    }
    
    switch (reportType) {
      case REPORT_TYPES.INCOME_EXPENSE:
        return renderIncomeExpenseReport();
      case REPORT_TYPES.BUDGET:
        return renderBudgetReport();
      case REPORT_TYPES.SAVINGS:
        return renderSavingsReport();
      case REPORT_TYPES.BILLS:
        return renderBillsReport();
      case REPORT_TYPES.FULL:
        return renderFullReport();
      default:
        return null;
    }
  };
  
  // Should date range be shown for this report type?
  const showDateRange = () => {
    return reportType !== REPORT_TYPES.SAVINGS && reportType !== REPORT_TYPES.BILLS;
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={reportType}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {TAB_LABELS.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              icon={tab.icon} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {showDateRange() && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={startDate}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={showDateRange() ? 6 : 12} md={showDateRange() ? 3 : 6}>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Report'}
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={showDateRange() ? 6 : 12} md={showDateRange() ? 3 : 6}>
              <Button
                variant="outlined"
                fullWidth
                color="primary"
                onClick={exportToCsv}
                disabled={loading || !reportData}
                startIcon={<FileDownloadIcon />}
              >
                Export to CSV
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {renderReportContent()}
    </Box>
  );
};

export default Reports;