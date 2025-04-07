const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name for the savings goal'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add a target date']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributions: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      amount: {
        type: Number,
        required: true,
        min: [0.01, 'Contribution amount must be at least 0.01']
      },
      notes: {
        type: String,
        trim: true
      }
    }
  ],
  color: {
    type: String,
    default: '#1976d2'
  },
  icon: {
    type: String,
    default: 'SavingsIcon'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster querying
SavingsGoalSchema.index({ user: 1, isCompleted: 1 });
SavingsGoalSchema.index({ user: 1, targetDate: 1 });

// Calculate progress percentage
SavingsGoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Calculate remaining amount
SavingsGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Calculate days remaining until target date
SavingsGoalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Include virtuals when converting to JSON
SavingsGoalSchema.set('toJSON', { virtuals: true });
SavingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);