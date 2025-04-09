// @ts-nocheck
// Comprehensive test suite for the BudgetTracker application

/**
 * Tests all major features of the BudgetTracker application
 * with a focus on user flows and mobile experience
 */
describe('BudgetTracker Complete Feature Test Suite', () => {
  // Setup test user before running tests
  before(() => {
    // Register a test user or use API to create one
    cy.visit('/register');
    cy.get('[data-testid="register-name"]').type('Comprehensive Test User');
    cy.get('[data-testid="register-email"]').type(`testuser_${Date.now()}@example.com`);
    cy.get('[data-testid="register-password"]').type('password123');
    cy.get('[data-testid="register-password2"]').type('password123');
    cy.get('[data-testid="register-submit"]').click();
    
    // Verify successful registration and logout
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
  });

  beforeEach(() => {
    // Login before each test using the custom command
    cy.login('testuser@example.com', 'password123');
  });

  // ======== PRIORITY 1 FEATURES ========
  
  describe('Priority 1 Features', () => {
    it('1. Category Budget Alerts - shows alerts when approaching budget limits', () => {
      // Set up a category with budget
      cy.setupCategory('Dining Out', 100, '#FF5722');
      
      // Add a transaction for 75% of budget
      cy.addTransaction('Restaurant dinner', 75, 'expense', 'Dining Out');
      
      // Check for warning alert on dashboard
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.get('[data-testid="category-budget-alerts"]').should('be.visible');
      cy.get('[data-testid="budget-alert-Dining Out"]').should('exist');
      cy.get('[data-testid="budget-progress-Dining Out"]').should('have.attr', 'aria-valuenow', '75');
      
      // Add another transaction to exceed budget
      cy.addTransaction('Another dinner', 30, 'expense', 'Dining Out');
      
      // Check for critical alert
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.get('[data-testid="budget-alert-Dining Out"]').should('have.class', 'critical');
    });

    it('2. Advanced Transaction Search - can filter transactions with complex criteria', () => {
      // Add some test transactions first
      cy.addTransaction('Grocery shopping', 45.67, 'expense', 'Food');
      cy.addTransaction('Salary', 2000, 'income', 'Income');
      cy.addTransaction('Gas', 35.50, 'expense', 'Transportation');
      
      // Go to transactions page
      cy.get('[data-testid="nav-transactions"]').click();
      
      // Open advanced search panel
      cy.get('[data-testid="open-advanced-search"]').click();
      
      // Set search filters for expenses only
      cy.get('[data-testid="transaction-type-filter"]').click();
      cy.get('[data-testid="type-option-expense"]').click();
      
      // Apply filters
      cy.get('[data-testid="apply-filters-button"]').click();
      
      // Verify only expenses are shown
      cy.get('[data-testid="transaction-list"]').should('contain', 'Grocery shopping');
      cy.get('[data-testid="transaction-list"]').should('contain', 'Gas');
      cy.get('[data-testid="transaction-list"]').should('not.contain', 'Salary');
      
      // Reset filters
      cy.get('[data-testid="reset-filters-button"]').click();
      
      // Add amount filter
      cy.get('[data-testid="min-amount-filter"]').type('40');
      cy.get('[data-testid="apply-filters-button"]').click();
      
      // Verify filtered results
      cy.get('[data-testid="transaction-list"]').should('contain', 'Grocery shopping');
      cy.get('[data-testid="transaction-list"]').should('contain', 'Salary');
      cy.get('[data-testid="transaction-list"]').should('not.contain', 'Gas');
    });

    it('3. Dashboard Customization - can rearrange and hide widgets', () => {
      // Go to dashboard
      cy.get('[data-testid="nav-dashboard"]').click();
      
      // Open customizer
      cy.get('[data-testid="open-dashboard-customizer"]').click();
      
      // Toggle a widget off
      cy.get('[data-testid="widget-toggle-ExpensePieChart"]').click();
      
      // Save customization
      cy.get('[data-testid="save-dashboard-layout"]').click();
      
      // Verify widget is hidden
      cy.get('[data-testid="expense-pie-chart"]').should('not.exist');
      
      // Open customizer again
      cy.get('[data-testid="open-dashboard-customizer"]').click();
      
      // Toggle widget back on
      cy.get('[data-testid="widget-toggle-ExpensePieChart"]').click();
      
      // Save customization
      cy.get('[data-testid="save-dashboard-layout"]').click();
      
      // Verify widget is visible again
      cy.get('[data-testid="expense-pie-chart"]').should('be.visible');
    });
  });

  // ======== MOBILE EXPERIENCE TESTS ========
  
  describe('Mobile Experience Tests', () => {
    beforeEach(() => {
      // Set viewport to mobile size
      cy.viewport('iphone-x');
    });
    
    it('1. Mobile Dashboard - properly adapts to small screens', () => {
      // Go to dashboard
      cy.get('[data-testid="nav-dashboard"]').click();
      
      // Check for mobile-specific components
      cy.get('[data-testid="mobile-dashboard"]').should('be.visible');
      cy.get('[data-testid="mobile-fab"]').should('be.visible');
      
      // Test tab navigation
      cy.get('[role="tab"]').eq(1).click(); // Click on Transactions tab
      cy.get('[role="tabpanel"]').eq(1).should('be.visible');
      
      cy.get('[role="tab"]').eq(2).click(); // Click on Budget tab
      cy.get('[role="tabpanel"]').eq(2).should('be.visible');
      
      // Test bottom navigation
      cy.get('[data-testid="bottom-nav-transactions"]').click();
      cy.url().should('include', '/transactions');
      
      // Return to dashboard
      cy.get('[data-testid="bottom-nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });
    
    it('2. Mobile Transactions - supports swipe gestures and filters', () => {
      // Go to transactions page
      cy.get('[data-testid="nav-transactions"]').click();
      
      // Test filter drawer
      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="filters-drawer"]').should('be.visible');
      
      // Apply a filter
      cy.get('[data-testid="filter-type-expense"]').click();
      cy.get('[data-testid="apply-filters-button"]').click();
      
      // Check for active filter chip
      cy.get('[data-testid="active-filter-chip"]').should('be.visible');
      
      // Add a transaction using FAB
      cy.get('[data-testid="mobile-fab"]').click();
      cy.get('[data-testid="quick-add-transaction-dialog"]').should('be.visible');
      
      // Fill out quick transaction form
      cy.get('[data-testid="transaction-description"]').type('Mobile Test');
      cy.get('[data-testid="transaction-amount"]').type('25');
      cy.get('[data-testid="save-transaction-button"]').click();
      
      // Verify transaction was added
      cy.contains('Mobile Test').should('be.visible');
    });
    
    afterEach(() => {
      // Reset viewport
      cy.viewport(1280, 720);
    });
  });
});