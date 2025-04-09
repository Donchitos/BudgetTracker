import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  InputAdornment,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import FolderIcon from '@mui/icons-material/Folder';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LabelIcon from '@mui/icons-material/Label';
import SearchIcon from '@mui/icons-material/Search';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ChromePicker } from 'react-color';

/**
 * Advanced Category Manager component for handling categories and subcategories
 */
const AdvancedCategoryManager = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get categories from Redux store
  const categoryState = useSelector(state => state.category);
  const { categories = [], loading = false, error = null } = categoryState || {};
  
  // Local state
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1976d2');
  const [colorAnchorEl, setColorAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'addSub'
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#1976d2',
    icon: 'category',
    parentId: null,
    budget: 0
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Build hierarchical categories and tags list when categories change
  useEffect(() => {
    if (categories) {
      buildHierarchy();
      extractTags();
    }
  }, [categories]);
  
  // Build category hierarchy from flat list
  const buildHierarchy = () => {
    if (!categories) return;
    
    // First, create a map of all categories by ID
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category._id] = {
        ...category,
        subcategories: []
      };
    });
    
    // Then, build the hierarchy
    const rootCategories = [];
    
    categories.forEach(category => {
      if (category.parentId) {
        // This is a subcategory, add it to its parent
        if (categoryMap[category.parentId]) {
          categoryMap[category.parentId].subcategories.push(categoryMap[category._id]);
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryMap[category._id]);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap[category._id]);
      }
    });
    
    setHierarchicalCategories(rootCategories);
  };
  
  // Extract unique tags from categories
  const extractTags = () => {
    if (!categories) return;
    
    const allTags = new Set();
    
    categories.forEach(category => {
      if (category.tags && Array.isArray(category.tags)) {
        category.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    setTags(Array.from(allTags));
  };
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Open dialog to add category
  const handleAddCategory = () => {
    setNewCategory({
      name: '',
      color: '#1976d2',
      icon: 'category',
      parentId: null,
      budget: 0,
      tags: []
    });
    setDialogType('add');
    setDialogOpen(true);
  };
  
  // Open dialog to add subcategory
  const handleAddSubcategory = (parentId) => {
    setNewCategory({
      name: '',
      color: '#1976d2',
      icon: 'category',
      parentId,
      budget: 0,
      tags: []
    });
    setDialogType('addSub');
    setDialogOpen(true);
    setMenuAnchorEl(null);
  };
  
  // Open dialog to edit category
  const handleEditCategory = (category) => {
    setNewCategory({
      _id: category._id,
      name: category.name,
      color: category.color || '#1976d2',
      icon: category.icon || 'category',
      parentId: category.parentId || null,
      budget: category.budget || 0,
      tags: category.tags || []
    });
    setDialogType('edit');
    setDialogOpen(true);
    setMenuAnchorEl(null);
  };
  
  // Close category dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle change in category form fields
  const handleCategoryChange = (field, value) => {
    setNewCategory(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle color picker open
  const handleColorPickerOpen = (event) => {
    setColorAnchorEl(event.currentTarget);
    setColorPickerOpen(true);
  };
  
  // Handle color picker close
  const handleColorPickerClose = () => {
    setColorAnchorEl(null);
    setColorPickerOpen(false);
  };
  
  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    handleCategoryChange('color', color.hex);
  };
  
  // Save new or edited category
  const handleSaveCategory = () => {
    setProcessingAction(true);
    
    // Validate
    if (!newCategory.name) {
      alert('Category name is required');
      setProcessingAction(false);
      return;
    }
    
    // Create action object
    const categoryData = {
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
      parentId: newCategory.parentId,
      budget: parseFloat(newCategory.budget) || 0,
      tags: newCategory.tags || []
    };
    
    // If editing, include the ID
    if (dialogType === 'edit') {
      categoryData._id = newCategory._id;
    }
    
    // This would normally dispatch a Redux action to add/update the category
    // For this implementation, we'll simulate it with a timeout
    setTimeout(() => {
      console.log('Saving category:', categoryData);
      
      // Update state to simulate successful save
      if (dialogType === 'edit') {
        // Simulate updating a category
        const updatedCategories = categories.map(cat => 
          cat._id === categoryData._id ? { ...cat, ...categoryData } : cat
        );
        
        // In a real app, this would be done by the reducer after a successful API call
        // dispatch(updateCategorySuccess(updatedCategories));
      } else {
        // Simulate adding a new category
        const newCat = {
          ...categoryData,
          _id: Date.now().toString(), // Simulated ID
          createdAt: new Date().toISOString()
        };
        
        // In a real app, this would be done by the reducer after a successful API call
        // dispatch(addCategorySuccess([...categories, newCat]));
      }
      
      // Close dialog and reset state
      setDialogOpen(false);
      setProcessingAction(false);
      
      // Rebuild hierarchy after a short delay (simulating redux update)
      setTimeout(() => buildHierarchy(), 100);
    }, 500);
  };
  
  // Open category menu
  const handleOpenMenu = (event, categoryId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCategoryId(categoryId);
  };
  
  // Close category menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedCategoryId(null);
  };
  
  // Open delete confirmation dialog
  const handleDeletePrompt = () => {
    setDeleteDialogOpen(true);
    setMenuAnchorEl(null);
  };
  
  // Delete category
  const handleDeleteCategory = () => {
    setProcessingAction(true);
    
    // This would normally dispatch a Redux action to delete the category
    // For this implementation, we'll simulate it with a timeout
    setTimeout(() => {
      console.log('Deleting category:', selectedCategoryId);
      
      // Simulate deleting a category
      const categoryToDelete = categories.find(cat => cat._id === selectedCategoryId);
      
      if (categoryToDelete) {
        // Find all subcategories
        const subcategories = categories.filter(cat => cat.parentId === selectedCategoryId);
        
        if (subcategories.length > 0) {
          // Handle subcategories (either delete them or move them up)
          // In this implementation, we'll assume they're deleted
        }
        
        // In a real app, this would be done by the reducer after a successful API call
        // dispatch(deleteCategorySuccess(selectedCategoryId));
      }
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setSelectedCategoryId(null);
      setProcessingAction(false);
      
      // Rebuild hierarchy after a short delay (simulating redux update)
      setTimeout(() => buildHierarchy(), 100);
    }, 500);
  };
  
  // Handle drag end (reordering categories)
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId &&
        source.index === destination.index) {
      return;
    }
    
    // Get source and destination category lists
    let sourceList, destList;
    
    if (source.droppableId === 'root') {
      sourceList = [...hierarchicalCategories];
    } else {
      // Find the parent category
      const parentCategory = findCategoryById(source.droppableId);
      if (!parentCategory) return;
      sourceList = [...parentCategory.subcategories];
    }
    
    if (destination.droppableId === 'root') {
      destList = [...hierarchicalCategories];
    } else {
      // Find the parent category
      const parentCategory = findCategoryById(destination.droppableId);
      if (!parentCategory) return;
      destList = [...parentCategory.subcategories];
    }
    
    // Get the item being dragged
    const [removed] = sourceList.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      sourceList.splice(destination.index, 0, removed);
      
      // Update state
      if (source.droppableId === 'root') {
        setHierarchicalCategories(sourceList);
      } else {
        // Find and update the parent category
        const updatedHierarchy = updateSubcategoriesInHierarchy(
          hierarchicalCategories,
          source.droppableId,
          sourceList
        );
        setHierarchicalCategories(updatedHierarchy);
      }
    } else {
      // Moving between different lists
      
      // If moving to a different parent, update the parentId
      if (destination.droppableId !== 'root') {
        removed.parentId = destination.droppableId;
      } else {
        // If moving to root, remove parentId
        removed.parentId = null;
      }
      
      // Add to destination list
      destList.splice(destination.index, 0, removed);
      
      // Update state for both source and destination
      let updatedHierarchy = hierarchicalCategories;
      
      if (source.droppableId === 'root') {
        updatedHierarchy = sourceList;
      } else {
        updatedHierarchy = updateSubcategoriesInHierarchy(
          updatedHierarchy,
          source.droppableId,
          sourceList
        );
      }
      
      if (destination.droppableId === 'root') {
        updatedHierarchy = destList;
      } else {
        updatedHierarchy = updateSubcategoriesInHierarchy(
          updatedHierarchy,
          destination.droppableId,
          destList
        );
      }
      
      setHierarchicalCategories(updatedHierarchy);
      
      // In a real app, this would dispatch an action to update the backend
      console.log('Category moved, new hierarchy:', updatedHierarchy);
    }
  };
  
  // Helper function to find a category by ID
  const findCategoryById = (categoryId) => {
    // Check root categories
    for (const category of hierarchicalCategories) {
      if (category._id === categoryId) {
        return category;
      }
      
      // Check subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        for (const subcat of category.subcategories) {
          if (subcat._id === categoryId) {
            return subcat;
          }
        }
      }
    }
    
    return null;
  };
  
  // Helper function to update subcategories in hierarchy
  const updateSubcategoriesInHierarchy = (hierarchy, parentId, newSubcategories) => {
    return hierarchy.map(category => {
      if (category._id === parentId) {
        return {
          ...category,
          subcategories: newSubcategories
        };
      }
      
      if (category.subcategories && category.subcategories.length > 0) {
        return {
          ...category,
          subcategories: updateSubcategoriesInHierarchy(
            category.subcategories,
            parentId,
            newSubcategories
          )
        };
      }
      
      return category;
    });
  };
  
  // Tag management
  const handleOpenTagDialog = () => {
    setTagDialogOpen(true);
  };
  
  const handleCloseTagDialog = () => {
    setTagDialogOpen(false);
  };
  
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };
  
  // Filter categories based on search query
  const filteredCategories = searchQuery ? 
    hierarchicalCategories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.tags && category.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    ) : 
    hierarchicalCategories;
  
  // Render a category item
  const renderCategoryItem = (category, index, level = 0, parentId = 'root') => {
    const isExpanded = expandedCategories.includes(category._id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    
    return (
      <div key={category._id}>
        <Draggable draggableId={category._id} index={index}>
          {(provided, snapshot) => (
            <ListItem
              ref={provided.innerRef}
              {...provided.draggableProps}
              sx={{
                pl: 2 * level,
                bgcolor: snapshot.isDragging ? 
                  theme.palette.action.hover : 
                  level > 0 ? alpha(theme.palette.background.default, 0.5) : 'inherit',
                borderLeft: level > 0 ? 
                  `2px solid ${theme.palette.divider}` : 
                  'none',
                '&:hover': {
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              <ListItemIcon {...provided.dragHandleProps}>
                <DragIndicatorIcon />
              </ListItemIcon>
              
              <ListItemIcon>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: category.color || theme.palette.primary.main,
                    color: 'white'
                  }}
                >
                  {level > 0 ? (
                    <SubdirectoryArrowRightIcon fontSize="small" />
                  ) : (
                    <CategoryIcon fontSize="small" />
                  )}
                </Box>
              </ListItemIcon>
              
              <ListItemText
                primary={category.name}
                secondary={
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {category.tags && category.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                      />
                    ))}
                    
                    {category.budget > 0 && (
                      <Chip
                        label={`Budget: $${category.budget}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                      />
                    )}
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                {hasSubcategories && (
                  <IconButton 
                    edge="end" 
                    onClick={() => toggleCategoryExpansion(category._id)}
                    sx={{ mr: 1 }}
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
                
                <IconButton edge="end" onClick={(e) => handleOpenMenu(e, category._id)}>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )}
        </Draggable>
        
        {/* Render subcategories if expanded */}
        {hasSubcategories && isExpanded && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Droppable droppableId={category._id}>
              {(provided) => (
                <List
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  component="div"
                  disablePadding
                >
                  {category.subcategories.map((subcat, subIndex) => 
                    renderCategoryItem(subcat, subIndex, level + 1, category._id)
                  )}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </Collapse>
        )}
      </div>
    );
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          Category Manager
        </Typography>
        
        <Box>
          <Tooltip title="Manage Tags">
            <IconButton 
              color="inherit"
              onClick={handleOpenTagDialog}
              sx={{ mr: 1 }}
            >
              <LabelIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
          >
            Add Category
          </Button>
        </Box>
      </Box>
      
      {/* Search and filter */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <TextField
          fullWidth
          placeholder="Search categories by name or tags..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      {/* Categories list */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="root">
              {(provided) => (
                <List
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ 
                    width: '100%', 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {filteredCategories.map((category, index) => 
                    renderCategoryItem(category, index)
                  )}
                  {provided.placeholder}
                  
                  {filteredCategories.length === 0 && (
                    <ListItem>
                      <ListItemText 
                        primary={
                          searchQuery ? 
                            "No categories match your search" : 
                            "No categories yet"
                        } 
                        sx={{ textAlign: 'center', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Box>
      
      {/* Category action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const category = findCategoryById(selectedCategoryId);
          if (category) handleEditCategory(category);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={() => handleAddSubcategory(selectedCategoryId)}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add Subcategory" />
        </MenuItem>
        <MenuItem onClick={handleDeletePrompt} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
      
      {/* Category form dialog */}
      <Dialog
        open={dialogOpen}
        onClose={processingAction ? null : handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Add Category' : 
           dialogType === 'edit' ? 'Edit Category' : 
           'Add Subcategory'}
          
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            disabled={processingAction}
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Category Name"
                value={newCategory.name}
                onChange={(e) => handleCategoryChange('name', e.target.value)}
                fullWidth
                required
                disabled={processingAction}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Parent Category</InputLabel>
                <Select
                  value={newCategory.parentId || ''}
                  onChange={(e) => handleCategoryChange('parentId', e.target.value || null)}
                  label="Parent Category"
                  disabled={dialogType === 'addSub' || processingAction}
                >
                  <MenuItem value="">
                    <em>None (Top Level)</em>
                  </MenuItem>
                  {categories && categories
                    .filter(cat => cat._id !== newCategory._id) // Can't be its own parent
                    .map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {dialogType === 'addSub' ? 
                    `Will be added under ${categories?.find(c => c._id === newCategory.parentId)?.name || 'selected category'}` : 
                    'Select a parent category or leave empty for top level'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Budget"
                type="number"
                value={newCategory.budget}
                onChange={(e) => handleCategoryChange('budget', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={processingAction}
                helperText="Monthly budget amount (0 for no budget)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleColorPickerOpen}
                startIcon={<ColorLensIcon />}
                style={{ backgroundColor: alpha(newCategory.color, 0.1) }}
                disabled={processingAction}
              >
                Color: {newCategory.color}
              </Button>
              <Popover
                open={colorPickerOpen}
                anchorEl={colorAnchorEl}
                onClose={handleColorPickerClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <ChromePicker
                  color={selectedColor}
                  onChange={handleColorChange}
                  disableAlpha
                />
              </Popover>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Icon Name"
                value={newCategory.icon}
                onChange={(e) => handleCategoryChange('icon', e.target.value)}
                fullWidth
                helperText="Material icon name (e.g., 'category', 'home', etc.)"
                disabled={processingAction}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={tags}
                value={newCategory.tags || []}
                onChange={(event, newValue) => handleCategoryChange('tags', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      disabled={processingAction}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags"
                    helperText="Press Enter to add a new tag"
                    disabled={processingAction}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            color="primary"
            startIcon={processingAction ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={processingAction}
          >
            {processingAction ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={processingAction ? null : () => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this category?
            {findCategoryById(selectedCategoryId)?.subcategories?.length > 0 && (
              <Box component="span" sx={{ display: 'block', color: 'error.main', mt: 1 }}>
                Warning: This category has subcategories that will also be deleted.
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCategory} 
            variant="contained" 
            color="error"
            startIcon={processingAction ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={processingAction}
          >
            {processingAction ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Tag management dialog */}
      <Dialog
        open={tagDialogOpen}
        onClose={handleCloseTagDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Tags
          <IconButton
            aria-label="close"
            onClick={handleCloseTagDialog}
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
          <Typography variant="subtitle1" gutterBottom>
            Add New Tag
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 3 }}>
            <TextField
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            
            <Button
              variant="contained"
              onClick={handleAddTag}
              disabled={!newTag}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Existing Tags
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                color="primary"
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))}
            
            {tags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No tags added yet
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseTagDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdvancedCategoryManager;