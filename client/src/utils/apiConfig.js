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
    return backendUrl;
  }
  
  // Default for local environment - without /api since api.js adds it
  return 'http://localhost:5000';
};

// For direct authentication requests (used in Login component)
export const getAuthUrl = (endpoint) => {
  return `${getApiUrl()}/api/auth/${endpoint}`;
};

// Export a pre-configured API URL for use throughout the app
export const API_URL = getApiUrl();