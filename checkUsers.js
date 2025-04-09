const mongoose = require('mongoose');
const User = require('./server/models/User.model');

// Load environment variables
require('dotenv').config({ path: './server/.env' });

async function checkUsers() {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`ID: ${user._id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();