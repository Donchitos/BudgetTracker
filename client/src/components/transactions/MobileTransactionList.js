import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Grid,
  Divider,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format } from 'date-fns';

/**
 * Mobile-optimized transaction list that displays transactions as cards
 */
const MobileTransactionList = ({ 
  transactions, 
  onDelete,
  onEdit 
}) => {
  // Format currency amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  if (transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No transactions found
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {transactions.map((transaction) => (
        <Card key={transaction._id} sx={{ mb: 2, borderLeft: transaction.type === 'income' ? '4px solid #4caf50' : '4px solid #f44336' }}>
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={7}>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                  {transaction.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(transaction.date)}
                </Typography>
              </Grid>
              
              <Grid item xs={5} sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="subtitle1" 
                  component="div" 
                  sx={{ 
                    fontWeight: 500,
                    color: transaction.type === 'income' ? 'success.main' : 'error.main'
                  }}
                >
                  {formatAmount(transaction.amount)}
                </Typography>
                <Chip 
                  label={transaction.type} 
                  color={transaction.type === 'income' ? 'success' : 'error'}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Grid>
              
              {transaction.category && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={transaction.category.name}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: transaction.category.color || 'grey.300',
                        color: transaction.category.color ? 'white' : 'inherit'
                      }}
                    />
                  </Box>
                </Grid>
              )}
              
              {transaction.notes && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ p: 0.5, justifyContent: 'flex-end' }}>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => onEdit && onEdit(transaction)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete && onDelete(transaction._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

/**
 * Mobile-optimized filter section for transactions
 */
export const MobileTransactionFilters = ({ 
  filters, 
  onFilterChange, 
  categories, 
  filtersVisible,
  toggleFilters 
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Button 
        fullWidth 
        onClick={toggleFilters}
        endIcon={filtersVisible ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        sx={{ justifyContent: 'space-between', mb: 1 }}
      >
        Filters
      </Button>
      
      {filtersVisible && (
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant={filters.type === 'income' ? 'contained' : 'outlined'}
              color="success"
              size="small"
              onClick={() => onFilterChange({
                target: { name: 'type', value: filters.type === 'income' ? '' : 'income' }
              })}
            >
              Income
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button
              fullWidth
              variant={filters.type === 'expense' ? 'contained' : 'outlined'}
              color="error"
              size="small"
              onClick={() => onFilterChange({
                target: { name: 'type', value: filters.type === 'expense' ? '' : 'expense' }
              })}
            >
              Expenses
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button
              component="label"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            >
              From:
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={onFilterChange}
                style={{ marginLeft: 8, border: 'none' }}
              />
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button
              component="label"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            >
              To:
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={onFilterChange}
                style={{ marginLeft: 8, border: 'none' }}
              />
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5, 
              mt: 0.5,
              maxHeight: '100px',
              overflowY: 'auto',
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <Chip
                label="All Categories"
                size="small"
                clickable
                color={filters.category === '' ? 'primary' : 'default'}
                onClick={() => onFilterChange({
                  target: { name: 'category', value: '' }
                })}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
              {categories && categories.map(category => (
                <Chip
                  key={category._id}
                  label={category.name}
                  size="small"
                  clickable
                  color={filters.category === category._id ? 'primary' : 'default'}
                  sx={{ 
                    mr: 0.5, 
                    mb: 0.5,
                    bgcolor: filters.category === category._id ? undefined : category.color,
                    color: filters.category === category._id ? undefined : 'white'
                  }}
                  onClick={() => onFilterChange({
                    target: { name: 'category', value: filters.category === category._id ? '' : category._id }
                  })}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MobileTransactionList;