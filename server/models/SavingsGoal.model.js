const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name for this goal'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please specify target amount'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Please specify target date']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'cancelled'],
    default: 'in_progress'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributions: [
    {
      amount: {
        type: Number,
        required: true,
        min: [0.01, 'Contribution must be at least 0.01']
      },
      date: {
        type: Date,
        default: Date.now
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

// Virtual for progress percentage
SavingsGoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount <= 0) return 0;
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
});

// Virtual for remaining amount
SavingsGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for days remaining
SavingsGoalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for daily savings needed
SavingsGoalSchema.virtual('dailySavingsNeeded').get(function() {
  const daysRemaining = this.daysRemaining;
  if (daysRemaining <= 0) return 0;
  return this.remainingAmount / daysRemaining;
});

// Index for faster querying
SavingsGoalSchema.index({ user: 1, status: 1 });
SavingsGoalSchema.index({ targetDate: 1 });

// Apply virtuals when converting to JSON
SavingsGoalSchema.set('toJSON', { virtuals: true });
SavingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);