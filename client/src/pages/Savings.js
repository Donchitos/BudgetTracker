import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DateRangeIcon from '@mui/icons-material/DateRange';

import SavingsGoalCard from '../components/savings/SavingsGoalCard';
import SavingsGoalForm from '../components/savings/SavingsGoalForm';
import ContributionForm from '../components/savings/ContributionForm';

import { getCategories } from '../redux/actions/categoryActions';
import {
  getSavingsGoals,
  getSavingsSummary,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addContribution
} from '../redux/actions/savingsActions';

// Styled progress bar
const StyledLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 10,
  borderRadius: 5,
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    backgroundColor: value >= 100 ? theme.palette.success.main :
                    value >= 75 ? theme.palette.success.light :
                    value >= 50 ? theme.palette.warning.light :
                    theme.palette.error.light,
  },
}));

const Savings = () => {
  const dispatch = useDispatch();
  const { savingsGoals, summary, loading, error } = useSelector(state => state.savings);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionFormOpen, setContributionFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('Add Savings Goal');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    isCompleted: 'all',
    priority: 'all',
    category: '',
    sortBy: 'targetDate:asc'
  });
  
  // Load data when component mounts
  useEffect(() => {
    dispatch(getCategories());
    fetchSavingsData();
  }, [dispatch]);
  
  // Fetch savings data with filters
  const fetchSavingsData = async () => {
    try {
      const queryParams = {};
      
      if (filters.isCompleted !== 'all') {
        queryParams.isCompleted = filters.isCompleted === 'completed';
      }
      
      if (filters.priority !== 'all') {
        queryParams.priority = filters.priority;
      }
      
      if (filters.category) {
        queryParams.category = filters.category;
      }
      
      if (filters.sortBy) {
        queryParams.sortBy = filters.sortBy;
      }
      
      dispatch(getSavingsGoals(queryParams));
      dispatch(getSavingsSummary());
    } catch (err) {
      console.error('Error fetching savings data:', err);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    fetchSavingsData();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      isCompleted: 'all',
      priority: 'all',
      category: '',
      sortBy: 'targetDate:asc'
    });
  };
  
  // Handle opening form for adding a new goal
  const handleAddClick = () => {
    setSelectedGoal(null);
    setFormTitle('Add Savings Goal');
    setGoalFormOpen(true);
  };
  
  // Handle opening form for editing a goal
  const handleEditClick = (goal) => {
    setSelectedGoal(goal);
    setFormTitle('Edit Savings Goal');
    setGoalFormOpen(true);
  };
  
  // Handle opening contribution form
  const handleContributeClick = (goal) => {
    setSelectedGoal(goal);
    setContributionFormOpen(true);
  };
  
  // Handle deleting a goal
  const handleDeleteClick = (goal) => {
    setSelectedGoal(goal);
    setDeleteConfirmOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteSavingsGoal(selectedGoal._id));
      setDeleteConfirmOpen(false);
      fetchSavingsData();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };
  
  // Handle form submission for adding/editing a goal
  const handleGoalSubmit = async (goalData) => {
    try {
      if (selectedGoal) {
        // Update existing goal
        await dispatch(updateSavingsGoal(selectedGoal._id, goalData));
      } else {
        // Add new goal
        await dispatch(addSavingsGoal(goalData));
      }
      
      setGoalFormOpen(false);
      fetchSavingsData();
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  };
  
  // Handle contribution submission
  const handleContributionSubmit = async (contributionData) => {
    try {
      await dispatch(addContribution(selectedGoal._id, contributionData));
      setContributionFormOpen(false);
      fetchSavingsData();
    } catch (err) {
      console.error('Error adding contribution:', err);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Filter goals for display
  const getFilteredGoals = () => {
    if (!savingsGoals || !Array.isArray(savingsGoals)) return [];
    
    let filtered = [...savingsGoals];
    
    // Apply client-side filtering (for UI display only)
    if (filters.isCompleted !== 'all') {
      filtered = filtered.filter(goal => 
        goal.isCompleted === (filters.isCompleted === 'completed')
      );
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(goal => 
        goal.priority === filters.priority
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(goal => 
        goal.category && goal.category._id === filters.category
      );
    }
    
    return filtered;
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Savings Goals
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Goal
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Total Saved
              </Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {formatCurrency(summary.totalSaved)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Overall Progress:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {summary.overallProgress}%
                </Typography>
              </Box>
              <StyledLinearProgress variant="determinate" value={summary.overallProgress} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="info.main">
                Goals Summary
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AddIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  {summary.totalGoals} Total Goals
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography>
                  {summary.completedGoals} Completed
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon color="warning" sx={{ mr: 1 }} />
                <Typography>
                  {summary.upcomingGoals} Upcoming (due in 30 days)
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="error">
                Target Amount
              </Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {formatCurrency(summary.totalTargets)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalAtmIcon color="error" sx={{ mr: 1 }} />
                <Typography>
                  {formatCurrency(summary.totalTargets - summary.totalSaved)} still needed
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              name="isCompleted"
              value={filters.isCompleted}
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Goals</MenuItem>
              <MenuItem value="active">Active Goals</MenuItem>
              <MenuItem value="completed">Completed Goals</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="low">Low Priority</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="targetDate:asc">Due Date (Earliest)</MenuItem>
              <MenuItem value="targetDate:desc">Due Date (Latest)</MenuItem>
              <MenuItem value="targetAmount:asc">Target Amount (Low-High)</MenuItem>
              <MenuItem value="targetAmount:desc">Target Amount (High-Low)</MenuItem>
              <MenuItem value="currentAmount:desc">Progress (Highest)</MenuItem>
              <MenuItem value="priority:desc">Priority (Highest)</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={applyFilters}
                fullWidth
              >
                Apply
              </Button>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Savings Goals Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : getFilteredGoals().length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No savings goals found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create your first savings goal to start tracking your progress!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add First Goal
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {getFilteredGoals().map(goal => (
            <Grid item xs={12} sm={6} md={4} key={goal._id}>
              <SavingsGoalCard
                goal={goal}
                onContribute={handleContributeClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Forms and Dialogs */}
      <SavingsGoalForm
        open={goalFormOpen}
        onClose={() => setGoalFormOpen(false)}
        onSubmit={handleGoalSubmit}
        initialValues={selectedGoal}
        title={formTitle}
      />
      
      <ContributionForm
        open={contributionFormOpen}
        onClose={() => setContributionFormOpen(false)}
        onSubmit={handleContributionSubmit}
        goal={selectedGoal}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Savings Goal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the savings goal "{selectedGoal?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Savings;