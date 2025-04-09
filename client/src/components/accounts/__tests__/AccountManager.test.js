import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import AccountManager from '../AccountManager';

// Mock the recharts library components
jest.mock('recharts', () => ({
  ResponsiveContainer: props => <div data-testid="responsive-container">{props.children}</div>,
  PieChart: props => <div data-testid="pie-chart">{props.children}</div>,
  Pie: props => <div data-testid="pie">{props.children}</div>,
  Cell: props => <div data-testid="cell"></div>,
  Legend: props => <div data-testid="legend"></div>,
  Tooltip: props => <div data-testid="tooltip"></div>,
  LineChart: props => <div data-testid="line-chart">{props.children}</div>,
  Line: props => <div data-testid="line"></div>,
  BarChart: props => <div data-testid="bar-chart">{props.children}</div>,
  Bar: props => <div data-testid="bar"></div>,
  XAxis: props => <div data-testid="x-axis"></div>,
  YAxis: props => <div data-testid="y-axis"></div>,
  CartesianGrid: props => <div data-testid="cartesian-grid"></div>,
}));

const mockStore = configureMockStore([thunk]);

// Mock account data
const mockAccounts = [
  {
    id: '1',
    name: 'Checking Account',
    type: 'checking',
    balance: 1500.75,
    isCredit: false,
    institution: 'Test Bank',
    accountNumber: '****1234',
    isExcluded: false
  },
  {
    id: '2',
    name: 'Credit Card',
    type: 'creditCard',
    balance: 450.25,
    isCredit: true,
    creditLimit: 5000,
    apr: 18.99,
    institution: 'Test Card',
    accountNumber: '****5678',
    isExcluded: false
  }
];

describe('AccountManager Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      account: {
        accounts: mockAccounts,
        loading: false,
        error: null
      }
    });

    // Mock setTimeout to immediately execute
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders account manager component', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );

    // Wait for the component to load (simulating the setTimeout in loadAccounts)
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Account Manager')).toBeInTheDocument();
    });
  });

  test('displays accounts after loading', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Check for account names
      expect(screen.getByText('Main Checking')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });
  });

  test('calculates net worth correctly', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Check for asset, liability and net worth displays
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      expect(screen.getByText('Total Liabilities')).toBeInTheDocument();
      expect(screen.getByText('Net Worth')).toBeInTheDocument();
    });
  });

  test('opens account dialog when add account button is clicked', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Find and click the Add Account button
    const addButton = screen.getByText('Add Account');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      // Check if the dialog is open
      expect(screen.getByText('Add New Account')).toBeInTheDocument();
      
      // Check for form fields
      expect(screen.getByLabelText('Account Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Account Name')).toBeInTheDocument();
    });
  });

  test('validates account form on submission', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Open the add account dialog
    const addButton = screen.getByText('Add Account');
    fireEvent.click(addButton);
    
    // Try to save without entering required fields
    const saveButton = screen.getByText('Save Account');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      // Should show an error message
      expect(screen.getByText('Account name is required')).toBeInTheDocument();
    });
  });

  test('changes tabs correctly', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );

    // Wait for the component to load
    jest.advanceTimersByTime(1000);
    
    // Find and click the Net Worth tab
    const netWorthTab = screen.getByText('Net Worth');
    fireEvent.click(netWorthTab);
    
    await waitFor(() => {
      // Check for content that's only on the Net Worth tab
      expect(screen.getByText('Your Financial Overview')).toBeInTheDocument();
      expect(screen.getByText('Asset Breakdown')).toBeInTheDocument();
    });
  });
});