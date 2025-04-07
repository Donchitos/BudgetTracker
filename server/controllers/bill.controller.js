const Bill = require('../models/Bill.model');
const Transaction = require('../models/Transaction.model');
const { startOfDay, endOfDay, addDays } = require('date-fns');

/**
 * @desc    Get all bills for a user
 * @route   GET /api/bills
 * @access  Private
 */
exports.getBills = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by frequency if provided
    if (req.query.frequency) {
      query.frequency = req.query.frequency;
    }
    
    // Filter by due date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.dueDate = {
        $gte: startOfDay(new Date(req.query.startDate)),
        $lte: endOfDay(new Date(req.query.endDate))
      };
    } else if (req.query.startDate) {
      query.dueDate = { $gte: startOfDay(new Date(req.query.startDate)) };
    } else if (req.query.endDate) {
      query.dueDate = { $lte: endOfDay(new Date(req.query.endDate)) };
    }
    
    // Sorting options
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by due date (soonest first)
      sort.dueDate = 1;
    }
    
    // Execute query
    const bills = await Bill.find(query)
      .populate('category', 'name color icon')
      .sort(sort);
    
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
    
    // Create bill
    const bill = await Bill.create(req.body);
    
    // Populate category details
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
    
    // Don't allow direct manipulation of payments array through update
    if (req.body.payments) {
      delete req.body.payments;
    }
    
    // Update bill
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
    const { paymentAmount, paymentDate, paymentMethod, notes, createTransaction } = req.body;
    
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
    
    // Create payment record
    const payment = {
      amount: parseFloat(paymentAmount) || bill.amount,
      date: paymentDate ? new Date(paymentDate) : new Date(),
      method: paymentMethod || '',
      notes: notes || ''
    };
    
    // Create transaction if requested
    if (createTransaction) {
      const transactionData = {
        description: `Payment for ${bill.name}`,
        amount: payment.amount,
        type: 'expense',
        date: payment.date,
        category: bill.category,
        notes: `Bill payment: ${bill.name}`,
        user: req.user.id
      };
      
      const transaction = await Transaction.create(transactionData);
      payment.transactionId = transaction._id;
    }
    
    // Add payment to bill
    bill.payments.push(payment);
    
    // Update bill status
    bill.status = 'paid';
    
    // For recurring bills, update due date to next occurrence
    if (bill.frequency !== 'one-time') {
      const nextDueDate = bill.nextDueDate;
      bill.dueDate = nextDueDate;
      bill.status = 'pending'; // Reset status for next occurrence
    }
    
    await bill.save();
    
    // Populate bill details
    const updatedBill = await Bill.findById(bill._id).populate(
      'category',
      'name color icon'
    );
    
    res.status(200).json({
      success: true,
      data: updatedBill
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Skip current bill payment (for recurring bills)
 * @route   PUT /api/bills/:id/skip
 * @access  Private
 */
exports.skipBillPayment = async (req, res) => {
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
    
    // Can only skip if bill is recurring
    if (bill.frequency === 'one-time') {
      return res.status(400).json({
        success: false,
        message: 'Cannot skip a one-time bill'
      });
    }
    
    // Update bill status
    bill.status = 'skipped';
    
    // Update due date to next occurrence
    const nextDueDate = bill.nextDueDate;
    bill.dueDate = nextDueDate;
    bill.status = 'pending'; // Reset status for next occurrence
    
    await bill.save();
    
    // Populate bill details
    const updatedBill = await Bill.findById(bill._id).populate(
      'category',
      'name color icon'
    );
    
    res.status(200).json({
      success: true,
      data: updatedBill
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get upcoming bills/reminders
 * @route   GET /api/bills/upcoming
 * @access  Private
 */
exports.getUpcomingBills = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 7;
    const today = startOfDay(new Date());
    const futureDate = endOfDay(addDays(today, daysAhead));
    
    // Find bills due in the specified period
    const bills = await Bill.find({
      user: req.user.id,
      status: 'pending',
      dueDate: {
        $gte: today,
        $lte: futureDate
      }
    })
      .populate('category', 'name color icon')
      .sort({ dueDate: 1 });
    
    // Find bills that are overdue
    const overdueBills = await Bill.find({
      user: req.user.id,
      status: 'pending',
      dueDate: { $lt: today }
    })
      .populate('category', 'name color icon')
      .sort({ dueDate: 1 });
    
    // Calculate upcoming reminder dates for each bill
    const reminders = [];
    
    // Add overdue bills as immediate reminders
    overdueBills.forEach(bill => {
      reminders.push({
        bill: {
          _id: bill._id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.dueDate,
          frequency: bill.frequency,
          category: bill.category
        },
        daysUntilDue: bill.daysUntilDue,
        status: 'overdue'
      });
    });
    
    // Add upcoming bills based on their reminder settings
    bills.forEach(bill => {
      const daysUntilDue = bill.daysUntilDue;
      
      // If reminder is due based on the bill's reminderDays setting
      if (daysUntilDue <= bill.reminderDays) {
        reminders.push({
          bill: {
            _id: bill._id,
            name: bill.name,
            amount: bill.amount,
            dueDate: bill.dueDate,
            frequency: bill.frequency,
            category: bill.category
          },
          daysUntilDue,
          status: daysUntilDue <= 0 ? 'due' : 'upcoming'
        });
      }
    });
    
    res.status(200).json({
      success: true,
      count: reminders.length,
      data: {
        upcomingBills: bills,
        overdueBills,
        reminders
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
 * @desc    Get bill statistics
 * @route   GET /api/bills/stats
 * @access  Private
 */
exports.getBillStats = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    
    // Count bills by status
    const counts = {
      total: await Bill.countDocuments({ user: req.user.id }),
      pending: await Bill.countDocuments({ user: req.user.id, status: 'pending' }),
      paid: await Bill.countDocuments({ user: req.user.id, status: 'paid' }),
      overdue: await Bill.countDocuments({ 
        user: req.user.id, 
        status: 'pending',
        dueDate: { $lt: today }
      }),
      upcoming: await Bill.countDocuments({
        user: req.user.id,
        status: 'pending',
        dueDate: { 
          $gte: today,
          $lte: addDays(today, 7)
        }
      })
    };
    
    // Calculate total amounts
    const pendingBills = await Bill.find({ 
      user: req.user.id, 
      status: 'pending'
    });
    
    const upcomingBills = await Bill.find({
      user: req.user.id,
      status: 'pending',
      dueDate: { 
        $gte: today,
        $lte: addDays(today, 30)
      }
    });
    
    const amounts = {
      pendingTotal: pendingBills.reduce((sum, bill) => sum + bill.amount, 0),
      upcomingMonthTotal: upcomingBills.reduce((sum, bill) => sum + bill.amount, 0)
    };
    
    // Group bills by category
    const billsByCategory = await Bill.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: {
          path: '$categoryDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          category: '$_id',
          categoryName: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] },
          categoryColor: { $ifNull: ['$categoryDetails.color', '#CCCCCC'] },
          count: 1,
          totalAmount: 1
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        counts,
        amounts,
        billsByCategory
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};