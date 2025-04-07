import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  TablePagination,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import { format, isBefore, isToday, differenceInDays } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

import { getBills, deleteBill, markBillAsPaid } from '../../redux/actions/billActions';

const BillList = ({ onEdit }) => {
  const dispatch = useDispatch();
  const { bills, pagination, loading, error } = useSelector(state => state.bills);
  
  // Local state for filters, pagination and dialog
  const [filters, setFilters] = useState({
    isPaid: '',
    category: '',
    sortBy: 'dueDate:asc',
    page: 0,
    limit: 10
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // Load bills when component mounts or filters change
  useEffect(() => {
    fetchBills();
  }, [filters]);
  
  const fetchBills = async () => {
    try {
      // Convert filters for API
      const apiFilters = {
        ...filters,
        page: filters.page + 1, // API is 1-indexed, MUI is 0-indexed
        upcoming: filters.isPaid === 'upcoming' ? true : undefined,
        overdue: filters.isPaid === 'overdue' ? true : undefined,
        isPaid: filters.isPaid === 'paid' ? true : filters.isPaid === 'unpaid' ? false : undefined
      };
      
      await dispatch(getBills(apiFilters));
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 0 // Reset to first page when filters change
    }));
  };
  
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
  
  // Open delete confirmation dialog
  const handleDeleteClick = (bill) => {
    setSelectedBill(bill);
    setDeleteDialogOpen(true);
  };
  
  // Open mark as paid dialog
  const handlePayClick = (bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.amount.toString());
    setPaymentNotes(`Payment for ${bill.name}`);
    setPaymentDialogOpen(true);
  };
  
  // Handle bill deletion
  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteBill(selectedBill._id));
      setDeleteDialogOpen(false);
      fetchBills();
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };
  
  // Handle marking a bill as paid
  const handlePayConfirm = async () => {
    try {
      const paymentData = {
        amount: parseFloat(paymentAmount),
        notes: paymentNotes
      };
      
      await dispatch(markBillAsPaid(selectedBill._id, paymentData));
      setPaymentDialogOpen(false);
      fetchBills();
    } catch (err) {
      console.error('Error marking bill as paid:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Get status of bill (upcoming, overdue, etc.)
  const getBillStatus = (bill) => {
    if (bill.isPaid) {
      return { label: 'Paid', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
    }
    
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    
    if (isBefore(dueDate, today) && !isToday(dueDate)) {
      return { label: 'Overdue', color: 'error', icon: <ErrorIcon fontSize="small" /> };
    }
    
    if (isToday(dueDate)) {
      return { label: 'Due Today', color: 'warning', icon: <WarningIcon fontSize="small" /> };
    }
    
    const daysUntilDue = differenceInDays(dueDate, today);
    if (daysUntilDue <= bill.reminderDays) {
      return { label: `Due in ${daysUntilDue} days`, color: 'warning', icon: <WarningIcon fontSize="small" /> };
    }
    
    return { label: 'Upcoming', color: 'info', icon: null };
  };
  
  // Format bill frequency
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case 'one-time':
        return 'One Time';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return frequency;
    }
  };
  
  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            name="isPaid"
            value={filters.isPaid}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="sort-filter-label">Sort By</InputLabel>
          <Select
            labelId="sort-filter-label"
            id="sort-filter"
            name="sortBy"
            value={filters.sortBy}
            label="Sort By"
            onChange={handleFilterChange}
          >
            <MenuItem value="dueDate:asc">Due Date (Earliest)</MenuItem>
            <MenuItem value="dueDate:desc">Due Date (Latest)</MenuItem>
            <MenuItem value="amount:asc">Amount (Low-High)</MenuItem>
            <MenuItem value="amount:desc">Amount (High-Low)</MenuItem>
            <MenuItem value="name:asc">Name (A-Z)</MenuItem>
            <MenuItem value="name:desc">Name (Z-A)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Bills Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    No bills found. Add a bill to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => {
                const status = getBillStatus(bill);
                
                return (
                  <TableRow key={bill._id}>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        icon={status.icon}
                      />
                    </TableCell>
                    <TableCell>{bill.name}</TableCell>
                    <TableCell>{formatCurrency(bill.amount)}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell>{formatFrequency(bill.frequency)}</TableCell>
                    <TableCell>
                      {bill.category ? bill.category.name : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {!bill.isPaid && (
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handlePayClick(bill)}
                          title="Mark as Paid"
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => onEdit(bill)}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(bill)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Bill</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the bill "{selectedBill?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Mark Bill as Paid</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Record payment for {selectedBill?.name}
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Payment Amount"
            type="number"
            fullWidth
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            InputProps={{
              startAdornment: <span>$</span>,
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Payment Notes (Optional)"
            type="text"
            fullWidth
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePayConfirm} color="primary">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillList;