import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useDispatch } from 'react-redux';
import SummaryCards from '../SummaryCards';
import { getDashboardSummary } from '../../../redux/actions/dashboardActions';

// Mock redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn()
}));

// Mock dashboard actions
jest.mock('../../../redux/actions/dashboardActions', () => ({
  getDashboardSummary: jest.fn()
}));

describe('SummaryCards Component', () => {
  // Setup mock dispatch function
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    getDashboardSummary.mockReturnValue(Promise.resolve({
      income: 5000,
      expenses: 3000,
      balance: 2000
    }));
    mockDispatch.mockImplementation(action => {
      if (typeof action === 'function') {
        return action(mockDispatch);
      }
      return action;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<SummaryCards />);
    
    // Should show loading indicators
    const loadingIndicators = screen.getAllByRole('progressbar');
    expect(loadingIndicators).toHaveLength(3);
    
    // Title should be visible even during loading
    expect(screen.getByText('Financial Summary')).toBeInTheDocument();
  });

  test('renders financial data when loaded', async () => {
    render(<SummaryCards />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    });
    
    // Check that summary data is displayed
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
  });

  test('changes period and refetches data', async () => {
    render(<SummaryCards />);
    
    // Wait for initial loading
    await waitFor(() => {
      expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    });
    
    // Check initial call to getDashboardSummary
    expect(getDashboardSummary).toHaveBeenCalledTimes(1);
    
    // Change period to "Last Month"
    fireEvent.mouseDown(screen.getByLabelText('Period'));
    fireEvent.click(screen.getByText('Last Month'));
    
    // Verify that getDashboardSummary was called with new params
    await waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalledTimes(2);
    });
    
    // The second call should have different date parameters
    const lastCall = getDashboardSummary.mock.calls[1][0];
    expect(lastCall).toHaveProperty('startDate');
    expect(lastCall).toHaveProperty('endDate');
  });

  test('handles error state and retry functionality', async () => {
    // Mock the first call to throw an error
    getDashboardSummary.mockRejectedValueOnce(new Error('API Error'));
    
    render(<SummaryCards />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading financial summary/)).toBeInTheDocument();
    });
    
    // Error message should contain the error text
    expect(screen.getByText(/API Error/)).toBeInTheDocument();
    
    // Mock successful response for retry
    getDashboardSummary.mockResolvedValueOnce({
      income: 5000,
      expenses: 3000,
      balance: 2000
    });
    
    // Click retry button
    fireEvent.click(screen.getByText('Retry'));
    
    // Should show loading state again
    expect(screen.getAllByRole('progressbar')).toHaveLength(3);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    });
    
    // Check that summary data is now displayed
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
  });

  test('displays negative balance in red', async () => {
    // Set up negative balance
    getDashboardSummary.mockResolvedValueOnce({
      income: 3000,
      expenses: 5000,
      balance: -2000
    });
    
    render(<SummaryCards />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    });
    
    // Check that negative balance is displayed
    const negativeBalance = screen.getByText('-$2,000.00');
    expect(negativeBalance).toBeInTheDocument();
    
    // Check that it has the error color class
    // Note: With MUI, we'd need to use a more sophisticated approach to check styling
    // This is a simplified check assuming the color styling is applied properly
    const balanceElement = negativeBalance.closest('div');
    expect(balanceElement).toHaveStyle({ color: expect.stringContaining('error') });
  });
});