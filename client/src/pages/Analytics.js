import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  Paper,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CompareIcon from '@mui/icons-material/Compare';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import { useIsMobile } from '../utils/responsiveUtils';
import FinancialHealthScore from '../components/analytics/FinancialHealthScore';
import BudgetVsActualAnalysis from '../components/analytics/BudgetVsActualAnalysis';
import SpendingTrendsAnalysis from '../components/analytics/SpendingTrendsAnalysis';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

const Analytics = () => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Analytics modules
  const analyticsModules = [
    { 
      name: 'Financial Health Score', 
      icon: <HealthAndSafetyIcon fontSize="large" />,
      description: 'View your overall financial health score and recommendations',
      color: theme.palette.success.main,
      component: <FinancialHealthScore />
    },
    { 
      name: 'Budget vs Actual', 
      icon: <CompareIcon fontSize="large" />,
      description: 'Compare your budget with actual spending',
      color: theme.palette.primary.main,
      component: <BudgetVsActualAnalysis />
    },
    { 
      name: 'Spending Trends', 
      icon: <TrendingUpIcon fontSize="large" />,
      description: 'Analyze your spending patterns over time',
      color: theme.palette.error.main,
      component: <SpendingTrendsAnalysis />
    },
    { 
      name: 'Income vs Expenses', 
      icon: <BarChartIcon fontSize="large" />,
      description: 'Track your income and expenses over time',
      color: theme.palette.warning.main,
      component: <ComingSoonPlaceholder title="Income vs Expenses" />
    },
    { 
      name: 'Annual Summary', 
      icon: <AssessmentIcon fontSize="large" />,
      description: 'View yearly summary of your finances',
      color: theme.palette.info.main,
      component: <ComingSoonPlaceholder title="Annual Summary" />
    },
    { 
      name: 'Financial Insights', 
      icon: <InsightsIcon fontSize="large" />,
      description: 'Get detailed insights and recommendations',
      color: theme.palette.secondary.main,
      component: <ComingSoonPlaceholder title="Financial Insights" />
    }
  ];
  
  const renderModuleCards = () => {
    return (
      <Grid container spacing={3}>
        {analyticsModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={module.name}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                borderTop: `4px solid ${module.color}`
              }}
            >
              <CardActionArea 
                onClick={() => setTabValue(index)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <CardContent sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: `${module.color}15`, // Very light version of the color
                        color: module.color,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2
                      }}
                    >
                      {module.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {module.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<HealthAndSafetyIcon />} label={isMobile ? "" : "Financial Health"} {...a11yProps(0)} />
          <Tab icon={<CompareIcon />} label={isMobile ? "" : "Budget vs Actual"} {...a11yProps(1)} />
          <Tab icon={<TrendingUpIcon />} label={isMobile ? "" : "Spending Trends"} {...a11yProps(2)} />
          <Tab icon={<BarChartIcon />} label={isMobile ? "" : "Income vs Expenses"} {...a11yProps(3)} />
          <Tab icon={<AssessmentIcon />} label={isMobile ? "" : "Annual Summary"} {...a11yProps(4)} />
          <Tab icon={<InsightsIcon />} label={isMobile ? "" : "Financial Insights"} {...a11yProps(5)} />
        </Tabs>
        
        {/* Overview - Show when no tab is selected */}
        <TabPanel value={tabValue} index={-1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              Gain insights into your financial data with our powerful analytics tools.
              Select a module below to dive deeper into your financial situation.
            </Typography>
            
            {renderModuleCards()}
          </Box>
        </TabPanel>
        
        {/* Individual module tabs */}
        {analyticsModules.map((module, index) => (
          <TabPanel key={module.name} value={tabValue} index={index}>
            {module.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

// Placeholder for upcoming modules
const ComingSoonPlaceholder = ({ title }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        This feature is coming soon! We're working hard to bring you more powerful financial analytics.
      </Alert>
      <Typography variant="body1">
        This module will provide detailed analysis and insights to help you make better financial decisions.
        Check back soon for updates!
      </Typography>
    </Paper>
  );
};

export default Analytics;