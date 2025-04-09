// / <reference types="cypress" />
// The above comment is intentionally spaced to fix TypeScript error
// The actual reference should be: /// <reference types="cypress" />

describe('BudgetTracker Application', () => {
  // Create a test user once before all tests
  before(() => {
    // You'd normally use a custom command for this
    // In a real app, you might want to do this via API calls instead
    // This is a simplified example
    cy.visit('/register');
    cy.get('[data-testid="register-name"]').type('Test User');
    cy.get('[data-testid="register-email"]').type(`testuser_${Date.now()}@example.com`);
    cy.get('[data-testid="register-password"]').type('password123');
    cy.get('[data-testid="register-password2"]').type('password123');
    cy.get('[data-testid="register-submit"]').click();
    
    // Verify registration success
    cy.url().should('include', '/dashboard');
    
    // Logout after creating the user
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });

  beforeEach(() => {
    // Log in before each test
    cy.visit('/login');
    cy.get('[data-testid="login-email"]').type('testuser@example.com');
    cy.get('[data-testid="login-password"]').type('password123');
    cy.get('[data-testid="login-submit"]').click();
    
    // Verify login success
    cy.url().should('include', '/dashboard');
  });

  it('displays dashboard components', () => {
    // Check for key dashboard components
    cy.get('[data-testid="summary-cards"]').should('be.visible');
    cy.get('[data-testid="expense-pie-chart"]').should('be.visible');
    cy.get('[data-testid="recent-transactions"]').should('be.visible');
    cy.get('[data-testid="budget-vs-actual-chart"]').should('be.visible');
  });

  it('can navigate to different pages', () => {
    // Navigate to Transactions
    cy.get('[data-testid="nav-transactions"]').click();
    cy.url().should('include', '/transactions');
    cy.get('[data-testid="transaction-list"]').should('be.visible');
    
    // Navigate to Budget Management
    cy.get('[data-testid="nav-budget"]').click();
    cy.url().should('include', '/budget');
    cy.get('[data-testid="monthly-budget-cycle"]').should('be.visible');
    
    // Navigate to Categories
    cy.get('[data-testid="nav-categories"]').click();
    cy.url().should('include', '/categories');
    cy.get('[data-testid="category-list"]').should('be.visible');
    
    // Navigate to Analytics
    cy.get('[data-testid="nav-analytics"]').click();
    cy.url().should('include', '/analytics');
    cy.get('[data-testid="analytics-container"]').should('be.visible');
  });

  it('can add a transaction', () => {
    // Go to Transactions page
    cy.get('[data-testid="nav-transactions"]').click();
    
    // Open add transaction dialog
    cy.get('[data-testid="add-transaction-button"]').click();
    
    // Fill out transaction form
    cy.get('[data-testid="transaction-description"]').type('Grocery shopping');
    cy.get('[data-testid="transaction-amount"]').type('45.67');
    cy.get('[data-testid="transaction-date"]').type('2023-10-15');
    cy.get('[data-testid="transaction-type-expense"]').click();
    
    // Select category (assuming it opens a dropdown)
    cy.get('[data-testid="transaction-category"]').click();
    cy.get('[data-testid="category-option-food"]').click();
    
    // Save transaction
    cy.get('[data-testid="save-transaction-button"]').click();
    
    // Verify transaction was added to the list
    cy.get('[data-testid="transaction-list"]').should('contain', 'Grocery shopping');
    cy.get('[data-testid="transaction-list"]').should('contain', '$45.67');
  });

  it('can create and monitor a budget', () => {
    // Go to Budget Management page
    cy.get('[data-testid="nav-budget"]').click();
    
    // Create/update a budget
    cy.get('[data-testid="budget-category-selector"]').click();
    cy.get('[data-testid="category-option-food"]').click();
    cy.get('[data-testid="budget-amount-input"]').clear().type('500');
    cy.get('[data-testid="save-budget-button"]').click();
    
    // Verify budget was set
    cy.get('[data-testid="budget-food"]').should('contain', '$500.00');
    
    // Check budget progress
    cy.get('[data-testid="budget-progress-food"]').should('exist');
  });

  it('can view and customize reports', () => {
    // Go to Reports page
    cy.get('[data-testid="nav-reports"]').click();
    
    // Generate a report
    cy.get('[data-testid="generate-report-button"]').click();
    
    // Verify report elements
    cy.get('[data-testid="report-summary"]').should('be.visible');
    cy.get('[data-testid="report-chart"]').should('be.visible');
    
    // Change report type
    cy.get('[data-testid="report-type-selector"]').click();
    cy.get('[data-testid="report-type-category"]').click();
    
    // Verify chart changes
    cy.get('[data-testid="category-breakdown"]').should('be.visible');
  });

  it('can create and track a savings goal', () => {
    // Go to Savings page
    cy.get('[data-testid="nav-savings"]').click();
    
    // Create new savings goal
    cy.get('[data-testid="add-savings-goal-button"]').click();
    cy.get('[data-testid="goal-name-input"]').type('Vacation Fund');
    cy.get('[data-testid="goal-amount-input"]').type('2000');
    cy.get('[data-testid="goal-date-input"]').type('2023-12-31');
    cy.get('[data-testid="save-goal-button"]').click();
    
    // Verify goal was created
    cy.get('[data-testid="savings-goal-list"]').should('contain', 'Vacation Fund');
    cy.get('[data-testid="savings-goal-list"]').should('contain', '$2,000.00');
    
    // Add a contribution
    cy.get('[data-testid="add-contribution-button"]').click();
    cy.get('[data-testid="contribution-amount-input"]').type('500');
    cy.get('[data-testid="contribution-date-input"]').type('2023-10-15');
    cy.get('[data-testid="save-contribution-button"]').click();
    
    // Verify progress updated
    cy.get('[data-testid="goal-progress-bar"]').should('have.attr', 'aria-valuenow', '25');
  });

  it('can use multi-account management', () => {
    // Go to Accounts page
    cy.get('[data-testid="nav-accounts"]').click();
    
    // Add new account
    cy.get('[data-testid="add-account-button"]').click();
    cy.get('[data-testid="account-name-input"]').type('Savings Account');
    cy.get('[data-testid="account-type-selector"]').click();
    cy.get('[data-testid="account-type-savings"]').click();
    cy.get('[data-testid="account-balance-input"]').type('5000');
    cy.get('[data-testid="save-account-button"]').click();
    
    // Verify account was added
    cy.get('[data-testid="account-list"]').should('contain', 'Savings Account');
    cy.get('[data-testid="account-list"]').should('contain', '$5,000.00');
    
    // Check net worth calculation
    cy.get('[data-testid="net-worth-display"]').should('be.visible');
  });

  it('can set up household collaboration', () => {
    // Go to Household page
    cy.get('[data-testid="nav-household"]').click();
    
    // Create household if not exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="create-household-button"]').length > 0) {
        cy.get('[data-testid="create-household-button"]').click();
        cy.get('[data-testid="household-name-input"]').type('Test Family');
        cy.get('[data-testid="save-household-button"]').click();
      }
    });
    
    // Invite member
    cy.get('[data-testid="invite-member-button"]').click();
    cy.get('[data-testid="member-email-input"]').type('family@example.com');
    cy.get('[data-testid="member-role-selector"]').click();
    cy.get('[data-testid="member-role-member"]').click();
    cy.get('[data-testid="send-invitation-button"]').click();
    
    // Verify invitation is pending
    cy.get('[data-testid="pending-invitations"]').should('contain', 'family@example.com');
    
    // Add shared expense
    cy.get('[data-testid="add-expense-button"]').click();
    cy.get('[data-testid="expense-description-input"]').type('Rent');
    cy.get('[data-testid="expense-amount-input"]').type('1200');
    cy.get('[data-testid="expense-split-type-selector"]').click();
    cy.get('[data-testid="split-type-equal"]').click();
    cy.get('[data-testid="save-expense-button"]').click();
    
    // Verify expense is added
    cy.get('[data-testid="shared-expenses-list"]').should('contain', 'Rent');
    cy.get('[data-testid="shared-expenses-list"]').should('contain', '$1,200.00');
  });

  it('can generate advanced reports', () => {
    // Go to Advanced Reports page
    cy.get('[data-testid="nav-advanced-reports"]').click();
    
    // Set date range
    cy.get('[data-testid="date-range-start"]').type('2023-01-01');
    cy.get('[data-testid="date-range-end"]').type('2023-10-15');
    
    // Open filters drawer
    cy.get('[data-testid="filters-button"]').click();
    
    // Select category filter
    cy.get('[data-testid="category-filter"]').click();
    cy.get('[data-testid="category-option-food"]').click();
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Generate report
    cy.get('[data-testid="generate-report-button"]').click();
    
    // Verify report sections
    cy.get('[data-testid="report-summary-cards"]').should('be.visible');
    cy.get('[data-testid="report-main-chart"]').should('be.visible');
    
    // Export report
    cy.get('[data-testid="export-csv-button"]').click();
    
    // Save report
    cy.get('[data-testid="save-report-button"]').click();
    cy.get('[data-testid="report-name-input"]').type('Food Expenses 2023');
    cy.get('[data-testid="confirm-save-report-button"]').click();
    
    // Verify report was saved
    cy.get('[data-testid="saved-reports-tab"]').click();
    cy.get('[data-testid="saved-reports-list"]').should('contain', 'Food Expenses 2023');
  });
});