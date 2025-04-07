const RecurringTransaction = require('../models/RecurringTransaction.model');
const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');
const { 
  addDays, 
  addWeeks, 
  addMonths, 
  addQuarters, 
  addYears,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  format,
  getDay
} = require('date-fns');

/**
 * @desc    Get all recurring transactions for a user
 * @route   GET /api/recurring-transactions
 * @access  Private
 */
exports.getRecurringTransactions = async (req, res) => {
  try {
    // Filter by active status if provided
    const query = { user: req.user.id };
    
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type.toLowerCase();
    }
    
    const recurringTransactions = await RecurringTransaction.find(query)
      .populate('category', 'name color icon')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: recurringTransactions.length,
      data: recurringTransactions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get single recurring transaction
 * @route   GET /api/recurring-transactions/:id
 * @access  Private
 */
exports.getRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id)
      .populate('category', 'name color icon');
    
    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this recurring transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Create new recurring transaction
 * @route   POST /api/recurring-transactions
 * @access  Private
 */
exports.createRecurringTransaction = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Validate date fields
    if (req.body.startDate) {
      req.body.startDate = new Date(req.body.startDate);
    }
    
    if (req.body.endDate) {
      req.body.endDate = new Date(req.body.endDate);
    }
    
    // Validate frequency-specific fields
    validateFrequencyFields(req.body);
    
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
    
    const recurringTransaction = await RecurringTransaction.create(req.body);
    
    // Populate the category details in the response
    const populatedTransaction = await RecurringTransaction.findById(recurringTransaction._id)
      .populate('category', 'name color icon');
    
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
 * @desc    Update recurring transaction
 * @route   PUT /api/recurring-transactions/:id
 * @access  Private
 */
exports.updateRecurringTransaction = async (req, res) => {
  try {
    let recurringTransaction = await RecurringTransaction.findById(req.params.id);
    
    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recurring transaction'
      });
    }
    
    // Validate date fields
    if (req.body.startDate) {
      req.body.startDate = new Date(req.body.startDate);
    }
    
    if (req.body.endDate) {
      req.body.endDate = new Date(req.body.endDate);
    }
    
    // Validate frequency-specific fields
    if (req.body.frequency) {
      validateFrequencyFields(req.body);
    }
    
    // Validate category if provided and if it's an expense
    if (
      (req.body.type === 'expense' || recurringTransaction.type === 'expense') && 
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
    
    recurringTransaction = await RecurringTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');
    
    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Delete recurring transaction
 * @route   DELETE /api/recurring-transactions/:id
 * @access  Private
 */
exports.deleteRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);
    
    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recurring transaction'
      });
    }
    
    await recurringTransaction.remove();
    
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
 * @desc    Toggle recurring transaction active status
 * @route   PUT /api/recurring-transactions/:id/toggle
 * @access  Private
 */
