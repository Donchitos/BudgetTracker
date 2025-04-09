const mongoose = require('mongoose');
const User = require('./server/models/User.model');

// Load environment variables
require('dotenv').config({ path: './server/.env' });

async function resetUserPassword() {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find the user with email user@example.com
    const user = await User.findOne({ email: 'user@example.com' });
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    console.log(`Found user: ${user.name}, ID: ${user._id}`);
    
    // Set the new password
    user.password = 'password123';
    
    // Save the user - this will trigger the password hashing middleware
    await user.save();
    
    console.log('Password has been reset to "password123"');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

resetUserPassword();