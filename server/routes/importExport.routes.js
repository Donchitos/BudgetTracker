const express = require('express');
const {
  importTransactions,
  exportTransactions,
  getImportTemplate,
  validateImportFile,
  exportSettings,
  importSettings
} = require('../controllers/importExport.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Import routes
router.route('/import/transactions')
  .post(importTransactions);

router.route('/import/validate')
  .post(validateImportFile);

router.route('/import/template')
  .get(getImportTemplate);

router.route('/import/settings')
  .post(importSettings);

// Export routes
router.route('/export/transactions')
  .get(exportTransactions);

router.route('/export/settings')
  .get(exportSettings);

module.exports = router;