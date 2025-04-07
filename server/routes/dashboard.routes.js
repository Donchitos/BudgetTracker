const express = require('express');
const {
  getDashboardSummary,
  getExpenseBreakdown,
  getBudgetVsActual,
  getSpendingTrends
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Dashboard routes
router.get('/summary', getDashboardSummary);
router.get('/expense-breakdown', getExpenseBreakdown);
router.get('/budget-actual', getBudgetVsActual);
router.get('/spending-trends', getSpendingTrends);

module.exports = router;