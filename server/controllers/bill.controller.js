const Bill = require('../models/Bill.model');
const Category = require('../models/Category.model');

/**
 * @desc    Get all bills for a user
 * @route   GET /api/bills
 * @access  Private
 */
exports.getBills = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Filter by isPaid if provided
    if (req.query.isPaid !== undefined) {
      query.isPaid = req.query.isPaid === 'true';
    }
    
    // Filter by future due dates (upcoming bills)
    if (req.query.upcoming === 'true') {
      query.dueDate = { $gte: new Date() };
      query.isPaid = false;
    }
    
    // Filter by overdue bills
    if (req.query.overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.isPaid = false;
    }
    
    // Filter by specific category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Sorting options
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by due date in ascending order (closest due date first)
      sort.dueDate = 1;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const bills = await Bill.find(query)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Bill.countDocuments(query);
    
    // Calculate pagination information
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    res.status(200).json({
      success: true,
      count: bills.length,
      pagination,
      data: bills
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get single bill
 * @route   GET /api/bills/:id
 * @access  Private
 */
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate(
      'category',
      'name color icon'
    );
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Make sure bill belongs to user
    if (bill.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this bill'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Create new bill
 * @route   POST /api/bills
 * @access  Private
 */
exports.createBill = async (req, res) => {
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
    
    const bill = await Bill.create(req.body);
    
    // Populate the category details in the response
    const populatedBill = await Bill.findById(bill._id).populate(
      'category',
      'name color icon'
    );
    
    res.status(201).json({
      success: true,
      data: populatedBill
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update bill
 * @route   PUT /api/bills/:id
 * @access  Private
 */
exports.updateBill = async (req, res) => {
  try {
    let bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Make sure bill belongs to user
    if (bill.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bill'
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
    
    bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color icon');
    
    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Delete bill
 * @route   DELETE /api/bills/:id
 * @access  Private
 */
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Make sure bill belongs to user
    if (bill.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this bill'
      });
    }
    
    await bill.remove();
    
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
 * @desc    Mark bill as paid
 * @route   PUT /api/bills/:id/pay
 * @access  Private
 */
exports.markBillAsPaid = async (req, res) => {
  try {
    let bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Make sure bill belongs to user
    if (bill.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bill'
      });
    }
    
    // Add payment to history
    const payment = {
      date: new Date(),
      amount: req.body.amount || bill.amount,
      notes: req.body.notes || `Payment for ${bill.name}`
    };
    
    bill.paymentHistory.push(payment);
    
    // If it's a recurring bill, update due date to next occurrence
    if (bill.frequency !== 'one-time') {
      const currentDueDate = new Date(bill.dueDate);
      let nextDueDate;
      
      switch (bill.frequency) {
        case 'weekly':
          nextDueDate = new Date(currentDueDate.setDate(currentDueDate.getDate() + 7));
          break;
        case 'monthly':
          nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 1));
          break;
        case 'quarterly':
          nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 3));
          break;
        case 'yearly':
          nextDueDate = new Date(currentDueDate.setFullYear(currentDueDate.getFullYear() + 1));
          break;
        default:
          nextDueDate = null;
      }
      
      if (nextDueDate) {
        bill.dueDate = nextDueDate;
        bill.isPaid = false;
      } else {
        bill.isPaid = true;
      }
    } else {
      // One-time bill
      bill.isPaid = true;
    }
    
    await bill.save();
    
    // Populate category information
    bill = await Bill.findById(bill._id).populate('category', 'name color icon');
    
    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get upcoming bills (due in the next X days)
 * @route   GET /api/bills/upcoming
 * @access  Private
 */
exports.getUpcomingBills = async (req, res) => {
  try {
    // Default to 7 days if not specified
    const days = parseInt(req.query.days, 10) || 7;
    
    // Calculate the date range
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    // Find upcoming bills
    const bills = await Bill.find({
      user: req.user.id,
      isPaid: false,
      dueDate: {
        $gte: today,
        $lte: endDate
      }
    })
      .populate('category', 'name color icon')
      .sort({ dueDate: 1 });
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get overdue bills
 * @route   GET /api/bills/overdue
 * @access  Private
 */
exports.getOverdueBills = async (req, res) => {
  try {
    // Find bills that are past due date and not paid
    const bills = await Bill.find({
      user: req.user.id,
      isPaid: false,
      dueDate: { $lt: new Date() }
    })
      .populate('category', 'name color icon')
      .sort({ dueDate: 1 });
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};