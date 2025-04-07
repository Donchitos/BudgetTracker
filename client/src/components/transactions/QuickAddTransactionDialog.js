import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { addTransaction } from '../../redux/actions/transactionActions';

/**
 * Quick Add Transaction Dialog
 * Streamlined dialog for rapidly adding basic transactions
 */
const QuickAddTransactionDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(state => state.categories);
  const { loading: transactionLoading } = useSelector(state => state.transactions);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [error, setError] = useState({});
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is edited
    if (error[name]) {
      setError({
        ...error,
        [name]: null
      });
    }
  };
  
  // Handle transaction type change
  const handleTypeChange = (e, newType) => {
    if (newType !== null) {
      setFormData({
        ...formData,
        type: newType
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newError = {};
    
    if (!formData.description.trim()) {
      newError.description = 'Description is required';
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newError.amount = 'Valid amount is required';
    }
    
    if (formData.type === 'expense' && !formData.category) {
      newError.category = 'Category is required for expenses';
    }
    
    setError(newError);
    return Object.keys(newError).length === 0;
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    try {
      await dispatch(addTransaction(transactionData));
      handleClose();
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };
  
  // Handle close with reset
  const handleClose = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setError({});
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        Quick Add Transaction
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              color={formData.type === 'income' ? 'success' : 'error'}
            >
              <ToggleButton value="expense" aria-label="expense">
                <TrendingDownIcon sx={{ mr: 1 }} />
                <Typography>Expense</Typography>
              </ToggleButton>
              <ToggleButton value="income" aria-label="income">
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography>Income</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              error={!!error.description}
              helperText={error.description}
              autoFocus
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              error={!!error.amount}
              helperText={error.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {formData.type === 'expense' && (
            <Grid item xs={12}>
              <FormControl fullWidth error={!!error.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  disabled={categoriesLoading || !categories}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>Loading categories...</MenuItem>
                  ) : (
                    categories?.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {error.category && (
                  <Typography variant="caption" color="error">
                    {error.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          color={formData.type === 'income' ? 'success' : 'primary'}
          variant="contained"
          disabled={transactionLoading}
          startIcon={transactionLoading && <CircularProgress size={20} color="inherit" />}
        >
          {transactionLoading ? 'Saving...' : 'Save Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddTransactionDialog;