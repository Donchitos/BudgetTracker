import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  useTheme,
  Chip,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CalculateIcon from '@mui/icons-material/Calculate';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { format, addMonths } from 'date-fns';

/**
 * Component for modeling "What-If" financial scenarios to help with decision making
 */
const ScenarioPlanner = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { transactions } = useSelector(state => state.transaction);
  const { bills } = useSelector(state => state.bill);
  const { recurringTransactions } = useSelector(state => state.recurringTransaction);
  const { categories } = useSelector(state => state.category);
  
  // State for scenarios
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedScenarios, setComparedScenarios] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [predictionMonths, setPredictionMonths] = useState(12);
  
  // Load saved scenarios from localStorage on component mount
  useEffect(() => {
    const savedScenariosJson = localStorage.getItem('financialScenarios');
    if (savedScenariosJson) {
      try {
        const parsedScenarios = JSON.parse(savedScenariosJson);
        setSavedScenarios(parsedScenarios);
      } catch (e) {
        console.error('Error parsing saved scenarios', e);
      }
    }
    
    // Create default scenario
    createNewScenario();
  }, []);
  
  // Create a new scenario
  const createNewScenario = () => {
    const newScenario = {
      id: Date.now().toString(),
      name: 'New Scenario',
      description: '',
      dateCreated: new Date().toISOString(),
      assumptions: {
        incomeChange: 0,         // Percentage change to income
        expenseChange: 0,        // Percentage change to expenses
        additionalIncome: 0,     // Fixed additional monthly income
        additionalExpenses: 0,   // Fixed additional monthly expenses
        oneTimeIncome: [],       // Array of one-time income events
        oneTimeExpenses: [],     // Array of one-time expense events
        categoryAdjustments: [], // Adjustments to specific categories
      },
      results: null              // Will be populated when calculated
    };
    
    setScenarios([...scenarios, newScenario]);
    setActiveScenario(newScenario.id);
  };
  
  // Clone a scenario
  const cloneScenario = (scenarioId) => {
    const scenarioToClone = scenarios.find(s => s.id === scenarioId) || 
                           savedScenarios.find(s => s.id === scenarioId);
    
    if (scenarioToClone) {
      const clonedScenario = {
        ...scenarioToClone,
        id: Date.now().toString(),
        name: `${scenarioToClone.name} (Copy)`,
        dateCreated: new Date().toISOString(),
        assumptions: {
          ...scenarioToClone.assumptions,
          oneTimeIncome: [...scenarioToClone.assumptions.oneTimeIncome],
          oneTimeExpenses: [...scenarioToClone.assumptions.oneTimeExpenses],
          categoryAdjustments: [...scenarioToClone.assumptions.categoryAdjustments],
        }
      };
      
      setScenarios([...scenarios, clonedScenario]);
      setActiveScenario(clonedScenario.id);
    }
  };
  
  // Delete a scenario
  const deleteScenario = (scenarioId) => {
    const updatedScenarios = scenarios.filter(s => s.id !== scenarioId);
    setScenarios(updatedScenarios);
    
    // If the active scenario was deleted, set a new active scenario
    if (activeScenario === scenarioId) {
      setActiveScenario(updatedScenarios.length > 0 ? updatedScenarios[0].id : null);
      
      // If there are no more scenarios, create a new one
      if (updatedScenarios.length === 0) {
        createNewScenario();
      }
    }
  };
  
  // Delete a saved scenario
  const deleteSavedScenario = (scenarioId) => {
    const updatedSavedScenarios = savedScenarios.filter(s => s.id !== scenarioId);
    setSavedScenarios(updatedSavedScenarios);
    
    // Update localStorage
    localStorage.setItem('financialScenarios', JSON.stringify(updatedSavedScenarios));
    
    // Remove from comparison if it's being compared
    if (comparedScenarios.includes(scenarioId)) {
      setComparedScenarios(comparedScenarios.filter(id => id !== scenarioId));
    }
  };
  
  // Load a saved scenario
  const loadSavedScenario = (scenarioId) => {
    const scenarioToLoad = savedScenarios.find(s => s.id === scenarioId);
    
    if (scenarioToLoad) {
      // Check if the scenario is already loaded
      if (!scenarios.some(s => s.id === scenarioId)) {
        setScenarios([...scenarios, scenarioToLoad]);
      }
      
      setActiveScenario(scenarioId);
    }
  };
  
  // Get the current active scenario object
  const currentScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenario) || null;
  }, [scenarios, activeScenario]);
  
  // Update scenario assumptions
  const updateAssumption = (key, value) => {
    if (!currentScenario) return;
    
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === activeScenario) {
        return {
          ...scenario,
          assumptions: {
            ...scenario.assumptions,
            [key]: value
          },
          // Clear results when assumptions change
          results: null
        };
      }
      return scenario;
    });
    
    setScenarios(updatedScenarios);
  };
  
  // Add a one-time income or expense
  const addOneTimeItem = (type, item) => {
    if (!currentScenario) return;
    
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === activeScenario) {
        const key = type === 'income' ? 'oneTimeIncome' : 'oneTimeExpenses';
        return {
          ...scenario,
          assumptions: {
            ...scenario.assumptions,
            [key]: [...scenario.assumptions[key], { ...item, id: Date.now().toString() }]
          },
          results: null
        };
      }
      return scenario;
    });
    
    setScenarios(updatedScenarios);
  };
  
  // Remove a one-time income or expense
  const removeOneTimeItem = (type, itemId) => {
    if (!currentScenario) return;
    
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === activeScenario) {
        const key = type === 'income' ? 'oneTimeIncome' : 'oneTimeExpenses';
        return {
          ...scenario,
          assumptions: {
            ...scenario.assumptions,
            [key]: scenario.assumptions[key].filter(item => item.id !== itemId)
          },
          results: null
        };
      }
      return scenario;
    });
    
    setScenarios(updatedScenarios);
  };
  
  // Add a category adjustment
  const addCategoryAdjustment = (adjustment) => {
    if (!currentScenario) return;
    
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === activeScenario) {
        return {
          ...scenario,
          assumptions: {
            ...scenario.assumptions,
            categoryAdjustments: [...scenario.assumptions.categoryAdjustments, 
              { ...adjustment, id: Date.now().toString() }]
          },
          results: null
        };
      }
      return scenario;
    });
    
    setScenarios(updatedScenarios);
  };
  
  // Remove a category adjustment
  const removeCategoryAdjustment = (adjustmentId) => {
    if (!currentScenario) return;
    
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === activeScenario) {
        return {
          ...scenario,
          assumptions: {
            ...scenario.assumptions,
            categoryAdjustments: scenario.assumptions.categoryAdjustments
              .filter(adj => adj.id !== adjustmentId)
          },
          results: null
        };
      }
      return scenario;
    });
    
    setScenarios(updatedScenarios);
  };
  
  // Calculate scenario results
  const calculateScenario = () => {
    if (!currentScenario) return;
    
    setLoading(true);
    
    setTimeout(() => {
      try {
        // Get current financial data
        const monthlyIncome = calculateMonthlyIncome();
        const monthlyExpenses = calculateMonthlyExpenses();
        const netMonthly = monthlyIncome - monthlyExpenses;
        
        // Apply scenario assumptions
        const adjustedMonthlyIncome = calculateAdjustedIncome(monthlyIncome);
        const adjustedMonthlyExpenses = calculateAdjustedExpenses(monthlyExpenses);
        const adjustedNetMonthly = adjustedMonthlyIncome - adjustedMonthlyExpenses;
        
        // Generate month-by-month projection
        const projection = generateProjection(
          adjustedMonthlyIncome,
          adjustedMonthlyExpenses,
          predictionMonths
        );
        
        // Calculate summary metrics
        const totalIncome = projection.reduce((sum, month) => sum + month.income, 0);
        const totalExpenses = projection.reduce((sum, month) => sum + month.expenses, 0);
        const netCashflow = totalIncome - totalExpenses;
        const finalBalance = projection[projection.length - 1].balance;
        const averageSavingsRate = (adjustedNetMonthly / adjustedMonthlyIncome) * 100;
        
        // Comparison to current financial situation
        const currentProjection = generateProjection(
          monthlyIncome,
          monthlyExpenses,
          predictionMonths
        );
        
        const currentTotalIncome = currentProjection.reduce((sum, month) => sum + month.income, 0);
        const currentTotalExpenses = currentProjection.reduce((sum, month) => sum + month.expenses, 0);
        const currentNetCashflow = currentTotalIncome - currentTotalExpenses;
        const currentFinalBalance = currentProjection[currentProjection.length - 1].balance;
        
        // Category impact analysis
        const categoryImpact = categories
          .map(category => {
            const adjustment = currentScenario.assumptions.categoryAdjustments
              .find(adj => adj.categoryId === category._id);
            
            if (!adjustment) return null;
            
            return {
              categoryId: category._id,
              name: category.name,
              originalMonthly: calculateCategoryMonthlyExpense(category._id),
              adjustedMonthly: calculateAdjustedCategoryExpense(category._id),
              totalImpact: calculateAdjustedCategoryExpense(category._id) * predictionMonths -
                          calculateCategoryMonthlyExpense(category._id) * predictionMonths
            };
          })
          .filter(item => item !== null);
        
        // Update scenario with results
        const updatedScenarios = scenarios.map(scenario => {
          if (scenario.id === activeScenario) {
            return {
              ...scenario,
              results: {
                calculated: new Date().toISOString(),
                months: predictionMonths,
                summary: {
                  originalMonthlyIncome: monthlyIncome,
                  originalMonthlyExpenses: monthlyExpenses,
                  originalNetMonthly: netMonthly,
                  adjustedMonthlyIncome,
                  adjustedMonthlyExpenses,
                  adjustedNetMonthly,
                  totalIncome,
                  totalExpenses,
                  netCashflow,
                  finalBalance,
                  savingsRate: averageSavingsRate,
                  incomeChange: (adjustedMonthlyIncome - monthlyIncome) / monthlyIncome * 100,
                  expenseChange: (adjustedMonthlyExpenses - monthlyExpenses) / monthlyExpenses * 100,
                  netChange: (adjustedNetMonthly - netMonthly) / (netMonthly !== 0 ? netMonthly : 1) * 100,
                  balanceChange: (finalBalance - currentFinalBalance) / (currentFinalBalance !== 0 ? currentFinalBalance : 1) * 100
                },
                projection,
                categoryImpact,
                comparison: {
                  currentTotalIncome,
                  currentTotalExpenses,
                  currentNetCashflow,
                  currentFinalBalance,
                  totalIncomeChange: (totalIncome - currentTotalIncome) / currentTotalIncome * 100,
                  totalExpenseChange: (totalExpenses - currentTotalExpenses) / currentTotalExpenses * 100,
                  netCashflowChange: (netCashflow - currentNetCashflow) / (currentNetCashflow !== 0 ? currentNetCashflow : 1) * 100,
                  finalBalanceChange: (finalBalance - currentFinalBalance) / (currentFinalBalance !== 0 ? currentFinalBalance : 1) * 100
                }
              }
            };
          }
          return scenario;
        });
        
        setScenarios(updatedScenarios);
        setLoading(false);
        setActiveTab(1); // Switch to Results tab
      } catch (error) {
        console.error('Error calculating scenario', error);
        setLoading(false);
      }
    }, 1000); // Simulated delay for calculation
  };
  
  // Helper to calculate monthly income based on transaction history
  const calculateMonthlyIncome = () => {
    // In a real implementation, this would analyze past transactions
    // For this demo, we'll use a placeholder value
    return 5000;
  };
  
  // Helper to calculate monthly expenses based on transaction history
  const calculateMonthlyExpenses = () => {
    // In a real implementation, this would analyze past transactions
    // For this demo, we'll use a placeholder value
    return 3500;
  };
  
  // Helper to calculate monthly expense for a specific category
  const calculateCategoryMonthlyExpense = (categoryId) => {
    // In a real implementation, this would analyze past transactions
    // For this demo, we'll use a placeholder that varies by category ID
    return 500 + (parseInt(categoryId.slice(-2), 16) % 10) * 100;
  };
  
  // Helper to calculate adjusted income based on scenario assumptions
  const calculateAdjustedIncome = (baseIncome) => {
    if (!currentScenario) return baseIncome;
    
    const { incomeChange, additionalIncome } = currentScenario.assumptions;
    let adjustedIncome = baseIncome * (1 + incomeChange / 100) + additionalIncome;
    
    return adjustedIncome;
  };
  
  // Helper to calculate adjusted expenses based on scenario assumptions
  const calculateAdjustedExpenses = (baseExpenses) => {
    if (!currentScenario) return baseExpenses;
    
    const { expenseChange, additionalExpenses, categoryAdjustments } = currentScenario.assumptions;
    let adjustedExpenses = baseExpenses * (1 + expenseChange / 100) + additionalExpenses;
    
    // Add category-specific adjustments
    categoryAdjustments.forEach(adjustment => {
      if (adjustment.type === 'absolute') {
        // If it's an absolute value, the original expense doesn't matter
        // We just add the difference between the original category expense and the new amount
        const originalCategoryExpense = calculateCategoryMonthlyExpense(adjustment.categoryId);
        adjustedExpenses += adjustment.value - originalCategoryExpense;
      } else if (adjustment.type === 'percentage') {
        // If it's a percentage, we calculate the change based on the original category expense
        const originalCategoryExpense = calculateCategoryMonthlyExpense(adjustment.categoryId);
        adjustedExpenses += originalCategoryExpense * (adjustment.value / 100);
      }
    });
    
    return adjustedExpenses;
  };
  
  // Helper to calculate adjusted category expense based on scenario assumptions
  const calculateAdjustedCategoryExpense = (categoryId) => {
    if (!currentScenario) return calculateCategoryMonthlyExpense(categoryId);
    
    const originalExpense = calculateCategoryMonthlyExpense(categoryId);
    const adjustment = currentScenario.assumptions.categoryAdjustments
      .find(adj => adj.categoryId === categoryId);
    
    if (!adjustment) return originalExpense;
    
    if (adjustment.type === 'absolute') {
      return adjustment.value;
    } else if (adjustment.type === 'percentage') {
      return originalExpense * (1 + adjustment.value / 100);
    }
    
    return originalExpense;
  };
  
  // Generate month-by-month projection
  const generateProjection = (monthlyIncome, monthlyExpenses, months) => {
    const projection = [];
    let balance = 0; // Start with zero balance
    const today = new Date();
    
    for (let i = 0; i < months; i++) {
      const month = addMonths(today, i);
      const monthName = format(month, 'MMM yyyy');
      
      // Start with base monthly income and expenses
      let income = monthlyIncome;
      let expenses = monthlyExpenses;
      
      // Add one-time incomes that occur in this month
      if (currentScenario) {
        currentScenario.assumptions.oneTimeIncome.forEach(item => {
          const itemDate = new Date(item.date);
          if (itemDate.getMonth() === month.getMonth() && 
              itemDate.getFullYear() === month.getFullYear()) {
            income += item.amount;
          }
        });
        
        // Add one-time expenses that occur in this month
        currentScenario.assumptions.oneTimeExpenses.forEach(item => {
          const itemDate = new Date(item.date);
          if (itemDate.getMonth() === month.getMonth() && 
              itemDate.getFullYear() === month.getFullYear()) {
            expenses += item.amount;
          }
        });
      }
      
      const netCashflow = income - expenses;
      balance += netCashflow;
      
      projection.push({
        month: monthName,
        income,
        expenses,
        netCashflow,
        balance
      });
    }
    
    return projection;
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage for display
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Toggle comparison mode
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      // When enabling comparison mode, initialize with the current active scenario
      if (currentScenario?.results && !comparedScenarios.includes(currentScenario.id)) {
        setComparedScenarios([currentScenario.id]);
      }
    }
  };
  
  // Toggle scenario selection for comparison
  const toggleScenarioComparison = (scenarioId) => {
    if (comparedScenarios.includes(scenarioId)) {
      setComparedScenarios(comparedScenarios.filter(id => id !== scenarioId));
    } else {
      setComparedScenarios([...comparedScenarios, scenarioId]);
    }
  };
  
  // Handle saving a scenario
  const handleSaveScenario = () => {
    if (!currentScenario) return;
    
    // Validate
    if (!scenarioName.trim()) {
      alert('Please enter a name for the scenario');
      return;
    }
    
    const scenarioToSave = {
      ...currentScenario,
      name: scenarioName,
      description: scenarioDescription,
      lastSaved: new Date().toISOString()
    };
    
    // Check if the scenario already exists in saved scenarios
    const existingIndex = savedScenarios.findIndex(s => s.id === scenarioToSave.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedSavedScenarios = [...savedScenarios];
      updatedSavedScenarios[existingIndex] = scenarioToSave;
      setSavedScenarios(updatedSavedScenarios);
    } else {
      // Add new
      setSavedScenarios([...savedScenarios, scenarioToSave]);
    }
    
    // Save to localStorage
    localStorage.setItem('financialScenarios', JSON.stringify(
      existingIndex >= 0 
        ? [...savedScenarios.slice(0, existingIndex), scenarioToSave, ...savedScenarios.slice(existingIndex + 1)]
        : [...savedScenarios, scenarioToSave]
    ));
    
    // Update the active scenario's name in the working set
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === activeScenario) {
        return {
          ...scenario,
          name: scenarioName,
          description: scenarioDescription
        };
      }
      return scenario;
    });
    
    setScenarios(updatedScenarios);
    setSaveDialogOpen(false);
  };
  
  // Open the save dialog
  const openSaveDialog = () => {
    if (!currentScenario) return;
    
    setScenarioName(currentScenario.name);
    setScenarioDescription(currentScenario.description);
    setSaveDialogOpen(true);
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          Financial Scenario Planner
        </Typography>
        
        <Box>
          <Tooltip title="Create New Scenario">
            <IconButton 
              onClick={createNewScenario}
              sx={{ color: 'white' }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Save Scenario">
            <IconButton 
              onClick={openSaveDialog}
              disabled={!currentScenario}
              sx={{ color: 'white' }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={comparisonMode ? "Exit Comparison Mode" : "Compare Scenarios"}>
            <IconButton 
              onClick={toggleComparisonMode}
              sx={{ 
                color: 'white',
                bgcolor: comparisonMode ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
              }}
            >
              <CompareArrowsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {comparisonMode ? (
        /* Scenario Comparison View */
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Compare Scenarios
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Select two or more scenarios with calculated results to compare their financial outcomes.
          </Alert>
          
          <Grid container spacing={3}>
            {/* Scenario Selection */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Available Scenarios
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                {[...scenarios, ...savedScenarios]
                  .filter((scenario, index, self) => 
                    // Remove duplicates by ID
                    index === self.findIndex(s => s.id === scenario.id)
                  )
                  .filter(scenario => scenario.results !== null)
                  .map(scenario => (
                    <Card 
                      key={scenario.id} 
                      variant="outlined" 
                      sx={{ 
                        mb: 2,
                        borderColor: comparedScenarios.includes(scenario.id) 
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        borderWidth: comparedScenarios.includes(scenario.id) ? 2 : 1
                      }}
                    >
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {scenario.name}
                          </Typography>
                          
                          <Button
                            size="small"
                            variant={comparedScenarios.includes(scenario.id) ? 'contained' : 'outlined'}
                            color={comparedScenarios.includes(scenario.id) ? 'primary' : 'inherit'}
                            onClick={() => toggleScenarioComparison(scenario.id)}
                          >
                            {comparedScenarios.includes(scenario.id) ? 'Selected' : 'Select'}
                          </Button>
                        </Box>
                        
                        {scenario.description && (
                          <Typography variant="caption" color="text.secondary">
                            {scenario.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                {[...scenarios, ...savedScenarios]
                  .filter((scenario, index, self) => 
                    index === self.findIndex(s => s.id === scenario.id)
                  )
                  .filter(scenario => scenario.results !== null)
                  .length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No scenarios with calculated results available.
                    Calculate results for at least one scenario to enable comparison.
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Comparison Results */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>
                Comparison Results
              </Typography>
              
              {comparedScenarios.length >= 2 ? (
                <>
                  {/* Projection Chart */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Balance Projection
                    </Typography>
                    
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month"
                            type="category" 
                            allowDuplicatedCategory={false} 
                          />
                          <YAxis tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                          <ChartTooltip formatter={(value) => [formatCurrency(value), 'Balance']} />
                          <Legend />
                          
                          {comparedScenarios.map((scenarioId, index) => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            if (!scenario || !scenario.results) return null;
                            
                            const colors = [
                              theme.palette.primary.main,
                              theme.palette.secondary.main,
                              theme.palette.success.main,
                              theme.palette.warning.main,
                              theme.palette.error.main
                            ];
                            
                            return (
                              <Line
                                key={scenarioId}
                                name={scenario.name}
                                data={scenario.results.projection}
                                dataKey="balance"
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            );
                          })}
                          
                          <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                  
                  {/* Comparison Table */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table sx={{ minWidth: 650 }} size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          {comparedScenarios.map(scenarioId => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            return (
                              <TableCell key={scenarioId} align="right">
                                {scenario?.name || 'Unknown'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Monthly Income</TableCell>
                          {comparedScenarios.map(scenarioId => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            return (
                              <TableCell key={scenarioId} align="right">
                                {scenario?.results ? formatCurrency(scenario.results.summary.adjustedMonthlyIncome) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        
                        <TableRow>
                          <TableCell component="th" scope="row">Monthly Expenses</TableCell>
                          {comparedScenarios.map(scenarioId => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            return (
                              <TableCell key={scenarioId} align="right">
                                {scenario?.results ? formatCurrency(scenario.results.summary.adjustedMonthlyExpenses) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        
                        <TableRow>
                          <TableCell component="th" scope="row">Monthly Net Cashflow</TableCell>
                          {comparedScenarios.map(scenarioId => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            return (
                              <TableCell key={scenarioId} align="right" 
                                sx={{ 
                                  color: scenario?.results?.summary.adjustedNetMonthly >= 0 
                                    ? theme.palette.success.main 
                                    : theme.palette.error.main
                                }}
                              >
                                {scenario?.results ? formatCurrency(scenario.results.summary.adjustedNetMonthly) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        
                        <TableRow>
                          <TableCell component="th" scope="row">Savings Rate</TableCell>
                          {comparedScenarios.map(scenarioId => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            return (
                              <TableCell key={scenarioId} align="right"
                                sx={{ 
                                  color: scenario?.results?.summary.savingsRate >= 0 
                                    ? theme.palette.success.main 
                                    : theme.palette.error.main
                                }}
                              >
                                {scenario?.results ? `${scenario.results.summary.savingsRate.toFixed(1)}%` : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        
                        <TableRow>
                          <TableCell component="th" scope="row">Final Balance</TableCell>
                          {comparedScenarios.map(scenarioId => {
                            const scenario = [...scenarios, ...savedScenarios].find(s => s.id === scenarioId);
                            return (
                              <TableCell key={scenarioId} align="right"
                                sx={{ 
                                  color: scenario?.results?.summary.finalBalance >= 0 
                                    ? theme.palette.success.main 
                                    : theme.palette.error.main,
                                  fontWeight: 'bold'
                                }}
                              >
                                {scenario?.results ? formatCurrency(scenario.results.summary.finalBalance) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert severity="warning">
                  Please select at least two scenarios to compare.
                </Alert>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant="outlined"
              onClick={() => setComparisonMode(false)}
            >
              Exit Comparison Mode
            </Button>
          </Box>
        </Box>
      ) : (
        /* Single Scenario View */
        <Box>
          {/* Scenario Selector */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Active Scenario:
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={activeScenario || ''}
                  onChange={(e) => setActiveScenario(e.target.value)}
                  displayEmpty
                >
                  {scenarios.map(scenario => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                      {scenario.results && <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {currentScenario?.results && (
                <Chip 
                  label="Results Available" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircleIcon />}
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            
            <Box>
              <IconButton 
                color="error"
                onClick={() => currentScenario && deleteScenario(currentScenario.id)}
                disabled={!currentScenario}
              >
                <DeleteIcon />
              </IconButton>
              
              <IconButton
                color="primary"
                onClick={() => currentScenario && cloneScenario(currentScenario.id)}
                disabled={!currentScenario}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
            >
              <Tab 
                label="Assumptions" 
                icon={<CalculateIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Results" 
                icon={<AssessmentIcon />} 
                iconPosition="start"
                disabled={!currentScenario?.results}
              />
              <Tab 
                label="Saved Scenarios" 
                icon={<SaveIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {/* Assumptions Tab */}
            {activeTab === 0 && currentScenario && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {currentScenario.name}
                  </Typography>
                  
                  {currentScenario.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {currentScenario.description}
                    </Typography>
                  )}
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Adjust your financial assumptions below to see how they would affect your future finances.
                    Click "Calculate Results" when you're ready to see the projected impact.
                  </Alert>
                </Grid>
                
                {/* Basic Assumptions */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Basic Assumptions" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Income Change (%)"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            }}
                            value={currentScenario.assumptions.incomeChange}
                            onChange={(e) => updateAssumption('incomeChange', Number(e.target.value))}
                            helperText="Percentage increase or decrease to your income"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Expense Change (%)"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            }}
                            value={currentScenario.assumptions.expenseChange}
                            onChange={(e) => updateAssumption('expenseChange', Number(e.target.value))}
                            helperText="Percentage increase or decrease to your expenses"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Additional Monthly Income"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            value={currentScenario.assumptions.additionalIncome}
                            onChange={(e) => updateAssumption('additionalIncome', Number(e.target.value))}
                            helperText="Fixed amount to add to monthly income"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Additional Monthly Expenses"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            value={currentScenario.assumptions.additionalExpenses}
                            onChange={(e) => updateAssumption('additionalExpenses', Number(e.target.value))}
                            helperText="Fixed amount to add to monthly expenses"
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <Typography id="prediction-months-slider" gutterBottom>
                              Prediction Period: {predictionMonths} months
                            </Typography>
                            <Slider
                              aria-labelledby="prediction-months-slider"
                              value={predictionMonths}
                              onChange={(e, newValue) => setPredictionMonths(newValue)}
                              step={1}
                              marks={[
                                { value: 3, label: '3mo' },
                                { value: 6, label: '6mo' },
                                { value: 12, label: '1yr' },
                                { value: 24, label: '2yr' }
                              ]}
                              min={3}
                              max={24}
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* One-Time Events */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="One-Time Events" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            One-time Income
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            {currentScenario.assumptions.oneTimeIncome.map(item => (
                              <Chip
                                key={item.id}
                                label={`${item.description}: ${formatCurrency(item.amount)} (${format(new Date(item.date), 'MMM yyyy')})`}
                                onDelete={() => removeOneTimeItem('income', item.id)}
                                sx={{ m: 0.5 }}
                                color="success"
                              />
                            ))}
                            
                            {currentScenario.assumptions.oneTimeIncome.length === 0 && (
                              <Typography variant="caption" color="text.secondary">
                                No one-time income events added
                              </Typography>
                            )}
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              const description = prompt('Enter description:');
                              if (!description) return;
                              
                              const amount = Number(prompt('Enter amount:'));
                              if (isNaN(amount) || amount <= 0) return;
                              
                              const dateStr = prompt('Enter date (YYYY-MM):');
                              if (!dateStr || !/^\d{4}-\d{2}$/.test(dateStr)) return;
                              
                              const date = new Date(`${dateStr}-01`);
                              
                              addOneTimeItem('income', { description, amount, date });
                            }}
                          >
                            Add One-time Income
                          </Button>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            One-time Expenses
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            {currentScenario.assumptions.oneTimeExpenses.map(item => (
                              <Chip
                                key={item.id}
                                label={`${item.description}: ${formatCurrency(item.amount)} (${format(new Date(item.date), 'MMM yyyy')})`}
                                onDelete={() => removeOneTimeItem('expense', item.id)}
                                sx={{ m: 0.5 }}
                                color="error"
                              />
                            ))}
                            
                            {currentScenario.assumptions.oneTimeExpenses.length === 0 && (
                              <Typography variant="caption" color="text.secondary">
                                No one-time expense events added
                              </Typography>
                            )}
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              const description = prompt('Enter description:');
                              if (!description) return;
                              
                              const amount = Number(prompt('Enter amount:'));
                              if (isNaN(amount) || amount <= 0) return;
                              
                              const dateStr = prompt('Enter date (YYYY-MM):');
                              if (!dateStr || !/^\d{4}-\d{2}$/.test(dateStr)) return;
                              
                              const date = new Date(`${dateStr}-01`);
                              
                              addOneTimeItem('expense', { description, amount, date });
                            }}
                          >
                            Add One-time Expense
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Category Adjustments */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Category-Specific Adjustments" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Adjust specific spending categories to see how targeted changes affect your finances.
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            {currentScenario.assumptions.categoryAdjustments.map(adjustment => {
                              const category = categories.find(c => c._id === adjustment.categoryId);
                              
                              return (
                                <Chip
                                  key={adjustment.id}
                                  label={`${category?.name || 'Unknown'}: ${adjustment.type === 'absolute' 
                                    ? formatCurrency(adjustment.value) 
                                    : `${adjustment.value > 0 ? '+' : ''}${adjustment.value}%`}`}
                                  onDelete={() => removeCategoryAdjustment(adjustment.id)}
                                  sx={{ m: 0.5 }}
                                  color={adjustment.value < 0 ? 'success' : 'error'}
                                />
                              );
                            })}
                            
                            {currentScenario.assumptions.categoryAdjustments.length === 0 && (
                              <Typography variant="caption" color="text.secondary">
                                No category adjustments added
                              </Typography>
                            )}
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              // This would be better with a proper dialog UI in a real app
                              const categoryId = prompt('Enter category ID:');
                              if (!categoryId) return;
                              
                              const type = prompt('Enter adjustment type (absolute or percentage):');
                              if (type !== 'absolute' && type !== 'percentage') return;
                              
                              const value = Number(prompt('Enter adjustment value:'));
                              if (isNaN(value)) return;
                              
                              addCategoryAdjustment({ categoryId, type, value });
                            }}
                          >
                            Add Category Adjustment
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Calculate button */}
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
                    onClick={calculateScenario}
                    disabled={loading}
                  >
                    {loading ? 'Calculating...' : 'Calculate Results'}
                  </Button>
                </Grid>
              </Grid>
            )}
            
            {/* Results Tab */}
            {activeTab === 1 && currentScenario?.results && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {currentScenario.name} - Results
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      Calculated on {format(new Date(currentScenario.results.calculated), 'MMM d, yyyy h:mm a')}
                    </Typography>
                  </Box>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    These projections are based on your current financial data and the assumptions you provided.
                    They represent a simplified model and actual results may vary.
                  </Alert>
                </Grid>
                
                {/* Summary Cards */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.7 }}>
                            Final Balance
                          </Typography>
                          <Typography variant="h5">
                            {formatCurrency(currentScenario.results.summary.finalBalance)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {formatPercentage(currentScenario.results.comparison.finalBalanceChange)} vs current
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.7 }}>
                            Total Income
                          </Typography>
                          <Typography variant="h5">
                            {formatCurrency(currentScenario.results.summary.totalIncome)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {formatPercentage(currentScenario.results.comparison.totalIncomeChange)} vs current
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: theme.palette.error.main, color: 'white' }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.7 }}>
                            Total Expenses
                          </Typography>
                          <Typography variant="h5">
                            {formatCurrency(currentScenario.results.summary.totalExpenses)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {formatPercentage(currentScenario.results.comparison.totalExpenseChange)} vs current
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        bgcolor: currentScenario.results.summary.savingsRate >= 0 
                          ? theme.palette.success.main 
                          : theme.palette.error.main,
                        color: 'white'
                      }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.7 }}>
                            Savings Rate
                          </Typography>
                          <Typography variant="h5">
                            {currentScenario.results.summary.savingsRate.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {formatCurrency(currentScenario.results.summary.adjustedNetMonthly)} monthly
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                
                {/* Projection Chart */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Balance Projection" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={currentScenario.results.projection}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                            <ChartTooltip formatter={(value) => [formatCurrency(value), 'Balance']} />
                            <defs>
                              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="balance" 
                              stroke={theme.palette.primary.main} 
                              fillOpacity={1} 
                              fill="url(#colorBalance)" 
                            />
                            <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Monthly Details */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Monthly Breakdown" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent sx={{ p: 0 }}>
                      <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Month</TableCell>
                              <TableCell align="right">Income</TableCell>
                              <TableCell align="right">Expenses</TableCell>
                              <TableCell align="right">Net</TableCell>
                              <TableCell align="right">Balance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {currentScenario.results.projection.map((month) => (
                              <TableRow key={month.month}>
                                <TableCell component="th" scope="row">
                                  {month.month}
                                </TableCell>
                                <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                                  {formatCurrency(month.income)}
                                </TableCell>
                                <TableCell align="right" sx={{ color: theme.palette.error.main }}>
                                  {formatCurrency(month.expenses)}
                                </TableCell>
                                <TableCell 
                                  align="right"
                                  sx={{ 
                                    color: month.netCashflow >= 0 
                                      ? theme.palette.success.main 
                                      : theme.palette.error.main
                                  }}
                                >
                                  {formatCurrency(month.netCashflow)}
                                </TableCell>
                                <TableCell 
                                  align="right"
                                  sx={{ 
                                    color: month.balance >= 0 
                                      ? theme.palette.success.main 
                                      : theme.palette.error.main,
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {formatCurrency(month.balance)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Category Impact */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Category Impact" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      {currentScenario.results.categoryImpact.length > 0 ? (
                        <Box>
                          <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Category</TableCell>
                                  <TableCell align="right">Original</TableCell>
                                  <TableCell align="right">Adjusted</TableCell>
                                  <TableCell align="right">Total Impact</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {currentScenario.results.categoryImpact.map((category) => (
                                  <TableRow key={category.categoryId}>
                                    <TableCell component="th" scope="row">
                                      {category.name}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(category.originalMonthly)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(category.adjustedMonthly)}
                                    </TableCell>
                                    <TableCell 
                                      align="right"
                                      sx={{ 
                                        color: category.totalImpact <= 0 
                                          ? theme.palette.success.main 
                                          : theme.palette.error.main,
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {formatCurrency(category.totalImpact)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box sx={{ py: 5, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No category-specific adjustments were made in this scenario.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Call-to-Action */}
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setActiveTab(0)}
                      sx={{ mr: 2 }}
                    >
                      Edit Assumptions
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={openSaveDialog}
                    >
                      Save Scenario
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {/* Saved Scenarios Tab */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Saved Scenarios
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your saved financial scenarios are stored locally on your device.
                  </Typography>
                </Grid>
                
                {savedScenarios.length > 0 ? (
                  savedScenarios.map(scenario => (
                    <Grid item xs={12} md={6} lg={4} key={scenario.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1">
                              {scenario.name}
                            </Typography>
                            
                            <Box>
                              <Tooltip title="Delete Scenario">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => deleteSavedScenario(scenario.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          
                          {scenario.description && (
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {scenario.description}
                            </Typography>
                          )}
                          
                          <Typography variant="caption" color="text.secondary" display="block">
                            Created: {format(new Date(scenario.dateCreated), 'MMM d, yyyy')}
                          </Typography>
                          
                          {scenario.lastSaved && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last saved: {format(new Date(scenario.lastSaved), 'MMM d, yyyy')}
                            </Typography>
                          )}
                          
                          {scenario.results && (
                            <Box sx={{ mt: 2 }}>
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Monthly Net:
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: scenario.results.summary.adjustedNetMonthly >= 0 
                                        ? theme.palette.success.main 
                                        : theme.palette.error.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {formatCurrency(scenario.results.summary.adjustedNetMonthly)}
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Final Balance:
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: scenario.results.summary.finalBalance >= 0 
                                        ? theme.palette.success.main 
                                        : theme.palette.error.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {formatCurrency(scenario.results.summary.finalBalance)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            onClick={() => loadSavedScenario(scenario.id)}
                          >
                            Load Scenario
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" paragraph>
                        You don't have any saved scenarios yet.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          createNewScenario();
                          setActiveTab(0);
                        }}
                      >
                        Create Your First Scenario
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Box>
      )}
      
      {/* Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Scenario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Scenario Name"
            type="text"
            fullWidth
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            variant="outlined"
            required
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            type="text"
            fullWidth
            value={scenarioDescription}
            onChange={(e) => setScenarioDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveScenario} 
            variant="contained" 
            color="primary"
            disabled={!scenarioName.trim()}
          >
            Save Scenario
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ScenarioPlanner;