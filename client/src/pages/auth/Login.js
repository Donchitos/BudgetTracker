import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { demoLogin } from '../../redux/actions/authActions';
import { getAuthUrl } from '../../utils/apiConfig';
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [error, setError] = useState(null);
  
  const { email, password, rememberMe } = formData;
  
  const onChange = e => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });
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
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      console.log('Attempting to login with:', { email, password: '******' });
      
      // Direct fetch to the server with dynamic URL handling for GitHub Codespaces
      const response = await fetch(getAuthUrl('login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include cookies in the request
      });
      
      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Login response details:', data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        setError(`Could not parse server response: ${response.status}`);
        return;
      }
      
      if (response.ok && data.success) {
        console.log('Login successful, storing token and user data');
        // Store token manually
        localStorage.setItem('token', data.token);
        
        // Store basic user info if available
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard');
        navigate('/');
      } else {
        console.log('Login failed:', data.message || response.statusText);
        setError(data.message || `Login failed: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error: Could not connect to the server');
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
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
          />
          <FormControlLabel
            control={
              <Checkbox 
                name="rememberMe" 
                checked={rememberMe} 
                onChange={onChange} 
                color="primary" 
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
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
                  Login as Demo User
                </Button>
              </div>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;