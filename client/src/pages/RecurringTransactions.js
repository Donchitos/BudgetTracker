import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  Collapse,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  generateTransactions,
  clearRecurringTransactionError
} from '../redux/actions/recurringTransactionActions';
import { getCategories } from '../redux/actions/categoryActions';
import { format, addDays, getDay } from 'date-fns';

const RecurringTransactions = () => {
  const dispatch = useDispatch();
  const { recurringTransactions, loading, error, generationResult } = useSelector(
    state => state.recurringTransactions
  );
  const { categories } = useSelector(state => state.categories);
  
  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [generateUntilDate, setGenerateUntilDate] = useState(new Date());
  const [resultDetailsOpen, setResultDetailsOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    frequency: 'monthly',
    startDate: new Date(),
    endDate: null,
    category: '',
    subcategory: '',
    tags: [],
    notes: '',
    dayOfWeek: new Date().getDay(),
    dayOfMonth: new Date().getDate(),
    isActive: true
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Load data when component mounts
  useEffect(() => {
    dispatch(getRecurringTransactions());
    dispatch(getCategories());
    
    return () => {
      dispatch(clearRecurringTransactionError());
    };
  }, [dispatch]);
  
  // Initialize form when editing a transaction
  useEffect(() => {
    if (selectedTransaction) {
      const startDate = selectedTransaction.startDate 
        ? new Date(selectedTransaction.startDate) 
        : new Date();
      
      const endDate = selectedTransaction.endDate 
        ? new Date(selectedTransaction.endDate) 
        : null;
      
      setFormData({
        description: selectedTransaction.description || '',
        amount: selectedTransaction.amount?.toString() || '',
        type: selectedTransaction.type || 'expense',
        frequency: selectedTransaction.frequency || 'monthly',
        startDate,
        endDate,
        category: selectedTransaction.category?._id || selectedTransaction.category || '',
        subcategory: selectedTransaction.subcategory || '',
        tags: selectedTransaction.tags || [],
        notes: selectedTransaction.notes || '',
        dayOfWeek: selectedTransaction.dayOfWeek !== undefined ? selectedTransaction.dayOfWeek : startDate.getDay(),
        dayOfMonth: selectedTransaction.dayOfMonth !== undefined ? selectedTransaction.dayOfMonth : startDate.getDate(),
        isActive: selectedTransaction.isActive !== undefined ? selectedTransaction.isActive : true
      });
    } else {
      resetForm();
    }
  }, [selectedTransaction]);
  
  // Reset form to default state
  const resetForm = () => {
    const today = new Date();
    
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      frequency: 'monthly',
      startDate: today,
      endDate: null,
      category: '',
      subcategory: '',
      tags: [],
      notes: '',
      dayOfWeek: today.getDay(),
      dayOfMonth: today.getDate(),
      isActive: true
    });
    
    setFormErrors({});
  };
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Handle frequency change (update day fields accordingly)
  const handleFrequencyChange = (e) => {
    const frequency = e.target.value;
    const today = new Date();
    
    setFormData(prev => ({
      ...prev,
      frequency,
      // Reset day fields based on frequency
      dayOfWeek: frequency === 'weekly' || frequency === 'biweekly' ? today.getDay() : prev.dayOfWeek,
      dayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(frequency) ? today.getDate() : prev.dayOfMonth
    }));
  };
  
  // Handle tag input
  const handleTagAdd = (tag) => {
    if (tag && tag.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tag.trim()])]
      }));
    }
  };
  
  // Handle tag deletion
  const handleTagDelete = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
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
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (selectedTransaction) {
        await dispatch(updateRecurringTransaction(selectedTransaction._id, data));
      } else {
        await dispatch(createRecurringTransaction(data));
      }
      
      setDialogOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error saving recurring transaction:', err);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setConfirmDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    
    try {
      await dispatch(deleteRecurringTransaction(selectedTransaction._id));
      setConfirmDialogOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error deleting recurring transaction:', err);
    }
  };
  
  // Handle toggle button click
  const handleToggleActive = async (transaction) => {
    try {
      await dispatch(toggleRecurringTransaction(transaction._id));
    } catch (err) {
      console.error('Error toggling recurring transaction:', err);
    }
  };
  
  // Handle generate transactions manually
  const handleGenerateTransactions = async () => {
    try {
      await dispatch(generateTransactions({
        until: generateUntilDate
      }));
      setGenerateDialogOpen(false);
      setResultDetailsOpen(true);
    } catch (err) {
      console.error('Error generating transactions:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Get day of week name
  const getDayOfWeekName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };
  
  // Get human-readable frequency description
  const getFrequencyDescription = (transaction) => {
    const { frequency, dayOfWeek, dayOfMonth } = transaction;
    
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return `Every ${getDayOfWeekName(dayOfWeek)}`;
      case 'biweekly':
        return `Every other ${getDayOfWeekName(dayOfWeek)}`;
      case 'monthly':
        return `Monthly on day ${dayOfMonth}`;
      case 'quarterly':
        return `Every 3 months on day ${dayOfMonth}`;
      case 'yearly':
        return `Yearly on day ${dayOfMonth} of the month`;
      default:
        return frequency;
    }
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'None';
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Get category color by ID
  const getCategoryColor = (categoryId) => {
    if (!categoryId) return '#cccccc';
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color : '#cccccc';
  };
  
  // Get next occurrence date for a transaction
  const getNextOccurrenceDate = (transaction) => {
    // This is a simplified estimation - the actual backend logic for determining
    // the next occurrence date is more complex
    const startDate = new Date(transaction.startDate);
    const today = new Date();
    
    if (startDate > today) {
      return formatDate(startDate);
    }
    
    let nextDate;
    
    switch (transaction.frequency) {
      case 'daily':
        nextDate = addDays(today, 1);
        break;
      case 'weekly':
        const daysUntilNextOccurrence = (transaction.dayOfWeek - today.getDay() + 7) % 7;
        nextDate = daysUntilNextOccurrence === 0 ? addDays(today, 7) : addDays(today, daysUntilNextOccurrence);
        break;
      case 'biweekly':
        const daysUntilBiweekly = (transaction.dayOfWeek - today.getDay() + 7) % 7;
        nextDate = daysUntilBiweekly === 0 ? addDays(today, 14) : addDays(today, daysUntilBiweekly + 7);
        break;
      default:
        // For monthly, quarterly, yearly - estimation is more complex
        // Just show the day of month as a simplification
        nextDate = `On day ${transaction.dayOfMonth} of next cycle`;
        return nextDate;
    }
    
    return formatDate(nextDate);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recurring Transactions
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AutorenewIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Generate Transactions
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTransaction(null);
              setDialogOpen(true);
            }}
          >
            Add Recurring
          </Button>
        </Stack>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {generationResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Generation Results
              </Typography>
              <Button
                endIcon={resultDetailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setResultDetailsOpen(!resultDetailsOpen)}
              >
                {resultDetailsOpen ? 'Hide Details' : 'Show Details'}
              </Button>
            </Box>
            
            <Typography variant="body1">
              {generationResult.generated} transactions generated, {generationResult.skipped} skipped
            </Typography>
            
            <Collapse in={resultDetailsOpen}>
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Details:
                </Typography>
                
                {generationResult.details.map((detail, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 1, 
                      p: 1, 
                      borderLeft: `4px solid ${detail.status === 'generated' ? '#4CAF50' : '#FFC107'}`,
                      bgcolor: 'background.paper' 
                    }}
                  >
                    <Typography variant="body2">
                      {detail.description}: {detail.status === 'generated' 
                        ? `Generated for ${detail.date}` 
                        : `Skipped (${detail.reason})`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : recurringTransactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AutorenewIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No recurring transactions found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Set up recurring transactions for bills, income, or regular expenses to automate your budget.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTransaction(null);
              setDialogOpen(true);
            }}
          >
            Create First Recurring Transaction
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Next Occurrence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recurringTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type === 'income' ? 'Income' : 'Expense'} 
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={getFrequencyDescription(transaction)}>
                      <Typography variant="body2">
                        {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {transaction.category && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getCategoryColor(transaction.category),
                            mr: 1
                          }}
                        />
                        {getCategoryName(transaction.category)}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{getNextOccurrenceDate(transaction)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.isActive ? 'Active' : 'Paused'} 
                      color={transaction.isActive ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleToggleActive(transaction)}
                      color={transaction.isActive ? 'default' : 'primary'}
                      title={transaction.isActive ? 'Pause' : 'Activate'}
                    >
                      {transaction.isActive ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleEditClick(transaction)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(transaction)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTransaction ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
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
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
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
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFrequencyChange}
                  label="Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Conditional day of week selector */}
            {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    label="Day of Week"
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Conditional day of month selector */}
            {(formData.frequency === 'monthly' || formData.frequency === 'quarterly' || formData.frequency === 'yearly') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Day of Month"
                  name="dayOfMonth"
                  value={formData.dayOfMonth}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, max: 31 }}
                  helperText="Day of the month (1-31)"
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!formErrors.startDate}
                      helperText={formErrors.startDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date (Optional)"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!formErrors.endDate}
                      helperText={formErrors.endDate || 'Leave blank for no end date'}
                    />
                  )}
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
            
            <Grid item xs={12} sm={formData.type === 'expense' ? 6 : 12}>
              <TextField
                label="Subcategory (Optional)"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Tags (Optional)"
                fullWidth
                placeholder="Enter tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleTagDelete(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
              <Tooltip title="When active, this recurring transaction will be automatically generated on schedule">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedTransaction ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Delete Recurring Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the recurring transaction "{selectedTransaction?.description}"?
            This will not delete any previously generated transactions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Generate Transactions Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle>Generate Transactions</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This will generate transactions for all active recurring transactions up to the selected date.
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Generate Until Date"
                value={generateUntilDate}
                onChange={(date) => setGenerateUntilDate(date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
          
          <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
            Note: Only transactions that are due between now and the selected date will be generated.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerateTransactions} color="primary" variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringTransactions;