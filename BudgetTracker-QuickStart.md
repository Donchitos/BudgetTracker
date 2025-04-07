# BudgetTracker Quick-Start Guide

This guide provides the steps to get BudgetTracker running on your local machine for testing.

## Prerequisites

- Node.js (v14+)
- npm (v6+)
- MongoDB (local or Atlas)
- Git

## Setup Instructions

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/BudgetTracker.git
cd BudgetTracker

# Install dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Configure MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended for sharing)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster and get connection string

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start server: `mongod`

### 3. Set Environment Variables

Create `.env` file in server directory:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/budget-tracker
JWT_SECRET=your_secret_key
```

Create `.env` file in client directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the Application

```bash
# Start backend server (from root directory)
cd server
npm run dev

# In a new terminal, start frontend
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First-Time Setup

1. Register a new account
2. Create categories (Groceries, Housing, Transportation, etc.)
3. Add transactions
4. Set up budgets

## Key Features to Test

1. **Dashboard**: View financial summary and charts
2. **Transactions**: Add, edit, delete, and filter transactions
3. **Budget Management**: Set and track category budgets
4. **Recurring Transactions**: Set up automated recurring transactions
5. **Bulk Editing**: Select multiple transactions for batch updates

## Mobile Testing

1. Open Chrome DevTools (F12)
2. Click the device icon to enable mobile view
3. Test responsive layout and mobile features

## Deployment Options

### Backend Deployment
- **Heroku**: `heroku create` and `git push heroku main:main`
- **Railway.app**: Connect GitHub repo
- **DigitalOcean**: Deploy via App Platform

### Frontend Deployment
- **Netlify**: Connect GitHub repo
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: `npm run deploy`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Check connection string
   - Verify MongoDB is running
   - Check network access (Atlas IP whitelist)

2. **Node/npm Errors**
   - Make sure Node version is 14+
   - Try clearing node_modules: `rm -rf node_modules && npm install`

3. **API Connection Issues**
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings in backend
   - Ensure backend server is running

## What's Missing

The application is currently missing:
- Email notifications
- Import/export functionality (partially implemented)
- Mobile apps (PWA implementation pending)
- Multi-currency support
- Bank account sync

For detailed documentation, see BudgetTracker-Documentation.md.