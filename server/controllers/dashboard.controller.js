const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');

/**
 * @desc    Get dashboard summary data
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    // Default to current month if not specified
    const now = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    
    // Calculate total income
    const incomeTotal = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'income',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Calculate total expenses
    const expenseTotal = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('category', 'name color icon');
    
    // Get total amount values, default to 0 if no data
    const income = incomeTotal.length > 0 ? incomeTotal[0].total : 0;
    const expenses = expenseTotal.length > 0 ? expenseTotal[0].total : 0;
    const balance = income - expenses;
    
    res.status(200).json({
      success: true,
      data: {
        income,
        expenses,
        balance,
        period: {
          startDate,
          endDate
        },
        recentTransactions
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get expense breakdown by category
 * @route   GET /api/dashboard/expense-breakdown
 * @access  Private
 */
exports.getExpenseBreakdown = async (req, res) => {
  try {
    // Default to current month if not specified
    const now = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    
    // Calculate expenses by category
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: '$category.name',
          color: '$category.color',
          icon: '$category.icon',
          amount: '$total'
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);
    
    // Calculate total expenses for calculating percentage
    const expenseTotal = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalExpenses = expenseTotal.length > 0 ? expenseTotal[0].total : 0;
    
    // Add percentage to each category
    const expenseBreakdown = expensesByCategory.map(category => ({
      ...category,
      percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
    }));
    
    res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        categories: expenseBreakdown,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get budget vs actual comparison
 * @route   GET /api/dashboard/budget-actual
 * @access  Private
 */
exports.getBudgetVsActual = async (req, res) => {
  try {
    // Default to current month if not specified
    const now = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    
    // Get all categories with budget
    const categories = await Category.find({
      user: req.user._id
    });
    
    // Get actual expenses by category
    const actualExpenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$category',
          actual: { $sum: '$amount' }
        }
      }
    ]);
    
    // Map actual expenses to categories
    const expenseMap = {};
    actualExpenses.forEach(expense => {
      expenseMap[expense._id] = expense.actual;
    });
    
    // Create budget vs actual comparison
    const comparison = categories.map(category => {
      const categoryId = category._id.toString();
      const actual = expenseMap[categoryId] || 0;
      const budget = category.budget || 0;
      const difference = budget - actual;
      const percentage = budget > 0 ? (actual / budget) * 100 : 0;
      
      return {
        categoryId,
        name: category.name,
        color: category.color,
        icon: category.icon,
        budget,
        actual,
        difference,
        percentage,
        status: difference >= 0 ? 'under' : 'over'
      };
    });
    
    // Filter out categories with no budget and no expenses
    const filteredComparison = comparison.filter(
      item => item.budget > 0 || item.actual > 0
    );
    
    // Sort by percentage (highest to lowest)
    filteredComparison.sort((a, b) => b.percentage - a.percentage);
    
    res.status(200).json({
      success: true,
      data: {
        budgetVsActual: filteredComparison,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get spending over time data
 * @route   GET /api/dashboard/spending-trends
 * @access  Private
 */
exports.getSpendingTrends = async (req, res) => {
  try {
    // Default to last 6 months if not specified
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1); // First day of the 6th month ago
    
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : sixMonthsAgo;
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : now;
    
    // Aggregate monthly spending
    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    // Aggregate monthly income
    const monthlyIncome = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'income',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    // Format data for chart display
    const expenseMap = {};
    monthlyExpenses.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      expenseMap[key] = item.total;
    });
    
    const incomeMap = {};
    monthlyIncome.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      incomeMap[key] = item.total;
    });
    
    // Generate time series data
    const timeSeriesData = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const key = `${year}-${month}`;
      
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
      const label = `${monthName} ${year}`;
      
      timeSeriesData.push({
        date: key,
        label,
        income: incomeMap[key] || 0,
        expenses: expenseMap[key] || 0,
        balance: (incomeMap[key] || 0) - (expenseMap[key] || 0)
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    res.status(200).json({
      success: true,
      data: {
        trends: timeSeriesData,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};