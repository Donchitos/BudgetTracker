const express = require('express');
const {
  getSpendingTrends,
  getIncomeVsExpenseTrends,
  getBudgetVsActual,
  getYearlySummary,
  getFinancialInsights,
  generateFinancialReport,
  getFinancialHealthScore
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all analytics routes
router.use(protect);

// GET routes for different analytics
router.route('/spending-trends').get(getSpendingTrends);
router.route('/income-expense').get(getIncomeVsExpenseTrends);
router.route('/budget-actual').get(getBudgetVsActual);
router.route('/yearly-summary').get(getYearlySummary);
router.route('/insights').get(getFinancialInsights);
router.route('/report').get(generateFinancialReport);
router.route('/health-score').get(getFinancialHealthScore);

module.exports = router;