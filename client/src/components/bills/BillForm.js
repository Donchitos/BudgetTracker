import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const BillForm = ({ open, onClose, onSubmit, initialValues = null, title = 'Add Bill' }) => {
  const { categories } = useSelector(state => state.categories);
  
  // Initialize form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: new Date(),
    frequency: 'monthly',
    category: '',
    reminderDays: 3,
    notes: ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Initialize form when editing an existing bill
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        amount: initialValues.amount?.toString() || '',
        dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : new Date(),
        frequency: initialValues.frequency || 'monthly',
        category: initialValues.category?._id || initialValues.category || '',
        reminderDays: initialValues.reminderDays || 3,
        notes: initialValues.notes || ''
      });
    } else {
      // Reset form for new bill
      setFormData({
        name: '',
        amount: '',
        dueDate: new Date(),
        frequency: 'monthly',
        category: '',
        reminderDays: 3,
        notes: ''
      });
    }
    
    // Reset errors
    setErrors({});
  }, [initialValues, open]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
    
    if (errors.dueDate) {
      setErrors(prev => ({ ...prev, dueDate: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required';
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }
    
    if (!formData.reminderDays && formData.reminderDays !== 0) {
      newErrors.reminderDays = 'Reminder days is required';
    } else if (formData.reminderDays < 0 || formData.reminderDays > 30) {
      newErrors.reminderDays = 'Reminder days must be between 0 and 30';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format data for submission
    const billData = {
      ...formData,
      amount: parseFloat(formData.amount),
      reminderDays: parseInt(formData.reminderDays, 10)
    };
    
    onSubmit(billData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Bill Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="amount"
                label="Amount"
                name="amount"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date *"
                  value={formData.dueDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!errors.dueDate}
                      helperText={errors.dueDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  label="Frequency"
                  onChange={handleChange}
                  error={!!errors.frequency}
                >
                  <MenuItem value="one-time">One-time</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
                {errors.frequency && (
                  <FormHelperText error>{errors.frequency}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category (Optional)</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  label="Category (Optional)"
                  onChange={handleChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {categories && categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="reminderDays"
                label="Reminder Days"
                name="reminderDays"
                type="number"
                value={formData.reminderDays}
                onChange={handleChange}
                error={!!errors.reminderDays}
                helperText={errors.reminderDays || "Days before due date to show reminder"}
                InputProps={{ inputProps: { min: 0, max: 30 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="normal"
                fullWidth
                id="notes"
                label="Notes (Optional)"
                name="notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialValues ? 'Update' : 'Add'} Bill
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillForm;