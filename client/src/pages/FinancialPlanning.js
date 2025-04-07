import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider
} from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useIsMobile } from '../utils/responsiveUtils';
import DebtPayoffCalculator from '../components/planning/DebtPayoffCalculator';
import RetirementCalculator from '../components/planning/RetirementCalculator';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`planning-tabpanel-${index}`}
      aria-labelledby={`planning-tab-${index}`}
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
    id: `planning-tab-${index}`,
    'aria-controls': `planning-tabpanel-${index}`,
  };
}

const FinancialPlanning = () => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Financial Planning tools
  const planningTools = [
    { 
      name: 'Retirement Calculator', 
      icon: <SavingsIcon fontSize="large" />,
      description: 'Plan your retirement savings and income needs',
      color: theme.palette.primary.main,
      component: <RetirementCalculator />
    },
    { 
      name: 'Debt Payoff Calculator', 
      icon: <PaymentsIcon fontSize="large" />,
      description: 'Create a strategy to eliminate your debt faster',
      color: theme.palette.error.main,
      component: <DebtPayoffCalculator />
    },
    { 
      name: 'Mortgage Calculator', 
      icon: <HomeIcon fontSize="large" />,
      description: 'Calculate monthly payments and amortization schedule',
      color: theme.palette.success.main,
      component: <ComingSoonPlaceholder title="Mortgage Calculator" />
    },
    { 
      name: 'Education Savings', 
      icon: <SchoolIcon fontSize="large" />,
      description: 'Plan for education costs and 529 contributions',
      color: theme.palette.info.main,
      component: <ComingSoonPlaceholder title="Education Savings Calculator" />
    },
    { 
      name: 'Auto Loan Calculator', 
      icon: <DirectionsCarIcon fontSize="large" />,
      description: 'Calculate auto payments and true cost of ownership',
      color: theme.palette.warning.main,
      component: <ComingSoonPlaceholder title="Auto Loan Calculator" />
    },
    { 
      name: 'Financial Roadmap', 
      icon: <AccountBalanceIcon fontSize="large" />,
      description: 'Create a personalized financial action plan',
      color: theme.palette.secondary.main,
      component: <ComingSoonPlaceholder title="Financial Roadmap" />
    }
  ];
  
  const renderToolCards = () => {
    return (
      <Grid container spacing={3}>
        {planningTools.map((tool, index) => (
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
        Financial Planning Tools
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
          <Tab icon={<SavingsIcon />} label={isMobile ? "" : "Retirement"} {...a11yProps(0)} />
          <Tab icon={<PaymentsIcon />} label={isMobile ? "" : "Debt Payoff"} {...a11yProps(1)} />
          <Tab icon={<HomeIcon />} label={isMobile ? "" : "Mortgage"} {...a11yProps(2)} />
          <Tab icon={<SchoolIcon />} label={isMobile ? "" : "Education"} {...a11yProps(3)} />
          <Tab icon={<DirectionsCarIcon />} label={isMobile ? "" : "Auto Loan"} {...a11yProps(4)} />
          <Tab icon={<AccountBalanceIcon />} label={isMobile ? "" : "Roadmap"} {...a11yProps(5)} />
        </Tabs>
        
        {/* Overview - Show when no tab is selected */}
        <TabPanel value={tabValue} index={-1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Financial Planning Tools
            </Typography>
            <Typography variant="body1" paragraph>
              Use our comprehensive financial planning tools to help achieve your financial goals.
              Select a calculator below to get started.
            </Typography>
            
            {renderToolCards()}
          </Box>
        </TabPanel>
        
        {/* Individual tool tabs */}
        {planningTools.map((tool, index) => (
          <TabPanel key={tool.name} value={tabValue} index={index}>
            {tool.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

// Placeholder for upcoming tools
const ComingSoonPlaceholder = ({ title }) => {
  return (
    <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Coming Soon!
        </Typography>
        <Typography variant="body1">
          We're currently working on this financial planning tool to help you make better financial decisions.
          Check back soon for updates.
        </Typography>
      </Box>
    </Paper>
  );
};

export default FinancialPlanning;