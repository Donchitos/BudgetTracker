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
  Typography,
  FormHelperText,
  Box,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { addMonths, addYears, format, differenceInDays, isAfter } from 'date-fns';

const SavingsGoalForm = ({ open, onClose, onSubmit, goal = null }) => {
  const { categories } = useSelector(state => state.categories);
  
  // State for form fields
  const [formValues, setFormValues] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: new Date(),
    targetDate: addMonths(new Date(), 6),
    category: '',
    priority: 'medium',
    description: ''
  });
  
  // State for form errors
  const [formErrors, setFormErrors] = useState({});
  
  // Update form when goal changes
  useEffect(() => {
    if (goal) {
      setFormValues({
        name: goal.name || '',
        targetAmount: goal.targetAmount?.toString() || '',
        currentAmount: goal.currentAmount?.toString() || '',
        startDate: goal.startDate ? new Date(goal.startDate) : new Date(),
        targetDate: goal.targetDate ? new Date(goal.targetDate) : addMonths(new Date(), 6),
        category: goal.category?._id || goal.category || '',
        priority: goal.priority || 'medium',
        description: goal.description || ''
      });
    } else {
      // Reset form for new goal
      setFormValues({
        name: '',
        targetAmount: '',
        currentAmount: '',
        startDate: new Date(),
        targetDate: addMonths(new Date(), 6),
        category: '',
        priority: 'medium',
        description: ''
      });
    }
    
    // Clear errors when dialog opens/closes
    setFormErrors({});
  }, [goal, open]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date, field) => {
    setFormValues(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear error when field is changed
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  // Calculate savings rate data
  const calculateSavingsData = () => {
    const targetAmount = parseFloat(formValues.targetAmount) || 0;
    const currentAmount = parseFloat(formValues.currentAmount) || 0;
    
    if (!targetAmount || !formValues.targetDate) {
      return {
        remainingAmount: 0,
        daysRemaining: 0,
        dailyAmount: 0,
        weeklyAmount: 0,
        monthlyAmount: 0
      };
    }
    
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const daysRemaining = Math.max(0, differenceInDays(formValues.targetDate, new Date()));
    
    // Calculate amounts needed
    const dailyAmount = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;
    const weeklyAmount = daysRemaining > 0 ? (remainingAmount / daysRemaining) * 7 : 0;
    const monthlyAmount = daysRemaining > 0 ? (remainingAmount / daysRemaining) * 30 : 0;
    
    return {
      remainingAmount,
      daysRemaining,
      dailyAmount,
      weeklyAmount,
      monthlyAmount
    };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formValues.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formValues.targetAmount || parseFloat(formValues.targetAmount) <= 0) {
      errors.targetAmount = 'Please enter a valid target amount';
    }
    
    if (formValues.currentAmount && parseFloat(formValues.currentAmount) < 0) {
      errors.currentAmount = 'Current amount cannot be negative';
    }
    
    if (!formValues.targetDate) {
      errors.targetDate = 'Target date is required';
    } else if (isAfter(new Date(), formValues.targetDate)) {
      errors.targetDate = 'Target date must be in the future';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const formData = {
      ...formValues,
      targetAmount: parseFloat(formValues.targetAmount),
      currentAmount: formValues.currentAmount ? parseFloat(formValues.currentAmount) : 0
    };
    
    onSubmit(formData);
  };
  
  // Get savings data for display
  const savingsData = calculateSavingsData();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {goal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Goal Name"
              value={formValues.name}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.name}
              helperText={formErrors.name}
              autoFocus
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="targetAmount"
              label="Target Amount"
              value={formValues.targetAmount}
              onChange={handleChange}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!formErrors.targetAmount}
              helperText={formErrors.targetAmount}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="currentAmount"
              label="Current Amount (Optional)"
              value={formValues.currentAmount}
              onChange={handleChange}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!formErrors.currentAmount}
              helperText={formErrors.currentAmount || 'Leave blank to start from $0'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formValues.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Target Date"
                value={formValues.targetDate}
                onChange={(date) => handleDateChange(date, 'targetDate')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth
                    error={!!formErrors.targetDate}
                    helperText={formErrors.targetDate}
                  />
                )}
                minDate={new Date()}
              />
            </LocalizationProvider>
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
              <FormHelperText>Optional: associate with a spending category</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formValues.priority}
                onChange={handleChange}
                label="Priority"
              >
                <MenuItem value="low">Low Priority</MenuItem>
                <MenuItem value="medium">Medium Priority</MenuItem>
                <MenuItem value="high">High Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description (Optional)"
              value={formValues.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          
          {/* Savings calculations */}
          {formValues.targetAmount && formValues.targetDate && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Savings Plan
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Remaining Amount:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(savingsData.remainingAmount)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Days Until Target:
                    </Typography>
                    <Typography variant="body1">
                      {savingsData.daysRemaining} days
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Daily Savings Needed:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(savingsData.dailyAmount)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Weekly Savings Needed:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(savingsData.weeklyAmount)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Savings Needed:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(savingsData.monthlyAmount)}
                    </Typography>
                  </Grid>
                </Grid>
                
                {savingsData.daysRemaining === 0 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    The target date has already passed or is today. Please choose a future date.
                  </Alert>
                )}
                
                {savingsData.daysRemaining > 0 && savingsData.dailyAmount > 100 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Your daily savings requirement is quite high. Consider extending your target date or adjusting your goal amount.
                  </Alert>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {goal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsGoalForm;