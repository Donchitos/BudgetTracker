import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
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
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LaunchIcon from '@mui/icons-material/Launch';
import EventIcon from '@mui/icons-material/Event';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { 
  getBills, 
  createBill, 
  updateBill, 
  deleteBill, 
  markBillAsPaid,
  skipBillPayment,
  getBillStats
} from '../redux/actions/billActions';
import { format, isPast, isToday, addDays, parseISO, differenceInDays } from 'date-fns';
import BillForm from '../components/bills/BillForm';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bill-tabpanel-${index}`}
      aria-labelledby={`bill-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Bills = () => {
  const dispatch = useDispatch();
  const billState = useSelector(state => state.bill);
  const { bills = [], loading = false, error = null, stats = null } = billState || {};
  
  // State for bill form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // State for payment dialog
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',
    createTransaction: true,
    paymentMethod: '',
    notes: ''
  });
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State for tab value
  const [tabValue, setTabValue] = useState(0);
  
  // State for bill action menu
  const [actionMenu, setActionMenu] = useState(null);
  const [actionBill, setActionBill] = useState(null);
  
  // Load bills when component mounts
  useEffect(() => {
    dispatch(getBills());
    dispatch(getBillStats());
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
  const getBillStatusChip = (bill) => {
    const { status, dueDate } = bill;
    
    if (status === 'paid') {
      return (
        <Chip 
          size="small" 
          color="success" 
          icon={<CheckCircleIcon />} 
          label="Paid" 
        />
      );
    } else if (status === 'skipped') {
      return (
        <Chip 
          size="small" 
          color="default" 
          icon={<SkipNextIcon />} 
          label="Skipped" 
        />
      );
    }
    
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
    } else {
      return (
        <Chip 
          size="small" 
          color="primary" 
          icon={<EventIcon />} 
          label={`Due in ${differenceInDays(due, today)} days`} 
        />
      );
    }
  };
  
  // Get frequency display text
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'one-time':
        return 'One Time';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'annually':
        return 'Annually';
      default:
        return frequency;
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle opening the bill form dialog
  const handleOpenForm = (bill = null) => {
    setSelectedBill(bill);
    setFormOpen(true);
    setActionMenu(null);
  };
  
  // Handle bill creation/update
  const handleSaveBill = async (billData) => {
    try {
      if (selectedBill) {
        await dispatch(updateBill(selectedBill._id, billData));
      } else {
        await dispatch(createBill(billData));
      }
      setFormOpen(false);
      setSelectedBill(null);
      dispatch(getBillStats());
    } catch (err) {
      console.error('Error saving bill:', err);
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
    setActionMenu(null);
  };
  
  // Handle payment form input changes
  const handlePaymentDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle bill payment submission
  const handlePayBill = async () => {
    if (!selectedBill) return;
    
    try {
      await dispatch(markBillAsPaid(selectedBill._id, paymentData));
      setPayDialogOpen(false);
      setSelectedBill(null);
      dispatch(getBillStats());
    } catch (err) {
      console.error('Error paying bill:', err);
    }
  };
  
  // Handle skip bill payment
  const handleSkipBill = async (bill) => {
    try {
      await dispatch(skipBillPayment(bill._id));
      setActionMenu(null);
      dispatch(getBillStats());
    } catch (err) {
      console.error('Error skipping bill payment:', err);
    }
  };
  
  // Handle delete click
  const handleDeleteClick = (bill) => {
    setSelectedBill(bill);
    setDeleteDialogOpen(true);
    setActionMenu(null);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedBill) return;
    
    try {
      await dispatch(deleteBill(selectedBill._id));
      setDeleteDialogOpen(false);
      setSelectedBill(null);
      dispatch(getBillStats());
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event, bill) => {
    setActionMenu(event.currentTarget);
    setActionBill(bill);
  };
  
  // Open website link
  const handleOpenWebsite = (website, e) => {
    e.stopPropagation();
    window.open(website, '_blank', 'noopener,noreferrer');
  };
  
  // Filter bills by status
  const pendingBills = bills.filter(bill => bill.status === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  const paidBills = bills.filter(bill => bill.status === 'paid')
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  
  const overdueBills = pendingBills.filter(bill => 
    isPast(new Date(bill.dueDate)) && !isToday(new Date(bill.dueDate))
  );
  
  const upcomingBills = pendingBills.filter(bill => 
    !isPast(new Date(bill.dueDate)) || isToday(new Date(bill.dueDate))
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bill Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add New Bill
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending Bills
                </Typography>
                <Typography variant="h4" color="primary">
                  {stats.counts.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {formatCurrency(stats.amounts.pendingTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overdue Bills
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.counts.overdue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Due This Month
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {formatCurrency(stats.amounts.upcomingMonthTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Paid Bills
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.counts.paid}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Bills Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Upcoming (${upcomingBills.length})`} />
          <Tab label={`Overdue (${overdueBills.length})`} />
          <Tab label={`Paid (${paidBills.length})`} />
          <Tab label={`All Bills (${bills.length})`} />
        </Tabs>
        
        {/* Loading Indicator */}
        {loading && <LinearProgress />}
        
        {/* Upcoming Bills Tab */}
        <TabPanel value={tabValue} index={0}>
          {upcomingBills.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No upcoming bills
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                sx={{ mt: 2 }}
              >
                Add New Bill
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {upcomingBills.map(bill => (
                <Grid item xs={12} sm={6} md={4} key={bill._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {bill.name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, bill)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {getBillStatusChip(bill)}
                        <Chip 
                          size="small" 
                          label={getFrequencyText(bill.frequency)}
                        />
                        {bill.autoPay && (
                          <Chip 
                            size="small" 
                            color="success" 
                            label="Auto-Pay" 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="h5" color="primary" gutterBottom>
                        {formatCurrency(bill.amount)}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due Date:
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(bill.dueDate)}
                          </Typography>
                        </Grid>
                        
                        {bill.category && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Category:
                            </Typography>
                            <Typography variant="body2">
                              {bill.category.name || 'Uncategorized'}
                            </Typography>
                          </Grid>
                        )}
                        
                        {bill.paymentMethod && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Payment Method:
                            </Typography>
                            <Typography variant="body2">
                              {bill.paymentMethod}
                            </Typography>
                          </Grid>
                        )}
                        
                        {bill.website && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Button
                                size="small"
                                startIcon={<LaunchIcon />}
                                onClick={(e) => handleOpenWebsite(bill.website, e)}
                              >
                                Visit Payment Site
                              </Button>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => handlePaymentClick(bill)}
                        fullWidth
                      >
                        Pay Bill
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* Overdue Bills Tab */}
        <TabPanel value={tabValue} index={1}>
          {overdueBills.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No overdue bills
              </Typography>
              <Typography variant="body1" color="textSecondary">
                All your bills are up to date!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {overdueBills.map(bill => (
                <Grid item xs={12} sm={6} md={4} key={bill._id}>
                  <Card sx={{ border: '1px solid #f44336' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {bill.name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, bill)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {getBillStatusChip(bill)}
                        <Chip 
                          size="small" 
                          label={getFrequencyText(bill.frequency)}
                        />
                      </Box>
                      
                      <Typography variant="h5" color="error" gutterBottom>
                        {formatCurrency(bill.amount)}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due Date:
                          </Typography>
                          <Typography variant="body2" color="error">
                            {formatDate(bill.dueDate)}
                          </Typography>
                        </Grid>
                        
                        {bill.category && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Category:
                            </Typography>
                            <Typography variant="body2">
                              {bill.category.name || 'Uncategorized'}
                            </Typography>
                          </Grid>
                        )}
                        
                        {bill.website && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Button
                                size="small"
                                startIcon={<LaunchIcon />}
                                onClick={(e) => handleOpenWebsite(bill.website, e)}
                              >
                                Visit Payment Site
                              </Button>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<PaymentIcon />}
                        onClick={() => handlePaymentClick(bill)}
                        fullWidth
                      >
                        Pay Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* Paid Bills Tab */}
        <TabPanel value={tabValue} index={2}>
          {paidBills.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No paid bills
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Bills that you've paid will appear here.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {paidBills.map(bill => (
                <Grid item xs={12} sm={6} md={4} key={bill._id}>
                  <Card sx={{ opacity: 0.8 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {bill.name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, bill)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {getBillStatusChip(bill)}
                        <Chip 
                          size="small" 
                          label={getFrequencyText(bill.frequency)}
                        />
                      </Box>
                      
                      <Typography variant="h5" color="success.main" gutterBottom>
                        {formatCurrency(bill.amount)}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due Date:
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(bill.dueDate)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Date:
                          </Typography>
                          <Typography variant="body2">
                            {bill.payments && bill.payments.length > 0
                              ? formatDate(bill.payments[bill.payments.length - 1].date)
                              : 'Unknown'
                            }
                          </Typography>
                        </Grid>
                        
                        {bill.category && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Category:
                            </Typography>
                            <Typography variant="body2">
                              {bill.category.name || 'Uncategorized'}
                            </Typography>
                          </Grid>
                        )}
                        
                        {bill.frequency !== 'one-time' && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Next due date: {formatDate(bill.nextDueDate)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* All Bills Tab */}
        <TabPanel value={tabValue} index={3}>
          {bills.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No bills added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                sx={{ mt: 2 }}
              >
                Add New Bill
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {bills.map(bill => (
                <Grid item xs={12} sm={6} md={4} key={bill._id}>
                  <Card sx={{ 
                    opacity: bill.status === 'paid' ? 0.8 : 1,
                    border: bill.status === 'pending' && isPast(new Date(bill.dueDate)) && !isToday(new Date(bill.dueDate)) 
                      ? '1px solid #f44336' 
                      : 'none'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {bill.name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, bill)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {getBillStatusChip(bill)}
                        <Chip 
                          size="small" 
                          label={getFrequencyText(bill.frequency)}
                        />
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        color={
                          bill.status === 'paid' 
                            ? 'success.main' 
                            : bill.status === 'pending' && isPast(new Date(bill.dueDate)) 
                              ? 'error' 
                              : 'primary'
                        } 
                        gutterBottom
                      >
                        {formatCurrency(bill.amount)}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due Date:
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(bill.dueDate)}
                          </Typography>
                        </Grid>
                        
                        {bill.category && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Category:
                            </Typography>
                            <Typography variant="body2">
                              {bill.category.name || 'Uncategorized'}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                    {bill.status === 'pending' && (
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PaymentIcon />}
                          onClick={() => handlePaymentClick(bill)}
                          fullWidth
                          color={isPast(new Date(bill.dueDate)) ? 'error' : 'primary'}
                        >
                          Pay Bill
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
      
      {/* Create/Edit Bill Form Dialog */}
      <BillForm 
        open={formOpen} 
        onClose={() => {
          setFormOpen(false);
          setSelectedBill(null);
        }}
        onSubmit={handleSaveBill}
        bill={selectedBill}
      />
      
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
          <Button onClick={() => setPayDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handlePayBill} 
            color="primary" 
            variant="contained"
            startIcon={<CreditCardIcon />}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          Delete Bill
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the bill "{selectedBill?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={() => setActionMenu(null)}
      >
        <MenuItem onClick={() => handleOpenForm(actionBill)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Bill
        </MenuItem>
        
        {actionBill && actionBill.status === 'pending' && (
          <MenuItem onClick={() => handlePaymentClick(actionBill)}>
            <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
            Pay Bill
          </MenuItem>
        )}
        
        {actionBill && actionBill.status === 'pending' && actionBill.frequency !== 'one-time' && (
          <MenuItem onClick={() => handleSkipBill(actionBill)}>
            <SkipNextIcon fontSize="small" sx={{ mr: 1 }} />
            Skip Payment
          </MenuItem>
        )}
        
        {actionBill && actionBill.website && (
          <MenuItem onClick={(e) => handleOpenWebsite(actionBill.website, e)}>
            <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
            Visit Website
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => handleDeleteClick(actionBill)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Bill
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Bills;