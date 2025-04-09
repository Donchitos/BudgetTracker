import React, { useState } from 'react';
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
  Button,
  Collapse,
  Skeleton,
  SwipeableDrawer,
  Fade,
  Paper,
  Zoom,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SortIcon from '@mui/icons-material/Sort';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';

/**
 * Mobile-optimized transaction list that displays transactions as cards
 */
const MobileTransactionList = ({
  transactions,
  onDelete,
  onEdit,
  loading = false
}) => {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
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
  
  // Loading skeleton UI
  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} sx={{ mb: 2 }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={7}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Grid>
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="rectangular" width={60} height={20} sx={{ ml: 'auto', borderRadius: 1 }} />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 0.5, justifyContent: 'flex-end' }}>
              <Skeleton variant="circular" width={28} height={28} sx={{ mx: 0.5 }} />
              <Skeleton variant="circular" width={28} height={28} sx={{ mx: 0.5 }} />
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  }
  
  if (!loading && transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No transactions found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your filters or add a new transaction
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {transactions.map((transaction) => (
        <Zoom key={transaction._id} in={true} style={{ transitionDelay: '100ms' }}>
          <Card
            sx={{
              mb: 2,
              borderRadius: '8px',
              borderLeft: `4px solid ${transaction.type === 'income'
                ? theme.palette.success.main
                : theme.palette.error.main}`,
              boxShadow: expandedId === transaction._id
                ? '0px 5px 15px rgba(0, 0, 0, 0.1)'
                : '0px 2px 5px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease-in-out',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)'
              },
              cursor: 'pointer'
            }}
            onClick={() => toggleExpand(transaction._id)}
          >
            <CardContent sx={{ py: 1.5, px: 2, pb: '12px !important' }}>
              <Grid container spacing={1}>
                <Grid item xs={7}>
                  <Typography variant="subtitle1" component="div" sx={{
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 1,
                  }}>
                    {transaction.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(transaction.date)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      color: transaction.type === 'income' ? 'success.main' : 'error.main'
                    }}
                  >
                    {formatAmount(transaction.amount)}
                  </Typography>
                  <Chip
                    label={transaction.type}
                    color={transaction.type === 'income' ? 'success' : 'error'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 'medium'
                    }}
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
                          color: transaction.category.color ? 'white' : 'inherit',
                          fontWeight: 'medium'
                        }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 0.5,
                color: 'text.secondary',
                transform: expandedId === transaction._id ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease'
              }}>
                <ExpandMoreIcon fontSize="small" />
              </Box>
            </CardContent>
            
            <Collapse in={expandedId === transaction._id} timeout="auto" unmountOnExit>
              <Divider />
              <CardContent sx={{ py: 1.5, px: 2, bgcolor: 'action.hover' }}>
                {transaction.notes ? (
                  <Box>
                    <Typography variant="subtitle2" color="text.primary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {transaction.notes}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No additional notes
                  </Typography>
                )}
                
                {/* Additional details could be shown here */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" color="text.primary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {transaction._id}
                  </Typography>
                </Box>
              </CardContent>
            </Collapse>
            
            <Divider />
            <CardActions sx={{ p: 0.5, justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card expansion
                  onEdit && onEdit(transaction);
                }}
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card expansion
                  onDelete && onDelete(transaction._id);
                }}
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        </Zoom>
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
  toggleFilters,
  loading = false
}) => {
  const theme = useTheme();
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