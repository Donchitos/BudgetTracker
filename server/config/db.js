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
    
    // Start an in-memory MongoDB server if MONGO_URI not provided or running local tests
    if (!process.env.MONGO_URI || process.env.NODE_ENV === 'test' || process.env.USE_MEMORY_DB === 'true') {
      console.log('Starting MongoDB Memory Server for testing...');
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