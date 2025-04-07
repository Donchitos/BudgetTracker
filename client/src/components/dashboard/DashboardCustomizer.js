import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * Dashboard Customizer
 * 
 * Allows users to customize their dashboard by:
 * 1. Reordering dashboard widgets
 * 2. Showing/hiding specific widgets
 * 3. Saving preferences for future sessions
 */
const DashboardCustomizer = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  
  // Default dashboard widgets configuration
  const defaultWidgets = [
    { id: 'summary-cards', name: 'Summary Cards', visible: true },
    { id: 'recent-transactions', name: 'Recent Transactions', visible: true },
    { id: 'expense-chart', name: 'Expense Breakdown', visible: true },
    { id: 'budget-vs-actual', name: 'Budget vs. Actual', visible: true },
    { id: 'category-alerts', name: 'Category Budget Alerts', visible: true },
    { id: 'bill-reminders', name: 'Bill Reminders', visible: true },
    { id: 'savings-goals', name: 'Savings Goals', visible: true },
    { id: 'spending-trends', name: 'Spending Trends', visible: true }
  ];
  
  // State for widget configuration
  const [widgets, setWidgets] = useState(defaultWidgets);
  
  // Handle dialog open/close
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  // Load saved dashboard preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      try {
        setWidgets(JSON.parse(savedPreferences));
      } catch (err) {
        console.error('Error loading dashboard preferences:', err);
      }
    }
  }, []);
  
  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };
  
  // Toggle widget visibility
  const toggleWidgetVisibility = (id) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    ));
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    setWidgets(defaultWidgets);
  };
  
  // Save preferences
  const savePreferences = () => {
    try {
      localStorage.setItem('dashboardPreferences', JSON.stringify(widgets));
      // You could also save to the database via an API call if needed
      handleClose();
      
      // Dispatch event to update dashboard layout
      // This assumes you have a Redux action for updating dashboard layout
      // dispatch(updateDashboardLayout(widgets));
      
      // For now, we'll use a direct approach of reloading the dashboard components
      window.dispatchEvent(new CustomEvent('dashboardPreferencesUpdated', { 
        detail: { widgets } 
      }));
    } catch (err) {
      console.error('Error saving dashboard preferences:', err);
    }
  };
  
  return (
    <>
      <Tooltip title="Customize Dashboard">
        <IconButton 
          color="primary" 
          onClick={handleOpen}
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Customize Dashboard
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Drag to reorder widgets or toggle visibility
          </Typography>
          
          <Paper variant="outlined" sx={{ mt: 2, mb: 3 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="dashboard-widgets">
                {(provided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {widgets.map((widget, index) => (
                      <Draggable 
                        key={widget.id} 
                        draggableId={widget.id} 
                        index={index}
                      >
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            secondaryAction={
                              <Switch
                                edge="end"
                                checked={widget.visible}
                                onChange={() => toggleWidgetVisibility(widget.id)}
                                color="primary"
                              />
                            }
                          >
                            <ListItemIcon>
                              <DragIndicatorIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={widget.name}
                              secondary={widget.visible ? 'Visible' : 'Hidden'} 
                            />
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {widget.visible ? 
                                <VisibilityIcon color="primary" /> : 
                                <VisibilityOffIcon color="disabled" />
                              }
                            </ListItemIcon>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
          
          <Typography variant="body2" color="text.secondary">
            Changes will be saved to your browser and applied immediately to your dashboard.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={resetToDefaults} color="inherit">
            Reset to Defaults
          </Button>
          <Button 
            onClick={savePreferences} 
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DashboardCustomizer;