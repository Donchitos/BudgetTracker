import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import AdvancedReportGenerator from '../AdvancedReportGenerator';

// Mock the recharts library components
jest.mock('recharts', () => ({
  ResponsiveContainer: props => <div data-testid="responsive-container">{props.children}</div>,
  BarChart: props => <div data-testid="bar-chart">{props.children}</div>,
  Bar: props => <div data-testid="bar"></div>,
  LineChart: props => <div data-testid="line-chart">{props.children}</div>,
  Line: props => <div data-testid="line"></div>,
  PieChart: props => <div data-testid="pie-chart">{props.children}</div>,
  Pie: props => <div data-testid="pie">{props.children}</div>,
  Cell: props => <div data-testid="cell"></div>,
  AreaChart: props => <div data-testid="area-chart">{props.children}</div>,
  Area: props => <div data-testid="area"></div>,
  XAxis: props => <div data-testid="x-axis"></div>,
  YAxis: props => <div data-testid="y-axis"></div>,
  CartesianGrid: props => <div data-testid="cartesian-grid"></div>,
  Legend: props => <div data-testid="legend"></div>,
  Tooltip: props => <div data-testid="tooltip"></div>,
  ComposedChart: props => <div data-testid="composed-chart">{props.children}</div>,
  Scatter: props => <div data-testid="scatter"></div>,
  Treemap: props => <div data-testid="treemap">{props.children}</div>,
}));

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: props => <div data-testid="pdf-download-link">{props.children}</div>,
  Document: props => <div data-testid="pdf-document">{props.children}</div>,
  Page: props => <div data-testid="pdf-page">{props.children}</div>,
  Text: props => <div data-testid="pdf-text">{props.children}</div>,
  View: props => <div data-testid="pdf-view">{props.children}</div>,
  StyleSheet: {
    create: jest.fn().mockReturnValue({})
  },
  Image: props => <div data-testid="pdf-image"></div>,
}));

const mockStore = configureMockStore([thunk]);

// Create mock transaction data
const generateMockTransactions = (count) => {
  const transactions = [];
  const startDate = new Date('2023-01-01');
  const categories = ['food', 'housing', 'transportation', 'entertainment', 'utilities'];
  const accounts = ['checking', 'credit-card', 'savings'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    
    const type = Math.random() > 0.3 ? 'expense' : 'income';
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const accountIndex = Math.floor(Math.random() * accounts.length);
    
    transactions.push({
      _id: `transaction-${i}`,
      description: `Transaction ${i}`,
      amount: Math.floor(Math.random() * 200) + 10,
      date: date.toISOString(),
      type,
      category: {
        _id: categories[categoryIndex],
        name: categories[categoryIndex].charAt(0).toUpperCase() + categories[categoryIndex].slice(1),
        color: ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FFC107'][categoryIndex]
      },
      account: {
        _id: accounts[accountIndex],
        name: accounts[accountIndex].charAt(0).toUpperCase() + accounts[accountIndex].slice(1)
      }
    });
  }
  
  return transactions;
};

// Create mock category data
const mockCategories = [
  { _id: 'food', name: 'Food', color: '#FF5722', budget: 500 },
  { _id: 'housing', name: 'Housing', color: '#2196F3', budget: 1500 },
  { _id: 'transportation', name: 'Transportation', color: '#4CAF50', budget: 300 },
  { _id: 'entertainment', name: 'Entertainment', color: '#9C27B0', budget: 200 },
  { _id: 'utilities', name: 'Utilities', color: '#FFC107', budget: 250 }
];

// Create mock account data
const mockAccounts = [
  { _id: 'checking', name: 'Checking', type: 'checking', balance: 2500 },
  { _id: 'credit-card', name: 'Credit Card', type: 'creditCard', balance: 1200 },
  { _id: 'savings', name: 'Savings', type: 'savings', balance: 5000 }
];

