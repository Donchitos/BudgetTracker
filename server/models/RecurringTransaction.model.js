const mongoose = require('mongoose');

const RecurringTransactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [100, 'Description cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  type: {
    type: String,
    required: [true, 'Please specify transaction type'],
    enum: ['income', 'expense'],
    lowercase: true
  },
  frequency: {
    type: String,
    required: [true, 'Please specify frequency'],
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null means no end date
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() {
      return this.type === 'expense'; // Only required for expenses
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  // For weekly/biweekly transactions
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    min: 0,
    max: 6
  },
  // For monthly transactions
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31
  },
  // For tracking transaction generation
  lastGeneratedDate: {
    type: Date,
    default: null
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
RecurringTransactionSchema.index({ user: 1 });
RecurringTransactionSchema.index({ frequency: 1, isActive: 1 });

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);