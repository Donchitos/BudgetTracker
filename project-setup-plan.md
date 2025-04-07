# Budget Tracker Project Structure Setup

## Directory Structure

```
budget-tracker/
├── client/                     # Frontend React application
│   ├── public/                 # Static files
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── assets/             # Images, icons, etc.
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Common UI components
│   │   │   ├── layout/         # Layout components
│   │   │   └── forms/          # Form components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Main application pages
│   │   │   ├── auth/           # Authentication pages
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── transactions/   # Transaction pages
│   │   │   └── categories/     # Category pages
│   │   ├── redux/              # Redux state management
│   │   │   ├── actions/        # Redux actions
│   │   │   ├── reducers/       # Redux reducers
│   │   │   ├── types/          # Redux action types
│   │   │   └── store.js        # Redux store configuration
│   │   ├── services/           # API client services
│   │   ├── utils/              # Helper functions
│   │   ├── App.js              # Main component
│   │   ├── index.js            # Entry point
│   │   └── routes.js           # Application routes
│   ├── .env.example            # Example environment variables
│   ├── package.json            # Frontend dependencies
│   └── README.md               # Frontend documentation
│
├── server/                     # Backend Node.js application
│   ├── config/                 # Configuration files
│   │   ├── db.js               # Database configuration
│   │   └── config.js           # General configuration
│   ├── controllers/            # Route controllers
│   │   ├── auth.controller.js  # Authentication controller
│   │   ├── transaction.controller.js # Transaction controller
│   │   ├── category.controller.js # Category controller
│   │   └── dashboard.controller.js # Dashboard controller
│   ├── middleware/             # Express middleware
│   │   ├── auth.middleware.js  # Authentication middleware
│   │   ├── error.middleware.js # Error handling middleware
│   │   └── validate.middleware.js # Validation middleware
│   ├── models/                 # Mongoose models
│   │   ├── User.model.js       # User model
│   │   ├── Transaction.model.js # Transaction model
│   │   └── Category.model.js   # Category model
│   ├── routes/                 # API routes
│   │   ├── auth.routes.js      # Authentication routes
│   │   ├── transaction.routes.js # Transaction routes
│   │   ├── category.routes.js  # Category routes
│   │   └── dashboard.routes.js # Dashboard routes
│   ├── utils/                  # Helper functions
│   │   ├── validator.js        # Validation utilities
│   │   └── logger.js           # Logging utilities
│   ├── app.js                  # Express app setup
│   ├── server.js               # Entry point
│   ├── .env.example            # Example environment variables
│   ├── package.json            # Backend dependencies
│   └── README.md               # Backend documentation
│
├── .gitignore                  # Git ignore file
├── package.json                # Root package.json
└── README.md                   # Project documentation
```

## Initial Configuration Files

### Root package.json
```json
{
  "name": "budget-tracker",
  "version": "1.0.0",
  "description": "A comprehensive full-stack application for personal and household financial management",
  "main": "index.js",
  "scripts": {
    "start": "node server/server.js",
    "server": "nodemon server/server.js",
    "client": "npm start --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "install-all": "npm install && npm install --prefix client && npm install --prefix server",
    "build": "npm run build --prefix client"
  },
  "keywords": [
    "budget",
    "finance",
    "expense",
    "tracking"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^7.0.0",
    "nodemon": "^2.0.15"
  }
}
```

### Client package.json
```json
{
  "name": "budget-tracker-client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.8.1",
    "@emotion/styled": "^11.8.1",
    "@mui/icons-material": "^5.4.4",
    "@mui/material": "^5.4.4",
    "@testing-library/jest-dom": "^5.16.2",
    "@testing-library/react": "^12.1.3",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^0.26.0",
    "date-fns": "^2.28.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-redux": "^7.2.6",
    "react-router-dom": "^6.2.2",
    "react-scripts": "5.0.0",
    "recharts": "^2.1.9",
    "redux": "^4.1.2",
    "redux-devtools-extension": "^2.13.9",
    "redux-thunk": "^2.4.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:5000"
}
```

### Server package.json
```json
{
  "name": "budget-tracker-server",
  "version": "1.0.0",
  "description": "Backend for Budget Tracker application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "api",
    "backend",
    "express",
    "mongodb"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.17.3",
    "express-validator": "^6.14.0",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.2.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
```

### Server .env.example
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/budget-tracker
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

### Client .env.example
```
REACT_APP_API_URL=http://localhost:5000/api
```

### .gitignore
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/client/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store

# MongoDB
/data/db
```

## Initial Server Files

### app.js
```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/error.middleware');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Error handler middleware
app.use(errorHandler);

module.exports = app;
```

### server.js
```javascript
const app = require('./app');
const connectDB = require('./config/db');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

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
```

### config/db.js
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### middleware/error.middleware.js
```javascript
/**
 * Error response middleware for 404 not found.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Generic error handler for all errors in the app
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Error response
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = { notFound, errorHandler };
```

## Implementation Steps

1. Create the project root directory
2. Initialize Git repository
3. Create .gitignore file
4. Create root package.json
5. Set up server directory structure
6. Create basic server configuration files
7. Set up client directory with React
8. Configure proxy in client package.json
9. Create README.md files
10. Set up environment variables

Once the basic structure is in place, we'll proceed with implementing the core functionality according to our development phases.