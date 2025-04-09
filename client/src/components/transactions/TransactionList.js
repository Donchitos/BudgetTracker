import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Chip,
  Checkbox,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { format } from 'date-fns';
import { getTransactions, deleteTransaction } from '../../redux/actions/transactionActions';
import AdvancedTransactionForm from './AdvancedTransactionForm';
import BulkEditDialog from './BulkEditDialog';

/**
 * TransactionList component
 * 
 * Displays a list of transactions with filtering, sorting, and bulk edit capabilities
 */
const TransactionList = ({ filters, onFilterChange }) => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector(state => state.transaction);
  const { categories } = useSelector(state => state.category);
  
  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuTransaction, setActionMenuTransaction] = useState(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  
  // Load transactions
  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };
  
  // Handle transaction selection
  const handleSelectTransaction = (transaction) => {
    const selectedIndex = selectedTransactions.findIndex(t => t._id === transaction._id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selectedTransactions, transaction];
    } else {
      newSelected = selectedTransactions.filter(t => t._id !== transaction._id);
    }
    
    setSelectedTransactions(newSelected);
  };
  
  // Handle select all transactions
  const handleSelectAllTransactions = (event) => {
    if (event.target.checked) {
      setSelectedTransactions(filteredTransactions);
    } else {
      setSelectedTransactions([]);
    }
  };
  
  // Handle transaction edit
  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setActionMenuAnchorEl(null);
  };
  
  // Handle transaction duplicate
  const handleDuplicateTransaction = (transaction) => {
    const duplicatedTransaction = {
      ...transaction,
      description: `Copy of ${transaction.description}`,
      _id: null
    };
    setEditTransaction(duplicatedTransaction);
    setActionMenuAnchorEl(null);
  };
  
  // Handle transaction delete
  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(transactionId));
    }
    setActionMenuAnchorEl(null);
  };
  
  // Handle bulk actions menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle bulk actions menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle transaction action menu open
  const handleActionMenuOpen = (event, transaction) => {
    event.stopPropagation();
    setActionMenuTransaction(transaction);
    setActionMenuAnchorEl(event.currentTarget);
  };
  
  // Handle transaction action menu close
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setActionMenuTransaction(null);
  };
  
  // Handle bulk edit
  const handleBulkEdit = () => {
    setShowBulkEdit(true);
    handleMenuClose();
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTransactions.length} transaction(s)?`)) {
      selectedTransactions.forEach(transaction => {
        dispatch(deleteTransaction(transaction._id));
      });
      setSelectedTransactions([]);
    }
    handleMenuClose();
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories?.find(c => c._id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  // Filter transactions based on search query and other filters
  const filteredTransactions = transactions?.filter(transaction => {
    // Search query filter
    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply additional filters if provided
    if (filters) {
      // Transaction type filter
      if (filters.types && filters.types.length > 0 && !filters.types.includes(transaction.type)) {
        return false;
      }
      
      // Category filter
      if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(transaction.category)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        if (filters.dateRange.startDate && new Date(transaction.date) < new Date(filters.dateRange.startDate)) {
          return false;
        }
        if (filters.dateRange.endDate && new Date(transaction.date) > new Date(filters.dateRange.endDate)) {
          return false;
        }
      }
      
      // Amount range filter
      if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const transactionTags = transaction.tags || [];
        if (!filters.tags.some(tag => transactionTags.includes(tag))) {
          return false;
        }
      }
    }
    
    return true;
  }) || [];
  
  // Slice transactions for pagination
  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Check if a transaction is selected
  const isSelected = (transactionId) => {
    return selectedTransactions.findIndex(t => t._id === transactionId) !== -1;
  };
  
  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <TextField
          placeholder="Search transactions..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          size="small"
          onClick={() => onFilterChange && onFilterChange({ showAdvancedSearch: true })}
        >
          Filters
        </Button>
        
        {selectedTransactions.length > 0 && (
          <>
            <Button
              variant="contained"
              size="small"
              onClick={handleMenuOpen}
              startIcon={<MoreVertIcon />}
            >
              Bulk Actions ({selectedTransactions.length})
            </Button>
            
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleBulkEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Selected</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleBulkDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Selected</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
      
      {/* Transaction table */}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < filteredTransactions.length}
                  checked={filteredTransactions.length > 0 && selectedTransactions.length === filteredTransactions.length}
                  onChange={handleSelectAllTransactions}
                />
              </TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No transactions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchQuery || (filters && Object.values(filters).some(value => 
                      (Array.isArray(value) && value.length > 0) || 
                      (typeof value === 'object' && value !== null && Object.values(value).some(v => v !== null && v !== '')) ||
                      (typeof value === 'string' && value !== '')
                    )) ? 
                      'Try adjusting your search or filters' : 
                      'Add some transactions to get started'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map(transaction => {
                const isItemSelected = isSelected(transaction._id);
                
                return (
                  <TableRow 
                    key={transaction._id}
                    hover
                    selected={isItemSelected}
                    onClick={() => handleSelectTransaction(transaction)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{getCategoryName(transaction.category)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={transaction.type === 'expense' ? 'error' : 'success.main'}
                        fontWeight="medium"
                      >
                        {transaction.type === 'expense' ? '-' : '+'}
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.tags && transaction.tags.map(tag => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                          variant="outlined"
                          icon={<LocalOfferIcon fontSize="small" />}
                        />
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Transaction actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, transaction)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Transaction action menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleEditTransaction(actionMenuTransaction)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDuplicateTransaction(actionMenuTransaction)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTransaction(actionMenuTransaction?._id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Transaction edit dialog */}
      <AdvancedTransactionForm
        open={!!editTransaction}
        onClose={() => setEditTransaction(null)}
        initialData={editTransaction}
      />
      
      {/* Bulk edit dialog */}
      <BulkEditDialog
        open={showBulkEdit}
        onClose={() => {
          setShowBulkEdit(false);
          setSelectedTransactions([]);
        }}
        selectedTransactions={selectedTransactions}
      />
    </Box>
  );
};

export default TransactionList;