// Add any Jest setup code here
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Silence React 18 ReactDOM.render warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0].includes('ReactDOM.render is no longer supported')) {
    return;
  }
  originalConsoleError(...args);
};