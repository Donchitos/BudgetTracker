import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel,
  Autocomplete,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { addTransaction, updateTransaction } from '../../redux/actions/transactionActions';
import { format } from 'date-fns';

/**
 * AdvancedTransactionForm component
 * 
 * Form for creating and editing transactions with support for custom fields
 */
const AdvancedTransactionForm = ({ open, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.category);
  
  // Form state
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    date: new Date(),
    category: '',
    type: 'expense',
    notes: '',
    tags: [],
    customFields: {}
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Used tags (for autocomplete)
  const [usedTags, setUsedTags] = useState([]);
  
  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setTransaction({
        ...initialData,
        date: new Date(initialData.date),
        // Initialize custom fields
        customFields: initialData.customFields || {},
        // Initialize tags if not present
        tags: initialData.tags || []
      });
    } else {
      // Reset form for new transaction
      setTransaction({
        description: '',
        amount: '',
        date: new Date(),
        category: '',
        type: 'expense',
        notes: '',
        tags: [],
        customFields: {}
      });
    }
    
    // Clear errors
    setErrors({});
    
  }, [initialData, open]);
  
  // Fetch frequently used tags
  useEffect(() => {
    // In a real app, we would fetch this from an API
    // For now, just use some sample tags
    setUsedTags(['groceries', 'utilities', 'transportation', 'entertainment', 'dining out', 'subscription']);
  }, []);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setTransaction({
      ...transaction,
      [name]: value
    });
    
    // Clear validation error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (newDate) => {
    setTransaction({
      ...transaction,
      date: newDate
    });
    
    // Clear date error if exists
    if (errors.date) {
      setErrors({
        ...errors,
        date: null
      });
    }
  };
  
  // Handle type toggle
  const handleTypeToggle = (e) => {
    setTransaction({
      ...transaction,
      type: e.target.checked ? 'income' : 'expense'
    });
  };
  
  // Handle custom field change
  const handleCustomFieldChange = (fieldId, value) => {
    setTransaction({
      ...transaction,
      customFields: {
        ...transaction.customFields,
        [fieldId]: value
      }
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!transaction.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!transaction.amount || isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!transaction.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!transaction.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const formattedTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
        date: format(transaction.date, 'yyyy-MM-dd')
      };
      
      if (initialData && initialData._id) {
        dispatch(updateTransaction(initialData._id, formattedTransaction))
          .then(() => {
            onClose();
          });
      } else {
        dispatch(addTransaction(formattedTransaction))
          .then(() => {
            onClose();
          });
      }
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Type Toggle */}
          <Grid item xs={12}>
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
            <Chip 
              label={transaction.type === 'income' ? 'Money In' : 'Money Out'} 
              color={transaction.type === 'income' ? 'success' : 'error'}
              size="small"
              sx={{ ml: 1 }}
            />
          </Grid>
          
          {/* Basic Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={transaction.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={transaction.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Transaction Date"
                value={transaction.date}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.category} required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={transaction.category}
                onChange={handleChange}
                label="Category"
              >
                {categories?.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={transaction.notes}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          
          {/* Tags Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            
            <Autocomplete
              multiple
              freeSolo
              options={usedTags}
              value={transaction.tags}
              onChange={(e, newValue) => setTransaction({ ...transaction, tags: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Add Tags"
                  placeholder="Enter tags"
                  size="small"
                  helperText="Press Enter to add each tag"
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {initialData ? 'Update' : 'Create'} Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedTransactionForm;