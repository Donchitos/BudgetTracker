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
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;