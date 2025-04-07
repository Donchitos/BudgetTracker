const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');
const BudgetTemplate = require('../models/BudgetTemplate.model');
const { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format, isWithinInterval } = require('date-fns');

/**
 * Calculate spending trends over time
 * @param {Object} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Spending trends data
 */
exports.getSpendingTrends = async (userId, options = {}) => {
  const { months = 6, categories = [] } = options;
  
  // Get start and end dates
  const endDate = new Date();
  const startDate = subMonths(endDate, months - 1);
  startDate.setDate(1); // First day of month
  
  // Get all transactions for the period
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
    type: 'expense'
  }).populate('category', 'name color');
  
  // Get categories if not provided
  let categoriesData = categories;
  if (!categories.length) {
    categoriesData = await Category.find({ user: userId });
  }
  
  // Create monthly buckets
  const monthlyData = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthLabel = format(currentDate, 'MMM yyyy');
    
    // Calculate totals for the month
    const monthlyTotal = transactions
      .filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd }))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate category breakdown
    const categoryBreakdown = {};
    categoriesData.forEach(cat => {
      categoryBreakdown[cat.name || cat] = 0;
    });
    
    transactions
      .filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd }))
      .forEach(t => {
        const catName = t.category ? t.category.name : 'Uncategorized';
        if (categoryBreakdown[catName] !== undefined) {
          categoryBreakdown[catName] += t.amount;
        } else {
          categoryBreakdown[catName] = t.amount;
        }
      });
    
    monthlyData.push({
      month: monthLabel,
      total: monthlyTotal,
      categories: categoryBreakdown
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return monthlyData;
};

/**
 * Calculate income vs expense trends
 * @param {Object} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Income vs expense data
 */
exports.getIncomeVsExpenseTrends = async (userId, options = {}) => {
  const { months = 6 } = options;
  
  // Get start and end dates
  const endDate = new Date();
  const startDate = subMonths(endDate, months - 1);
  startDate.setDate(1); // First day of month
  
  // Get all transactions for the period
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Create monthly buckets
  const monthlyData = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthLabel = format(currentDate, 'MMM yyyy');
    
    // Filter transactions for this month
    const monthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );
    
    // Calculate income and expenses
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate net and savings rate
    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    
    monthlyData.push({
      month: monthLabel,
      income,
      expenses,
      net,
      savingsRate
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return monthlyData;
};

/**
 * Calculate budget vs actual spending
 * @param {Object} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Budget vs actual data
 */
exports.getBudgetVsActual = async (userId, options = {}) => {
  const { month, year } = options;
  
  // Determine date range
  const now = new Date();
  const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
  const targetYear = year ? parseInt(year) : now.getFullYear();
  
  const dateStart = new Date(targetYear, targetMonth, 1);
  const dateEnd = endOfMonth(dateStart);
  
  // Get budget templates
  const budgetTemplates = await BudgetTemplate.find({
    user: userId
  }).populate('category', 'name color');
  
  // Get all transactions for the period
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: dateStart, $lte: dateEnd },
    type: 'expense'
  }).populate('category', 'name color');
  
  // Get all categories
  const categories = await Category.find({ user: userId });
  
  // Build category map
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat._id.toString()] = {
      name: cat.name,
      color: cat.color,
      budget: 0,
      actual: 0,
      remaining: 0,
      percentUsed: 0,
      status: 'on_track' // on_track, warning, over_budget
    };
  });
  
  // Add uncategorized
  categoryMap['uncategorized'] = {
    name: 'Uncategorized',
    color: '#999999',
    budget: 0,
    actual: 0,
    remaining: 0,
    percentUsed: 0,
    status: 'on_track'
  };
  
  // Set budgets from templates
  budgetTemplates.forEach(template => {
    if (template.category) {
      const catId = template.category._id.toString();
      if (categoryMap[catId]) {
        categoryMap[catId].budget = template.amount;
        categoryMap[catId].remaining = template.amount;
      }
    }
  });
  
  // Calculate actual spending
  transactions.forEach(transaction => {
    const catId = transaction.category ? transaction.category._id.toString() : 'uncategorized';
    if (categoryMap[catId]) {
      categoryMap[catId].actual += transaction.amount;
      categoryMap[catId].remaining = categoryMap[catId].budget - categoryMap[catId].actual;
      
      if (categoryMap[catId].budget > 0) {
        categoryMap[catId].percentUsed = (categoryMap[catId].actual / categoryMap[catId].budget) * 100;
        
        // Determine status
        if (categoryMap[catId].percentUsed >= 100) {
          categoryMap[catId].status = 'over_budget';
        } else if (categoryMap[catId].percentUsed >= 85) {
          categoryMap[catId].status = 'warning';
        } else {
          categoryMap[catId].status = 'on_track';
        }
      }
    }
  });
  
  // Calculate summary
  const totalBudget = Object.values(categoryMap).reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = Object.values(categoryMap).reduce((sum, cat) => sum + cat.actual, 0);
  const totalRemaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  // Convert category map to array
  const categoriesArray = Object.values(categoryMap).filter(cat => cat.budget > 0 || cat.actual > 0);
  
  return {
    month: format(dateStart, 'MMMM yyyy'),
    summary: {
      totalBudget,
      totalSpent,
      totalRemaining,
      percentUsed,
      status: percentUsed >= 100 ? 'over_budget' : percentUsed >= 85 ? 'warning' : 'on_track'
    },
    categories: categoriesArray
  };
};

