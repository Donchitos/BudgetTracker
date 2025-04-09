/**
 * Utility to handle API URL configuration in different environments
 */

// Detect if we're running in a GitHub Codespace
const isCodespace = window.location.hostname.includes('.github.dev');

// Determine the base API URL based on environment
export const getApiUrl = () => {
  // If in Codespace environment, we need to change from localhost to the forwarded URL
  if (isCodespace) {
    // Replace the frontend port (3000) with the backend port (5000) in the current URL
    const currentUrl = window.location.href;
    const backendUrl = currentUrl.replace('3000', '5000');
    return new URL('/api', backendUrl).href;
  }
  
  // Default for local environment
  return 'http://localhost:5000/api';
};

// For direct authentication requests
export const getAuthUrl = (endpoint) => {
  return `${getApiUrl()}/auth/${endpoint}`;
};

// Export a pre-configured API URL for use throughout the app
export const API_URL = getApiUrl();