import React, { useState, useRef, useCallback } from 'react';
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
  useTheme,
  Menu,
  MenuItem,
  SwipeableList,
  SwipeableListItem,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Badge,
  Tab,
  Tabs,
  Tooltip,
  Alert,
  List,
  useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import TuneIcon from '@mui/icons-material/Tune';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { useSwipeable } from 'react-swipeable';

/**
 * Enhanced Mobile-optimized transaction list with better UX and performance
 */
const MobileTransactionList = ({
  transactions = [],
  onDelete,
  onEdit,
  onDuplicate,
  loading = false,
  onAddNew,
  onRefresh,
  virtualized = false
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [expandedId, setExpandedId] = useState(null);
  const [swipingId, setSwipingId] = useState(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({ open: false, message: '', type: 'success' });
  
  // Animation references
  const cardRefs = useRef({});
  
  // Toggle expanded state of transaction card
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
  
  // Handle context menu
  const handleContextMenu = (event, transaction) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenuAnchor(event.currentTarget);
    setActiveTransaction(transaction);
  };
  
  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenuAnchor(null);
    setActiveTransaction(null);
  };
  
  // Context menu actions
  const handleContextAction = (action) => {
    if (!activeTransaction) return;
    
    switch(action) {
      case 'edit':
        onEdit && onEdit(activeTransaction);
        showActionFeedback('Editing transaction...');
        break;
      case 'delete':
        onDelete && onDelete(activeTransaction._id);
        showActionFeedback('Transaction deleted', 'success');
        break;
      case 'duplicate':
        onDuplicate && onDuplicate(activeTransaction);
        showActionFeedback('Transaction duplicated', 'success');
        break;
      default:
        break;
    }
    
    handleCloseContextMenu();
  };
  
  // Show action feedback snackbar
  const showActionFeedback = (message, type = 'info') => {
    setActionFeedback({
      open: true,
      message,
      type
    });
    
    setTimeout(() => {
      setActionFeedback(prev => ({ ...prev, open: false }));
    }, 3000);
  };
  
  // Swipe gesture config for list items
  const getSwipeHandlers = (transaction) => useSwipeable({
    onSwipeStart: () => {
      setSwipingId(transaction._id);
    },
    onSwipeEnd: () => {
      setTimeout(() => setSwipingId(null), 500);
    },
    onSwipedLeft: () => {
      const card = cardRefs.current[transaction._id];
      if (card) {
        card.classList.add('swipe-left-animation');
        setTimeout(() => {
          onDelete && onDelete(transaction._id);
          card.classList.remove('swipe-left-animation');
        }, 300);
      }
    },
    onSwipedRight: () => {
      const card = cardRefs.current[transaction._id];
      if (card) {
        card.classList.add('swipe-right-animation');
        setTimeout(() => {
          onEdit && onEdit(transaction);
          card.classList.remove('swipe-right-animation');
        }, 300);
      }
    },
    trackMouse: false,
    delta: 50,
    preventDefaultTouchmoveEvent: true
  });
  
  // Loading skeleton UI with larger tap targets
  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ py: 2, px: 2 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={7}>
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Grid>
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                  <Skeleton variant="text" width="100%" height={28} />
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ ml: 'auto', borderRadius: 1 }} />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 1, justifyContent: 'flex-end' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mx: 0.5 }} />
              <Skeleton variant="circular" width={40} height={40} sx={{ mx: 0.5 }} />
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  }
  
  if (!loading && transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No transactions found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Try adjusting your filters or add a new transaction
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onAddNew}
          size="large"
          sx={{ py: 1.5, px: 3, borderRadius: 2 }}
        >
          Add Transaction
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Help overlay for swipe gestures - shown briefly on first load */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        zIndex: 5,
        display: actionFeedback.open ? 'block' : 'none'
      }}>
        <Alert 
          severity={actionFeedback.type}
          sx={{ 
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {actionFeedback.message}
        </Alert>
      </Box>
      
      {/* Transaction List */}
      <Box 
        className="swipeable-transaction-list"
        sx={{
          // Custom CSS for swipe animations
          '& .swipe-left-animation': {
            animation: 'swipeLeft 0.3s forwards',
          },
          '& .swipe-right-animation': {
            animation: 'swipeRight 0.3s forwards',
          },
          '@keyframes swipeLeft': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-100%)', opacity: 0 }
          },
          '@keyframes swipeRight': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(100%)', opacity: 0 }
          },
        }}
      >
        {transactions.map((transaction) => {
          const swipeHandlers = getSwipeHandlers(transaction);
          
          return (
            <Zoom key={transaction._id} in={true} style={{ transitionDelay: '50ms' }}>
              <Card
                ref={el => cardRefs.current[transaction._id] = el}
                {...swipeHandlers}
                sx={{
                  mb: 2,
                  borderRadius: 2,
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
                    transform: !swipingId ? 'translateY(-2px)' : 'none'
                  },
                  cursor: 'pointer',
                  // Indicate swipe capability with subtle UI hints
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 16,
                    right: 16,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)',
                    opacity: 0.5,
                  }
                }}
                onClick={() => toggleExpand(transaction._id)}
                onContextMenu={(e) => handleContextMenu(e, transaction)}
              >
                {/* Swipe hint overlay */}
                {swipingId === transaction._id && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    display: 'flex',
                    pointerEvents: 'none',
                  }}>
                    <Box sx={{ 
                      flex: 1, 
                      bgcolor: 'primary.main', 
                      opacity: 0.2, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      pl: 2
                    }}>
                      <EditIcon fontSize="medium" sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      bgcolor: 'error.main', 
                      opacity: 0.2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pr: 2
                    }}>
                      <DeleteIcon fontSize="medium" sx={{ color: 'error.main' }} />
                    </Box>
                  </Box>
                )}
                
                {/* Main content */}
                <CardContent sx={{ py: 2, px: 2, pb: '12px !important' }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={7}>
                      <Typography variant="subtitle1" component="div" sx={{
                        fontWeight: 500,
                        fontSize: '1rem',
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                      }}>
                        {transaction.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
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
                          fontSize: '1.1rem',
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
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          mt: 0.5
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
                              height: 24,
                              fontSize: '0.75rem',
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
                  <CardContent sx={{ py: 2, px: 2, bgcolor: 'action.hover' }}>
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
                <CardActions sx={{ p: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Swipe to edit or delete
                  </Typography>
                  
                  <Box>
                    <IconButton
                      size="medium"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card expansion
                        onEdit && onEdit(transaction);
                        showActionFeedback('Editing transaction...');
                      }}
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'scale(1.1)' },
                        width: 44,
                        height: 44,
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="medium"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card expansion
                        onDelete && onDelete(transaction._id);
                        showActionFeedback('Transaction deleted', 'success');
                      }}
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'scale(1.1)' },
                        width: 44,
                        height: 44,
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card expansion
                        handleContextMenu(e, transaction);
                      }}
                      sx={{
                        width: 44,
                        height: 44,
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Zoom>
          );
        })}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={handleCloseContextMenu}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            mt: 1
          }
        }}
      >
        <MenuItem 
          onClick={() => handleContextAction('edit')}
          sx={{ py: 1.5 }}
        >
          <EditIcon fontSize="small" sx={{ mr: 2 }} />
          Edit Transaction
        </MenuItem>
        <MenuItem 
          onClick={() => handleContextAction('duplicate')}
          sx={{ py: 1.5 }}
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 2 }} />
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleContextAction('delete')}
          sx={{ py: 1.5, color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

/**
 * Enhanced Mobile-optimized filter section for transactions
 */
export const MobileTransactionFilters = ({
  filters,
  onFilterChange,
  categories,
  filtersVisible,
  toggleFilters,
  onClearFilters,
  loading = false,
  activeFiltersCount = 0
}) => {
  const theme = useTheme();
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  
  // Toggle filters drawer
  const toggleFiltersDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    
    setFiltersDrawerOpen(open);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    onClearFilters && onClearFilters();
    setFiltersDrawerOpen(false);
  };
  
  // Apply filters and close drawer
  const handleApplyFilters = () => {
    setFiltersDrawerOpen(false);
  };

  return (
    <>
      {/* Main filter controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button 
          variant="outlined"
          onClick={toggleFiltersDrawer(true)}
          startIcon={<FilterListIcon />}
          size="large"
          color={activeFiltersCount > 0 ? 'primary' : 'inherit'}
          sx={{ 
            py: 1.2, 
            flex: '1 1 auto',
            boxShadow: activeFiltersCount > 0 ? 1 : 0,
            position: 'relative'
          }}
        >
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              badgeContent={activeFiltersCount} 
              color="primary"
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8
              }}
            />
          )}
        </Button>
        
        <Button 
          variant="outlined"
          startIcon={<SortIcon />}
          size="large"
          sx={{ py: 1.2 }}
        >
          Sort
        </Button>
      </Box>
      
      {/* Full screen filters drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={filtersDrawerOpen}
        onClose={toggleFiltersDrawer(false)}
        onOpen={toggleFiltersDrawer(true)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: '90vh',
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 40,
              height: 5,
              borderRadius: 4,
              backgroundColor: 'grey.300'
            }
          }
        }}
      >
        <Box sx={{ p: 2, pt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggleFiltersDrawer(false)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">Filters</Typography>
            </Box>
            <Button 
              color="primary"
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
              disabled={activeFiltersCount === 0}
            >
              Clear All
            </Button>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
            Transaction Type
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={filters.type === 'income' ? 'contained' : 'outlined'}
                color="success"
                size="large"
                onClick={() => onFilterChange({
                  target: { name: 'type', value: filters.type === 'income' ? '' : 'income' }
                })}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Income
              </Button>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={filters.type === 'expense' ? 'contained' : 'outlined'}
                color="error"
                size="large"
                onClick={() => onFilterChange({
                  target: { name: 'type', value: filters.type === 'expense' ? '' : 'expense' }
                })}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Expenses
              </Button>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
            Date Range
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" gutterBottom>
                From Date
              </Typography>
              <Paper
                elevation={0}
                sx={{ 
                  p: 1, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={onFilterChange}
                  style={{ 
                    width: '100%', 
                    border: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" gutterBottom>
                To Date
              </Typography>
              <Paper
                elevation={0}
                sx={{ 
                  p: 1, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={onFilterChange}
                  style={{ 
                    width: '100%', 
                    border: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
            Categories
          </Typography>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 2,
              mb: 3
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              maxHeight: '180px',
              overflowY: 'auto',
              py: 1
            }}>
              <Chip
                label="All Categories"
                size="medium"
                clickable
                color={filters.category === '' ? 'primary' : 'default'}
                onClick={() => onFilterChange({
                  target: { name: 'category', value: '' }
                })}
                sx={{ mb: 1, height: 36, fontSize: '0.9rem' }}
              />
              {categories && categories.map(category => (
                <Chip
                  key={category._id}
                  label={category.name}
                  size="medium"
                  clickable
                  color={filters.category === category._id ? 'primary' : 'default'}
                  sx={{ 
                    mb: 1,
                    height: 36,
                    fontSize: '0.9rem',
                    bgcolor: filters.category === category._id ? undefined : category.color,
                    color: filters.category === category._id ? undefined : 'white'
                  }}
                  onClick={() => onFilterChange({
                    target: { name: 'category', value: filters.category === category._id ? '' : category._id }
                  })}
                />
              ))}
            </Box>
          </Paper>
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
            Amount Range
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="body2" gutterBottom>
                Minimum
              </Typography>
              <Paper
                elevation={0}
                sx={{ 
                  p: 1, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount || ''}
                  onChange={onFilterChange}
                  placeholder="Min Amount"
                  style={{ 
                    width: '100%', 
                    border: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" gutterBottom>
                Maximum
              </Typography>
              <Paper
                elevation={0}
                sx={{ 
                  p: 1, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount || ''}
                  onChange={onFilterChange}
                  placeholder="Max Amount"
                  style={{ 
                    width: '100%', 
                    border: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, position: 'sticky', bottom: 0, bgcolor: 'background.paper', pt: 2, pb: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleClearFilters}
              sx={{ py: 1.5, borderRadius: 2 }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleApplyFilters}
              sx={{ py: 1.5, borderRadius: 2 }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>
      
      {/* Active filters display */}
      {activeFiltersCount > 0 && !filtersDrawerOpen && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.type && (
            <Chip
              label={`Type: ${filters.type}`}
              size="medium"
              onDelete={() => onFilterChange({
                target: { name: 'type', value: '' }
              })}
              color={filters.type === 'income' ? 'success' : 'error'}
              sx={{ height: 36 }}
            />
          )}
          
          {filters.startDate && (
            <Chip
              label={`From: ${format(new Date(filters.startDate), 'MMM dd, yyyy')}`}
              size="medium"
              onDelete={() => onFilterChange({
                target: { name: 'startDate', value: '' }
              })}
              sx={{ height: 36 }}
            />
          )}
          
          {filters.endDate && (
            <Chip
              label={`To: ${format(new Date(filters.endDate), 'MMM dd, yyyy')}`}
              size="medium"
              onDelete={() => onFilterChange({
                target: { name: 'endDate', value: '' }
              })}
              sx={{ height: 36 }}
            />
          )}
          
          {filters.category && categories && (
            <Chip
              label={`Category: ${categories.find(c => c._id === filters.category)?.name || 'Selected'}`}
              size="medium"
              onDelete={() => onFilterChange({
                target: { name: 'category', value: '' }
              })}
              sx={{ height: 36 }}
            />
          )}
          
          {(filters.minAmount || filters.maxAmount) && (
            <Chip
              label={`Amount: ${filters.minAmount ? `$${filters.minAmount}` : '$0'} - ${filters.maxAmount ? `$${filters.maxAmount}` : 'Any'}`}
              size="medium"
              onDelete={() => {
                onFilterChange({ target: { name: 'minAmount', value: '' } });
                onFilterChange({ target: { name: 'maxAmount', value: '' } });
              }}
              sx={{ height: 36 }}
            />
          )}
        </Box>
      )}
    </>
  );
};

export default MobileTransactionList;