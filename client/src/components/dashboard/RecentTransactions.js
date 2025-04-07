import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import { getTransactions } from '../../redux/actions/transactionActions';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

const RecentTransactions = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setLoading(true);
      try {
        // Get the current date
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        
        // Fetch recent transactions (limited to 5)
        const response = await dispatch(getTransactions({
          startDate: monthStart,
          limit: 5,
          sortBy: 'date:desc'
        }));
        
        if (response && response.data) {
          setTransactions(response.data);
        } else {
          setTransactions([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load recent transactions');
        setLoading(false);
      }
    };
    
    fetchRecentTransactions();
  }, [dispatch]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd');
  };
  
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" color="primary">
          Recent Transactions
        </Typography>
        <Button 
          component={RouterLink} 
          to="/transactions" 
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View All
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : transactions.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Typography color="textSecondary">No recent transactions</Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', overflow: 'auto', flexGrow: 1 }}>
          {transactions.map((transaction, index) => (
            <React.Fragment key={transaction._id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start" sx={{ py: 1, px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        component="span" 
                        sx={{ 
                          display: 'inline-block',
                          maxWidth: '70%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {transaction.description}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: transaction.type === 'income' ? 'success.main' : 'error.main' 
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDate(transaction.date)}
                        </Typography>
                        {transaction.category && (
                          <Chip 
                            label={transaction.category.name} 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              height: 20, 
                              '& .MuiChip-label': { px: 1, py: 0 },
                              bgcolor: transaction.category.color || 'primary.main',
                              color: '#fff'
                            }}
                          />
                        )}
                      </Box>
                      
                      <Chip 
                        label={transaction.type} 
                        size="small" 
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentTransactions;