const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../middleware/async.middleware');

/**
 * @desc    Get spending trends data
 * @route   GET /api/analytics/spending-trends
 * @access  Private
 */
exports.getSpendingTrends = asyncHandler(async (req, res) => {
  const { months = 6, categories = [] } = req.query;
  
  const options = {
    months: parseInt(months),
    categories: categories.length ? categories.split(',') : []
  };
  
  const trendData = await analyticsService.getSpendingTrends(req.user.id, options);
  
  res.status(200).json({
    success: true,
    data: trendData
  });
});

/**
 * @desc    Get income vs expense trends
 * @route   GET /api/analytics/income-expense
 * @access  Private
 */
exports.getIncomeVsExpenseTrends = asyncHandler(async (req, res) => {
  const { months = 6 } = req.query;
  
  const options = {
    months: parseInt(months)
  };
  
  const trendData = await analyticsService.getIncomeVsExpenseTrends(req.user.id, options);
  
  res.status(200).json({
    success: true,
    data: trendData
  });
});

/**
 * @desc    Get budget vs actual comparison
 * @route   GET /api/analytics/budget-actual
 * @access  Private
 */
exports.getBudgetVsActual = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  
  const options = {
    month: month ? parseInt(month) : new Date().getMonth() + 1,
    year: year ? parseInt(year) : new Date().getFullYear()
  };
  
  const budgetData = await analyticsService.getBudgetVsActual(req.user.id, options);
  
  res.status(200).json({
    success: true,
    data: budgetData
  });
});

/**
 * @desc    Get yearly financial summary
 * @route   GET /api/analytics/yearly-summary
 * @access  Private
 */
exports.getYearlySummary = asyncHandler(async (req, res) => {
  const { year } = req.query;
  
  const options = {
    year: year ? parseInt(year) : new Date().getFullYear()
  };
  
  const yearlyData = await analyticsService.getYearlySummary(req.user.id, options);
  
  res.status(200).json({
    success: true,
    data: yearlyData
  });
});

/**
 * @desc    Get financial insights and recommendations
 * @route   GET /api/analytics/insights
 * @access  Private
 */
exports.getFinancialInsights = asyncHandler(async (req, res) => {
  const insightsData = await analyticsService.getFinancialInsights(req.user.id);
  
  res.status(200).json({
    success: true,
    data: insightsData
  });
});

/**
 * @desc    Generate comprehensive financial report
 * @route   GET /api/analytics/report
 * @access  Private
 */
exports.generateFinancialReport = asyncHandler(async (req, res) => {
  const { period = 'month', year, month } = req.query;
  
  const options = {
    period,
    year: year ? parseInt(year) : new Date().getFullYear(),
    month: month ? parseInt(month) : new Date().getMonth() + 1
  };
  
  const reportData = await analyticsService.generateFinancialReport(req.user.id, options);
  
  res.status(200).json({
    success: true,
    data: reportData
  });
});

/**
 * @desc    Get user's financial health score
 * @route   GET /api/analytics/health-score
 * @access  Private
 */
exports.getFinancialHealthScore = asyncHandler(async (req, res) => {
  // Get insights data
  const insightsData = await analyticsService.getFinancialInsights(req.user.id);
  const budgetData = await analyticsService.getBudgetVsActual(req.user.id);
  const incomeExpenseData = await analyticsService.getIncomeVsExpenseTrends(req.user.id, { months: 3 });
  
  // Calculate financial health score
  let score = 50; // Base score
  
  // Savings rate impact (max 25 points)
  const savingsRate = insightsData.summary.savingsRate;
  if (savingsRate >= 20) {
    score += 25;
  } else if (savingsRate >= 15) {
    score += 20;
  } else if (savingsRate >= 10) {
    score += 15;
  } else if (savingsRate >= 5) {
    score += 10;
  } else if (savingsRate > 0) {
    score += 5;
  }
  
  // Budget adherence impact (max 15 points)
  const overBudgetCategories = budgetData.categories.filter(cat => cat.status === 'over_budget').length;
  const warningCategories = budgetData.categories.filter(cat => cat.status === 'warning').length;
  
  if (overBudgetCategories === 0 && warningCategories === 0) {
    score += 15;
  } else if (overBudgetCategories === 0 && warningCategories < 3) {
    score += 10;
  } else if (overBudgetCategories < 2) {
    score += 5;
  }
  
  // Income expense ratio (max 10 points)
  const avgIncomeExpenseRatio = incomeExpenseData.reduce((sum, month) => {
    return sum + (month.income > 0 ? month.expenses / month.income : 1);
  }, 0) / incomeExpenseData.length;
  
  if (avgIncomeExpenseRatio <= 0.6) {
    score += 10;
  } else if (avgIncomeExpenseRatio <= 0.7) {
    score += 8;
  } else if (avgIncomeExpenseRatio <= 0.8) {
    score += 5;
  } else if (avgIncomeExpenseRatio <= 0.9) {
    score += 3;
  }
  
  // Get rating
  let rating = 'Poor';
  if (score >= 90) {
    rating = 'Excellent';
  } else if (score >= 80) {
    rating = 'Very Good';
  } else if (score >= 70) {
    rating = 'Good';
  } else if (score >= 60) {
    rating = 'Fair';
  } else if (score >= 50) {
    rating = 'Needs Improvement';
  }
  
  // Return health score with components
  res.status(200).json({
    success: true,
    data: {
      score,
      rating,
      components: {
        savingsRate: {
          value: savingsRate,
          score: score - 50 - (avgIncomeExpenseRatio <= 0.9 ? (avgIncomeExpenseRatio <= 0.8 ? (avgIncomeExpenseRatio <= 0.7 ? (avgIncomeExpenseRatio <= 0.6 ? 10 : 8) : 5) : 3) : 0) - (overBudgetCategories === 0 && warningCategories === 0 ? 15 : overBudgetCategories === 0 && warningCategories < 3 ? 10 : overBudgetCategories < 2 ? 5 : 0)
        },
        budgetAdherence: {
          overBudget: overBudgetCategories,
          nearBudget: warningCategories,
          score: overBudgetCategories === 0 && warningCategories === 0 ? 15 : overBudgetCategories === 0 && warningCategories < 3 ? 10 : overBudgetCategories < 2 ? 5 : 0
        },
        incomeExpenseRatio: {
          value: avgIncomeExpenseRatio,
          score: avgIncomeExpenseRatio <= 0.9 ? (avgIncomeExpenseRatio <= 0.8 ? (avgIncomeExpenseRatio <= 0.7 ? (avgIncomeExpenseRatio <= 0.6 ? 10 : 8) : 5) : 3) : 0
        }
      },
      insights: insightsData.insights,
      recommendations: insightsData.recommendations
    }
  });
});