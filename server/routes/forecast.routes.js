const express = require('express');
const {
  getExpenseForecast,
  getCashflowPrediction
} = require('../controllers/forecast.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all forecast routes
router.use(protect);

// GET routes
router.route('/expenses').get(getExpenseForecast);
router.route('/cashflow').get(getCashflowPrediction);

module.exports = router;