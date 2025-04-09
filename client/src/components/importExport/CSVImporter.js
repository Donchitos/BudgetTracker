import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import Papa from 'papaparse';
import { format } from 'date-fns';

/**
 * Component for importing transaction data from CSV files
 * with mapping, validation, and duplicate detection
 */
const CSVImporter = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  // Get categories and existing transactions from Redux
  const { categories } = useSelector(state => state.category);
  const { transactions } = useSelector(state => state.transaction);
  
  // State for CSV import
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState({});
  const [transactionsToImport, setTransactionsToImport] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [importSettings, setImportSettings] = useState({
    skipFirstRow: true,
    dateFormat: 'MM/DD/YYYY',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    defaultCategory: '',
    detectDuplicates: true
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [importRules, setImportRules] = useState([]);
  
  // Define required fields
  const requiredFields = ['date', 'amount', 'description'];
  
  // Define date format options
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' }
  ];
  
  // Load import rules on mount
  useEffect(() => {
    // In a real app, this would fetch rules from backend
    // For this implementation, we'll use sample rules
    const sampleRules = [
      {
        id: '1',
        name: 'Grocery Stores',
        pattern: 'GROCERY|SUPERMARKET|FOOD MART',
        fieldToMatch: 'description',
        categoryId: categories?.find(c => c.name === 'Groceries')?._id || '',
        isRegex: true,
        isActive: true
      },
      {
        id: '2',
        name: 'Restaurants',
        pattern: 'RESTAURANT|CAFE|COFFEE|PIZZA|BURGER',
        fieldToMatch: 'description',
        categoryId: categories?.find(c => c.name === 'Dining Out')?._id || '',
        isRegex: true,
        isActive: true
      },
      {
        id: '3',
        name: 'Rent Payment',
        pattern: 'RENT',
        fieldToMatch: 'description',
        categoryId: categories?.find(c => c.name === 'Housing')?._id || '',
        isRegex: false,
        isActive: true
      }
    ];
    
    setImportRules(sampleRules);
  }, [categories]);
  
  // Handle file selection
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Parse CSV file
      Papa.parse(selectedFile, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setCsvData(results.data);
            
            // Extract headers from first row if it exists
            if (results.data.length > 0) {
              setHeaders(results.data[0]);
            }
            
            // Clear any previous error
            setError(null);
            
            // Move to next step
            setActiveStep(1);
          } else {
            setError('The CSV file appears to be empty.');
          }
        },
        error: (error) => {
          setError(`Error parsing CSV file: ${error.message}`);
        }
      });
    }
  };
  
  // Handle mapping change
  const handleMappingChange = (csvHeader, transactionField) => {
    setMappings(prev => ({
      ...prev,
      [csvHeader]: transactionField
    }));
  };
  
  // Handle import settings change
  const handleSettingChange = (setting, value) => {
    setImportSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Continue to mapping validation
  const handleContinueToValidation = () => {
    // Validate mappings
    const missingFields = requiredFields.filter(field => 
      !Object.values(mappings).includes(field)
    );
    
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      // Process CSV data into transactions
      const processedTransactions = processTransactions();
      setTransactionsToImport(processedTransactions);
      
      // Detect potential duplicates
      if (importSettings.detectDuplicates) {
        const potentialDuplicates = detectDuplicates(processedTransactions);
        setDuplicates(potentialDuplicates);
      } else {
        setDuplicates([]);
      }
      
      // Clear error
      setError(null);
      
      // Move to next step
      setActiveStep(2);
    } catch (err) {
      setError(`Error processing transactions: ${err.message}`);
    }
  };
  
  // Process CSV data into transactions
  const processTransactions = () => {
    // Skip header row if specified
    const dataToProcess = importSettings.skipFirstRow && hasHeader ? 
      csvData.slice(1) : csvData;
    
    // Create a mapping from CSV columns to transaction fields
    const processedTransactions = dataToProcess.map((row, index) => {
      const transaction = {
        _importRowIndex: index + (importSettings.skipFirstRow && hasHeader ? 1 : 0),
        _importWarnings: []
      };
      
      // Map each field based on the user's mappings
      Object.entries(mappings).forEach(([csvHeader, transactionField]) => {
        if (!transactionField) return; // Skip unmapped fields
        
        const headerIndex = headers.indexOf(csvHeader);
        if (headerIndex === -1) return; // Header not found
        
        const value = row[headerIndex]?.trim() || '';
        
        // Process value based on field type
        switch (transactionField) {
          case 'date':
            try {
              // Convert to Date object based on selected format
              const dateParts = extractDateParts(value, importSettings.dateFormat);
              if (dateParts) {
                transaction.date = new Date(
                  dateParts.year, 
                  dateParts.month - 1, 
                  dateParts.day
                ).toISOString();
              } else {
                transaction._importWarnings.push(`Invalid date format: ${value}`);
              }
            } catch (e) {
              transaction._importWarnings.push(`Invalid date: ${value}`);
            }
            break;
            
          case 'amount':
            try {
              // Process amount based on separators
              const cleanedValue = value
                .replace(new RegExp(`\\${importSettings.thousandsSeparator}`, 'g'), '')
                .replace(importSettings.decimalSeparator, '.');
              
              const amount = parseFloat(cleanedValue);
              if (isNaN(amount)) {
                transaction._importWarnings.push(`Invalid amount: ${value}`);
              } else {
                transaction.amount = Math.abs(amount);
                
                // Set transaction type based on amount sign
                if (cleanedValue.trim().startsWith('-')) {
                  transaction.type = 'expense';
                } else {
                  transaction.type = 'income';
                }
              }
            } catch (e) {
              transaction._importWarnings.push(`Invalid amount: ${value}`);
            }
            break;
            
          case 'description':
            transaction.description = value;
            break;
            
          case 'category':
            // Try to find matching category
            const matchingCategory = categories?.find(cat => 
              cat.name.toLowerCase() === value.toLowerCase()
            );
            
            if (matchingCategory) {
              transaction.category = matchingCategory._id;
            } else if (value) {
              transaction._importWarnings.push(`Unknown category: ${value}`);
            }
            break;
            
          case 'notes':
            transaction.notes = value;
            break;
            
          default:
            // Handle other fields as needed
            transaction[transactionField] = value;
        }
      });
      
      // Apply automatic category assignment using import rules
      if (!transaction.category) {
        const categoryId = applyImportRules(transaction);
        if (categoryId) {
          transaction.category = categoryId;
        } else if (importSettings.defaultCategory) {
          transaction.category = importSettings.defaultCategory;
        }
      }
      
      return transaction;
    });
    
    return processedTransactions;
  };
  
  // Extract date parts based on format
  const extractDateParts = (dateString, format) => {
    if (!dateString) return null;
    
    const formatParts = format.split(/[/\-]/);
    const dateParts = dateString.split(/[/\-]/);
    
    if (formatParts.length !== dateParts.length) return null;
    
    const result = {};
    
    for (let i = 0; i < formatParts.length; i++) {
      const part = formatParts[i].toUpperCase();
      if (part.includes('MM')) {
        result.month = parseInt(dateParts[i], 10);
      } else if (part.includes('DD')) {
        result.day = parseInt(dateParts[i], 10);
      } else if (part.includes('YYYY')) {
        result.year = parseInt(dateParts[i], 10);
      }
    }
    
    // Validate
    if (!result.year || !result.month || !result.day) return null;
    if (result.month < 1 || result.month > 12) return null;
    if (result.day < 1 || result.day > 31) return null;
    
    return result;
  };
  
  // Apply import rules to automatically categorize transactions
  const applyImportRules = (transaction) => {
    if (!importRules || !transaction.description) return null;
    
    for (const rule of importRules) {
      if (!rule.isActive) continue;
      
      const fieldValue = transaction[rule.fieldToMatch] || '';
      
      if (rule.isRegex) {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(fieldValue)) {
          return rule.categoryId;
        }
      } else {
        if (fieldValue.toLowerCase().includes(rule.pattern.toLowerCase())) {
          return rule.categoryId;
        }
      }
    }
    
    return null;
  };
  
  // Detect potential duplicates
  const detectDuplicates = (newTransactions) => {
    if (!transactions || !newTransactions) return [];
    
    const duplicates = [];
    
    // Check each new transaction against existing ones
    newTransactions.forEach((newTx, index) => {
      // Skip transactions with warnings
      if (newTx._importWarnings.length > 0) return;
      
      const possibleDuplicates = transactions.filter(existingTx => {
        // Check if amount matches
        const amountMatches = Math.abs(existingTx.amount - newTx.amount) < 0.01;
        
        // Check if date is close (within 3 days)
        const newDate = new Date(newTx.date);
        const existingDate = new Date(existingTx.date);
        const dateDiff = Math.abs(newDate - existingDate) / (1000 * 60 * 60 * 24); // diff in days
        const dateMatches = dateDiff <= 3;
        
        // Check if description is similar
        const descriptionMatches = 
          newTx.description && 
          existingTx.description && 
          (newTx.description.toLowerCase().includes(existingTx.description.toLowerCase()) ||
           existingTx.description.toLowerCase().includes(newTx.description.toLowerCase()));
        
        // Consider it a duplicate if all criteria match
        return amountMatches && dateMatches && descriptionMatches;
      });
      
      if (possibleDuplicates.length > 0) {
        duplicates.push({
          importIndex: index,
          transaction: newTx,
          possibleDuplicates
        });
      }
    });
    
    return duplicates;
  };
  
  // Mark transaction as duplicate/not duplicate
  const toggleDuplicate = (importIndex) => {
    setTransactionsToImport(prev => 
      prev.map((tx, index) => 
        index === importIndex ? 
          { ...tx, _isDuplicate: !tx._isDuplicate } : 
          tx
      )
    );
  };
  
  // Start the import process
  const handleStartImport = () => {
    setImporting(true);
    setImportProgress(0);
    setImportResult(null);
    
    // Filter out transactions with warnings or marked as duplicates
    const validTransactions = transactionsToImport.filter(tx => 
      tx._importWarnings.length === 0 && !tx._isDuplicate
    );
    
    // Prepare for import
    const totalCount = validTransactions.length;
    let importedCount = 0;
    let failedCount = 0;
    
    // Simulate batch import with progress
    const batchSize = 10;
    const totalBatches = Math.ceil(totalCount / batchSize);
    
    const importBatch = (batchIndex) => {
      if (batchIndex >= totalBatches) {
        // Import completed
        setImporting(false);
        setImportResult({
          totalCount,
          importedCount,
          failedCount
        });
        return;
      }
      
      // Get current batch
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, totalCount);
      const batch = validTransactions.slice(start, end);
      
      // Simulate API call to import batch
      setTimeout(() => {
        // Update counts
        importedCount += batch.length;
        
        // Update progress
        const progress = Math.round((importedCount / totalCount) * 100);
        setImportProgress(progress);
        
        // Process next batch
        importBatch(batchIndex + 1);
      }, 500);
    };
    
    // Start the import process
    importBatch(0);
  };
  
  // Reset the import process
  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMappings({});
    setTransactionsToImport([]);
    setDuplicates([]);
    setImportProgress(0);
    setImporting(false);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format a sample transaction
  const formatSampleTransaction = (transaction) => {
    if (!transaction) return 'No data';
    
    return Object.entries(transaction)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        if (key === 'date' && value) {
          return `${key}: ${format(new Date(value), 'yyyy-MM-dd')}`;
        }
        if (key === 'category' && categories) {
          const category = categories.find(c => c._id === value);
          return `${key}: ${category ? category.name : value}`;
        }
        return `${key}: ${value}`;
      })
      .join(', ');
  };
  
  // Toggle settings dialog
  const toggleSettingsDialog = () => {
    setSettingsDialogOpen(!settingsDialogOpen);
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          CSV Transaction Importer
        </Typography>
        
        <Box>
          <Tooltip title="Import Settings">
            <IconButton 
              color="inherit"
              onClick={toggleSettingsDialog}
              sx={{ mr: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ p: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select File */}
          <Step>
            <StepLabel>
              Select CSV File
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload a CSV file containing your transaction data. 
                The file should include transaction date, amount, and description at minimum.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select CSV File
                </Button>
                
                {file && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </Typography>
                )}
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </StepContent>
          </Step>
          
          {/* Step 2: Map Fields */}
          <Step>
            <StepLabel>
              Map Fields
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                Map the columns in your CSV file to the corresponding transaction fields.
                Date, amount, and description are required.
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                  />
                }
                label="First row contains headers"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={importSettings.skipFirstRow}
                    onChange={(e) => handleSettingChange('skipFirstRow', e.target.checked)}
                  />
                }
                label="Skip first row when importing"
              />
              
              {csvData.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sample data:
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {csvData[0].map((cell, index) => (
                            <TableCell key={index}>
                              <strong>Column {index + 1}</strong>
                              {hasHeader && <Box component="span" sx={{ display: 'block' }}>{cell}</Box>}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {csvData.slice(hasHeader ? 1 : 0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Field Mapping:
              </Typography>
              
              <Grid container spacing={2}>
                {headers.map((header, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{header || `Column ${index + 1}`}</InputLabel>
                      <Select
                        value={mappings[header] || ''}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        label={header || `Column ${index + 1}`}
                      >
                        <MenuItem value="">
                          <em>Don't import</em>
                        </MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="description">Description</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="notes">Notes</MenuItem>
                        <MenuItem value="type">Transaction Type</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Date Format:
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={importSettings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    label="Date Format"
                  >
                    {dateFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Default Category (optional):
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Default Category</InputLabel>
                  <Select
                    value={importSettings.defaultCategory}
                    onChange={(e) => handleSettingChange('defaultCategory', e.target.value)}
                    label="Default Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {categories?.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => setActiveStep(0)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleContinueToValidation}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 3: Review & Import */}
          <Step>
            <StepLabel>
              Review & Import
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                Review your transactions before importing. We'll detect potential duplicates 
                and highlight any issues.
              </Typography>
              
              {/* Import summary */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: theme.palette.success.main + '10' }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Ready to Import
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {transactionsToImport.filter(tx => 
                          tx._importWarnings.length === 0 && !tx._isDuplicate
                        ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        transactions ready to be imported
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: theme.palette.warning.main + '10' }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Potential Duplicates
                      </Typography>
                      <Typography variant="h5" color="warning.main">
                        {duplicates.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        transactions may already exist
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: theme.palette.error.main + '10' }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Problems
                      </Typography>
                      <Typography variant="h5" color="error.main">
                        {transactionsToImport.filter(tx => tx._importWarnings.length > 0).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        transactions have validation issues
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Transactions preview */}
              {transactionsToImport.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transactions Preview:
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactionsToImport.map((tx, index) => {
                          const hasDuplicate = duplicates.some(d => d.importIndex === index);
                          const hasWarnings = tx._importWarnings.length > 0;
                          
                          return (
                            <TableRow
                              key={index}
                              sx={{
                                bgcolor: tx._isDuplicate ? theme.palette.warning.main + '20' :
                                        hasWarnings ? theme.palette.error.main + '20' : 
                                        'inherit'
                              }}
                            >
                              <TableCell>
                                {tx.date ? format(new Date(tx.date), 'yyyy-MM-dd') : 'N/A'}
                              </TableCell>
                              <TableCell>{tx.description || 'N/A'}</TableCell>
                              <TableCell align="right">
                                {tx.amount ? `$${tx.amount.toFixed(2)}` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {tx.category ? 
                                  categories?.find(c => c._id === tx.category)?.name || 'Unknown' : 
                                  'Uncategorized'}
                              </TableCell>
                              <TableCell>{tx.type || 'N/A'}</TableCell>
                              <TableCell>
                                {hasWarnings ? (
                                  <Tooltip title={tx._importWarnings.join(', ')}>
                                    <Chip 
                                      label="Error" 
                                      size="small" 
                                      color="error" 
                                      icon={<WarningIcon />} 
                                    />
                                  </Tooltip>
                                ) : tx._isDuplicate ? (
                                  <Chip 
                                    label="Skipped" 
                                    size="small" 
                                    color="warning" 
                                  />
                                ) : hasDuplicate ? (
                                  <Tooltip title="Possible duplicate detected">
                                    <Chip 
                                      label="Duplicate?" 
                                      size="small" 
                                      color="warning" 
                                      icon={<WarningIcon />} 
                                    />
                                  </Tooltip>
                                ) : (
                                  <Chip 
                                    label="Ready" 
                                    size="small" 
                                    color="success" 
                                    icon={<CheckCircleIcon />} 
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {hasDuplicate && (
                                  <Tooltip title={tx._isDuplicate ? "Mark as unique" : "Mark as duplicate"}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => toggleDuplicate(index)}
                                    >
                                      {tx._isDuplicate ? <RefreshIcon /> : <DeleteIcon />}
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              {/* Duplicates detail */}
              {duplicates.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Potential Duplicates:
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    The following transactions appear to be duplicates of existing transactions.
                    Review carefully before importing.
                  </Alert>
                  
                  {duplicates.map((dupe, index) => {
                    const tx = dupe.transaction;
                    const isDuplicate = transactionsToImport[dupe.importIndex]?._isDuplicate;
                    
                    return (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{ 
                          p: 2, 
                          mb: 2,
                          bgcolor: isDuplicate ? theme.palette.warning.main + '10' : 'inherit'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">
                            New Transaction:
                          </Typography>
                          <Button
                            size="small"
                            startIcon={isDuplicate ? <RefreshIcon /> : <DeleteIcon />}
                            color={isDuplicate ? 'primary' : 'warning'}
                            onClick={() => toggleDuplicate(dupe.importIndex)}
                          >
                            {isDuplicate ? 'Mark as Unique' : 'Skip (Duplicate)'}
                          </Button>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {formatSampleTransaction(tx)}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Possible matching transactions already in your account:
                        </Typography>
                        
                        {dupe.possibleDuplicates.map((existingTx, i) => (
                          <Box key={i} sx={{ mb: i < dupe.possibleDuplicates.length - 1 ? 1 : 0 }}>
                            <Typography variant="body2">
                              {formatSampleTransaction(existingTx)}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    );
                  })}
                </Box>
              )}
              
              {/* Import progress and results */}
              {importing && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Importing: {importProgress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={importProgress} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              )}
              
              {importResult && (
                <Alert 
                  severity={importResult.failedCount > 0 ? 'warning' : 'success'}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="subtitle2">
                    Import Complete
                  </Typography>
                  <Typography variant="body2">
                    Successfully imported {importResult.importedCount} of {importResult.totalCount} transactions.
                    {importResult.failedCount > 0 && ` ${importResult.failedCount} transactions failed.`}
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => setActiveStep(1)}
                  disabled={importing}
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleReset}
                  disabled={importing}
                >
                  Start Over
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={importing ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleStartImport}
                  disabled={importing || importResult || transactionsToImport.filter(tx => 
                    tx._importWarnings.length === 0 && !tx._isDuplicate
                  ).length === 0}
                >
                  {importing ? 'Importing...' : importResult ? 'Import Complete' : 'Import Transactions'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
      
      {/* Import Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={toggleSettingsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Import Settings
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                CSV Parsing Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={importSettings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    label="Date Format"
                  >
                    {dateFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Format of dates in your CSV file</FormHelperText>
                </FormControl>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Decimal Separator</InputLabel>
                  <Select
                    value={importSettings.decimalSeparator}
                    onChange={(e) => handleSettingChange('decimalSeparator', e.target.value)}
                    label="Decimal Separator"
                  >
                    <MenuItem value=".">Period (.)</MenuItem>
                    <MenuItem value=",">Comma (,)</MenuItem>
                  </Select>
                  <FormHelperText>Character used to separate decimal places</FormHelperText>
                </FormControl>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Thousands Separator</InputLabel>
                  <Select
                    value={importSettings.thousandsSeparator}
                    onChange={(e) => handleSettingChange('thousandsSeparator', e.target.value)}
                    label="Thousands Separator"
                  >
                    <MenuItem value=",">Comma (,)</MenuItem>
                    <MenuItem value=".">Period (.)</MenuItem>
                    <MenuItem value=" ">Space ( )</MenuItem>
                    <MenuItem value="">None</MenuItem>
                  </Select>
                  <FormHelperText>Character used to separate thousands</FormHelperText>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={importSettings.detectDuplicates}
                      onChange={(e) => handleSettingChange('detectDuplicates', e.target.checked)}
                    />
                  }
                  label="Detect duplicate transactions"
                />
                <FormHelperText>
                  Warns you if imported transactions already exist in your account
                </FormHelperText>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Import Rules
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Rules automatically categorize transactions during import based on their description.
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Active Rules
                </Typography>
                
                {importRules.filter(rule => rule.isActive).map((rule) => {
                  const category = categories?.find(c => c._id === rule.categoryId);
                  
                  return (
                    <Chip
                      key={rule.id}
                      label={`${rule.name}: ${category?.name || 'Unknown'}`}
                      sx={{ m: 0.5 }}
                    />
                  );
                })}
                
                {importRules.filter(rule => rule.isActive).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No active rules. Create rules to automatically categorize transactions.
                  </Typography>
                )}
              </Paper>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  // This would open a rule management dialog in a real app
                  alert('Rule management would open here in a complete application');
                }}
              >
                Manage Import Rules
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={toggleSettingsDialog}>
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={toggleSettingsDialog}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CSVImporter;