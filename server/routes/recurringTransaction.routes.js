const express = require('express');
const {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  generateTransactions
} = require('../controllers/recurringTransaction.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all recurring transactions and create a new one
router.route('/')
  .get(getRecurringTransactions)
  .post(createRecurringTransaction);

// Get, update, and delete a specific recurring transaction
router.route('/:id')
  .get(getRecurringTransaction)
  .put(updateRecurringTransaction)
  .delete(deleteRecurringTransaction);

// Toggle active status
router.route('/:id/toggle')
  .put(toggleRecurringTransaction);

// Generate transactions from recurring transactions
router.route('/generate')
  .post(generateTransactions);

module.exports = router;