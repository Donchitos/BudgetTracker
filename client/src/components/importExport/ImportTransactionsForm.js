import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { 
  validateImportFile, 
  importTransactions,
  clearImportExportStatus 
} from '../../redux/actions/importExportActions';

// Stepper steps
const steps = ['Upload File', 'Map Columns', 'Import'];

const ImportTransactionsForm = () => {
  const dispatch = useDispatch();
  const { loading, fileValidation, error } = useSelector(state => state.importExport);
  
  // Reference to file input
  const fileInputRef = useRef(null);
  
  // State for form fields
  const [file, setFile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [columnMapping, setColumnMapping] = useState({
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
    typeColumn: '',
    categoryColumn: '',
    notesColumn: ''
  });
  const [importOptions, setImportOptions] = useState({
    dateFormat: 'MM/DD/YYYY',
    defaultType: 'expense'
  });
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Reset file validation
      dispatch(clearImportExportStatus());
    }
  };
  
  // Handle file upload for validation
  const handleValidateFile = async () => {
    if (!file) return;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await dispatch(validateImportFile(formData));
      // If successful, go to next step
      setActiveStep(1);
    } catch (err) {
      console.error('Error validating file:', err);
    }
  };
  
  // Handle column mapping change
  const handleMappingChange = (e) => {
    const { name, value } = e.target;
    setColumnMapping(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle import options change
  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    setImportOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle import submission
  const handleImport = async () => {
    if (!file) return;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Add column mapping to form data
    Object.keys(columnMapping).forEach(key => {
      if (columnMapping[key]) {
        formData.append(key, columnMapping[key]);
      }
    });
    
    // Add import options to form data
    Object.keys(importOptions).forEach(key => {
      formData.append(key, importOptions[key]);
    });
    
    try {
      await dispatch(importTransactions(formData));
      // If successful, go to next step
      setActiveStep(2);
    } catch (err) {
      console.error('Error importing transactions:', err);
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      handleValidateFile();
    } else if (activeStep === 1) {
      handleImport();
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  
  // Handle back
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  // Handle reset
  const handleReset = () => {
    setFile(null);
    setActiveStep(0);
    setColumnMapping({
      dateColumn: '',
      descriptionColumn: '',
      amountColumn: '',
      typeColumn: '',
      categoryColumn: '',
      notesColumn: ''
    });
    setImportOptions({
      dateFormat: 'MM/DD/YYYY',
      defaultType: 'expense'
    });
    dispatch(clearImportExportStatus());
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Check if user can proceed to next step
  const canProceed = () => {
    if (activeStep === 0) {
      return !!file;
    } else if (activeStep === 1) {
      // Required fields are date, description, and amount
      return !!columnMapping.dateColumn && 
             !!columnMapping.descriptionColumn && 
             !!columnMapping.amountColumn;
    }
    return true;
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Select a CSV file containing your transactions.
            </Typography>
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="csv-file-upload"
              />
              <label htmlFor="csv-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Choose CSV File
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
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Make sure your CSV file has headers in the first row. The file should contain columns for date, description, and amount at minimum.
              </Typography>
            </Alert>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Map the columns in your CSV file to the corresponding fields.
            </Typography>
            
            {fileValidation && fileValidation.headers && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Detected {fileValidation.headers.length} columns and approximately {fileValidation.rowCount} transactions.
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {/* Required Fields */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">
                      Required Fields
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Date Column</InputLabel>
                      <Select
                        name="dateColumn"
                        value={columnMapping.dateColumn}
                        onChange={handleMappingChange}
                        label="Date Column"
                      >
                        {fileValidation.headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Description Column</InputLabel>
                      <Select
                        name="descriptionColumn"
                        value={columnMapping.descriptionColumn}
                        onChange={handleMappingChange}
                        label="Description Column"
                      >
                        {fileValidation.headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Amount Column</InputLabel>
                      <Select
                        name="amountColumn"
                        value={columnMapping.amountColumn}
                        onChange={handleMappingChange}
                        label="Amount Column"
                      >
                        {fileValidation.headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Optional Fields */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Optional Fields
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Type Column</InputLabel>
                      <Select
                        name="typeColumn"
                        value={columnMapping.typeColumn}
                        onChange={handleMappingChange}
                        label="Type Column"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileValidation.headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Category Column</InputLabel>
                      <Select
                        name="categoryColumn"
                        value={columnMapping.categoryColumn}
                        onChange={handleMappingChange}
                        label="Category Column"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileValidation.headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Notes Column</InputLabel>
                      <Select
                        name="notesColumn"
                        value={columnMapping.notesColumn}
                        onChange={handleMappingChange}
                        label="Notes Column"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileValidation.headers.map((header) => (
                          <MenuItem key={header} value={header}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                {/* Import Options */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Import Options
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Date Format</FormLabel>
                      <RadioGroup
                        name="dateFormat"
                        value={importOptions.dateFormat}
                        onChange={handleOptionsChange}
                      >
                        <FormControlLabel 
                          value="MM/DD/YYYY" 
                          control={<Radio />} 
                          label="MM/DD/YYYY (US Format)" 
                        />
                        <FormControlLabel 
                          value="DD/MM/YYYY" 
                          control={<Radio />} 
                          label="DD/MM/YYYY (European Format)" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Default Transaction Type</FormLabel>
                      <RadioGroup
                        name="defaultType"
                        value={importOptions.defaultType}
                        onChange={handleOptionsChange}
                      >
                        <FormControlLabel 
                          value="expense" 
                          control={<Radio />} 
                          label="Expense" 
                        />
                        <FormControlLabel 
                          value="income" 
                          control={<Radio />} 
                          label="Income" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Note: The importer will attempt to automatically detect transaction types based on amount signs (negative for expenses). The default type is used when type cannot be determined.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Import Complete
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your transactions have been successfully imported.
            </Typography>
            <Button
              variant="contained"
              onClick={handleReset}
              sx={{ mt: 3 }}
            >
              Import Another File
            </Button>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3 }}>
        {getStepContent(activeStep)}
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
          >
            Back
          </Button>
          
          <Box>
            {activeStep !== 2 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed() || loading}
                endIcon={loading ? <CircularProgress size={16} /> : <NavigateNextIcon />}
              >
                {activeStep === steps.length - 2 ? 'Import' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ImportTransactionsForm;