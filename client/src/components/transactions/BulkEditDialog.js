import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LabelIcon from '@mui/icons-material/Label';
import NotesIcon from '@mui/icons-material/Notes';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { updateTransactions, deleteTransactions } from '../../redux/actions/transactionActions';

/**
 * Dialog for bulk editing multiple transactions at once
 */
const BulkEditDialog = ({ open, onClose, selectedTransactions = [] }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get categories from Redux store
  const { categories, loading: categoriesLoading } = useSelector(state => state.category);
  
  // Local state for form values
  const [editFields, setEditFields] = useState({
    category: { value: '', enabled: false },
    date: { value: null, enabled: false },
    type: { value: '', enabled: false },
    tags: { value: [], enabled: false },
    notes: { value: '', enabled: false },
    description: { value: '', enabled: false }
  });
  
  // State for UI
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Get available tags from all selected transactions
  useEffect(() => {
    if (selectedTransactions && selectedTransactions.length > 0) {
      const allTags = [];
      selectedTransactions.forEach(transaction => {
        if (transaction.tags && transaction.tags.length > 0) {
          transaction.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          });
        }
      });
      setTags(allTags);
    }
  }, [selectedTransactions]);
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      resetForm();
      setError(null);
      setDeleteMode(false);
      setConfirmDelete(false);
    }
  }, [open]);
  
  // Reset form to initial state
  const resetForm = () => {
    setEditFields({
      category: { value: '', enabled: false },
      date: { value: null, enabled: false },
      type: { value: '', enabled: false },
      tags: { value: [], enabled: false },
      notes: { value: '', enabled: false },
      description: { value: '', enabled: false }
    });
  };
  
  // Handle field toggle
  const handleFieldToggle = (field) => {
    setEditFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        enabled: !prev[field].enabled
      }
    }));
  };
  
  // Handle field value change
  const handleFieldChange = (field, value) => {
    setEditFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value
      }
    }));
  };
  
  // Handle tags
  const handleAddTag = () => {
    if (newTag && !editFields.tags.value.includes(newTag)) {
      const updatedTags = [...editFields.tags.value, newTag];
      handleFieldChange('tags', updatedTags);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag) => {
    const updatedTags = editFields.tags.value.filter(t => t !== tag);
    handleFieldChange('tags', updatedTags);
  };
  
  // Handle save/update
  const handleSave = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      // Create update object with only enabled fields
      const updateData = {};
      
      if (editFields.category.enabled && editFields.category.value) {
        updateData.category = editFields.category.value;
      }
      
      if (editFields.date.enabled && editFields.date.value) {
        updateData.date = editFields.date.value;
      }
      
      if (editFields.type.enabled && editFields.type.value) {
        updateData.type = editFields.type.value;
      }
      
      if (editFields.tags.enabled) {
        updateData.tags = editFields.tags.value;
      }
      
      if (editFields.notes.enabled) {
        updateData.notes = editFields.notes.value;
      }
      
      if (editFields.description.enabled && editFields.description.value) {
        updateData.description = editFields.description.value;
      }
      
      // Check if there are any fields to update
      if (Object.keys(updateData).length === 0) {
        setError('Please select at least one field to update');
        setProcessing(false);
        return;
      }
      
      // Get IDs of selected transactions
      const transactionIds = selectedTransactions.map(t => t._id);
      
      // Dispatch update action
      await dispatch(updateTransactions(transactionIds, updateData));
      
      setProcessing(false);
      onClose(true); // Close with success flag
    } catch (err) {
      console.error('Error updating transactions', err);
      setError(err.message || 'An error occurred while updating transactions');
      setProcessing(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    try {
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      
      setProcessing(true);
      setError(null);
      
      // Get IDs of selected transactions
      const transactionIds = selectedTransactions.map(t => t._id);
      
      // Dispatch delete action
      await dispatch(deleteTransactions(transactionIds));
      
      setProcessing(false);
      onClose(true); // Close with success flag
    } catch (err) {
      console.error('Error deleting transactions', err);
      setError(err.message || 'An error occurred while deleting transactions');
      setProcessing(false);
    }
  };
  
  // Toggle between edit and delete modes
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setConfirmDelete(false);
  };
  
  // Cancel and close dialog
  const handleCancel = () => {
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={processing ? null : handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {deleteMode ? 'Delete Transactions' : 'Bulk Edit Transactions'}
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          disabled={processing}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Header with transaction count */}
        <Typography variant="subtitle1" gutterBottom>
          Selected Transactions: {selectedTransactions.length}
        </Typography>
        
        {/* Error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Delete mode warning */}
        {deleteMode ? (
          <Box sx={{ mb: 2 }}>
            <Alert 
              severity={confirmDelete ? "error" : "warning"}
              sx={{ mb: 2 }}
            >
              {confirmDelete ? (
                <>
                  <Typography variant="subtitle2">
                    Are you sure you want to delete {selectedTransactions.length} transactions?
                  </Typography>
                  <Typography variant="body2">
                    This action cannot be undone.
                  </Typography>
                </>
              ) : (
                "Warning: You are about to delete multiple transactions. This action cannot be undone."
              )}
            </Alert>
            
            <Box sx={{ 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: theme.palette.background.default,
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Transactions to be deleted:
              </Typography>
              
              {selectedTransactions.map((transaction) => (
                <Chip
                  key={transaction._id}
                  label={`${transaction.description} (${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(transaction.amount)})`}
                  size="small"
                  color={transaction.type === 'income' ? 'success' : 'error'}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          /* Edit mode form */
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {/* Category */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFields.category.enabled}
                        onChange={() => handleFieldToggle('category')}
                      />
                    }
                    label="Category"
                  />
                  <CategoryIcon sx={{ ml: 'auto', color: 'action.active' }} />
                </Box>
                
                <FormControl
                  fullWidth
                  disabled={!editFields.category.enabled}
                  size="small"
                >
                  <InputLabel>Select Category</InputLabel>
                  <Select
                    value={editFields.category.value}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    label="Select Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {categories && categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Transaction Type */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFields.type.enabled}
                        onChange={() => handleFieldToggle('type')}
                      />
                    }
                    label="Transaction Type"
                  />
                  <AttachMoneyIcon sx={{ ml: 'auto', color: 'action.active' }} />
                </Box>
                
                <FormControl
                  fullWidth
                  disabled={!editFields.type.enabled}
                  size="small"
                >
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={editFields.type.value}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    label="Transaction Type"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="transfer">Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Date */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFields.date.enabled}
                        onChange={() => handleFieldToggle('date')}
                      />
                    }
                    label="Date"
                  />
                  <DateRangeIcon sx={{ ml: 'auto', color: 'action.active' }} />
                </Box>
                
                <DatePicker
                  label="Transaction Date"
                  value={editFields.date.value}
                  onChange={(newValue) => handleFieldChange('date', newValue)}
                  disabled={!editFields.date.enabled}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>
              
              {/* Description */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFields.description.enabled}
                        onChange={() => handleFieldToggle('description')}
                      />
                    }
                    label="Description"
                  />
                  <EditIcon sx={{ ml: 'auto', color: 'action.active' }} />
                </Box>
                
                <TextField
                  label="Description"
                  value={editFields.description.value}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  disabled={!editFields.description.enabled}
                  fullWidth
                  size="small"
                />
              </Grid>
              
              {/* Tags */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFields.tags.enabled}
                        onChange={() => handleFieldToggle('tags')}
                      />
                    }
                    label="Tags"
                  />
                  <LabelIcon sx={{ ml: 'auto', color: 'action.active' }} />
                </Box>
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    label="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    disabled={!editFields.tags.enabled}
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={!editFields.tags.enabled || !newTag}
                  >
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {editFields.tags.value.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      disabled={!editFields.tags.enabled}
                      size="small"
                    />
                  ))}
                  
                  {editFields.tags.value.length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No tags selected
                    </Typography>
                  )}
                </Box>
                
                {tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Available tags from selected transactions:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            if (editFields.tags.enabled && !editFields.tags.value.includes(tag)) {
                              handleFieldChange('tags', [...editFields.tags.value, tag]);
                            }
                          }}
                          disabled={!editFields.tags.enabled}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
              
              {/* Notes */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFields.notes.enabled}
                        onChange={() => handleFieldToggle('notes')}
                      />
                    }
                    label="Notes"
                  />
                  <NotesIcon sx={{ ml: 'auto', color: 'action.active' }} />
                </Box>
                
                <TextField
                  label="Notes"
                  value={editFields.notes.value}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  disabled={!editFields.notes.enabled}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        )}
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          p: 2
        }}
      >
        <Button
          color="secondary"
          onClick={toggleDeleteMode}
          startIcon={deleteMode ? <EditIcon /> : <DeleteIcon />}
          disabled={processing}
        >
          {deleteMode ? 'Switch to Edit Mode' : 'Switch to Delete Mode'}
        </Button>
        
        <Box>
          <Button 
            onClick={handleCancel} 
            disabled={processing}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color={deleteMode ? "error" : "primary"}
            onClick={deleteMode ? handleDelete : handleSave}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : (deleteMode ? <DeleteIcon /> : <SaveIcon />)}
          >
            {processing ? 'Processing...' : (deleteMode ? (confirmDelete ? 'Confirm Delete' : 'Delete') : 'Update')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEditDialog;