describe('AdvancedReportGenerator Component', () => {
  let store;
  const mockTransactions = generateMockTransactions(100);

  beforeEach(() => {
    store = mockStore({
      transaction: {
        transactions: mockTransactions,
        loading: false
      },
      category: {
        categories: mockCategories,
        loading: false
      },
      account: {
        accounts: mockAccounts,
        loading: false
      }
    });

    // Mock localStorage methods
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(JSON.stringify([
        {
          id: '1',
          name: 'Monthly Expenses',
          dateCreated: '2023-01-01T12:00:00Z',
          dateRange: {
            startDate: '2023-01-01',
            endDate: '2023-01-31'
          },
          filters: {
            categories: [],
            accounts: [],
            transactionTypes: ['expense'],
            minAmount: '',
            maxAmount: '',
            tags: [],
            searchText: ''
          },
          reportSettings: {
            groupBy: 'category',
            chartType: 'pie',
            includePending: false,
            includeRecurring: true,
            showAverage: true,
            comparisonPeriod: 'none'
          }
        }
      ])),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;
  });

  test('renders report generator component', async () => {
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    expect(screen.getByText('Advanced Report Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });

  test('opens filters drawer when filters button is clicked', async () => {
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Find and click the Filters button
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      // Check if the filters drawer is open
      expect(screen.getByText('Report Filters')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Transaction Types')).toBeInTheDocument();
    });
  });

  test('selects date range in filters', async () => {
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Open filters drawer
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    // Find and click a date range preset
    const lastMonthChip = screen.getByText('Last Month');
    fireEvent.click(lastMonthChip);
    
    // Apply filters and generate report
    const applyButton = screen.getByText('Apply & Generate');
    fireEvent.click(applyButton);
    
    // The component should generate a report (but we're not actually checking the output)
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
  });

  test('switches between report tabs', async () => {
    // Mock the generateReport method to simulate a successful report generation
    jest.spyOn(window, 'setTimeout').mockImplementationOnce((callback) => {
      callback();
      return 1;
    });
    
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Generate a report first
    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);
    
    // Wait for report to be generated
    await waitFor(() => {
      // Now click on Category Analysis tab
      const categoryTab = screen.getByText('Category Analysis');
      fireEvent.click(categoryTab);
      
      // Tab should change
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    });
    
    // Click on Tax Report tab
    const taxTab = screen.getByText('Tax Report');
    fireEvent.click(taxTab);
    
    // Tab should change
    expect(screen.getByText('Tax Report for')).toBeInTheDocument();
    
    // Click on Saved Reports tab
    const savedReportsTab = screen.getByText('Saved Reports');
    fireEvent.click(savedReportsTab);
    
    // Tab should change
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
  });

  test('opens save report dialog when save button is clicked', async () => {
    // Mock report generation
    jest.spyOn(window, 'setTimeout').mockImplementationOnce((callback) => {
      callback();
      return 1;
    });
    
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Generate a report first (otherwise Save button won't be visible)
    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      // Now find and click the Save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      // Dialog should open
      expect(screen.getByText('Save Report')).toBeInTheDocument();
      expect(screen.getByLabelText('Report Name')).toBeInTheDocument();
    });
  });

  test('validates report name when saving', async () => {
    // Mock report generation
    jest.spyOn(window, 'setTimeout').mockImplementationOnce((callback) => {
      callback();
      return 1;
    });
    
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Generate a report first
    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);
    
    await waitFor(async () => {
      // Find and click the Save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      // Try to save without a name
      const dialogSaveButton = screen.getByText('Save').closest('button');
      fireEvent.click(dialogSaveButton);
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Please enter a report name')).toBeInTheDocument();
      });
    });
  });

  test('loads saved report from the list', async () => {
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Go to Saved Reports tab
    const savedReportsTab = screen.getByText('Saved Reports');
    fireEvent.click(savedReportsTab);
    
    // Find and click the Load Report button
    const loadButton = screen.getByText('Load Report');
    fireEvent.click(loadButton);
    
    // The app should attempt to load the report (but we're not actually checking the result)
    // This primarily verifies that the button exists and can be clicked
    expect(loadButton).toBeInTheDocument();
  });

  test('export buttons work after report generation', async () => {
    // Mock report generation
    jest.spyOn(window, 'setTimeout').mockImplementationOnce((callback) => {
      callback();
      return 1;
    });
    
    render(
      <Provider store={store}>
        <AdvancedReportGenerator />
      </Provider>
    );

    // Generate a report first
    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      // Export buttons should appear
      const pdfButton = screen.getByText('PDF');
      const csvButton = screen.getByText('CSV');
      
      expect(pdfButton).toBeInTheDocument();
      expect(csvButton).toBeInTheDocument();
      
      // Click export buttons (we're not testing the actual export, just that the buttons work)
      fireEvent.click(pdfButton);
      fireEvent.click(csvButton);
    });
  });
});