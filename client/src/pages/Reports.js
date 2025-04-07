import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Stack,
  Divider
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArticleIcon from '@mui/icons-material/Article';
import { getTransactions } from '../redux/actions/transactionActions';
import { getCategories } from '../redux/actions/categoryActions';
import MonthlySummaryReport from '../components/reports/MonthlySummaryReport';
import CategorySpendingAnalysis from '../components/reports/CategorySpendingAnalysis';

// Report types
const REPORT_TYPES = {
  MONTHLY_SUMMARY: 0,
  CATEGORY_ANALYSIS: 1,
  INCOME_ANALYSIS: 2,
  CUSTOM_REPORT: 3
};

const Reports = () => {
  const dispatch = useDispatch();
  const [activeReport, setActiveReport] = useState(REPORT_TYPES.MONTHLY_SUMMARY);
  
  // Load data when component mounts
  useEffect(() => {
    // Load all transactions for reports
    dispatch(getTransactions({ limit: 1000 }));
    dispatch(getCategories());
  }, [dispatch]);
  
  // Handle report tab change
  const handleReportChange = (event, newValue) => {
    setActiveReport(newValue);
  };
  
  // Render the active report
  const renderActiveReport = () => {
    switch (activeReport) {
      case REPORT_TYPES.MONTHLY_SUMMARY:
        return <MonthlySummaryReport />;
      case REPORT_TYPES.CATEGORY_ANALYSIS:
        return <CategorySpendingAnalysis />;
      case REPORT_TYPES.INCOME_ANALYSIS:
        return (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Income Analysis Report
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Coming soon in the next update
            </Typography>
          </Box>
        );
      case REPORT_TYPES.CUSTOM_REPORT:
        return (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Custom Report Builder
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Coming soon in the next update
            </Typography>
          </Box>
        );
      default:
        return <MonthlySummaryReport />;
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Reports
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeReport}
          onChange={handleReportChange}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          aria-label="Financial reports tabs"
        >
          <Tab 
            icon={<BarChartIcon />} 
            label="Monthly Summary" 
            value={REPORT_TYPES.MONTHLY_SUMMARY} 
          />
          <Tab 
            icon={<PieChartIcon />} 
            label="Category Analysis" 
            value={REPORT_TYPES.CATEGORY_ANALYSIS} 
          />
          <Tab 
            icon={<TimelineIcon />} 
            label="Income Analysis" 
            value={REPORT_TYPES.INCOME_ANALYSIS} 
          />
          <Tab 
            icon={<ArticleIcon />} 
            label="Custom Report" 
            value={REPORT_TYPES.CUSTOM_REPORT} 
          />
        </Tabs>
      </Paper>
      
      {renderActiveReport()}
    </Box>
  );
};

export default Reports;