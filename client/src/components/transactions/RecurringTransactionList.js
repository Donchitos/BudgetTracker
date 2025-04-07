import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  TablePagination,
  useTheme,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RepeatIcon from '@mui/icons-material/Repeat';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { 
  format, 
  isAfter, 
  isBefore, 
  isToday, 
  addDays, 
  addWeeks, 
  addMonths, 
  addYears 
} from 'date-fns';
import { 
  getRecurringTransactions, 
  deleteRecurringTransaction, 
  toggleRecurringTransaction 
} from '../../redux/actions/recurringTransactionActions';
import RecurringTransactionForm from './RecurringTransactionForm';

/**
 * RecurringTransactionList component
 * 
 * Displays a list of recurring transactions with management options
 */
const RecurringTransactionList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { recurringTransactions, loading } = useSelector(state => state.recurringTransactions);
  const { categories } = useSelector(state => state.categories);
  
  // States for UI controls
  const [openForm, setOpenForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionTransaction, setActionTransaction] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getRecurringTransactions());
  }, [dispatch]);
  
  // Handle opening action menu for a transaction
  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setActionTransaction(transaction);
  };
  
  // Handle closing action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionTransaction(null);
  };
  
  // Handle opening form to add new recurring transaction
  const handleAddNew = () => {
    setSelectedTransaction(null);
    setOpenForm(true);
  };
  
  // Handle opening form to edit transaction
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenForm(true);
    handleMenuClose();
  };
  
  // Handle opening confirm delete dialog
  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setConfirmDelete(true);
    handleMenuClose();
  };
  
  // Handle confirming deletion
  const handleConfirmDelete = () => {
    if (selectedTransaction) {
      dispatch(deleteRecurringTransaction(selectedTransaction._id));
    }
    setConfirmDelete(false);
    setSelectedTransaction(null);
  };
  
  // Handle toggling transaction active status
  const handleToggleStatus = (transaction) => {
    dispatch(toggleRecurringTransaction(transaction._id, !transaction.active));
    handleMenuClose();
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
  };
  
  // Handle pagination page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Calculate next occurrence date based on recurrence settings
  const calculateNextOccurrence = (transaction) => {
    if (!transaction.startDate) return null;
    
    let currentDate = new Date();
    let startDate = new Date(transaction.startDate);
    
    // If start date is in the future, that's the next occurrence
    if (isAfter(startDate, currentDate)) {
      return startDate;
    }
    
    // Calculate next occurrence based on frequency and interval
    let nextDate = startDate;
    
    while (isBefore(nextDate, currentDate) || isToday(nextDate)) {
      switch(transaction.frequency) {
        case 'daily':
          nextDate = addDays(nextDate, transaction.interval || 1);
          break;
        case 'weekly':
          nextDate = addWeeks(nextDate, transaction.interval || 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, transaction.interval || 1);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, transaction.interval || 1);
          break;
        default:
          nextDate = addMonths(nextDate, transaction.interval || 1);
      }
      
      // Check if beyond end date
      if (transaction.endDate && isAfter(nextDate, new Date(transaction.endDate))) {
        return null; // No more occurrences
      }
    }
    
    return nextDate;
  };
  
  // Get human-readable frequency text
  const getFrequencyText = (transaction) => {
    const interval = transaction.interval || 1;
    
    switch(transaction.frequency) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      case 'weekly':
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      case 'monthly':
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;
      case 'yearly':
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;
      default:
        return 'Regularly';
    }
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
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categories) return '';
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : '';
  };
  
  // Filter and search transactions
  const filteredTransactions = recurringTransactions?.filter(transaction => {
    // Filter by active status
    if (filter === 'active' && !transaction.active) return false;
    if (filter === 'inactive' && transaction.active) return false;
    
    // Search query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        getCategoryName(transaction.category).toLowerCase().includes(query) ||
        transaction.type.toLowerCase().includes(query) ||
        transaction.frequency.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) || [];
  
  // Paginate transactions
  const paginatedTransactions = filteredTransactions
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Render loading state
  if (loading && !recurringTransactions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 2, maxWidth: '100%' }}>
      {/* Header with Title and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Recurring Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          New Recurring Transaction
        </Button>
      </Box>
      
      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search transactions..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Filter Transactions">
            <span>
              <Chip
                icon={<FilterListIcon />}
                label="All"
                color={filter === 'all' ? 'primary' : 'default'}
                onClick={() => handleFilterChange('all')}
                clickable
              />
            </span>
          </Tooltip>
          
          <Tooltip title="Show Active Only">
            <span>
              <Chip
                icon={<ToggleOnIcon />}
                label="Active"
                color={filter === 'active' ? 'primary' : 'default'}
                onClick={() => handleFilterChange('active')}
                clickable
              />
            </span>
          </Tooltip>
          
          <Tooltip title="Show Inactive Only">
            <span>
              <Chip
                icon={<ToggleOffIcon />}
                label="Inactive"
                color={filter === 'inactive' ? 'primary' : 'default'}
                onClick={() => handleFilterChange('inactive')}
                clickable
              />
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Main Table */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Next Occurrence</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => {
                const nextOccurrence = calculateNextOccurrence(transaction);
                
                return (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <Typography variant="body2">{transaction.description}</Typography>
                      {transaction.notes && (
                        <Typography variant="caption" color="text.secondary">
                          {transaction.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 500 }}
                      >
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getCategoryName(transaction.category)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RepeatIcon 
                          fontSize="small" 
                          sx={{ mr: 1, color: 'primary.light' }} 
                        />
                        <Typography variant="body2">
                          {getFrequencyText(transaction)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {nextOccurrence ? (
                        <Typography variant="body2">
                          {format(nextOccurrence, 'MMM d, yyyy')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No future occurrences
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.active ? 'Active' : 'Inactive'}
                        color={transaction.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, transaction)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                    {searchQuery || filter !== 'all' ? 
                      'No transactions match your search or filter criteria.' : 
                      'No recurring transactions found. Create your first recurring transaction!'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredTransactions.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
      
      {/* Action Menu for a Transaction */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(actionTransaction)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(actionTransaction)}>
          {actionTransaction?.active ? (
            <>
              <ToggleOffIcon fontSize="small" sx={{ mr: 1 }} />
              Deactivate
            </>
          ) : (
            <>
              <ToggleOnIcon fontSize="small" sx={{ mr: 1 }} />
              Activate
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteClick(actionTransaction)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Recurring Transaction Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <RecurringTransactionForm 
            initialData={selectedTransaction} 
            onClose={() => setOpenForm(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the recurring transaction "{selectedTransaction?.description}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RecurringTransactionList;