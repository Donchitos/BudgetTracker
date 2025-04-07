import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoneyIcon from '@mui/icons-material/Money';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatDistanceToNow } from 'date-fns';

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

const SavingsGoalCard = ({ goal, onContribute, onEdit, onDelete }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate remaining amount
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  
  // Format date
  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        borderTop: `4px solid ${goal.color || '#1976d2'}`,
        position: 'relative',
        ...(goal.isCompleted && {
          backgroundColor: 'rgba(76, 175, 80, 0.05)',
        })
      }}
    >
      {goal.isCompleted && (
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
        title={
          <Tooltip title={goal.name} placement="top">
            <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
              {goal.name}
            </Typography>
          </Tooltip>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Chip 
              label={goal.priority} 
              size="small" 
              color={
                goal.priority === 'high' ? 'error' :
                goal.priority === 'medium' ? 'warning' : 'info'
              }
              sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
            />
            
            {goal.category && (
              <Chip 
                label={goal.category.name} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  height: 20, 
                  '& .MuiChip-label': { px: 1, py: 0 },
                  bgcolor: goal.category.color || 'primary.main',
                  color: '#fff'
                }}
              />
            )}
          </Box>
        }
      />
      
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {goal.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {goal.description}
          </Typography>
        )}
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Current:
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(goal.currentAmount)}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Target:
            </Typography>
            <Typography variant="h6">
              {formatCurrency(goal.targetAmount)}
            </Typography>
          </Grid>
          
          {!goal.isCompleted && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Remaining:
              </Typography>
              <Typography variant="body1" color="error">
                {formatCurrency(remainingAmount)}
              </Typography>
            </Grid>
          )}
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Target Date:
            </Typography>
            <Typography variant="body1">
              {formatDate(goal.targetDate)}
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progress:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {progressPercentage}%
            </Typography>
          </Box>
          <StyledLinearProgress variant="determinate" value={progressPercentage} />
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
        <Box>
          <IconButton size="small" onClick={() => onEdit(goal)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(goal)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {!goal.isCompleted && (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<MoneyIcon />}
            onClick={() => onContribute(goal)}
          >
            Add Money
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default SavingsGoalCard;