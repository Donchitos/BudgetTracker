const express = require('express');
const {
  getIncomeExpenseReport,
  getBudgetReport,
  getSavingsReport,
  getBillsReport,
  getFullReport
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All report routes require authentication
router.use(protect);

// Income/Expense report
router.get('/income-expense', getIncomeExpenseReport);

// Budget vs Actual report
router.get('/budget', getBudgetReport);

// Savings Goals report
router.get('/savings', getSavingsReport);

// Bills report
router.get('/bills', getBillsReport);

// Full financial report
router.get('/all', getFullReport);

module.exports = router;