import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { importSettings } from '../../redux/actions/importExportActions';

const ImportSettingsForm = () => {
  const dispatch = useDispatch();
  const { loading, error, importSettingsResults } = useSelector(state => state.importExport);
  
  // Reference to file input
  const fileInputRef = useRef(null);
  
  // State for file and options
  const [file, setFile] = useState(null);
  const [jsonContent, setJsonContent] = useState(null);
  const [importOptions, setImportOptions] = useState({
    includeCategories: true,
    includeBudgets: true,
    includeSavingsGoals: true,
    includeBills: true
  });
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Read and preview JSON content
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          setJsonContent(content);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          setJsonContent(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };
  
  // Handle import options change
  const handleOptionsChange = (e) => {
    const { name, checked } = e.target;
    setImportOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle import
  const handleImport = async () => {
    if (!file) return;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await dispatch(importSettings(formData));
    } catch (err) {
      console.error('Error importing settings:', err);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setFile(null);
    setJsonContent(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Validate JSON structure
  const isValidSettingsFile = () => {
    if (!jsonContent) return false;
    
    // Check for settings object
    if (!jsonContent.settings) {
      return false;
    }
    
    // Check for at least one valid settings type
    return (
      jsonContent.settings.categories ||
      jsonContent.settings.budgets ||
      jsonContent.settings.savingsGoals ||
      jsonContent.settings.bills
    );
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" gutterBottom>
          Import settings from a JSON file. This will import your categories, budgets, savings goals, and bills.
        </Typography>
        
        <Box sx={{ mt: 3, mb: 4 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="json-file-upload"
          />
          <label htmlFor="json-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Choose JSON File
            </Button>
          </label>
          
          {file && (
            <Chip
              label={file.name}
              onDelete={handleReset}
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        {file && jsonContent && (
          <Box sx={{ mb: 3 }}>
            {isValidSettingsFile() ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Valid settings file detected. Select which settings to import:
                </Alert>
                
                <FormGroup>
                  {jsonContent.settings.categories && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={importOptions.includeCategories}
                          onChange={handleOptionsChange}
                          name="includeCategories"
                        />
                      }
                      label={`Categories (${jsonContent.settings.categories.length})`}
                    />
                  )}
                  
                  {jsonContent.settings.budgets && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={importOptions.includeBudgets}
                          onChange={handleOptionsChange}
                          name="includeBudgets"
                        />
                      }
                      label={`Budget Templates (${jsonContent.settings.budgets.length})`}
                    />
                  )}
                  
                  {jsonContent.settings.savingsGoals && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={importOptions.includeSavingsGoals}
                          onChange={handleOptionsChange}
                          name="includeSavingsGoals"
                        />
                      }
                      label={`Savings Goals (${jsonContent.settings.savingsGoals.length})`}
                    />
                  )}
                  
                  {jsonContent.settings.bills && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={importOptions.includeBills}
                          onChange={handleOptionsChange}
                          name="includeBills"
                        />
                      }
                      label={`Bills (${jsonContent.settings.bills.length})`}
                    />
                  )}
                </FormGroup>
              </>
            ) : (
              <Alert severity="error">
                Invalid settings file. Please select a valid JSON file exported from Budget Tracker.
              </Alert>
            )}
          </Box>
        )}
        
        {importSettingsResults && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Import Results:
            </Typography>
            
            <List dense>
              {importSettingsResults.categories && (
                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Categories: ${importSettingsResults.categories.imported} imported`} 
                    secondary={importSettingsResults.categories.errors.length > 0 ? 
                      `${importSettingsResults.categories.errors.length} errors` : 
                      'No errors'
                    }
                  />
                  {importSettingsResults.categories.errors.length > 0 && (
                    <WarningIcon color="warning" />
                  )}
                </ListItem>
              )}
              
              {importSettingsResults.budgets && (
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Budget Templates: ${importSettingsResults.budgets.imported} imported`} 
                    secondary={importSettingsResults.budgets.errors.length > 0 ? 
                      `${importSettingsResults.budgets.errors.length} errors` : 
                      'No errors'
                    }
                  />
                  {importSettingsResults.budgets.errors.length > 0 && (
                    <WarningIcon color="warning" />
                  )}
                </ListItem>
              )}
              
              {importSettingsResults.savingsGoals && (
                <ListItem>
                  <ListItemIcon>
                    <SavingsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Savings Goals: ${importSettingsResults.savingsGoals.imported} imported`} 
                    secondary={importSettingsResults.savingsGoals.errors.length > 0 ? 
                      `${importSettingsResults.savingsGoals.errors.length} errors` : 
                      'No errors'
                    }
                  />
                  {importSettingsResults.savingsGoals.errors.length > 0 && (
                    <WarningIcon color="warning" />
                  )}
                </ListItem>
              )}
              
              {importSettingsResults.bills && (
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Bills: ${importSettingsResults.bills.imported} imported`} 
                    secondary={importSettingsResults.bills.errors.length > 0 ? 
                      `${importSettingsResults.bills.errors.length} errors` : 
                      'No errors'
                    }
                  />
                  {importSettingsResults.bills.errors.length > 0 && (
                    <WarningIcon color="warning" />
                  )}
                </ListItem>
              )}
            </List>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!file || !isValidSettingsFile() || loading || 
              !(importOptions.includeCategories || 
                importOptions.includeBudgets || 
                importOptions.includeSavingsGoals || 
                importOptions.includeBills)}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Import Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ImportSettingsForm;