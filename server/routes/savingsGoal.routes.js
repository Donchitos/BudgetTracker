const express = require('express');
const {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addContribution,
  getSavingsSummary
} = require('../controllers/savingsGoal.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All savings routes require authentication
router.use(protect);

// Get summary of all savings goals
router.get('/summary', getSavingsSummary);

// Basic CRUD routes
router
  .route('/')
  .get(getSavingsGoals)
  .post(createSavingsGoal);

router
  .route('/:id')
  .get(getSavingsGoal)
  .put(updateSavingsGoal)
  .delete(deleteSavingsGoal);

// Add contribution to a savings goal
router.post('/:id/contribute', addContribution);

module.exports = router;