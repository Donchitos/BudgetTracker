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
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  Tabs,
  Tab,
  InputAdornment,
  LinearProgress,
  Collapse,
  Slider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isWithinInterval, isSameMonth } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';

/**
 * Component for managing monthly budget cycles with rollover capabilities
 */
const MonthlyBudgetCycle = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get categories, budgets, and transactions from Redux
  const { categories, loading: categoriesLoading } = useSelector(state => state.category);
  const { transactions } = useSelector(state => state.transaction);
  const { budgetTemplates } = useSelector(state => state.budgetTemplate);
  
  // State for current month and settings
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rolloverSettings, setRolloverSettings] = useState({
    enabled: true,
    mode: 'all', // 'all', 'selected', or 'percentage'
    percentage: 100,
    selectedCategories: []
  });
  
  // Budget data state
  const [monthlyBudget, setMonthlyBudget] = useState([]);
  const [originalBudget, setOriginalBudget] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  
  // Tab state for analysis view
  const [activeTab, setActiveTab] = useState(0);
  
  // Initial data loading
  useEffect(() => {
    // Load categories and budget for current month
    loadBudgetForMonth(currentMonth);
  }, [currentMonth, categories, transactions, budgetTemplates]);
  
  // Load budget data for a specific month
  const loadBudgetForMonth = (date) => {
    if (!categories || categories.length === 0) return;
    
    // This would normally fetch from the backend
    // For this implementation, we'll simulate it
    
    // Get the budget template that applies to this month
    const template = budgetTemplates && budgetTemplates.length > 0
      ? budgetTemplates[0] // Just use the first template for demo
      : null;
    
    // Apply any rollovers from previous month
    const previousMonth = subMonths(date, 1);
    const rollovers = calculateRollovers(previousMonth);
    
    // Generate budget data for each category
    const budgetData = categories.map(category => {
      // Find the category budget from template
      const templateBudget = template 
        ? template.categories.find(c => c.categoryId === category._id)
        : null;
      
      // Find rollover for this category
      const rollover = rollovers.find(r => r.categoryId === category._id) || { amount: 0 };
      
      return {
        categoryId: category._id,
        name: category.name,
        color: category.color || '#808080',
        icon: category.icon,
        budget: templateBudget ? templateBudget.amount : 500, // Default budget if no template
        rolloverAmount: rollover.amount,
        totalBudget: (templateBudget ? templateBudget.amount : 500) + rollover.amount,
        spent: calculateSpentForCategory(category._id, date),
        remaining: function() { return this.totalBudget - this.spent; },
        percentUsed: function() { return this.spent / this.totalBudget * 100; }
      };
    });
    
    setMonthlyBudget(budgetData);
    setOriginalBudget(JSON.parse(JSON.stringify(budgetData))); // Deep copy for reset
    
    // Calculate overall budget progress
    updateBudgetProgress(budgetData);
  };
  
  // Calculate how much was spent in a category for a specific month
  const calculateSpentForCategory = (categoryId, month) => {
    if (!transactions) return 0;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        (t.category === categoryId || t.category?._id === categoryId) && 
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  // Calculate rollovers from the previous month
  const calculateRollovers = (previousMonth) => {
    // This would normally fetch from the backend
    // For this implementation, we'll simulate it
    
    if (!categories || categories.length === 0 || !transactions) return [];
    
    // Get the budget template for the previous month
    const template = budgetTemplates && budgetTemplates.length > 0
      ? budgetTemplates[0] // Just use the first template for demo
      : null;
    
    // Calculate unspent amounts for each category
    return categories.map(category => {
      // Find the category budget from template
      const templateBudget = template 
        ? template.categories.find(c => c.categoryId === category._id)
        : null;
      
      const budgetAmount = templateBudget ? templateBudget.amount : 500;
      const spent = calculateSpentForCategory(category._id, previousMonth);
      const unspent = Math.max(0, budgetAmount - spent);
      
      // Apply rollover settings
      let rolloverAmount = 0;
      
      if (rolloverSettings.enabled) {
        if (rolloverSettings.mode === 'all') {
          rolloverAmount = unspent;
        } else if (rolloverSettings.mode === 'selected' && 
                  rolloverSettings.selectedCategories.includes(category._id)) {
          rolloverAmount = unspent;
        } else if (rolloverSettings.mode === 'percentage') {
          rolloverAmount = unspent * (rolloverSettings.percentage / 100);
        }
      }
      
      return {
        categoryId: category._id,
        amount: Math.round(rolloverAmount * 100) / 100, // Round to 2 decimal places
        fromMonth: format(previousMonth, 'MMM yyyy')
      };
    });
  };
  
  // Update budget progress data
  const updateBudgetProgress = (budgetData) => {
    const totalBudget = budgetData.reduce((sum, cat) => sum + cat.totalBudget, 0);
    const totalSpent = budgetData.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Categorize budget items by health
    const healthyCategories = budgetData.filter(cat => cat.percentUsed() <= 80);
    const warningCategories = budgetData.filter(cat => cat.percentUsed() > 80 && cat.percentUsed() <= 100);
    const overBudgetCategories = budgetData.filter(cat => cat.percentUsed() > 100);
    
    // Calculate rollover potential for next month
    const potentialRollover = budgetData.reduce((sum, cat) => sum + Math.max(0, cat.remaining()), 0);
    
    setBudgetProgress({
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercent,
      healthyCategories,
      warningCategories,
      overBudgetCategories,
      potentialRollover
    });
  };
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Handle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode without saving
      setMonthlyBudget(JSON.parse(JSON.stringify(originalBudget)));
    }
    setEditMode(!editMode);
  };
  
  // Handle budget changes
  const handleBudgetChange = (categoryId, value) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) return;
    
    setMonthlyBudget(prevBudget => {
      const updatedBudget = prevBudget.map(cat => {
        if (cat.categoryId === categoryId) {
          return {
            ...cat,
            budget: numValue,
            totalBudget: numValue + cat.rolloverAmount
          };
        }
        return cat;
      });
      
      // Also update overall budget progress
      updateBudgetProgress(updatedBudget);
      
      return updatedBudget;
    });
  };
  
  // Save budget changes
  const saveBudgetChanges = () => {
    setSavingChanges(true);
    setErrorMessage(null);
    
    // This would normally call an API endpoint
    // For this implementation, we'll simulate it with a timeout
    setTimeout(() => {
      // Update the original budget with the new values
      setOriginalBudget(JSON.parse(JSON.stringify(monthlyBudget)));
      
      // Exit edit mode
      setEditMode(false);
      setSavingChanges(false);
      setSuccessMessage('Budget saved successfully');
      
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
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
  
  // Menu handlers
  const handleOpenMenu = (event, categoryId) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveCategoryId(categoryId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveCategoryId(null);
  };
  
  // Zero out a category
  const resetCategory = () => {
    if (!activeCategoryId) return;
    
    setMonthlyBudget(prevBudget => {
      const updatedBudget = prevBudget.map(cat => {
        if (cat.categoryId === activeCategoryId) {
          return {
            ...cat,
            budget: 0,
            totalBudget: cat.rolloverAmount
          };
        }
        return cat;
      });
      
      updateBudgetProgress(updatedBudget);
      return updatedBudget;
    });
    
    handleCloseMenu();
  };
  
  // Copy budget from last month
  const copyFromLastMonth = () => {
    // This would normally call an API endpoint
    // For this implementation, we'll simulate it
    
    const previousMonth = subMonths(currentMonth, 1);
    
    // In a real app, this would load the previous month's budget
    // For now, we'll just use the current budget as a placeholder
    setMonthlyBudget(prevBudget => {
      const updatedBudget = prevBudget.map(cat => ({
        ...cat,
        budget: cat.budget, // In a real app, this would be the previous month's budget
        totalBudget: cat.budget + cat.rolloverAmount
      }));
      
      updateBudgetProgress(updatedBudget);
      return updatedBudget;
    });
  };
  
  // Handle settings dialog
  const toggleSettingsDialog = () => {
    setSettingsOpen(!settingsOpen);
  };
  
  // Update rollover settings
  const handleRolloverSettingChange = (setting, value) => {
    setRolloverSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Toggle a category for selective rollover
  const toggleCategoryForRollover = (categoryId) => {
    setRolloverSettings(prev => {
      const selectedCategories = [...prev.selectedCategories];
      const index = selectedCategories.indexOf(categoryId);
      
      if (index >= 0) {
        selectedCategories.splice(index, 1);
      } else {
        selectedCategories.push(categoryId);
      }
      
      return {
        ...prev,
        selectedCategories
      };
    });
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
      {/* Header with month navigation */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')} Budget
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit"
            onClick={goToPreviousMonth}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Button
            color="inherit"
            size="small"
            onClick={goToCurrentMonth}
            sx={{ mx: 1 }}
          >
            Today
          </Button>
          
          <IconButton 
            color="inherit"
            onClick={goToNextMonth}
            disabled={isSameMonth(currentMonth, new Date()) || isWithinInterval(currentMonth, { 
              start: new Date(), 
              end: addMonths(new Date(), 6) 
            })}
          >
            <ArrowForwardIcon />
          </IconButton>
          
          <Tooltip title="Budget Settings">
            <IconButton 
              color="inherit"
              onClick={toggleSettingsDialog}
              sx={{ ml: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Budget" />
          <Tab label="Analysis" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      <Box sx={{ p: 2 }}>
        {/* Budget Tab */}
        {activeTab === 0 && (
          <>
            {/* Summary cards */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    color: 'white',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Total Budget
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(budgetProgress.totalBudget || 0)}
                    </Typography>
                    {budgetProgress.totalBudget > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Base: {formatCurrency(monthlyBudget.reduce((sum, cat) => sum + cat.budget, 0))}
                        </Typography>
                        {monthlyBudget.some(cat => cat.rolloverAmount > 0) && (
                          <Chip
                            size="small"
                            label={`+${formatCurrency(monthlyBudget.reduce((sum, cat) => sum + cat.rolloverAmount, 0))} rolled over`}
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: theme.palette.error.main, 
                    color: 'white',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Spent So Far
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(budgetProgress.totalSpent || 0)}
                    </Typography>
                    {budgetProgress.totalBudget > 0 && (
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(budgetProgress.overallPercent || 0, 100)}
                        sx={{ 
                          mt: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'white'
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: theme.palette.success.main, 
                    color: 'white',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Remaining
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(budgetProgress.totalRemaining || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2">
                        {budgetProgress.overallPercent ? 
                          `${Math.round(budgetProgress.overallPercent)}% used` : 
                          '0% used'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: theme.palette.info.main, 
                    color: 'white',
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Potential Rollover
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(budgetProgress.potentialRollover || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                      <Typography variant="body2">
                        {isSameMonth(currentMonth, new Date()) ? 
                          'Current month' : 
                          `For ${format(addMonths(currentMonth, 1), 'MMM yyyy')}`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Status and actions */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {budgetProgress.overBudgetCategories?.length > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${budgetProgress.overBudgetCategories.length} categories over budget`}
                    color="error"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                
                {budgetProgress.warningCategories?.length > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${budgetProgress.warningCategories.length} categories near limit`}
                    color="warning"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                
                {errorMessage && (
                  <Chip
                    icon={<CloseIcon />}
                    label={errorMessage}
                    color="error"
                    onDelete={() => setErrorMessage(null)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                
                {successMessage && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={successMessage}
                    color="success"
                    onDelete={() => setSuccessMessage(null)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>
              
              <Box>
                {editMode ? (
                  <>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<CloseIcon />}
                      onClick={toggleEditMode}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={savingChanges ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={saveBudgetChanges}
                      disabled={savingChanges}
                    >
                      {savingChanges ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<CopyAllIcon />}
                      onClick={copyFromLastMonth}
                      sx={{ mr: 1 }}
                    >
                      Copy from Last Month
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={toggleEditMode}
                    >
                      Edit Budget
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            
            {/* Budget categories table */}
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Base Budget</TableCell>
                    <TableCell align="right">Rollover</TableCell>
                    <TableCell align="right">Total Budget</TableCell>
                    <TableCell align="right">Spent</TableCell>
                    <TableCell align="right">Remaining</TableCell>
                    <TableCell align="right">Progress</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyBudget.map((category) => (
                    <TableRow 
                      key={category.categoryId}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: category.percentUsed() > 100 ? 
                          `${theme.palette.error.main}10` : 
                          category.percentUsed() > 80 ? 
                            `${theme.palette.warning.main}10` : 
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
                              mr: 1.5
                            }} 
                          />
                          {category.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {editMode ? (
                          <TextField
                            value={category.budget}
                            onChange={(e) => handleBudgetChange(category.categoryId, e.target.value)}
                            variant="outlined"
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            sx={{ width: 120 }}
                          />
                        ) : (
                          formatCurrency(category.budget)
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {category.rolloverAmount > 0 ? (
                          <Chip
                            size="small"
                            label={`+${formatCurrency(category.rolloverAmount)}`}
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(category.totalBudget)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: category.percentUsed() > 100 ? 
                            theme.palette.error.main : 
                            'inherit' 
                        }}
                      >
                        {formatCurrency(category.spent)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: category.remaining() < 0 ? 
                            theme.palette.error.main : 
                            theme.palette.success.main,
                          fontWeight: 'bold'
                        }}
                      >
                        {formatCurrency(category.remaining())}
                      </TableCell>
                      <TableCell align="right" sx={{ width: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(category.percentUsed(), 100)}
                            sx={{ 
                              flexGrow: 1, 
                              height: 8, 
                              borderRadius: 4,
                              mr: 1,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: category.percentUsed() > 100 ? 
                                  theme.palette.error.main : 
                                  category.percentUsed() > 80 ? 
                                    theme.palette.warning.main : 
                                    theme.palette.success.main
                              }
                            }}
                          />
                          <Typography variant="caption">
                            {Math.round(category.percentUsed())}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, category.categoryId)}
                          disabled={!editMode}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Category action menu */}
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={resetCategory}>
                <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                Zero Out Budget
              </MenuItem>
            </Menu>
          </>
        )}
        
        {/* Analysis Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {/* Spending by Category */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader 
                  title="Spending by Category" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyBudget.filter(cat => cat.spent > 0)}
                          dataKey="spent"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {monthlyBudget.filter(cat => cat.spent > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <ChartTooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Budget vs Actual */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader 
                  title="Budget vs Actual" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyBudget.filter(cat => cat.totalBudget > 0 || cat.spent > 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <ChartTooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="totalBudget" name="Budget" fill={theme.palette.primary.main} />
                        <Bar dataKey="spent" name="Actual" fill={theme.palette.secondary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Budget Status Summary */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader 
                  title="Budget Status Summary" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          bgcolor: theme.palette.success.main + '10',
                          borderColor: theme.palette.success.main,
                          height: '100%'
                        }}
                      >
                        <Typography variant="subtitle1" color="success.main" sx={{ mb: 1 }}>
                          Healthy Categories ({budgetProgress.healthyCategories?.length || 0})
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            Under 80% of budget used
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          {budgetProgress.healthyCategories?.slice(0, 3).map(cat => (
                            <Chip
                              key={cat.categoryId}
                              label={`${cat.name}: ${Math.round(cat.percentUsed())}%`}
                              size="small"
                              sx={{ m: 0.5 }}
                              color="success"
                              variant="outlined"
                            />
                          ))}
                          
                          {budgetProgress.healthyCategories?.length > 3 && (
                            <Chip
                              label={`+${budgetProgress.healthyCategories.length - 3} more`}
                              size="small"
                              sx={{ m: 0.5 }}
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          bgcolor: theme.palette.warning.main + '10',
                          borderColor: theme.palette.warning.main,
                          height: '100%'
                        }}
                      >
                        <Typography variant="subtitle1" color="warning.main" sx={{ mb: 1 }}>
                          Warning Categories ({budgetProgress.warningCategories?.length || 0})
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <WarningIcon color="warning" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            Between 80-100% of budget used
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          {budgetProgress.warningCategories?.slice(0, 3).map(cat => (
                            <Chip
                              key={cat.categoryId}
                              label={`${cat.name}: ${Math.round(cat.percentUsed())}%`}
                              size="small"
                              sx={{ m: 0.5 }}
                              color="warning"
                              variant="outlined"
                            />
                          ))}
                          
                          {budgetProgress.warningCategories?.length > 3 && (
                            <Chip
                              label={`+${budgetProgress.warningCategories.length - 3} more`}
                              size="small"
                              sx={{ m: 0.5 }}
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          bgcolor: theme.palette.error.main + '10',
                          borderColor: theme.palette.error.main,
                          height: '100%'
                        }}
                      >
                        <Typography variant="subtitle1" color="error" sx={{ mb: 1 }}>
                          Over Budget Categories ({budgetProgress.overBudgetCategories?.length || 0})
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ErrorIcon color="error" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            Exceeded budget allocation
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          {budgetProgress.overBudgetCategories?.slice(0, 3).map(cat => (
                            <Chip
                              key={cat.categoryId}
                              label={`${cat.name}: ${Math.round(cat.percentUsed())}%`}
                              size="small"
                              sx={{ m: 0.5 }}
                              color="error"
                              variant="outlined"
                            />
                          ))}
                          
                          {budgetProgress.overBudgetCategories?.length > 3 && (
                            <Chip
                              label={`+${budgetProgress.overBudgetCategories.length - 3} more`}
                              size="small"
                              sx={{ m: 0.5 }}
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      
      {/* Budget Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={toggleSettingsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Budget Settings
          <IconButton
            aria-label="close"
            onClick={toggleSettingsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Rollover Settings
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure how unspent budget amounts are handled at the end of each month.
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={rolloverSettings.enabled}
                onChange={(e) => handleRolloverSettingChange('enabled', e.target.checked)}
                color="primary"
              />
            }
            label="Enable budget rollover"
          />
          
          <Collapse in={rolloverSettings.enabled}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Rollover Mode
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      bgcolor: rolloverSettings.mode === 'all' ? `${theme.palette.primary.main}10` : 'inherit',
                      borderColor: rolloverSettings.mode === 'all' ? theme.palette.primary.main : theme.palette.divider
                    }}
                    onClick={() => handleRolloverSettingChange('mode', 'all')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        Roll over all
                      </Typography>
                      {rolloverSettings.mode === 'all' && (
                        <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Roll over 100% of unspent amount from all categories
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      bgcolor: rolloverSettings.mode === 'selected' ? `${theme.palette.primary.main}10` : 'inherit',
                      borderColor: rolloverSettings.mode === 'selected' ? theme.palette.primary.main : theme.palette.divider
                    }}
                    onClick={() => handleRolloverSettingChange('mode', 'selected')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        Selected categories
                      </Typography>
                      {rolloverSettings.mode === 'selected' && (
                        <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Roll over only from selected categories
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      bgcolor: rolloverSettings.mode === 'percentage' ? `${theme.palette.primary.main}10` : 'inherit',
                      borderColor: rolloverSettings.mode === 'percentage' ? theme.palette.primary.main : theme.palette.divider
                    }}
                    onClick={() => handleRolloverSettingChange('mode', 'percentage')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        Percentage
                      </Typography>
                      {rolloverSettings.mode === 'percentage' && (
                        <CheckCircleIcon color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Roll over a percentage of unspent amounts
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Percentage slider for percentage mode */}
              {rolloverSettings.mode === 'percentage' && (
                <Box sx={{ mt: 3 }}>
                  <Typography id="percentage-slider" gutterBottom>
                    Rollover Percentage: {rolloverSettings.percentage}%
                  </Typography>
                  <Slider
                    aria-labelledby="percentage-slider"
                    value={rolloverSettings.percentage}
                    onChange={(e, newValue) => handleRolloverSettingChange('percentage', newValue)}
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' }
                    ]}
                    min={0}
                    max={100}
                  />
                </Box>
              )}
              
              {/* Category selection for selected mode */}
              {rolloverSettings.mode === 'selected' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Categories to Roll Over
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {categories?.map(category => (
                      <Chip
                        key={category._id}
                        label={category.name}
                        onClick={() => toggleCategoryForRollover(category._id)}
                        color={rolloverSettings.selectedCategories.includes(category._id) ? 'primary' : 'default'}
                        variant={rolloverSettings.selectedCategories.includes(category._id) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={toggleSettingsDialog}>
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // In a real app, this would save settings to backend
              toggleSettingsDialog();
              
              // Show success message
              setSuccessMessage('Budget settings saved successfully');
              setTimeout(() => setSuccessMessage(null), 3000);
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MonthlyBudgetCycle;