exports.toggleRecurringTransaction = async (req, res) => {
  try {
    const recurringTransaction = await RecurringTransaction.findById(req.params.id);
    
    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Make sure transaction belongs to user
    if (recurringTransaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recurring transaction'
      });
    }
    
    // Toggle the active status
    recurringTransaction.isActive = !recurringTransaction.isActive;
    await recurringTransaction.save();
    
    res.status(200).json({
      success: true,
      data: recurringTransaction
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Generate transactions from recurring transactions
 * @route   POST /api/recurring-transactions/generate
 * @access  Private
 */
exports.generateTransactions = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const generateUntil = req.body.until ? new Date(req.body.until) : today;
    const specificId = req.body.recurringTransactionId || null;
    
    // Query for active recurring transactions
    const query = { 
      isActive: true,
      user: req.user.id 
    };
    
    // If a specific ID is provided, only generate for that one
    if (specificId) {
      query._id = specificId;
    }
    
    const recurringTransactions = await RecurringTransaction.find(query);
    
    const result = {
      success: true,
      generated: 0,
      skipped: 0,
      details: []
    };
    
    // Process each recurring transaction
    for (const recurring of recurringTransactions) {
      // Skip if the startDate is in the future
      if (isAfter(recurring.startDate, generateUntil)) {
        result.skipped++;
        result.details.push({
          recurringId: recurring._id,
          description: recurring.description,
          status: 'skipped',
          reason: 'Start date is in the future'
        });
        continue;
      }
      
      // Skip if the endDate is in the past
      if (recurring.endDate && isBefore(recurring.endDate, today)) {
        // If end date is in the past, mark as inactive
        recurring.isActive = false;
        await recurring.save();
        
        result.skipped++;
        result.details.push({
          recurringId: recurring._id,
          description: recurring.description,
          status: 'skipped',
          reason: 'End date has passed, marked as inactive'
        });
        continue;
      }
      
      // Determine the next occurrence date
      let nextDate = determineNextOccurrence(recurring, today);
      
      // If there's no next date or it's beyond the generateUntil date, skip
      if (!nextDate || isAfter(nextDate, generateUntil)) {
        result.skipped++;
        result.details.push({
          recurringId: recurring._id,
          description: recurring.description,
          status: 'skipped',
          reason: 'Next occurrence is beyond the generate-until date'
        });
        continue;
      }
      
      // Create the transaction
      const transaction = {
        description: recurring.description,
        amount: recurring.amount,
        type: recurring.type,
        date: nextDate,
        category: recurring.type === 'expense' ? recurring.category : null,
        subcategory: recurring.subcategory,
        tags: recurring.tags,
        notes: `${recurring.notes || ''} [Recurring Transaction]`,
        user: recurring.user
      };
      
      await Transaction.create(transaction);
      
      // Update the lastGeneratedDate
      recurring.lastGeneratedDate = nextDate;
      await recurring.save();
      
      result.generated++;
      result.details.push({
        recurringId: recurring._id,
        description: recurring.description,
        status: 'generated',
        date: format(nextDate, 'yyyy-MM-dd')
      });
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Helper to validate frequency-specific fields
 */
const validateFrequencyFields = (data) => {
  const { frequency } = data;
  
  if (frequency === 'weekly' || frequency === 'biweekly') {
    // Validate dayOfWeek field for weekly/biweekly
    if (data.dayOfWeek === undefined || data.dayOfWeek === null) {
      data.dayOfWeek = getDay(new Date()); // Default to current day of week
    } else {
      // Ensure it's within valid range
      data.dayOfWeek = Math.min(Math.max(parseInt(data.dayOfWeek), 0), 6);
    }
  } else if (frequency === 'monthly' || frequency === 'quarterly' || frequency === 'yearly') {
    // Validate dayOfMonth field for monthly/quarterly/yearly
    if (data.dayOfMonth === undefined || data.dayOfMonth === null) {
      data.dayOfMonth = new Date().getDate(); // Default to current day of month
    } else {
      // Ensure it's within valid range
      data.dayOfMonth = Math.min(Math.max(parseInt(data.dayOfMonth), 1), 31);
    }
  }
  
  return data;
};

/**
 * Helper to determine the next occurrence date for a recurring transaction
 */
const determineNextOccurrence = (recurring, today) => {
  // If no previous generations, start from the startDate
  const baseDate = recurring.lastGeneratedDate || recurring.startDate;
  let nextDate;
  
  // Calculate next date based on frequency
  switch (recurring.frequency) {
    case 'daily':
      nextDate = addDays(baseDate, 1);
      break;
      
    case 'weekly':
      nextDate = addWeeks(baseDate, 1);
      // Adjust to the correct day of week if specified
      if (recurring.dayOfWeek !== undefined && recurring.dayOfWeek !== null) {
        const currentDayOfWeek = getDay(nextDate);
        const daysToAdd = (recurring.dayOfWeek - currentDayOfWeek + 7) % 7;
        nextDate = addDays(nextDate, daysToAdd);
      }
      break;
      
    case 'biweekly':
      nextDate = addWeeks(baseDate, 2);
      // Adjust to the correct day of week if specified
      if (recurring.dayOfWeek !== undefined && recurring.dayOfWeek !== null) {
        const currentDayOfWeek = getDay(nextDate);
        const daysToAdd = (recurring.dayOfWeek - currentDayOfWeek + 7) % 7;
        nextDate = addDays(nextDate, daysToAdd);
      }
      break;
      
    case 'monthly':
      nextDate = addMonths(baseDate, 1);
      // Adjust to the correct day of month if specified
      if (recurring.dayOfMonth !== undefined && recurring.dayOfMonth !== null) {
        // Handle month length differences by capping at the last day of the month
        const lastDayOfMonth = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0
        ).getDate();
        const targetDay = Math.min(recurring.dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;
      
    case 'quarterly':
      nextDate = addQuarters(baseDate, 1);
      // Adjust to the correct day of month if specified
      if (recurring.dayOfMonth !== undefined && recurring.dayOfMonth !== null) {
        // Handle month length differences
        const lastDayOfMonth = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0
        ).getDate();
        const targetDay = Math.min(recurring.dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;
      
    case 'yearly':
      nextDate = addYears(baseDate, 1);
      // Adjust to the correct day of month if specified
      if (recurring.dayOfMonth !== undefined && recurring.dayOfMonth !== null) {
        // Handle month length differences and leap years
        const lastDayOfMonth = new Date(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          0
        ).getDate();
        const targetDay = Math.min(recurring.dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;
      
    default:
      // Default to monthly if frequency is invalid
      nextDate = addMonths(baseDate, 1);
  }
  
  // If next date is before today, recursively find the next valid date
  if (isBefore(nextDate, today)) {
    // Create a temporary recurringTransaction with the nextDate as lastGeneratedDate
    const tempRecurring = { 
      ...recurring.toObject(), 
      lastGeneratedDate: nextDate 
    };
    return determineNextOccurrence(tempRecurring, today);
  }
  
  return nextDate;
};