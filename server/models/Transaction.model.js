const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() {
      return this.type === 'expense'; // Only required for expenses
    }
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ category: 1, user: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);