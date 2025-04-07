const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');
const RecurringTransaction = require('../models/RecurringTransaction.model');
const BudgetTemplate = require('../models/BudgetTemplate.model');
const { 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  isWithinInterval,
  format,
  parseISO,
  differenceInMonths,
  differenceInDays,
  addDays,
  isAfter,
  isBefore
} = require('date-fns');

/**
 * Generate expense forecasts based on historical data and recurring transactions
 * @param {String} userId - User ID
 * @param {Object} options - Options for forecast
 * @returns {Object} Forecast data
 */
exports.generateExpenseForecast = async (userId, options = {}) => {
  const { months = 3, includeSavings = true, includeIncome = true } = options;
  
  // Get current date and date ranges
  const now = new Date();
  const historyMonths = 6; // Number of months to analyze for patterns
  
  // Get historical data
  const startDate = startOfMonth(subMonths(now, historyMonths));
  const historicalTransactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: now }
  }).populate('category', 'name color type');
  
  // Get recurring transactions
  const recurringTransactions = await RecurringTransaction.find({
    user: userId,
    isActive: true
  }).populate('category', 'name color type');
  
  // Get budget templates
  const budgetTemplates = await BudgetTemplate.find({
    user: userId
  }).populate('category', 'name color type');
  
  // Get categories
  const categories = await Category.find({ user: userId });
  
  // Analyze historical spending patterns by category
  const categoryPatterns = analyzeCategoryPatterns(historicalTransactions, categories);
  
  // Generate forecast for future months
  const forecast = [];
  
  for (let i = 0; i < months; i++) {
    const month = addMonths(now, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Initialize monthly forecast
    const monthlyForecast = {
      month: format(month, 'yyyy-MM'),
      monthName: format(month, 'MMMM yyyy'),
      expenses: [],
      income: [],
      summary: {
        totalExpenses: 0,
        totalIncome: 0,
        netCashflow: 0,
        savingsRate: 0
      }
    };
    
    // Add recurring transactions
    for (const transaction of recurringTransactions) {
      // Calculate if this transaction occurs in this forecast month
      const occurrences = calculateRecurringOccurrences(transaction, monthStart, monthEnd);
      
      for (const occurrence of occurrences) {
        const forecastItem = {
          description: transaction.description,
          amount: transaction.amount,
          date: occurrence,
          category: transaction.category,
          type: transaction.type,
          confidence: 0.9, // High confidence for recurring transactions
          source: 'recurring'
        };
        
        if (transaction.type === 'expense') {
          monthlyForecast.expenses.push(forecastItem);
          monthlyForecast.summary.totalExpenses += transaction.amount;
        } else if (includeIncome && transaction.type === 'income') {
          monthlyForecast.income.push(forecastItem);
          monthlyForecast.summary.totalIncome += transaction.amount;
        }
      }
    }
    
    // Add predicted expenses based on historical patterns
    for (const [categoryId, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.transactions.length === 0) continue;
      
      // Skip if this is a savings category and we're not including savings
      const category = categories.find(cat => cat._id.toString() === categoryId);
      if (!includeSavings && category && category.type === 'savings') continue;
      
      // Skip income if we're not including it
      if (!includeIncome && pattern.type === 'income') continue;
      
      // Calculate predicted amount based on pattern
      let predictedAmount = 0;
      
      if (pattern.frequency === 'monthly') {
        predictedAmount = pattern.averageMonthly;
      } else if (pattern.frequency === 'bimonthly') {
        // Alternate months
        if (i % 2 === pattern.offset % 2) {
          predictedAmount = pattern.averageAmount;
        }
      } else if (pattern.frequency === 'quarterly') {
        // Every 3 months
        if (i % 3 === pattern.offset % 3) {
          predictedAmount = pattern.averageAmount;
        }
      } else if (pattern.frequency === 'variable') {
        // Variable spending - use average with some randomness
        const variability = 0.2; // 20% variability
        const randomFactor = 1 + (Math.random() * variability * 2 - variability);
        predictedAmount = pattern.averageMonthly * randomFactor;
      }
      
      if (predictedAmount > 0) {
        // Only add non-recurring predictions (to avoid double-counting)
        if (!pattern.isMainlyRecurring) {
          const forecastItem = {
            description: `Predicted ${category ? category.name : 'Uncategorized'}`,
            amount: predictedAmount,
            date: addDays(monthStart, Math.floor(Math.random() * 28)), // Random day in month
            category: category ? {
              _id: category._id,
              name: category.name,
              color: category.color,
              type: category.type
            } : null,
            type: pattern.type,
            confidence: pattern.confidence,
            source: 'prediction'
          };
          
          if (pattern.type === 'expense') {
            monthlyForecast.expenses.push(forecastItem);
            monthlyForecast.summary.totalExpenses += predictedAmount;
          } else if (includeIncome && pattern.type === 'income') {
            monthlyForecast.income.push(forecastItem);
            monthlyForecast.summary.totalIncome += predictedAmount;
          }
        }
      }
    }
    
    // Add budget template items for categories without historical data
    for (const template of budgetTemplates) {
      const categoryId = template.category ? template.category._id.toString() : 'uncategorized';
      
      // Skip categories that already have predictions
      if (categoryPatterns[categoryId] && 
          (categoryPatterns[categoryId].transactions.length > 0 || 
           categoryPatterns[categoryId].isMainlyRecurring)) {
        continue;
      }
      
      // Skip if this is a savings category and we're not including savings
      if (!includeSavings && template.category && template.category.type === 'savings') continue;
      
      const forecastItem = {
        description: `Budgeted ${template.category ? template.category.name : 'Uncategorized'}`,
        amount: template.amount,
        date: addDays(monthStart, 15), // Middle of month
        category: template.category,
        type: 'expense', // Budget templates are for expenses
        confidence: 0.6, // Medium confidence
        source: 'budget'
      };
      
      monthlyForecast.expenses.push(forecastItem);
      monthlyForecast.summary.totalExpenses += template.amount;
    }
    
    // Calculate summary
    monthlyForecast.summary.netCashflow = monthlyForecast.summary.totalIncome - monthlyForecast.summary.totalExpenses;
    monthlyForecast.summary.savingsRate = monthlyForecast.summary.totalIncome > 0 
      ? (monthlyForecast.summary.netCashflow / monthlyForecast.summary.totalIncome) * 100 
      : 0;
    
    // Sort transactions by date
    monthlyForecast.expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    monthlyForecast.income.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    forecast.push(monthlyForecast);
  }
  
  // Calculate overall summary
  const overallSummary = {
    totalMonths: months,
    averageMonthlyExpenses: forecast.reduce((sum, month) => sum + month.summary.totalExpenses, 0) / months,
    averageMonthlyIncome: forecast.reduce((sum, month) => sum + month.summary.totalIncome, 0) / months,
    averageNetCashflow: forecast.reduce((sum, month) => sum + month.summary.netCashflow, 0) / months,
    averageSavingsRate: forecast.reduce((sum, month) => sum + month.summary.savingsRate, 0) / months,
  };
  
  return {
    forecast,
    summary: overallSummary
  };
};

