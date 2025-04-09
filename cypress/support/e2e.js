// ***********************************************************
// This is the main support file for Cypress E2E testing.
// It will be automatically loaded before each test file.
// ***********************************************************

// Import commands.js
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in the command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// You can add global behaviors here that will run before each test