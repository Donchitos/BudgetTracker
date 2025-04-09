import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Grid,
  InputAdornment,
  FormControlLabel,
  Switch,
  Slider,
  Typography,
  Box,
  Link,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { addDays, format } from 'date-fns';
import LaunchIcon from '@mui/icons-material/Launch';

const BillForm = ({ open, onClose, onSubmit, bill = null }) => {
  const categoryState = useSelector(state => state.category);
  const { categories = [] } = categoryState || {};
  
  // State for form fields
  const [formValues, setFormValues] = useState({
    name: '',
    amount: '',
    dueDate: new Date(),
    category: '',
    frequency: 'monthly',
    paymentMethod: '',
    autoPay: false,
    website: '',
    notes: '',
    reminderDays: 3
  });
  
  // State for validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Update form when bill prop changes
  useEffect(() => {
    if (bill) {
      setFormValues({
        name: bill.name || '',
        amount: bill.amount?.toString() || '',
        dueDate: bill.dueDate ? new Date(bill.dueDate) : new Date(),
        category: bill.category?._id || bill.category || '',
        frequency: bill.frequency || 'monthly',
        paymentMethod: bill.paymentMethod || '',
        autoPay: bill.autoPay || false,
        website: bill.website || '',
        notes: bill.notes || '',
        reminderDays: bill.reminderDays || 3
      });
    } else {
      // Reset form for new bill
      setFormValues({
        name: '',
        amount: '',
        dueDate: new Date(),
        category: '',
        frequency: 'monthly',
        paymentMethod: '',
        autoPay: false,
        website: '',
        notes: '',
        reminderDays: 3
      });
    }
    
    // Clear errors when dialog opens/closes
    setFormErrors({});
  }, [bill, open]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormValues(prev => ({
      ...prev,
      dueDate: date
    }));
    
    // Clear error when field is changed
    if (formErrors.dueDate) {
      setFormErrors(prev => ({ ...prev, dueDate: null }));
    }
  };
  
  // Handle reminder days slider change
  const handleReminderDaysChange = (event, newValue) => {
    setFormValues(prev => ({
      ...prev,
      reminderDays: newValue
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formValues.name.trim()) {
      errors.name = 'Bill name is required';
    }
    
    if (!formValues.amount || parseFloat(formValues.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!formValues.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    
    // Validate website URL if provided
    if (formValues.website && !isValidUrl(formValues.website)) {
      errors.website = 'Please enter a valid URL (e.g., https://example.com)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Check if URL is valid
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'MM/dd/yyyy');
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const formData = {
      ...formValues,
      amount: parseFloat(formValues.amount)
    };
    
    onSubmit(formData);
  };
  
  // Calculate reminder date preview
  const getReminderDatePreview = () => {
    if (!formValues.dueDate) return '';
    
    const reminderDate = addDays(
      new Date(formValues.dueDate),
      -formValues.reminderDays
    );
    
    return format(reminderDate, 'MM/dd/yyyy');
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {bill ? 'Edit Bill' : 'Add New Bill'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Bill Name"
              value={formValues.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
              autoFocus
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="amount"
              label="Amount"
              value={formValues.amount}
              onChange={handleChange}
              fullWidth
              required
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formValues.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth
                    required
                    error={!!formErrors.dueDate}
                    helperText={formErrors.dueDate}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formValues.frequency}
                onChange={handleChange}
                label="Frequency"
              >
                <MenuItem value="one-time">One Time</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annually">Annually</MenuItem>
              </Select>
              <FormHelperText>
                How often this bill recurs
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category (Optional)</InputLabel>
              <Select
                name="category"
                value={formValues.category}
                onChange={handleChange}
                label="Category (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem 
                    key={category._id} 
                    value={category._id}
                    sx={{ 
                      '&::before': {
                        content: '""',
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: category.color || '#ccc',
                        marginRight: '8px'
                      }
                    }}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="paymentMethod"
              label="Payment Method (Optional)"
              value={formValues.paymentMethod}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Credit Card, Bank Transfer"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="website"
              label="Payment Website (Optional)"
              value={formValues.website}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., https://mybill.com"
              error={!!formErrors.website}
              helperText={formErrors.website}
              InputProps={{
                endAdornment: formValues.website ? (
                  <InputAdornment position="end">
                    <Link 
                      href={formValues.website} 
                      target="_blank" 
                      rel="noopener"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LaunchIcon fontSize="small" />
                    </Link>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.autoPay}
                  onChange={handleChange}
                  name="autoPay"
                  color="primary"
                />
              }
              label="Auto-Pay Enabled"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              Reminder Days Before Due Date: {formValues.reminderDays} {formValues.reminderDays === 1 ? 'day' : 'days'}
            </Typography>
            <Slider
              value={formValues.reminderDays}
              onChange={handleReminderDaysChange}
              step={1}
              marks
              min={0}
              max={14}
              valueLabelDisplay="auto"
            />
            <Typography variant="body2" color="text.secondary">
              {formValues.reminderDays > 0 ? (
                `You'll be reminded on ${getReminderDatePreview()}`
              ) : (
                "You won't receive a reminder"
              )}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes (Optional)"
              value={formValues.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional information about this bill"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {bill ? 'Update Bill' : 'Add Bill'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillForm;