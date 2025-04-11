const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config({ path: './server/.env' });

let mongoServer;

const connectDB = async () => {
  try {
    // Log configuration settings
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Check if we're running in demo mode
    if (process.env.USE_DEMO_MODE === 'true') {
      console.log('Using demo authentication (mock data)');
      console.log('Note: Running in demo mode without database connection');
      console.log('API endpoints will return mock data for testing purposes');
      return false; // Skip connecting to DB in demo mode
    }
    
    console.log('Using real authentication with MongoDB');
    
    // Try to connect to a real MongoDB instance first, if we want persistence
    if (process.env.PERSIST_DATA === 'true' && process.env.NODE_ENV !== 'test') {
      try {
        // Use provided MONGO_URI or default to a local MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/budget-tracker';
        console.log('Attempting to connect to persistent MongoDB database:', mongoUri);
        
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        console.log('User data will persist between sessions!');
        return true;
      } catch (error) {
        console.error('Failed to connect to persistent MongoDB:', error.message);
        console.log('Falling back to in-memory database (data will NOT persist)');
      }
    }
    
    // Fall back to in-memory database if persistence not possible or not requested
    if (!process.env.MONGO_URI || process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
      console.log('Starting MongoDB Memory Server (data will NOT persist between sessions)...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`MongoDB Memory Server URI: ${mongoUri}`);
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('Connected to MongoDB Memory Server');
      return true;
    }
    
    // Connect to a real MongoDB database
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
    console.log('Connecting to MongoDB database');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Falling back to MongoDB Memory Server');
    
    try {
      // If connection to real DB fails, try using memory server
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`MongoDB Memory Server URI: ${mongoUri}`);
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('Connected to MongoDB Memory Server');
      
      // Import necessary models for creating default categories
      const User = require('../models/User.model');
      const Category = require('../models/Category.model');
      
      // Add event listener for new user creation to add basic categories only if not skipped
      if (process.env.SKIP_SAMPLE_DATA !== 'true') {
        User.schema.post('save', async function(doc) {
          try {
            // Only run this if the document is newly created (not updated)
            if (doc.isNew) {
              console.log(`Setting up basic categories for new user: ${doc.email}`);
              
              // Create Australian-focused categories for the user
              await Category.insertMany([
                { name: 'Groceries', color: '#FF5733', icon: 'FastfoodIcon', user: doc._id },
                { name: 'Transport', color: '#337DFF', icon: 'DirectionsCarIcon', user: doc._id },
                { name: 'Housing', color: '#33FF57', icon: 'HomeIcon', user: doc._id },
                { name: 'Entertainment', color: '#F033FF', icon: 'MovieIcon', user: doc._id },
                { name: 'Utilities', color: '#FFFF33', icon: 'BoltIcon', user: doc._id },
                { name: 'Medicare', color: '#71C9CE', icon: 'LocalHospitalIcon', user: doc._id },
                { name: 'Council Rates', color: '#A2D5F2', icon: 'AccountBalanceIcon', user: doc._id },
                { name: 'Internet/NBN', color: '#07689F', icon: 'WifiIcon', user: doc._id },
                { name: 'Superannuation', color: '#40A798', icon: 'AccountBalanceWalletIcon', user: doc._id },
                { name: 'GST', color: '#6886C5', icon: 'ReceiptIcon', user: doc._id },
              ]);
            }
          } catch (error) {
            console.error('Error creating default categories for new user:', error);
          }
        });
      } else {
        console.log('Sample data generation for new users is disabled');
      }
      
      return true;
    } catch (fallbackError) {
      console.error(`Error connecting to MongoDB Memory Server: ${fallbackError.message}`);
      return false;
    }
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = { connectDB, closeDB };