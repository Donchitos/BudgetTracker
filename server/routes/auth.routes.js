const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  updateSettings
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/settings', protect, updateSettings);

module.exports = router;