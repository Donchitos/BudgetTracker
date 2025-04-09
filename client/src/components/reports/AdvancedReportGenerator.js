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
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Autocomplete,
  Chip,
  InputAdornment,
  Drawer,
  Link
} from '@mui/material';
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
  Treemap,
  ComposedChart,
  Scatter
} from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import { format, subDays, subMonths, subYears, differenceInDays, parseISO, isWithinInterval, startOfMonth, endOfMonth, isValid, addDays } from 'date-fns';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

/**
 * Advanced Report Generator with custom date ranges, detailed category analysis, 
 * tax preparation features, and export capabilities
 */
const AdvancedReportGenerator = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { transactions, loading: transactionsLoading } = useSelector(state => state.transaction);
  const { categories } = useSelector(state => state.category);
  const { accounts } = useSelector(state => state.account || { accounts: [] });
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 3).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    categories: [],
    accounts: [],
    transactionTypes: ['income', 'expense'],
    minAmount: '',
    maxAmount: '',
    tags: [],
    searchText: ''
  });
  const [reportSettings, setReportSettings] = useState({
    groupBy: 'month', // month, week, category, account
    chartType: 'bar', // bar, line, pie, area
    includePending: false,
    includeRecurring: true,
    showAverage: true,
    comparisonPeriod: 'previous', // previous, year, custom
    customComparisonStart: subMonths(subMonths(new Date(), 3), 3).toISOString().split('T')[0],
    customComparisonEnd: subMonths(new Date(), 3).toISOString().split('T')[0]
  });
  const [taxSettings, setTaxSettings] = useState({
    taxYear: new Date().getFullYear(),
    taxCategories: [],
    includeAttachments: true,
    includeNotes: true,
    summarize: true
  });
  const [savedReports, setSavedReports] = useState([]);
  const [currentReportName, setCurrentReportName] = useState('');
  const [saveReportDialogOpen, setSaveReportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Initial load
  useEffect(() => {
    // Load saved reports from localStorage when component mounts
    const savedReportsFromStorage = localStorage.getItem('savedReports');
    if (savedReportsFromStorage) {
      setSavedReports(JSON.parse(savedReportsFromStorage));
    }
    
    // Initialize tax categories if categories are available
    if (categories && categories.length > 0) {
      const defaultTaxCategories = categories
        .filter(cat => 
          cat.name.toLowerCase().includes('tax') ||
          cat.name.toLowerCase().includes('deduct') ||
          cat.name.toLowerCase().includes('business')
        )
        .map(cat => cat._id);
      
      setTaxSettings(prev => ({
        ...prev,
        taxCategories: defaultTaxCategories
      }));
    }
  }, [categories]);
  
  // Generate the report
  const generateReport = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate date range
      if (!dateRange.startDate || !dateRange.endDate) {
        throw new Error('Please select a valid date range');
      }
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (!isValid(startDate) || !isValid(endDate)) {
        throw new Error('Please select a valid date range');
      }
      
      if (startDate > endDate) {
        throw new Error('Start date cannot be after end date');
      }
      
      if (!transactions) {
        throw new Error('No transaction data available');
      }
      
      // Filter transactions based on date range and other filters
      const filteredTransactions = filterTransactions(transactions);
      
      if (filteredTransactions.length === 0) {
        setError('No transactions found for the selected criteria');
        setLoading(false);
        setReportGenerated(false);
        return;
      }
      
      // Generate the report data
      const reportData = {
        dateRange: {
          startDate,
          endDate,
          days: differenceInDays(endDate, startDate) + 1
        },
        summary: generateSummary(filteredTransactions),
        trends: generateTrends(filteredTransactions),
        byCategory: generateCategoryBreakdown(filteredTransactions),
        byAccount: generateAccountBreakdown(filteredTransactions),
        byPeriod: generatePeriodBreakdown(filteredTransactions, reportSettings.groupBy),
        taxData: generateTaxData(filteredTransactions),
        rawTransactions: filteredTransactions
      };
      
      // For comparison data if needed
      if (reportSettings.comparisonPeriod !== 'none') {
        reportData.comparison = generateComparisonData(filteredTransactions);
      }
      
      setReportData(reportData);
      setReportGenerated(true);
      setLoading(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Error generating report');
      setLoading(false);
      setReportGenerated(false);
    }
  };
  
  // Filter transactions based on criteria
  const filterTransactions = (allTransactions) => {
    const startDate = new Date(dateRange.startDate);
    const endDate = addDays(new Date(dateRange.endDate), 1); // Include the end date fully
    
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      // Filter by date range
      if (!isWithinInterval(txDate, { start: startDate, end: endDate })) {
        return false;
      }
      
      // Filter by transaction type
      if (!filters.transactionTypes.includes(tx.type)) {
        return false;
      }
      
      // Filter by categories
      if (filters.categories.length > 0) {
        const categoryId = tx.category?._id || tx.category;
        if (!filters.categories.includes(categoryId)) {
          return false;
        }
      }
      
      // Filter by accounts
      if (filters.accounts.length > 0) {
        const accountId = tx.account?._id || tx.account;
        if (!filters.accounts.includes(accountId)) {
          return false;
        }
      }
      
      // Filter by amount range
      const amount = Math.abs(tx.amount); // Use absolute value for amount comparison
      if (filters.minAmount && amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      // Filter by tags
      if (filters.tags.length > 0 && tx.tags) {
        const txTags = Array.isArray(tx.tags) ? tx.tags : [];
        if (!filters.tags.some(tag => txTags.includes(tag))) {
          return false;
        }
      }
      
      // Filter by search text
      if (filters.searchText) {
        const searchTerms = filters.searchText.toLowerCase();
        const description = tx.description ? tx.description.toLowerCase() : '';
        const notes = tx.notes ? tx.notes.toLowerCase() : '';
        if (!description.includes(searchTerms) && !notes.includes(searchTerms)) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Generate summary data
  const generateSummary = (transactions) => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const netIncome = income - expenses;
    
    const averageIncome = income / (differenceInDays(new Date(dateRange.endDate), new Date(dateRange.startDate)) / 30 || 1);
    const averageExpense = expenses / (differenceInDays(new Date(dateRange.endDate), new Date(dateRange.startDate)) / 30 || 1);
    
    // Largest transactions
    const largestIncome = [...transactions]
      .filter(tx => tx.type === 'income')
      .sort((a, b) => b.amount - a.amount)[0];
    
    const largestExpense = [...transactions]
      .filter(tx => tx.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0];
    
    // Category with most transactions
    const categoryTransactionCount = {};
    transactions.forEach(tx => {
      const categoryId = tx.category?._id || tx.category;
      if (categoryId) {
        categoryTransactionCount[categoryId] = (categoryTransactionCount[categoryId] || 0) + 1;
      }
    });
    
    let mostFrequentCategoryId = null;
    let mostFrequentCategoryCount = 0;
    
    Object.entries(categoryTransactionCount).forEach(([categoryId, count]) => {
      if (count > mostFrequentCategoryCount) {
        mostFrequentCategoryId = categoryId;
        mostFrequentCategoryCount = count;
      }
    });
    
    const mostFrequentCategory = categories?.find(cat => cat._id === mostFrequentCategoryId);
    
    return {
      income,
      expenses,
      netIncome,
      transactionCount: transactions.length,
      averageIncome,
      averageExpense,
      largestIncome,
      largestExpense,
      mostFrequentCategory: mostFrequentCategory ? {
        ...mostFrequentCategory,
        transactionCount: mostFrequentCategoryCount
      } : null
    };
  };
  
  // Generate trend data
  const generateTrends = (transactions) => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Get unique dates
    const dateMap = {};
    sortedTransactions.forEach(tx => {
      const formattedDate = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!dateMap[formattedDate]) {
        dateMap[formattedDate] = {
          date: formattedDate,
          income: 0,
          expense: 0,
          net: 0
        };
      }
      
      if (tx.type === 'income') {
        dateMap[formattedDate].income += tx.amount;
      } else if (tx.type === 'expense') {
        dateMap[formattedDate].expense += tx.amount;
      }
      
      dateMap[formattedDate].net = dateMap[formattedDate].income - dateMap[formattedDate].expense;
    });
    
    // Convert to array
    const dailyData = Object.values(dateMap);
    
    // Calculate running totals
    let runningIncome = 0;
    let runningExpense = 0;
    let runningNet = 0;
    
    dailyData.forEach(day => {
      runningIncome += day.income;
      runningExpense += day.expense;
      runningNet = runningIncome - runningExpense;
      
      day.runningIncome = runningIncome;
      day.runningExpense = runningExpense;
      day.runningNet = runningNet;
    });
    
    return dailyData;
  };
  
  // Generate category breakdown
  const generateCategoryBreakdown = (transactions) => {
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
          income: 0,
          expense: 0,
          net: 0,
          transactions: []
        };
      }
      
      if (tx.type === 'income') {
        categoryMap[categoryId].income += tx.amount;
      } else if (tx.type === 'expense') {
        categoryMap[categoryId].expense += tx.amount;
      }
      
      categoryMap[categoryId].net = categoryMap[categoryId].income - categoryMap[categoryId].expense;
      categoryMap[categoryId].transactions.push(tx);
    });
    
    return Object.values(categoryMap).sort((a, b) => b.expense - a.expense);
  };
  
  // Generate account breakdown
  const generateAccountBreakdown = (transactions) => {
    const accountMap = {};
    
    transactions.forEach(tx => {
      const accountId = tx.account?._id || tx.account;
      if (!accountId) return;
      
      if (!accountMap[accountId]) {
        const account = accounts?.find(a => a._id === accountId);
        accountMap[accountId] = {
          id: accountId,
          name: account?.name || 'Unknown',
          income: 0,
          expense: 0,
          net: 0,
          transactions: []
        };
      }
      
      if (tx.type === 'income') {
        accountMap[accountId].income += tx.amount;
      } else if (tx.type === 'expense') {
        accountMap[accountId].expense += tx.amount;
      }
      
      accountMap[accountId].net = accountMap[accountId].income - accountMap[accountId].expense;
      accountMap[accountId].transactions.push(tx);
    });
    
    return Object.values(accountMap).sort((a, b) => b.transactions.length - a.transactions.length);
  };
  
  // Generate period breakdown based on groupBy setting
  const generatePeriodBreakdown = (transactions, groupBy) => {
    const periodMap = {};
    
    transactions.forEach(tx => {
      let period;
      const txDate = new Date(tx.date);
      
      if (groupBy === 'month') {
        period = format(txDate, 'yyyy-MM');
      } else if (groupBy === 'week') {
        period = format(txDate, 'yyyy-ww');
      } else if (groupBy === 'day') {
        period = format(txDate, 'yyyy-MM-dd');
      } else if (groupBy === 'year') {
        period = format(txDate, 'yyyy');
      } else {
        period = format(txDate, 'yyyy-MM'); // Default to month
      }
      
      if (!periodMap[period]) {
        periodMap[period] = {
          period,
          income: 0,
          expense: 0,
          net: 0,
          transactions: []
        };
      }
      
      if (tx.type === 'income') {
        periodMap[period].income += tx.amount;
      } else if (tx.type === 'expense') {
        periodMap[period].expense += tx.amount;
      }
      
      periodMap[period].net = periodMap[period].income - periodMap[period].expense;
      periodMap[period].transactions.push(tx);
    });
    
    // Format period names
    return Object.values(periodMap).map(p => {
      if (groupBy === 'month') {
        p.label = format(new Date(p.period + '-01'), 'MMM yyyy');
      } else if (groupBy === 'week') {
        const [year, week] = p.period.split('-');
        p.label = `Week ${week}, ${year}`;
      } else if (groupBy === 'day') {
        p.label = format(new Date(p.period), 'MMM d, yyyy');
      } else if (groupBy === 'year') {
        p.label = p.period;
      }
      return p;
    }).sort((a, b) => a.period.localeCompare(b.period));
  };
  
  // Generate tax report data
  const generateTaxData = (transactions) => {
    // Filter transactions for tax reporting based on categories and date
    const taxTransactions = transactions.filter(tx => {
      const categoryId = tx.category?._id || tx.category;
      return taxSettings.taxCategories.includes(categoryId);
    });
    
    // Group by tax category
    const taxCategoryMap = {};
    
    taxTransactions.forEach(tx => {
      const categoryId = tx.category?._id || tx.category;
      if (!categoryId) return;
      
      if (!taxCategoryMap[categoryId]) {
        const category = categories?.find(c => c._id === categoryId);
        taxCategoryMap[categoryId] = {
          id: categoryId,
          name: category?.name || 'Unknown',
          color: category?.color || '#999999',
          income: 0,
          expense: 0,
          transactions: []
        };
      }
      
      if (tx.type === 'income') {
        taxCategoryMap[categoryId].income += tx.amount;
      } else if (tx.type === 'expense') {
        taxCategoryMap[categoryId].expense += tx.amount;
      }
      
      taxCategoryMap[categoryId].transactions.push(tx);
    });
    
    return {
      taxYear: taxSettings.taxYear,
      taxableIncome: taxTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
      taxDeductions: taxTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
      netTaxableAmount: taxTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0) - 
        taxTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
      categories: Object.values(taxCategoryMap).sort((a, b) => b.expense - a.expense),
      transactions: taxTransactions
    };
  };
  
  // Generate comparison data
  const generateComparisonData = (currentTransactions) => {
    const currentStartDate = new Date(dateRange.startDate);
    const currentEndDate = new Date(dateRange.endDate);
    const currentDays = differenceInDays(currentEndDate, currentStartDate) + 1;
    
    let previousStartDate, previousEndDate;
    
    if (reportSettings.comparisonPeriod === 'previous') {
      // Previous period of same length
      previousEndDate = new Date(currentStartDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - currentDays + 1);
    } else if (reportSettings.comparisonPeriod === 'year') {
      // Same period last year
      previousStartDate = new Date(currentStartDate);
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      previousEndDate = new Date(currentEndDate);
      previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
    } else if (reportSettings.comparisonPeriod === 'custom') {
      // Custom date range
      previousStartDate = new Date(reportSettings.customComparisonStart);
      previousEndDate = new Date(reportSettings.customComparisonEnd);
    }
    
    // Filter transactions for the previous period
    const previousTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return isWithinInterval(txDate, { start: previousStartDate, end: previousEndDate });
    });
    
    // Apply other filters except date range
    const previousFiltered = previousTransactions.filter(tx => {
      // Filter by transaction type
      if (!filters.transactionTypes.includes(tx.type)) {
        return false;
      }
      
      // Filter by categories
      if (filters.categories.length > 0) {
        const categoryId = tx.category?._id || tx.category;
        if (!filters.categories.includes(categoryId)) {
          return false;
        }
      }
      
      // Filter by accounts
      if (filters.accounts.length > 0) {
        const accountId = tx.account?._id || tx.account;
        if (!filters.accounts.includes(accountId)) {
          return false;
        }
      }
      
      // Filter by amount range
      const amount = Math.abs(tx.amount);
      if (filters.minAmount && amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      return true;
    });
    
    // Generate summary for previous period
    const previousSummary = generateSummary(previousFiltered);
    
    // Compare the two periods
    const currentSummary = reportData.summary;
    
    // Calculate percentage changes
    const calculatePercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / Math.abs(previous)) * 100;
    };
    
    const incomeChange = calculatePercentChange(currentSummary.income, previousSummary.income);
    const expenseChange = calculatePercentChange(currentSummary.expenses, previousSummary.expenses);
    const netIncomeChange = calculatePercentChange(currentSummary.netIncome, previousSummary.netIncome);
    const transactionCountChange = calculatePercentChange(
      currentSummary.transactionCount, 
      previousSummary.transactionCount
    );
    
    // Compare category breakdowns
    const currentCategories = generateCategoryBreakdown(currentTransactions);
    const previousCategories = generateCategoryBreakdown(previousFiltered);
    
    const categoryComparison = currentCategories.map(currentCat => {
      const previousCat = previousCategories.find(pc => pc.id === currentCat.id);
      
      return {
        ...currentCat,
        previousIncome: previousCat?.income || 0,
        previousExpense: previousCat?.expense || 0,
        previousNet: previousCat?.net || 0,
        incomeChange: calculatePercentChange(currentCat.income, previousCat?.income || 0),
        expenseChange: calculatePercentChange(currentCat.expense, previousCat?.expense || 0),
        netChange: calculatePercentChange(currentCat.net, previousCat?.net || 0)
      };
    });
    
    // Add categories that are only in the previous period
    previousCategories.forEach(prevCat => {
      if (!currentCategories.some(c => c.id === prevCat.id)) {
        categoryComparison.push({
          ...prevCat,
          income: 0,
          expense: 0,
          net: 0,
          previousIncome: prevCat.income,
          previousExpense: prevCat.expense,
          previousNet: prevCat.net,
          incomeChange: -100,
          expenseChange: -100,
          netChange: -100
        });
      }
    });
    
    return {
      dateRange: {
        startDate: previousStartDate,
        endDate: previousEndDate,
        days: differenceInDays(previousEndDate, previousStartDate) + 1
      },
      summary: previousSummary,
      changes: {
        income: incomeChange,
        expense: expenseChange,
        netIncome: netIncomeChange,
        transactionCount: transactionCountChange
      },
      categories: categoryComparison,
      transactions: previousFiltered
    };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (percentage) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(percentage / 100);
  };
  
  // Adjust date range based on preset
  const handleDateRangePreset = (preset) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (preset) {
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = today;
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(today, 1));
        endDate = endOfMonth(subMonths(today, 1));
        break;
      case 'last3Months':
        startDate = subMonths(today, 3);
        endDate = today;
        break;
      case 'last6Months':
        startDate = subMonths(today, 6);
        endDate = today;
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      case 'lastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };
  
  // Handle save report
  const handleSaveReport = () => {
    if (!currentReportName.trim()) {
      setError('Please enter a report name');
      return;
    }
    
    // Create a report object
    const reportToSave = {
      id: Date.now().toString(),
      name: currentReportName,
      dateCreated: new Date().toISOString(),
      dateRange,
      filters,
      reportSettings,
      taxSettings
    };
    
    // Update saved reports
    const updatedReports = [...savedReports, reportToSave];
    setSavedReports(updatedReports);
    
    // Save to local storage
    localStorage.setItem('savedReports', JSON.stringify(updatedReports));
    
    // Close the dialog
    setSaveReportDialogOpen(false);
    setCurrentReportName('');
  };
  
  // Load a saved report
  const handleLoadReport = (report) => {
    setDateRange(report.dateRange);
    setFilters(report.filters);
    setReportSettings(report.reportSettings);
    setTaxSettings(report.taxSettings);
    
    // Generate the report with the loaded settings
    generateReport();
  };
  
  // Delete a saved report
  const handleDeleteReport = (reportId) => {
    const updatedReports = savedReports.filter(report => report.id !== reportId);
    setSavedReports(updatedReports);
    
    // Update local storage
    localStorage.setItem('savedReports', JSON.stringify(updatedReports));
  };
  
  // Export report as PDF
  const exportToPdf = () => {
    // PDF generation would be implemented here
    // For this implementation, we'll just log the action
    console.log('Export to PDF function would be called here with report data:', reportData);
  };
  
  // Export report as CSV
  const exportToCsv = () => {
    if (!reportData) return;
    
    // Convert data to CSV format
    let csv = 'Date,Description,Category,Account,Type,Amount,Notes\n';
    
    reportData.rawTransactions.forEach(tx => {
      const category = categories?.find(c => c._id === (tx.category?._id || tx.category))?.name || '';
      const account = accounts?.find(a => a._id === (tx.account?._id || tx.account))?.name || '';
      
      csv += [
        format(new Date(tx.date), 'yyyy-MM-dd'),
        `"${tx.description?.replace(/"/g, '""') || ''}"`,
        `"${category}"`,
        `"${account}"`,
        tx.type,
        tx.amount,
        `"${tx.notes?.replace(/"/g, '""') || ''}"`
      ].join(',') + '\n';
    });
    
    // Create a download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // PDF document styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center'
    },
    subtitle: {
      fontSize: 18,
      marginBottom: 10
    },
    text: {
      fontSize: 12,
      marginBottom: 5
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
      paddingTop: 5,
      paddingBottom: 5
    },
    tableHeader: {
      backgroundColor: '#F5F5F5',
      fontWeight: 'bold'
    },
    tableCell: {
      flex: 1,
      padding: 5
    }
  });
  
  // PDF Document component
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Financial Report</Text>
          <Text style={styles.subtitle}>
            {format(new Date(dateRange.startDate), 'MMM d, yyyy')} - {format(new Date(dateRange.endDate), 'MMM d, yyyy')}
          </Text>
          
          <View style={{ marginTop: 20 }}>
            <Text style={styles.subtitle}>Summary</Text>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>Total Income:</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{formatCurrency(reportData?.summary.income || 0)}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>Total Expenses:</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{formatCurrency(reportData?.summary.expenses || 0)}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>Net Income:</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{formatCurrency(reportData?.summary.netIncome || 0)}</Text>
              </View>
            </View>
          </View>
          
          <View style={{ marginTop: 20 }}>
            <Text style={styles.subtitle}>Top Categories</Text>
            {reportData?.byCategory.slice(0, 5).map((category, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>{category.name}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{formatCurrency(category.expense)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
  
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
          Advanced Report Generator
        </Typography>
        
        <Box>
          {reportData && (
            <>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={exportToPdf}
                sx={{ mr: 1 }}
              >
                PDF
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={exportToCsv}
                sx={{ mr: 1 }}
              >
                CSV
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={() => setSaveReportDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
            </>
          )}
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
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
          <Tab label="General Report" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Category Analysis" icon={<PieChartIcon />} iconPosition="start" />
          <Tab label="Tax Report" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Saved Reports" icon={<StorageIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{
          sx: { width: 320, padding: 2 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Report Filters
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Date Range
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Date Range
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label="This Month" 
                onClick={() => handleDateRangePreset('thisMonth')}
                size="small"
              />
              <Chip 
                label="Last Month" 
                onClick={() => handleDateRangePreset('lastMonth')}
                size="small"
              />
              <Chip 
                label="Last 3 Months" 
                onClick={() => handleDateRangePreset('last3Months')}
                size="small"
              />
              <Chip 
                label="YTD" 
                onClick={() => handleDateRangePreset('ytd')}
                size="small"
              />
              <Chip 
                label="Last Year" 
                onClick={() => handleDateRangePreset('lastYear')}
                size="small"
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Transaction Types
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={filters.transactionTypes.includes('income')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters(prev => ({ 
                        ...prev, 
                        transactionTypes: [...prev.transactionTypes, 'income'] 
                      }));
                    } else {
                      setFilters(prev => ({ 
                        ...prev, 
                        transactionTypes: prev.transactionTypes.filter(t => t !== 'income') 
                      }));
                    }
                  }}
                />
              }
              label="Income"
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={filters.transactionTypes.includes('expense')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters(prev => ({ 
                        ...prev, 
                        transactionTypes: [...prev.transactionTypes, 'expense'] 
                      }));
                    } else {
                      setFilters(prev => ({ 
                        ...prev, 
                        transactionTypes: prev.transactionTypes.filter(t => t !== 'expense') 
                      }));
                    }
                  }}
                />
              }
              label="Expenses"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Categories
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={categories || []}
              getOptionLabel={(option) => option.name}
              value={(categories || []).filter(cat => filters.categories.includes(cat._id))}
              onChange={(e, newValues) => {
                setFilters(prev => ({ 
                  ...prev, 
                  categories: newValues.map(v => v._id) 
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Categories"
                  placeholder="Categories"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    avatar={
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          bgcolor: option.color, 
                          borderRadius: '50%',
                          display: 'inline-block' 
                        }} 
                      />
                    }
                  />
                ))
              }
              size="small"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Amount Range
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Min Amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Report Settings
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Group By</InputLabel>
              <Select
                value={reportSettings.groupBy}
                onChange={(e) => setReportSettings(prev => ({ ...prev, groupBy: e.target.value }))}
                label="Group By"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={reportSettings.chartType}
                onChange={(e) => setReportSettings(prev => ({ ...prev, chartType: e.target.value }))}
                label="Chart Type"
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Comparison Period</InputLabel>
              <Select
                value={reportSettings.comparisonPeriod}
                onChange={(e) => setReportSettings(prev => ({ ...prev, comparisonPeriod: e.target.value }))}
                label="Comparison Period"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="previous">Previous Period</MenuItem>
                <MenuItem value="year">Same Period Last Year</MenuItem>
                <MenuItem value="custom">Custom Period</MenuItem>
              </Select>
            </FormControl>
            
            {reportSettings.comparisonPeriod === 'custom' && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Comparison Start"
                    type="date"
                    value={reportSettings.customComparisonStart}
                    onChange={(e) => setReportSettings(prev => ({ 
                      ...prev, 
                      customComparisonStart: e.target.value 
                    }))}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Comparison End"
                    type="date"
                    value={reportSettings.customComparisonEnd}
                    onChange={(e) => setReportSettings(prev => ({ 
                      ...prev, 
                      customComparisonEnd: e.target.value 
                    }))}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setFilters({
                  categories: [],
                  accounts: [],
                  transactionTypes: ['income', 'expense'],
                  minAmount: '',
                  maxAmount: '',
                  tags: [],
                  searchText: ''
                });
                setReportSettings({
                  groupBy: 'month',
                  chartType: 'bar',
                  includePending: false,
                  includeRecurring: true,
                  showAverage: true,
                  comparisonPeriod: 'previous',
                  customComparisonStart: subMonths(subMonths(new Date(), 3), 3).toISOString().split('T')[0],
                  customComparisonEnd: subMonths(new Date(), 3).toISOString().split('T')[0]
                });
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowFilters(false);
                generateReport();
              }}
            >
              Apply & Generate
            </Button>
          </Box>
        </Box>
      </Drawer>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Date Range Bar */}
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: theme.palette.background.paper,
            border: 1,
            borderColor: theme.palette.divider,
            borderRadius: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              {format(new Date(dateRange.startDate), 'MMM d, yyyy')} - {format(new Date(dateRange.endDate), 'MMM d, yyyy')}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Box>
        </Box>
        
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Tab Content */}
        {!loading && reportGenerated && reportData && (
          <>
            {/* General Report Tab */}
            {activeTab === 0 && (
              <Box>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Total Income
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {formatCurrency(reportData.summary.income)}
                        </Typography>
                        
                        {reportData.comparison && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {reportData.comparison.changes.income > 0 ? (
                              <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} fontSize="small" />
                            ) : (
                              <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5 }} fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              color={reportData.comparison.changes.income > 0 ? 'success.main' : 'error.main'}
                            >
                              {formatPercentage(reportData.comparison.changes.income)}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Total Expenses
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {formatCurrency(reportData.summary.expenses)}
                        </Typography>
                        
                        {reportData.comparison && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {reportData.comparison.changes.expense < 0 ? (
                              <TrendingDownIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} fontSize="small" />
                            ) : (
                              <TrendingUpIcon sx={{ color: theme.palette.error.main, mr: 0.5 }} fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              color={reportData.comparison.changes.expense < 0 ? 'success.main' : 'error.main'}
                            >
                              {formatPercentage(reportData.comparison.changes.expense)}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Net Income
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            mb: 1,
                            color: reportData.summary.netIncome >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          {formatCurrency(reportData.summary.netIncome)}
                        </Typography>
                        
                        {reportData.comparison && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {reportData.comparison.changes.netIncome > 0 ? (
                              <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} fontSize="small" />
                            ) : (
                              <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5 }} fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              color={reportData.comparison.changes.netIncome > 0 ? 'success.main' : 'error.main'}
                            >
                              {formatPercentage(reportData.comparison.changes.netIncome)}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Transactions
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {reportData.summary.transactionCount}
                        </Typography>
                        
                        {reportData.comparison && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {reportData.comparison.changes.transactionCount > 0 ? (
                              <TrendingUpIcon sx={{ color: theme.palette.info.main, mr: 0.5 }} fontSize="small" />
                            ) : (
                              <TrendingDownIcon sx={{ color: theme.palette.info.main, mr: 0.5 }} fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              color="info.main"
                            >
                              {formatPercentage(reportData.comparison.changes.transactionCount)}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Main Chart */}
                <Card sx={{ mb: 3 }}>
                  <CardHeader
                    title={`${reportSettings.groupBy === 'month' ? 'Monthly' : 
                            reportSettings.groupBy === 'week' ? 'Weekly' : 
                            reportSettings.groupBy === 'day' ? 'Daily' : 'Yearly'} Breakdown`}
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        {reportSettings.chartType === 'bar' ? (
                          <BarChart
                            data={reportData.byPeriod}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <ChartTooltip formatter={(value) => [`$${value}`, '']} />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill={theme.palette.success.main} />
                            <Bar dataKey="expense" name="Expenses" fill={theme.palette.error.main} />
                          </BarChart>
                        ) : reportSettings.chartType === 'line' ? (
                          <LineChart
                            data={reportData.byPeriod}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <ChartTooltip formatter={(value) => [`$${value}`, '']} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="income" 
                              name="Income" 
                              stroke={theme.palette.success.main} 
                              activeDot={{ r: 8 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="expense" 
                              name="Expenses" 
                              stroke={theme.palette.error.main} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="net" 
                              name="Net" 
                              stroke={theme.palette.primary.main} 
                            />
                          </LineChart>
                        ) : reportSettings.chartType === 'area' ? (
                          <AreaChart
                            data={reportData.byPeriod}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <ChartTooltip formatter={(value) => [`$${value}`, '']} />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="income" 
                              name="Income" 
                              stroke={theme.palette.success.main} 
                              fill={theme.palette.success.light} 
                              fillOpacity={0.3}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="expense" 
                              name="Expenses" 
                              stroke={theme.palette.error.main} 
                              fill={theme.palette.error.light} 
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        ) : (
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Income', value: reportData.summary.income },
                                { name: 'Expenses', value: reportData.summary.expenses }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill={theme.palette.success.main} />
                              <Cell fill={theme.palette.error.main} />
                            </Pie>
                            <ChartTooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
                
                <Grid container spacing={3}>
                  {/* Top Categories */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title="Top Categories" />
                      <Divider />
                      <CardContent>
                        <TableContainer sx={{ maxHeight: 400 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Expenses</TableCell>
                                <TableCell align="right">% of Total</TableCell>
                                {reportData.comparison && (
                                  <TableCell align="right">vs Previous</TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.byCategory
                                .sort((a, b) => b.expense - a.expense)
                                .slice(0, 10)
                                .map((category) => {
                                  const percentOfTotal = reportData.summary.expenses > 0
                                    ? (category.expense / reportData.summary.expenses) * 100
                                    : 0;
                                  
                                  return (
                                    <TableRow key={category.id}>
                                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
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
                                      </TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(category.expense)}
                                      </TableCell>
                                      <TableCell align="right">
                                        {percentOfTotal.toFixed(1)}%
                                      </TableCell>
                                      {reportData.comparison && (
                                        <TableCell 
                                          align="right"
                                          sx={{
                                            color: category.expenseChange < 0 
                                              ? theme.palette.success.main 
                                              : theme.palette.error.main
                                          }}
                                        >
                                          {category.expenseChange !== undefined ? (
                                            <>
                                              {category.expenseChange > 0 ? '+' : ''}
                                              {category.expenseChange.toFixed(1)}%
                                            </>
                                          ) : 'N/A'}
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Category Pie Chart */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title="Expense Distribution" />
                      <Divider />
                      <CardContent>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={reportData.byCategory
                                  .filter(cat => cat.expense > 0)
                                  .sort((a, b) => b.expense - a.expense)
                                  .slice(0, 7) // Top 7 categories
                                }
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="expense"
                                nameKey="name"
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {reportData.byCategory
                                  .filter(cat => cat.expense > 0)
                                  .sort((a, b) => b.expense - a.expense)
                                  .slice(0, 7)
                                  .map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Pie>
                              <ChartTooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Transaction Trends */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Income & Expense Trends" />
                      <Divider />
                      <CardContent>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                              data={reportData.trends}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(date) => format(new Date(date), 'MMM d')}
                              />
                              <YAxis 
                                yAxisId="left"
                                tickFormatter={(value) => `$${value}`}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                tickFormatter={(value) => `$${value}`}
                              />
                              <ChartTooltip 
                                formatter={(value, name) => [formatCurrency(value), name]} 
                                labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                              />
                              <Legend />
                              <Area 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="income" 
                                name="Daily Income" 
                                fill={theme.palette.success.light} 
                                stroke={theme.palette.success.main}
                                fillOpacity={0.3}
                              />
                              <Area 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="expense" 
                                name="Daily Expense" 
                                fill={theme.palette.error.light} 
                                stroke={theme.palette.error.main}
                                fillOpacity={0.3}
                              />
                              <Line 
                                yAxisId="right"
                                type="monotone" 
                                dataKey="runningNet" 
                                name="Running Net" 
                                stroke={theme.palette.primary.main}
                                strokeWidth={2}
                                dot={false}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Category Analysis Tab */}
            {activeTab === 1 && (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Category Breakdown" />
                  <Divider />
                  <CardContent>
                    <Box sx={{ height: 450 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                          data={reportData.byCategory.map(cat => ({
                            name: cat.name,
                            size: cat.expense,
                            color: cat.color
                          }))}
                          dataKey="size"
                          aspectRatio={4/3}
                          stroke="#fff"
                          fill="#8884d8"
                          content={
                            ({ root, depth, x, y, width, height, index, payload, colors, rank, name, size }) => {
                              const category = reportData.byCategory[index];
                              if (!category) return null;
                              
                              return (
                                <g>
                                  <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    style={{
                                      fill: category.color,
                                      stroke: '#fff',
                                      strokeWidth: 2 / (depth + 1e-10),
                                      strokeOpacity: 1 / (depth + 1e-10),
                                    }}
                                  />
                                  {width > 60 && height > 25 && (
                                    <>
                                      <text
                                        x={x + width / 2}
                                        y={y + height / 2 - 7}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize={14}
                                        fontWeight="bold"
                                      >
                                        {name}
                                      </text>
                                      <text
                                        x={x + width / 2}
                                        y={y + height / 2 + 7}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize={12}
                                      >
                                        {formatCurrency(size)}
                                      </text>
                                    </>
                                  )}
                                </g>
                              );
                            }
                          }
                        />
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
                
                <Grid container spacing={3}>
                  {/* Category Comparison */}
                  {reportData.comparison && (
                    <Grid item xs={12}>
                      <Card sx={{ mb: 3 }}>
                        <CardHeader 
                          title="Category Comparison" 
                          subheader={`Comparing to ${format(new Date(reportData.comparison.dateRange.startDate), 'MMM d, yyyy')} - ${format(new Date(reportData.comparison.dateRange.endDate), 'MMM d, yyyy')}`}
                        />
                        <Divider />
                        <CardContent>
                          <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Category</TableCell>
                                  <TableCell align="right">Current Period</TableCell>
                                  <TableCell align="right">Previous Period</TableCell>
                                  <TableCell align="right">Change</TableCell>
                                  <TableCell align="right">% Change</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.comparison.categories
                                  .filter(cat => cat.expense > 0 || cat.previousExpense > 0)
                                  .sort((a, b) => Math.abs(b.expenseChange) - Math.abs(a.expenseChange))
                                  .map((category) => (
                                    <TableRow key={category.id}>
                                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
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
                                      </TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(category.expense)}
                                      </TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(category.previousExpense)}
                                      </TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(category.expense - category.previousExpense)}
                                      </TableCell>
                                      <TableCell 
                                        align="right"
                                        sx={{
                                          color: category.expenseChange < 0 
                                            ? theme.palette.success.main 
                                            : category.expenseChange > 0
                                              ? theme.palette.error.main
                                              : 'inherit'
                                        }}
                                      >
                                        {category.expenseChange !== undefined ? (
                                          <>
                                            {category.expenseChange > 0 ? '+' : ''}
                                            {category.expenseChange.toFixed(1)}%
                                          </>
                                        ) : 'N/A'}
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
                  
                  {/* Individual Category Analysis */}
                  {reportData.byCategory.map((category) => (
                    <Grid item xs={12} md={6} key={category.id}>
                      <Card>
                        <CardHeader 
                          title={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor: category.color,
                                  mr: 1
                                }}
                              />
                              {category.name}
                            </Box>
                          }
                          subheader={`${category.transactions.length} transactions`}
                          action={
                            <Typography variant="h6" color="text.secondary">
                              {formatCurrency(category.expense)}
                            </Typography>
                          }
                        />
                        <Divider />
                        <CardContent>
                          <TableContainer sx={{ maxHeight: 200 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Description</TableCell>
                                  <TableCell align="right">Amount</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {category.transactions
                                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                                  .slice(0, 5)
                                  .map((transaction) => (
                                    <TableRow key={transaction._id}>
                                      <TableCell>
                                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                                      </TableCell>
                                      <TableCell>{transaction.description}</TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(transaction.amount)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          {category.transactions.length > 5 && (
                            <Box sx={{ mt: 1, textAlign: 'center' }}>
                              <Link 
                                component="button"
                                variant="body2"
                                onClick={() => {
                                  // View all transactions functionality would go here
                                  console.log('View all transactions for', category.name);
                                }}
                              >
                                View all {category.transactions.length} transactions
                              </Link>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {/* Tax Report Tab */}
            {activeTab === 2 && (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardHeader 
                    title={`Tax Report for ${taxSettings.taxYear}`} 
                    action={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Tax Year"
                          type="number"
                          value={taxSettings.taxYear}
                          onChange={(e) => setTaxSettings(prev => ({ 
                            ...prev, 
                            taxYear: parseInt(e.target.value) || new Date().getFullYear() 
                          }))}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 2, width: 100 }}
                        />
                        
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={exportToPdf}
                        >
                          Export Tax Report
                        </Button>
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Taxable Income
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {formatCurrency(reportData.taxData.taxableIncome)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Tax Deductions
                            </Typography>
                            <Typography variant="h4" color="secondary">
                              {formatCurrency(reportData.taxData.taxDeductions)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Net Taxable Amount
                            </Typography>
                            <Typography 
                              variant="h4" 
                              color={reportData.taxData.netTaxableAmount >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(reportData.taxData.netTaxableAmount)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Tax Categories
                      </Typography>
                      
                      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                        <Autocomplete
                          multiple
                          options={categories || []}
                          getOptionLabel={(option) => option.name}
                          value={(categories || []).filter(cat => taxSettings.taxCategories.includes(cat._id))}
                          onChange={(e, newValues) => {
                            setTaxSettings(prev => ({ 
                              ...prev, 
                              taxCategories: newValues.map(v => v._id) 
                            }));
                            // Re-generate report with new tax categories
                            generateReport();
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              label="Select Tax Categories"
                              placeholder="Categories"
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                label={option.name}
                                {...getTagProps({ index })}
                                avatar={
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      bgcolor: option.color, 
                                      borderRadius: '50%',
                                      display: 'inline-block' 
                                    }} 
                                  />
                                }
                              />
                            ))
                          }
                        />
                      </FormControl>
                      
                      {reportData.taxData.categories.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 400 }}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Income</TableCell>
                                <TableCell align="right">Deductions</TableCell>
                                <TableCell align="right">Transaction Count</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.taxData.categories.map((category) => (
                                <TableRow key={category.id}>
                                  <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
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
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(category.income)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(category.expense)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {category.transactions.length}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">
                          No tax categories selected or no transactions found in the selected tax categories.
                        </Alert>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Tax Transactions
                      </Typography>
                      
                      {reportData.taxData.transactions.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 400 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Notes</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {reportData.taxData.transactions
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((tx) => {
                                  const category = categories?.find(c => c._id === (tx.category?._id || tx.category));
                                  
                                  return (
                                    <TableRow key={tx._id}>
                                      <TableCell>
                                        {format(new Date(tx.date), 'MMM d, yyyy')}
                                      </TableCell>
                                      <TableCell>{tx.description}</TableCell>
                                      <TableCell>
                                        {category ? (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box
                                              sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: category.color,
                                                mr: 1
                                              }}
                                            />
                                            {category.name}
                                          </Box>
                                        ) : 'Unknown'}
                                      </TableCell>
                                      <TableCell 
                                        align="right"
                                        sx={{
                                          color: tx.type === 'income' 
                                            ? theme.palette.success.main 
                                            : theme.palette.error.main
                                        }}
                                      >
                                        {formatCurrency(tx.amount)}
                                      </TableCell>
                                      <TableCell>{tx.notes || ''}</TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">
                          No tax-related transactions found for the selected period and categories.
                        </Alert>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
            
            {/* Saved Reports Tab */}
            {activeTab === 3 && (
              <Box>
                <Grid container spacing={3}>
                  {savedReports.length > 0 ? (
                    savedReports.map((report) => (
                      <Grid item xs={12} sm={6} md={4} key={report.id}>
                        <Card>
                          <CardHeader
                            title={report.name}
                            subheader={format(new Date(report.dateCreated), 'MMM d, yyyy')}
                            action={
                              <IconButton onClick={() => handleDeleteReport(report.id)}>
                                <DeleteIcon />
                              </IconButton>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Date Range:
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {format(new Date(report.dateRange.startDate), 'MMM d, yyyy')} - {format(new Date(report.dateRange.endDate), 'MMM d, yyyy')}
                            </Typography>
                            
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Filters:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {report.filters.categories.length > 0 && (
                                  <Chip 
                                    size="small" 
                                    label={`${report.filters.categories.length} categories`}
                                    icon={<CategoryIcon />}
                                  />
                                )}
                                {report.filters.transactionTypes.includes('income') && (
                                  <Chip 
                                    size="small" 
                                    label="Income"
                                    icon={<TrendingUpIcon />}
                                  />
                                )}
                                {report.filters.transactionTypes.includes('expense') && (
                                  <Chip 
                                    size="small" 
                                    label="Expenses"
                                    icon={<TrendingDownIcon />}
                                  />
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleLoadReport(report)}
                            >
                              Load Report
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          No Saved Reports
                        </Typography>
                        <Typography variant="body1">
                          Generate a report and save it to access it later. Saved reports will remember all your settings and filters.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </>
        )}
        
        {/* Empty State */}
        {!loading && !reportGenerated && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <BarChartIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Generate Your Report
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select a date range and filters to generate a customized financial report
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowFilters(true)}
              startIcon={<FilterListIcon />}
              size="large"
            >
              Configure Report
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Save Report Dialog */}
      <Dialog
        open={saveReportDialogOpen}
        onClose={() => setSaveReportDialogOpen(false)}
      >
        <DialogTitle>Save Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Report Name"
            fullWidth
            value={currentReportName}
            onChange={(e) => setCurrentReportName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveReportDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveReport}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdvancedReportGenerator;
