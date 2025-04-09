import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Paper,
  Divider,
  Chip,
  FormControlLabel,
  Grid,
  useTheme,
  Zoom,
  Slide,
  Collapse
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StarIcon from '@mui/icons-material/Star';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * Component that allows users to customize their dashboard layout
 */
const DashboardCustomizer = ({ onLayoutChange }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Available dashboard components
  const availableComponents = [
    { 
      id: 'summary_cards', 
      name: 'Summary Cards', 
      icon: <AccountBalanceWalletIcon />,
      description: 'Shows your current income, expenses, and balance',
      defaultVisible: true,
      defaultOrder: 0
    },
    { 
      id: 'bill_reminders', 
      name: 'Bill Reminders', 
      icon: <DateRangeIcon />,
      description: 'Upcoming bills that need to be paid',
      defaultVisible: true,
      defaultOrder: 1
    },
    { 
      id: 'category_budget_alerts', 
      name: 'Budget Alerts', 
      icon: <NotificationsIcon />,
      description: 'Alerts when categories approach or exceed budget limits',
      defaultVisible: true,
      defaultOrder: 2
    },
    { 
      id: 'recent_transactions', 
      name: 'Recent Transactions', 
      icon: <ListAltIcon />,
      description: 'Your most recent financial transactions',
      defaultVisible: true,
      defaultOrder: 3
    },
    { 
      id: 'expense_pie_chart', 
      name: 'Expense Breakdown', 
      icon: <PieChartIcon />,
      description: 'Pie chart showing expenses by category',
      defaultVisible: true,
      defaultOrder: 4
    },
    { 
      id: 'spending_trends_chart', 
      name: 'Spending Trends', 
      icon: <ShowChartIcon />,
      description: 'Chart showing spending trends over time',
      defaultVisible: true,
      defaultOrder: 5
    },
    { 
      id: 'budget_vs_actual_chart', 
      name: 'Budget vs. Actual', 
      icon: <CompareArrowsIcon />,
      description: 'Comparison of budgeted and actual spending',
      defaultVisible: true,
      defaultOrder: 6
    },
    { 
      id: 'savings_goal_dashboard', 
      name: 'Savings Goals', 
      icon: <StarIcon />,
      description: 'Progress towards your savings goals',
      defaultVisible: true,
      defaultOrder: 7
    }
  ];
  
  // State for dashboard layout
  const [dashboardLayout, setDashboardLayout] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [layoutPresets, setLayoutPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);
  
  // Load dashboard layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setDashboardLayout(parsedLayout);
      } catch (e) {
        console.error('Error parsing dashboard layout', e);
        setDashboardLayout(getDefaultLayout());
      }
    } else {
      setDashboardLayout(getDefaultLayout());
    }
    
    // Load layout presets
    const savedPresets = localStorage.getItem('dashboardLayoutPresets');
    if (savedPresets) {
      try {
        const parsedPresets = JSON.parse(savedPresets);
        setLayoutPresets(parsedPresets);
      } catch (e) {
        console.error('Error parsing dashboard layout presets', e);
        setLayoutPresets([]);
      }
    }
    
    // Load active preset
    const savedActivePreset = localStorage.getItem('dashboardActivePreset');
    if (savedActivePreset) {
      setActivePreset(savedActivePreset);
    }
  }, []);
  
  // Notify parent component of layout changes
  useEffect(() => {
    if (dashboardLayout.length > 0) {
      // Get only visible components
      const visibleComponents = dashboardLayout
        .filter(item => item.visible)
        .sort((a, b) => a.order - b.order)
        .map(item => item.id);
      
      onLayoutChange(visibleComponents);
    }
  }, [dashboardLayout, onLayoutChange]);
  
  // Get default layout from availableComponents
  const getDefaultLayout = () => {
    return availableComponents.map(component => ({
      id: component.id,
      visible: component.defaultVisible,
      order: component.defaultOrder
    }));
  };
  
  // Open settings menu
  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  
  // Close settings menu
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  
  // Open customization dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
    handleSettingsClose();
  };
  
  // Close customization dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    
    // If there are unsaved changes, ask for confirmation
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        // Reset to saved layout
        const savedLayout = localStorage.getItem('dashboardLayout');
        if (savedLayout) {
          try {
            const parsedLayout = JSON.parse(savedLayout);
            setDashboardLayout(parsedLayout);
          } catch (e) {
            console.error('Error parsing dashboard layout', e);
          }
        }
        setHasChanges(false);
      } else {
        // Keep dialog open
        setDialogOpen(true);
        return;
      }
    }
  };
  
  // Toggle component visibility
  const handleToggleVisibility = (componentId) => {
    setDashboardLayout(prevLayout => {
      const newLayout = prevLayout.map(item => {
        if (item.id === componentId) {
          return { ...item, visible: !item.visible };
        }
        return item;
      });
      setHasChanges(true);
      return newLayout;
    });
  };
  
  // Handle drag end (reordering)
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(dashboardLayout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setDashboardLayout(updatedItems);
    setHasChanges(true);
  };
  
  // Reset to default layout
  const handleResetDefault = () => {
    if (window.confirm('Are you sure you want to reset to the default layout?')) {
      const defaultLayout = getDefaultLayout();
      setDashboardLayout(defaultLayout);
      setHasChanges(true);
    }
  };
  
  // Save current layout
  const handleSaveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
    setHasChanges(false);
    
    // Update active preset if one is selected
    if (activePreset) {
      const updatedPresets = layoutPresets.map(preset => {
        if (preset.id === activePreset) {
          return { ...preset, layout: [...dashboardLayout] };
        }
        return preset;
      });
      
      setLayoutPresets(updatedPresets);
      localStorage.setItem('dashboardLayoutPresets', JSON.stringify(updatedPresets));
    }
    
    // Close dialog
    setDialogOpen(false);
  };
  
  // Save as new preset
  const handleSaveAsPreset = () => {
    const presetName = prompt('Enter a name for this layout preset:');
    if (!presetName) return;
    
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      layout: [...dashboardLayout],
      createdAt: new Date().toISOString()
    };
    
    const updatedPresets = [...layoutPresets, newPreset];
    setLayoutPresets(updatedPresets);
    setActivePreset(newPreset.id);
    
    localStorage.setItem('dashboardLayoutPresets', JSON.stringify(updatedPresets));
    localStorage.setItem('dashboardActivePreset', newPreset.id);
    
    // Save current layout
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
    setHasChanges(false);
  };
  
  // Load a preset
  const handleLoadPreset = (presetId) => {
    const preset = layoutPresets.find(p => p.id === presetId);
    if (preset) {
      setDashboardLayout(preset.layout);
      setActivePreset(preset.id);
      localStorage.setItem('dashboardActivePreset', preset.id);
      localStorage.setItem('dashboardLayout', JSON.stringify(preset.layout));
      setHasChanges(false);
    }
  };
  
  // Delete a preset
  const handleDeletePreset = (presetId) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      const updatedPresets = layoutPresets.filter(p => p.id !== presetId);
      setLayoutPresets(updatedPresets);
      
      localStorage.setItem('dashboardLayoutPresets', JSON.stringify(updatedPresets));
      
      // If deleted preset was active, set active to null
      if (activePreset === presetId) {
        setActivePreset(null);
        localStorage.removeItem('dashboardActivePreset');
      }
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {activePreset && (
          <Chip
            label={`Layout: ${layoutPresets.find(p => p.id === activePreset)?.name || 'Custom'}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
        )}
        
        <Tooltip title="Dashboard Settings">
          <IconButton onClick={handleSettingsClick} color="primary">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
        >
          <MenuItem onClick={handleOpenDialog}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Customize Dashboard" />
          </MenuItem>
          
          <Divider />
          
          {layoutPresets.length > 0 && (
            <>
              <Typography variant="caption" sx={{ pl: 2, opacity: 0.7 }}>
                Saved Layouts
              </Typography>
              
              {layoutPresets.map(preset => (
                <MenuItem
                  key={preset.id}
                  onClick={() => {
                    handleLoadPreset(preset.id);
                    handleSettingsClose();
                  }}
                  selected={activePreset === preset.id}
                >
                  <ListItemIcon>
                    {activePreset === preset.id ? (
                      <DoneIcon fontSize="small" />
                    ) : (
                      <InsertChartIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={preset.name} />
                </MenuItem>
              ))}
              
              <Divider />
            </>
          )}
          
          <MenuItem onClick={handleResetDefault}>
            <ListItemIcon>
              <RestoreIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Reset to Default" />
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Customization Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Customize Dashboard
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1" gutterBottom>
                Arrange and Toggle Dashboard Widgets
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Drag to reorder widgets, toggle visibility with the switch
                </Typography>
              </Paper>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="dashboard-components">
                  {(provided) => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      component={Paper}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      {dashboardLayout
                        .sort((a, b) => a.order - b.order)
                        .map((item, index) => {
                          const componentInfo = availableComponents.find(c => c.id === item.id);
                          
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{
                                    userSelect: 'none',
                                    backgroundColor: snapshot.isDragging
                                      ? theme.palette.action.hover
                                      : 'transparent',
                                    '&:not(:last-child)': {
                                      borderBottom: `1px solid ${theme.palette.divider}`
                                    }
                                  }}
                                >
                                  <ListItemIcon {...provided.dragHandleProps}>
                                    <DragHandleIcon />
                                  </ListItemIcon>
                                  
                                  <ListItemIcon>
                                    {componentInfo?.icon}
                                  </ListItemIcon>
                                  
                                  <ListItemText
                                    primary={componentInfo?.name || item.id}
                                    secondary={componentInfo?.description}
                                    sx={{
                                      opacity: item.visible ? 1 : 0.5
                                    }}
                                  />
                                  
                                  <ListItemSecondaryAction>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          edge="end"
                                          checked={item.visible}
                                          onChange={() => handleToggleVisibility(item.id)}
                                        />
                                      }
                                      label={item.visible ? "Visible" : "Hidden"}
                                    />
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle1" gutterBottom>
                Saved Layout Presets
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAsPreset}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Save Current Layout as Preset
                </Button>
                
                {layoutPresets.length > 0 ? (
                  <List>
                    {layoutPresets.map(preset => (
                      <ListItem
                        key={preset.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeletePreset(preset.id)}
                            size="small"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: activePreset === preset.id
                            ? `${theme.palette.primary.main}10`
                            : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          {activePreset === preset.id ? (
                            <DoneIcon color="primary" />
                          ) : (
                            <InsertChartIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={preset.name}
                          secondary={`Created ${new Date(preset.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No saved layout presets yet. Save your custom layout to create one.
                  </Typography>
                )}
              </Paper>
              
              <Typography variant="subtitle1" gutterBottom>
                Preview
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, height: '200px', overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {dashboardLayout
                    .filter(item => item.visible)
                    .sort((a, b) => a.order - b.order)
                    .map(item => {
                      const componentInfo = availableComponents.find(c => c.id === item.id);
                      
                      return (
                        <Grid item xs={4} key={item.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              textAlign: 'center',
                              height: '60px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {componentInfo?.icon}
                            <Typography variant="caption" noWrap>
                              {componentInfo?.name}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleResetDefault} startIcon={<RestoreIcon />}>
            Reset to Default
          </Button>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveLayout}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardCustomizer;