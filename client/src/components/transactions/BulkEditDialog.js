import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  IconButton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { updateTransaction } from '../../redux/actions/transactionActions';

/**
 * BulkEditDialog component
 * 
 * Dialog for editing multiple transactions at once
 */
const BulkEditDialog = ({ open, onClose, selectedTransactions = [] }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  
  // Track which fields to update
  const [fieldChanges, setFieldChanges] = useState({
    category: false,
    type: false
  });
  
  // Track field values
  const [formData, setFormData] = useState({
    category: '',
    type: 'expense'
  });
  
  // Success/error state
  const [success, setSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Reset form when dialog opens/closes
    if (open) {
      setFieldChanges({
        category: false,
        type: false
      });
      
      setFormData({
        category: '',
        type: 'expense'
      });
      
      setSuccess(false);
      setUpdating(false);
      setProgress(0);
    }
  }, [open]);
  
  // Handle toggling which fields to update
  const handleFieldToggle = (field) => {
    setFieldChanges({
      ...fieldChanges,
      [field]: !fieldChanges[field]
    });
  };
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Count selected transactions
  const transactionCount = selectedTransactions.length;
  
  // Handle form submission
  const handleSubmit = async () => {
    // Only include fields that are checked
    const updateData = {};
    
    if (fieldChanges.category) updateData.category = formData.category;
    if (fieldChanges.type) updateData.type = formData.type;
    
    // Update each transaction one by one
    setUpdating(true);
    let completedCount = 0;
    
    for (const transaction of selectedTransactions) {
      try {
        await dispatch(updateTransaction(transaction._id, updateData));
        completedCount++;
        setProgress((completedCount / selectedTransactions.length) * 100);
      } catch (error) {
        console.error(`Error updating transaction ${transaction._id}:`, error);
      }
    }
    
    setUpdating(false);
    setSuccess(true);
    
    // Close dialog after a delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };
  
  // Check if any fields are selected for update
  const hasSelectedFields = Object.values(fieldChanges).some(value => value);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Bulk Edit Transactions
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {updating && (
          <Box mb={2}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" align="center" color="textSecondary">
              Updating transactions: {Math.round(progress)}%
            </Typography>
          </Box>
        )}
        
        {success && (
          <Box mb={2}>
            <Alert severity="success">
              Successfully updated {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}!
            </Alert>
          </Box>
        )}
        
        {!updating && !success && (
          <>
            <Box mb={2}>
              <Alert severity="info" icon={<InfoOutlinedIcon />}>
                You are editing <strong>{transactionCount}</strong> transaction{transactionCount !== 1 ? 's' : ''}. 
                Select which fields to update and their new values.
              </Alert>
            </Box>
            
            <Grid container spacing={3}>
              {/* Category Field */}
              <Grid item xs={12}>
                <Box mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={fieldChanges.category}
                        onChange={() => handleFieldToggle('category')}
                      />
                    }
                    label="Update Category"
                  />
                </Box>
                <FormControl 
                  fullWidth 
                  disabled={!fieldChanges.category}
                  size="small"
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    label="Category"
                  >
                    {categories?.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Transaction Type Field */}
              <Grid item xs={12}>
                <Box mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={fieldChanges.type}
                        onChange={() => handleFieldToggle('type')}
                      />
                    }
                    label="Update Transaction Type"
                  />
                </Box>
                <FormControl 
                  fullWidth 
                  disabled={!fieldChanges.type}
                  size="small"
                >
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    label="Transaction Type"
                  >
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="transfer">Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!hasSelectedFields || updating || success}
        >
          {updating ? 'Updating...' : 'Update Transactions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEditDialog;
