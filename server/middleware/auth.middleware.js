const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect routes - Middleware to verify user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
  // DEMO MODE CHECK - Accept any token in demo mode
  if (process.env.NODE_ENV !== 'production') {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header (Bearer token)
      token = req.headers.authorization.split(' ')[1];
      
      // For demo mode, accept any token that exists
      if (token) {
        req.user = {
          _id: '1234567890',
          name: 'Demo User',
          email: 'demo@example.com'
        };
        return next();
      }
    }
  }

  // STANDARD AUTHENTICATION for production
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header (Bearer token)
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Or get token from cookie if available
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};