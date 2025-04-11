import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import UserSettings from '../components/settings/UserSettings';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Customise your budget tracker experience with Australian preferences.
      </Typography>
      
      <UserSettings />
    </Box>
  );
};

export default Settings;