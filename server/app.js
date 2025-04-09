const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Define routes
app.get('/api', (req, res) => {
  res.json({ message: 'Budget Tracker API is running in demo mode' });
});

// Demo route to simulate authentication
app.post('/api/auth/login', (req, res) => {
  // For demo mode, accept any credentials
  console.log('Login attempt with:', req.body.email);
  
  res.json({
    success: true,
    token: 'demo-token-12345',
    user: {
      _id: '1234567890',
      name: 'Demo User',
      email: req.body.email || 'demo@example.com'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  // For demo mode, accept any registration
  console.log('Registration attempt with:', req.body.email);
  
  res.json({
    success: true,
    token: 'demo-token-12345',
    user: {
      _id: '1234567890',
      name: req.body.name || 'Demo User',
      email: req.body.email || 'demo@example.com'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      _id: '1234567890',
      name: 'Demo User',
      email: 'demo@example.com'
    }
  });
});

// Demo route to simulate categories
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    count: 5,
    data: [
      { _id: 'cat1', name: 'Food', color: '#FF5733', icon: 'FastfoodIcon', budget: 500 },
      { _id: 'cat2', name: 'Transportation', color: '#337DFF', icon: 'DirectionsCarIcon', budget: 300 },
      { _id: 'cat3', name: 'Housing', color: '#33FF57', icon: 'HomeIcon', budget: 1000 },
      { _id: 'cat4', name: 'Entertainment', color: '#F033FF', icon: 'MovieIcon', budget: 200 },
      { _id: 'cat5', name: 'Utilities', color: '#FFFF33', icon: 'BoltIcon', budget: 250 }
    ]
  });
});

// Demo route to simulate transactions
app.get('/api/transactions', (req, res) => {
  res.json({
    success: true,
    count: 5,
    pagination: { total: 5, page: 1, limit: 10, pages: 1 },
    data: [
      { _id: 'trans1', description: 'Grocery shopping', amount: 85.25, type: 'expense', date: '2023-04-05T00:00:00.000Z', category: { _id: 'cat1', name: 'Food', color: '#FF5733' } },
      { _id: 'trans2', description: 'Monthly salary', amount: 3000, type: 'income', date: '2023-04-01T00:00:00.000Z' },
      { _id: 'trans3', description: 'Gas bill', amount: 45.60, type: 'expense', date: '2023-04-03T00:00:00.000Z', category: { _id: 'cat5', name: 'Utilities', color: '#FFFF33' } },
      { _id: 'trans4', description: 'Movie tickets', amount: 24.99, type: 'expense', date: '2023-04-07T00:00:00.000Z', category: { _id: 'cat4', name: 'Entertainment', color: '#F033FF' } },
      { _id: 'trans5', description: 'Bus pass', amount: 60, type: 'expense', date: '2023-04-02T00:00:00.000Z', category: { _id: 'cat2', name: 'Transportation', color: '#337DFF' } }
    ]
  });
});

// Demo route to simulate dashboard summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      income: 3000,
      expenses: 215.84,
      balance: 2784.16,
      period: {
        startDate: '2023-04-01T00:00:00.000Z',
        endDate: '2023-04-30T23:59:59.999Z'
      },
      recentTransactions: [
        { _id: 'trans1', description: 'Grocery shopping', amount: 85.25, type: 'expense', date: '2023-04-05T00:00:00.000Z', category: { _id: 'cat1', name: 'Food', color: '#FF5733' } },
        { _id: 'trans2', description: 'Monthly salary', amount: 3000, type: 'income', date: '2023-04-01T00:00:00.000Z' },
        { _id: 'trans3', description: 'Gas bill', amount: 45.60, type: 'expense', date: '2023-04-03T00:00:00.000Z', category: { _id: 'cat5', name: 'Utilities', color: '#FFFF33' } },
        { _id: 'trans4', description: 'Movie tickets', amount: 24.99, type: 'expense', date: '2023-04-07T00:00:00.000Z', category: { _id: 'cat4', name: 'Entertainment', color: '#F033FF' } },
        { _id: 'trans5', description: 'Bus pass', amount: 60, type: 'expense', date: '2023-04-02T00:00:00.000Z', category: { _id: 'cat2', name: 'Transportation', color: '#337DFF' } }
      ]
    }
  });
});

// Demo route to simulate expense breakdown
app.get('/api/dashboard/expense-breakdown', (req, res) => {
  res.json({
    success: true,
    data: {
      totalExpenses: 215.84,
      categories: [
        { categoryId: 'cat1', name: 'Food', color: '#FF5733', amount: 85.25, percentage: 39.5 },
        { categoryId: 'cat2', name: 'Transportation', color: '#337DFF', amount: 60, percentage: 27.8 },
        { categoryId: 'cat5', name: 'Utilities', color: '#FFFF33', amount: 45.60, percentage: 21.1 },
        { categoryId: 'cat4', name: 'Entertainment', color: '#F033FF', amount: 24.99, percentage: 11.6 }
      ],
      period: {
        startDate: '2023-04-01T00:00:00.000Z',
        endDate: '2023-04-30T23:59:59.999Z'
      }
    }
  });
});

// Routes - COMMENTED OUT THE DIRECT AUTH ROUTES TO PREVENT CONFLICTS WITH DEMO ROUTES
// app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/bills', require('./routes/bill.routes'));
app.use('/api/savings', require('./routes/savingsGoal.routes'));
app.use('/api/budget-templates', require('./routes/budgetTemplate.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/recurring-transactions', require('./routes/recurringTransaction.routes'));
app.use('/api/import', require('./routes/importExport.routes'));
app.use('/api/export', require('./routes/importExport.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/forecast', require('./routes/forecast.routes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;