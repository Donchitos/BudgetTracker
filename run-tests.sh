#!/bin/bash

# Colors for console output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print a heading
print_heading() {
  echo -e "\n${BLUE}===================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===================================${NC}\n"
}

# Function to print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print info message
print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# Function to run Jest tests
run_jest_tests() {
  print_heading "Running Jest Unit Tests"
  
  if [ "$COVERAGE" = true ]; then
    print_info "Generating coverage report"
    npm run test:coverage
  elif [ "$WATCH" = true ]; then
    print_info "Running tests in watch mode"
    npm run test:watch
  else
    npm test
  fi
  
  if [ $? -eq 0 ]; then
    print_success "Unit tests completed successfully"
  else
    print_error "Unit tests failed"
    TEST_FAILED=true
  fi
}

# Function to run Cypress tests
run_cypress_tests() {
  print_heading "Running Cypress E2E Tests"
  
  if [ "$INTERACTIVE" = true ]; then
    print_info "Opening Cypress test runner"
    npm run cypress:open
  else
    print_info "Running Cypress tests headlessly"
    npm run test:e2e
  fi
  
  if [ $? -eq 0 ]; then
    print_success "E2E tests completed successfully"
  else
    print_error "E2E tests failed"
    TEST_FAILED=true
  fi
}

# Initialize variables
TYPE="all"
WATCH=false
COVERAGE=false
INTERACTIVE=false
TEST_FAILED=false

# Parse command line arguments
while (( "$#" )); do
  case "$1" in
    --type)
      TYPE="$2"
      shift 2
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --interactive)
      INTERACTIVE=true
      shift
      ;;
    --help)
      echo "BudgetTracker Test Runner"
      echo ""
      echo "Usage: ./run-tests.sh [options]"
      echo ""
      echo "Options:"
      echo "  --type <unit|e2e|all>  Type of tests to run (default: all)"
      echo "  --watch               Run unit tests in watch mode"
      echo "  --coverage            Generate coverage report for unit tests"
      echo "  --interactive         Run Cypress in interactive mode"
      echo "  --help                Show this help message"
      exit 0
      ;;
    *)
      print_error "Unknown option: $1"
      echo "Run with --help for usage information"
      exit 1
      ;;
  esac
done

# Welcome message
print_heading "BudgetTracker Test Runner"
print_info "Test type: $TYPE"

# Run tests based on type
if [ "$TYPE" = "unit" ] || [ "$TYPE" = "all" ]; then
  run_jest_tests
fi

if [ "$TYPE" = "e2e" ] || [ "$TYPE" = "all" ]; then
  run_cypress_tests
fi

# Final result
echo ""
if [ "$TEST_FAILED" = true ]; then
  print_error "One or more test suites failed!"
  exit 1
else
  print_success "All tests passed successfully!"
  exit 0
fi