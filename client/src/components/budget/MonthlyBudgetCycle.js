import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  InputAdornment,
  Tooltip,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { updateCategory } from '../../redux/actions/categoryActions';

const MonthlyBudgetCycle = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const { transactions } = useSelector(state => state.transactions);
  
  // State for the selected month
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state for edit dialog
  const [formData, setFormData] = useState({
    budget: '',
    rolloverUnused: false,
    rolloverPercentage: 100,
    rolloverCap: ''
  });
  
  // Calculate budget usage for each category in the selected month
  useEffect(() => {
    if (!categories || !transactions) return;
    
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);
    
    // Filter transactions for selected month
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date >= startDate && date <= endDate;
    });
    
    // Calculate usage by category
    const budgetData = categories.map(category => {
      // Find transactions for this category
      const categoryTransactions = monthTransactions.filter(t => 
        t.category && t.category._id === category._id
      );
      
      // Calculate total spent
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate percentage of budget used
      const percentUsed = category.budget > 0 ? Math.round((spent / category.budget) * 100) : 0;
      
      // Determine if over budget
      const isOverBudget = spent > category.budget && category.budget > 0;
      
      // Calculate budget status
      let status = 'good';
      if (percentUsed >= 100) {
        status = 'over';
      } else if (percentUsed >= 90) {
        status = 'critical';
      } else if (percentUsed >= 75) {
        status = 'warning';
      }
      
      return {
        ...category,
        spent,
        percentUsed,
        isOverBudget,
        status,
        remaining: Math.max(0, category.budget - spent)
      };
    });
    
    setCategoryBudgets(budgetData);
  }, [categories, transactions, selectedMonth]);
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };
  
  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };
  
  // Handle edit button click for a category
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFormData({
      budget: category.budget?.toString() || '',
      rolloverUnused: category.rolloverUnused || false,
      rolloverPercentage: category.rolloverPercentage || 100,
      rolloverCap: category.rolloverCap?.toString() || ''
    });
    setEditDialogOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle budget update form submission
  const handleUpdateBudget = async () => {
    if (!selectedCategory) return;
    
    // Prepare update data
    const updateData = {
      budget: parseFloat(formData.budget) || 0,
      rolloverUnused: formData.rolloverUnused,
      rolloverPercentage: parseInt(formData.rolloverPercentage) || 100,
      rolloverCap: formData.rolloverCap ? parseFloat(formData.rolloverCap) : null
    };
    
    try {
      // Update category in the database
      await dispatch(updateCategory(selectedCategory._id, updateData));
      
      // Show success message
      setSuccessMessage(`Budget for ${selectedCategory.name} updated successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Close dialog
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Process rollovers for all categories
  const handleProcessRollovers = () => {
    // Get categories with rollover enabled
    const rolloverCategories = categories.filter(c => c.rolloverUnused);
    
    // Get data for previous month
    const prevMonth = subMonths(selectedMonth, 1);
    const prevMonthStart = startOfMonth(prevMonth);
    const prevMonthEnd = endOfMonth(prevMonth);
    
    // Filter transactions for previous month
    const prevMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date >= prevMonthStart && date <= prevMonthEnd;
    });
    
    // Process each category
    rolloverCategories.forEach(async (category) => {
      // Calculate unused budget from previous month
      const categoryTransactions = prevMonthTransactions.filter(t => 
        t.category && t.category._id === category._id
      );
      
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = Math.max(0, category.budget - spent);
      
      // Calculate rollover amount
      let rolloverAmount = (remaining * (category.rolloverPercentage / 100));
      
      // Apply rollover cap if set
      if (category.rolloverCap && rolloverAmount > category.rolloverCap) {
        rolloverAmount = category.rolloverCap;
      }
      
      // Only process if there's an amount to roll over
      if (rolloverAmount > 0) {
        // Calculate new budget
        const newBudget = category.budget + rolloverAmount;
        
        // Update category with new budget
        await dispatch(updateCategory(category._id, {
          budget: newBudget,
          lastRolloverAmount: rolloverAmount,
          lastRolloverDate: new Date()
        }));
      }
    });
    
    // Show success message
    setSuccessMessage(`Budget rollovers processed successfully!`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  return (
    <Card>
      <CardHeader
        title="Monthly Budget Management"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button onClick={handlePreviousMonth}>Previous</Button>
            <Typography variant="h6" sx={{ mx: 2 }}>
              {format(selectedMonth, 'MMMM yyyy')}
            </Typography>
            <Button onClick={handleNextMonth}>Next</Button>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleProcessRollovers}
            startIcon={<ArrowForwardIcon />}
          >
            Process Budget Rollovers
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            This will roll over unused budgets from the previous month for categories with rollover enabled.
          </Typography>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Budget</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell align="right">Usage</TableCell>
                <TableCell align="center">Rollover</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryBudgets.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color || '#ccc',
                          mr: 1
                        }}
                      />
                      {category.name}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(category.budget || 0)}</TableCell>
                  <TableCell align="right">{formatCurrency(category.spent)}</TableCell>
                  <TableCell align="right">{formatCurrency(category.remaining)}</TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={`${category.percentUsed}%`} 
                      color={
                        category.status === 'over' ? 'error' :
                        category.status === 'critical' ? 'error' :
                        category.status === 'warning' ? 'warning' :
                        'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {category.rolloverUnused ? (
                      <Tooltip title={`Rollover ${category.rolloverPercentage}% of unused budget ${
                        category.rolloverCap ? `(capped at ${formatCurrency(category.rolloverCap)})` : ''
                      }`}>
                        <Chip 
                          label="Enabled" 
                          color="primary" 
                          size="small"
                          variant="outlined" 
                        />
                      </Tooltip>
                    ) : (
                      <Chip 
                        label="Disabled" 
                        size="small"
                        variant="outlined" 
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(category)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      
      {/* Edit Budget Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          Edit Budget for {selectedCategory?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Monthly Budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                fullWidth
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.rolloverUnused}
                    onChange={handleInputChange}
                    name="rolloverUnused"
                  />
                }
                label="Roll over unused budget to next month"
              />
              <Tooltip title="When enabled, unused budget from this month will be added to next month's budget">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            
            {formData.rolloverUnused && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Rollover Percentage"
                    name="rolloverPercentage"
                    value={formData.rolloverPercentage}
                    onChange={handleInputChange}
                    fullWidth
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    helperText="Percentage of unused budget to roll over"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Rollover Cap (Optional)"
                    name="rolloverCap"
                    value={formData.rolloverCap}
                    onChange={handleInputChange}
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Maximum amount that can be rolled over (leave blank for no limit)"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateBudget} variant="contained">
            Update Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MonthlyBudgetCycle;