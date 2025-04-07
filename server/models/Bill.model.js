const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a bill name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentHistory: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      amount: {
        type: Number,
        required: true
      },
      notes: {
        type: String
      }
    }
  ],
  reminderDays: {
    type: Number,
    default: 3, // Remind user 3 days before due date by default
    min: 0,
    max: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster querying
BillSchema.index({ user: 1, dueDate: 1 });
BillSchema.index({ user: 1, isPaid: 1 });

module.exports = mongoose.model('Bill', BillSchema);