/**
 * Analyze transaction patterns by category
 * @param {Array} transactions - Historical transactions
 * @param {Array} categories - User categories
 * @returns {Object} Category patterns
 */
function analyzeCategoryPatterns(transactions, categories) {
  const patterns = {};
  
  // Initialize patterns for each category
  categories.forEach(category => {
    patterns[category._id.toString()] = {
      transactions: [],
      type: category.type === 'income' ? 'income' : 'expense',
      frequency: 'variable', // default
      totalAmount: 0,
      averageAmount: 0,
      averageMonthly: 0,
      regularity: 0, // 0-1 scale
      confidence: 0.5, // 0-1 scale
      isMainlyRecurring: false,
      offset: 0
    };
  });
  
  // Add uncategorized pattern
  patterns['uncategorized'] = {
    transactions: [],
    type: 'expense',
    frequency: 'variable',
    totalAmount: 0,
    averageAmount: 0,
    averageMonthly: 0,
    regularity: 0,
    confidence: 0.4,
    isMainlyRecurring: false,
    offset: 0
  };
  
  // Group transactions by category
  transactions.forEach(transaction => {
    const categoryId = transaction.category ? transaction.category._id.toString() : 'uncategorized';
    
    if (!patterns[categoryId]) {
      // Handle case where transaction has a category not in the categories array
      patterns[categoryId] = {
        transactions: [],
        type: transaction.type,
        frequency: 'variable',
        totalAmount: 0,
        averageAmount: 0,
        averageMonthly: 0,
        regularity: 0,
        confidence: 0.5,
        isMainlyRecurring: false,
        offset: 0
      };
    }
    
    patterns[categoryId].transactions.push(transaction);
    patterns[categoryId].totalAmount += transaction.amount;
    patterns[categoryId].type = transaction.type; // Use the type from transactions
  });
  
  // Analyze patterns for each category
  for (const [categoryId, pattern] of Object.entries(patterns)) {
    if (pattern.transactions.length === 0) continue;
    
    const { transactions } = pattern;
    
    // Calculate average amount
    pattern.averageAmount = pattern.totalAmount / transactions.length;
    
    // Group by month to get monthly totals
    const monthlyTotals = {};
    const months = new Set();
    
    transactions.forEach(transaction => {
      const month = format(new Date(transaction.date), 'yyyy-MM');
      months.add(month);
      
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      
      monthlyTotals[month] += transaction.amount;
    });
    
    const monthCount = months.size;
    pattern.averageMonthly = pattern.totalAmount / monthCount;
    
    // Calculate regularity (standard deviation of monthly amounts)
    if (monthCount > 1) {
      const monthlyValues = Object.values(monthlyTotals);
      const mean = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
      const variance = monthlyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyValues.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / mean;
      
      // Lower coefficient of variation means more regular spending
      pattern.regularity = Math.max(0, Math.min(1, 1 - coefficientOfVariation));
    }
    
    // Determine frequency
    if (pattern.regularity > 0.8) {
      // Highly regular spending - check if it's monthly, bimonthly, or quarterly
      const monthKeys = [...months].sort();
      
      if (monthCount >= 3) {
        // Check if transactions occur every month
        let allMonthsHaveTransactions = true;
        let firstMonth = parseISO(`${monthKeys[0]}-01`);
        
        for (let i = 1; i < monthCount; i++) {
          const expectedMonth = format(addMonths(firstMonth, i), 'yyyy-MM');
          if (!monthlyTotals[expectedMonth]) {
            allMonthsHaveTransactions = false;
            break;
          }
        }
        
        if (allMonthsHaveTransactions) {
          pattern.frequency = 'monthly';
          pattern.confidence = 0.9;
        } else {
          // Check for bimonthly pattern
          let bimonthlyPattern = true;
          let offset = 0;
          
          // Try different offsets
          for (offset = 0; offset < 2; offset++) {
            bimonthlyPattern = true;
            
            for (let i = offset; i < monthCount; i += 2) {
              const monthKey = monthKeys[i];
              if (!monthlyTotals[monthKey] || monthlyTotals[monthKey] < pattern.averageAmount * 0.5) {
                bimonthlyPattern = false;
                break;
              }
            }
            
            if (bimonthlyPattern) break;
          }
          
          if (bimonthlyPattern) {
            pattern.frequency = 'bimonthly';
            pattern.offset = offset;
            pattern.confidence = 0.8;
          } else {
            // Check for quarterly pattern
            let quarterlyPattern = true;
            offset = 0;
            
            // Try different offsets
            for (offset = 0; offset < 3; offset++) {
              quarterlyPattern = true;
              
              for (let i = offset; i < monthCount; i += 3) {
                const monthKey = monthKeys[i];
                if (!monthlyTotals[monthKey] || monthlyTotals[monthKey] < pattern.averageAmount * 0.5) {
                  quarterlyPattern = false;
                  break;
                }
              }
              
              if (quarterlyPattern) break;
            }
            
            if (quarterlyPattern) {
              pattern.frequency = 'quarterly';
              pattern.offset = offset;
              pattern.confidence = 0.7;
            } else {
              pattern.frequency = 'variable';
              pattern.confidence = 0.5;
            }
          }
        }
      }
    } else {
      // Variable spending
      pattern.frequency = 'variable';
      pattern.confidence = Math.max(0.4, Math.min(0.7, pattern.regularity)); // Confidence based on regularity
    }
    
    // Check if this category is mainly handled by recurring transactions
    // This is determined by looking at regularity and frequency
    if (pattern.regularity > 0.85 && 
        (pattern.frequency === 'monthly' || pattern.frequency === 'bimonthly' || pattern.frequency === 'quarterly')) {
      pattern.isMainlyRecurring = true;
    }
  }
  
  return patterns;
}

