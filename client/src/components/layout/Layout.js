import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileFAB from './MobileFAB';
import { useIsMobile } from '../../utils/responsiveUtils';

const Layout = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <Navbar />
      <Box component="main" sx={{
        flexGrow: 1,
        py: isMobile ? 2 : 3,
        px: isMobile ? 1 : 2,
        mt: { xs: 14, sm: 16 }, // Significantly increased margin top to avoid navbar overlap
        mb: isMobile ? 7 : 0 // Add margin bottom on mobile for FAB
      }}>
        <Container maxWidth="lg" sx={{ px: isMobile ? 1 : 2 }}>
          <Outlet />
        </Container>
      </Box>
      
      {/* Mobile FAB for quick actions */}
      <MobileFAB />
      
      <Footer />
    </>
  );
};

export default Layout;