import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Paper,
  Typography,
  InputAdornment,
  FormHelperText,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { createRecurringTransaction, updateRecurringTransaction } from '../../redux/actions/recurringTransactionActions';

/**
 * RecurringTransactionForm component
 * 
 * Form for creating and editing recurring transactions
 */
const RecurringTransactionForm = ({ initialData, onClose }) => {
  const dispatch = useDispatch();
  const categoryState = useSelector(state => state.category);
  const { categories = [] } = categoryState || {};
  
  // Form state
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    startDate: new Date(),
    endDate: null,
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: new Date().getDate(),
    dayOfWeek: new Date().getDay(),
    active: true,
    notes: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setTransaction({
        ...initialData,
        startDate: new Date(initialData.startDate),
        endDate: initialData.endDate ? new Date(initialData.endDate) : null
      });
    }
  }, [initialData]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction({
      ...transaction,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
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
  
  // Handle date change
  const handleDateChange = (date, field) => {
    setTransaction({
      ...transaction,
      [field]: date
    });
    
    // Clear error
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };
  
  // Handle active status toggle
  const handleActiveToggle = (e) => {
    setTransaction({
      ...transaction,
      active: e.target.checked
    });
  };
  
  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (!transaction.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!transaction.amount || isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!transaction.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!transaction.frequency) {
      newErrors.frequency = 'Frequency is required';
    }
    
    if (transaction.interval <= 0 || isNaN(parseInt(transaction.interval))) {
      newErrors.interval = 'Please enter a valid interval';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Calculate next occurrences based on current settings
  const calculateNextOccurrences = (count = 3) => {
    if (!transaction.startDate || !transaction.frequency) return [];
    
    let nextDates = [];
    let currentDate = new Date(transaction.startDate);
    
    for (let i = 0; i < count; i++) {
      // Skip the first date if we're showing future occurrences
      if (i > 0 || new Date() > currentDate) {
        switch(transaction.frequency) {
          case 'daily':
            currentDate = addDays(currentDate, transaction.interval);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, transaction.interval);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, transaction.interval);
            break;
          case 'yearly':
            currentDate = addYears(currentDate, transaction.interval);
            break;
          default:
            currentDate = addMonths(currentDate, transaction.interval);
        }
        
        // Check if beyond end date
        if (transaction.endDate && currentDate > transaction.endDate) break;
        
        nextDates.push(currentDate);
      }
    }
    
    return nextDates;
  };
  
  // Get human-readable frequency text
  const getFrequencyText = () => {
    const interval = transaction.interval;
    
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
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const formattedTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
        startDate: format(transaction.startDate, 'yyyy-MM-dd'),
        endDate: transaction.endDate ? format(transaction.endDate, 'yyyy-MM-dd') : null,
        interval: parseInt(transaction.interval)
      };
      
      if (initialData && initialData._id) {
        dispatch(updateRecurringTransaction(initialData._id, formattedTransaction));
      } else {
        dispatch(createRecurringTransaction(formattedTransaction));
      }
      
      onClose && onClose();
    }
  };
  
  // Calculate next occurrences for preview
  const nextOccurrences = calculateNextOccurrences();
  
  return (
    <Paper elevation={0} component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {initialData ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
          </Typography>
          <Divider />
        </Grid>
        
        {/* Transaction Type Toggle */}
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
          
          <FormControlLabel
            control={
              <Switch
                checked={transaction.active}
                onChange={handleActiveToggle}
                color="primary"
              />
            }
            label="Active"
            sx={{ ml: 3 }}
          />
        </Grid>
        
        {/* Basic Information */}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              ),
            }}
            error={!!errors.amount}
            helperText={errors.amount}
            required
          />
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
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={transaction.notes}
            onChange={handleChange}
            multiline
            rows={1}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider>
            <Chip label="Recurrence Settings" color="primary" icon={<RepeatIcon />} />
          </Divider>
        </Grid>
        
        {/* Recurrence Settings */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={transaction.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date (Optional)"
              value={transaction.endDate}
              onChange={(date) => handleDateChange(date, 'endDate')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  error={!!errors.endDate}
                  helperText={errors.endDate || 'Leave blank for indefinite recurring transactions'}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.frequency} required>
            <InputLabel>Frequency</InputLabel>
            <Select
              name="frequency"
              value={transaction.frequency}
              onChange={handleChange}
              label="Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
            {errors.frequency && <FormHelperText>{errors.frequency}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Interval"
            name="interval"
            type="number"
            value={transaction.interval}
            onChange={handleChange}
            error={!!errors.interval}
            helperText={errors.interval || 'How often the transaction repeats'}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="For example, an interval of 2 with monthly frequency means every 2 months">
                    <IconButton edge="end" size="small">
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {/* Preview Next Occurrences */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview: {getFrequencyText()}
            </Typography>
            
            <Stack spacing={1} sx={{ mt: 2 }}>
              {nextOccurrences.length > 0 ? (
                nextOccurrences.map((date, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {format(date, 'EEEE, MMM d, yyyy')}
                      {index === 0 && ' (next occurrence)'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No future occurrences
                </Typography>
              )}
              
              {transaction.endDate ? (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  This recurring transaction will end on {format(transaction.endDate, 'MMMM d, yyyy')}.
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  This recurring transaction has no end date (will continue indefinitely).
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        
        {/* Form Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            {initialData ? 'Update' : 'Create'} Recurring Transaction
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RecurringTransactionForm;