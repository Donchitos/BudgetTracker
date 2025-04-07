import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayersIcon from '@mui/icons-material/Layers';

import { getCategories } from '../redux/actions/categoryActions';
import {
  getBudgetTemplates,
  getDefaultTemplate,
  addBudgetTemplate,
  updateBudgetTemplate,
  deleteBudgetTemplate,
  applyBudgetTemplate
} from '../redux/actions/budgetTemplateActions';

// Color picker for template coloring
import { CirclePicker } from 'react-color';

const BudgetTemplates = () => {
  const dispatch = useDispatch();
  const { budgetTemplates, loading, error, applySuccess, applyMessage } = useSelector(state => state.budgetTemplates);
  const { categories } = useSelector(state => state.categories);
  
  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalBudget: '',
    isDefault: false,
    categories: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(0);
  
  // Load data when component mounts
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getBudgetTemplates());
  }, [dispatch]);
  
  // Initialize form when editing a template
  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name || '',
        description: selectedTemplate.description || '',
        totalBudget: selectedTemplate.totalBudget?.toString() || '',
        isDefault: selectedTemplate.isDefault || false,
        categories: selectedTemplate.categories?.map(cat => ({
          category: cat.category._id || cat.category,
          amount: cat.amount?.toString() || '0',
          percentage: cat.percentage || 0
        })) || []
      });
    } else {
      resetForm();
    }
  }, [selectedTemplate]);
  
  // Update remaining budget when form data changes
  useEffect(() => {
    if (formData.totalBudget) {
      const total = parseFloat(formData.totalBudget);
      const allocated = formData.categories.reduce((sum, cat) => {
        return sum + (parseFloat(cat.amount) || 0);
      }, 0);
      
      setRemainingBudget(total - allocated);
    }
  }, [formData]);
  
  // Reset form to default state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      totalBudget: '',
      isDefault: false,
      categories: []
    });
    setFormErrors({});
  };
  
  // Handle opening form for adding a new template
  const handleAddClick = () => {
    setSelectedTemplate(null);
    resetForm();
    setDialogOpen(true);
  };
  
  // Handle opening form for editing a template
  const handleEditClick = (template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };
  
  // Handle opening delete confirmation dialog
  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };
  
  // Handle opening apply confirmation dialog
  const handleApplyClick = (template) => {
    setSelectedTemplate(template);
    setApplyDialogOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle adding a category to the budget allocation
  const handleAddCategory = () => {
    if (categories.length === 0) return;
    
    // Find a category that hasn't been added yet
    const availableCategories = categories.filter(cat => 
      !formData.categories.some(c => c.category === cat._id)
    );
    
    if (availableCategories.length === 0) return;
    
    const newCategory = {
      category: availableCategories[0]._id,
      amount: '0',
      percentage: 0
    };
    
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };
  
  // Handle removing a category from the budget allocation
  const handleRemoveCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };
  
  // Handle category selection change
  const handleCategoryChange = (index, categoryId) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index].category = categoryId;
    
    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };
  
  // Handle category amount change
  const handleAmountChange = (index, amount) => {
    if (amount === '' || !isNaN(amount)) {
      const updatedCategories = [...formData.categories];
      updatedCategories[index].amount = amount;
      
      // Calculate percentage
      if (amount !== '' && formData.totalBudget && parseFloat(formData.totalBudget) > 0) {
        updatedCategories[index].percentage = Math.round((parseFloat(amount) / parseFloat(formData.totalBudget)) * 100);
      } else {
        updatedCategories[index].percentage = 0;
      }
      
      setFormData(prev => ({
        ...prev,
        categories: updatedCategories
      }));
    }
  };
  
  // Handle percentage slider change
  const handlePercentageChange = (index, percentage) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index].percentage = percentage;
    
    // Calculate amount
    if (formData.totalBudget && parseFloat(formData.totalBudget) > 0) {
      const amount = (percentage / 100) * parseFloat(formData.totalBudget);
      updatedCategories[index].amount = amount.toFixed(2);
    }
    
    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Template name is required';
    }
    
    if (!formData.totalBudget || isNaN(formData.totalBudget) || parseFloat(formData.totalBudget) <= 0) {
      errors.totalBudget = 'Valid total budget is required';
    }
    
    if (formData.categories.length === 0) {
      errors.categories = 'At least one category is required';
    }
    
    for (let i = 0; i < formData.categories.length; i++) {
      const cat = formData.categories[i];
      
      if (!cat.category) {
        errors[`category-${i}`] = 'Category is required';
      }
      
      if (!cat.amount || isNaN(cat.amount) || parseFloat(cat.amount) < 0) {
        errors[`amount-${i}`] = 'Valid amount is required';
      }
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
      // Format data for submission
      const templateData = {
        ...formData,
        totalBudget: parseFloat(formData.totalBudget),
        categories: formData.categories.map(cat => ({
          ...cat,
          amount: parseFloat(cat.amount)
        }))
      };
      
      if (selectedTemplate) {
        // Update existing template
        await dispatch(updateBudgetTemplate(selectedTemplate._id, templateData));
        setSuccessMessage('Budget template updated successfully!');
      } else {
        // Add new template
        await dispatch(addBudgetTemplate(templateData));
        setSuccessMessage('Budget template created successfully!');
      }
      
      // Close dialog and refresh data
      setDialogOpen(false);
      dispatch(getBudgetTemplates());
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving budget template:', err);
    }
  };
  
  // Handle template deletion
  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteBudgetTemplate(selectedTemplate._id));
      setDeleteDialogOpen(false);
      setSuccessMessage('Budget template deleted successfully!');
      dispatch(getBudgetTemplates());
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting budget template:', err);
    }
  };
  
  // Handle template application
  const handleApplyConfirm = async () => {
    try {
      await dispatch(applyBudgetTemplate(selectedTemplate._id));
      setApplyDialogOpen(false);
      setSuccessMessage('Budget template applied successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error applying budget template:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Get category color by ID
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color : '#cccccc';
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Budget Templates
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Template
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : budgetTemplates && budgetTemplates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LayersIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No budget templates found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create your first budget template to easily apply predefined budget allocations to your categories.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Create First Template
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {budgetTemplates && budgetTemplates.map(template => (
            <Grid item xs={12} md={6} key={template._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: template.isDefault ? '0 0 0 2px #4caf50' : undefined,
                  position: 'relative'
                }}
              >
                {template.isDefault && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: 'success.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </Box>
                )}
                
                <CardHeader
                  title={template.name}
                  subheader={template.isDefault ? 'Default Template' : ''}
                />
                
                <CardContent>
                  {template.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Total Budget: {formatCurrency(template.totalBudget)}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Category Allocations:
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {template.categories.map(cat => (
                          <TableRow key={cat.category._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: cat.category.color || '#ccc',
                                    mr: 1
                                  }}
                                />
                                {cat.category.name}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                            <TableCell align="right">{cat.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleApplyClick(template)}
                  >
                    Apply Template
                  </Button>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditClick(template)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(template)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Template Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Edit Budget Template' : 'Create Budget Template'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Template Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Budget"
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!formErrors.totalBudget}
                helperText={formErrors.totalBudget}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    name="isDefault"
                  />
                }
                label="Set as default template"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Category Allocations
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddCategory}
                  disabled={categories.filter(cat => 
                    !formData.categories.some(c => c.category === cat._id)
                  ).length === 0}
                >
                  Add Category
                </Button>
              </Box>
              
              {formErrors.categories && (
                <Typography color="error" variant="caption" display="block" sx={{ mb: 1 }}>
                  {formErrors.categories}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Remaining Budget: {formatCurrency(remainingBudget || 0)}
                </Typography>
                <Typography variant="body2" color={remainingBudget < 0 ? 'error' : 'inherit'}>
                  {remainingBudget === 0 ? 'Fully Allocated' : 
                   remainingBudget < 0 ? 'Over Allocated' : 'Under Allocated'}
                </Typography>
              </Box>
              
              {formData.categories.map((cat, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        label="Category"
                        value={cat.category}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        fullWidth
                        error={!!formErrors[`category-${index}`]}
                        helperText={formErrors[`category-${index}`]}
                      >
                        {categories.map(option => (
                          <MenuItem 
                            key={option._id} 
                            value={option._id}
                            disabled={formData.categories.some(c => 
                              c.category === option._id && c.category !== cat.category
                            )}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Amount"
                        value={cat.amount}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        fullWidth
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        error={!!formErrors[`amount-${index}`]}
                        helperText={formErrors[`amount-${index}`]}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Percentage: {cat.percentage}%
                      </Typography>
                      <Slider
                        value={cat.percentage}
                        onChange={(e, newValue) => handlePercentageChange(index, newValue)}
                        aria-labelledby="percentage-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        min={0}
                        max={100}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveCategory(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Budget Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the budget template "{selectedTemplate?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Apply Confirmation Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)}>
        <DialogTitle>Apply Budget Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to apply the budget template "{selectedTemplate?.name}" to your categories? This will update the budget amounts for all categories included in this template.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApplyConfirm} color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTemplates;