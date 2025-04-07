const mongoose = require('mongoose');

const BudgetTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  totalBudget: {
    type: Number,
    required: [true, 'Please add a total budget amount'],
    min: [0, 'Total budget cannot be negative']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  categories: [
    {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      },
      amount: {
        type: Number,
        required: [true, 'Please add a budget amount for this category'],
        min: [0, 'Budget amount cannot be negative']
      },
      percentage: {
        type: Number,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100']
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to calculate percentages
BudgetTemplateSchema.pre('save', function(next) {
  // Skip if there's no total budget
  if (!this.totalBudget || this.totalBudget === 0) {
    return next();
  }
  
  // Calculate percentages for each category
  this.categories.forEach(category => {
    category.percentage = Math.round((category.amount / this.totalBudget) * 100);
  });
  
  next();
});

// Virtual to check if percentages add up to 100
BudgetTemplateSchema.virtual('isBalanced').get(function() {
  if (!this.categories.length) return false;
  
  const totalPercentage = this.categories.reduce((total, category) => {
    return total + (category.percentage || 0);
  }, 0);
  
  // Allow a small tolerance for rounding errors
  return totalPercentage >= 99 && totalPercentage <= 101;
});

// Check if allocations add up to total budget
BudgetTemplateSchema.virtual('isAllocated').get(function() {
  if (!this.categories.length) return false;
  
  const totalAllocated = this.categories.reduce((total, category) => {
    return total + category.amount;
  }, 0);
  
  // Allow a small tolerance for rounding errors
  return Math.abs(totalAllocated - this.totalBudget) < 1;
});

// Include virtuals when converting to JSON
BudgetTemplateSchema.set('toJSON', { virtuals: true });
BudgetTemplateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BudgetTemplate', BudgetTemplateSchema);