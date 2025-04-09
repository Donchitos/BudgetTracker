const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const connectDB = async () => {
  try {
    // Log the MongoDB URI to check if it's being loaded correctly
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables. Please check your .env file.');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;