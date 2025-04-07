const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All category routes require authentication
router.use(protect);

// Routes
router
  .route('/')
  .get(getCategories)
  .post(createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;