/**
 * Calculate occurrences of a recurring transaction in a date range
 * @param {Object} transaction - Recurring transaction
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Array} Dates of occurrences
 */
function calculateRecurringOccurrences(transaction, startDate, endDate) {
  const occurrences = [];
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  // If transaction is not active or end date is before transaction start date, return empty array
  if (!transaction.isActive || isAfter(startDateObj, new Date(transaction.endDate || '2100-01-01'))) {
    return occurrences;
  }
  
  // Get next occurrence after start date
  let currentDate = new Date(transaction.startDate);
  while (isBefore(currentDate, startDateObj)) {
    currentDate = getNextOccurrence(currentDate, transaction.frequency);
  }
  
  // Add occurrences until end date
  while (isBefore(currentDate, endDateObj) || isWithinInterval(currentDate, { start: startDateObj, end: endDateObj })) {
    occurrences.push(new Date(currentDate));
    currentDate = getNextOccurrence(currentDate, transaction.frequency);
  }
  
  return occurrences;
}

/**
 * Get next occurrence date based on frequency
 * @param {Date} currentDate - Current date
 * @param {String} frequency - Frequency (daily, weekly, biweekly, monthly, quarterly, annually)
 * @returns {Date} Next occurrence date
 */
function getNextOccurrence(currentDate, frequency) {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addDays(date, 7);
    case 'biweekly':
      return addDays(date, 14);
    case 'monthly':
      return addMonths(date, 1);
    case 'quarterly':
      return addMonths(date, 3);
    case 'annually':
      return addMonths(date, 12);
    default:
      return addMonths(date, 1); // Default to monthly
  }
}