/**
 * Calculate yearly spending summary
 * @param {Object} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Yearly summary data
 */
exports.getYearlySummary = async (userId, options = {}) => {
  const { year } = options;
  
  // Determine date range
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const dateStart = new Date(targetYear, 0, 1); // January 1
  const dateEnd = new Date(targetYear, 11, 31); // December 31
  
  // Get all transactions for the year
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: dateStart, $lte: dateEnd }
  }).populate('category', 'name color');
  
  // Get categories
  const categories = await Category.find({ user: userId });
  
  // Initialize monthly data
  const monthlyData = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(targetYear, i, 1);
    monthlyData.push({
      month: format(month, 'MMMM'),
      shortMonth: format(month, 'MMM'),
      income: 0,
      expenses: 0,
      net: 0,
      categories: {}
    });
    
    // Initialize category data
    categories.forEach(cat => {
      monthlyData[i].categories[cat.name] = 0;
    });
  }
  
  // Calculate monthly totals
  transactions.forEach(transaction => {
    const month = new Date(transaction.date).getMonth();
    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.amount;
    } else {
      monthlyData[month].expenses += transaction.amount;
      
      // Add to category
      if (transaction.category) {
        const catName = transaction.category.name;
        if (monthlyData[month].categories[catName] !== undefined) {
          monthlyData[month].categories[catName] += transaction.amount;
        } else {
          monthlyData[month].categories[catName] = transaction.amount;
        }
      } else {
        if (!monthlyData[month].categories['Uncategorized']) {
          monthlyData[month].categories['Uncategorized'] = 0;
        }
        monthlyData[month].categories['Uncategorized'] += transaction.amount;
      }
    }
    monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
  });
  
  // Calculate yearly totals
  const yearlyTotals = {
    income: monthlyData.reduce((sum, month) => sum + month.income, 0),
    expenses: monthlyData.reduce((sum, month) => sum + month.expenses, 0),
    net: monthlyData.reduce((sum, month) => sum + month.net, 0),
    categories: {}
  };
  
  // Calculate category yearly totals
  categories.forEach(cat => {
    yearlyTotals.categories[cat.name] = monthlyData.reduce(
      (sum, month) => sum + (month.categories[cat.name] || 0), 0
    );
  });
  
  // Calculate top categories
  const topCategories = Object.entries(yearlyTotals.categories)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  return {
    year: targetYear,
    monthly: monthlyData,
    yearly: yearlyTotals,
    topCategories
  };
};

/**
 * Generate financial insights and recommendations
 * @param {Object} userId - User ID
 * @returns {Promise<Object>} - Insights and recommendations
 */
