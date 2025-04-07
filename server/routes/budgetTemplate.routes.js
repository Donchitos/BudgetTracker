const express = require('express');
const {
  getBudgetTemplates,
  getBudgetTemplate,
  createBudgetTemplate,
  updateBudgetTemplate,
  deleteBudgetTemplate,
  getDefaultTemplate,
  applyBudgetTemplate
} = require('../controllers/budgetTemplate.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get default template
router.get('/default', getDefaultTemplate);

// Base CRUD routes
router
  .route('/')
  .get(getBudgetTemplates)
  .post(createBudgetTemplate);

router
  .route('/:id')
  .get(getBudgetTemplate)
  .put(updateBudgetTemplate)
  .delete(deleteBudgetTemplate);

// Apply budget template to categories
router.post('/:id/apply', applyBudgetTemplate);

module.exports = router;