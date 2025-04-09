import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  Tooltip,
  Tab,
  Tabs,
  FormHelperText,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WarningIcon from '@mui/icons-material/Warning';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

/**
 * Component for managing multiple financial accounts (checking, savings, credit cards, etc.)
 * with balance tracking, transfers, and net worth calculation
 */
const AccountManager = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // State for accounts and UI
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: 0,
    isCredit: false,
    creditLimit: 0,
    apr: 0,
    interestRate: 0,
    institution: '',
    accountNumber: '',
    notes: '',
    isExcluded: false,
    color: '#1976d2'
  });
  const [activeTab, setActiveTab] = useState(0);
  const [accountMenuAnchorEl, setAccountMenuAnchorEl] = useState(null);
  const [showHiddenAccounts, setShowHiddenAccounts] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [transferDetails, setTransferDetails] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    description: ''
  });
  
  // Account colors by type for visualization
  const accountTypeColors = {
    checking: '#4caf50', // Green
    savings: '#2196f3', // Blue
    creditCard: '#f44336', // Red
    loan: '#ff9800', // Orange
    investment: '#9c27b0', // Purple
    mortgage: '#795548', // Brown
    other: '#607d8b' // Blue-grey
  };
  
  // Account type icons
  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking':
        return <AccountBalanceIcon />;
      case 'savings':
        return <AccountBalanceWalletIcon />;
      case 'creditCard':
        return <CreditCardIcon />;
      case 'loan':
        return <MoneyOffIcon />;
      case 'investment':
        return <TrendingUpIcon />;
      case 'mortgage':
        return <HomeIcon />;
      default:
        return <AccountBalanceWalletIcon />;
    }
  };
  
  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);
  
  // Load accounts from API
  const loadAccounts = () => {
    setLoading(true);
    setError(null);
    
    // In a real app, this would be an API call
    // For this implementation, we'll use sample data
    setTimeout(() => {
      const sampleAccounts = [
        {
          id: '1',
          name: 'Main Checking',
          type: 'checking',
          balance: 2500.75,
          isCredit: false,
          institution: 'Chase Bank',
          accountNumber: '****1234',
          isExcluded: false,
          notes: 'Primary checking account',
          color: accountTypeColors.checking,
          createdAt: '2023-06-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Savings',
          type: 'savings',
          balance: 15000.00,
          isCredit: false,
          interestRate: 1.5,
          institution: 'Ally Bank',
          accountNumber: '****5678',
          isExcluded: false,
          notes: 'Emergency fund',
          color: accountTypeColors.savings,
          createdAt: '2023-06-15T10:00:00Z'
        },
        {
          id: '3',
          name: 'Credit Card',
          type: 'creditCard',
          balance: 450.25,
          isCredit: true,
          creditLimit: 5000,
          apr: 18.99,
          institution: 'Chase Bank',
          accountNumber: '****9012',
          isExcluded: false,
          notes: 'Rewards credit card',
          color: accountTypeColors.creditCard,
          createdAt: '2023-06-15T10:00:00Z'
        },
        {
          id: '4',
          name: 'Car Loan',
          type: 'loan',
          balance: 8500.00,
          isCredit: true,
          apr: 4.5,
          institution: 'Toyota Financial',
          accountNumber: '****3456',
          isExcluded: false,
          notes: 'Car loan - 2020 Camry',
          color: accountTypeColors.loan,
          createdAt: '2023-06-15T10:00:00Z'
        },
        {
          id: '5',
          name: 'Investment Account',
          type: 'investment',
          balance: 25000.00,
          isCredit: false,
          institution: 'Fidelity',
          accountNumber: '****7890',
          isExcluded: false,
          notes: 'Retirement account',
          color: accountTypeColors.investment,
          createdAt: '2023-06-15T10:00:00Z'
        }
      ];
      
      setAccounts(sampleAccounts);
      setLoading(false);
    }, 1000);
  };
  
  // Calculate total assets, liabilities, and net worth
  const calculateNetWorth = () => {
    let assets = 0;
    let liabilities = 0;
    
    accounts.forEach(account => {
      if (!account.isExcluded) {
        if (account.isCredit) {
          liabilities += account.balance;
        } else {
          assets += account.balance;
        }
      }
    });
    
    return {
      assets,
      liabilities,
      netWorth: assets - liabilities
    };
  };
  
  // Group accounts by type
  const groupAccountsByType = () => {
    const grouped = {
      checking: [],
      savings: [],
      creditCard: [],
      loan: [],
      investment: [],
      mortgage: [],
      other: []
    };
    
    accounts.forEach(account => {
      if (grouped[account.type]) {
        grouped[account.type].push(account);
      } else {
        grouped.other.push(account);
      }
    });
    
    return grouped;
  };
  
  // Get accounts for display (optionally filtering hidden accounts)
  const getDisplayAccounts = () => {
    return accounts.filter(account => showHiddenAccounts || !account.isExcluded);
  };
  
  // Format currency for display
  const formatCurrency = (value, alwaysShowSign = false) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: alwaysShowSign ? 'always' : 'auto'
    });
    
    return formatter.format(value);
  };
  
  // Open account dialog for adding new account
  const handleAddAccount = () => {
    setNewAccount({
      name: '',
      type: 'checking',
      balance: 0,
      isCredit: false,
      creditLimit: 0,
      apr: 0,
      interestRate: 0,
      institution: '',
      accountNumber: '',
      notes: '',
      isExcluded: false,
      color: accountTypeColors.checking
    });
    setDialogMode('add');
    setAccountDialogOpen(true);
  };
  
  // Open account dialog for editing
  const handleEditAccount = (account) => {
    setNewAccount({ ...account });
    setDialogMode('edit');
    setAccountDialogOpen(true);
    setAccountMenuAnchorEl(null);
  };
  
  // Close account dialog
  const handleCloseAccountDialog = () => {
    setAccountDialogOpen(false);
  };
  
  // Handle field change in account form
  const handleAccountFieldChange = (field, value) => {
    // Special handling for account type
    if (field === 'type') {
      const isCredit = value === 'creditCard' || value === 'loan' || value === 'mortgage';
      
      setNewAccount(prev => ({
        ...prev,
        [field]: value,
        isCredit,
        color: accountTypeColors[value] || accountTypeColors.other
      }));
    } else {
      setNewAccount(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Save account (add or edit)
  const handleSaveAccount = () => {
    // Simple validation
    if (!newAccount.name) {
      setError('Account name is required');
      return;
    }
    
    try {
      if (dialogMode === 'add') {
        // Add new account
        const accountToAdd = {
          ...newAccount,
          id: Date.now().toString(), // Generate temporary ID
          createdAt: new Date().toISOString()
        };
        
        setAccounts(prev => [...prev, accountToAdd]);
      } else {
        // Edit existing account
        setAccounts(prev => prev.map(acc => 
          acc.id === newAccount.id ? newAccount : acc
        ));
      }
      
      // Close dialog and clear error
      setAccountDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error saving account');
    }
  };
  
  // Delete account
  const handleDeleteAccount = () => {
    if (!selectedAccountId) return;
    
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        setAccounts(prev => prev.filter(acc => acc.id !== selectedAccountId));
        setSelectedAccountId(null);
        setAccountMenuAnchorEl(null);
      } catch (err) {
        setError(err.message || 'Error deleting account');
      }
    }
  };
  
  // Toggle account visibility
  const handleToggleAccountVisibility = () => {
    if (!selectedAccountId) return;
    
    try {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === selectedAccountId) {
          return { ...acc, isExcluded: !acc.isExcluded };
        }
        return acc;
      }));
      
      setAccountMenuAnchorEl(null);
    } catch (err) {
      setError(err.message || 'Error updating account');
    }
  };
  
  // Open account menu
  const handleOpenAccountMenu = (event, accountId) => {
    setSelectedAccountId(accountId);
    setAccountMenuAnchorEl(event.currentTarget);
  };
  
  // Close account menu
  const handleCloseAccountMenu = () => {
    setAccountMenuAnchorEl(null);
  };
  
  // Toggle expanded section
  const toggleExpandedSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Handle opening transfer dialog
  const handleOpenTransferDialog = () => {
    setTransferDetails({
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      description: 'Transfer'
    });
    setTransferDialogOpen(true);
  };
  
  // Handle closing transfer dialog
  const handleCloseTransferDialog = () => {
    setTransferDialogOpen(false);
  };
  
  // Handle transfer field change
  const handleTransferFieldChange = (field, value) => {
    setTransferDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Execute transfer between accounts
  const handleExecuteTransfer = () => {
    // Validation
    if (!transferDetails.fromAccountId || !transferDetails.toAccountId) {
      setError('Please select source and destination accounts');
      return;
    }
    
    if (transferDetails.fromAccountId === transferDetails.toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }
    
    if (transferDetails.amount <= 0) {
      setError('Transfer amount must be greater than zero');
      return;
    }
    
    try {
      // Update account balances
      setAccounts(prev => prev.map(acc => {
        if (acc.id === transferDetails.fromAccountId) {
          return { ...acc, balance: acc.balance - transferDetails.amount };
        }
        if (acc.id === transferDetails.toAccountId) {
          return { ...acc, balance: acc.balance + transferDetails.amount };
        }
        return acc;
      }));
      
      // Close dialog and clear error
      setTransferDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error processing transfer');
    }
  };
  
  // Generate data for account type distribution chart
  const generateAccountTypeData = () => {
    const typeAmounts = {};
    
    getDisplayAccounts().forEach(account => {
      if (!account.isCredit) {
        const type = account.type;
        if (!typeAmounts[type]) {
          typeAmounts[type] = 0;
        }
        typeAmounts[type] += account.balance;
      }
    });
    
    return Object.keys(typeAmounts).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: typeAmounts[type],
      color: accountTypeColors[type] || accountTypeColors.other
    }));
  };
  
  // Generate data for asset allocation chart
  const generateAssetAllocationData = () => {
    const data = [];
    
    getDisplayAccounts().forEach(account => {
      if (!account.isCredit && account.balance > 0) {
        data.push({
          name: account.name,
          value: account.balance,
          color: account.color
        });
      }
    });
    
    return data;
  };
  
  // Generate data for liability breakdown chart
  const generateLiabilityData = () => {
    const data = [];
    
    getDisplayAccounts().forEach(account => {
      if (account.isCredit && account.balance > 0) {
        data.push({
          name: account.name,
          value: account.balance,
          color: account.color
        });
      }
    });
    
    return data;
  };
  
  // Calculate utilization for credit accounts
  const calculateCreditUtilization = (account) => {
    if (account.isCredit && account.type === 'creditCard' && account.creditLimit > 0) {
      return (account.balance / account.creditLimit) * 100;
    }
    return null;
  };
  
  // Get color for credit utilization
  const getCreditUtilizationColor = (utilization) => {
    if (utilization === null) return theme.palette.text.primary;
    
    if (utilization < 30) {
      return theme.palette.success.main;
    } else if (utilization < 70) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.error.main;
    }
  };
  
  // Get accounts available for transfer (non-hidden accounts)
  const getTransferableAccounts = () => {
    return accounts.filter(account => !account.isExcluded);
  };
  
  const netWorth = calculateNetWorth();
  
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
          Account Manager
        </Typography>
        
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CompareArrowsIcon />}
            onClick={handleOpenTransferDialog}
            sx={{ mr: 1 }}
          >
            Transfer
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
          >
            Add Account
          </Button>
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Accounts" />
          <Tab label="Net Worth" />
        </Tabs>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Accounts Tab */}
            {activeTab === 0 && (
              <>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Total Assets
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(netWorth.assets)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {accounts.filter(a => !a.isCredit && !a.isExcluded).length} accounts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: theme.palette.error.main, color: 'white' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Total Liabilities
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(netWorth.liabilities)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {accounts.filter(a => a.isCredit && !a.isExcluded).length} accounts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Net Worth
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(netWorth.netWorth)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {getDisplayAccounts().length} accounts total
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Account Settings */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Your Accounts
                  </Typography>
                  
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showHiddenAccounts}
                          onChange={(e) => setShowHiddenAccounts(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Show Hidden Accounts"
                    />
                  </Box>
                </Box>
                
                {/* Account List */}
                <Grid container spacing={3}>
                  {/* Checking Accounts Section */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => toggleExpandedSection('checking')}
                          >
                            <AccountBalanceIcon sx={{ mr: 1, color: accountTypeColors.checking }} />
                            <Typography variant="h6">
                              Checking Accounts
                            </Typography>
                            {expandedSection === 'checking' ? <ExpandLessIcon sx={{ ml: 1 }} /> : <ExpandMoreIcon sx={{ ml: 1 }} />}
                          </Box>
                        }
                      />
                      
                      <Collapse in={expandedSection === 'checking'}>
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Account Name</TableCell>
                                  <TableCell>Institution</TableCell>
                                  <TableCell align="right">Balance</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getDisplayAccounts()
                                  .filter(account => account.type === 'checking')
                                  .map((account) => (
                                    <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          {account.isExcluded && (
                                            <Tooltip title="Hidden from totals">
                                              <VisibilityOffIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
                                            </Tooltip>
                                          )}
                                          {account.name}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{account.institution}</TableCell>
                                      <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                                      <TableCell align="right">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleOpenAccountMenu(e, account.id)}
                                        >
                                          <MoreVertIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                
                                {getDisplayAccounts().filter(account => account.type === 'checking').length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      <Typography variant="body2" color="text.secondary">
                                        No checking accounts found
                                      </Typography>
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAccount}
                                        sx={{ mt: 1 }}
                                      >
                                        Add Account
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                  
                  {/* Savings Accounts Section */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => toggleExpandedSection('savings')}
                          >
                            <AccountBalanceWalletIcon sx={{ mr: 1, color: accountTypeColors.savings }} />
                            <Typography variant="h6">
                              Savings Accounts
                            </Typography>
                            {expandedSection === 'savings' ? <ExpandLessIcon sx={{ ml: 1 }} /> : <ExpandMoreIcon sx={{ ml: 1 }} />}
                          </Box>
                        }
                      />
                      
                      <Collapse in={expandedSection === 'savings'}>
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Account Name</TableCell>
                                  <TableCell>Institution</TableCell>
                                  <TableCell align="right">Interest Rate</TableCell>
                                  <TableCell align="right">Balance</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getDisplayAccounts()
                                  .filter(account => account.type === 'savings')
                                  .map((account) => (
                                    <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          {account.isExcluded && (
                                            <Tooltip title="Hidden from totals">
                                              <VisibilityOffIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
                                            </Tooltip>
                                          )}
                                          {account.name}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{account.institution}</TableCell>
                                      <TableCell align="right">{account.interestRate ? `${account.interestRate}%` : '-'}</TableCell>
                                      <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                                      <TableCell align="right">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleOpenAccountMenu(e, account.id)}
                                        >
                                          <MoreVertIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                
                                {getDisplayAccounts().filter(account => account.type === 'savings').length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} align="center">
                                      <Typography variant="body2" color="text.secondary">
                                        No savings accounts found
                                      </Typography>
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAccount}
                                        sx={{ mt: 1 }}
                                      >
                                        Add Account
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                  
                  {/* Credit Card Accounts Section */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => toggleExpandedSection('creditCard')}
                          >
                            <CreditCardIcon sx={{ mr: 1, color: accountTypeColors.creditCard }} />
                            <Typography variant="h6">
                              Credit Cards
                            </Typography>
                            {expandedSection === 'creditCard' ? <ExpandLessIcon sx={{ ml: 1 }} /> : <ExpandMoreIcon sx={{ ml: 1 }} />}
                          </Box>
                        }
                      />
                      
                      <Collapse in={expandedSection === 'creditCard'}>
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Account Name</TableCell>
                                  <TableCell>Institution</TableCell>
                                  <TableCell align="right">Balance</TableCell>
                                  <TableCell align="right">Limit</TableCell>
                                  <TableCell align="right">Utilization</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getDisplayAccounts()
                                  .filter(account => account.type === 'creditCard')
                                  .map((account) => {
                                    const utilization = calculateCreditUtilization(account);
                                    
                                    return (
                                      <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {account.isExcluded && (
                                              <Tooltip title="Hidden from totals">
                                                <VisibilityOffIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
                                              </Tooltip>
                                            )}
                                            {account.name}
                                          </Box>
                                        </TableCell>
                                        <TableCell>{account.institution}</TableCell>
                                        <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                                        <TableCell align="right">{formatCurrency(account.creditLimit)}</TableCell>
                                        <TableCell align="right">
                                          {utilization !== null ? (
                                            <Typography 
                                              sx={{ 
                                                color: getCreditUtilizationColor(utilization),
                                                fontWeight: 'bold'
                                              }}
                                            >
                                              {utilization.toFixed(1)}%
                                            </Typography>
                                          ) : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenAccountMenu(e, account.id)}
                                          >
                                            <MoreVertIcon />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                
                                {getDisplayAccounts().filter(account => account.type === 'creditCard').length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={6} align="center">
                                      <Typography variant="body2" color="text.secondary">
                                        No credit cards found
                                      </Typography>
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAccount}
                                        sx={{ mt: 1 }}
                                      >
                                        Add Credit Card
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                  
                  {/* Loans Section */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => toggleExpandedSection('loan')}
                          >
                            <MoneyOffIcon sx={{ mr: 1, color: accountTypeColors.loan }} />
                            <Typography variant="h6">
                              Loans
                            </Typography>
                            {expandedSection === 'loan' ? <ExpandLessIcon sx={{ ml: 1 }} /> : <ExpandMoreIcon sx={{ ml: 1 }} />}
                          </Box>
                        }
                      />
                      
                      <Collapse in={expandedSection === 'loan'}>
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Account Name</TableCell>
                                  <TableCell>Institution</TableCell>
                                  <TableCell align="right">Balance</TableCell>
                                  <TableCell align="right">Interest Rate</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getDisplayAccounts()
                                  .filter(account => account.type === 'loan' || account.type === 'mortgage')
                                  .map((account) => (
                                    <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          {account.isExcluded && (
                                            <Tooltip title="Hidden from totals">
                                              <VisibilityOffIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
                                            </Tooltip>
                                          )}
                                          {account.name}
                                          {account.type === 'mortgage' && (
                                            <Chip size="small" label="Mortgage" sx={{ ml: 1 }} />
                                          )}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{account.institution}</TableCell>
                                      <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                                      <TableCell align="right">{account.apr ? `${account.apr}%` : '-'}</TableCell>
                                      <TableCell align="right">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleOpenAccountMenu(e, account.id)}
                                        >
                                          <MoreVertIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                
                                {getDisplayAccounts().filter(account => account.type === 'loan' || account.type === 'mortgage').length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} align="center">
                                      <Typography variant="body2" color="text.secondary">
                                        No loans found
                                      </Typography>
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAccount}
                                        sx={{ mt: 1 }}
                                      >
                                        Add Loan
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                  
                  {/* Investment Accounts Section */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => toggleExpandedSection('investment')}
                          >
                            <TrendingUpIcon sx={{ mr: 1, color: accountTypeColors.investment }} />
                            <Typography variant="h6">
                              Investment Accounts
                            </Typography>
                            {expandedSection === 'investment' ? <ExpandLessIcon sx={{ ml: 1 }} /> : <ExpandMoreIcon sx={{ ml: 1 }} />}
                          </Box>
                        }
                      />
                      
                      <Collapse in={expandedSection === 'investment'}>
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Account Name</TableCell>
                                  <TableCell>Institution</TableCell>
                                  <TableCell align="right">Balance</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getDisplayAccounts()
                                  .filter(account => account.type === 'investment')
                                  .map((account) => (
                                    <TableRow key={account.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          {account.isExcluded && (
                                            <Tooltip title="Hidden from totals">
                                              <VisibilityOffIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />
                                            </Tooltip>
                                          )}
                                          {account.name}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{account.institution}</TableCell>
                                      <TableCell align="right">{formatCurrency(account.balance)}</TableCell>
                                      <TableCell align="right">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleOpenAccountMenu(e, account.id)}
                                        >
                                          <MoreVertIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                
                                {getDisplayAccounts().filter(account => account.type === 'investment').length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      <Typography variant="body2" color="text.secondary">
                                        No investment accounts found
                                      </Typography>
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAccount}
                                        sx={{ mt: 1 }}
                                      >
                                        Add Investment Account
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
            
            {/* Net Worth Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                {/* Net Worth Summary */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Your Financial Overview
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Assets
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {formatCurrency(netWorth.assets)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Liabilities
                          </Typography>
                          <Typography variant="h4" color="error.main">
                            {formatCurrency(netWorth.liabilities)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Net Worth
                          </Typography>
                          <Typography 
                            variant="h4" 
                            color={netWorth.netWorth >= 0 ? 'primary.main' : 'error.main'}
                          >
                            {formatCurrency(netWorth.netWorth)}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {/* Net Worth Progress Bar */}
                      {netWorth.assets > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Debt to Asset Ratio: {(netWorth.liabilities / netWorth.assets * 100).toFixed(1)}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1, mr: 1 }}>
                              <Box sx={{ 
                                height: 10, 
                                display: 'flex',
                                borderRadius: 5,
                                overflow: 'hidden'
                              }}>
                                <Box 
                                  sx={{ 
                                    width: `${Math.min(100, (netWorth.assets - netWorth.liabilities) / netWorth.assets * 100)}%`,
                                    bgcolor: theme.palette.success.main,
                                    height: '100%'
                                  }}
                                />
                                <Box 
                                  sx={{ 
                                    width: `${Math.min(100, netWorth.liabilities / netWorth.assets * 100)}%`,
                                    bgcolor: theme.palette.error.main,
                                    height: '100%'
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography variant="body2">
                              {(netWorth.assets > 0 ? (netWorth.netWorth / netWorth.assets * 100).toFixed(1) : 0)}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Net Worth
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Liabilities
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Asset Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardHeader 
                      title="Asset Breakdown" 
                      titleTypographyProps={{ variant: 'h6' }}
                    />
                    <Divider />
                    <CardContent>
                      {generateAssetAllocationData().length > 0 ? (
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={generateAssetAllocationData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={1}
                                dataKey="value"
                              >
                                {generateAssetAllocationData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No asset data available
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Liability Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardHeader 
                      title="Liability Breakdown" 
                      titleTypographyProps={{ variant: 'h6' }}
                    />
                    <Divider />
                    <CardContent>
                      {generateLiabilityData().length > 0 ? (
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={generateLiabilityData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={1}
                                dataKey="value"
                              >
                                {generateLiabilityData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No liability data available
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Account Distribution Chart */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Account Type Distribution" 
                      titleTypographyProps={{ variant: 'h6' }}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={generateAccountTypeData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <ChartTooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar 
                              dataKey="value" 
                              name="Balance" 
                              shape={(props) => {
                                const { x, y, width, height, name } = props;
                                const type = name.toLowerCase();
                                const color = accountTypeColors[type] || accountTypeColors.other;
                                
                                return (
                                  <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill={color}
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
              </Grid>
            )}
          </>
        )}
      </Box>
      
      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchorEl}
        open={Boolean(accountMenuAnchorEl)}
        onClose={handleCloseAccountMenu}
      >
        <MenuItem onClick={() => {
          const account = accounts.find(acc => acc.id === selectedAccountId);
          if (account) handleEditAccount(account);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Account</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleToggleAccountVisibility}>
          <ListItemIcon>
            {accounts.find(acc => acc.id === selectedAccountId)?.isExcluded ? (
              <VisibilityIcon fontSize="small" />
            ) : (
              <VisibilityOffIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {accounts.find(acc => acc.id === selectedAccountId)?.isExcluded ? 
              'Show in Totals' : 
              'Hide from Totals'
            }
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDeleteAccount} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Account</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Account Dialog */}
      <Dialog
        open={accountDialogOpen}
        onClose={handleCloseAccountDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Account' : 'Edit Account'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Account Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={newAccount.type}
                  onChange={(e) => handleAccountFieldChange('type', e.target.value)}
                  label="Account Type"
                >
                  <MenuItem value="checking">Checking Account</MenuItem>
                  <MenuItem value="savings">Savings Account</MenuItem>
                  <MenuItem value="creditCard">Credit Card</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                  <MenuItem value="mortgage">Mortgage</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Account Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Name"
                value={newAccount.name}
                onChange={(e) => handleAccountFieldChange('name', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            {/* Financial Institution */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Financial Institution"
                value={newAccount.institution}
                onChange={(e) => handleAccountFieldChange('institution', e.target.value)}
                fullWidth
              />
            </Grid>
            
            {/* Account Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Number (Last 4 digits)"
                value={newAccount.accountNumber}
                onChange={(e) => handleAccountFieldChange('accountNumber', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">****</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Current Balance */}
            <Grid item xs={12} sm={6}>
              <TextField
                label={newAccount.isCredit ? 'Current Balance (Debt)' : 'Current Balance'}
                value={newAccount.balance}
                onChange={(e) => handleAccountFieldChange('balance', parseFloat(e.target.value) || 0)}
                fullWidth
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Type specific fields */}
            {newAccount.type === 'creditCard' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Credit Limit"
                    value={newAccount.creditLimit}
                    onChange={(e) => handleAccountFieldChange('creditLimit', parseFloat(e.target.value) || 0)}
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="APR"
                    value={newAccount.apr}
                    onChange={(e) => handleAccountFieldChange('apr', parseFloat(e.target.value) || 0)}
                    fullWidth
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}
            
            {(newAccount.type === 'loan' || newAccount.type === 'mortgage') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Interest Rate"
                  value={newAccount.apr}
                  onChange={(e) => handleAccountFieldChange('apr', parseFloat(e.target.value) || 0)}
                  fullWidth
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            
            {newAccount.type === 'savings' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Interest Rate"
                  value={newAccount.interestRate}
                  onChange={(e) => handleAccountFieldChange('interestRate', parseFloat(e.target.value) || 0)}
                  fullWidth
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={newAccount.notes}
                onChange={(e) => handleAccountFieldChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            {/* Exclude from Totals */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newAccount.isExcluded}
                    onChange={(e) => handleAccountFieldChange('isExcluded', e.target.checked)}
                  />
                }
                label="Exclude from Net Worth calculations"
              />
              <FormHelperText>
                Hidden accounts won't be included in your net worth totals
              </FormHelperText>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseAccountDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSaveAccount}
            startIcon={<SaveIcon />}
          >
            Save Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Transfer Dialog */}
      <Dialog
        open={transferDialogOpen}
        onClose={handleCloseTransferDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Transfer Between Accounts
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* From Account */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>From Account</InputLabel>
                <Select
                  value={transferDetails.fromAccountId}
                  onChange={(e) => handleTransferFieldChange('fromAccountId', e.target.value)}
                  label="From Account"
                >
                  {getTransferableAccounts().map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* To Account */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>To Account</InputLabel>
                <Select
                  value={transferDetails.toAccountId}
                  onChange={(e) => handleTransferFieldChange('toAccountId', e.target.value)}
                  label="To Account"
                >
                  {getTransferableAccounts().map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Amount */}
            <Grid item xs={12}>
              <TextField
                label="Transfer Amount"
                value={transferDetails.amount}
                onChange={(e) => handleTransferFieldChange('amount', parseFloat(e.target.value) || 0)}
                fullWidth
                type="number"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                value={transferDetails.description}
                onChange={(e) => handleTransferFieldChange('description', e.target.value)}
                fullWidth
                placeholder="e.g., Moving money to savings"
              />
            </Grid>
          </Grid>
          
          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleExecuteTransfer}
            startIcon={<CompareArrowsIcon />}
          >
            Execute Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AccountManager;