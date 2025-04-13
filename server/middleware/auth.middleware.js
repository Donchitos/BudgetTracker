const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect routes - Middleware to verify user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
  console.log('Auth middleware called');
  
  try {
    // DEMO MODE CHECK - Accept any token in demo mode
    if (process.env.USE_DEMO_MODE === 'true') {
      console.log('Auth middleware: Using demo mode authentication');
      req.user = {
        _id: '1234567890',
        id: '1234567890', // Adding id property for consistency
        name: 'Demo User',
        email: 'demo@example.com'
      };
      return next();
    }

    // Get token from header or cookie
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header (Bearer token)
      token = req.headers.authorization.split(' ')[1];
      console.log('Using token from Authorization header');
    } else if (req.cookies && req.cookies.token) {
      // Get token from cookie
      token = req.cookies.token;
      console.log('Using token from cookie');
    }

    // Check if token exists
    if (!token) {
      console.log('No authentication token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token - this should throw an error if invalid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        console.log('Invalid token structure:', decoded);
        return res.status(401).json({
          success: false,
          message: 'Invalid token structure'
        });
      }

      console.log('Token verified for user ID:', decoded.id);

      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log('User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Convert mongoose document to plain JavaScript object 
      // This is important to avoid issues with serialization later
      const userObject = user.toObject ? user.toObject() : { ...user._doc };
      
      // Ensure ID is available in both formats (_id and id)
      if (userObject._id && !userObject.id) {
        userObject.id = userObject._id.toString();
      }
      
      // Store user in request object
      req.user = userObject;
      
      console.log('User authenticated:', user.email);
      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false, 
        message: 'Invalid authentication token'
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};