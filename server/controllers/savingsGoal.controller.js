const SavingsGoal = require('../models/SavingsGoal.model');
const Transaction = require('../models/Transaction.model');

/**
 * @desc    Get all savings goals for a user
 * @route   GET /api/savings
 * @access  Private
 */
exports.getSavingsGoals = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by priority if provided
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Sorting options
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by target date (closest first)
      sort.targetDate = 1;
    }
    
    // Execute query
    const savingsGoals = await SavingsGoal.find(query)
      .populate('category', 'name color icon')
      .sort(sort);
    
    res.status(200).json({
      success: true,
      count: savingsGoals.length,
      data: savingsGoals
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get single savings goal
 * @route   GET /api/savings/:id
 * @access  Private
 */
exports.getSavingsGoal = async (req, res) => {
  try {
    const savingsGoal = await SavingsGoal.findById(req.params.id).populate(
      'category',
      'name color icon'
    );
    
    if (!savingsGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure savings goal belongs to user
    if (savingsGoal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this savings goal'
      });
    }
    
    res.status(200).json({
      success: true,
      data: savingsGoal
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Create new savings goal
 * @route   POST /api/savings
 * @access  Private
 */
exports.createSavingsGoal = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create savings goal
    const savingsGoal = await SavingsGoal.create(req.body);
    
    // Populate category details
    const populatedGoal = await SavingsGoal.findById(savingsGoal._id).populate(
      'category',
      'name color icon'
    );
    
    res.status(201).json({
      success: true,
      data: populatedGoal
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update savings goal
 * @route   PUT /api/savings/:id
 * @access  Private
 */
exports.updateSavingsGoal = async (req, res) => {
  try {
    let savingsGoal = await SavingsGoal.findById(req.params.id);
    
    if (!savingsGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure savings goal belongs to user
    if (savingsGoal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this savings goal'
      });
    }
    
    // Don't allow direct manipulation of contributions array through update
    if (req.body.contributions) {
      delete req.body.contributions;
    }
    
    // Update savings goal
    savingsGoal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');
    
    res.status(200).json({
      success: true,
      data: savingsGoal
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Delete savings goal
 * @route   DELETE /api/savings/:id
 * @access  Private
 */
exports.deleteSavingsGoal = async (req, res) => {
  try {
    const savingsGoal = await SavingsGoal.findById(req.params.id);
    
    if (!savingsGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure savings goal belongs to user
    if (savingsGoal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this savings goal'
      });
    }
    
    await savingsGoal.remove();
    
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
 * @desc    Add contribution to a savings goal
 * @route   POST /api/savings/:id/contributions
 * @access  Private
 */
exports.addContribution = async (req, res) => {
  try {
    const { amount, notes } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contribution amount'
      });
    }
    
    let savingsGoal = await SavingsGoal.findById(req.params.id);
    
    if (!savingsGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure savings goal belongs to user
    if (savingsGoal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to contribute to this savings goal'
      });
    }
    
    // Don't allow contributions to completed/cancelled goals
    if (savingsGoal.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot contribute to a ${savingsGoal.status} goal`
      });
    }
    
    // Create contribution
    const contribution = {
      amount,
      date: new Date(),
      notes: notes || ''
    };
    
    // Add contribution to goal
    savingsGoal.contributions.push(contribution);
    
    // Update current amount
    savingsGoal.currentAmount += parseFloat(amount);
    
    // Check if goal is reached
    if (savingsGoal.currentAmount >= savingsGoal.targetAmount) {
      savingsGoal.status = 'completed';
    }
    
    // Save updated goal
    await savingsGoal.save();
    
    // Optional: Create a transaction record linked to this contribution
    const transactionData = {
      description: `Contribution to ${savingsGoal.name}`,
      amount: parseFloat(amount),
      type: 'expense', // Could be customized based on your app's logic
      date: new Date(),
      category: savingsGoal.category,
      notes: `Savings goal contribution: ${savingsGoal.name}`,
      user: req.user.id
    };
    
    await Transaction.create(transactionData);
    
    // Return updated goal
    const updatedGoal = await SavingsGoal.findById(req.params.id).populate(
      'category',
      'name color icon'
    );
    
    res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Change savings goal status (complete/cancel)
 * @route   PUT /api/savings/:id/status
 * @access  Private
 */
exports.changeGoalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!status || !['in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (in_progress, completed, cancelled)'
      });
    }
    
    let savingsGoal = await SavingsGoal.findById(req.params.id);
    
    if (!savingsGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure savings goal belongs to user
    if (savingsGoal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this savings goal'
      });
    }
    
    // Update status
    savingsGoal.status = status;
    
    // Auto-update current amount if completing
    if (status === 'completed' && savingsGoal.currentAmount < savingsGoal.targetAmount) {
      savingsGoal.currentAmount = savingsGoal.targetAmount;
    }
    
    // Save updated goal
    await savingsGoal.save();
    
    // Return updated goal
    const updatedGoal = await SavingsGoal.findById(req.params.id).populate(
      'category',
      'name color icon'
    );
    
    res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get savings goal statistics for a user
 * @route   GET /api/savings/stats
 * @access  Private
 */
exports.getSavingsStats = async (req, res) => {
  try {
    // Get all user's savings goals
    const savingsGoals = await SavingsGoal.find({ user: req.user.id });
    
    // Calculate statistics
    const totalGoals = savingsGoals.length;
    const completedGoals = savingsGoals.filter(goal => goal.status === 'completed').length;
    const inProgressGoals = savingsGoals.filter(goal => goal.status === 'in_progress').length;
    const cancelledGoals = savingsGoals.filter(goal => goal.status === 'cancelled').length;
    
    // Calculate total amounts
    const totalTargetAmount = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const completionPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    // Get goals with upcoming target dates
    const today = new Date();
    const upcomingGoals = savingsGoals
      .filter(goal => goal.status === 'in_progress' && new Date(goal.targetDate) > today)
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      .slice(0, 5);
    
    // Get recently completed goals
    const recentlyCompletedGoals = savingsGoals
      .filter(goal => goal.status === 'completed')
      .sort((a, b) => {
        const aDate = a.contributions.length > 0 ? 
          new Date(a.contributions[a.contributions.length - 1].date) : new Date(a.createdAt);
        const bDate = b.contributions.length > 0 ? 
          new Date(b.contributions[b.contributions.length - 1].date) : new Date(b.createdAt);
        return bDate - aDate;
      })
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      data: {
        totalGoals,
        completedGoals,
        inProgressGoals,
        cancelledGoals,
        totalTargetAmount,
        totalCurrentAmount,
        remainingAmount: totalTargetAmount - totalCurrentAmount,
        completionPercentage,
        upcomingGoals,
        recentlyCompletedGoals
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};