import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Paper,
  Divider,
  Grid,
  Stack,
  Alert,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { updateTransaction } from '../../redux/actions/transactionActions';

const BulkEditDialog = ({ 
  open, 
  onClose, 
  selectedTransactions = [],
  onComplete
}) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  
  // Fields that can be bulk edited
  const [fields, setFields] = useState({
    category: { enabled: false, value: '' },
    subcategory: { enabled: false, value: '' },
    date: { enabled: false, value: new Date() },
    type: { enabled: false, value: '' },
    tags: { enabled: false, value: [] },
    notes: { enabled: false, value: '' }
  });
  
  // Available subcategories and tags
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  
  // Loading and progress state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Extract existing subcategories and tags from selected transactions
  useEffect(() => {
    if (selectedTransactions.length > 0) {
      // Extract unique subcategories
      const subcats = selectedTransactions
        .filter(t => t.subcategory)
        .map(t => t.subcategory);
      setSubcategoryOptions([...new Set(subcats)]);
      
      // Extract unique tags
      const allTags = selectedTransactions.reduce((tags, t) => {
        if (t.tags && t.tags.length > 0) {
          return [...tags, ...t.tags];
        }
        return tags;
      }, []);
      setTagOptions([...new Set(allTags)]);
    }
  }, [selectedTransactions]);
  
  // Toggle a field's enabled state
  const toggleField = (fieldName) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        enabled: !prev[fieldName].enabled
      }
    }));
  };
  
  // Update a field's value
  const updateFieldValue = (fieldName, value) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    
    try {
      // Count enabled fields
      const enabledFieldCount = Object.values(fields).filter(f => f.enabled).length;
      
      if (enabledFieldCount === 0) {
        setError('Please enable at least one field to update');
        setLoading(false);
        return;
      }
      
      // Process each transaction
      for (let i = 0; i < selectedTransactions.length; i++) {
        const transaction = selectedTransactions[i];
        
        // Build update data based on enabled fields
        const updateData = {};
        
        if (fields.category.enabled && fields.category.value) {
          updateData.category = fields.category.value;
        }
        
        if (fields.subcategory.enabled) {
          updateData.subcategory = fields.subcategory.value;
        }
        
        if (fields.date.enabled) {
          updateData.date = fields.date.value;
        }
        
        if (fields.type.enabled && fields.type.value) {
          updateData.type = fields.type.value;
        }
        
        if (fields.tags.enabled) {
          updateData.tags = fields.tags.value;
        }
        
        if (fields.notes.enabled) {
          updateData.notes = fields.notes.value;
        }
        
        // Skip if no changes
        if (Object.keys(updateData).length === 0) {
          continue;
        }
        
        // Update transaction
        await dispatch(updateTransaction(transaction._id, updateData));
        
        // Update progress
        setProgress(Math.round(((i + 1) / selectedTransactions.length) * 100));
      }
      
      setSuccess(true);
      
      // Call the onComplete callback after a delay
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'An error occurred while updating transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    // Check that any enabled field with a required value has a value
    if (fields.category.enabled && fields.category.value === '' && 
        (fields.type.enabled && fields.type.value === 'expense' || 
         !fields.type.enabled && selectedTransactions.some(t => t.type === 'expense'))) {
      setError('Category is required for expense transactions');
      return false;
    }
    
    if (fields.type.enabled && fields.type.value === '') {
      setError('Please select a transaction type');
      return false;
    }
    
    setError(null);
    return true;
  };

  // Compute summary information
  const summary = {
    count: selectedTransactions.length,
    totalAmount: selectedTransactions.reduce((sum, t) => sum + t.amount, 0)
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Bulk Edit Transactions</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ my: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Updating {selectedTransactions.length} transactions...
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Please wait while the changes are being applied
            </Typography>
          </Box>
        ) : success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Successfully updated {selectedTransactions.length} transactions!
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Transactions Summary
              </Typography>
              <Typography variant="body2">
                {summary.count} transactions selected, totaling {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(summary.totalAmount)}
              </Typography>
            </Paper>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the fields you want to update and their new values. Only the selected fields will be changed.
            </Typography>
            
            <Grid container spacing={3}>
              {/* Type */}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox
                    checked={fields.type.enabled}
                    onChange={() => toggleField('type')}
                  />
                  <FormControl fullWidth disabled={!fields.type.enabled}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={fields.type.value}
                      onChange={(e) => updateFieldValue('type', e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              
              {/* Category */}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox
                    checked={fields.category.enabled}
                    onChange={() => toggleField('category')}
                  />
                  <FormControl fullWidth disabled={!fields.category.enabled}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={fields.category.value}
                      onChange={(e) => updateFieldValue('category', e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">Select Category</MenuItem>
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
                </Stack>
              </Grid>
              
              {/* Subcategory */}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox
                    checked={fields.subcategory.enabled}
                    onChange={() => toggleField('subcategory')}
                  />
                  <Autocomplete
                    disabled={!fields.subcategory.enabled}
                    freeSolo
                    options={subcategoryOptions}
                    value={fields.subcategory.value}
                    onChange={(event, newValue) => {
                      updateFieldValue('subcategory', newValue || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subcategory"
                        fullWidth
                      />
                    )}
                    fullWidth
                  />
                </Stack>
              </Grid>
              
              {/* Date */}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox
                    checked={fields.date.enabled}
                    onChange={() => toggleField('date')}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={fields.date.value}
                      onChange={(date) => updateFieldValue('date', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      disabled={!fields.date.enabled}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>
              
              {/* Tags */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Checkbox
                    checked={fields.tags.enabled}
                    onChange={() => toggleField('tags')}
                    sx={{ mt: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Autocomplete
                      disabled={!fields.tags.enabled}
                      multiple
                      freeSolo
                      options={tagOptions}
                      value={fields.tags.value}
                      onChange={(event, newValue) => {
                        updateFieldValue('tags', newValue);
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            disabled={!fields.tags.enabled}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder={fields.tags.enabled ? "Add tags" : "Tags disabled"}
                          helperText={fields.tags.enabled ? "Press Enter to add a tag" : ""}
                        />
                      )}
                      fullWidth
                    />
                  </Box>
                </Stack>
              </Grid>
              
              {/* Notes */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Checkbox
                    checked={fields.notes.enabled}
                    onChange={() => toggleField('notes')}
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    label="Notes"
                    value={fields.notes.value}
                    onChange={(e) => updateFieldValue('notes', e.target.value)}
                    disabled={!fields.notes.enabled}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Stack>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                These changes will be applied to all {selectedTransactions.length} selected transactions.
                Only the fields you've enabled above will be updated.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="inherit"
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading || success}
        >
          Update {selectedTransactions.length} Transactions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEditDialog;