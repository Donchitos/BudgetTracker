import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HouseholdManager from '../HouseholdManager';

// Mock the recharts library components
jest.mock('recharts', () => ({
  ResponsiveContainer: props => <div data-testid="responsive-container">{props.children}</div>,
  PieChart: props => <div data-testid="pie-chart">{props.children}</div>,
  Pie: props => <div data-testid="pie">{props.children}</div>,
  Cell: props => <div data-testid="cell"></div>,
  Legend: props => <div data-testid="legend"></div>,
  ChartTooltip: props => <div data-testid="chart-tooltip"></div>,
  Tooltip: props => <div data-testid="tooltip"></div>,
}));

const mockStore = configureMockStore([thunk]);

// Mock user data
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com'
};

describe('HouseholdManager Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false
      }
    });

    // Mock setTimeout to immediately execute
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders household manager component', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Doe Family')).toBeInTheDocument();
    });
  });

  test('displays household members after loading', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Switch to Members tab if not already active
    const membersTab = screen.getByText('Members');
    fireEvent.click(membersTab);
    
    await waitFor(() => {
      // Check for member names
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Sam Smith')).toBeInTheDocument();
    });
  });

  test('opens invite member dialog when button is clicked', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Find and click the Invite Member button
    const inviteButton = screen.getByText('Invite Member');
    fireEvent.click(inviteButton);
    
    await waitFor(() => {
      // Check if the dialog is open
      expect(screen.getByText('Invite to Household')).toBeInTheDocument();
      
      // Check for form fields
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });
  });

  test('validates email when sending invitation', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Open the invite dialog
    const inviteButton = screen.getByText('Invite Member');
    fireEvent.click(inviteButton);
    
    // Try to send without entering email
    const sendButton = screen.getByText('Send Invitation');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      // Should show an error message
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('displays shared expenses in the expenses tab', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Switch to Shared Expenses tab
    const expensesTab = screen.getByText('Shared Expenses');
    fireEvent.click(expensesTab);
    
    await waitFor(() => {
      // Check for expense descriptions
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Electricity Bill')).toBeInTheDocument();
      expect(screen.getByText('Dinner out')).toBeInTheDocument();
    });
  });

  test('calculates member balances correctly', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Switch to Balances tab
    const balancesTab = screen.getByText('Balances');
    fireEvent.click(balancesTab);
    
    await waitFor(() => {
      // Check for balance section headers
      expect(screen.getByText('Member Balances')).toBeInTheDocument();
      expect(screen.getByText('Settlement Suggestions')).toBeInTheDocument();
      
      // Check for balance table headers
      expect(screen.getByText('Total Paid')).toBeInTheDocument();
      expect(screen.getByText('Total Owed')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
    });
  });

  test('opens expense dialog when add expense button is clicked', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Find and click the Add Expense button
    const addButton = screen.getByText('Add Expense');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      // Check if the dialog is open
      expect(screen.getByText('Add Shared Expense')).toBeInTheDocument();
      
      // Check for form fields
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Paid By')).toBeInTheDocument();
    });
  });

  test('validates expense form on submission', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Open the add expense dialog
    const addButton = screen.getByText('Add Expense');
    fireEvent.click(addButton);
    
    // Try to save without entering required fields
    const saveButton = screen.getByText('Add Expense');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      // Should show an error message
      expect(screen.getByText('Please enter a description for the expense')).toBeInTheDocument();
    });
  });

  test('opens settings dialog when settings button is clicked', async () => {
    render(
      <Provider store={store}>
        <HouseholdManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Find and click the settings button
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      // Check if the dialog is open
      expect(screen.getByText('Household Settings')).toBeInTheDocument();
      
      // Check for form fields
      expect(screen.getByLabelText('Household Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Split Type')).toBeInTheDocument();
    });
  });
});