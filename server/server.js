const app = require('./app');
const connectDB = require('./config/db');

// Load environment variables
require('dotenv').config();

// Connect to database
if (process.env.USE_DEMO_MODE === 'true') {
  console.log('Note: Running in demo mode without database connection');
  console.log('API endpoints will return mock data for testing purposes');
} else {
  connectDB();
  console.log('Connecting to MongoDB database');
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});