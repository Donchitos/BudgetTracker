import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

/**
 * PrivateRoute component for protecting routes that require authentication
 * If the user is authenticated, it renders the child routes
 * If not, it redirects to the login page
 */
const PrivateRoute = () => {
  const { isAuthenticated, loading, token } = useSelector(state => state.auth);

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if we have a token AND we're not explicitly set to not authenticated
  // This prevents redirect loops during initialization
  const hasValidSession = token && isAuthenticated !== false;
  
  console.log('PrivateRoute - Auth state:', { isAuthenticated, hasToken: !!token, hasValidSession });
  
  // If we have a token, allow access even if isAuthenticated isn't fully resolved yet
  return hasValidSession ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;