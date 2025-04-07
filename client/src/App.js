import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';

// Redux actions
import { loadUser } from './redux/actions/authActions';

// Layout
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routes/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';

const App = () => {
  const dispatch = useDispatch();

  // Load user when app mounts
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Protected routes - will only be accessible if authenticated */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories" element={<Categories />} />
          </Route>
        </Route>
      </Routes>
    </Box>
  );
};

export default App;