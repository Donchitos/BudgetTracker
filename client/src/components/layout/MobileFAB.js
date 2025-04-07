import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
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
  const [open, setOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  
  // Hide FAB on specific routes where it might interfere with other UI elements
  const hideFAB = [
    '/login',
    '/register'
  ].includes(location.pathname);
  
  if (hideFAB) {
    return null;
  }
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
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
      onClick: handleQuickAddOpen
    },
    { 
      icon: <PaymentsIcon />, 
      name: 'Add Bill', 
      onClick: () => {
        // Navigate to bills page with form open
        window.location.href = '/bills?new=true';
      }
    },
    { 
      icon: <SavingsIcon />, 
      name: 'Add Savings Goal', 
      onClick: () => {
        // Navigate to savings page with form open
        window.location.href = '/savings?new=true';
      }
    },
    { 
      icon: <RequestQuoteIcon />, 
      name: 'Add Budget', 
      onClick: () => {
        // Navigate to budget page with form open
        window.location.href = '/budget?new=true';
      }
    }
  ];

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
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
              }
            }
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
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