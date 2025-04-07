import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

// Import Redux actions
import { getTransactions, deleteTransaction } from '../../redux/actions/transactionActions';

const TransactionList = () => {
  const dispatch = useDispatch();
  const { transactions, pagination, loading, error } = useSelector(state => state.transactions);
  const { categories } = useSelector(state => state.categories);
  
  // Local state for filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 0,
    limit: 10
  });
  
  // Load transactions when component mounts
  useEffect(() => {
    dispatch(getTransactions(filters));
  }, [dispatch, filters]);
  
  // Handle pagination change
  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };
  
  // Handle rows per page change
  const handleLimitChange = (event) => {
    setFilters(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 0 
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value,
      page: 0 // Reset page when filters change
    }));
  };
  
  // Handle transaction deletion
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTransaction(id));
      // Refresh transaction list
      dispatch(getTransactions(filters));
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };
  
  // Format currency amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  if (loading && !transactions.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Transactions
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                name="type"
                value={filters.type}
                label="Type"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                name="category"
                value={filters.category}
                label="Category"
                onChange={handleFilterChange}
                disabled={!categories || categories.length === 0}
              >
                <MenuItem value="">All</MenuItem>
                {categories && categories.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="endDate"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Transactions Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(transaction => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type} 
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {transaction.category ? transaction.category.name : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {formatAmount(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(transaction._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={filters.page}
          onPageChange={handlePageChange}
          rowsPerPage={filters.limit}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Paper>
  );
};

export default TransactionList;