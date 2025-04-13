const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  color: {
    type: String,
    default: '#1976d2', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  icon: {
    type: String,
    default: 'CategoryIcon'
  },
  budget: {
    type: Number,
    default: 0
  },
  rolloverUnused: {
    type: Boolean,
    default: false
  },
  rolloverPercentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  rolloverCap: {
    type: Number,
    default: null
  },
  lastRolloverAmount: {
    type: Number,
    default: 0
  },
  lastRolloverDate: {
    type: Date,
    default: null
  },
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

// Prevent duplicate category names for the same user
CategorySchema.index({ name: 1, user: 1 }, { unique: true });

// Create static method to find categories by user ID
CategorySchema.statics.findByUserId = function(userId) {
  return this.find({ user: userId }).sort('name');
};

module.exports = mongoose.model('Category', CategorySchema);