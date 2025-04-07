import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Collapse,
  Button,
  Divider,
  Chip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CategoryBudgetAlerts = () => {
  const { categories } = useSelector(state => state.categories);
  const { transactions } = useSelector(state => state.transactions);
  const [expanded, setExpanded] = useState(true);
  const [categorySpending, setCategorySpending] = useState([]);
  
  // Calculate spending for each category and compare to budget
  useEffect(() => {
    if (!categories || !transactions) return;
    
    // Get current month transactions
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             t.type === 'expense';
    });
    
    // Calculate spending by category
    const spending = categories.map(category => {
      // Find transactions for this category
      const categoryTransactions = thisMonthTransactions.filter(t => 
        t.category && t.category._id === category._id
      );
      
      // Calculate total spent
      const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate percentage of budget used
      const percentUsed = category.budget > 0 ? Math.round((totalSpent / category.budget) * 100) : 0;
      
      // Determine alert status
      let status = 'ok';
      if (category.budget > 0) {
        if (percentUsed >= 100) {
          status = 'exceeded';
        } else if (percentUsed >= 90) {
          status = 'critical';
        } else if (percentUsed >= 75) {
          status = 'warning';
        } else if (percentUsed >= 50) {
          status = 'approaching';
        }
      }
      
      return {
        ...category,
        spent: totalSpent,
        percentUsed,
        status,
        remaining: Math.max(0, category.budget - totalSpent)
      };
    });
    
    // Sort by alert status severity and then by percent used
    const sortedSpending = spending
      .filter(cat => cat.budget > 0) // Only include categories with budget
      .sort((a, b) => {
        const statusOrder = { exceeded: 4, critical: 3, warning: 2, approaching: 1, ok: 0 };
        const statusDiff = statusOrder[b.status] - statusOrder[a.status];
        
        return statusDiff !== 0 ? statusDiff : b.percentUsed - a.percentUsed;
      });
    
    setCategorySpending(sortedSpending);
  }, [categories, transactions]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'exceeded':
        return <ErrorIcon color="error" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'approaching':
        return <InfoIcon color="info" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded':
        return 'error';
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'approaching':
        return 'info';
      default:
        return 'success';
    }
  };
  
  // Get status description
  const getStatusDescription = (status, percentUsed) => {
    switch (status) {
      case 'exceeded':
        return `Exceeded budget by ${percentUsed - 100}%`;
      case 'critical':
        return `${percentUsed}% of budget used (critical)`;
      case 'warning':
        return `${percentUsed}% of budget used (warning)`;
      case 'approaching':
        return `${percentUsed}% of budget used`;
      default:
        return `${percentUsed}% of budget used`;
    }
  };
  
  // Get progress bar color
  const getProgressColor = (status) => {
    switch (status) {
      case 'exceeded':
        return 'error';
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'approaching':
        return 'info';
      default:
        return 'success';
    }
  };
  
  // Filter categories that need attention
  const alertCategories = categorySpending.filter(cat => 
    ['exceeded', 'critical', 'warning'].includes(cat.status)
  );
  
  // No alerts to show
  if (alertCategories.length === 0) {
    return (
      <Card>
        <CardHeader title="Budget Alerts" />
        <CardContent>
          <Alert severity="success">
            <AlertTitle>All Categories Within Budget</AlertTitle>
            You're doing well! All your spending categories are within budget limits.
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Budget Alerts" 
        action={
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        }
        subheader={`${alertCategories.length} categories need attention`}
      />
      <Divider />
      <Collapse in={expanded}>
        <CardContent>
          <List disablePadding>
            {alertCategories.map((category, index) => (
              <React.Fragment key={category._id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getStatusIcon(category.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{category.name}</Typography>
                        <Chip 
                          size="small" 
                          color={getStatusColor(category.status)} 
                          label={getStatusDescription(category.status, category.percentUsed)} 
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Spent: {formatCurrency(category.spent)} of {formatCurrency(category.budget)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {category.status === 'exceeded' ? 
                              'Over by: ' + formatCurrency(category.spent - category.budget) : 
                              'Remaining: ' + formatCurrency(category.remaining)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={category.percentUsed > 100 ? 100 : category.percentUsed} 
                          color={getProgressColor(category.status)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
          
          {alertCategories.some(cat => cat.status === 'exceeded') && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Budget Exceeded</AlertTitle>
              Some categories have exceeded their budget limits. Consider adjusting your spending or updating your budget.
            </Alert>
          )}
          
          {alertCategories.some(cat => cat.status === 'critical' && cat.status !== 'exceeded') && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Critical Budget Usage</AlertTitle>
              Some categories are at 90% or more of their budget. Review your spending to avoid exceeding your limits.
            </Alert>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CategoryBudgetAlerts;