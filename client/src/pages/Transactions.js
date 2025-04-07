import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import TransactionList from '../components/transactions/TransactionList';
import { getCategories } from '../redux/actions/categoryActions';
import { addTransaction } from '../redux/actions/transactionActions';

const Transactions = () => {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(state => state.categories);
  
  // Local state for the new transaction dialog
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    category: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  
  // Load categories when component mounts
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);
  
  // Handle dialog open and close
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    // Reset form data and errors
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: '',
      notes: ''
    });
    setErrors({});
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (formData.type === 'expense' && !formData.category) {
      newErrors.category = 'Category is required for expenses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format amount as a number
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      await dispatch(addTransaction(transactionData));
      handleClose();
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transactions
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Transaction
        </Button>
      </Box>
      
      <TransactionList />
      
      {/* Add Transaction Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleChange}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            
            {formData.type === 'expense' && (
              <FormControl 
                fullWidth 
                margin="normal" 
                required
                error={!!errors.category}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                  disabled={categoriesLoading}
                >
                  {categories && categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="date"
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.date}
              helperText={errors.date}
            />
            
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add Transaction</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;