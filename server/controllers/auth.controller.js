const crypto = require('crypto');
const User = require('../models/User.model');
const Category = require('../models/Category.model');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create default categories for the new user
    try {
      console.log(`Setting up basic categories for new user: ${user.email}`);
      
      // Create user-focused categories with useful defaults
      await Category.insertMany([
        { name: 'Groceries', color: '#FF5733', icon: 'FastfoodIcon', user: user._id },
        { name: 'Transport', color: '#337DFF', icon: 'DirectionsCarIcon', user: user._id },
        { name: 'Housing', color: '#33FF57', icon: 'HomeIcon', user: user._id },
        { name: 'Entertainment', color: '#F033FF', icon: 'MovieIcon', user: user._id },
        { name: 'Utilities', color: '#FFFF33', icon: 'BoltIcon', user: user._id },
        { name: 'Healthcare', color: '#71C9CE', icon: 'LocalHospitalIcon', user: user._id },
        { name: 'Insurance', color: '#A2D5F2', icon: 'SecurityIcon', user: user._id },
        { name: 'Internet', color: '#07689F', icon: 'WifiIcon', user: user._id },
        { name: 'Savings', color: '#40A798', icon: 'AccountBalanceWalletIcon', user: user._id },
        { name: 'Dining Out', color: '#6886C5', icon: 'RestaurantIcon', user: user._id },
      ]);
      
      console.log(`Successfully created default categories for ${user.email}`);
    } catch (error) {
      console.error('Error creating default categories for new user:', error);
      // We don't want the entire registration to fail if categories can't be created
      // Just log the error and continue
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    console.log('Login attempt with email:', email);

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    console.log('User found in DB:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    console.log('Checking password match...');
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch ? 'Success' : 'Failed');

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Log user out / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/auth/settings
 * @access  Private
 */
exports.updateSettings = async (req, res) => {
  try {
    // Only allow updating the settings field to prevent other fields like email from being changed
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only the provided settings
    if (req.body.settings) {
      // Merge existing settings with new ones
      user.settings = { ...user.settings, ...req.body.settings };
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetpassword/${resetToken}`;

    try {
      // In a real app, send an email with the reset URL
      // For now, just log it
      console.log(`Password reset token: ${resetToken}`);
      console.log(`Reset URL: ${resetUrl}`);

      res.status(200).json({
        success: true,
        data: {
          resetToken, // Only for development, remove in production
          resetUrl // Only for development, remove in production
        },
        message: 'Password reset token generated'
      });
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = User.getHashedToken(req.params.resettoken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Helper function to create and send token response
 * @param {Object} user - User document
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Enable secure cookies in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};