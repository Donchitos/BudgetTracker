import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  LinearProgress,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

/**
 * Component to display alerts when categories are nearing or exceeding their budget limits
 */
const CategoryBudgetAlerts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get categories and transactions from Redux store with proper null checks
  const categoryState = useSelector(state => state.category);
  const transactionState = useSelector(state => state.transaction);

  const categories = categoryState?.categories || [];
  const transactions = transactionState?.transactions || [];
  
  // Local state
  const [expanded, setExpanded] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  
  // Process categories and transactions to find budget alerts
  const budgetAlerts = calculateBudgetAlerts(categories, transactions, dismissedAlerts);
  
  // Calculate the percentage of budget used and determine alert status
  function calculateBudgetAlerts(categories, transactions, dismissedAlerts) {
    if (!categories || !transactions) return [];
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear &&
             transaction.type === 'expense';
    });
    
    // Calculate spending by category
    const spendingByCategory = {};
    currentMonthTransactions.forEach(transaction => {
      if (transaction.category) {
        const categoryId = transaction.category._id || transaction.category;
        spendingByCategory[categoryId] = (spendingByCategory[categoryId] || 0) + transaction.amount;
      }
    });
    
    // Generate alerts for categories approaching or exceeding budget
    return categories
      .filter(category => category.budget && category.budget > 0)
      .map(category => {
        const spent = spendingByCategory[category._id] || 0;
        const budgetLimit = category.budget;
        const percentUsed = (spent / budgetLimit) * 100;
        
        // Determine alert severity
        let severity = 'success';
        if (percentUsed >= 100) {
          severity = 'error';
        } else if (percentUsed >= 85) {
          severity = 'warning';
        } else if (percentUsed >= 70) {
          severity = 'info';
        } else {
          return null; // Don't create alerts for categories under 70% used
        }
        
        // Skip dismissed alerts
        if (dismissedAlerts.includes(category._id)) {
          return null;
        }
        
        return {
          id: category._id,
          category: category,
          spent: spent,
          budget: budgetLimit,
          percentUsed: percentUsed,
          severity: severity
        };
      })
      .filter(alert => alert !== null) // Remove null entries
      .sort((a, b) => b.percentUsed - a.percentUsed); // Sort by percent used (highest first)
  }
  
  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };
  
  const handleNavigateToCategory = (categoryId) => {
    navigate(`/budget?category=${categoryId}`);
  };
  
  // If no alerts, return null or a collapsed component
  if (budgetAlerts.length === 0) {
    return null;
  }
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        mb: 3, 
        overflow: 'hidden',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: budgetAlerts.some(alert => alert.severity === 'error') 
          ? `4px solid ${theme.palette.error.main}` 
          : budgetAlerts.some(alert => alert.severity === 'warning')
            ? `4px solid ${theme.palette.warning.main}`
            : `4px solid ${theme.palette.info.main}`
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        cursor: 'pointer',
        bgcolor: theme.palette.background.default
      }}
      onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {budgetAlerts.some(alert => alert.severity === 'error') ? (
            <ErrorIcon color="error" sx={{ mr: 1 }} />
          ) : budgetAlerts.some(alert => alert.severity === 'warning') ? (
            <WarningIcon color="warning" sx={{ mr: 1 }} />
          ) : (
            <InfoIcon color="info" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6" component="div">
            Budget Alerts ({budgetAlerts.length})
          </Typography>
        </Box>
        
        <IconButton
          size="small"
          aria-label={expanded ? 'collapse' : 'expand'}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        <List disablePadding>
          {budgetAlerts.map((alert) => (
            <ListItem 
              key={alert.id}
              divider
              sx={{ 
                p: 0,
                '&:hover': {
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              <Alert
                severity={alert.severity}
                sx={{ 
                  width: '100%',
                  borderRadius: 0,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
                action={
                  <IconButton
                    aria-label="dismiss"
                    color="inherit"
                    size="small"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <AlertTitle sx={{ m: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {alert.category.icon ? (
                          <span className="material-icons" style={{ marginRight: '8px', fontSize: '1.2rem' }}>
                            {alert.category.icon}
                          </span>
                        ) : (
                          <ShoppingCartIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        )}
                        {alert.category.name}
                      </Box>
                    </AlertTitle>
                    <Chip 
                      label={`${Math.round(alert.percentUsed)}% Used`} 
                      color={alert.severity}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(alert.percentUsed, 100)} 
                    color={alert.severity}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}>
                    <Typography variant="body2">
                      Spent <strong>${alert.spent.toFixed(2)}</strong> of <strong>${alert.budget.toFixed(2)}</strong>
                      {alert.percentUsed >= 100 
                        ? ' - Budget exceeded!' 
                        : ` - ${(alert.budget - alert.spent).toFixed(2)} remaining`}
                    </Typography>
                    
                    <Button
                      size="small"
                      endIcon={<KeyboardArrowRightIcon />}
                      onClick={() => handleNavigateToCategory(alert.id)}
                      sx={{ mt: isMobile ? 1 : 0, ml: isMobile ? 0 : 2 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </Alert>
            </ListItem>
          ))}
        </List>

        {budgetAlerts.length > 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => navigate('/budget')}
            >
              Manage All Budgets
            </Button>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default CategoryBudgetAlerts;