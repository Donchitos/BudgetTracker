import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import { HexColorPicker } from 'react-colorful';

// Import Redux actions
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../../redux/actions/categoryActions';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1976d2', // Default color
    budget: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  // Load categories when component mounts
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);
  
  // Handle dialog open for adding category
  const handleAddOpen = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      color: '#1976d2',
      budget: 0
    });
    setFormErrors({});
    setOpenDialog(true);
  };
  
  // Handle dialog open for editing category
  const handleEditOpen = (category) => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      budget: category.budget || 0
    });
    setFormErrors({});
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleClose = () => {
    setOpenDialog(false);
    setColorPickerOpen(false);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'budget' ? parseFloat(value) || 0 : value 
    }));
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle color change
  const handleColorChange = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    if (!formData.color) {
      errors.color = 'Color is required';
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
      if (dialogMode === 'add') {
        await dispatch(addCategory(formData));
      } else {
        await dispatch(updateCategory(selectedCategory._id, formData));
      }
      
      handleClose();
      // Refresh category list
      dispatch(getCategories());
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };
  
  // Handle category deletion
  const handleDelete = async (categoryId) => {
    try {
      await dispatch(deleteCategory(categoryId));
      // Refresh category list
      dispatch(getCategories());
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };
  
  // Format currency for budget display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (loading && !categories.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Categories
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          Add Category
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper>
        {categories.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No categories found. Create your first category to get started!
            </Typography>
          </Box>
        ) : (
          <List>
            {categories.map((category, index) => (
              <React.Fragment key={category._id}>
                {index > 0 && <Divider component="li" />}
                <ListItem>
                  <ListItemIcon>
                    <Box 
                      sx={{ 
                        bgcolor: category.color, 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                      }}
                    >
                      <CategoryIcon sx={{ color: '#fff' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name}
                    secondary={category.budget > 0 ? `Budget: ${formatCurrency(category.budget)}` : 'No budget set'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleEditOpen(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(category._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Category' : 'Edit Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Color
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: formData.color, 
                    width: '100%', 
                    height: 40, 
                    borderRadius: 1,
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    mb: 1
                  }}
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                />
                {colorPickerOpen && (
                  <Box sx={{ mt: 1 }}>
                    <HexColorPicker color={formData.color} onChange={handleColorChange} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="budget"
                  name="budget"
                  label="Monthly Budget (Optional)"
                  type="number"
                  fullWidth
                  value={formData.budget}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 10 }}
                  helperText="Set a monthly budget for this category"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;