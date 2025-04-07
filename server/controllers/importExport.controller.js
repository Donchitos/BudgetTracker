const importService = require('../services/importService');
const Transaction = require('../models/Transaction.model');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit to 10MB
  },
  fileFilter: function (req, file, cb) {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.csv') || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
}).single('file');

/**
 * @desc    Import transactions from CSV
 * @route   POST /api/import/transactions
 * @access  Private
 */
exports.importTransactions = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }
    
    try {
      // Read file from disk
      const fileData = fs.readFileSync(req.file.path);
      
      // Parse options from request body
      const options = {
        dateColumn: req.body.dateColumn || 'date',
        descriptionColumn: req.body.descriptionColumn || 'description',
        amountColumn: req.body.amountColumn || 'amount',
        typeColumn: req.body.typeColumn || 'type',
        categoryColumn: req.body.categoryColumn || 'category',
        notesColumn: req.body.notesColumn || 'notes',
        dateFormat: req.body.dateFormat || 'MM/DD/YYYY',
        defaultType: req.body.defaultType || 'expense'
      };
      
      // Import transactions
      const results = await importService.importTransactionsFromCSV(
        fileData, 
        options, 
        req.user
      );
      
      // Delete the temporary file
      fs.unlinkSync(req.file.path);
      
      res.status(200).json({
        success: true,
        data: {
          total: results.total,
          imported: results.imported,
          skipped: results.skipped,
          errors: results.errors,
          newCategories: results.newCategories.length,
          transactions: results.transactions.length
        }
      });
    } catch (error) {
      // Delete the temporary file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: `Error importing transactions: ${error.message}`
      });
    }
  });
};

/**
 * @desc    Export transactions to CSV
 * @route   GET /api/export/transactions
 * @access  Private
 */
