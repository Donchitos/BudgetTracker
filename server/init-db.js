/**
 * MongoDB Database Initialization Script
 * 
 * This script initializes a new MongoDB database for the Budget Tracker application.
 * It creates the required collections and adds some sample data.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Load environment variables - specify the path to .env file
require('dotenv').config({ path: './server/.env' });

console.log("MongoDB URI:", process.env.MONGO_URI);

// Models
const User = require('./models/User.model');
const Category = require('./models/Category.model');
const Transaction = require('./models/Transaction.model');
const BudgetTemplate = require('./models/BudgetTemplate.model');
const Bill = require('./models/Bill.model');
const SavingsGoal = require('./models/SavingsGoal.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Initialize database with sample data
const initializeDB = async () => {
  try {
    // Check if database is already initialized
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database appears to be already initialized.');
      console.log('If you want to reset the database, drop all collections first.');
      process.exit(0);
    }

    console.log('Starting database initialization...');

    // Create a sample user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name: 'Example User',
      email: 'user@example.com',
      password: hashedPassword,
      settings: {
        currency: 'USD',
        theme: 'light',
        language: 'en',
        budgetStartDay: 1,
      }
    });

    console.log('Created sample user:');
    console.log('  Email: user@example.com');
    console.log('  Password: password123');

    // Create default categories
    const categories = await Category.insertMany([
      { name: 'Food', color: '#FF5733', icon: 'FastfoodIcon', user: user._id },
      { name: 'Transportation', color: '#337DFF', icon: 'DirectionsCarIcon', user: user._id },
      { name: 'Housing', color: '#33FF57', icon: 'HomeIcon', user: user._id },
      { name: 'Entertainment', color: '#F033FF', icon: 'MovieIcon', user: user._id },
      { name: 'Utilities', color: '#FFFF33', icon: 'BoltIcon', user: user._id },
    ]);
    console.log(`Created ${categories.length} default categories`);

    // Create a budget template
    // Calculate total budget amount
    const categoriesData = [
      { category: categories[0]._id, amount: 500 },
      { category: categories[1]._id, amount: 300 },
      { category: categories[2]._id, amount: 1000 },
      { category: categories[3]._id, amount: 200 },
      { category: categories[4]._id, amount: 250 },
    ];
    
    const totalBudgetAmount = categoriesData.reduce((sum, cat) => sum + cat.amount, 0);
    
    const budgetTemplate = await BudgetTemplate.create({
      name: 'Default Budget',
      user: user._id,
      totalBudget: totalBudgetAmount,
      categories: categoriesData
    });
    console.log('Created default budget template');

    // Create some sample transactions
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const transactions = await Transaction.insertMany([
      {
        description: 'Grocery shopping',
        amount: 85.25,
        type: 'expense',
        date: currentMonth,
        category: categories[0]._id,
        user: user._id,
      },
      {
        description: 'Monthly salary',
        amount: 3000,
        type: 'income',
        date: currentMonth,
        user: user._id,
      },
      {
        description: 'Gas bill',
        amount: 45.60,
        type: 'expense',
        date: currentMonth,
        category: categories[4]._id,
        user: user._id,
      },
      {
        description: 'Movie tickets',
        amount: 24.99,
        type: 'expense',
        date: currentMonth,
        category: categories[3]._id,
        user: user._id,
      },
      {
        description: 'Bus pass',
        amount: 60,
        type: 'expense',
        date: currentMonth,
        category: categories[1]._id,
        user: user._id,
      },
      {
        description: 'Previous salary',
        amount: 3000,
        type: 'income',
        date: lastMonth,
        user: user._id,
      },
    ]);
    console.log(`Created ${transactions.length} sample transactions`);

    // Create sample bills
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const bills = await Bill.insertMany([
      {
        name: 'Rent',
        amount: 800,
        dueDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5),
        recurring: true,
        frequency: 'monthly',
        category: categories[2]._id,
        user: user._id,
      },
      {
        name: 'Internet',
        amount: 60,
        dueDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
        recurring: true,
        frequency: 'monthly',
        category: categories[4]._id,
        user: user._id,
      },
    ]);
    console.log(`Created ${bills.length} sample bills`);

    // Create a savings goal
    const savingsGoal = await SavingsGoal.create({
      name: 'Vacation Fund',
      targetAmount: 1500,
      currentAmount: 500,
      targetDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 6, 1),
      user: user._id,
    });
    console.log('Created sample savings goal');

    console.log('\nDatabase initialization completed successfully!');
    console.log('\nYou can now log in to the application with:');
    console.log('  Email: user@example.com');
    console.log('  Password: password123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the database connection
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the initialization
connectDB().then(connected => {
  if (connected) {
    initializeDB();
  } else {
    console.error('Failed to connect to the database. Check your MongoDB connection and try again.');
    process.exit(1);
  }
});