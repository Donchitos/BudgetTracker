import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import AccountManager from '../AccountManager';
import * as accountActions from '../../../redux/actions/accountActions';

// Mock the account actions
jest.mock('../../../redux/actions/accountActions', () => ({
  fetchAccounts: jest.fn(),
  addAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  transferBetweenAccounts: jest.fn(),
  calculateNetWorth: jest.fn()
}));

// Setup mock store
const mockStore = configureStore([thunk]);

describe('AccountManager Component', () => {
  let store;
  
  // Sample accounts data
  const mockAccounts = [
    {
      id: '1',
      name: 'Checking Account',
      type: 'checking',
      balance: 2500.75,
      institution: 'Chase Bank',
      lastUpdated: '2023-10-01T12:00:00Z',
      isAsset: true
    },
    {
      id: '2',
      name: 'Credit Card',
      type: 'creditCard',
      balance: 350.50,
      creditLimit: 5000,
      institution: 'Capital One',
      lastUpdated: '2023-10-01T12:00:00Z',
      isAsset: false
    },
    {
      id: '3',
      name: 'Savings Account',
      type: 'savings',
      balance: 10000,
      institution: 'Bank of America',
      lastUpdated: '2023-10-01T12:00:00Z',
      isAsset: true
    }
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Initialize store with mock data
    store = mockStore({
      accounts: {
        accounts: mockAccounts,
        loading: false,
        error: null,
        netWorth: {
          assets: 12500.75,
          liabilities: 350.50,
          total: 12150.25
        }
      },
      auth: {
        user: { id: 'user123', name: 'Test User' }
      }
    });
    
    // Mock the action creators
    accountActions.fetchAccounts.mockReturnValue({ type: 'FETCH_ACCOUNTS' });
    accountActions.addAccount.mockReturnValue({ type: 'ADD_ACCOUNT' });
    accountActions.updateAccount.mockReturnValue({ type: 'UPDATE_ACCOUNT' });
    accountActions.deleteAccount.mockReturnValue({ type: 'DELETE_ACCOUNT' });
    accountActions.calculateNetWorth.mockReturnValue({ type: 'CALCULATE_NET_WORTH' });
  });
  
  test('renders account list and summary correctly', () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );
    
    // Check for header
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    
    // Check if all accounts are displayed
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Savings Account')).toBeInTheDocument();
    
    // Check balances
    expect(screen.getByText('$2,500.75')).toBeInTheDocument();
    expect(screen.getByText('$350.50')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    
    // Check for net worth summary
    expect(screen.getByText('Net Worth')).toBeInTheDocument();
    expect(screen.getByText('$12,150.25')).toBeInTheDocument();
    expect(screen.getByText('Total Assets: $12,500.75')).toBeInTheDocument();
    expect(screen.getByText('Total Liabilities: $350.50')).toBeInTheDocument();
  });
  
  test('can add a new account', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );
    
    // Click on add account button
    fireEvent.click(screen.getByText('Add Account'));
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Account Name'), { 
      target: { value: 'Investment Account' } 
    });
    
    fireEvent.change(screen.getByLabelText('Institution'), { 
      target: { value: 'Vanguard' } 
    });
    
    // Select account type
    fireEvent.mouseDown(screen.getByLabelText('Account Type'));
    fireEvent.click(screen.getByText('Investment'));
    
    fireEvent.change(screen.getByLabelText('Current Balance'), { 
      target: { value: '25000' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Account'));
    
    // Verify that the addAccount action was called with correct data
    expect(accountActions.addAccount).toHaveBeenCalledWith({
      name: 'Investment Account',
      type: 'investment',
      balance: 25000,
      institution: 'Vanguard',
      isAsset: true
    });
  });
  
  test('can edit an existing account', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );
    
    // Find and click edit button for Checking Account
    const editButtons = screen.getAllByLabelText('Edit Account');
    // Assuming first edit button belongs to first account
    fireEvent.click(editButtons[0]);
    
    // Modify account name
    const nameInput = screen.getByLabelText('Account Name');
    fireEvent.change(nameInput, { target: { value: 'Primary Checking' } });
    
    // Modify balance
    const balanceInput = screen.getByLabelText('Current Balance');
    fireEvent.change(balanceInput, { target: { value: '3000.50' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Update Account'));
    
    // Verify updateAccount was called with correct data
    expect(accountActions.updateAccount).toHaveBeenCalledWith('1', {
      name: 'Primary Checking',
      balance: 3000.50,
      type: 'checking',
      institution: 'Chase Bank',
      isAsset: true
    });
  });
  
  test('can delete an account', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );
    
    // Find and click delete button for Credit Card
    const deleteButtons = screen.getAllByLabelText('Delete Account');
    // Assuming second delete button belongs to second account
    fireEvent.click(deleteButtons[1]);
    
    // Confirm deletion in modal
    fireEvent.click(screen.getByText('Confirm Delete'));
    
    // Verify deleteAccount was called with correct id
    expect(accountActions.deleteAccount).toHaveBeenCalledWith('2');
  });
  
  test('can transfer money between accounts', async () => {
    render(
      <Provider store={store}>
        <AccountManager />
      </Provider>
    );
    
    // Click transfer button
    fireEvent.click(screen.getByText('Transfer Money'));
    
    // Select from account (Checking)
    fireEvent.mouseDown(screen.getByLabelText('From Account'));
    fireEvent.click(screen.getByText('Checking Account'));
    
    // Select to account (Savings)
    fireEvent.mouseDown(screen.getByLabelText('To Account'));
    fireEvent.click(screen.getByText('Savings Account'));
    
    // Enter amount
    fireEvent.change(screen.getByLabelText('Amount'), { 
      target: { value: '500' } 
    });
    
    // Add memo
    fireEvent.change(screen.getByLabelText('Memo (Optional)'), { 
      target: { value: 'Saving for vacation' } 
    });
    
    // Execute transfer
    fireEvent.click(screen.getByText('Complete Transfer'));
    
    // Verify transferBetweenAccounts was called with correct data
    expect(accountActions.transferBetweenAccounts).toHaveBeenCalledWith({
      fromAccountId: '1',
      toAccountId: '3',
      amount: 500,
      memo: 'Saving for vacation',
      date: expect.any(String)
    });
  });
  
  test('shows loading state while fetching accounts', async () => {
    // Set loading to true in the store
    const loadingStore = mockStore({
      accounts: {
        accounts: [],
        loading: true,
        error: null
      },
      auth: {
        user: { id: 'user123', name: 'Test User' }
      }
    });
    
    render(
      <Provider store={loadingStore}>
        <AccountManager />
      </Provider>
    );
    
    // Check for loading indicator
    expect(screen.getByTestId('accounts-loading')).toBeInTheDocument();
    expect(screen.queryByText('Checking Account')).not.toBeInTheDocument();
  });
  
  test('shows error message when account fetch fails', async () => {
    // Set error in the store
    const errorStore = mockStore({
      accounts: {
        accounts: [],
        loading: false,
        error: 'Failed to fetch accounts.'
      },
      auth: {
        user: { id: 'user123', name: 'Test User' }
      }
    });
    
    render(
      <Provider store={errorStore}>
        <AccountManager />
      </Provider>
    );
    
    // Check for error message
    expect(screen.getByText('Failed to fetch accounts.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    
    // Click retry
    fireEvent.click(screen.getByText('Retry'));
    
    // Verify fetchAccounts was called again
    expect(accountActions.fetchAccounts).toHaveBeenCalled();
  });
});