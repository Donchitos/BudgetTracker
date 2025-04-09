// ***********************************************
// This file defines custom commands for Cypress
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="login-email"]').type(email);
  cy.get('[data-testid="login-password"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Add command to create a transaction
Cypress.Commands.add('addTransaction', (description, amount, type, category) => {
  cy.get('[data-testid="nav-transactions"]').click();
  cy.get('[data-testid="add-transaction-button"]').click();
  cy.get('[data-testid="transaction-description"]').type(description);
  cy.get('[data-testid="transaction-amount"]').type(amount.toString());
  cy.get(`[data-testid="transaction-type-${type}"]`).click();
  cy.get('[data-testid="transaction-category"]').click();
  cy.get(`[data-testid="category-option-${category}"]`).click();
  cy.get('[data-testid="save-transaction-button"]').click();
});

// Add command to create a category
Cypress.Commands.add('setupCategory', (name, budget, color) => {
  cy.get('[data-testid="nav-categories"]').click();
  cy.get('[data-testid="add-category-button"]').click();
  cy.get('[data-testid="category-name"]').type(name);
  cy.get('[data-testid="category-budget"]').type(budget.toString());
  if (color) {
    cy.get('[data-testid="category-color"]').invoke('val', color).trigger('change');
  }
  cy.get('[data-testid="save-category-button"]').click();
});

// Add command to check budget alert
Cypress.Commands.add('checkBudgetAlert', (categoryName, expectedStatus) => {
  cy.get('[data-testid="nav-dashboard"]').click();
  cy.get('[data-testid="category-budget-alerts"]').within(() => {
    cy.contains(categoryName).parent().should('have.attr', 'data-status', expectedStatus);
  });
});