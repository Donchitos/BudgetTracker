const SavingsGoal = require('../models/SavingsGoal.model');
const Category = require('../models/Category.model');

/**
 * @desc    Get all savings goals for a user
 * @route   GET /api/savings
 * @access  Private
 */
exports.getSavingsGoals = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Filter by completion status if provided
    if (req.query.isCompleted !== undefined) {
      query.isCompleted = req.query.isCompleted === 'true';
    }
    
    // Filter by specific category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Sorting options
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by target date in ascending order (closest target date first)
      sort.targetDate = 1;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const goals = await SavingsGoal.find(query)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    
    // Get total count for pagination
    const total = await SavingsGoal.countDocuments(query);
    
    // Calculate pagination information
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    res.status(200).json({
      success: true,
      count: goals.length,
      pagination,
      data: goals
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
    const goal = await SavingsGoal.findById(req.params.id).populate(
      'category',
      'name color icon'
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure goal belongs to user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this savings goal'
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
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
    
    // Validate category if provided
    if (req.body.category) {
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
    
    // Create the savings goal
    const goal = await SavingsGoal.create(req.body);
    
    // Populate the category details in the response
    const populatedGoal = await SavingsGoal.findById(goal._id).populate(
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
    let goal = await SavingsGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure goal belongs to user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this savings goal'
      });
    }
    
    // Validate category if provided
    if (req.body.category) {
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
    
    // Update goal
    goal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');
    
    // Check if goal is completed after update
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      await goal.save();
    }
    
    res.status(200).json({
      success: true,
      data: goal
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
    const goal = await SavingsGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure goal belongs to user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this savings goal'
      });
    }
    
    await goal.remove();
    
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
 * @desc    Add contribution to savings goal
 * @route   POST /api/savings/:id/contribute
 * @access  Private
 */
exports.addContribution = async (req, res) => {
  try {
    // Validate input
    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contribution amount'
      });
    }
    
    const goal = await SavingsGoal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }
    
    // Make sure goal belongs to user
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this savings goal'
      });
    }
    
    // Create contribution object
    const contribution = {
      date: new Date(),
      amount: req.body.amount,
      notes: req.body.notes || `Contribution to ${goal.name}`
    };
    
    // Add contribution to history
    goal.contributions.push(contribution);
    
    // Update current amount
    goal.currentAmount += req.body.amount;
    
    // Check if goal is now completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    
    await goal.save();
    
    // Populate category information
    const updatedGoal = await SavingsGoal.findById(goal._id).populate(
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
 * @desc    Get summary of all savings goals
 * @route   GET /api/savings/summary
 * @access  Private
 */
exports.getSavingsSummary = async (req, res) => {
  try {
    // Get all savings goals for the user
    const goals = await SavingsGoal.find({ user: req.user.id });
    
    // Calculate total saved and total targets
    const totalSaved = goals.reduce((total, goal) => total + goal.currentAmount, 0);
    const totalTargets = goals.reduce((total, goal) => total + goal.targetAmount, 0);
    
    // Calculate overall progress percentage
    const overallProgress = totalTargets > 0 
      ? Math.round((totalSaved / totalTargets) * 100) 
      : 0;
    
    // Get counts
    const completedCount = goals.filter(goal => goal.isCompleted).length;
    const inProgressCount = goals.length - completedCount;
    
    // Get upcoming goals (target date within the next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingGoals = goals.filter(goal => {
      if (goal.isCompleted) return false;
      const targetDate = new Date(goal.targetDate);
      return targetDate >= today && targetDate <= thirtyDaysFromNow;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalSaved,
        totalTargets,
        overallProgress,
        totalGoals: goals.length,
        completedGoals: completedCount,
        inProgressGoals: inProgressCount,
        upcomingGoals: upcomingGoals.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};