import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

import BillList from '../components/bills/BillList';
import BillForm from '../components/bills/BillForm';
import { getCategories } from '../redux/actions/categoryActions';
import { 
  addBill, 
  updateBill, 
  getUpcomingBills, 
  getOverdueBills 
} from '../redux/actions/billActions';

const Bills = () => {
  const dispatch = useDispatch();
  const { upcomingBills, overdueBills, error } = useSelector(state => state.bills);
  
  // Local state
  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formTitle, setFormTitle] = useState('Add Bill');
  
  // Load categories and alerts when component mounts
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getUpcomingBills(7)); // Get bills due in the next 7 days
    dispatch(getOverdueBills());
  }, [dispatch]);
  
  // Handle opening form for adding a new bill
  const handleAddClick = () => {
    setEditingBill(null);
    setFormTitle('Add Bill');
    setFormOpen(true);
  };
  
  // Handle opening form for editing a bill
  const handleEditClick = (bill) => {
    setEditingBill(bill);
    setFormTitle('Edit Bill');
    setFormOpen(true);
  };
  
  // Handle form submission for adding/editing a bill
  const handleFormSubmit = async (billData) => {
    try {
      if (editingBill) {
        // Update existing bill
        await dispatch(updateBill(editingBill._id, billData));
      } else {
        // Add new bill
        await dispatch(addBill(billData));
      }
      
      // Close form and refresh alerts
      setFormOpen(false);
      dispatch(getUpcomingBills(7));
      dispatch(getOverdueBills());
    } catch (err) {
      console.error('Error saving bill:', err);
    }
  };
  
  // Format date
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bills
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Bill
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Bill Alerts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Overdue Bills */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" color="error">
                Overdue Bills
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {overdueBills && overdueBills.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No overdue bills
              </Typography>
            ) : (
              <Stack spacing={1}>
                {overdueBills && overdueBills.map(bill => (
                  <Chip
                    key={bill._id}
                    label={`${bill.name} - ${formatDueDate(bill.dueDate)} - $${bill.amount}`}
                    color="error"
                    onClick={() => handleEditClick(bill)}
                    sx={{ justifyContent: 'flex-start', maxWidth: '100%' }}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        
        {/* Upcoming Bills */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" color="warning.main">
                Due Soon
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {upcomingBills && upcomingBills.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming bills in the next 7 days
              </Typography>
            ) : (
              <Stack spacing={1}>
                {upcomingBills && upcomingBills.map(bill => (
                  <Chip
                    key={bill._id}
                    label={`${bill.name} - ${formatDueDate(bill.dueDate)} - $${bill.amount}`}
                    color="warning"
                    onClick={() => handleEditClick(bill)}
                    sx={{ justifyContent: 'flex-start', maxWidth: '100%' }}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Bill List Section */}
      <BillList onEdit={handleEditClick} />
      
      {/* Bill Form */}
      <BillForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingBill}
        title={formTitle}
      />
    </Box>
  );
};

export default Bills;