/**
 * Get expense prediction
 * @param {String} userId - User ID
 * @returns {Object} Prediction data
 */
exports.getCashflowPrediction = async (userId) => {
  // Get forecast for 3 months
  const forecast = await exports.generateExpenseForecast(userId, { months: 3 });
  
  // Calculate total income and expenses
  const totalIncome = forecast.forecast.reduce((sum, month) => sum + month.summary.totalIncome, 0);
  const totalExpenses = forecast.forecast.reduce((sum, month) => sum + month.summary.totalExpenses, 0);
  
  // Calculate month-by-month cash flow
  const cashflow = forecast.forecast.map(month => ({
    month: month.monthName,
    income: month.summary.totalIncome,
    expenses: month.summary.totalExpenses,
    net: month.summary.netCashflow,
    savingsRate: month.summary.savingsRate
  }));
  
  // Get top expense categories
  const categoryExpenses = {};
  
  forecast.forecast.forEach(month => {
    month.expenses.forEach(expense => {
      const categoryName = expense.category ? expense.category.name : 'Uncategorized';
      if (!categoryExpenses[categoryName]) {
        categoryExpenses[categoryName] = 0;
      }
      categoryExpenses[categoryName] += expense.amount;
    });
  });
  
  const topCategories = Object.entries(categoryExpenses)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Generate insights
  const insights = [];
  
  // Overall cash flow
  if (totalIncome > totalExpenses) {
    insights.push({
      type: 'positive',
      title: 'Positive Cash Flow',
      description: `You're projected to have a positive cash flow of ${(totalIncome - totalExpenses).toFixed(2)} over the next 3 months.`
    });
  } else {
    insights.push({
      type: 'negative',
      title: 'Negative Cash Flow',
      description: `You're projected to have a negative cash flow of ${(totalExpenses - totalIncome).toFixed(2)} over the next 3 months.`
    });
  }
  
  // Month-specific insights
  let previousNet = 0;
  forecast.forecast.forEach((month, index) => {
    if (index > 0) {
      const netChange = month.summary.netCashflow - previousNet;
      const percentChange = previousNet !== 0 ? (netChange / Math.abs(previousNet)) * 100 : 0;
      
      if (Math.abs(percentChange) > 20) {
        insights.push({
          type: percentChange > 0 ? 'positive' : 'negative',
          title: `${month.monthName} Cash Flow Change`,
          description: `Your net cash flow is projected to ${percentChange > 0 ? 'increase' : 'decrease'} by ${Math.abs(percentChange).toFixed(1)}% in ${month.monthName} compared to the previous month.`
        });
      }
    }
    previousNet = month.summary.netCashflow;
  });
  
  // Category-specific insights
  topCategories.forEach(category => {
    const monthlyAverage = category.amount / 3;
    if (monthlyAverage > forecast.summary.averageMonthlyIncome * 0.3) {
      insights.push({
        type: 'warning',
        title: `High ${category.name} Expenses`,
        description: `Your ${category.name} expenses are projected to be ${(monthlyAverage).toFixed(2)} per month, which is ${((monthlyAverage / forecast.summary.averageMonthlyIncome) * 100).toFixed(1)}% of your monthly income.`
      });
    }
  });
  
  // If there are less than 3 insights, add a general one
  if (insights.length < 3) {
    insights.push({
      type: 'info',
      title: 'Average Monthly Expenses',
      description: `Your average monthly expenses are projected to be ${forecast.summary.averageMonthlyExpenses.toFixed(2)}, which is ${((forecast.summary.averageMonthlyExpenses / forecast.summary.averageMonthlyIncome) * 100).toFixed(1)}% of your average monthly income.`
    });
  }
  
  return {
    cashflow,
    topCategories,
    insights,
    summary: {
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    }
  };
};