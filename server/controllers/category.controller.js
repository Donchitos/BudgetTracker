const Category = require('../models/Category.model');

/**
 * @desc    Get all categories for a user
 * @route   GET /api/categories
 * @access  Private
 */
exports.getCategories = async (req, res) => {
  try {
    // Direct debug output to trace the issue
    console.log('------- CATEGORY DEBUG START -------');
    console.log('Getting categories for user with ID:', req.user.id);
    console.log('User object in request:', JSON.stringify(req.user));
    
    if (!req.user || !req.user.id) {
      console.error('User information missing in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Use the findByUserId static method we added to the Category model
    const categories = await Category.findByUserId(req.user.id);
    
    console.log(`Found ${categories.length} categories for user ${req.user.email}`);
    console.log('------- CATEGORY DEBUG END -------');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err.message, err.stack);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Private
 */
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Convert IDs to strings for consistent comparison
    const categoryUserId = category.user.toString();
    const requestUserId = req.user.id.toString();

    // Make sure the category belongs to user
    if (categoryUserId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this category'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Error fetching category:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private
 */
exports.createCategory = async (req, res) => {
  try {
    // Validate user exists in request
    if (!req.user || !req.user.id) {
      console.error('User information missing in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Add user to request body
    req.body.user = req.user.id;

    console.log('Creating category for user:', req.user.id, 'with data:', req.body);

    // Check for existing category with the same name for this user
    const existingCategory = await Category.findOne({
      name: req.body.name,
      user: req.user.id
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'You already have a category with this name'
      });
    }

    const category = await Category.create(req.body);
    console.log('Category created successfully:', category.name);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Error creating category:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Convert IDs to strings for consistent comparison
    const categoryUserId = category.user.toString();
    const requestUserId = req.user.id.toString();

    // Make sure the category belongs to user
    if (categoryUserId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this category'
      });
    }

    // Check if updating to a name that already exists for this user
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: req.body.name,
        user: req.user.id
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'You already have a category with this name'
        });
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    console.log('Category updated successfully:', category.name);

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Error updating category:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Convert IDs to strings for consistent comparison
    const categoryUserId = category.user.toString();
    const requestUserId = req.user.id.toString();

    // Make sure the category belongs to user
    if (categoryUserId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this category'
      });
    }

    // Use the newer deleteOne approach instead of category.remove()
    await Category.deleteOne({ _id: req.params.id });
    console.log('Category deleted successfully:', category.name);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};