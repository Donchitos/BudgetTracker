const BudgetTemplate = require('../models/BudgetTemplate.model');
const Category = require('../models/Category.model');

/**
 * @desc    Get all budget templates for a user
 * @route   GET /api/budget-templates
 * @access  Private
 */
exports.getBudgetTemplates = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Sorting options
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by name in ascending order
      sort.name = 1;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with pagination
    const templates = await BudgetTemplate.find(query)
      .populate('categories.category', 'name color icon')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);
    
    // Get total count for pagination
    const total = await BudgetTemplate.countDocuments(query);
    
    // Calculate pagination information
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    res.status(200).json({
      success: true,
      count: templates.length,
      pagination,
      data: templates
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get single budget template
 * @route   GET /api/budget-templates/:id
 * @access  Private
 */
exports.getBudgetTemplate = async (req, res) => {
  try {
    const template = await BudgetTemplate.findById(req.params.id).populate(
      'categories.category',
      'name color icon'
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Budget template not found'
      });
    }
    
    // Make sure template belongs to user
    if (template.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget template'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Create new budget template
 * @route   POST /api/budget-templates
 * @access  Private
 */
exports.createBudgetTemplate = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Validate that all categories exist and belong to the user
    if (req.body.categories && req.body.categories.length > 0) {
      // Check that all category IDs exist and belong to user
      const categoryIds = req.body.categories.map(cat => cat.category);
      const categories = await Category.find({
        _id: { $in: categoryIds },
        user: req.user.id
      });
      
      if (categories.length !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more categories do not exist or do not belong to you'
        });
      }
    }
    
    // Create the budget template
    const template = await BudgetTemplate.create(req.body);
    
    // Populate the category details in the response
    const populatedTemplate = await BudgetTemplate.findById(template._id).populate(
      'categories.category',
      'name color icon'
    );
    
    res.status(201).json({
      success: true,
      data: populatedTemplate
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update budget template
 * @route   PUT /api/budget-templates/:id
 * @access  Private
 */
exports.updateBudgetTemplate = async (req, res) => {
  try {
    let template = await BudgetTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Budget template not found'
      });
    }
    
    // Make sure template belongs to user
    if (template.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget template'
      });
    }
    
    // Validate that all categories exist and belong to the user
    if (req.body.categories && req.body.categories.length > 0) {
      // Check that all category IDs exist and belong to user
      const categoryIds = req.body.categories.map(cat => cat.category);
      const categories = await Category.find({
        _id: { $in: categoryIds },
        user: req.user.id
      });
      
      if (categories.length !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more categories do not exist or do not belong to you'
        });
      }
    }
    
    // If making this template the default, remove default flag from others
    if (req.body.isDefault) {
      await BudgetTemplate.updateMany(
        { user: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }
    
    // Update template
    template = await BudgetTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('categories.category', 'name color icon');
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Delete budget template
 * @route   DELETE /api/budget-templates/:id
 * @access  Private
 */
exports.deleteBudgetTemplate = async (req, res) => {
  try {
    const template = await BudgetTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Budget template not found'
      });
    }
    
    // Make sure template belongs to user
    if (template.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget template'
      });
    }
    
    await template.remove();
    
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
 * @desc    Get default budget template
 * @route   GET /api/budget-templates/default
 * @access  Private
 */
exports.getDefaultTemplate = async (req, res) => {
  try {
    const template = await BudgetTemplate.findOne({
      user: req.user.id,
      isDefault: true
    }).populate('categories.category', 'name color icon');
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'No default budget template found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Apply budget template to categories
 * @route   POST /api/budget-templates/:id/apply
 * @access  Private
 */
exports.applyBudgetTemplate = async (req, res) => {
  try {
    const template = await BudgetTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Budget template not found'
      });
    }
    
    // Make sure template belongs to user
    if (template.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to use this budget template'
      });
    }
    
    // Update category budgets based on template allocations
    const updatePromises = template.categories.map(async (cat) => {
      return Category.findByIdAndUpdate(
        cat.category,
        { budget: cat.amount },
        { new: true }
      );
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Budget template applied successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};