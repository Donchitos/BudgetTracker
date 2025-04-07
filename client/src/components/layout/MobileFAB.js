import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Tooltip,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import QuickAddTransactionDialog from '../transactions/QuickAddTransactionDialog';

/**
 * Mobile Floating Action Button component for quick actions
 * - Only shows on mobile devices
 * - Provides quick access to common actions
 */
const MobileFAB = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleQuickAddOpen = () => setQuickAddOpen(true);
  const handleQuickAddClose = () => setQuickAddOpen(false);
  
  // Common actions for quick access
  const actions = [
    {
      icon: <AttachMoneyIcon />,
      name: 'Add Transaction',
      action: () => {
        handleQuickAddOpen();
        handleClose();
      },
      color: theme.palette.primary.main
    },
    { 
      icon: <AccountBalanceWalletIcon />, 
      name: 'Add Budget', 
      action: () => navigate('/budget?new=true'),
      color: theme.palette.success.main
    },
    { 
      icon: <SavingsIcon />, 
      name: 'Add Savings Goal', 
      action: () => navigate('/savings?new=true'),
      color: theme.palette.info.main
    },
    { 
      icon: <ReceiptIcon />, 
      name: 'Add Bill', 
      action: () => navigate('/bills?new=true'),
      color: theme.palette.warning.main
    },
    { 
      icon: <CategoryIcon />, 
      name: 'Add Category', 
      action: () => navigate('/categories?new=true'),
      color: theme.palette.secondary.main
    }
  ];
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        '@media (min-width: 600px)': {
          display: 'none', // Hide on non-mobile devices
        },
      }}
    >
      <SpeedDial
        ariaLabel="Mobile actions"
        icon={<SpeedDialIcon icon={<AddIcon />} openIcon={<CloseIcon />} />}
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
          }
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={
              <Box 
                sx={{ 
                  backgroundColor: action.color,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {action.icon}
              </Box>
            }
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => {
              action.action();
              handleClose();
            }}
          />
        ))}
      </SpeedDial>
      {/* Quick Add Transaction Dialog */}
      <QuickAddTransactionDialog
        open={quickAddOpen}
        onClose={handleQuickAddClose}
      />
    </Box>
  );
};

export default MobileFAB;