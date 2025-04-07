import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Slider,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Alert,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';

/**
 * Retirement Calculator component
 * Helps users plan and visualize their retirement savings
 */
const RetirementCalculator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Calculate default retirement age based on current year
  const defaultRetirementAge = 65;
  const defaultCurrentAge = 30;
  
  // State for calculator inputs
  const [inputs, setInputs] = useState({
    currentAge: defaultCurrentAge,
    retirementAge: defaultRetirementAge,
    lifeExpectancy: 85,
    currentSavings: 50000,
    monthlyContribution: 500,
    annualReturnRate: 7,
    inflationRate: 2.5,
    desiredRetirementIncome: 60000,
    socialSecurityIncome: 1500, // monthly
    otherIncomeMonthly: 0
  });
  
  // State for calculator results
  const [results, setResults] = useState(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Calculate retirement projection when inputs change
  useEffect(() => {
    calculateRetirement();
  }, [inputs]);
  
  // Handle input change for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Handle slider change
  const handleSliderChange = (name) => (event, newValue) => {
    setInputs(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Reset calculator to defaults
  const handleReset = () => {
    setInputs({
      currentAge: defaultCurrentAge,
      retirementAge: defaultRetirementAge,
      lifeExpectancy: 85,
      currentSavings: 50000,
      monthlyContribution: 500,
      annualReturnRate: 7,
      inflationRate: 2.5,
      desiredRetirementIncome: 60000,
      socialSecurityIncome: 1500,
      otherIncomeMonthly: 0
    });
  };
  
  // Calculate retirement projections
  const calculateRetirement = () => {
    const {
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      monthlyContribution,
      annualReturnRate,
      inflationRate,
      desiredRetirementIncome,
      socialSecurityIncome,
      otherIncomeMonthly
    } = inputs;
    
    // Validation
    if (currentAge >= retirementAge || retirementAge >= lifeExpectancy) {
      return;
    }
    
    // Constants and conversions
    const yearsUntilRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    const monthlyReturnRate = Math.pow(1 + annualReturnRate / 100, 1/12) - 1;
    const monthlyInflationRate = Math.pow(1 + inflationRate / 100, 1/12) - 1;
    
    // Calculate retirement needs in today's dollars
    const monthlyNeeds = desiredRetirementIncome / 12;
    const monthlyIncome = socialSecurityIncome + otherIncomeMonthly;
    const monthlyGap = monthlyNeeds - monthlyIncome;
    const yearlyGap = monthlyGap * 12;
    
    // Calculate future value of the gap (accounting for inflation)
    const futureYearlyGap = yearlyGap * Math.pow(1 + inflationRate / 100, yearsUntilRetirement);
    
    // Calculate required nest egg for retirement (using 4% withdrawal rule as a default)
    const withdrawalRate = 0.04; // 4% rule
    const requiredNestEgg = futureYearlyGap / withdrawalRate;
    
    // Project savings growth until retirement
    let projectedSavings = currentSavings;
    for (let month = 1; month <= yearsUntilRetirement * 12; month++) {
      projectedSavings *= (1 + monthlyReturnRate);
      projectedSavings += monthlyContribution;
    }
    
    // Calculate monthly savings needed to reach the goal
    let monthlySavingsNeeded = 0;
    if (projectedSavings < requiredNestEgg) {
      const PMT = (r, nper, pv, fv) => {
        return -r * (pv * Math.pow(1 + r, nper) + fv) / ((1 + r) * (Math.pow(1 + r, nper) - 1));
      };
      monthlySavingsNeeded = PMT(
        monthlyReturnRate,
        yearsUntilRetirement * 12,
        currentSavings,
        requiredNestEgg
      );
    }
    
    // Generate yearly projection data for charts
    const yearlyData = [];
    let currentYear = new Date().getFullYear();
    let runningBalance = currentSavings;
    let monthlyContributionValue = monthlyContribution;
    
    // Pre-retirement growth
    for (let year = 0; year <= yearsUntilRetirement; year++) {
      // Account for inflation in contributions (assuming contributions increase with inflation)
      if (year > 0) {
        monthlyContributionValue *= (1 + inflationRate / 100);
      }
      
      // Calculate year-end balance
      const yearLabel = currentYear + year;
      const age = currentAge + year;
      
      yearlyData.push({
        year: yearLabel,
        age,
        balance: runningBalance,
        isRetirementYear: year === yearsUntilRetirement
      });
      
      if (year < yearsUntilRetirement) {
        // Update balance for next year
        for (let month = 1; month <= 12; month++) {
          runningBalance *= (1 + monthlyReturnRate);
          runningBalance += monthlyContribution;
        }
      }
    }
    
    // Post-retirement (withdrawal phase)
    let monthlyWithdrawal = futureYearlyGap / 12;
    for (let year = 1; year <= yearsInRetirement; year++) {
      // Increase withdrawal for inflation
      monthlyWithdrawal *= (1 + inflationRate / 100);
      
      // Calculate year-end balance
      const yearLabel = currentYear + yearsUntilRetirement + year;
      const age = retirementAge + year;
      
      // Update balance for the year (with withdrawals)
      for (let month = 1; month <= 12; month++) {
        runningBalance *= (1 + monthlyReturnRate);
        runningBalance -= monthlyWithdrawal;
      }
      
      // Check if balance went negative
      if (runningBalance < 0) {
        runningBalance = 0;
      }
      
      yearlyData.push({
        year: yearLabel,
        age,
        balance: runningBalance,
        isRetirementYear: false
      });
      
      // Stop if funds are depleted
      if (runningBalance <= 0) break;
    }
    
    // Calculate savings ratio
    const annualIncome = desiredRetirementIncome; // We use the desired retirement income as a proxy for current income
    const savingsRatio = (monthlyContribution * 12 / annualIncome) * 100;
    
    // Calculate funding ratio (how much of the required nest egg is projected to be saved)
    const fundingRatio = Math.min(100, (projectedSavings / requiredNestEgg) * 100);
    
    // Set results
    setResults({
      yearsUntilRetirement,
      yearsInRetirement,
      requiredNestEgg,
      projectedSavings,
      monthlySavingsNeeded,
      yearlyData,
      monthlyGap,
      fundingRatio,
      savingsRatio
    });
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatLargeNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Retirement Calculator
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left side - Inputs */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Information
              </Typography>
              <IconButton size="small" onClick={handleReset}>
                <RestartAltIcon />
              </IconButton>
            </Box>
            
            {/* Age and Timeline Inputs */}
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
              Timeline
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Current Age"
                  name="currentAge"
                  value={inputs.currentAge}
                  onChange={handleInputChange}
                  type="number"
                  InputProps={{ inputProps: { min: 18, max: 100 } }}
                  fullWidth
                  size="small"
                  margin="dense"
                />
                <Slider
                  value={inputs.currentAge}
                  onChange={handleSliderChange('currentAge')}
                  min={18}
                  max={100}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Retirement Age"
                  name="retirementAge"
                  value={inputs.retirementAge}
                  onChange={handleInputChange}
                  type="number"
                  InputProps={{ inputProps: { min: 18, max: 100 } }}
                  fullWidth
                  size="small"
                  margin="dense"
                />
                <Slider
                  value={inputs.retirementAge}
                  onChange={handleSliderChange('retirementAge')}
                  min={18}
                  max={100}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Life Expectancy"
                  name="lifeExpectancy"
                  value={inputs.lifeExpectancy}
                  onChange={handleInputChange}
                  type="number"
                  InputProps={{ inputProps: { min: 18, max: 120 } }}
                  fullWidth
                  size="small"
                  margin="dense"
                />
                <Slider
                  value={inputs.lifeExpectancy}
                  onChange={handleSliderChange('lifeExpectancy')}
                  min={50}
                  max={120}
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            {/* Savings Inputs */}
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalanceIcon fontSize="small" sx={{ mr: 1 }} />
              Savings
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Current Retirement Savings"
                  name="currentSavings"
                  value={inputs.currentSavings}
                  onChange={handleInputChange}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Monthly Contribution"
                  name="monthlyContribution"
                  value={inputs.monthlyContribution}
                  onChange={handleInputChange}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                  fullWidth
                  size="small"
                  margin="dense"
                />
                <Slider
                  value={inputs.monthlyContribution}
                  onChange={handleSliderChange('monthlyContribution')}
                  min={0}
                  max={3000}
                  step={50}
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            {/* Rate Inputs */}
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
              Rates & Returns
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Annual Return Rate"
                    name="annualReturnRate"
                    value={inputs.annualReturnRate}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 20, step: 0.1 }
                    }}
                    fullWidth
                    size="small"
                    margin="dense"
                  />
                  <Tooltip title="The average annual return on your investments before retirement. Historically, a diversified portfolio has averaged 7-8% return over the long term.">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={inputs.annualReturnRate}
                  onChange={handleSliderChange('annualReturnRate')}
                  min={0}
                  max={12}
                  step={0.1}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Inflation Rate"
                    name="inflationRate"
                    value={inputs.inflationRate}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 10, step: 0.1 }
                    }}
                    fullWidth
                    size="small"
                    margin="dense"
                  />
                  <Tooltip title="The average annual rate at which the cost of goods and services increases. Historically, inflation has averaged 2-3% in the United States.">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={inputs.inflationRate}
                  onChange={handleSliderChange('inflationRate')}
                  min={0}
                  max={10}
                  step={0.1}
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            {/* Retirement Income Inputs */}
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              Retirement Income Needs
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Desired Annual Income"
                    name="desiredRetirementIncome"
                    value={inputs.desiredRetirementIncome}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                    fullWidth
                    size="small"
                    margin="dense"
                  />
                  <Tooltip title="Your target annual income during retirement, in today's dollars. A common guideline is 70-80% of your pre-retirement income.">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Slider
                  value={inputs.desiredRetirementIncome}
                  onChange={handleSliderChange('desiredRetirementIncome')}
                  min={20000}
                  max={200000}
                  step={5000}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Monthly Social Security"
                    name="socialSecurityIncome"
                    value={inputs.socialSecurityIncome}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                    fullWidth
                    size="small"
                    margin="dense"
                  />
                  <Tooltip title="Estimated monthly Social Security benefit. The average benefit is around $1,500 per month.">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Right side - Results */}
        <Grid item xs={12} md={7}>
          {results && (
            <>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        You'll Need
                      </Typography>
                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                        {formatCurrency(results.requiredNestEgg)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by age {inputs.retirementAge}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Projected Savings
                      </Typography>
                      <Typography variant="h4" sx={{ mb: 1 }} color={results.projectedSavings >= results.requiredNestEgg ? 'success.main' : 'warning.main'}>
                        {formatCurrency(results.projectedSavings)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {results.fundingRatio.toFixed(0)}% funded
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Monthly Savings Needed
                      </Typography>
                      <Typography variant="h4" color={results.monthlySavingsNeeded > inputs.monthlyContribution ? 'error.main' : 'success.main'} sx={{ mb: 1 }}>
                        {formatCurrency(results.monthlySavingsNeeded)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {results.monthlySavingsNeeded > inputs.monthlyContribution
                          ? `${formatCurrency(results.monthlySavingsNeeded - inputs.monthlyContribution)} more needed`
                          : "You're on track!"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Projection Charts */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : false}
                  >
                    <Tab label="Savings Projection" />
                    <Tab label="Retirement Income" />
                  </Tabs>
                </Box>
                
                {/* Savings Projection Chart */}
                {activeTab === 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Retirement Savings Growth
                    </Typography>
                    
                    <Box sx={{ height: 400, mb: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={results.yearlyData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="year" 
                            tickFormatter={(tick) => tick % 5 === 0 ? tick : ''}
                          />
                          <YAxis 
                            tickFormatter={(tick) => formatLargeNumber(tick)}
                          />
                          <RechartsTooltip 
                            formatter={(value) => formatCurrency(value)}
                            labelFormatter={(value) => `Year: ${value} (Age: ${results.yearlyData.find(d => d.year === value)?.age})`}
                          />
                          <ReferenceLine
                            x={results.yearlyData.find(d => d.isRetirementYear)?.year}
                            stroke="#ff7300"
                            label={<Label value="Retirement" position="top" />}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="balance" 
                            name="Savings Balance"
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3}
                          />
                          <ReferenceLine 
                            y={results.requiredNestEgg} 
                            label={<Label value="Required Amount" position="left" />} 
                            stroke="red" 
                            strokeDasharray="3 3" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      This chart shows your projected retirement savings growth over time. The vertical line represents your retirement age, and the horizontal line shows your required nest egg amount.
                    </Typography>
                  </>
                )}
                
                {/* Retirement Income Chart */}
                {activeTab === 1 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Retirement Income Breakdown
                    </Typography>
                    
                    <Box sx={{ height: 300, mb: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { name: 'Monthly Income', Gap: results.monthlyGap, SocialSecurity: inputs.socialSecurityIncome, Other: inputs.otherIncomeMonthly }
                          ]}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(tick) => `$${tick}`} />
                          <YAxis type="category" dataKey="name" />
                          <RechartsTooltip />
                          <Area 
                            dataKey="Gap" 
                            stackId="1" 
                            stroke="#f44336" 
                            fill="#f44336" 
                            name="Income Gap (From Savings)" 
                          />
                          <Area 
                            dataKey="SocialSecurity" 
                            stackId="1" 
                            stroke="#4caf50" 
                            fill="#4caf50" 
                            name="Social Security" 
                          />
                          <Area 
                            dataKey="Other" 
                            stackId="1" 
                            stroke="#2196f3" 
                            fill="#2196f3" 
                            name="Other Income" 
                          />
                          <Legend />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This chart shows your expected monthly income sources during retirement. The gap will need to be filled by withdrawals from your retirement savings.
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Retirement Income Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Monthly Income Need:</strong> {formatCurrency(inputs.desiredRetirementIncome / 12)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Social Security:</strong> {formatCurrency(inputs.socialSecurityIncome)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Other Income:</strong> {formatCurrency(inputs.otherIncomeMonthly)}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            <strong>Monthly Gap:</strong> {formatCurrency(results.monthlyGap)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Annual Withdrawal:</strong> {formatCurrency(results.monthlyGap * 12)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Withdrawal Rate:</strong> {((results.monthlyGap * 12 / results.requiredNestEgg) * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">
                            <strong>Years in Retirement:</strong> {results.yearsInRetirement}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}
              </Paper>
              
              {/* Recommendations */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Retirement Planning Insights
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Current Status
                    </Typography>
                    
                    {results.projectedSavings >= results.requiredNestEgg ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        You're on track to meet your retirement goals!
                      </Alert>
                    ) : (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        You may not have enough saved for retirement at your current rate.
                      </Alert>
                    )}
                    
                    <Typography variant="body2" paragraph>
                      <strong>Funding Ratio:</strong> {results.fundingRatio.toFixed(0)}% (Your projected savings divided by what you'll need)
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      <strong>Savings Rate:</strong> {results.savingsRatio.toFixed(1)}% of income
                      {results.savingsRatio < 15 && " (Experts recommend saving at least 15% of income for retirement)"}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Years Until Retirement:</strong> {results.yearsUntilRetirement}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommendations
                    </Typography>
                    
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {results.monthlySavingsNeeded > inputs.monthlyContribution && (
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            Increase your monthly contributions by at least {formatCurrency(results.monthlySavingsNeeded - inputs.monthlyContribution)} to stay on track.
                          </Typography>
                        </Box>
                      )}
                      
                      {inputs.annualReturnRate < 5 && (
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            Consider a more aggressive investment strategy to increase your returns. The historical average for a balanced portfolio is 7-8%.
                          </Typography>
                        </Box>
                      )}
                      
                      {inputs.retirementAge < 65 && (
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            Delaying retirement even by a few years can significantly increase your retirement security.
                          </Typography>
                        </Box>
                      )}
                      
                      {results.fundingRatio < 70 && (
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            Your projected savings falls short of your needs. Consider increasing savings, adjusting retirement age, or reducing income needs.
                          </Typography>
                        </Box>
                      )}
                      
                      <Box component="li" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          Maximize tax-advantaged accounts like 401(k)s and IRAs before investing in taxable accounts.
                        </Typography>
                      </Box>
                      
                      <Box component="li">
                        <Typography variant="body2">
                          Review and adjust your retirement plan annually as your life circumstances change.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
          
          {!results && (
            <Alert severity="info" sx={{ p: 3 }}>
              <Typography variant="body1" gutterBottom>
                Enter your information to calculate your retirement projections.
              </Typography>
              <Typography variant="body2">
                This calculator will help you determine if you're on track for a secure retirement and how much you should be saving.
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetirementCalculator;