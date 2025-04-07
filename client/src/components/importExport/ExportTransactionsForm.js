import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DownloadIcon from '@mui/icons-material/Download';
import { exportTransactions } from '../../redux/actions/importExportActions';
import { getCategories } from '../../redux/actions/categoryActions';

const ExportTransactionsForm = () => {
  const dispatch = useDispatch();
  const { loading, exportStatus } = useSelector(state => state.importExport);
  const { categories } = useSelector(state => state.categories);
  
  // State for export options
  const [exportOptions, setExportOptions] = useState({
    startDate: null,
    endDate: null,
    category: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    sortOrder: 'desc',
    includeId: false,
    limit: 1000
  });
  
  // Load categories when component mounts
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);
  
  // Handle options change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle date change
  const handleDateChange = (date, field) => {
    setExportOptions(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  // Handle export
  const handleExport = () => {
    const options = { ...exportOptions };
    
    // Format dates for API
    if (options.startDate) {
      options.startDate = options.startDate.toISOString().split('T')[0];
    }
    if (options.endDate) {
      options.endDate = options.endDate.toISOString().split('T')[0];
    }
    
    // Remove empty values
    Object.keys(options).forEach(key => {
      if (options[key] === '' || options[key] === null) {
        delete options[key];
      }
    });
    
    dispatch(exportTransactions(options));
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setExportOptions({
      startDate: null,
      endDate: null,
      category: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      sortOrder: 'desc',
      includeId: false,
      limit: 1000
    });
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Export Filters
        </Typography>
        
        <Grid container spacing={3}>
          {/* Date Range */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={exportOptions.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={exportOptions.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Category and Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={exportOptions.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem 
                    key={category._id} 
                    value={category._id}
                    sx={{ 
                      '&::before': {
                        content: '""',
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: category.color || '#ccc',
                        marginRight: '8px'
                      }
                    }}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                name="type"
                value={exportOptions.type}
                onChange={handleChange}
                label="Transaction Type"
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                <MenuItem value="expense">Expenses</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Amount Range */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="minAmount"
              label="Minimum Amount"
              type="number"
              fullWidth
              value={exportOptions.minAmount}
              onChange={handleChange}
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="maxAmount"
              label="Maximum Amount"
              type="number"
              fullWidth
              value={exportOptions.maxAmount}
              onChange={handleChange}
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>
          
          {/* Export Options */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Export Options
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sort Order</InputLabel>
              <Select
                name="sortOrder"
                value={exportOptions.sortOrder}
                onChange={handleChange}
                label="Sort Order"
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="limit"
              label="Max Records (1-5000)"
              type="number"
              fullWidth
              value={exportOptions.limit}
              onChange={handleChange}
              InputProps={{
                inputProps: { min: 1, max: 5000 }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeId}
                    onChange={handleChange}
                    name="includeId"
                  />
                }
                label="Include Transaction IDs in export"
              />
            </FormGroup>
          </Grid>
          
          {/* Applied Filters */}
          {(exportOptions.startDate || 
            exportOptions.endDate || 
            exportOptions.category || 
            exportOptions.type || 
            exportOptions.minAmount || 
            exportOptions.maxAmount) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Active Filters:
                </Typography>
                
                {exportOptions.startDate && (
                  <Chip 
                    size="small" 
                    label={`From ${exportOptions.startDate.toLocaleDateString()}`} 
                    onDelete={() => handleDateChange(null, 'startDate')}
                  />
                )}
                
                {exportOptions.endDate && (
                  <Chip 
                    size="small" 
                    label={`To ${exportOptions.endDate.toLocaleDateString()}`} 
                    onDelete={() => handleDateChange(null, 'endDate')}
                  />
                )}
                
                {exportOptions.category && (
                  <Chip 
                    size="small" 
                    label={`Category: ${categories.find(c => c._id === exportOptions.category)?.name || 'Selected'}`} 
                    onDelete={() => handleChange({ target: { name: 'category', value: '' } })}
                  />
                )}
                
                {exportOptions.type && (
                  <Chip 
                    size="small" 
                    label={`Type: ${exportOptions.type === 'expense' ? 'Expenses' : 'Income'}`} 
                    onDelete={() => handleChange({ target: { name: 'type', value: '' } })}
                  />
                )}
                
                {exportOptions.minAmount && (
                  <Chip 
                    size="small" 
                    label={`Min: $${exportOptions.minAmount}`} 
                    onDelete={() => handleChange({ target: { name: 'minAmount', value: '' } })}
                  />
                )}
                
                {exportOptions.maxAmount && (
                  <Chip 
                    size="small" 
                    label={`Max: $${exportOptions.maxAmount}`} 
                    onDelete={() => handleChange({ target: { name: 'maxAmount', value: '' } })}
                  />
                )}
                
                <Button 
                  size="small" 
                  onClick={handleClearFilters}
                  sx={{ ml: 'auto' }}
                >
                  Clear All
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {exportStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Transactions exported successfully. The download should start automatically.
          </Alert>
        )}
        
        {exportStatus === 'failed' && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Failed to export transactions. Please try again.
          </Alert>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            Export Transactions
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExportTransactionsForm;