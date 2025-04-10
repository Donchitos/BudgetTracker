import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Badge,
  CircularProgress,
  Stack,
  Link,
  Tooltip
} from '@mui/material';
import { format, isToday, isPast, isFuture, differenceInDays } from 'date-fns';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import LaunchIcon from '@mui/icons-material/Launch';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import { getUpcomingBills, markBillAsPaid } from '../../redux/actions/billActions';

const BillReminders = () => {
  const dispatch = useDispatch();
  
  // Get bill data with fallback for demo mode
  const billState = useSelector(state => state.bill);
  const {
    reminders = [],
    upcomingBills = [],
    overdueBills = [],
    loading = false
  } = billState || {};
  
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',
    createTransaction: true,
    paymentMethod: '',
    notes: ''
  });
  
  // Load upcoming bills when component mounts
  useEffect(() => {
    dispatch(getUpcomingBills(10)); // Look 10 days ahead
  }, [dispatch]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Get status chip for a bill
  const getBillStatusChip = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isPast(due) && !isToday(due)) {
      return (
        <Chip 
          size="small" 
          color="error" 
          icon={<WarningIcon />} 
          label="Overdue" 
        />
      );
    } else if (isToday(due)) {
      return (
        <Chip 
          size="small" 
          color="warning" 
          icon={<EventIcon />} 
          label="Due Today" 
        />
      );
    } else if (differenceInDays(due, today) <= 3) {
      return (
        <Chip 
          size="small" 
          color="warning" 
          icon={<EventIcon />} 
          label="Due Soon" 
        />
      );
    } else {
      return (
        <Chip 
          size="small" 
          color="primary" 
          icon={<EventIcon />} 
          label="Upcoming" 
        />
      );
    }
  };
  
  // Handle opening the payment dialog
  const handlePaymentClick = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      paymentAmount: bill.amount.toString(),
      createTransaction: true,
      paymentMethod: bill.paymentMethod || '',
      notes: ''
    });
    setPayDialogOpen(true);
  };
  
  // Handle payment form input changes
  const handlePaymentDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // For amount field, validate it's a positive number
    if (name === 'paymentAmount' && value !== '') {
      if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        return; // Don't update if invalid
      }
    }
    
    setPaymentData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle bill payment submission
  const handlePayBill = async () => {
    if (!selectedBill) return;
    
    // Validate payment amount
    if (!paymentData.paymentAmount || parseFloat(paymentData.paymentAmount) <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(markBillAsPaid(selectedBill._id, paymentData));
      setPayDialogOpen(false);
      dispatch(getUpcomingBills(10)); // Refresh the reminders
    } catch (err) {
      console.error('Error paying bill:', err);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Open website link
  const handleOpenWebsite = (website, e) => {
    e.stopPropagation();
    window.open(website, '_blank', 'noopener,noreferrer');
  };
  
  // Count total reminders
  const totalReminders = (reminders?.length || 0) + (overdueBills?.length || 0);
  
  // Show loading state or empty state
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={30} color="primary" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading bill reminders...
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if ((!reminders || reminders.length === 0) && (!overdueBills || overdueBills.length === 0)) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Bill Reminders</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" color="text.secondary">
              No upcoming bills due soon
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/bills"
                startIcon={<PaymentIcon />}
                variant="contained"
                size="small"
              >
                Manage Bills
              </Button>
              <Button
                component={RouterLink}
                to="/bills/add"
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
              >
                Add New Bill
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={totalReminders} color="error" sx={{ mr: 1 }}>
              <EventIcon />
            </Badge>
            <Typography variant="h6">Bill Reminders</Typography>
          </Box>
        </Box>
        
        {overdueBills && overdueBills.length > 0 && (
          <>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Overdue Bills
            </Typography>
            <List dense disablePadding>
              {overdueBills.slice(0, 3).map(bill => (
                <ListItem
                  key={bill._id}
                  divider
                  disablePadding
                  sx={{ py: 1 }}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handlePaymentClick(bill)}
                      startIcon={<PaymentIcon />}
                    >
                      Pay Now
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ fontWeight: 'medium', mr: 1 }}
                        >
                          {bill.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          color="error" 
                          label="Overdue" 
                          sx={{ height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {formatCurrency(bill.amount)}
                        </Typography>
                        <Typography variant="caption" color="error">
                          Due {formatDate(bill.dueDate)}
                        </Typography>
                        {bill.website && (
                          <Tooltip title="Go to payment website">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleOpenWebsite(bill.website, e)}
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        
        {upcomingBills && upcomingBills.length > 0 && (
          <>
            <Typography 
              variant="subtitle2" 
              color="primary" 
              gutterBottom 
              sx={{ mt: overdueBills?.length > 0 ? 2 : 0 }}
            >
              Upcoming Bills
            </Typography>
            <List dense disablePadding>
              {upcomingBills.slice(0, 5).map(bill => (
                <ListItem
                  key={bill._id}
                  divider
                  disablePadding
                  sx={{ py: 1 }}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handlePaymentClick(bill)}
                      startIcon={<PaymentIcon />}
                    >
                      Pay
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ fontWeight: 'medium', mr: 1 }}
                        >
                          {bill.name}
                        </Typography>
                        {getBillStatusChip(bill.dueDate)}
                      </Box>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {formatCurrency(bill.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due {formatDate(bill.dueDate)}
                        </Typography>
                        {bill.website && (
                          <Tooltip title="Go to payment website">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleOpenWebsite(bill.website, e)}
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button
          component={RouterLink}
          to="/bills/add"
          startIcon={<AddIcon />}
          size="small"
          color="primary"
        >
          Add Bill
        </Button>
        <Button
          component={RouterLink}
          to="/bills"
          endIcon={<ArrowForwardIcon />}
          size="small"
          variant="outlined"
        >
          View All Bills
        </Button>
      </CardActions>
      
      {/* Payment Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)}>
        <DialogTitle>
          Pay Bill: {selectedBill?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Due Date: {selectedBill ? formatDate(selectedBill.dueDate) : ''}
            </Typography>
            
            <TextField
              label="Payment Amount"
              name="paymentAmount"
              value={paymentData.paymentAmount}
              onChange={handlePaymentDataChange}
              fullWidth
              margin="normal"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              label="Payment Method"
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handlePaymentDataChange}
              fullWidth
              margin="normal"
              placeholder="e.g., Credit Card, Bank Transfer"
            />
            
            <TextField
              label="Notes (Optional)"
              name="notes"
              value={paymentData.notes}
              onChange={handlePaymentDataChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={paymentData.createTransaction}
                  onChange={handlePaymentDataChange}
                  name="createTransaction"
                  color="primary"
                />
              }
              label="Create expense transaction"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPayDialogOpen(false)}
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayBill}
            color="primary"
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CreditCardIcon />}
            disabled={!paymentData.paymentAmount || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Mark as Paid'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BillReminders;