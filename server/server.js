const app = require('./app');
const { connectDB, closeDB } = require('./config/db');

// Load environment variables
require('dotenv').config();
// Set a flag to use the MongoDB Memory Server for testing
process.env.USE_MEMORY_DB = 'true';

// Connect to database (will use MongoDB Memory Server if connection fails)
connectDB().then(connected => {
  if (connected) {
    console.log('Database connection established');
  }
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close database connection and server before exiting
  closeDB().then(() => {
    server.close(() => process.exit(1));
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  closeDB().then(() => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
});