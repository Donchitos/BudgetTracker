const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

// Statistics route
router.get('/stats', getTransactionStats);

// Main routes
router
  .route('/')
  .get(getTransactions)
  .post(createTransaction);

router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;