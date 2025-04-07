const express = require('express');
const {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addContribution,
  changeGoalStatus,
  getSavingsStats
} = require('../controllers/savingsGoal.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get statistics
router.route('/stats').get(getSavingsStats);

// Get all savings goals and create a new one
router.route('/')
  .get(getSavingsGoals)
  .post(createSavingsGoal);

// Get, update, and delete a specific savings goal
router.route('/:id')
  .get(getSavingsGoal)
  .put(updateSavingsGoal)
  .delete(deleteSavingsGoal);

// Add a contribution to a savings goal
router.route('/:id/contributions')
  .post(addContribution);

// Change the status of a savings goal
router.route('/:id/status')
  .put(changeGoalStatus);

module.exports = router;