const express = require('express');
const {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  skipBillPayment,
  getUpcomingBills,
  getBillStats
} = require('../controllers/bill.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get upcoming bills/reminders
router.route('/upcoming')
  .get(getUpcomingBills);

// Get bill statistics
router.route('/stats')
  .get(getBillStats);

// Get all bills and create a new one
router.route('/')
  .get(getBills)
  .post(createBill);

// Get, update, and delete a specific bill
router.route('/:id')
  .get(getBill)
  .put(updateBill)
  .delete(deleteBill);

// Mark bill as paid
router.route('/:id/pay')
  .put(markBillAsPaid);

// Skip bill payment
router.route('/:id/skip')
  .put(skipBillPayment);

module.exports = router;