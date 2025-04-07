# Budget Tracker

A comprehensive full-stack application for personal and household financial management. This application helps users track income, expenses, savings goals, and bills while providing insightful visualizations of their financial data.

## 📋 Features

### Dashboard View
- Summary cards showing total income, expenses, and balance
- Expense breakdown visualization (pie chart)
- Budget vs. actual spending comparison (bar chart)
- Spending over time visualization (line chart)
- Recent transactions list
- Upcoming bills reminders

### Income Management
- Track multiple income sources
- Manage household income
- Filter by date and person
- Historical income tracking

### Expense Tracking
- Categorize expenses
- Set and track budgets for each category
- Visual indicators for over-budget categories
- Track spending trends over time

### Transaction History
- Log individual transactions by category
- Filter transactions by date, category, and amount
- Search functionality
- User assignment for household accounts

### Bill Payment Reminders
- Track recurring bills
- Set due dates and payment frequencies
- Visual alerts for upcoming and overdue bills
- Mark bills as paid
- Payment history

### Savings Goals
- Create and track progress toward financial goals
- Set target amounts and deadlines
- Track contributions
- View projected completion dates
- Calculate recommended monthly savings

### Reports & Analytics
- Export financial data as CSV
- View spending patterns and trends
- Identify top expense categories
- Budget performance insights

### User Accounts & Household Management
- Individual and household profiles
- Share financial data with household members
- Assign expenses to specific users
- Filter view by user

## 🛠️ Technology Stack

### Frontend
- **React.js**: UI components and state management
- **Redux**: Global state management
- **Material UI**: Responsive design components
- **Recharts**: Data visualization
- **React Router**: Navigation
- **Axios**: API client

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcrypt**: Password hashing

## 🏛️ Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

### Client-Side (Frontend)
- Component-based UI architecture
- Redux for state management with actions, reducers, and selectors
- Service layer for API interactions
- Responsive design for all device sizes

### Server-Side (Backend)
- RESTful API design
- MVC pattern (Models, Controllers, Routes)
- Middleware for authentication and error handling
- Data validation and sanitization

### Database
- MongoDB collections with appropriate relationships
- Mongoose schemas with validation
- Indexes for optimized queries

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/budget-tracker.git
cd budget-tracker
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Environment Setup

Create a `.env` file in the server directory:
```
MONGO_URI=mongodb://localhost:27017/budget-tracker
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
```

4. Start the application
```bash
# From the root directory
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📂 Project Structure

```
budget-tracker/
├── client/                     # Frontend React application
│   ├── public/                 # Static files
│   ├── src/
│   │   ├── assets/             # Images, icons, etc.
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Main application pages
│   │   ├── redux/              # Redux state management
│   │   ├── services/           # API client services
│   │   ├── utils/              # Helper functions
│   │   ├── App.js              # Main component
│   │   └── index.js            # Entry point
│   └── package.json
│
├── server/                     # Backend Node.js application
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Express middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── utils/                  # Helper functions
│   ├── app.js                  # Express app setup
│   ├── server.js               # Entry point
│   └── package.json
│
├── .gitignore
├── package.json                # Root package.json
└── README.md
```

## 📡 API Documentation

The application includes a comprehensive RESTful API:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Income
- `GET /api/income` - Get all income sources
- `POST /api/income` - Create a new income source
- `PUT /api/income/:id` - Update an income source
- `DELETE /api/income/:id` - Delete an income source

### Expense Categories
- `GET /api/categories` - Get all expense categories
- `POST /api/categories` - Create a new expense category
- `PUT /api/categories/:id` - Update an expense category
- `DELETE /api/categories/:id` - Delete an expense category

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create a new bill
- `PUT /api/bills/:id` - Update a bill
- `PUT /api/bills/:id/pay` - Mark a bill as paid
- `DELETE /api/bills/:id` - Delete a bill

### Savings Goals
- `GET /api/goals` - Get all savings goals
- `POST /api/goals` - Create a new savings goal
- `PUT /api/goals/:id` - Update a savings goal
- `POST /api/goals/:id/contribute` - Add a contribution
- `DELETE /api/goals/:id` - Delete a savings goal

### Dashboard
- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/dashboard/expense-breakdown` - Get expense breakdown
- `GET /api/dashboard/budget-actual` - Get budget vs. actual
- `GET /api/dashboard/spending-trends` - Get spending trends

## 🔒 Authentication & Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes with middleware
- Proper error handling and validation
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🌐 Deployment

### Frontend Deployment Options
- Netlify
- Vercel
- GitHub Pages
- AWS Amplify

### Backend Deployment Options
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean
- Railway.app

### Database Deployment
- MongoDB Atlas (recommended)
- Self-hosted MongoDB

## 🔧 Configuration Options

The application can be configured through environment variables:
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS configuration

## 🔮 Future Enhancements

- Dark mode support
- Currency selection
- CSV/Excel import and export
- Recurring transactions
- Financial planning tools
- Budget templates
- Mobile apps (React Native)
- Email notifications
- Data visualization enhancements
- Investment tracking

## 📚 Learning Resources

This project demonstrates best practices in:
- React component architecture
- State management with Redux
- MongoDB data modeling
- RESTful API design
- Authentication and authorization
- Responsive UI development
- Chart creation and data visualization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Material UI](https://mui.com/)
- [Recharts](https://recharts.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
