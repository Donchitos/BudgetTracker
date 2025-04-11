import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Grid,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FlagIcon from '@mui/icons-material/Flag';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaletteIcon from '@mui/icons-material/Palette';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// This component will be connected to Redux once we create the settings actions
const UserSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    currency: 'AUD',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    country: 'Australia',
    budgetStartDay: 1,
    taxYear: 'financial', // Australian financial year (July-June)
  });

  // Initialize settings from user data when component mounts
  useEffect(() => {
    if (user && user.settings) {
      setSettings({
        ...settings,
        ...user.settings
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // In the future, dispatch an action to save settings
      // await dispatch(updateUserSettings(settings));
      console.log('Saving settings:', settings);
      
      // Mock success for now
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Account Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Location Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FlagIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Regional Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth margin="normal">
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  name="country"
                  value={settings.country}
                  onChange={handleChange}
                  label="Country"
                >
                  <MenuItem value="Australia">Australia</MenuItem>
                  <MenuItem value="United States">United States</MenuItem>
                  <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  <MenuItem value="New Zealand">New Zealand</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  <MenuItem value="AUD">Australian Dollar (AUD $)</MenuItem>
                  <MenuItem value="USD">US Dollar (USD $)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR €)</MenuItem>
                  <MenuItem value="GBP">British Pound (GBP £)</MenuItem>
                  <MenuItem value="NZD">New Zealand Dollar (NZD $)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Financial Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth margin="normal">
                <InputLabel id="tax-year-label">Tax Year</InputLabel>
                <Select
                  labelId="tax-year-label"
                  name="taxYear"
                  value={settings.taxYear}
                  onChange={handleChange}
                  label="Tax Year"
                >
                  <MenuItem value="financial">Australian Financial Year (July-June)</MenuItem>
                  <MenuItem value="calendar">Calendar Year (Jan-Dec)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  label="Budget Start Day"
                  name="budgetStartDay"
                  type="number"
                  value={settings.budgetStartDay}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 31 }}
                  helperText="Day of the month when your budget cycle starts"
                />
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Display Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth margin="normal">
                <InputLabel id="theme-label">Theme</InputLabel>
                <Select
                  labelId="theme-label"
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="aussie">Australian</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Date Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Date Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth margin="normal">
                <InputLabel id="date-format-label">Date Format</InputLabel>
                <Select
                  labelId="date-format-label"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  label="Date Format"
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Australian)</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default UserSettings;