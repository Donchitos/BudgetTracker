import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Badge,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import PaidIcon from '@mui/icons-material/Paid';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, addDays, isToday, differenceInDays } from 'date-fns';
import { getBills, markBillAsPaid } from '../../redux/actions/billActions';

/**
 * Visual calendar component for displaying and managing upcoming bills
 */
const BillCalendar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get bills from Redux store
  const { bills, loading, error } = useSelector(state => state.bill);
  
  // State for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetailOpen, setBillDetailOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [showList, setShowList] = useState(false);
  
  // Fetch bills when component mounts
  useEffect(() => {
    dispatch(getBills());
  }, [dispatch]);
  
  // Generate calendar days when month changes
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate the first day of the week for the first day of the month
    // 0 = Sunday, 1 = Monday, etc.
    const startDay = monthStart.getDay();
    
    // Create array with empty spots for days before the start of the month
    const daysWithPadding = [];
    
    // Add empty spots before the first day of the month
    for (let i = 0; i < startDay; i++) {
      daysWithPadding.push(null);
    }
    
    // Add the actual days of the month
    daysWithPadding.push(...dateRange);
    
    setCalendarDays(daysWithPadding);
  }, [currentMonth]);
  
  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleTodayClick = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  // Select a day
  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
    }
  };
  
  // Bill detail dialog handlers
  const handleOpenBillDetail = (bill) => {
    setSelectedBill(bill);
    setBillDetailOpen(true);
  };
  
  const handleCloseBillDetail = () => {
    setBillDetailOpen(false);
  };
  
  // Mark bill as paid
  const handleMarkAsPaid = (bill) => {
    if (bill) {
      dispatch(markBillAsPaid(bill._id, new Date()));
      setBillDetailOpen(false);
    }
  };
  
  // Process bills for display
  const getBillsForDay = (day) => {
    if (!day || !bills) return [];
    
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return isSameDay(dueDate, day);
    });
  };
  
  // Process bills for list view
  const getUpcomingBills = () => {
    if (!bills) return [];
    
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    return bills
      .filter(bill => {
        const dueDate = new Date(bill.dueDate);
        return (isAfter(dueDate, today) || isToday(dueDate)) && 
               isBefore(dueDate, thirtyDaysFromNow) &&
               !bill.isPaid;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };
  
  // Calculate bill status
  const getBillStatus = (bill) => {
    if (bill.isPaid) {
      return { status: 'paid', color: theme.palette.success.main, icon: <CheckCircleIcon /> };
    }
    
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    
    if (isBefore(dueDate, today)) {
      return { status: 'overdue', color: theme.palette.error.main, icon: <ErrorIcon /> };
    }
    
    const daysUntilDue = differenceInDays(dueDate, today);
    
    if (daysUntilDue <= 3) {
      return { status: 'due-soon', color: theme.palette.warning.main, icon: <WarningIcon /> };
    }
    
    return { status: 'upcoming', color: theme.palette.info.main, icon: <EventIcon /> };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" align="center" py={4}>
          Loading bill calendar...
        </Typography>
      </Paper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading bills
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => dispatch(getBills())}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Paper>
    );
  }
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        overflow: 'hidden',
        borderRadius: 2,
        mb: 3
      }}
    >
      {/* Calendar Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}
      >
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        
        <Box>
          <IconButton 
            onClick={handlePreviousMonth}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleTodayClick}
            startIcon={<TodayIcon />}
            sx={{ 
              mx: 1, 
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.primary.contrastText,
              '&:hover': {
                borderColor: theme.palette.primary.contrastText,
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Today
          </Button>
          
          <IconButton 
            onClick={handleNextMonth}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Toggle between calendar and list view on mobile */}
      {isMobile && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowList(!showList)}
            endIcon={showList ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          >
            {showList ? 'Hide Upcoming Bills' : 'Show Upcoming Bills'}
          </Button>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Main Calendar */}
        <Box 
          sx={{ 
            p: 2, 
            flex: 2,
            display: isMobile && showList ? 'none' : 'block'
          }}
        >
          {/* Days of the week */}
          <Grid container sx={{ mb: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Grid 
                item 
                key={index} 
                xs={1.7} 
                sx={{ 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: theme.palette.text.secondary
                }}
              >
                {!isMobile ? day : day.charAt(0)}
              </Grid>
            ))}
          </Grid>
          
          {/* Calendar grid */}
          <Grid container spacing={1}>
            {calendarDays.map((day, index) => {
              const billsForDay = day ? getBillsForDay(day) : [];
              const isSelected = day && isSameDay(day, selectedDate);
              const isCurrentDay = day && isToday(day);
              
              return (
                <Grid 
                  item 
                  key={index} 
                  xs={1.7}
                >
                  <Box
                    onClick={() => handleDateClick(day)}
                    sx={{
                      height: isTablet ? 70 : 100,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      p: 1,
                      cursor: day ? 'pointer' : 'default',
                      backgroundColor: isSelected ? `${theme.palette.primary.main}10` : 
                                    isCurrentDay ? `${theme.palette.secondary.main}10` : 
                                    'transparent',
                      borderColor: isCurrentDay ? theme.palette.secondary.main : theme.palette.divider,
                      '&:hover': day ? {
                        backgroundColor: `${theme.palette.action.hover}`,
                      } : {},
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {day && (
                      <>
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{
                            fontWeight: isCurrentDay ? 'bold' : 'normal',
                            color: isCurrentDay ? theme.palette.secondary.main : 'inherit'
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                        
                        {/* Bills for this day */}
                        <Box sx={{ 
                          mt: 0.5, 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          gap: 0.5
                        }}>
                          {billsForDay.slice(0, 3).map((bill) => {
                            const status = getBillStatus(bill);
                            
                            return (
                              <Tooltip
                                key={bill._id}
                                title={`${bill.name}: ${formatCurrency(bill.amount)}`}
                              >
                                <Avatar
                                  sx={{ 
                                    width: 20, 
                                    height: 20,
                                    bgcolor: status.color,
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBillDetail(bill);
                                  }}
                                >
                                  {bill.name.charAt(0)}
                                </Avatar>
                              </Tooltip>
                            );
                          })}
                          
                          {billsForDay.length > 3 && (
                            <Chip
                              label={`+${billsForDay.length - 3}`}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                '& .MuiChip-label': {
                                  px: 0.5
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDateClick(day);
                              }}
                            />
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
        
        {/* Upcoming Bills List or Selected Day Bills */}
        <Collapse 
          in={!isMobile || showList} 
          orientation={isMobile ? "vertical" : "horizontal"}
          sx={{ 
            width: isMobile ? '100%' : '30%',
            minWidth: isMobile ? 'auto' : 300,
            maxWidth: isMobile ? 'auto' : 400,
            borderLeft: !isMobile ? `1px solid ${theme.palette.divider}` : 'none',
            borderTop: isMobile ? `1px solid ${theme.palette.divider}` : 'none'
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {(isMobile && showList) ? 'Upcoming Bills' : format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            
            {/* Bills list */}
            <Box sx={{ mt: 2 }}>
              {(isMobile && showList 
                ? getUpcomingBills() 
                : getBillsForDay(selectedDate)
              ).map((bill) => {
                const status = getBillStatus(bill);
                
                return (
                  <Card 
                    key={bill._id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 2,
                      borderLeft: `4px solid ${status.color}`
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">
                            {bill.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due: {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                          </Typography>
                          
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Chip
                              icon={status.icon}
                              label={status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                              size="small"
                              sx={{ 
                                bgcolor: `${status.color}20`,
                                color: status.color,
                                mr: 1
                              }}
                            />
                            <Typography variant="h6">
                              {formatCurrency(bill.amount)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenBillDetail(bill)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    {!bill.isPaid && (
                      <CardActions sx={{ justifyContent: 'flex-end', py: 0.5 }}>
                        <Button
                          size="small"
                          startIcon={<PaidIcon />}
                          onClick={() => handleMarkAsPaid(bill)}
                        >
                          Mark as Paid
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                );
              })}
              
              {/* No bills message */}
              {((isMobile && showList 
                ? getUpcomingBills() 
                : getBillsForDay(selectedDate)
              ).length === 0) && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <PaymentIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {(isMobile && showList)
                      ? 'No upcoming bills in the next 30 days'
                      : 'No bills due on this date'}
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ mt: 1 }}
                    // This would link to the bill creation form
                    // onClick={handleAddBill}
                  >
                    Add a Bill
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Collapse>
      </Box>
      
      {/* Bill Detail Dialog */}
      <Dialog
        open={billDetailOpen}
        onClose={handleCloseBillDetail}
        maxWidth="sm"
        fullWidth
      >
        {selectedBill && (
          <>
            <DialogTitle>
              Bill Details: {selectedBill.name}
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(selectedBill.amount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="h6">
                    {format(new Date(selectedBill.dueDate), 'MMMM d, yyyy')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedBill.category?.name || 'Uncategorized'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getBillStatus(selectedBill).icon}
                    label={getBillStatus(selectedBill).status.charAt(0).toUpperCase() + getBillStatus(selectedBill).status.slice(1)}
                    sx={{ 
                      bgcolor: `${getBillStatus(selectedBill).color}20`,
                      color: getBillStatus(selectedBill).color
                    }}
                  />
                </Grid>
                
                {selectedBill.recurringFrequency && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recurring Details
                      </Typography>
                      <Typography variant="body1">
                        This bill repeats {selectedBill.recurringFrequency.toLowerCase()}
                        {selectedBill.recurringEndDate && ` until ${format(new Date(selectedBill.recurringEndDate), 'MMMM d, yyyy')}`}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {selectedBill.notes && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedBill.notes}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {selectedBill.isPaid && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Payment Information
                      </Typography>
                      <Typography variant="body1">
                        Paid on {format(new Date(selectedBill.paidDate), 'MMMM d, yyyy')}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseBillDetail}>
                Close
              </Button>
              
              {!selectedBill.isPaid && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaidIcon />}
                  onClick={() => handleMarkAsPaid(selectedBill)}
                >
                  Mark as Paid
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default BillCalendar;