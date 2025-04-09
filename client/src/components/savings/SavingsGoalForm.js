import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Slider,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  FormHelperText,
  Tooltip,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import PhotoIcon from '@mui/icons-material/Photo';
import ImageIcon from '@mui/icons-material/Image';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMonths, format, differenceInMonths, isBefore } from 'date-fns';

/**
 * Component for creating and editing savings goals
 */
const SavingsGoalForm = ({ 
  open, 
  onClose, 
  initialGoal = null,
  onSave,
  onDelete
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get categories from Redux store
  const { categories } = useSelector(state => state.category);
  
  // State for form
  const [goal, setGoal] = useState({
    name: '',
    targetAmount: 1000,
    currentAmount: 0,
    targetDate: addMonths(new Date(), 6),
    category: '',
    priority: 'medium',
    notes: '',
    iconUrl: '',
    autoContribute: false,
    autoContributeAmount: 0,
    contributionFrequency: 'monthly'
  });
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [calculatedMonthlyContribution, setCalculatedMonthlyContribution] = useState(0);
  
  // Load initial data if editing
  useEffect(() => {
    if (initialGoal) {
      setGoal({
        ...initialGoal,
        targetDate: new Date(initialGoal.targetDate),
        category: initialGoal.category || ''
      });
      
      if (initialGoal.iconUrl) {
        setPreviewUrl(initialGoal.iconUrl);
      }
    } else {
      // Reset to defaults for new goal
      setGoal({
        name: '',
        targetAmount: 1000,
        currentAmount: 0,
        targetDate: addMonths(new Date(), 6),
        category: '',
        priority: 'medium',
        notes: '',
        iconUrl: '',
        autoContribute: false,
        autoContributeAmount: 0,
        contributionFrequency: 'monthly'
      });
      setPreviewUrl('');
    }
  }, [initialGoal, open]);
  
  // Calculate required monthly contribution to reach goal
  useEffect(() => {
    if (goal.targetDate && goal.targetAmount) {
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      
      if (isBefore(targetDate, today)) {
        setCalculatedMonthlyContribution(0);
        return;
      }
      
      const monthsRemaining = differenceInMonths(targetDate, today) || 1;
      const amountRemaining = goal.targetAmount - goal.currentAmount;
      
      if (amountRemaining <= 0) {
        setCalculatedMonthlyContribution(0);
      } else {
        const monthly = amountRemaining / monthsRemaining;
        setCalculatedMonthlyContribution(monthly);
      }
    }
  }, [goal.targetDate, goal.targetAmount, goal.currentAmount]);
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle icon file upload
  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image file is too large. Please select an image under 2MB.');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image. Please choose an image file.');
      return;
    }
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      handleChange('iconUrl', e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Clear any previous errors
    setError(null);
  };
  
  // Handle form submission
  const handleSave = () => {
    // Validate form
    if (!goal.name.trim()) {
      setError('Goal name is required');
      return;
    }
    
    if (goal.targetAmount <= 0) {
      setError('Target amount must be greater than zero');
      return;
    }
    
    if (goal.currentAmount < 0) {
      setError('Current amount cannot be negative');
      return;
    }
    
    if (goal.currentAmount > goal.targetAmount) {
      setError('Current amount cannot exceed target amount');
      return;
    }
    
    // Start saving
    setSaving(true);
    setError(null);
    
    try {
      // Prepare goal data
      const goalData = {
        ...goal,
        targetDate: goal.targetDate?.toISOString(),
        progress: Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
      };
      
      // In a real app, this would dispatch a Redux action
      // For this implementation, just call the onSave callback
      if (onSave) {
        setTimeout(() => {
          onSave(goalData);
          setSaving(false);
          onClose();
        }, 500); // Simulate API call
      } else {
        setSaving(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to save goal');
      setSaving(false);
    }
  };
  
  // Handle goal deletion
  const handleDelete = () => {
    if (!initialGoal || !initialGoal._id) return;
    
    if (!window.confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      // In a real app, this would dispatch a Redux action
      // For this implementation, just call the onDelete callback
      if (onDelete) {
        setTimeout(() => {
          onDelete(initialGoal._id);
          setDeleting(false);
          onClose();
        }, 500); // Simulate API call
      } else {
        setDeleting(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete goal');
      setDeleting(false);
    }
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Dialog
      open={open}
      onClose={saving || deleting ? null : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {initialGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={saving || deleting}
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3}>
            {/* Basic Info Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Goal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={7}>
              <TextField
                label="Goal Name"
                fullWidth
                value={goal.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. New Car, Vacation, Emergency Fund"
                required
                disabled={saving || deleting}
                error={error && !goal.name}
                helperText={error && !goal.name ? 'Goal name is required' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={goal.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  label="Priority"
                  disabled={saving || deleting}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
                <FormHelperText>How important is this goal to you?</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Target Amount"
                fullWidth
                type="number"
                value={goal.targetAmount}
                onChange={(e) => handleChange('targetAmount', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={saving || deleting}
                error={error && goal.targetAmount <= 0}
                helperText={error && goal.targetAmount <= 0 ? 'Target amount must be greater than zero' : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Target Date"
                value={goal.targetDate}
                onChange={(date) => handleChange('targetDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disablePast
                disabled={saving || deleting}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Amount Saved"
                fullWidth
                type="number"
                value={goal.currentAmount}
                onChange={(e) => handleChange('currentAmount', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={saving || deleting}
                error={error && (goal.currentAmount < 0 || goal.currentAmount > goal.targetAmount)}
                helperText={
                  error && goal.currentAmount < 0 
                    ? 'Current amount cannot be negative'
                    : error && goal.currentAmount > goal.targetAmount
                    ? 'Current amount cannot exceed target amount'
                    : ''
                }
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category (Optional)</InputLabel>
                <Select
                  value={goal.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  label="Category (Optional)"
                  disabled={saving || deleting}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories?.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Associate this goal with a spending category</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                fullWidth
                multiline
                rows={3}
                value={goal.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional details about your goal..."
                disabled={saving || deleting}
              />
            </Grid>
            
            {/* Goal Icon */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Goal Icon (Optional)
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Goal icon" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }} 
                    />
                  ) : (
                    <ImageIcon color="disabled" fontSize="large" />
                  )}
                </Box>
                
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="goal-icon-upload"
                    type="file"
                    onChange={handleIconUpload}
                    disabled={saving || deleting}
                  />
                  <label htmlFor="goal-icon-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoIcon />}
                      disabled={saving || deleting}
                    >
                      Upload Image
                    </Button>
                  </label>
                  
                  {previewUrl && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => {
                        setPreviewUrl('');
                        handleChange('iconUrl', '');
                      }}
                      disabled={saving || deleting}
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            {/* Auto-Contribution Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Contribution Plan
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" icon={<TrendingUpIcon />} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  To reach your target by {format(goal.targetDate, 'MMMM d, yyyy')}, you should save approximately {formatCurrency(calculatedMonthlyContribution)} per month.
                </Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={goal.autoContribute}
                      onChange={(e) => handleChange('autoContribute', e.target.checked)}
                      disabled={saving || deleting}
                    />
                  }
                  label="Set up automatic contributions"
                />
                <FormHelperText>
                  Enable to automatically allocate funds to this goal on a regular basis
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {goal.autoContribute && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contribution Amount"
                    fullWidth
                    type="number"
                    value={goal.autoContributeAmount}
                    onChange={(e) => handleChange('autoContributeAmount', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    disabled={saving || deleting}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={goal.contributionFrequency}
                      onChange={(e) => handleChange('contributionFrequency', e.target.value)}
                      label="Frequency"
                      disabled={saving || deleting}
                    >
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="biweekly">Bi-weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            {/* Progress Visualization */}
            {goal.currentAmount > 0 && goal.targetAmount > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)} saved
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      height: 8,
                      width: '100%',
                      bgcolor: theme.palette.grey[300],
                      borderRadius: 5,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: 5,
                        transition: 'width 0.5s ease-in-out',
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {initialGoal && (
          <Button
            color="error"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            onClick={handleDelete}
            disabled={saving || deleting}
            sx={{ mr: 'auto' }}
          >
            {deleting ? 'Deleting...' : 'Delete Goal'}
          </Button>
        )}
        
        <Button
          onClick={onClose}
          disabled={saving || deleting}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || deleting}
        >
          {saving ? 'Saving...' : 'Save Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsGoalForm;