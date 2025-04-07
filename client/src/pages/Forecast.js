import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useIsMobile } from '../utils/responsiveUtils';
import CashflowPrediction from '../components/forecast/CashflowPrediction';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`forecast-tabpanel-${index}`}
      aria-labelledby={`forecast-tab-${index}`}
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
    id: `forecast-tab-${index}`,
    'aria-controls': `forecast-tabpanel-${index}`,
  };
}

// Placeholder component for upcoming features
const ComingSoonPlaceholder = ({ title }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Coming Soon!
        </Typography>
        <Typography variant="body1">
          We're currently developing this forecasting feature to help you better plan your financial future.
          Check back soon for updates.
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * Forecast page component - main page for expense prediction and forecasting features
 */
const Forecast = () => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Forecast tools
  const forecastTools = [
    { 
      name: 'Cashflow Prediction', 
      icon: <TrendingUpIcon fontSize="large" />,
      description: 'Predict your income and expenses for the next 3 months',
      color: theme.palette.primary.main,
      component: <CashflowPrediction />
    },
    { 
      name: 'Monthly Forecast', 
      icon: <CalendarMonthIcon fontSize="large" />,
      description: 'See a detailed forecast of your monthly expenses',
      color: theme.palette.success.main,
      component: <ComingSoonPlaceholder title="Monthly Expense Forecast" />
    },
    { 
      name: 'Annual Projection', 
      icon: <AccountBalanceIcon fontSize="large" />,
      description: 'Project your finances for the coming year',
      color: theme.palette.warning.main,
      component: <ComingSoonPlaceholder title="Annual Financial Projection" />
    },
    { 
      name: 'What-If Scenarios', 
      icon: <CompareArrowsIcon fontSize="large" />,
      description: 'Explore different financial scenarios and outcomes',
      color: theme.palette.info.main,
      component: <ComingSoonPlaceholder title="What-If Scenario Analysis" />
    },
    { 
      name: 'Budget Planning', 
      icon: <EventNoteIcon fontSize="large" />,
      description: 'Get AI-assisted budget recommendations',
      color: theme.palette.secondary.main,
      component: <ComingSoonPlaceholder title="AI Budget Planning" />
    }
  ];
  
  const renderToolCards = () => {
    return (
      <Grid container spacing={3}>
        {forecastTools.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} key={tool.name}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                borderTop: `4px solid ${tool.color}`
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
                        bgcolor: `${tool.color}15`, // Very light version of the color
                        color: tool.color,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2
                      }}
                    >
                      {tool.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {tool.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
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
        Expense Forecasting
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Forecasts and predictions are based on your historical spending patterns, recurring transactions, and budget templates.
        They can help you anticipate future expenses and plan accordingly.
      </Alert>
      
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
          <Tab icon={<TrendingUpIcon />} label={isMobile ? "" : "Cashflow"} {...a11yProps(0)} />
          <Tab icon={<CalendarMonthIcon />} label={isMobile ? "" : "Monthly"} {...a11yProps(1)} />
          <Tab icon={<AccountBalanceIcon />} label={isMobile ? "" : "Annual"} {...a11yProps(2)} />
          <Tab icon={<CompareArrowsIcon />} label={isMobile ? "" : "What-If"} {...a11yProps(3)} />
          <Tab icon={<EventNoteIcon />} label={isMobile ? "" : "Planning"} {...a11yProps(4)} />
        </Tabs>
        
        {/* Overview - Show when no tab is selected */}
        <TabPanel value={tabValue} index={-1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Expense Forecasting Tools
            </Typography>
            <Typography variant="body1" paragraph>
              Use our forecasting tools to predict your future finances and make informed decisions.
              Select a forecasting tool below to get started.
            </Typography>
            
            {renderToolCards()}
          </Box>
        </TabPanel>
        
        {/* Individual forecast tools */}
        {forecastTools.map((tool, index) => (
          <TabPanel key={tool.name} value={tabValue} index={index}>
            {tool.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default Forecast;