const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');

/**
 * @desc    Get all transactions for a user
 * @route   GET /api/transactions
 * @access  Private
 */
exports.getTransactions = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Filter by type if provided (income or expense)
    if (req.query.type) {
      query.type = req.query.type.toLowerCase();
    }
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by subcategory if provided
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }
    
    // Filter by tags if provided
    if (req.query.tags) {
      const tagList = req.query.tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagList };
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Sorting options
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by date in descending order (newest first)
      sort.date = -1;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    // Calculate pagination information
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      'category',
      'name color icon'
    );
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
exports.createTransaction = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Validate category if it's an expense
    if (req.body.type === 'expense' && req.body.category) {
      const category = await Category.findById(req.body.category);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Make sure category belongs to user
      if (category.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to use this category'
        });
      }
    }
    
    const transaction = await Transaction.create(req.body);
    
    // Populate the category details in the response
    const populatedTransaction = await Transaction.findById(transaction._id).populate(
      'category',
      'name color icon'
    );
    
    res.status(201).json({
      success: true,
      data: populatedTransaction
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
exports.updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this transaction'
      });
    }
    
    // Validate category if provided and if it's an expense
    if (
      (req.body.type === 'expense' || transaction.type === 'expense') && 
      req.body.category
    ) {
      const category = await Category.findById(req.body.category);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Make sure category belongs to user
      if (category.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to use this category'
        });
      }
    }
    
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      });
    }
    
    await transaction.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get transaction statistics
 * @route   GET /api/transactions/stats
 * @access  Private
 */
exports.getTransactionStats = async (req, res) => {
  try {
    // Filter by date range if provided
    const dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      dateFilter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      dateFilter.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      dateFilter.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Calculate total income
    const incomeTotal = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'income',
          ...dateFilter
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
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Calculate expenses by category
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          ...dateFilter
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
          categoryId: '$_id',
          categoryName: '$category.name',
          categoryColor: '$category.color',
          categoryIcon: '$category.icon',
          total: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
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
        expensesByCategory
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};