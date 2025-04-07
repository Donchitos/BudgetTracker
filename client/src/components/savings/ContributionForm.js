import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Typography,
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PaymentIcon from '@mui/icons-material/Payment';

const ContributionForm = ({ open, onClose, onSubmit, goal }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setAmount('');
      setDate(new Date());
      setNotes('');
      setError('');
    }
  }, [open]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Get progress percentage
  const getProgressPercentage = () => {
    if (!goal || goal.targetAmount <= 0) return 0;
    
    const currentAmount = goal.currentAmount || 0;
    const additionalAmount = parseFloat(amount) || 0;
    
    return Math.min(100, ((currentAmount + additionalAmount) / goal.targetAmount) * 100);
  };
  
  // Handle amount change
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setError('');
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Submit contribution
    onSubmit({
      amount: parseFloat(amount),
      date,
      notes
    });
  };
  
  if (!goal) return null;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Add Contribution to "{goal.name}"
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={goal.progressPercentage || 0}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {formatCurrency(goal.currentAmount || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(goal.targetAmount || 0)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Contribution Amount"
              value={amount}
              onChange={handleAmountChange}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!error}
              helperText={error}
              autoFocus
            />
          </Grid>
          
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., Source of funds, special occasion"
            />
          </Grid>
          
          {/* Preview of new progress */}
          {amount && parseFloat(amount) > 0 && (
            <Grid item xs={12}>
              <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  After This Contribution
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressPercentage()}
                  color="success"
                  sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {formatCurrency((goal.currentAmount || 0) + (parseFloat(amount) || 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(goal.targetAmount || 0)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  New progress: {getProgressPercentage().toFixed(1)}%
                  {getProgressPercentage() >= 100 && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      This contribution will complete your savings goal!
                    </Alert>
                  )}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          startIcon={<PaymentIcon />}
        >
          Add Contribution
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContributionForm;