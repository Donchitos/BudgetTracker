import React, { useState, useEffect, memo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  InputAdornment,
  ListItemIcon,
  Badge,
  Divider,
  useTheme
} from '@mui/material';

// Icons - only import what we use
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import SavingsIcon from '@mui/icons-material/Savings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RepeatIcon from '@mui/icons-material/Repeat';
import DescriptionIcon from '@mui/icons-material/Description';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';

import { logout } from '../../redux/actions/authActions';

// Group navigation items into logical sections with icons for better usability
const mainNavItems = [
  { title: 'Transactions', path: '/dashboard/transactions', priority: 'high', icon: <PaymentsIcon fontSize="small" /> },
  { title: 'Categories', path: '/dashboard/categories', priority: 'high', icon: <CategoryIcon fontSize="small" /> },
  { title: 'Budget', path: '/dashboard/budget', priority: 'high', icon: <AccountBalanceIcon fontSize="small" /> },
  { title: 'Bills', path: '/dashboard/bills', priority: 'high', icon: <RequestPageIcon fontSize="small" /> },
  { title: 'Savings', path: '/dashboard/savings', priority: 'high', icon: <SavingsIcon fontSize="small" /> }
];

const reportingNavItems = [
  { title: 'Reports', path: '/dashboard/reports', priority: 'medium', icon: <AssessmentIcon fontSize="small" /> },
  { title: 'Analytics', path: '/dashboard/analytics', priority: 'medium', icon: <InsightsIcon fontSize="small" /> }
];

const planningNavItems = [
  { title: 'Planning', path: '/dashboard/financial-planning', priority: 'medium', icon: <TrendingUpIcon fontSize="small" /> },
  { title: 'Forecast', path: '/dashboard/forecast', priority: 'medium', icon: <TrendingUpIcon fontSize="small" /> },
  { title: 'Recurring', path: '/dashboard/recurring-transactions', priority: 'medium', icon: <RepeatIcon fontSize="small" /> }
];

const utilityNavItems = [
  { title: 'Templates', path: '/dashboard/budget-templates', priority: 'low', icon: <DescriptionIcon fontSize="small" /> },
  { title: 'Import/Export', path: '/dashboard/import-export', priority: 'low', icon: <ImportExportIcon fontSize="small" /> },
  { title: 'Settings', path: '/dashboard/settings', priority: 'medium', icon: <SettingsIcon fontSize="small" /> }
];

// Menu category header component - memoized for performance
const MenuCategoryHeader = memo(({ title, theme }) => (
  <MenuItem 
    sx={{ 
      backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      borderRadius: '4px', 
      mb: 1, 
      mt: 2,
      color: 'white',
      py: 1.5,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center'
    }}
  >
    <Box sx={{ 
      width: 4, 
      height: 16, 
      backgroundColor: theme.palette.secondary.main,
      borderRadius: 4,
      mr: 1.5
    }} />
    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', width: '100%' }}>
      {title}
    </Typography>
  </MenuItem>
));

// Menu item component - memoized for performance
const NavMenuItem = memo(({ item, isActive, handleCloseNavMenu }) => (
  <MenuItem
    component={RouterLink}
    to={item.path}
    onClick={handleCloseNavMenu}
    selected={isActive(item.path)}
    sx={{
      borderRadius: 1,
      mx: 0.5,
      mb: 0.5,
      py: 1.5,
      backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
      position: 'relative',
      transition: 'all 0.2s ease',
      '&::before': isActive(item.path) ? {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '4px',
        backgroundColor: 'secondary.main',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      } : {},
      '&:hover': {
        backgroundColor: isActive(item.path) ? 'primary.main' : 'rgba(25, 118, 210, 0.08)',
      }
    }}
  >
    <ListItemIcon sx={{ 
      minWidth: 36, 
      color: isActive(item.path) ? 'white' : 'inherit',
      mr: 1.5 
    }}>
      {item.icon}
    </ListItemIcon>
    <Typography sx={{ 
      fontWeight: isActive(item.path) ? 700 : 400,
      color: isActive(item.path) ? 'white' : 'inherit'
    }}>
      {item.title}
    </Typography>
  </MenuItem>
));

// Desktop nav button - memoized for performance
const DesktopNavButton = memo(({ item, isActive, handleCloseNavMenu }) => (
  <Button
    component={RouterLink}
    to={item.path}
    onClick={handleCloseNavMenu}
    color="inherit"
    sx={{
      my: 0.5,
      mx: 0.5,
      px: 1.5,
      borderRadius: 2,
      fontSize: '0.875rem',
      minWidth: 'auto',
      textTransform: 'none',
      transition: 'all 0.2s ease',
      fontWeight: isActive(item.path) ? 700 : 500,
      backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: 0.75
    }}
  >
    {item.icon}
    {item.title}
  </Button>
));

// Main Navbar component
const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const theme = useTheme();
  const location = useLocation();
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [notificationCount] = useState(2); // For future notification implementation

  // Helper to check if a path is active - memoized
  const isActive = React.useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  const handleOpenNavMenu = React.useCallback((event) => {
    setAnchorElNav(event.currentTarget);
  }, []);
  const handleOpenUserMenu = React.useCallback((event) => {
    setAnchorElUser(event.currentTarget);
  }, []);
  

  const handleCloseNavMenu = React.useCallback(() => {
    setAnchorElNav(null);
  }, []);

  const handleCloseUserMenu = React.useCallback(() => {
    setAnchorElUser(null);
  }, []);

  const handleLogout = React.useCallback(() => {
    handleCloseUserMenu();
    dispatch(logout());
  }, [handleCloseUserMenu, dispatch]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+number for quick navigation
      if (e.altKey && isAuthenticated) {
        const keyMap = {
          '1': '/',
          '2': '/transactions',
          '3': '/categories',
          '4': '/budget',
          '5': '/bills',
          '6': '/reports',
          '7': '/settings',
        };
        
        if (keyMap[e.key]) {
          e.preventDefault();
          location.navigate(keyMap[e.key]);
        }
      }
      
      // Focus search box with Ctrl+/
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        document.getElementById('navbar-search')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, location]);

  // Memoized components for better performance
  const authLinks = React.useMemo(() => (
    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
      {/* Help button */}
      <Tooltip title="Help & Documentation" arrow>
        <IconButton
          size="medium"
          color="inherit"
          aria-label="help"
          sx={{
            ml: 0.5,
            '@media (max-width: 1100px)': {
              display: 'none'
            }
          }}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {/* Notifications */}
      <Tooltip title="Notifications" arrow>
        <IconButton
          size="large"
          color="inherit"
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{
            ml: 1,
            border: '2px solid rgba(255,255,255,0.7)',
            borderRadius: '50%',
            padding: '3px'
          }}
        >
          <Avatar
            alt={user?.name}
            src="/static/images/avatar/2.jpg"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: theme.palette.secondary.main
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        </IconButton>
      </Tooltip>
      
      <Menu
        sx={{
          mt: '45px',
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0px 8px 16px rgba(0,0,0,0.15)'
          }
        }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
          <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography>Profile</Typography>
        </MenuItem>
        
        <MenuItem component={RouterLink} to="/settings" onClick={handleCloseUserMenu}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography>Settings</Typography>
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  ), [handleOpenUserMenu, notificationCount, theme.palette.secondary.main, user, anchorElUser, handleCloseUserMenu, handleLogout]);

  const guestLinks = React.useMemo(() => (
    <Box sx={{ flexGrow: 0, display: 'flex' }}>
      <Button
        component={RouterLink}
        to="/login"
        variant="text"
        color="inherit"
        sx={{
          my: 1,
          mx: 0.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        Login
      </Button>
      <Button
        component={RouterLink}
        to="/register"
        variant="contained"
        color="secondary"
        sx={{
          my: 1,
          mx: 0.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 1
        }}
      >
        Register
      </Button>
    </Box>
  ), []);

  // Mobile menu with memoized rendering for better performance
  const renderMobileMenu = React.useMemo(() => {
    if (!isAuthenticated) return null;
    
    return (
      <>
        <MenuCategoryHeader title="Main" theme={theme} />
        
        {mainNavItems.map((item) => (
          <NavMenuItem 
            key={item.title} 
            item={item} 
            isActive={isActive} 
            handleCloseNavMenu={handleCloseNavMenu} 
          />
        ))}
        
        <MenuCategoryHeader title="Reports & Analytics" theme={theme} />
        
        {reportingNavItems.map((item) => (
          <NavMenuItem 
            key={item.title} 
            item={item} 
            isActive={isActive} 
            handleCloseNavMenu={handleCloseNavMenu} 
          />
        ))}
        
        <MenuCategoryHeader title="Planning" theme={theme} />
        
        {planningNavItems.map((item) => (
          <NavMenuItem 
            key={item.title} 
            item={item} 
            isActive={isActive} 
            handleCloseNavMenu={handleCloseNavMenu} 
          />
        ))}
        
        <MenuCategoryHeader title="Utilities" theme={theme} />
        
        {utilityNavItems.map((item) => (
          <NavMenuItem 
            key={item.title} 
            item={item} 
            isActive={isActive} 
            handleCloseNavMenu={handleCloseNavMenu} 
          />
        ))}
      </>
    );
  }, [isAuthenticated, theme, isActive, handleCloseNavMenu]);

  // Desktop navigation sections with memoized rendering
  const renderDesktopNav = React.useMemo(() => {
    if (!isAuthenticated) return null;
    
    return (
      <>
        {/* Main navigation items */}
        <Box sx={{
          display: 'flex',
          borderRight: '1px solid rgba(255,255,255,0.2)',
          pr: 1,
          mr: 1,
          '& .MuiButton-root:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}>
          {mainNavItems.map((item, index) => (
            <Tooltip
              key={item.title}
              title={`${item.title} (Alt+${index+2})`}
              arrow
              placement="bottom"
            >
              <span> {/* Wrapper to handle tooltip on disabled button */}
                <DesktopNavButton 
                  item={item} 
                  isActive={isActive} 
                  handleCloseNavMenu={handleCloseNavMenu} 
                />
              </span>
            </Tooltip>
          ))}
        </Box>
        
        {/* Reporting section */}
        <Box sx={{
          display: 'flex',
          borderRight: '1px solid rgba(255,255,255,0.2)',
          pr: 1,
          mr: 1,
          '& .MuiButton-root:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}>
          {reportingNavItems.map((item) => (
            <Tooltip
              key={item.title}
              title={`${item.title}`}
              arrow
              placement="bottom"
            >
              <span>
                <DesktopNavButton 
                  item={item} 
                  isActive={isActive} 
                  handleCloseNavMenu={handleCloseNavMenu} 
                />
              </span>
            </Tooltip>
          ))}
        </Box>
        
        {/* Planning section */}
        <Box sx={{
          display: 'flex',
          borderRight: '1px solid rgba(255,255,255,0.2)',
          pr: 1,
          mr: 1,
          '& .MuiButton-root:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}>
          {planningNavItems.map((item) => (
            <Tooltip
              key={item.title}
              title={`${item.title}`}
              arrow
              placement="bottom"
            >
              <span>
                <DesktopNavButton 
                  item={item} 
                  isActive={isActive} 
                  handleCloseNavMenu={handleCloseNavMenu} 
                />
              </span>
            </Tooltip>
          ))}
        </Box>
        
        {/* Utility items */}
        <Box sx={{
          display: 'flex',
          '& .MuiButton-root:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}>
          {utilityNavItems.map((item) => (
            <Tooltip
              key={item.title}
              title={`${item.title}`}
              arrow
              placement="bottom"
            >
              <span>
                <DesktopNavButton 
                  item={item} 
                  isActive={isActive} 
                  handleCloseNavMenu={handleCloseNavMenu} 
                />
              </span>
            </Tooltip>
          ))}
        </Box>
      </>
    );
  }, [isAuthenticated, isActive, handleCloseNavMenu]);

  return (
    <AppBar
      position="fixed"
      elevation={4}
      sx={{
        background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: '56px', sm: '64px' }, overflowX: 'auto' }}>
          {/* Search bar for desktop */}
          <Box sx={{
            display: { xs: 'none', lg: 'flex' },
            mr: 2,
            position: 'relative',
            width: 180,
            flexShrink: 0,
            transition: 'width 0.2s ease-in-out',
            '&:focus-within': {
              width: 250,
            }
          }}>
            <TextField
              id="navbar-search"
              placeholder="Search..."
              size="small"
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  color: 'white',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  padding: '8px 12px',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -16,
                left: 8,
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.7rem'
              }}
            >
              Ctrl+/ for quick search
            </Typography>
          </Box>
          
          {/* Logo for desktop */}
          <Box
            component={RouterLink}
            to={isAuthenticated ? "/dashboard" : "/"}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              flexShrink: 0,
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { opacity: 0.9 }
            }}
          >
            <AccountBalanceWalletIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                whiteSpace: 'nowrap'
              }}
            >
              BUDGET TRACKER
            </Typography>
          </Box>

          {/* Mobile menu button */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', lg: 'none' }, mr: 1 }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', lg: 'none' },
                '& .MuiPaper-root': {
                  maxHeight: '85vh',
                  width: 280,
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
                  animation: 'fadeIn 0.2s ease-in-out'
                },
                '& .MuiList-root': {
                  padding: 1
                },
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-10px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              {renderMobileMenu}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <Box
            component={RouterLink}
            to={isAuthenticated ? "/dashboard" : "/"}
            sx={{
              display: { xs: 'flex', lg: 'none' },
              alignItems: 'center',
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <AccountBalanceWalletIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                display: { xs: 'flex', lg: 'none' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
              }}
            >
              BUDGET TRACKER
            </Typography>
          </Box>

          {/* Desktop navigation - organized in sections */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', lg: 'flex' }, 
            justifyContent: 'center',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '4px'
            }
          }}>
            {renderDesktopNav}
          </Box>

          <Box sx={{ 
            flexShrink: 0, 
            display: 'flex', 
            position: 'relative', 
            zIndex: 2,
            ml: 1,
            backgroundColor: theme.palette.primary.main 
          }}>
            {isAuthenticated ? authLinks : guestLinks}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;