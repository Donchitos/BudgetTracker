import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled linear progress with custom colors
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

const ContributionForm = ({ open, onClose, onSubmit, goal }) => {
  // State for contribution amount
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  // Reset form when the dialog opens
  useEffect(() => {
    if (open) {
      setAmount('');
      setNotes(`Contribution to ${goal?.name || 'savings goal'}`);
      setError('');
    }
  }, [open, goal]);
  
  // Handle amount change
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setError('');
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  
  // Validate and submit form
  const handleSubmit = () => {
    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }
    
    onSubmit({
      amount: parseFloat(amount),
      notes
    });
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate new progress after contribution
  const calculateNewProgress = () => {
    if (!goal || !amount || isNaN(amount)) return goal?.progressPercentage || 0;
    
    const newAmount = goal.currentAmount + parseFloat(amount);
    return Math.min(100, Math.round((newAmount / goal.targetAmount) * 100));
  };
  
  // Calculate remaining amount after contribution
  const calculateRemainingAmount = () => {
    if (!goal || !amount || isNaN(amount)) return goal?.remainingAmount || 0;
    
    return Math.max(0, goal.targetAmount - (goal.currentAmount + parseFloat(amount)));
  };
  
  // Check if goal will be completed with this contribution
  const willCompleteGoal = () => {
    if (!goal || !amount || isNaN(amount)) return false;
    
    return (goal.currentAmount + parseFloat(amount)) >= goal.targetAmount;
  };
  
  if (!goal) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Contribution to {goal.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Progress
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {goal.progressPercentage}%
            </Typography>
          </Box>
          <StyledLinearProgress variant="determinate" value={goal.progressPercentage} />
        </Box>
        
        <TextField
          autoFocus
          margin="dense"
          id="amount"
          label="Contribution Amount"
          type="number"
          fullWidth
          value={amount}
          onChange={handleAmountChange}
          error={!!error}
          helperText={error}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mb: 3 }}
        />
        
        <TextField
          margin="dense"
          id="notes"
          label="Notes"
          type="text"
          fullWidth
          value={notes}
          onChange={handleNotesChange}
          sx={{ mb: 3 }}
        />
        
        {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" gutterBottom>
              After this contribution:
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                New balance: {formatCurrency(goal.currentAmount + parseFloat(amount))}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {calculateNewProgress()}%
              </Typography>
            </Box>
            <StyledLinearProgress variant="determinate" value={calculateNewProgress()} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Remaining to goal: {formatCurrency(calculateRemainingAmount())}
              </Typography>
              
              {willCompleteGoal() && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                  This contribution will complete your goal! 🎉
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Contribution
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContributionForm;