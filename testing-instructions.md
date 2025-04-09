# BudgetTracker Testing Instructions

This document explains how to run tests for the BudgetTracker application and what to expect from the test results.

## Prerequisites

Before running tests, make sure you have installed all dependencies:

```bash
npm run install-all
```

## Testing Framework Overview

The BudgetTracker application uses a comprehensive testing stack:

1. **Jest** - For unit and integration testing
2. **React Testing Library** - For testing React components
3. **Cypress** - For end-to-end testing
4. **Redux Mock Store** - For testing Redux logic

## Running Tests

### Using the Test Runner Script

The simplest way to run tests is using the included test runner script:

```bash
# Make the script executable
chmod +x run-tests.sh

# Run all tests
./run-tests.sh

# Run only unit tests
./run-tests.sh --type unit

# Run only E2E tests
./run-tests.sh --type e2e

# Run unit tests with coverage report
./run-tests.sh --type unit --coverage

# Run unit tests in watch mode
./run-tests.sh --type unit --watch

# Run Cypress in interactive mode
./run-tests.sh --type e2e --interactive
```

### Using NPM Scripts Directly

You can also use the NPM scripts defined in package.json:

```bash
# Run Jest tests
npm test

# Run Jest tests with coverage
npm run test:coverage

# Run Jest tests in watch mode
npm run test:watch

# Open Cypress Test Runner
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run

# Run E2E tests (starts dev server automatically)
npm run test:e2e
```

## Test Structure

### Unit Tests Location

Unit tests are located alongside the components they test:

```
client/src/components/component-name/__tests__/ComponentName.test.js
```

We've implemented unit tests for our three main Priority 3 features:

1. **Multiple Account Management** - `client/src/components/accounts/__tests__/AccountManager.test.js`
2. **Enhanced Collaboration** - `client/src/components/collaboration/__tests__/HouseholdManager.test.js`
3. **Advanced Reporting** - `client/src/components/reports/__tests__/AdvancedReportGenerator.test.js`

### E2E Test Location

End-to-end tests are located in the Cypress directory:

```
cypress/e2e/budget_tracker_spec.js
```

## Sample Test Run Output

### Unit Tests

When running unit tests, you should see output similar to this:

```
> budget-tracker@1.0.0 test
> jest

 PASS  client/src/components/accounts/__tests__/AccountManager.test.js
 PASS  client/src/components/collaboration/__tests__/HouseholdManager.test.js
 PASS  client/src/components/reports/__tests__/AdvancedReportGenerator.test.js

Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        3.52 s
Ran all test suites.
```

With coverage enabled, you'll see additional statistics:

```
> budget-tracker@1.0.0 test:coverage
> jest --coverage

 PASS  client/src/components/accounts/__tests__/AccountManager.test.js
 PASS  client/src/components/collaboration/__tests__/HouseholdManager.test.js
 PASS  client/src/components/reports/__tests__/AdvancedReportGenerator.test.js

------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------|---------|----------|---------|---------|-------------------
All files         |   73.52 |    68.75 |   75.00 |   73.52 |                   
 accounts         |   82.35 |    75.00 |   83.33 |   82.35 |                   
  AccountManager.js |   82.35 |    75.00 |   83.33 |   82.35 | 145,178,210,245  
 collaboration    |   78.12 |    70.00 |   75.00 |   78.12 |                   
  HouseholdManager.js |   78.12 |    70.00 |   75.00 |   78.12 | 189,223,267,312  
 reports          |   60.10 |    61.25 |   66.67 |   60.10 |                   
  AdvancedReportGenerator.js |   60.10 |    61.25 |   66.67 |   60.10 | 211-256,289,320 
------------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        4.61 s
Ran all test suites.
```

### E2E Tests

When running Cypress tests headlessly, you should see output similar to this:

```
> budget-tracker@1.0.0 test:e2e
> start-server-and-test dev http://localhost:3000 cypress:run

1) Starting dev server with command: "npm run dev"
2) Waiting for server http://localhost:3000 to respond...
3) Starting Cypress with command: "cypress run"

====================================================================================================

  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:    12.12.0                                                                            │
  │ Browser:    Electron 106 (headless)                                                            │
  │ Specs:      1 found (budget_tracker_spec.js)                                                   │
  │ Searched:   cypress/e2e/**/*.{js,jsx,ts,tsx}                                                   │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────────────────────────────

  Running:  budget_tracker_spec.js                                                          (1 of 1)


  BudgetTracker Application
    ✓ displays dashboard components (1541ms)
    ✓ can navigate to different pages (5278ms)
    ✓ can add a transaction (3291ms)
    ✓ can create and monitor a budget (2175ms)
    ✓ can view and customize reports (3087ms)
    ✓ can create and track a savings goal (3902ms)
    ✓ can use multi-account management (2534ms)
    ✓ can set up household collaboration (4321ms)
    ✓ can generate advanced reports (3754ms)


  9 passing (30s)


  (Results)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        9                                                                                │
  │ Passing:      9                                                                                │
  │ Failing:      0                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  0                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     29 seconds                                                                       │
  │ Spec Ran:     budget_tracker_spec.js                                                           │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘

====================================================================================================

  (Run Finished)


       Spec                                              Tests  Passing  Failing  Pending  Skipped  
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔  budget_tracker_spec.js                   00:29        9        9        0        0        0 │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✔  All specs passed!                        00:29        9        9        0        0        0  
```

## Interactive Cypress Testing

When running Cypress in interactive mode, a GUI will open allowing you to:

1. See a list of test specs
2. Run tests and watch them execute in a real browser
3. See detailed results with screenshots
4. Time travel through test execution
5. Debug tests with detailed logs

This is especially useful for debugging failing tests or developing new tests.

## Continuous Integration

For CI/CD pipelines, use the following commands:

```bash
# Install dependencies
npm run install-all

# Run linting
npm run lint

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests headlessly
npm run test:e2e
```

## Best Practices

1. **Write tests as you develop**: Add tests when implementing new features.
2. **Follow the testing pyramid**: Write more unit tests than integration tests, and more integration tests than E2E tests.
3. **Test behavior, not implementation**: Focus on testing what components do, not how they do it.
4. **Use data-testid attributes**: Use data-testid for test selection to avoid coupling tests to styles or text.
5. **Mock external dependencies**: Use Jest mocks for APIs, external libraries, etc.

## Troubleshooting Common Issues

### Tests are slow to run

- Use Jest's pattern matching to run only specific tests: `npm test -- -t 'test name pattern'`
- For Cypress, run only specific tests: `npx cypress run --spec 'cypress/e2e/specific_test.js'`

### Tests fail inconsistently

- Check for race conditions or timing issues
- Ensure you're waiting for async operations to complete
- Use `waitFor` and proper assertions in React Testing Library
- Increase timeout for long-running operations

### Mocking issues

- Verify your mock implementations
- For complex scenarios, use `jest.spyOn` instead of completely replacing functions
- Check that mocks are properly restored between tests

## Next Steps

To expand test coverage:

1. Add tests for remaining components
2. Enhance test data for more comprehensive testing
3. Add performance tests for critical paths
4. Implement visual regression testing

For any questions about testing strategy or implementation, refer to the testing plan document or contact the development team.