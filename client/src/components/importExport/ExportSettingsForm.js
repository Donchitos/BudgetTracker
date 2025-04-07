import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { exportSettings } from '../../redux/actions/importExportActions';

const ExportSettingsForm = () => {
  const dispatch = useDispatch();
  const { loading, exportStatus, error } = useSelector(state => state.importExport);
  const { categories } = useSelector(state => state.categories);
  const { budgetTemplates } = useSelector(state => state.budgetTemplates);
  const { savingsGoals } = useSelector(state => state.savings);
  const { bills } = useSelector(state => state.bills);
  
  // State for export options
  const [exportOptions, setExportOptions] = useState({
    includeCategories: true,
    includeBudgets: true,
    includeSavingsGoals: true,
    includeBills: true
  });
  
  // Handle options change
  const handleOptionsChange = (e) => {
    const { name, checked } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle export
  const handleExport = () => {
    dispatch(exportSettings(exportOptions));
  };
  
  // Check if at least one option is selected
  const isExportable = () => {
    return (
      exportOptions.includeCategories || 
      exportOptions.includeBudgets || 
      exportOptions.includeSavingsGoals || 
      exportOptions.includeBills
    );
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" gutterBottom>
          Export your app settings to a JSON file. You can use this file to back up your settings or transfer them to another device.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Categories
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {categories?.length || 0} categories available
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeCategories}
                      onChange={handleOptionsChange}
                      name="includeCategories"
                    />
                  }
                  label="Include Categories"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Budget Templates
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {budgetTemplates?.length || 0} budget templates available
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeBudgets}
                      onChange={handleOptionsChange}
                      name="includeBudgets"
                    />
                  }
                  label="Include Budget Templates"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SavingsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Savings Goals
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {savingsGoals?.length || 0} savings goals available
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeSavingsGoals}
                      onChange={handleOptionsChange}
                      name="includeSavingsGoals"
                    />
                  }
                  label="Include Savings Goals"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Bills
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {bills?.length || 0} bills available
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeBills}
                      onChange={handleOptionsChange}
                      name="includeBills"
                    />
                  }
                  label="Include Bills"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {!isExportable() && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            Please select at least one item to export.
          </Alert>
        )}
        
        {exportStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Settings exported successfully. The download should start automatically.
          </Alert>
        )}
        
        {exportStatus === 'failed' && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Failed to export settings. Please try again.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={loading || !isExportable()}
            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            Export Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExportSettingsForm;