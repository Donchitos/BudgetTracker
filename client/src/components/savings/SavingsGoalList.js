import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stack,
  Alert,
  Paper,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SavingsGoalForm from './SavingsGoalForm';
import ContributionForm from './ContributionForm';
import { format, differenceInDays, addDays } from 'date-fns';

const SavingsGoalList = ({
  savingsGoals = [],
  loading = false,
  error = null,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddContribution,
  onChangeGoalStatus
}) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [contributionFormOpen, setContributionFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [actionGoal, setActionGoal] = useState(null);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Get progress percentage
  const getProgressPercentage = (goal) => {
    if (!goal || goal.targetAmount <= 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };
  
  // Get remaining days
  const getRemainingDays = (goal) => {
    if (!goal || !goal.targetDate) return 0;
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    return Math.max(0, differenceInDays(targetDate, today));
  };
  
  // Get color based on progress and time remaining
  const getProgressColor = (goal) => {
    const progressPercentage = getProgressPercentage(goal);
    const daysRemaining = getRemainingDays(goal);
    
    // If completed or almost completed, show success
    if (progressPercentage >= 95) {
      return 'success';
    }
    
    // If days remaining is 0, show error
    if (daysRemaining === 0) {
      return 'error';
    }
    
    // Calculate expected progress based on time elapsed
    const totalDays = differenceInDays(
      new Date(goal.targetDate),
      new Date(goal.startDate)
    );
    
    const daysElapsed = totalDays - daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    
    // If actual progress is significantly behind expected, show warning or error
    if (progressPercentage < expectedProgress * 0.7) {
      return 'error';
    }
    
    if (progressPercentage < expectedProgress * 0.9) {
      return 'warning';
    }
    
    return 'primary';
  };
  
  // Handle opening the new/edit form
  const handleOpenForm = (goal = null) => {
    setSelectedGoal(goal);
    setFormOpen(true);
    setActionMenu(null);
  };
  
  // Handle opening the contribution form
  const handleOpenContributionForm = (goal) => {
    setSelectedGoal(goal);
    setContributionFormOpen(true);
    setActionMenu(null);
  };
  
  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedGoal) {
        await onUpdateGoal(selectedGoal._id, formData);
      } else {
        await onCreateGoal(formData);
      }
      setFormOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedGoal) return;
    
    try {
      await onDeleteGoal(selectedGoal._id);
      setDeleteConfirmOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };
  
  // Handle contribution submission
  const handleContributionSubmit = async (contributionData) => {
    if (!selectedGoal) return;
    
    try {
      await onAddContribution(selectedGoal._id, contributionData);
      setContributionFormOpen(false);
    } catch (err) {
      console.error('Error adding contribution:', err);
    }
  };
  
  // Handle goal completion
  const handleCompleteGoal = async () => {
    if (!selectedGoal) return;
    
    try {
      await onChangeGoalStatus(selectedGoal._id, 'completed');
      setCompleteConfirmOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error completing goal:', err);
    }
  };
  
  // Handle goal cancellation
  const handleCancelGoal = async () => {
    if (!selectedGoal) return;
    
    try {
      await onChangeGoalStatus(selectedGoal._id, 'cancelled');
      setCancelConfirmOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error cancelling goal:', err);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event, goal) => {
    setActionMenu(event.currentTarget);
    setActionGoal(goal);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setActionMenu(null);
    setActionGoal(null);
  };
  
  // Handle menu actions
  const handleMenuAction = (action) => {
    if (!actionGoal) return;
    
    switch (action) {
      case 'edit':
        handleOpenForm(actionGoal);
        break;
        
      case 'delete':
        setSelectedGoal(actionGoal);
        setDeleteConfirmOpen(true);
        setActionMenu(null);
        break;
        
      case 'contribute':
        handleOpenContributionForm(actionGoal);
        break;
        
      case 'complete':
        setSelectedGoal(actionGoal);
        setCompleteConfirmOpen(true);
        setActionMenu(null);
        break;
        
      case 'cancel':
        setSelectedGoal(actionGoal);
        setCancelConfirmOpen(true);
        setActionMenu(null);
        break;
        
      default:
        break;
    }
  };
  
  // Get goal status chip
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Completed" />;
      case 'cancelled':
        return <Chip size="small" color="error" icon={<CancelIcon />} label="Cancelled" />;
      case 'in_progress':
      default:
        return <Chip size="small" color="primary" icon={<TrendingUpIcon />} label="In Progress" />;
    }
  };
  
  // Get priority chip
  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'high':
        return <Chip size="small" color="error" label="High Priority" />;
      case 'medium':
        return <Chip size="small" color="warning" label="Medium Priority" />;
      case 'low':
        return <Chip size="small" color="success" label="Low Priority" />;
      default:
        return null;
    }
  };
  
  // Filter active and completed/cancelled goals
  const activeGoals = savingsGoals.filter(goal => goal.status === 'in_progress');
  const completedGoals = savingsGoals.filter(goal => goal.status === 'completed');
  const cancelledGoals = savingsGoals.filter(goal => goal.status === 'cancelled');
  
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Active Savings Goals
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            New Goal
          </Button>
        </Box>
        
        {loading ? (
          <LinearProgress sx={{ my: 4 }} />
        ) : activeGoals.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No active savings goals
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Create a new savings goal to start tracking your progress towards your financial targets.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Create First Goal
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {activeGoals.map((goal) => (
              <Grid item xs={12} sm={6} md={4} key={goal._id}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      zIndex: 1
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, goal)}
                      aria-label="more options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap title={goal.name}>
                      {goal.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                      {getStatusChip(goal.status)}
                      {getPriorityChip(goal.priority)}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {getProgressPercentage(goal).toFixed(0)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressPercentage(goal)} 
                        color={getProgressColor(goal)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Current:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(goal.currentAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Target:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(goal.targetAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Remaining:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Target Date:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(goal.targetDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {goal.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {goal.description}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PaymentIcon />}
                      fullWidth
                      onClick={() => handleOpenContributionForm(goal)}
                    >
                      Add Contribution
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {completedGoals.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Completed Goals
          </Typography>
          
          <Grid container spacing={3}>
            {completedGoals.map((goal) => (
              <Grid item xs={12} sm={6} md={4} key={goal._id}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    bgcolor: 'success.light',
                    opacity: 0.9
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      zIndex: 1
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, goal)}
                      aria-label="more options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {goal.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                      {getStatusChip(goal.status)}
                    </Box>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Amount:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(goal.targetAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Completed:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(goal.targetDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {cancelledGoals.length > 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Cancelled Goals
          </Typography>
          
          <Grid container spacing={3}>
            {cancelledGoals.map((goal) => (
              <Grid item xs={12} sm={6} md={4} key={goal._id}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    bgcolor: 'action.disabledBackground',
                    opacity: 0.8
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      zIndex: 1
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, goal)}
                      aria-label="more options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {goal.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                      {getStatusChip(goal.status)}
                    </Box>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Target:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(goal.targetAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Saved:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(goal.currentAmount)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={handleMenuClose}
      >
        {actionGoal && actionGoal.status === 'in_progress' && (
          <>
            <MenuItem onClick={() => handleMenuAction('edit')}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Goal
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('contribute')}>
              <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
              Add Contribution
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('complete')}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Mark as Completed
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('cancel')}>
              <CancelIcon fontSize="small" sx={{ mr: 1 }} />
              Cancel Goal
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Goal
        </MenuItem>
      </Menu>
      
      {/* Create/Edit Form Dialog */}
      <SavingsGoalForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedGoal(null);
        }}
        onSubmit={handleFormSubmit}
        goal={selectedGoal}
      />
      
      {/* Contribution Form Dialog */}
      <ContributionForm
        open={contributionFormOpen}
        onClose={() => {
          setContributionFormOpen(false);
          setSelectedGoal(null);
        }}
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
          <Typography>
            Are you sure you want to delete the savings goal "{selectedGoal?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Complete Confirmation Dialog */}
      <Dialog
        open={completeConfirmOpen}
        onClose={() => setCompleteConfirmOpen(false)}
      >
        <DialogTitle>Complete Savings Goal</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to mark the savings goal "{selectedGoal?.name}" as completed?
          </Typography>
          {selectedGoal && selectedGoal.currentAmount < selectedGoal.targetAmount && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This goal is currently at {getProgressPercentage(selectedGoal).toFixed(0)}% 
              ({formatCurrency(selectedGoal.currentAmount)} of {formatCurrency(selectedGoal.targetAmount)}).
              Marking it as complete will automatically set the current amount to the target amount.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleCompleteGoal} color="primary" variant="contained">
            Complete Goal
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
      >
        <DialogTitle>Cancel Savings Goal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel the savings goal "{selectedGoal?.name}"?
            You can reactivate it later if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>No, Keep Active</Button>
          <Button onClick={handleCancelGoal} color="warning">
            Yes, Cancel Goal
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavingsGoalList;