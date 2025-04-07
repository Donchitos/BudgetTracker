import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { green, orange, red } from '@mui/material/colors';
import { getCategories } from '../../redux/actions/categoryActions';
import { getTransactions } from '../../redux/actions/transactionActions';

/**
 * CategoryBudgetAlerts component
 * 
 * Displays alerts for categories that are approaching or exceeding their budget limits
 */
const CategoryBudgetAlerts = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const { transactions } = useSelector(state => state.transactions);
  
  const [expanded, setExpanded] = useState(true);
  const [alertData, setAlertData] = useState([]);
  
  // Alert thresholds
  const WARNING_THRESHOLD = 0.75; // 75% of budget
  const CRITICAL_THRESHOLD = 1.0; // 100% of budget
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Get month range for current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };
  
  // Calculate current spending for each category
  useEffect(() => {
    if (!categories || !transactions) return;
    
    // Get the current month's date range
    const { start, end } = getCurrentMonthRange();
    
    // Filter transactions to current month and expenses only
    const currentMonthExpenses = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      return (
        transaction.type === 'expense' &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      );
    });
    
    // Calculate current spending for each category
    const categorySpendings = categories.reduce((acc, category) => {
      if (!category.budget || category.budget <= 0) return acc;
      
      const spending = currentMonthExpenses
        .filter(transaction => transaction.category && transaction.category._id === category._id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      const percentage = (spending / category.budget);
      
      // Only include categories with budgets that have spending
      if (percentage > 0) {
        let severity = 'info';
        
        if (percentage >= CRITICAL_THRESHOLD) {
          severity = 'error';
        } else if (percentage >= WARNING_THRESHOLD) {
          severity = 'warning';
        }
        
        acc.push({
          category,
          spending,
          budget: category.budget,
          percentage,
          severity,
          remaining: Math.max(0, category.budget - spending)
        });
      }
      
      return acc;
    }, []);
    
    // Sort by severity and then by percentage
    const sortedAlerts = categorySpendings.sort((a, b) => {
      if (a.severity === 'error' && b.severity !== 'error') return -1;
      if (a.severity !== 'error' && b.severity === 'error') return 1;
      if (a.severity === 'warning' && b.severity === 'info') return -1;
      if (a.severity === 'info' && b.severity === 'warning') return 1;
      return b.percentage - a.percentage;
    });
    
    setAlertData(sortedAlerts);
  }, [categories, transactions]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'error': return red[500];
      case 'warning': return orange[500];
      case 'info': return green[500];
      default: return null;
    }
  };
  
  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="success" />;
      default: return null;
    }
  };
  
  // If there are no alerts, show nothing
  if (alertData.length === 0) {
    return null;
  }
  
  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}
      >
        <Typography variant="h6">
          Budget Alerts
        </Typography>
        <IconButton onClick={toggleExpanded} size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <Collapse in={expanded}>
        <List disablePadding>
          {alertData.map((alert, index) => (
            <ListItem 
              key={alert.category._id}
              divider={index < alertData.length - 1}
              sx={{
                borderLeft: 4,
                borderLeftColor: getSeverityColor(alert.severity),
                bgcolor: alert.severity === 'error' ? red[50] : 'inherit'
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getSeverityIcon(alert.severity)}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {alert.category.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip 
                      label={`${(alert.percentage * 100).toFixed(0)}%`}
                      color={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'success'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, alert.percentage * 100)} 
                      color={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'success'}
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        Spent: {formatCurrency(alert.spending)}
                      </Typography>
                      <Typography variant="caption">
                        Budget: {formatCurrency(alert.budget)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        
        {alertData.some(alert => alert.severity === 'error') && (
          <Alert severity="error" sx={{ m: 2 }}>
            <AlertTitle>Budget Exceeded</AlertTitle>
            You've exceeded your budget in one or more categories. Consider adjusting your spending or your budget.
          </Alert>
        )}
        
        {!alertData.some(alert => alert.severity === 'error') && 
         alertData.some(alert => alert.severity === 'warning') && (
          <Alert severity="warning" sx={{ m: 2 }}>
            <AlertTitle>Approaching Limits</AlertTitle>
            You're approaching your budget limits in some categories. Monitor your spending carefully.
          </Alert>
        )}
      </Collapse>
    </Paper>
  );
};

export default CategoryBudgetAlerts;