exports.getFinancialInsights = async (userId) => {
  // Get data for insights
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 6);
  
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: sixMonthsAgo }
  }).populate('category', 'name color');
  
  const budgetData = await exports.getBudgetVsActual(userId);
  const trendData = await exports.getIncomeVsExpenseTrends(userId);
  
  // Initialize insights
  const insights = [];
  const recommendations = [];
  
  // Calculate average monthly income and expenses
  const monthlyIncome = trendData.reduce((sum, month) => sum + month.income, 0) / trendData.length;
  const monthlyExpenses = trendData.reduce((sum, month) => sum + month.expenses, 0) / trendData.length;
  const avgSavingsRate = trendData.reduce((sum, month) => sum + month.savingsRate, 0) / trendData.length;
  
  // Check savings rate
  if (avgSavingsRate >= 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Savings Rate',
      description: `Your average savings rate is ${avgSavingsRate.toFixed(1)}%, which is excellent. Financial experts recommend saving at least 20% of your income.`
    });
  } else if (avgSavingsRate >= 10) {
    insights.push({
      type: 'neutral',
      title: 'Decent Savings Rate',
      description: `Your average savings rate is ${avgSavingsRate.toFixed(1)}%. Consider increasing your savings to at least 20% of your income.`
    });
    recommendations.push({
      title: 'Increase Savings Rate',
      description: 'Try to increase your savings rate to 20% or more by reducing discretionary expenses.'
    });
  } else if (avgSavingsRate > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `Your savings rate of ${avgSavingsRate.toFixed(1)}% is below recommended levels. Aim for at least 20% savings.`
    });
    recommendations.push({
      title: 'Boost Your Savings',
      description: 'Look for ways to increase your income or reduce expenses to improve your savings rate.'
    });
  } else {
    insights.push({
      type: 'negative',
      title: 'Negative Savings Rate',
      description: 'You are spending more than you earn, which is not sustainable in the long term.'
    });
    recommendations.push({
      title: 'Reduce Expenses',
      description: 'Identify non-essential expenses that can be cut to bring your budget back into balance.'
    });
  }
  
  // Check budget categories
  const overBudgetCategories = budgetData.categories.filter(cat => cat.status === 'over_budget');
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Budget Overruns',
      description: `You've exceeded your budget in ${overBudgetCategories.length} categories this month.`
    });
    
    if (overBudgetCategories.length <= 3) {
      recommendations.push({
        title: 'Adjust Your Spending',
        description: `Consider adjusting your spending in ${overBudgetCategories.map(c => c.name).join(', ')}.`
      });
    } else {
      recommendations.push({
        title: 'Review Your Budget',
        description: 'You have multiple categories over budget. Review your overall budget allocations.'
      });
    }
  } else if (budgetData.categories.filter(cat => cat.status === 'warning').length > 0) {
    insights.push({
      type: 'neutral',
      title: 'Budget Alert',
      description: 'Some categories are nearing their budget limits. Monitor your spending closely.'
    });
  } else if (budgetData.categories.length > 0) {
    insights.push({
      type: 'positive',
      title: 'Budget On Track',
      description: 'You are staying within your budget across all categories. Keep up the good work!'
    });
  }
  
  // Check spending trends
  const expenseTrend = trendData.map(m => m.expenses);
  let increasingExpenses = true;
  for (let i = 1; i < expenseTrend.length; i++) {
    if (expenseTrend[i] <= expenseTrend[i-1]) {
      increasingExpenses = false;
      break;
    }
  }
  
  if (increasingExpenses && expenseTrend.length >= 3) {
    insights.push({
      type: 'warning',
      title: 'Increasing Expenses',
      description: 'Your monthly expenses have been consistently increasing. This trend may impact your savings goals.'
    });
    recommendations.push({
      title: 'Monitor Expense Growth',
      description: 'Review your recent spending increases to identify areas where you can cut back.'
    });
  }
  
  // Check income stability
  const incomeTrend = trendData.map(m => m.income);
  const incomeVariance = calculateVariance(incomeTrend);
  const incomeAvg = incomeTrend.reduce((sum, val) => sum + val, 0) / incomeTrend.length;
  const incomeVariabilityPct = (Math.sqrt(incomeVariance) / incomeAvg) * 100;
  
  if (incomeVariabilityPct > 30) {
    insights.push({
      type: 'neutral',
      title: 'Variable Income',
      description: 'Your income varies significantly month to month, which can make budgeting challenging.'
    });
    recommendations.push({
      title: 'Build a Larger Emergency Fund',
      description: 'With variable income, aim for a larger emergency fund (6-9 months of expenses) for stability.'
    });
  }
  
  // Get top spending category
  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.type === 'expense' && t.category) {
      const catName = t.category.name;
      if (!categoryTotals[catName]) categoryTotals[catName] = 0;
      categoryTotals[catName] += t.amount;
    }
  });
  
  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .shift();
  
  if (topCategory) {
    insights.push({
      type: 'neutral',
      title: 'Top Spending Category',
      description: `Your highest spending category is ${topCategory[0]}, accounting for ${((topCategory[1] / monthlyExpenses) * 100).toFixed(1)}% of your expenses.`
    });
    
    if (topCategory[1] / monthlyExpenses > 0.4) {
      recommendations.push({
        title: 'Diversify Your Budget',
        description: `Consider ways to reduce spending in ${topCategory[0]} to create a more balanced budget.`
      });
    }
  }
  
  return {
    summary: {
      monthlyIncome,
      monthlyExpenses,
      savingsRate: avgSavingsRate,
      budgetStatus: budgetData.summary.status
    },
    insights,
    recommendations
  };
};

/**
 * Calculate variance of a set of numbers
 * @param {Array} values - Array of numbers
 * @returns {Number} - Variance
 */
function calculateVariance(values) {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Generate complete financial report
 * @param {Object} userId - User ID
 * @param {Object} options - Report options
 * @returns {Promise<Object>} - Complete financial report
 */
exports.generateFinancialReport = async (userId, options = {}) => {
  const { period = 'month', year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = options;
  
  // Generate different report sections
  const budgetVsActual = await exports.getBudgetVsActual(userId, { year, month });
  const spendingTrends = await exports.getSpendingTrends(userId, { months: 6 });
  const incomeVsExpense = await exports.getIncomeVsExpenseTrends(userId, { months: 12 });
  const insights = await exports.getFinancialInsights(userId);
  
  let yearlyData = null;
  if (period === 'year') {
    yearlyData = await exports.getYearlySummary(userId, { year });
  }
  
  return {
    reportType: period === 'year' ? 'Annual Report' : 'Monthly Report',
    reportPeriod: period === 'year' ? `${year}` : budgetVsActual.month,
    generatedOn: new Date(),
    budgetSummary: budgetVsActual.summary,
    categoryDetails: budgetVsActual.categories,
    spendingTrends,
    incomeVsExpense,
    insights: insights.insights,
    recommendations: insights.recommendations,
    yearlyData
  };
};