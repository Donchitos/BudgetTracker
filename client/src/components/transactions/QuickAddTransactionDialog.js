import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { format } from 'date-fns';
import { addTransaction } from '../../redux/actions/transactionActions';

/**
 * Quick Add Transaction Dialog
 * 
 * Allows users to quickly add transactions from anywhere in the app
 * with minimal required fields and a streamlined interface.
 */
const QuickAddTransactionDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  
  // Default transaction date to today
  const today = new Date();
  
  // Transaction form state
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: today,
    notes: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: today,
        notes: ''
      });
      setErrors({});
    }
  }, [open]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction({
      ...transaction,
      [name]: value
    });
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setTransaction({
      ...transaction,
      date
    });
  };
  
  // Toggle between expense and income
  const handleTypeToggle = (e) => {
    setTransaction({
      ...transaction,
      type: e.target.checked ? 'income' : 'expense'
    });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!transaction.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!transaction.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!transaction.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit transaction
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Format the transaction for API submission
        const formattedTransaction = {
          ...transaction,
          amount: parseFloat(transaction.amount),
          date: format(transaction.date, 'yyyy-MM-dd')
        };
        
        await dispatch(addTransaction(formattedTransaction));
        onClose();
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="quick-add-transaction-dialog"
    >
      <DialogTitle id="quick-add-transaction-dialog">
        Quick Add Transaction
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={transaction.type === 'income'}
                onChange={handleTypeToggle}
                color={transaction.type === 'income' ? 'success' : 'error'}
              />
            }
            label={transaction.type === 'income' ? 'Income' : 'Expense'}
          />
          <Typography
            variant="subtitle1"
            color={transaction.type === 'income' ? 'success.main' : 'error.main'}
          >
            {transaction.type === 'income' ? 'Money In' : 'Money Out'}
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              value={transaction.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="What was this for?"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              id="amount"
              name="amount"
              label="Amount"
              type="number"
              fullWidth
              value={transaction.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="0.00"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={transaction.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    margin="dense" 
                    fullWidth 
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" error={!!errors.category}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={transaction.category}
                onChange={handleChange}
                label="Category"
              >
                {categories?.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error">
                  {errors.category}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="notes"
              name="notes"
              label="Notes (Optional)"
              type="text"
              fullWidth
              multiline
              rows={2}
              value={transaction.notes}
              onChange={handleChange}
              placeholder="Add any additional details..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
        >
          Add Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddTransactionDialog;