const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');
const Bill = require('../models/Bill.model');
const SavingsGoal = require('../models/SavingsGoal.model');
const { Parser } = require('json2csv');

/**
 * @desc    Generate income/expense report for a specific period
 * @route   GET /api/reports/income-expense
 * @access  Private
 */
exports.getIncomeExpenseReport = async (req, res) => {
  try {
    // Get date range from query params
    const { startDate, endDate, format = 'json' } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }
    
    // Set up date filters
    const dateFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Query transactions
    const transactions = await Transaction.find({
      user: req.user.id,
      ...dateFilter
    }).populate('category', 'name color');
    
    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    // Group expenses by category
    const expensesByCategory = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = transaction.category ? transaction.category.name : 'Uncategorized';
        const categoryId = transaction.category ? transaction.category._id : 'none';
        
        if (!expensesByCategory[categoryId]) {
          expensesByCategory[categoryId] = {
            categoryId,
            name: categoryName,
            color: transaction.category ? transaction.category.color : '#cccccc',
            amount: 0,
            transactions: []
          };
        }
        
        expensesByCategory[categoryId].amount += transaction.amount;
        expensesByCategory[categoryId].transactions.push({
          id: transaction._id,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date
        });
      });
    
    // Convert to array and calculate percentages
    const categoryData = Object.values(expensesByCategory).map(category => {
      return {
        ...category,
        percentage: expenses > 0 ? (category.amount / expenses) * 100 : 0
      };
    });
    
    // Sort by amount (highest first)
    categoryData.sort((a, b) => b.amount - a.amount);
    
    // Prepare response data
    const reportData = {
      period: {
        startDate,
        endDate
      },
      summary: {
        income,
        expenses,
        balance,
        transactionCount: transactions.length,
        categoriesCount: categoryData.length
      },
      categories: categoryData,
      transactions: transactions.map(t => ({
        id: t._id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date,
        category: t.category ? {
          id: t.category._id,
          name: t.category.name,
          color: t.category.color
        } : null
      }))
    };
    
    // Return data in requested format
    if (format === 'csv') {
      // Flatten data for CSV
      const flatTransactions = transactions.map(t => ({
        id: t._id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: new Date(t.date).toISOString().split('T')[0],
        category: t.category ? t.category.name : 'Uncategorized'
      }));
      
      // Convert to CSV
      const fields = ['id', 'description', 'amount', 'type', 'date', 'category'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flatTransactions);
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`income-expense-report-${startDate}-to-${endDate}.csv`);
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Generate budget report (budget vs actual spending)
 * @route   GET /api/reports/budget
 * @access  Private
 */
exports.getBudgetReport = async (req, res) => {
  try {
    // Get date range from query params
    const { startDate, endDate, format = 'json' } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }
    
    // Set up date filters
    const dateFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Query all categories for the user
    const categories = await Category.find({ user: req.user.id });
    
    // Query transactions for the period
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      ...dateFilter
    }).populate('category', 'name color budget');
    
    // Calculate spending by category
    const spendingByCategory = {};
    
    transactions.forEach(transaction => {
      const categoryId = transaction.category ? transaction.category._id.toString() : 'none';
      
      if (!spendingByCategory[categoryId]) {
        spendingByCategory[categoryId] = {
          amount: 0,
          transactions: []
        };
      }
      
      spendingByCategory[categoryId].amount += transaction.amount;
      spendingByCategory[categoryId].transactions.push({
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date
      });
    });
    
    // Prepare budget vs actual data
    const budgetData = categories.map(category => {
      const categoryId = category._id.toString();
      const spent = spendingByCategory[categoryId] ? spendingByCategory[categoryId].amount : 0;
      const budget = category.budget || 0;
      const remaining = budget - spent;
      const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
      
      return {
        categoryId,
        name: category.name,
        color: category.color,
        budget,
        spent,
        remaining,
        percentUsed,
        status: percentUsed >= 100 ? 'over' : percentUsed >= 80 ? 'warning' : 'good',
        transactions: spendingByCategory[categoryId] ? spendingByCategory[categoryId].transactions : []
      };
    });
    
    // Sort by percent used (highest first)
    budgetData.sort((a, b) => b.percentUsed - a.percentUsed);
    
    // Prepare response data
    const reportData = {
      period: {
        startDate,
        endDate
      },
      summary: {
        totalBudget: categories.reduce((sum, cat) => sum + (cat.budget || 0), 0),
        totalSpent: transactions.reduce((sum, t) => sum + t.amount, 0),
        categoryCount: categories.length,
        transactionCount: transactions.length,
        overBudgetCount: budgetData.filter(c => c.status === 'over').length
      },
      categories: budgetData
    };
    
    // Return data in requested format
    if (format === 'csv') {
      // Flatten data for CSV
      const flatData = budgetData.map(cat => ({
        category: cat.name,
        budget: cat.budget,
        spent: cat.spent,
        remaining: cat.remaining,
        percentUsed: cat.percentUsed.toFixed(2),
        status: cat.status
      }));
      
      // Convert to CSV
      const fields = ['category', 'budget', 'spent', 'remaining', 'percentUsed', 'status'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flatData);
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`budget-report-${startDate}-to-${endDate}.csv`);
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Generate savings goals report
 * @route   GET /api/reports/savings
 * @access  Private
 */
exports.getSavingsReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    // Query all savings goals for the user
    const goals = await SavingsGoal.find({ user: req.user.id })
      .populate('category', 'name color');
    
    // Prepare response data
    const reportData = {
      summary: {
        totalGoals: goals.length,
        completedGoals: goals.filter(g => g.isCompleted).length,
        activeGoals: goals.filter(g => !g.isCompleted).length,
        totalSaved: goals.reduce((sum, g) => sum + g.currentAmount, 0),
        totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0)
      },
      goals: goals.map(goal => ({
        id: goal._id,
        name: goal.name,
        description: goal.description,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        progressPercentage: goal.progressPercentage,
        remainingAmount: goal.remainingAmount,
        isCompleted: goal.isCompleted,
        priority: goal.priority,
        category: goal.category ? {
          id: goal.category._id,
          name: goal.category.name,
          color: goal.category.color
        } : null,
        contributions: goal.contributions.map(c => ({
          date: c.date,
          amount: c.amount,
          notes: c.notes
        })),
        createdAt: goal.createdAt
      }))
    };
    
    // Return data in requested format
    if (format === 'csv') {
      // Flatten data for CSV
      const flatData = goals.map(goal => ({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
        progressPercentage: goal.progressPercentage.toFixed(2),
        remainingAmount: goal.remainingAmount,
        isCompleted: goal.isCompleted ? 'Yes' : 'No',
        priority: goal.priority,
        category: goal.category ? goal.category.name : 'None'
      }));
      
      // Convert to CSV
      const fields = [
        'name', 'targetAmount', 'currentAmount', 'targetDate',
        'progressPercentage', 'remainingAmount', 'isCompleted',
        'priority', 'category'
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flatData);
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`savings-goals-report.csv`);
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Generate bills report
 * @route   GET /api/reports/bills
 * @access  Private
 */
exports.getBillsReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    // Query all bills for the user
    const bills = await Bill.find({ user: req.user.id })
      .populate('category', 'name color');
    
    // Separate bills into upcoming, overdue and paid
    const today = new Date();
    const upcomingBills = bills.filter(bill => 
      !bill.isPaid && new Date(bill.dueDate) >= today
    );
    
    const overdueBills = bills.filter(bill => 
      !bill.isPaid && new Date(bill.dueDate) < today
    );
    
    const paidBills = bills.filter(bill => bill.isPaid);
    
    // Calculate total amounts
    const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalOverdue = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalPaid = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    // Prepare response data
    const reportData = {
      summary: {
        totalBills: bills.length,
        upcomingBills: upcomingBills.length,
        overdueBills: overdueBills.length,
        paidBills: paidBills.length,
        totalUpcomingAmount: totalUpcoming,
        totalOverdueAmount: totalOverdue,
        totalPaidAmount: totalPaid
      },
      upcomingBills: upcomingBills.map(bill => ({
        id: bill._id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        frequency: bill.frequency,
        category: bill.category ? {
          id: bill.category._id,
          name: bill.category.name,
          color: bill.category.color
        } : null,
        notes: bill.notes
      })),
      overdueBills: overdueBills.map(bill => ({
        id: bill._id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        frequency: bill.frequency,
        category: bill.category ? {
          id: bill.category._id,
          name: bill.category.name,
          color: bill.category.color
        } : null,
        notes: bill.notes
      })),
      paidBills: paidBills.map(bill => ({
        id: bill._id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        frequency: bill.frequency,
        category: bill.category ? {
          id: bill.category._id,
          name: bill.category.name,
          color: bill.category.color
        } : null,
        notes: bill.notes,
        paymentHistory: bill.paymentHistory.map(payment => ({
          date: payment.date,
          amount: payment.amount,
          notes: payment.notes
        }))
      }))
    };
    
    // Return data in requested format
    if (format === 'csv') {
      // Flatten data for CSV - include all bills in one report
      const flatData = bills.map(bill => ({
        name: bill.name,
        amount: bill.amount,
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
        frequency: bill.frequency,
        isPaid: bill.isPaid ? 'Yes' : 'No',
        status: bill.isPaid ? 'Paid' : 
                new Date(bill.dueDate) < today ? 'Overdue' : 'Upcoming',
        category: bill.category ? bill.category.name : 'None',
        notes: bill.notes
      }));
      
      // Convert to CSV
      const fields = [
        'name', 'amount', 'dueDate', 'frequency',
        'isPaid', 'status', 'category', 'notes'
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flatData);
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`bills-report.csv`);
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Generate full financial report (combines all data)
 * @route   GET /api/reports/all
 * @access  Private
 */
exports.getFullReport = async (req, res) => {
  try {
    // Get date range from query params
    const { startDate, endDate, format = 'json' } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }
    
    // Set up date filters
    const dateFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Run all queries in parallel for efficiency
    const [transactions, categories, bills, savingsGoals] = await Promise.all([
      Transaction.find({
        user: req.user.id,
        ...dateFilter
      }).populate('category', 'name color'),
      
      Category.find({ user: req.user.id }),
      
      Bill.find({ user: req.user.id }),
      
      SavingsGoal.find({ user: req.user.id })
    ]);
    
    // Calculate income/expense summary
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    // Calculate total savings
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    
    // Calculate bill totals
    const today = new Date();
    const upcomingBills = bills.filter(bill => 
      !bill.isPaid && new Date(bill.dueDate) >= today && new Date(bill.dueDate) <= new Date(endDate)
    );
    
    const totalUpcomingBills = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    // Prepare the full report
    const reportData = {
      period: {
        startDate,
        endDate
      },
      finances: {
        income,
        expenses,
        balance,
        savingsTotal: totalSaved,
        savingsGoal: totalSavingsTarget,
        upcomingBills: totalUpcomingBills,
        netWorth: balance + totalSaved - totalUpcomingBills
      },
      activity: {
        transactionCount: transactions.length,
        categoryCount: categories.length,
        billCount: bills.length,
        savingsGoalCount: savingsGoals.length
      },
      status: {
        overBudgetCategories: categories.filter(cat => {
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category && t.category._id.toString() === cat._id.toString())
            .reduce((sum, t) => sum + t.amount, 0);
          
          return cat.budget > 0 && spent > cat.budget;
        }).length,
        completedSavingsGoals: savingsGoals.filter(g => g.isCompleted).length,
        overdueBills: bills.filter(bill => !bill.isPaid && new Date(bill.dueDate) < today).length
      }
    };
    
    // Return data in requested format
    if (format === 'csv') {
      // Create multiple CSV tables
      const transactionData = transactions.map(t => ({
        type: t.type,
        description: t.description,
        amount: t.amount,
        date: new Date(t.date).toISOString().split('T')[0],
        category: t.category ? t.category.name : 'Uncategorized'
      }));
      
      const categoryData = categories.map(cat => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category && t.category._id.toString() === cat._id.toString())
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          category: cat.name,
          budget: cat.budget || 0,
          spent,
          remaining: (cat.budget || 0) - spent,
          status: (cat.budget > 0 && spent > cat.budget) ? 'Over Budget' : 'Within Budget'
        };
      });
      
      const billData = bills.map(bill => ({
        name: bill.name,
        amount: bill.amount,
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
        frequency: bill.frequency,
        isPaid: bill.isPaid ? 'Yes' : 'No',
        status: bill.isPaid ? 'Paid' : 
                new Date(bill.dueDate) < today ? 'Overdue' : 'Upcoming'
      }));
      
      const savingsData = savingsGoals.map(goal => ({
        name: goal.name,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        progress: `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%`,
        isCompleted: goal.isCompleted ? 'Yes' : 'No'
      }));
      
      // Build a multi-section CSV with headers
      let csv = 'FINANCIAL REPORT\n';
      csv += `Period: ${startDate} to ${endDate}\n\n`;
      
      csv += 'SUMMARY\n';
      csv += `Income,${income}\n`;
      csv += `Expenses,${expenses}\n`;
      csv += `Balance,${balance}\n`;
      csv += `Savings,${totalSaved}\n`;
      csv += `Net Worth,${balance + totalSaved - totalUpcomingBills}\n\n`;
      
      // Transactions section
      csv += 'TRANSACTIONS\n';
      if (transactionData.length > 0) {
        const transactionFields = ['type', 'description', 'amount', 'date', 'category'];
        const transactionParser = new Parser({ fields: transactionFields });
        csv += transactionParser.parse(transactionData) + '\n\n';
      } else {
        csv += 'No transactions for this period\n\n';
      }
      
      // Category budget section
      csv += 'CATEGORY BUDGETS\n';
      if (categoryData.length > 0) {
        const categoryFields = ['category', 'budget', 'spent', 'remaining', 'status'];
        const categoryParser = new Parser({ fields: categoryFields });
        csv += categoryParser.parse(categoryData) + '\n\n';
      } else {
        csv += 'No categories found\n\n';
      }
      
      // Bills section
      csv += 'BILLS\n';
      if (billData.length > 0) {
        const billFields = ['name', 'amount', 'dueDate', 'frequency', 'isPaid', 'status'];
        const billParser = new Parser({ fields: billFields });
        csv += billParser.parse(billData) + '\n\n';
      } else {
        csv += 'No bills found\n\n';
      }
      
      // Savings goals section
      csv += 'SAVINGS GOALS\n';
      if (savingsData.length > 0) {
        const savingsFields = ['name', 'currentAmount', 'targetAmount', 'progress', 'isCompleted'];
        const savingsParser = new Parser({ fields: savingsFields });
        csv += savingsParser.parse(savingsData);
      } else {
        csv += 'No savings goals found';
      }
      
      res.header('Content-Type', 'text/csv');
      res.attachment(`financial-report-${startDate}-to-${endDate}.csv`);
      return res.send(csv);
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};