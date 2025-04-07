const Transaction = require('../models/Transaction.model');
const Category = require('../models/Category.model');
const csv = require('csv-parser');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const { parseISO, isValid } = require('date-fns');

/**
 * Import transactions from CSV data
 * @param {Buffer|String} fileData - The CSV file data
 * @param {Object} options - Import options
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Import results
 */
exports.importTransactionsFromCSV = async (fileData, options, user) => {
  const results = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: [],
    newCategories: [],
    transactions: []
  };
  
  // Map column headers from options
  const columnMap = {
    date: options.dateColumn || 'date',
    description: options.descriptionColumn || 'description',
    amount: options.amountColumn || 'amount',
    type: options.typeColumn || 'type',
    category: options.categoryColumn || 'category',
    notes: options.notesColumn || 'notes'
  };
  
  // Create a mapping of category names to IDs to handle category references
  const categoryMap = new Map();
  const existingCategories = await Category.find({ user: user._id });
  existingCategories.forEach(category => {
    categoryMap.set(category.name.toLowerCase(), category._id);
  });
  
  // New categories that need to be created
  const newCategoryNames = new Set();
  
  // Parse CSV data
  const transactions = [];
  let stream;
  
  if (typeof fileData === 'string') {
    stream = Readable.from([fileData]);
  } else {
    stream = Readable.from([fileData.toString()]);
  }
  
  await new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (row) => {
        results.total++;
        
        try {
          // Extract data using the column mapping
          const date = row[columnMap.date];
          const description = row[columnMap.description] || '';
          const amountStr = row[columnMap.amount] || '0';
          const type = row[columnMap.type] || 'expense';
          const categoryName = row[columnMap.category] || '';
          const notes = row[columnMap.notes] || '';
          
          // Validate date
          let parsedDate;
          if (date) {
            // Try different date formats
            parsedDate = parseISO(date);
            if (!isValid(parsedDate)) {
              // Try MM/DD/YYYY format
              const dateParts = date.split(/[/\\-]/);
              if (dateParts.length === 3) {
                // Check if month/day/year or day/month/year based on options
                if (options.dateFormat === 'DD/MM/YYYY') {
                  parsedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                } else {
                  parsedDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
                }
              }
            }
          }
          
          if (!parsedDate || !isValid(parsedDate)) {
            parsedDate = new Date(); // Default to today
          }
          
          // Parse amount
          let amount = 0;
          let parsedType = type.toLowerCase();
          
          try {
            // Remove currency symbols and commas, then parse as float
            const cleanedAmount = amountStr.replace(/[$,€£¥]/g, '').trim();
            
            // Handle negative amounts for expenses
            if (cleanedAmount.startsWith('-') || cleanedAmount.startsWith('(')) {
              amount = Math.abs(parseFloat(cleanedAmount.replace(/[()]/g, '')));
              parsedType = 'expense';
            } else {
              amount = parseFloat(cleanedAmount);
              // If amount type not specified, use the sign to determine
              if (parsedType !== 'income' && parsedType !== 'expense') {
                parsedType = options.defaultType || 'expense';
              }
            }
          } catch (err) {
            amount = 0;
          }
          
          // Skip if amount is invalid
          if (isNaN(amount) || amount <= 0) {
            results.skipped++;
            results.errors.push(`Row ${results.total}: Invalid amount "${amountStr}"`);
            return;
          }
          
          // Handle category
          let categoryId = null;
          if (categoryName) {
            const lowerCaseName = categoryName.toLowerCase();
            
            // Check if category exists in our map
            if (categoryMap.has(lowerCaseName)) {
              categoryId = categoryMap.get(lowerCaseName);
            } else {
              // Mark for creation
              newCategoryNames.add(categoryName);
            }
          }
          
          // Create transaction object
          transactions.push({
            date: parsedDate,
            description,
            amount,
            type: parsedType,
            category: categoryId,
            notes,
            _categoryName: categoryName, // Temporary field to hold category name
            user: user._id
          });
          
          results.imported++;
        } catch (err) {
          results.skipped++;
          results.errors.push(`Row ${results.total}: ${err.message}`);
        }
      })
      .on('error', reject)
      .on('end', resolve);
  });
  
  // Create new categories if needed
  if (newCategoryNames.size > 0) {
    const categoryDocs = Array.from(newCategoryNames).map(name => ({
      name,
      user: user._id,
      color: getRandomColor()
    }));
    
    const createdCategories = await Category.insertMany(categoryDocs);
    
    // Update our category map with the new IDs
    createdCategories.forEach(category => {
      categoryMap.set(category.name.toLowerCase(), category._id);
      results.newCategories.push(category);
    });
  }
  
  // Update transactions with category IDs
  transactions.forEach(transaction => {
    if (transaction._categoryName && !transaction.category) {
      const lowerCaseName = transaction._categoryName.toLowerCase();
      transaction.category = categoryMap.get(lowerCaseName) || null;
    }
    delete transaction._categoryName;
  });
  
  // Insert transactions in chunks to avoid hitting MongoDB limits
  if (transactions.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < transactions.length; i += chunkSize) {
      const chunk = transactions.slice(i, i + chunkSize);
      const createdTransactions = await Transaction.insertMany(chunk);
      results.transactions.push(...createdTransactions);
    }
  }
  
  return results;
};

/**
 * Generate a random color for new categories
 * @returns {String} - Hex color code
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Export transactions to CSV format
 * @param {Array} transactions - The transactions to export
 * @param {Object} options - Export options
 * @returns {String} - CSV string
 */
exports.exportTransactionsToCSV = async (transactions, options) => {
  // Default headers
  const headers = [
    'Date',
    'Description',
    'Amount',
    'Type',
    'Category',
    'Notes'
  ];
  
  // Include additional fields if specified
  if (options?.includeId) {
    headers.unshift('ID');
  }
  
  // Start with headers row
  let csv = headers.join(',') + '\n';
  
  // Add transaction data
  for (const transaction of transactions) {
    const row = [];
    
    // Add ID if requested
    if (options?.includeId) {
      row.push(transaction._id);
    }
    
    // Format date as YYYY-MM-DD
    const date = transaction.date ? 
      new Date(transaction.date).toISOString().split('T')[0] : 
      '';
    
    // Get category name if available
    let categoryName = '';
    if (transaction.category) {
      if (typeof transaction.category === 'object' && transaction.category.name) {
        categoryName = transaction.category.name;
      } else {
        // Fetch category if not populated
        try {
          const category = await Category.findById(transaction.category);
          categoryName = category ? category.name : '';
        } catch (err) {
          categoryName = '';
        }
      }
    }
    
    // Format values and escape any commas
    row.push(
      date,
      escapeCsvValue(transaction.description || ''),
      transaction.amount || 0,
      transaction.type || 'expense',
      escapeCsvValue(categoryName),
      escapeCsvValue(transaction.notes || '')
    );
    
    csv += row.join(',') + '\n';
  }
  
  return csv;
};

/**
 * Escape a value for CSV output
 * @param {String} value - The value to escape
 * @returns {String} - Escaped value
 */
function escapeCsvValue(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}