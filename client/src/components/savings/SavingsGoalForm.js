import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Box,
  Typography,
  Slider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { CirclePicker } from 'react-color';

const SavingsGoalForm = ({ open, onClose, onSubmit, initialValues = null, title = 'Add Savings Goal' }) => {
  const { categories } = useSelector(state => state.categories);
  
  // Initialize form state
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default 3 months from now
    category: '',
    description: '',
    priority: 'medium',
    color: '#1976d2',
    icon: 'SavingsIcon'
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Initialize form when editing an existing goal
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        targetAmount: initialValues.targetAmount?.toString() || '',
        currentAmount: initialValues.currentAmount?.toString() || '0',
        targetDate: initialValues.targetDate ? new Date(initialValues.targetDate) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
        category: initialValues.category?._id || initialValues.category || '',
        description: initialValues.description || '',
        priority: initialValues.priority || 'medium',
        color: initialValues.color || '#1976d2',
        icon: initialValues.icon || 'SavingsIcon'
      });
    } else {
      // Reset form for new goal
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        category: '',
        description: '',
        priority: 'medium',
        color: '#1976d2',
        icon: 'SavingsIcon'
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
    setFormData(prev => ({ ...prev, targetDate: date }));
    
    if (errors.targetDate) {
      setErrors(prev => ({ ...prev, targetDate: '' }));
    }
  };
  
  // Handle color change
  const handleColorChange = (color) => {
    setFormData(prev => ({ ...prev, color: color.hex }));
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    const target = parseFloat(formData.targetAmount) || 0;
    const current = parseFloat(formData.currentAmount) || 0;
    
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }
    
    if (!formData.targetAmount || isNaN(formData.targetAmount) || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Valid target amount is required';
    }
    
    if (!formData.currentAmount || isNaN(formData.currentAmount) || parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Valid current amount is required';
    }
    
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else if (formData.targetDate < new Date()) {
      newErrors.targetDate = 'Target date must be in the future';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
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
    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      isCompleted: parseFloat(formData.currentAmount) >= parseFloat(formData.targetAmount)
    };
    
    onSubmit(goalData);
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Goal Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  autoFocus
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    label="Priority"
                    onChange={handleChange}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="targetAmount"
                  label="Target Amount"
                  name="targetAmount"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={formData.targetAmount}
                  onChange={handleChange}
                  error={!!errors.targetAmount}
                  helperText={errors.targetAmount}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="currentAmount"
                  label="Current Amount"
                  name="currentAmount"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={formData.currentAmount}
                  onChange={handleChange}
                  error={!!errors.currentAmount}
                  helperText={errors.currentAmount || 'Leave at 0 for a new savings goal'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Target Date *"
                  value={formData.targetDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!errors.targetDate}
                      helperText={errors.targetDate}
                    />
                  )}
                  minDate={new Date()}
                />
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
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="description"
                  label="Description (Optional)"
                  name="description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Choose a color for your savings goal:
                </Typography>
                <CirclePicker
                  color={formData.color}
                  onChange={handleColorChange}
                  width="100%"
                  circleSize={24}
                  circleSpacing={10}
                />
              </Grid>
              
              {parseFloat(formData.targetAmount) > 0 && parseFloat(formData.currentAmount) >= 0 && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ px: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Progress:</Typography>
                      <Typography>{`${getProgressPercentage()}%`}</Typography>
                    </Box>
                    <Slider
                      value={getProgressPercentage()}
                      disabled
                      sx={{
                        '& .MuiSlider-track': {
                          backgroundColor: getProgressPercentage() >= 100 ? 'success.main' : 'primary.main',
                        },
                        '& .MuiSlider-thumb': {
                          backgroundColor: getProgressPercentage() >= 100 ? 'success.main' : 'primary.main',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">{formatCurrency(formData.currentAmount)}</Typography>
                      <Typography variant="body2">{formatCurrency(formData.targetAmount)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialValues ? 'Update' : 'Create'} Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsGoalForm;