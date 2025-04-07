import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Slider,
  InputAdornment,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * Debt Payoff Calculator component
 * Helps users plan debt repayment strategies
 */
const DebtPayoffCalculator = () => {
  // State for debts
  const [debts, setDebts] = useState([]);
  const [editingDebt, setEditingDebt] = useState(null);
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: '',
    interestRate: '',
    minimumPayment: '',
    priority: 'highest-interest' // highest-interest or lowest-balance
  });
  
  // State for repayment strategy
  const [strategy, setStrategy] = useState('avalanche'); // avalanche or snowball
  const [extraPayment, setExtraPayment] = useState(0);
  const [showAmortization, setShowAmortization] = useState(false);
  
  // Calculated results
  const [payoffPlan, setPayoffPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate debt payoff plan
  useEffect(() => {
    if (debts.length === 0) return;
    
    setLoading(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        const plan = calculateDebtPayoff(debts, strategy, extraPayment);
        setPayoffPlan(plan);
      } catch (error) {
        console.error('Error calculating debt payoff:', error);
      } finally {
        setLoading(false);
      }
    }, 100);
  }, [debts, strategy, extraPayment]);
  
  // Handle new debt input change
  const handleNewDebtChange = (e) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle add new debt
  const handleAddDebt = () => {
    // Validate inputs
    if (!newDebt.name || !newDebt.balance || !newDebt.interestRate || !newDebt.minimumPayment) {
      return;
    }
    
    // Add new debt with parsed number values
    const debtToAdd = {
      id: Date.now(),
      name: newDebt.name,
      balance: parseFloat(newDebt.balance),
      interestRate: parseFloat(newDebt.interestRate),
      minimumPayment: parseFloat(newDebt.minimumPayment),
      priority: newDebt.priority
    };
    
    setDebts([...debts, debtToAdd]);
    
    // Reset form
    setNewDebt({
      name: '',
      balance: '',
      interestRate: '',
      minimumPayment: '',
      priority: 'highest-interest'
    });
  };
  
  // Handle delete debt
  const handleDeleteDebt = (id) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };
  
  // Handle edit debt
  const handleEditDebt = (debt) => {
    setEditingDebt({ ...debt });
  };
  
  // Handle editing debt changes
  const handleEditingDebtChange = (e) => {
    const { name, value } = e.target;
    setEditingDebt(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle save edited debt
  const handleSaveDebt = () => {
    // Validate inputs
    if (!editingDebt.name || !editingDebt.balance || !editingDebt.interestRate || !editingDebt.minimumPayment) {
      return;
    }
    
    // Update debt with parsed number values
    const updatedDebt = {
      ...editingDebt,
      balance: parseFloat(editingDebt.balance),
      interestRate: parseFloat(editingDebt.interestRate),
      minimumPayment: parseFloat(editingDebt.minimumPayment)
    };
    
    setDebts(debts.map(debt => debt.id === updatedDebt.id ? updatedDebt : debt));
    setEditingDebt(null);
  };
  
  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingDebt(null);
  };
  
  // Handle strategy change
  const handleStrategyChange = (e) => {
    setStrategy(e.target.value);
  };
  
  // Handle extra payment change
  const handleExtraPaymentChange = (event, newValue) => {
    setExtraPayment(newValue);
  };
  
  // Function to calculate debt payoff
  const calculateDebtPayoff = (debts, strategy, extraPayment) => {
    if (debts.length === 0) return null;
    
    // Make a deep copy of the debts array
    let debtsCopy = JSON.parse(JSON.stringify(debts));
    
    // Sort debts based on strategy
    if (strategy === 'avalanche') {
      // Highest interest rate first
      debtsCopy.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      // Lowest balance first (snowball)
      debtsCopy.sort((a, b) => a.balance - b.balance);
    }
    
    // Initialize payoff plan
    const plan = {
      totalPayment: 0,
      totalInterest: 0,
      payoffMonths: 0,
      payoffDate: new Date(),
      monthlyPayments: [],
      debts: debtsCopy.map(debt => ({
        id: debt.id,
        name: debt.name,
        originalBalance: debt.balance,
        interestRate: debt.interestRate,
        payoffDate: null,
        totalInterestPaid: 0,
        amortization: []
      }))
    };
    
    // Calculate total minimum payment
    const totalMinimumPayment = debtsCopy.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    
    // Calculate monthly payment (total minimum + extra)
    const monthlyPayment = totalMinimumPayment + extraPayment;
    
    // Simulate payoff
    let month = 0;
    let remainingDebts = debtsCopy.length;
    let currentDate = new Date();
    
    while (remainingDebts > 0 && month < 600) { // Limit to 50 years max
      month++;
      
      // Add a month to the current date
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
      
      // Initialize monthly payment allocation
      let availablePayment = monthlyPayment;
      let monthlyAllocation = [];
      
      // First, allocate minimum payments
      for (let i = 0; i < debtsCopy.length; i++) {
        if (debtsCopy[i].balance <= 0) continue;
        
        // Calculate interest
        const monthlyInterest = (debtsCopy[i].balance * (debtsCopy[i].interestRate / 100)) / 12;
        
        // Add interest to balance
        debtsCopy[i].balance += monthlyInterest;
        
        // Calculate payment (minimum or balance if smaller)
        const payment = Math.min(debtsCopy[i].minimumPayment, debtsCopy[i].balance);
        
        // Apply minimum payment
        debtsCopy[i].balance -= payment;
        availablePayment -= payment;
        
        // Update debt in plan
        const debtInPlan = plan.debts.find(d => d.id === debtsCopy[i].id);
        debtInPlan.totalInterestPaid += monthlyInterest;
        
        // Add to monthly allocation
        monthlyAllocation.push({
          id: debtsCopy[i].id,
          name: debtsCopy[i].name,
          payment,
          interest: monthlyInterest,
          remainingBalance: debtsCopy[i].balance
        });
        
        // Add to amortization if needed
        if (showAmortization) {
          debtInPlan.amortization.push({
            month,
            payment,
            interest: monthlyInterest,
            principal: payment - monthlyInterest,
            balance: debtsCopy[i].balance
          });
        }
        
        // Check if debt is paid off this month
        if (debtsCopy[i].balance <= 0) {
          debtInPlan.payoffDate = new Date(currentDate);
        }
      }
      
      // Then, allocate extra payment to highest priority debt
      if (availablePayment > 0) {
        for (let i = 0; i < debtsCopy.length; i++) {
          if (debtsCopy[i].balance <= 0) continue;
          
          // Apply extra payment
          const extraPaymentForDebt = Math.min(availablePayment, debtsCopy[i].balance);
          debtsCopy[i].balance -= extraPaymentForDebt;
          availablePayment -= extraPaymentForDebt;
          
          // Update allocation
          const allocationForDebt = monthlyAllocation.find(a => a.id === debtsCopy[i].id);
          allocationForDebt.payment += extraPaymentForDebt;
          allocationForDebt.remainingBalance = debtsCopy[i].balance;
          
          // Update amortization if needed
          if (showAmortization) {
            const debtInPlan = plan.debts.find(d => d.id === debtsCopy[i].id);
            const lastAmortization = debtInPlan.amortization[debtInPlan.amortization.length - 1];
            lastAmortization.payment += extraPaymentForDebt;
            lastAmortization.principal += extraPaymentForDebt;
            lastAmortization.balance = debtsCopy[i].balance;
          }
          
          // Check if debt is paid off with extra payment
          if (debtsCopy[i].balance <= 0) {
            const debtInPlan = plan.debts.find(d => d.id === debtsCopy[i].id);
            if (!debtInPlan.payoffDate) {
              debtInPlan.payoffDate = new Date(currentDate);
            }
          }
          
          // Move to next debt if available payment is exhausted
          if (availablePayment <= 0) break;
        }
      }
      
      // Add monthly allocation to plan
      plan.monthlyPayments.push({
        month,
        date: new Date(currentDate),
        totalPayment: monthlyPayment - availablePayment,
        allocations: monthlyAllocation
      });
      
      // Count remaining debts
      remainingDebts = debtsCopy.filter(d => d.balance > 0).length;
    }
    
    // Calculate final stats
    plan.payoffMonths = month;
    plan.payoffDate = new Date(currentDate);
    plan.totalPayment = plan.monthlyPayments.reduce((sum, m) => sum + m.totalPayment, 0);
    plan.totalInterest = plan.debts.reduce((sum, d) => sum + d.totalInterestPaid, 0);
    
    return plan;
  };
  
  // Calculate chart data for payoff visualization
  const getPayoffChartData = () => {
    if (!payoffPlan) return [];
    
    // Generate data points for chart (aggregate by combining months)
    const chartData = [];
    const interval = Math.max(1, Math.floor(payoffPlan.monthlyPayments.length / 12));
    
    for (let i = 0; i < payoffPlan.monthlyPayments.length; i += interval) {
      const monthlyPayment = payoffPlan.monthlyPayments[i];
      const dataPoint = {
        month: monthlyPayment.month,
        date: monthlyPayment.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      };
      
      // Add remaining balances for each debt
      payoffPlan.debts.forEach(debt => {
        const allocation = monthlyPayment.allocations.find(a => a.id === debt.id);
        dataPoint[debt.name] = allocation ? allocation.remainingBalance : 0;
      });
      
      chartData.push(dataPoint);
    }
    
    return chartData;
  };
  
  // Calculate pie chart data for interest vs principal
  const getInterestPieChartData = () => {
    if (!payoffPlan) return [];
    
    return [
      { name: 'Principal', value: payoffPlan.totalPayment - payoffPlan.totalInterest },
      { name: 'Interest', value: payoffPlan.totalInterest }
    ];
  };
  
  // Get sample debts for demo
  const getSampleDebts = () => {
    const samples = [
      {
        id: 1,
        name: 'Credit Card',
        balance: 5000,
        interestRate: 18.99,
        minimumPayment: 150,
        priority: 'highest-interest'
      },
      {
        id: 2,
        name: 'Car Loan',
        balance: 12000,
        interestRate: 6.5,
        minimumPayment: 300,
        priority: 'highest-interest'
      },
      {
        id: 3,
        name: 'Student Loan',
        balance: 25000,
        interestRate: 4.5,
        minimumPayment: 200,
        priority: 'highest-interest'
      }
    ];
    
    setDebts(samples);
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Debt Payoff Calculator
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left side - Debt inputs */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Debts
              </Typography>
              
              {debts.length === 0 && (
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={getSampleDebts}
                >
                  Load Sample Debts
                </Button>
              )}
            </Box>
            
            {/* Debt List */}
            {debts.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell align="right">Interest</TableCell>
                      <TableCell align="right">Min. Payment</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {debts.map(debt => (
                      <TableRow key={debt.id}>
                        {editingDebt && editingDebt.id === debt.id ? (
                          <>
                            <TableCell>
                              <TextField 
                                size="small" 
                                name="name" 
                                value={editingDebt.name} 
                                onChange={handleEditingDebtChange}
                                variant="standard"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField 
                                size="small" 
                                name="balance" 
                                value={editingDebt.balance} 
                                onChange={handleEditingDebtChange}
                                variant="standard"
                                type="number"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField 
                                size="small" 
                                name="interestRate" 
                                value={editingDebt.interestRate} 
                                onChange={handleEditingDebtChange}
                                variant="standard"
                                type="number"
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField 
                                size="small" 
                                name="minimumPayment" 
                                value={editingDebt.minimumPayment} 
                                onChange={handleEditingDebtChange}
                                variant="standard"
                                type="number"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="primary" onClick={handleSaveDebt}>
                                <SaveIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="default" onClick={handleCancelEdit}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{debt.name}</TableCell>
                            <TableCell align="right">{formatCurrency(debt.balance)}</TableCell>
                            <TableCell align="right">{debt.interestRate}%</TableCell>
                            <TableCell align="right">{formatCurrency(debt.minimumPayment)}</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" color="primary" onClick={() => handleEditDebt(debt)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteDebt(debt.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Add your debts to get started with the payoff calculator.
              </Alert>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Add New Debt Form */}
            <Typography variant="subtitle1" gutterBottom>
              Add a New Debt
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Debt Name"
                  name="name"
                  value={newDebt.name}
                  onChange={handleNewDebtChange}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Balance"
                  name="balance"
                  value={newDebt.balance}
                  onChange={handleNewDebtChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Interest Rate"
                  name="interestRate"
                  value={newDebt.interestRate}
                  onChange={handleNewDebtChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Payment"
                  name="minimumPayment"
                  value={newDebt.minimumPayment}
                  onChange={handleNewDebtChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddDebt}
                  disabled={!newDebt.name || !newDebt.balance || !newDebt.interestRate || !newDebt.minimumPayment}
                >
                  Add Debt
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Payoff Strategy Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payoff Strategy
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="strategy-select-label">Strategy</InputLabel>
                  <Select
                    labelId="strategy-select-label"
                    id="strategy-select"
                    value={strategy}
                    label="Strategy"
                    onChange={handleStrategyChange}
                  >
                    <MenuItem value="avalanche">
                      <Box>
                        <Typography variant="body1">Debt Avalanche</Typography>
                        <Typography variant="caption" color="text.secondary">Pay highest interest first (saves most money)</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="snowball">
                      <Box>
                        <Typography variant="body1">Debt Snowball</Typography>
                        <Typography variant="caption" color="text.secondary">Pay smallest balances first (more psychological wins)</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography id="extra-payment-slider" gutterBottom>
                  Extra Monthly Payment: {formatCurrency(extraPayment)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', ml: 1, mr: 1 }}>
                    <Slider
                      value={extraPayment}
                      onChange={handleExtraPaymentChange}
                      aria-labelledby="extra-payment-slider"
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => formatCurrency(value)}
                      step={50}
                      min={0}
                      max={2000}
                    />
                  </Box>
                  <TextField
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                    size="small"
                    type="number"
                    sx={{ width: 100 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Adding extra payments can significantly reduce your payoff time and interest paid.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Right side - Results */}
        <Grid item xs={12} md={7}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : payoffPlan ? (
            <>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PaymentsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Total Payoff
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(payoffPlan.totalPayment)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Principal: {formatCurrency(payoffPlan.totalPayment - payoffPlan.totalInterest)}
                        </Typography>
                        <Typography variant="body2" color="error">
                          Interest: {formatCurrency(payoffPlan.totalInterest)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingDownIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Debt Free In
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="primary">
                        {payoffPlan.payoffMonths} months
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Debt free by {payoffPlan.payoffDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Payoff Visualization */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Payoff Timeline
                </Typography>
                
                <Box sx={{ height: 300, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getPayoffChartData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      {payoffPlan.debts.map((debt, index) => (
                        <Line 
                          key={debt.id}
                          type="monotone" 
                          dataKey={debt.name} 
                          stroke={`hsl(${index * 137.5}, 70%, 45%)`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                
                <Typography variant="subtitle2">
                  Principal vs. Interest
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getInterestPieChartData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#4caf50" />
                            <Cell fill="#f44336" />
                          </Pie>
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    <Box>
                      <Typography variant="body2" paragraph>
                        With your selected strategy and extra payments, you'll pay a total of <strong>{formatCurrency(payoffPlan.totalInterest)}</strong> in interest over the life of your debts.
                      </Typography>
                      <Typography variant="body2">
                        The chart shows your balance reduction over time. Each line represents a debt being paid down according to the {strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} method.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Payoff Schedule */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Debt Payoff Schedule
                  </Typography>
                  
                  <Tooltip title="Shows when each debt will be paid off">
                    <InfoOutlinedIcon color="action" />
                  </Tooltip>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Debt</TableCell>
                        <TableCell align="right">Original Balance</TableCell>
                        <TableCell align="right">Interest Rate</TableCell>
                        <TableCell align="right">Payoff Date</TableCell>
                        <TableCell align="right">Interest Paid</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(strategy === 'avalanche'
                        ? [...payoffPlan.debts].sort((a, b) => b.interestRate - a.interestRate)
                        : [...payoffPlan.debts].sort((a, b) => a.originalBalance - b.originalBalance)
                      ).map(debt => (
                        <TableRow key={debt.id}>
                          <TableCell>{debt.name}</TableCell>
                          <TableCell align="right">{formatCurrency(debt.originalBalance)}</TableCell>
                          <TableCell align="right">{debt.interestRate}%</TableCell>
                          <TableCell align="right">
                            {debt.payoffDate
                              ? debt.payoffDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short'
                              })
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(debt.totalInterestPaid)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Repayment Strategy Tips:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      <li><strong>Debt Avalanche</strong> (highest interest first) saves the most money.</li>
                      <li><strong>Debt Snowball</strong> (smallest balance first) provides quicker wins for motivation.</li>
                      <li>Adding even small extra payments can significantly reduce your total interest and payoff time.</li>
                    </ul>
                  </Typography>
                </Box>
              </Paper>
            </>
          ) : (
            <Alert severity="info" sx={{ p: 3 }}>
              <Typography variant="body1" gutterBottom>
                Add your debts to see your payoff plan.
              </Typography>
              <Typography variant="body2">
                The debt payoff calculator will help you determine the fastest way to become debt-free by comparing different repayment strategies.
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DebtPayoffCalculator;