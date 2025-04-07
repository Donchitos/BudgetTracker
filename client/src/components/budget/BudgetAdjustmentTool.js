import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  Slider,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { updateCategory } from '../../redux/actions/categoryActions';

const BudgetAdjustmentTool = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  
  // States for budget adjustment
  const [adjustmentMethod, setAdjustmentMethod] = useState('percentage');
  const [percentageChange, setPercentageChange] = useState(0);
  const [fixedAmountChange, setFixedAmountChange] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [adjustedCategories, setAdjustedCategories] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [globalAdjustment, setGlobalAdjustment] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  // Load categories and calculate initial total budget
  useEffect(() => {
    if (!categories) return;
    
    // Calculate total budget
    const total = categories.reduce((sum, category) => sum + (category.budget || 0), 0);
    setTotalBudget(total);
    
    // Initialize adjusted categories
    const initialAdjusted = categories.map(category => ({
      _id: category._id,
      name: category.name,
      color: category.color,
      currentBudget: category.budget || 0,
      adjustedBudget: category.budget || 0,
      difference: 0,
      percentChange: 0
    }));
    
    setAdjustedCategories(initialAdjusted);
  }, [categories]);
  
  // Apply global adjustment when parameters change
  useEffect(() => {
    if (!adjustedCategories.length || !globalAdjustment) return;
    
    // Skip calculation if in manual mode
    if (manualMode) return;
    
    let newTotal = 0;
    
    // Apply adjustment based on selected method
    const updatedCategories = adjustedCategories.map(category => {
      let newBudget = category.currentBudget;
      
      if (adjustmentMethod === 'percentage') {
        // Apply percentage change
        newBudget = category.currentBudget * (1.0 + (percentageChange / 100));
      } else {
        // Apply proportional fixed amount change
        const proportion = totalBudget > 0 ? category.currentBudget / totalBudget : 0;
        newBudget = Math.max(0, category.currentBudget + (fixedAmountChange * proportion));
      }
      
      // Round to 2 decimal places
      newBudget = Math.round(newBudget * 100) / 100;
      newTotal += newBudget;
      
      const difference = newBudget - category.currentBudget;
      const percentChange = category.currentBudget > 0 
        ? ((newBudget - category.currentBudget) / category.currentBudget) * 100 
        : 0;
      
      return {
        ...category,
        adjustedBudget: newBudget,
        difference,
        percentChange
      };
    });
    
    setAdjustedCategories(updatedCategories);
  }, [adjustmentMethod, percentageChange, fixedAmountChange, globalAdjustment, manualMode]);
  
  // Handle adjustment method change
  const handleAdjustmentMethodChange = (e) => {
    setAdjustmentMethod(e.target.value);
  };
  
  // Handle percentage change
  const handlePercentageChange = (e, value) => {
    setPercentageChange(value);
  };
  
  // Handle fixed amount change
  const handleFixedAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setFixedAmountChange(value);
  };
  
  // Handle manual adjustment for a specific category
  const handleManualAdjustment = (id, value) => {
    const newBudget = parseFloat(value) || 0;
    
    setAdjustedCategories(prev => prev.map(cat => {
      if (cat._id === id) {
        const difference = newBudget - cat.currentBudget;
        const percentChange = cat.currentBudget > 0 
          ? ((newBudget - cat.currentBudget) / cat.currentBudget) * 100 
          : 0;
        
        return {
          ...cat,
          adjustedBudget: newBudget,
          difference,
          percentChange
        };
      }
      return cat;
    }));
  };
  
  // Handle toggling manual mode
  const handleToggleManualMode = () => {
    setManualMode(!manualMode);
    // If turning off manual mode, reapply global adjustment
    if (manualMode) {
      setGlobalAdjustment(true);
    }
  };
  
  // Handle toggling global adjustment
  const handleToggleGlobalAdjustment = () => {
    setGlobalAdjustment(!globalAdjustment);
  };
  
  // Handle category edit button click
  const handleEditCategory = (id) => {
    setEditingCategoryId(id);
  };
  
  // Save changes to all categories
  const handleSaveChanges = async () => {
    try {
      // Close confirm dialog
      setConfirmDialogOpen(false);
      
      // Only update categories with changes
      const categoriesToUpdate = adjustedCategories.filter(cat => 
        cat.currentBudget !== cat.adjustedBudget
      );
      
      // Update each category
      await Promise.all(categoriesToUpdate.map(cat => 
        dispatch(updateCategory(cat._id, { budget: cat.adjustedBudget }))
      ));
      
      // Show success message
      setSuccessMessage('Budget adjustments saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update current budgets to match adjusted budgets
      setAdjustedCategories(prev => prev.map(cat => ({
        ...cat,
        currentBudget: cat.adjustedBudget,
        difference: 0,
        percentChange: 0
      })));
      
      // Reset adjustment values
      setPercentageChange(0);
      setFixedAmountChange(0);
    } catch (err) {
      console.error('Error saving budget adjustments:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate new total budget
  const newTotalBudget = adjustedCategories.reduce(
    (sum, cat) => sum + cat.adjustedBudget, 
    0
  );
  
  // Calculate overall change
  const overallChange = newTotalBudget - totalBudget;
  const overallPercentChange = totalBudget > 0 
    ? (overallChange / totalBudget) * 100 
    : 0;
  
  return (
    <Card>
      <CardHeader 
        title="Budget Adjustment Tools" 
        subheader="Adjust your category budgets to match your changing financial needs"
      />
      <Divider />
      <CardContent>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Adjustment Controls */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Adjustment Method
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={adjustmentMethod}
                      onChange={handleAdjustmentMethodChange}
                    >
                      <FormControlLabel 
                        value="percentage" 
                        control={<Radio />} 
                        label="Percentage Change" 
                      />
                      <FormControlLabel 
                        value="fixedAmount" 
                        control={<Radio />} 
                        label="Fixed Amount" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
                
                {adjustmentMethod === 'percentage' ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>
                      Adjust all budgets by percentage: {percentageChange}%
                    </Typography>
                    <Slider
                      value={percentageChange}
                      onChange={handlePercentageChange}
                      aria-labelledby="percentage-adjustment-slider"
                      min={-50}
                      max={50}
                      marks={[
                        { value: -50, label: '-50%' },
                        { value: -25, label: '-25%' },
                        { value: 0, label: '0%' },
                        { value: 25, label: '+25%' },
                        { value: 50, label: '+50%' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>
                      Adjust total budget by amount:
                    </Typography>
                    <TextField
                      value={fixedAmountChange}
                      onChange={handleFixedAmountChange}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="Positive values increase budget, negative values decrease"
                      fullWidth
                    />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={globalAdjustment}
                        onChange={handleToggleGlobalAdjustment}
                      />
                    }
                    label="Apply to all categories proportionally"
                  />
                  <Tooltip title="Adjusts all category budgets proportionally based on their current budget">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={!globalAdjustment}
                        onChange={handleToggleGlobalAdjustment}
                      />
                    }
                    label="Manual category adjustments"
                  />
                  <Tooltip title="Adjust each category budget individually">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Budget Summary */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget Summary
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Total Budget:
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(totalBudget)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      New Total Budget:
                    </Typography>
                    <Typography variant="h6" 
                      color={overallChange >= 0 ? 'primary.main' : 'error.main'}
                    >
                      {formatCurrency(newTotalBudget)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Budget Change:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {overallChange >= 0 ? (
                      <AddCircleIcon color="primary" sx={{ mr: 1 }} />
                    ) : (
                      <RemoveCircleIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography 
                      variant="h6" 
                      color={overallChange >= 0 ? 'primary.main' : 'error.main'}
                    >
                      {formatCurrency(Math.abs(overallChange))} ({overallPercentChange.toFixed(1)}%)
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setConfirmDialogOpen(true)}
                    startIcon={<SaveIcon />}
                    disabled={overallChange === 0}
                  >
                    Save All Budget Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Category Adjustments */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Category Budget Adjustments
            </Typography>
            
            <List>
              {adjustedCategories.map((category) => (
                <React.Fragment key={category._id}>
                  <ListItem 
                    sx={{ 
                      bgcolor: 'background.paper',
                      borderLeft: `4px solid ${category.color || '#ccc'}`,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {category.name}
                          </Typography>
                          
                          {category.difference !== 0 && (
                            <Chip 
                              size="small"
                              color={category.difference > 0 ? 'primary' : 'error'}
                              label={`${category.difference > 0 ? '+' : ''}${formatCurrency(category.difference)} (${category.percentChange.toFixed(1)}%)`}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={5} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              Current: {formatCurrency(category.currentBudget)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={7} md={8}>
                            {editingCategoryId === category._id ? (
                              <TextField
                                size="small"
                                type="number"
                                value={category.adjustedBudget}
                                onChange={(e) => handleManualAdjustment(category._id, e.target.value)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => setEditingCategoryId(null)}
                                      >
                                        <SaveIcon fontSize="small" />
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                                sx={{ width: '100%' }}
                              />
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography
                                  color={category.difference !== 0 ? 
                                    (category.difference > 0 ? 'primary.main' : 'error.main') : 
                                    'text.primary'
                                  }
                                >
                                  New: {formatCurrency(category.adjustedBudget)}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditCategory(category._id)}
                                  sx={{ ml: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Grid>
        </Grid>
      </CardContent>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Budget Changes</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to save the following budget changes?
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Total Budget Change: {formatCurrency(overallChange)} ({overallPercentChange.toFixed(1)}%)
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
            Category Changes:
          </Typography>
          
          <List dense>
            {adjustedCategories
              .filter(cat => cat.difference !== 0)
              .map(cat => (
                <ListItem key={cat._id}>
                  <ListItemText
                    primary={cat.name}
                    secondary={`${formatCurrency(cat.currentBudget)} → ${formatCurrency(cat.adjustedBudget)} (${cat.difference > 0 ? '+' : ''}${formatCurrency(cat.difference)})`}
                  />
                </ListItem>
              ))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BudgetAdjustmentTool;