import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CategoryIcon from '@mui/icons-material/Category';
import TransactionList from '../components/transactions/TransactionList';
import AdvancedSearchPanel from '../components/transactions/AdvancedSearchPanel';
import AdvancedTransactionForm from '../components/transactions/AdvancedTransactionForm';
import CustomFieldsManager from '../components/transactions/CustomFieldsManager';
import { getTransactions } from '../redux/actions/transactionActions';
import { getCategories } from '../redux/actions/categoryActions';

/**
 * Transactions page
 * 
 * Main page for transaction management with advanced features
 */
const Transactions = () => {
  const dispatch = useDispatch();
  
  // State variables
  const [searchOpen, setSearchOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [customFieldsOpen, setCustomFieldsOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState('all');
  
  // Transaction filters
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: null,
      endDate: null
    },
    categories: [],
    types: ['expense', 'income'],
    minAmount: '',
    maxAmount: '',
    searchQuery: '',
    tags: [],
    customFields: {}
  });
  
  // Load data
  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getCategories());
  }, [dispatch]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    
    // Update type filter based on tab
    let types = [];
    switch (newValue) {
      case 'expenses':
        types = ['expense'];
        break;
      case 'income':
        types = ['income'];
        break;
      case 'transfers':
        types = ['transfer'];
        break;
      default:
        types = ['expense', 'income', 'transfer'];
    }
    
    setFilters({
      ...filters,
      types
    });
  };
  
  // Toggle advanced search panel
  const toggleSearchPanel = () => {
    setSearchOpen(!searchOpen);
  };
  
  // Toggle transaction form
  const handleAddTransaction = () => {
    setFormOpen(true);
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle custom fields manager
  const handleCustomFieldsManager = () => {
    setCustomFieldsOpen(true);
    handleMenuClose();
  };
  
  // Handle filter update
  const handleFilterUpdate = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters
    });
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View, search, and manage all your financial transactions in one place.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTransaction}
              sx={{ mr: 1 }}
            >
              Add Transaction
            </Button>
            
            <Tooltip title="Transaction Options">
              <Button
                variant="outlined"
                size="medium"
                onClick={handleMenuOpen}
              >
                <MoreVertIcon />
              </Button>
            </Tooltip>
            
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={toggleSearchPanel}>
                <ListItemIcon>
                  <TuneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Advanced Search</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleCustomFieldsManager}>
                <ListItemIcon>
                  <CategoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Custom Fields</ListItemText>
              </MenuItem>
              
              <Divider />
              
              <MenuItem>
                <ListItemIcon>
                  <FileDownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export Transactions</ListItemText>
              </MenuItem>
              
              <MenuItem>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Transaction Settings</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Transactions" value="all" />
            <Tab label="Expenses" value="expenses" />
            <Tab label="Income" value="income" />
            <Tab label="Transfers" value="transfers" />
          </Tabs>
        </Paper>
        
        {searchOpen && (
          <AdvancedSearchPanel 
            filters={filters} 
            onFilterChange={handleFilterUpdate} 
            onClose={toggleSearchPanel} 
          />
        )}
        
        <TransactionList
          filters={filters}
          onFilterChange={handleFilterUpdate}
        />
        
        {/* Transaction Form Dialog */}
        <AdvancedTransactionForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
        />
        
        {/* Custom Fields Manager Dialog */}
        {customFieldsOpen && (
          <Box 
            sx={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1300,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3
            }}
            onClick={() => setCustomFieldsOpen(false)}
          >
            <Box 
              sx={{ 
                maxWidth: 800,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: 1,
                boxShadow: 24
              }}
              onClick={e => e.stopPropagation()}
            >
              <CustomFieldsManager />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, bgcolor: 'background.paper' }}>
                <Button 
                  variant="contained" 
                  onClick={() => setCustomFieldsOpen(false)}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Transactions;