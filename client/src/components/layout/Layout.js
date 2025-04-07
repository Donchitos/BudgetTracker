import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ 
        flexGrow: 1, 
        py: 3,
        mt: 8 // Add margin top to account for fixed navbar 
      }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default Layout;