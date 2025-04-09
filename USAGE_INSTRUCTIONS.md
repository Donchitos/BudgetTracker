# Budget Tracker Application Usage Instructions

The Budget Tracker application can run in two modes:
1. **Demo Mode** - Uses mock data and doesn't require a MongoDB database
2. **Real Mode** - Uses MongoDB to store your real financial data

## Running in Demo Mode

Demo mode is perfect for trying out the application without setting up a database. All data is simulated and won't be persisted between sessions.

```bash
# Make sure demo mode is enabled in server/.env
# Change USE_DEMO_MODE=false to USE_DEMO_MODE=true

# Then run the application
npm run dev
```

Alternatively, you can use the demo script that automatically sets demo mode:

```bash
npm run dev:demo
```

In demo mode:
- You can log in with any email/password
- Data won't be saved between server restarts
- The app will use mock data for all features

## Running with a Real MongoDB Database

For a full experience with persistent data storage, you'll need MongoDB installed.

### Prerequisites

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Install the MongoDB Community Server for your operating system
   - Make sure MongoDB service is running

2. **Configure the application**
   - In `server/.env`, ensure `USE_DEMO_MODE=false`
   - Verify your MongoDB connection string is correct: `MONGO_URI=mongodb://localhost:27017/budget-tracker`

### Initialize the Database

Before using the application for the first time, you should initialize the database with some sample data:

```bash
npm run init-db
```

This will:
- Create a sample user account (Email: user@example.com, Password: password123)
- Set up default categories
- Add sample transactions, bills, and a savings goal
- Create a default budget template

### Starting the Application in Real Mode

```bash
npm run dev
```

This will:
1. Start the Node.js server with MongoDB connectivity
2. Start the React frontend
3. Connect to your local MongoDB database

### Log In with the Sample Account

After initializing the database, you can log in with:
- **Email**: user@example.com
- **Password**: password123

Or you can register a new account from the login screen.

## Switching Between Modes

To switch between demo mode and real mode:

1. Edit the `server/.env` file and change the `USE_DEMO_MODE` value:
   - `USE_DEMO_MODE=true` for demo mode
   - `USE_DEMO_MODE=false` for real mode with MongoDB

2. Restart the application:
   ```bash
   npm run dev
   ```

## Troubleshooting

### MongoDB Connection Issues

If you experience connection issues with MongoDB:

1. Verify MongoDB is installed and running:
   ```bash
   # On Windows, check if the MongoDB service is running
   sc query MongoDB
   
   # If not running, start it
   net start MongoDB
   ```

2. Check your MongoDB connection string in `server/.env`:
   - Default: `MONGO_URI=mongodb://localhost:27017/budget-tracker`

3. Ensure no firewall is blocking MongoDB (port 27017)

### Demo Mode Fallback

If you're having trouble with MongoDB, you can always fall back to demo mode:
1. Set `USE_DEMO_MODE=true` in `server/.env`
2. Restart the application: `npm run dev`

## Feature Differences Between Modes

Most features work identically in both modes, but there are some differences:

**Demo Mode**:
- Authentication accepts any credentials
- Data is not persisted between server restarts
- All data is pre-defined mock data

**Real Mode**:
- Requires proper authentication
- Data is stored permanently in MongoDB
- Full CRUD operations on all your financial data
- Supports multiple user accounts
- Advanced filtering and reporting on real data

## Support

For issues or questions about this application, please refer to the documentation files in the project or open an issue in the repository.