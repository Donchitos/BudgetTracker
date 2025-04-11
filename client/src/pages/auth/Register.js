import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerUser, demoLogin } from '../../redux/actions/authActions';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector(state => state.auth);
  
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  
  const { name, email, password, confirmPassword } = formData;
  
  const onChange = e => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Check password strength if password field is changed
    if (name === 'password') {
      const strength = {
        length: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[^A-Za-z0-9]/.test(value)
      };
      setPasswordStrength(strength);
    }
  };
  
  // Use authError from Redux store when component mounts
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const onSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Basic form validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Advanced password validation - checking all criteria manually
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    // Check all password requirements using the same checks we use for real-time validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password); // Any non-alphanumeric character
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      setError('Password must include uppercase, lowercase, number, and special character');
      return;
    }
    
    
    try {
      console.log('Attempting to register with Redux:', { name, email, password: '******' });
      
      // Use the Redux register action
      await dispatch(registerUser({ name, email, password }));
      
      // If we get here, registration was successful
      console.log('Registration successful, showing success message');
      setSuccess('Registration successful! Please login with your new credentials.');
      
      // Redirect to login page after a short delay to show the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {success}
          </Alert>
        )}
        
        
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                value={name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
              />
              {password && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Password strength:
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        color={passwordStrength.length ? "success.main" : "error.main"}
                        sx={{ display: 'block' }}
                      >
                        {passwordStrength.length ? "✓" : "✗"} At least 8 characters
                      </Typography>
                      <Typography
                        variant="caption"
                        color={passwordStrength.hasUpperCase ? "success.main" : "error.main"}
                        sx={{ display: 'block' }}
                      >
                        {passwordStrength.hasUpperCase ? "✓" : "✗"} Contains uppercase letter
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        color={passwordStrength.hasLowerCase ? "success.main" : "error.main"}
                        sx={{ display: 'block' }}
                      >
                        {passwordStrength.hasLowerCase ? "✓" : "✗"} Contains lowercase letter
                      </Typography>
                      <Typography
                        variant="caption"
                        color={passwordStrength.hasNumber ? "success.main" : "error.main"}
                        sx={{ display: 'block' }}
                      >
                        {passwordStrength.hasNumber ? "✓" : "✗"} Contains number
                      </Typography>
                      <Typography
                        variant="caption"
                        color={passwordStrength.hasSpecial ? "success.main" : "error.main"}
                        sx={{ display: 'block' }}
                      >
                        {passwordStrength.hasSpecial ? "✓" : "✗"} Contains special character
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Having trouble connecting?
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    // Use the demoLogin action from Redux
                    dispatch(demoLogin());
                    
                    // Navigate to dashboard
                    navigate('/');
                  }}
                >
                  Register as Demo User
                </Button>
              </div>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;