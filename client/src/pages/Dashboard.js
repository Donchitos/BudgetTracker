import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" component="div">
              $0.00
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" component="div">
              $0.00
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="success" gutterBottom>
              Balance
            </Typography>
            <Typography variant="h4" component="div">
              $0.00
            </Typography>
          </Paper>
        </Grid>
        
        {/* Expense Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Expense Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Chart will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No recent transactions
            </Typography>
          </Paper>
        </Grid>
        
        {/* Spending Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Spending Over Time
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Chart will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;