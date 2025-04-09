import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon, 
  Backdrop, 
  useTheme, 
  Zoom,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PaymentsIcon from '@mui/icons-material/Payments';
import QuickAddTransactionDialog from '../transactions/QuickAddTransactionDialog';

/**
 * Mobile Floating Action Button component
 * 
 * Provides quick access to common actions from anywhere in the app on mobile devices.
 * Primary actions include adding transactions, bills, and savings goals.
 */
const MobileFAB = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  // Hide FAB on specific routes where it might interfere with other UI elements
  const hideFAB = [
    '/login',
    '/register'
  ].includes(location.pathname);
  
  if (hideFAB) {
    return null;
  }
  
  const handleOpen = () => {
    setOpen(true);
    setTransitioning(false);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleQuickAddOpen = () => {
    setQuickAddOpen(true);
    handleClose();
  };
  
  const handleQuickAddClose = () => {
    setQuickAddOpen(false);
  };
  
  const actions = [
    { 
      icon: <ReceiptIcon />, 
      name: 'Add Transaction', 
      color: theme.palette.success.main,
      onClick: handleQuickAddOpen
    },
    { 
      icon: <PaymentsIcon />, 
      name: 'Add Bill',
      color: theme.palette.info.main,
      onClick: () => {
        setTransitioning(true);
        // Use React Router navigation instead of window.location for a smoother experience
        setTimeout(() => navigate('/bills?new=true'), 300);
      }
    },
    { 
      icon: <SavingsIcon />, 
      name: 'Add Savings Goal',
      color: theme.palette.secondary.main,
      onClick: () => {
        setTransitioning(true);
        setTimeout(() => navigate('/savings?new=true'), 300);
      }
    },
    { 
      icon: <RequestQuoteIcon />, 
      name: 'Add Budget',
      color: theme.palette.warning.main, 
      onClick: () => {
        setTransitioning(true);
        setTimeout(() => navigate('/budget?new=true'), 300);
      }
    }
  ];

  return (
    <>
      <Backdrop open={open} sx={{ zIndex: 999, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
      
      <Box sx={{ 
        position: 'fixed', 
        bottom: { xs: 16, sm: 24 }, 
        right: { xs: 16, sm: 24 }, 
        zIndex: 1000,
        transition: 'all 0.3s ease-in-out',
        transform: transitioning ? 'scale(0)' : 'scale(1)'
      }}>
        <Zoom in={!transitioning}>
          <SpeedDial
            ariaLabel="Quick actions"
            icon={<SpeedDialIcon openIcon={<AddIcon />} />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            direction="up"
            FabProps={{
              sx: {
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                boxShadow: 3,
                height: { xs: 56, sm: 64 },
                width: { xs: 56, sm: 64 }
              }
            }}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen={isMobile}
                onClick={action.onClick}
                FabProps={{
                  sx: {
                    bgcolor: open ? action.color : 'background.paper',
                    color: open ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: action.color,
                      color: 'white'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              />
            ))}
          </SpeedDial>
        </Zoom>
      </Box>
      
      {/* Quick Add Transaction Dialog */}
      <QuickAddTransactionDialog 
        open={quickAddOpen}
        onClose={handleQuickAddClose}
      />
    </>
  );
};

export default MobileFAB;