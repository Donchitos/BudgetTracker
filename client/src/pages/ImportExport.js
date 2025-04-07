import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Card,
  CardContent,
  CardActions,
  LinearProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import { 
  exportTransactions, 
  exportSettings,
  downloadImportTemplate,
  clearImportExportStatus 
} from '../redux/actions/importExportActions';
import ImportTransactionsForm from '../components/importExport/ImportTransactionsForm';
import ImportSettingsForm from '../components/importExport/ImportSettingsForm';
import ExportTransactionsForm from '../components/importExport/ExportTransactionsForm';
import ExportSettingsForm from '../components/importExport/ExportSettingsForm';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-export-tabpanel-${index}`}
      aria-labelledby={`import-export-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ImportExport = () => {
  const dispatch = useDispatch();
  const { 
    loading, 
    importResults, 
    importSettingsResults,
    exportStatus,
    error 
  } = useSelector(state => state.importExport);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for expanded error list
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    dispatch(clearImportExportStatus());
  };
  
  // Handle download template click
  const handleDownloadTemplate = () => {
    dispatch(downloadImportTemplate());
  };
  
  // Toggle errors expanded state
  const toggleErrorsExpanded = () => {
    setErrorsExpanded(!errorsExpanded);
  };
  
  // Clear results and status
  const handleClearResults = () => {
    dispatch(clearImportExportStatus());
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Import & Export
      </Typography>
      
      {/* Display error message if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Display import results */}
      {importResults && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Import Results
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Transactions Imported:
                </Typography>
                <Typography variant="h5" color="primary">
                  {importResults.imported}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Transactions Skipped:
                </Typography>
                <Typography variant="h5" color={importResults.skipped > 0 ? 'warning.main' : 'text.primary'}>
                  {importResults.skipped}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  New Categories Created:
                </Typography>
                <Typography variant="h5" color="success.main">
                  {importResults.newCategories}
                </Typography>
              </Grid>
            </Grid>
            
            {importResults.errors && importResults.errors.length > 0 && (
              <>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2, 
                    cursor: 'pointer' 
                  }}
                  onClick={toggleErrorsExpanded}
                >
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {importResults.errors.length} Error{importResults.errors.length !== 1 ? 's' : ''}
                  </Typography>
                  {errorsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                
                <Collapse in={errorsExpanded}>
                  <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, mt: 1 }}>
                    {importResults.errors.slice(0, 20).map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                    {importResults.errors.length > 20 && (
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <InfoIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={`${importResults.errors.length - 20} more errors not shown`} />
                      </ListItem>
                    )}
                  </List>
                </Collapse>
              </>
            )}
          </CardContent>
          <CardActions>
            <Button onClick={handleClearResults}>Clear Results</Button>
          </CardActions>
        </Card>
      )}
      
      {/* Display settings import results */}
      {importSettingsResults && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Settings Import Results
            </Typography>
            
            <Grid container spacing={2}>
              {importSettingsResults.categories && (
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Categories Imported:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {importSettingsResults.categories.imported}
                  </Typography>
                  {importSettingsResults.categories.errors.length > 0 && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`${importSettingsResults.categories.errors.length} errors`} 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              )}
              
              {importSettingsResults.budgets && (
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Budgets Imported:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {importSettingsResults.budgets.imported}
                  </Typography>
                  {importSettingsResults.budgets.errors.length > 0 && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`${importSettingsResults.budgets.errors.length} errors`} 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              )}
              
              {importSettingsResults.savingsGoals && (
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Savings Goals Imported:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {importSettingsResults.savingsGoals.imported}
                  </Typography>
                  {importSettingsResults.savingsGoals.errors.length > 0 && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`${importSettingsResults.savingsGoals.errors.length} errors`} 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              )}
              
              {importSettingsResults.bills && (
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Bills Imported:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {importSettingsResults.bills.imported}
                  </Typography>
                  {importSettingsResults.bills.errors.length > 0 && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`${importSettingsResults.bills.errors.length} errors`} 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              )}
            </Grid>
          </CardContent>
          <CardActions>
            <Button onClick={handleClearResults}>Clear Results</Button>
          </CardActions>
        </Card>
      )}
      
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<FileUploadIcon />} label="Import Transactions" />
          <Tab icon={<FileDownloadIcon />} label="Export Transactions" />
          <Tab icon={<CloudUploadIcon />} label="Import Settings" />
          <Tab icon={<CloudDownloadIcon />} label="Export Settings" />
        </Tabs>
        
        {/* Import Transactions Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Transactions from CSV
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Import your transactions from a CSV file. You can import transactions from your bank, credit card, or other financial institutions.
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mb: 3 }}
            >
              Download CSV Template
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            <ImportTransactionsForm />
          </Box>
        </TabPanel>
        
        {/* Export Transactions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Transactions to CSV
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Export your transactions to a CSV file. You can filter the transactions by date range, category, type, and more.
            </Typography>
            
            <ExportTransactionsForm />
          </Box>
        </TabPanel>
        
        {/* Import Settings Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Import your settings from a JSON file. This includes categories, budget templates, savings goals, and bill reminders.
            </Typography>
            
            <ImportSettingsForm />
          </Box>
        </TabPanel>
        
        {/* Export Settings Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Export your settings to a JSON file. This includes categories, budget templates, savings goals, and bill reminders.
            </Typography>
            
            <ExportSettingsForm />
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ImportExport;