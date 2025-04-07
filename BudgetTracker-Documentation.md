# BudgetTracker: Comprehensive Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Current Status and Features](#current-status-and-features)
3. [Getting Started](#getting-started)
   - [System Requirements](#system-requirements)
   - [Installation](#installation)
   - [Running the Application Locally](#running-the-application-locally)
4. [User Guide](#user-guide)
   - [Registration and Login](#registration-and-login)
   - [Dashboard](#dashboard)
   - [Managing Transactions](#managing-transactions)
   - [Budgeting Features](#budgeting-features)
   - [Recurring Transactions](#recurring-transactions)
   - [Advanced Transaction Management](#advanced-transaction-management)
5. [Administration Guide](#administration-guide)
   - [MongoDB Database](#mongodb-database)
   - [User Management](#user-management)
6. [Deployment Guide](#deployment-guide)
   - [Backend Deployment](#backend-deployment)
   - [Frontend Deployment](#frontend-deployment)
   - [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)
8. [What's Missing/Future Enhancements](#whats-missingfuture-enhancements)
9. [Technical Architecture](#technical-architecture)

---

## Introduction

BudgetTracker is a comprehensive personal finance management application designed to help individuals and households track income, expenses, savings, and financial goals. The application provides visualization tools, budgeting features, and detailed transaction management to give users a complete view of their financial situation.

This document serves as a comprehensive guide for using, installing, and deploying the BudgetTracker application.

## Current Status and Features

The application currently has the following features implemented:

### Priority 1: Budget Management and Visualization ✅
- Budget vs. Actual visualization charts
- Monthly budget cycle tracking with rollover
- Budget adjustment tools
- Category budget alerts

### Priority 2: Recurring Transactions ✅
- Recurring transaction management
- Multiple frequency options
- Transaction preview
- Status toggling

### Priority 3: Advanced Transaction Management ✅
- Bulk edit functionality
- Custom fields framework
- Transaction filtering and searching

### Partially Implemented Features
- Financial Reports - basic components exist but not fully integrated
- Savings Goals - core components created but limited functionality

### Core Functionalities
- User authentication
- Transaction tracking
- Category management
- Dashboard visualizations
- Mobile responsive design

## Getting Started

### System Requirements

To run the BudgetTracker application locally, you need:

- **Node.js** (version 14.x or higher)
- **npm** (6.x or higher) or **yarn**
- **MongoDB** (4.x or higher, local installation or MongoDB Atlas)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning the repository)

### Installation

Follow these steps to install BudgetTracker on your local machine:

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/BudgetTracker.git
cd BudgetTracker
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install client dependencies**

```bash
cd client
npm install
cd ..
```

4. **Install server dependencies**

```bash
cd server
npm install
cd ..
```

5. **Configure environment variables**

Create a `.env` file in the server directory:

```
# Server configuration
PORT=5000
NODE_ENV=development

# MongoDB configuration
MONGO_URI=mongodb://localhost:27017/budget-tracker
# OR use MongoDB Atlas URI
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/budget-tracker

# JWT configuration
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d
```

Also, create a `.env` file in the client directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application Locally

1. **Start the MongoDB server** (if using local MongoDB)

```bash
# This depends on your MongoDB installation
# For example:
mongod --dbpath=/data/db
```

2. **Start the backend server**

```bash
# From the root directory
cd server
npm run dev
```

This will start the Express server at http://localhost:5000.

3. **Start the frontend application**

```bash
# From the root directory
cd client
npm start
```

This will start the React application at http://localhost:3000.

4. **Access the application**

Open your browser and navigate to http://localhost:3000

## User Guide

### Registration and Login

1. **Registration**:
   - Navigate to the registration page
   - Fill in your email, name, and password
   - Click "Register" to create your account

2. **Login**:
   - Enter your email and password
   - Click "Login" to access your account
   - The app will remember your login for future visits

### Dashboard

The dashboard provides a comprehensive overview of your financial situation:

1. **Summary Cards**:
   - Total Income: Shows your total income for the selected period
   - Total Expenses: Shows your total expenses for the selected period
   - Balance: Displays the difference between income and expenses

2. **Charts and Visualizations**:
   - Expense Pie Chart: Shows spending by category
   - Budget vs. Actual: Compares budgeted amounts with actual spending
   - Spending Trends: Shows spending patterns over time

3. **Recent Transactions**:
   - Displays your most recent transactions
   - Click on any transaction to view details or edit

### Managing Transactions

1. **Adding a Transaction**:
   - Click "Add Transaction" button on the Transactions page
   - Fill in transaction details:
     - Amount
     - Date
     - Description
     - Category
     - Type (Income/Expense)
     - Tags (optional)
   - Click "Save Transaction"

2. **Viewing Transactions**:
   - Navigate to the Transactions page
   - View a list of all transactions
   - Use filters to narrow down by:
     - Date range
     - Category
     - Transaction type
     - Amount range
     - Search text

3. **Editing Transactions**:
   - Click on a transaction in the list
   - Modify details in the form
   - Click "Update Transaction" to save changes

4. **Deleting Transactions**:
   - Click on a transaction in the list
   - Click the "Delete" button
   - Confirm deletion in the prompt

5. **Bulk Editing Transactions**:
   - Select multiple transactions using checkboxes
   - Click "Bulk Actions" button
   - Choose "Edit" to modify multiple transactions
   - Select which fields to update
   - Enter new values for selected fields
   - Click "Update Transactions" to apply changes

### Budgeting Features

1. **Setting Up Budgets**:
   - Navigate to Budget Management page
   - Set budget amounts for each category
   - Specify the budget period (monthly is default)

2. **Budget Adjustment Tool**:
   - Drag sliders to adjust budget allocation between categories
   - See how changes affect your overall budget

3. **Budget vs. Actual Comparison**:
   - View bar charts comparing budgeted amounts with actual spending
   - Identify categories where you're over or under budget

4. **Budget Alerts**:
   - The system highlights categories where spending exceeds the budget
   - Receive visual indicators for approaching budget limits

### Recurring Transactions

1. **Creating Recurring Transactions**:
   - Navigate to Recurring Transactions page
   - Click "Add Recurring Transaction"
   - Fill in transaction details
   - Set frequency (daily, weekly, monthly, yearly)
   - Set start date and optional end date
   - Click "Save"

2. **Managing Recurring Transactions**:
   - View a list of all recurring transactions
   - Edit any recurring transaction by clicking on it
   - Delete recurring transactions as needed
   - Toggle active status on/off

3. **Previewing Future Transactions**:
   - Click "Preview" on any recurring transaction
   - See upcoming instances of the transaction
   - Understand the impact on future cash flow

### Advanced Transaction Management

1. **Bulk Edit**:
   - Select multiple transactions using checkboxes
   - Click "Bulk Actions" button
   - Choose which fields to update across all selected transactions
   - Apply changes with a single click

2. **Custom Fields**:
   - Use the custom fields framework to track additional transaction information
   - Create custom fields specific to your needs
   - Include custom field data in transaction forms and reports

3. **Advanced Search**:
   - Use the advanced search panel to find specific transactions
   - Combine multiple filters (date, category, amount, tags)
   - Save frequent searches for easy access

## Administration Guide

### MongoDB Database

1. **Database Structure**:
   - The application uses MongoDB with the following collections:
     - users
     - transactions
     - categories
     - recurringTransactions
     - budgetTemplates
     - savingsGoals
     - bills

2. **Database Maintenance**:
   - Regular backups are recommended
   - Use MongoDB Atlas for managed hosting (recommended)
   - Monitor database size and performance

### User Management

Currently, the application does not have an admin panel for user management. This would be handled directly through database access.

## Deployment Guide

### Backend Deployment

1. **Preparing for Deployment**:
   - Set NODE_ENV=production in your .env file
   - Ensure all dependencies are correctly listed in package.json
   - Update CORS settings for your production domain

2. **Deployment Options**:

   a. **Heroku**:
   ```bash
   # Add Heroku remote
   heroku git:remote -a your-app-name
   
   # Set environment variables
   heroku config:set MONGO_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   
   # Push to Heroku
   git subtree push --prefix server heroku main
   ```

   b. **Railway.app**:
   - Connect your GitHub repository
   - Set the root directory to `/server`
   - Configure environment variables
   - Deploy

   c. **DigitalOcean App Platform**:
   - Connect your GitHub repository
   - Set the root directory to `/server`
   - Configure environment variables
   - Deploy

### Frontend Deployment

1. **Building the Frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Deployment Options**:

   a. **Netlify**:
   - Connect your GitHub repository
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/build`
   - Configure environment variables

   b. **Vercel**:
   - Connect your GitHub repository
   - Set root directory to `/client`
   - Configure environment variables
   - Deploy

### Environment Variables

The following environment variables should be set in your production environment:

**Backend**:
- PORT: Server port (default: 5000)
- NODE_ENV: Set to 'production'
- MONGO_URI: MongoDB connection string (preferably MongoDB Atlas)
- JWT_SECRET: Secret key for JWT token generation
- JWT_EXPIRE: Token expiration time

**Frontend**:
- REACT_APP_API_URL: URL of your backend API

## Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**:
   - Ensure MongoDB is running (if local)
   - Check MONGO_URI for typos
   - Verify network connectivity to MongoDB Atlas
   - Check IP whitelist in MongoDB Atlas

2. **API Connection Errors**:
   - Verify the backend server is running
   - Check REACT_APP_API_URL in client/.env
   - Ensure CORS is properly configured on the backend
   - Check browser console for specific error messages

3. **Authentication Issues**:
   - JWT_SECRET should match between development and production
   - Clear browser cookies and try logging in again
   - Check if JWT token is expired

4. **Application Performance**:
   - Consider implementing pagination for large datasets
   - Monitor MongoDB performance
   - Check for memory leaks in React components
   - Consider code splitting for large bundles

## What's Missing/Future Enhancements

The current implementation provides a solid foundation but several features from the original plan are not yet fully implemented:

1. **Financial Reports System**:
   - Enhanced reporting capabilities
   - Export functionality
   - More visualization options

2. **Mobile Applications**:
   - Native iOS app
   - Native Android app
   - Progressive Web App capabilities

3. **Advanced Features**:
   - Financial forecasting
   - Investment tracking
   - Debt management tools
   - Multi-currency support

4. **Integration Features**:
   - Bank account synchronization
   - Import from CSV/Excel
   - Email notifications
   - Calendar integration

## Technical Architecture

### Frontend Architecture

```
client/
├── public/                # Static files
├── src/
    ├── components/        # Reusable UI components
    │   ├── analytics/     # Analytics components
    │   ├── bills/         # Bill management components
    │   ├── budget/        # Budget management components
    │   ├── dashboard/     # Dashboard components
    │   ├── layout/        # Layout components
    │   ├── transactions/  # Transaction management components
    ├── pages/             # Page components
    ├── redux/             # Redux state management
    │   ├── actions/       # Redux actions
    │   ├── reducers/      # Redux reducers
    ├── services/          # API client services
    ├── utils/             # Utility functions
    ├── App.js             # Main component
    ├── index.js           # Entry point
```

### Backend Architecture

```
server/
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middleware/           # Express middleware
├── models/               # Mongoose models
├── routes/               # API routes
├── services/             # Business logic
├── app.js                # Express app setup
├── server.js             # Entry point
```

### Data Flow

1. **User Interaction**:
   - User interacts with React components
   - Component triggers Redux action

2. **State Management**:
   - Redux action dispatched
   - API call made to backend
   - Redux reducer updates state based on API response

3. **Backend Processing**:
   - Express route receives API request
   - Controller processes request
   - Mongoose model interacts with MongoDB
   - Response sent back to client

4. **UI Update**:
   - React component receives updated state
   - UI re-renders with new data