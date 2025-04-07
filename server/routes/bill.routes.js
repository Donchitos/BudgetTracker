const express = require('express');
const {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getUpcomingBills,
  getOverdueBills
} = require('../controllers/bill.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All bill routes require authentication
router.use(protect);

// Specialized routes
router.get('/upcoming', getUpcomingBills);
router.get('/overdue', getOverdueBills);

// Basic CRUD routes
router
  .route('/')
  .get(getBills)
  .post(createBill);

router
  .route('/:id')
  .get(getBill)
  .put(updateBill)
  .delete(deleteBill);

// Mark bill as paid
router.put('/:id/pay', markBillAsPaid);

module.exports = router;