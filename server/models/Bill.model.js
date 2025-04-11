const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name for this bill'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please specify bill amount'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please specify due date']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'annually', 'financial-year'],
    default: 'monthly'
  },
  paymentMethod: {
    type: String,
    enum: ['direct-debit', 'bpay', 'credit-card', 'eftpos', 'cash', 'bank-transfer', 'payid', 'other'],
    default: 'bpay',
    trim: true
  },
  autoPay: {
    type: Boolean,
    default: false
  },
  website: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  reminderDays: {
    type: Number,
    default: 3,
    min: 0,
    max: 30
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'skipped'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payments: [
    {
      amount: {
        type: Number,
        required: true,
        min: [0.01, 'Payment must be at least 0.01']
      },
      date: {
        type: Date,
        default: Date.now
      },
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
      },
      method: {
        type: String,
        trim: true
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot be more than 200 characters']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for days until due
BillSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for payment status
BillSchema.virtual('paymentStatus').get(function() {
  // If bill is already marked as paid or skipped, return that
  if (this.status === 'paid' || this.status === 'skipped') {
    return this.status;
  }
  
  // Otherwise, calculate based on due date
  const today = new Date();
  const due = new Date(this.dueDate);
  
  if (due < today) {
    return 'overdue';
  } else {
    return 'pending';
  }
});

// Virtual for next due date (for recurring bills)
BillSchema.virtual('nextDueDate').get(function() {
  const currentDueDate = new Date(this.dueDate);
  
  // If this is a one-time bill, or if it's not yet due, return current due date
  if (this.frequency === 'one-time' || currentDueDate > new Date()) {
    return currentDueDate;
  }
  
  // Calculate next due date based on frequency
  const now = new Date();
  let nextDue = new Date(currentDueDate);
  
  while (nextDue < now) {
    switch (this.frequency) {
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'biweekly': // keep for backward compatibility
        nextDue.setDate(nextDue.getDate() + 14);
        break;
      case 'fortnightly': // Australian term for biweekly
        nextDue.setDate(nextDue.getDate() + 14);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'annually':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      case 'financial-year': // Australian financial year (July 1 to June 30)
        // If current month is before July, set to July of the same year
        // If current month is July or later, set to July of the next year
        if (nextDue.getMonth() < 6) { // 6 = July (0-indexed)
          nextDue.setMonth(6);
          nextDue.setDate(1);
        } else {
          nextDue.setFullYear(nextDue.getFullYear() + 1);
          nextDue.setMonth(6);
          nextDue.setDate(1);
        }
        break;
      default:
        return currentDueDate;
    }
  }
  
  return nextDue;
});

// Index for faster querying
BillSchema.index({ user: 1, dueDate: 1 });
BillSchema.index({ status: 1 });

// Apply virtuals when converting to JSON
BillSchema.set('toJSON', { virtuals: true });
BillSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bill', BillSchema);