exports.exportTransactions = async (req, res) => {
  try {
    // Build query with filtering options
    let query = { user: req.user.id };
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by min/max amount if provided
    if (req.query.minAmount || req.query.maxAmount) {
      query.amount = {};
      if (req.query.minAmount) {
        query.amount.$gte = parseFloat(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        query.amount.$lte = parseFloat(req.query.maxAmount);
      }
    }
    
    // Fetch transactions with pagination
    const limit = parseInt(req.query.limit) || 1000;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(query)
      .populate('category', 'name color')
      .sort({ date: req.query.sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(query);
    
    // Export options
    const options = {
      includeId: req.query.includeId === 'true'
    };
    
    // Generate CSV
    const csv = await importService.exportTransactionsToCSV(transactions, options);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error exporting transactions: ${error.message}`
    });
  }
};

/**
 * @desc    Get import CSV template
 * @route   GET /api/import/template
 * @access  Private
 */
exports.getImportTemplate = (req, res) => {
  // Create a sample CSV template
  const template = 'date,description,amount,type,category,notes\n' +
                   '2023-01-01,Sample Expense,50.00,expense,Groceries,Sample note\n' +
                   '2023-01-02,Sample Income,1000.00,income,Salary,Monthly salary';
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=import_template.csv');
  
  res.status(200).send(template);
};

/**
 * @desc    Validate CSV structure before import
 * @route   POST /api/import/validate
 * @access  Private
 */
exports.validateImportFile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }
    
    try {
      // Read file from disk
      const fileData = fs.readFileSync(req.file.path);
      
      // Parse the first row to get headers
      const headerLine = fileData.toString().split('\n')[0];
      const headers = headerLine.split(',').map(header => header.trim());
      
      // Delete the temporary file
      fs.unlinkSync(req.file.path);
      
      // Return the headers to the client for mapping
      res.status(200).json({
        success: true,
        data: {
          headers,
          rowCount: fileData.toString().split('\n').length - 1 // Exclude header row
        }
      });
    } catch (error) {
      // Delete the temporary file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: `Error validating file: ${error.message}`
      });
    }
  });
};

/**
 * @desc    Export settings as JSON
 * @route   GET /api/export/settings
 * @access  Private
 */
exports.exportSettings = async (req, res) => {
  try {
    // Define which models to include in the settings export
    const settingsToExport = {};
    
    // Include categories if requested
    if (req.query.includeCategories === 'true') {
      const Category = require('../models/Category.model');
      const categories = await Category.find({ user: req.user.id });
      settingsToExport.categories = categories;
    }
    
    // Include budget templates if requested
    if (req.query.includeBudgets === 'true') {
      const Budget = require('../models/Budget.model');
      const budgets = await Budget.find({ user: req.user.id });
      settingsToExport.budgets = budgets;
    }
    
    // Include savings goals if requested
    if (req.query.includeSavingsGoals === 'true') {
      const SavingsGoal = require('../models/SavingsGoal.model');
      const savingsGoals = await SavingsGoal.find({ user: req.user.id });
      settingsToExport.savingsGoals = savingsGoals;
    }
    
    // Include bills if requested
    if (req.query.includeBills === 'true') {
      const Bill = require('../models/Bill.model');
      const bills = await Bill.find({ user: req.user.id });
      settingsToExport.bills = bills;
    }
    
    // Generate filename
    const filename = `budget_settings_${new Date().toISOString().split('T')[0]}.json`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Send JSON data
    res.status(200).json({
      exportDate: new Date(),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      settings: settingsToExport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error exporting settings: ${error.message}`
    });
  }
};

/**
 * @desc    Import settings from JSON
 * @route   POST /api/import/settings
 * @access  Private
 */
exports.importSettings = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a JSON file'
      });
    }
    
    try {
      // Read file from disk
      const fileData = fs.readFileSync(req.file.path);
      
      // Parse JSON data
      const settingsData = JSON.parse(fileData);
      
      // Initialize results
      const results = {
        categories: { imported: 0, errors: [] },
        budgets: { imported: 0, errors: [] },
        savingsGoals: { imported: 0, errors: [] },
        bills: { imported: 0, errors: [] }
      };
      
      // Import categories if included
      if (settingsData.settings.categories) {
        const Category = require('../models/Category.model');
        
        for (const category of settingsData.settings.categories) {
          try {
            // Check if category already exists
            const existingCategory = await Category.findOne({
              user: req.user.id,
              name: category.name
            });
            
            if (existingCategory) {
              // Update existing category
              await Category.findByIdAndUpdate(existingCategory._id, {
                color: category.color,
                icon: category.icon,
                description: category.description
              });
            } else {
              // Create new category
              await Category.create({
                name: category.name,
                color: category.color,
                icon: category.icon,
                description: category.description,
                user: req.user.id
              });
            }
            
            results.categories.imported++;
          } catch (error) {
            results.categories.errors.push(`Error importing category ${category.name}: ${error.message}`);
          }
        }
      }
      
      // Import budgets if included
      if (settingsData.settings.budgets) {
        const Budget = require('../models/Budget.model');
        
        for (const budget of settingsData.settings.budgets) {
          try {
            // Get reference to category if it exists
            if (budget.category) {
              const Category = require('../models/Category.model');
              const category = await Category.findOne({
                user: req.user.id,
                name: budget.category.name
              });
              
              if (category) {
                budget.category = category._id;
              } else {
                delete budget.category;
              }
            }
            
            // Remove database-specific fields
            delete budget._id;
            delete budget.__v;
            
            // Set user ID to current user
            budget.user = req.user.id;
            
            // Create new budget
            await Budget.create(budget);
            results.budgets.imported++;
          } catch (error) {
            results.budgets.errors.push(`Error importing budget: ${error.message}`);
          }
        }
      }
      
      // Import savings goals if included
      if (settingsData.settings.savingsGoals) {
        const SavingsGoal = require('../models/SavingsGoal.model');
        
        for (const goal of settingsData.settings.savingsGoals) {
          try {
            // Get reference to category if it exists
            if (goal.category) {
              const Category = require('../models/Category.model');
              const category = await Category.findOne({
                user: req.user.id,
                name: typeof goal.category === 'object' ? goal.category.name : goal.category
              });
              
              if (category) {
                goal.category = category._id;
              } else {
                delete goal.category;
              }
            }
            
            // Remove database-specific fields
            delete goal._id;
            delete goal.__v;
            
            // Set user ID to current user
            goal.user = req.user.id;
            
            // Create new savings goal
            await SavingsGoal.create(goal);
            results.savingsGoals.imported++;
          } catch (error) {
            results.savingsGoals.errors.push(`Error importing savings goal: ${error.message}`);
          }
        }
      }
      
      // Import bills if included
      if (settingsData.settings.bills) {
        const Bill = require('../models/Bill.model');
        
        for (const bill of settingsData.settings.bills) {
          try {
            // Get reference to category if it exists
            if (bill.category) {
              const Category = require('../models/Category.model');
              const category = await Category.findOne({
                user: req.user.id,
                name: typeof bill.category === 'object' ? bill.category.name : bill.category
              });
              
              if (category) {
                bill.category = category._id;
              } else {
                delete bill.category;
              }
            }
            
            // Remove database-specific fields
            delete bill._id;
            delete bill.__v;
            
            // Set user ID to current user
            bill.user = req.user.id;
            
            // Create new bill
            await Bill.create(bill);
            results.bills.imported++;
          } catch (error) {
            results.bills.errors.push(`Error importing bill: ${error.message}`);
          }
        }
      }
      
      // Delete the temporary file
      fs.unlinkSync(req.file.path);
      
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      // Delete the temporary file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: `Error importing settings: ${error.message}`
      });
    }
  });
};