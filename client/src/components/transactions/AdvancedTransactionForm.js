import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { createTransaction, updateTransaction } from '../../redux/actions/transactionActions';
import { getCategories } from '../../redux/actions/categoryActions';

const AdvancedTransactionForm = ({ transaction = null, onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { loading, error } = useSelector((state) => state.transactions);
  
  // Local state for form
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date(),
    category: '',
    subcategory: '',
    tags: [],
    notes: '',
    // For split transaction support
    isSplit: false,
    splits: [{ description: '', amount: '', category: '' }]
  });
  
  // State for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // State for tag input
  const [tagInput, setTagInput] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  
  // State for subcategory input
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  
  // Fill form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      const tags = transaction.tags || [];
      
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount?.toString() || '',
        type: transaction.type || 'expense',
        date: transaction.date ? new Date(transaction.date) : new Date(),
        category: transaction.category?._id || transaction.category || '',
        subcategory: transaction.subcategory || '',
        tags: tags,
        notes: transaction.notes || '',
        isSplit: false, // Split transactions are always created as new
        splits: [{ description: '', amount: '', category: '' }]
      });
    }
    
    // Load categories if needed
    dispatch(getCategories());
    
    // Fetch existing subcategories and tags from transactions for autocomplete suggestions
    fetchTagsAndSubcategories();
  }, [transaction, dispatch]);
  
  // Helper function to fetch existing tags and subcategories
  const fetchTagsAndSubcategories = async () => {
    try {
      // This would ideally be a dedicated API endpoint, but for now
      // we'll assume we have access to all user transactions
      const { transactions } = useSelector(state => state.transactions);
      
      if (transactions) {
        // Extract unique tags
        const allTags = transactions.reduce((tags, t) => {
          if (t.tags && t.tags.length > 0) {
            return [...tags, ...t.tags];
          }
          return tags;
        }, []);
        
        const uniqueTags = [...new Set(allTags)];
        setTagOptions(uniqueTags);
        
        // Extract unique subcategories
        const allSubcategories = transactions
          .filter(t => t.subcategory)
          .map(t => t.subcategory);
        
        const uniqueSubcategories = [...new Set(allSubcategories)];
        setSubcategoryOptions(uniqueSubcategories);
      }
    } catch (err) {
      console.error('Error fetching tags and subcategories:', err);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      date
    }));
  };
  
  // Handle tag input
  const handleTagInput = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, newValue])]
      }));
      setTagInput('');
    }
  };
  
  // Handle tag deletion
  const handleTagDelete = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  // Handle adding a tag when pressing enter
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])]
      }));
      setTagInput('');
    }
  };
  
  // Handle split transaction toggle
  const handleSplitToggle = (e) => {
    const checked = e.target.checked;
    
    if (checked) {
      // Calculate initial split amount as half of the total
      const splitAmount = formData.amount ? parseFloat(formData.amount) / 2 : 0;
      
      setFormData(prev => ({
        ...prev,
        isSplit: true,
        splits: [
          { 
            description: `${prev.description} - Part 1`, 
            amount: splitAmount.toFixed(2), 
            category: prev.category 
          },
          { 
            description: `${prev.description} - Part 2`,  
            amount: splitAmount.toFixed(2), 
            category: prev.category 
          }
        ]
      }));
    } else {
      // Reset splits when turning off
      setFormData(prev => ({
        ...prev,
        isSplit: false,
        splits: [{ description: '', amount: '', category: '' }]
      }));
    }
  };
  
  // Handle adding a new split
  const handleAddSplit = () => {
    // Calculate initial amount for the new split
    const totalAmount = parseFloat(formData.amount) || 0;
    const usedAmount = formData.splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
    const remainingAmount = Math.max(0, totalAmount - usedAmount);
    
    setFormData(prev => ({
      ...prev,
      splits: [
        ...prev.splits,
        { 
          description: `${prev.description} - Part ${prev.splits.length + 1}`, 
          amount: remainingAmount.toFixed(2), 
          category: prev.category 
        }
      ]
    }));
  };
  
  // Handle removing a split
  const handleRemoveSplit = (index) => {
    if (formData.splits.length <= 2) {
      // Must have at least 2 splits
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      splits: prev.splits.filter((_, i) => i !== index)
    }));
  };
  
  // Handle split field changes
  const handleSplitChange = (index, field, value) => {
    const updatedSplits = [...formData.splits];
    updatedSplits[index] = {
      ...updatedSplits[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      splits: updatedSplits
    }));
  };
  
  // Update the total amount based on splits
  useEffect(() => {
    if (formData.isSplit) {
      const totalSplits = formData.splits.reduce(
        (sum, split) => sum + (parseFloat(split.amount) || 0), 
        0
      );
      
      // Update the main amount field to match the sum of splits
      setFormData(prev => ({
        ...prev,
        amount: totalSplits.toFixed(2)
      }));
    }
  }, [formData.isSplit, formData.splits]);
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    
    if (formData.type === 'expense' && !formData.category) {
      errors.category = 'Category is required for expenses';
    }
    
    if (formData.isSplit) {
      // Check each split
      let hasSplitErrors = false;
      
      formData.splits.forEach((split, index) => {
        if (!split.description.trim()) {
          errors[`split-${index}-description`] = 'Description is required';
          hasSplitErrors = true;
        }
        
        if (!split.amount || isNaN(split.amount) || parseFloat(split.amount) <= 0) {
          errors[`split-${index}-amount`] = 'Valid amount is required';
          hasSplitErrors = true;
        }
        
        if (!split.category) {
          errors[`split-${index}-category`] = 'Category is required';
          hasSplitErrors = true;
        }
      });
      
      if (hasSplitErrors) {
        errors.splits = 'Please fix errors in split transactions';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (formData.isSplit) {
        // Handle split transactions by creating multiple separate transactions
        for (const split of formData.splits) {
          const splitTransaction = {
            description: split.description,
            amount: parseFloat(split.amount),
            type: formData.type,
            date: formData.date,
            category: split.category,
            subcategory: formData.subcategory,
            tags: formData.tags,
            notes: `${formData.notes} [Split Transaction]`
          };
          
          await dispatch(createTransaction(splitTransaction));
        }
      } else {
        // Normal transaction (create or update)
        const transactionData = {
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          date: formData.date,
          category: formData.type === 'expense' ? formData.category : null,
          subcategory: formData.subcategory,
          tags: formData.tags,
          notes: formData.notes
        };
        
        if (transaction) {
          await dispatch(updateTransaction(transaction._id, transactionData));
        } else {
          await dispatch(createTransaction(transactionData));
        }
      }
      
      // Close the form on success
      onClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">
            {transaction ? 'Edit Transaction' : 'Create Transaction'}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
            error={!!formErrors.description}
            helperText={formErrors.description}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            required
            type="number"
            step="0.01"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={!!formErrors.amount}
            helperText={formErrors.amount}
            disabled={formData.isSplit}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        
        {formData.type === 'expense' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                required
              >
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
              {formErrors.category && (
                <FormHelperText>{formErrors.category}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isSplit}
                onChange={handleSplitToggle}
                name="isSplit"
                color="primary"
              />
            }
            label="Split Transaction"
          />
        </Grid>
        
        {formData.isSplit ? (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title="Split Transaction"
                subheader="Divide this transaction into multiple parts"
                action={
                  <Button
                    startIcon={<AddCircleIcon />}
                    onClick={handleAddSplit}
                    disabled={formData.splits.length >= 5}
                  >
                    Add Split
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {formData.splits.map((split, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Split {index + 1}
                      {formData.splits.length > 2 && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveSplit(index)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          value={split.description}
                          onChange={(e) => handleSplitChange(index, 'description', e.target.value)}
                          fullWidth
                          required
                          error={!!formErrors[`split-${index}-description`]}
                          helperText={formErrors[`split-${index}-description`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Amount"
                          value={split.amount}
                          onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                          fullWidth
                          required
                          type="number"
                          step="0.01"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          error={!!formErrors[`split-${index}-amount`]}
                          helperText={formErrors[`split-${index}-amount`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!formErrors[`split-${index}-category`]}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={split.category}
                            onChange={(e) => handleSplitChange(index, 'category', e.target.value)}
                            label="Category"
                            required
                          >
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
                          {formErrors[`split-${index}-category`] && (
                            <FormHelperText>{formErrors[`split-${index}-category`]}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                {formErrors.splits && (
                  <Typography color="error" variant="body2">
                    {formErrors.splits}
                  </Typography>
                )}
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Total: ${parseFloat(formData.amount || 0).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          // Advanced categorization fields (only shown when not a split transaction)
          <>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={subcategoryOptions}
                value={formData.subcategory}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    subcategory: newValue || ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subcategory (Optional)"
                    name="subcategory"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={tagOptions}
                value={formData.tags}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    tags: newValue
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      label={option}
                      {...getTagProps({ index })}
                      onDelete={() => handleTagDelete(option)}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags (Optional)"
                    helperText="Press Enter to add a tag"
                  />
                )}
              />
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <TextField
            label="Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (transaction ? 'Update' : 'Create')}
            </Button>
          </Box>
        </Grid>
        
        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default AdvancedTransactionForm;