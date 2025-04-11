import React, { useState, useEffect } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Breadcrumbs,
  Fade,
  useScrollTrigger,
  Slide,
  Badge,
  Divider,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { logout } from '../../redux/actions/authActions';

// Import icons for navigation items
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
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

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

// Combine all navigation items for the mobile menu
const allNavItems = [
  ...mainNavItems,
  ...reportingNavItems,
  ...planningNavItems,
  ...utilityNavItems
];

// Hide navbar on scroll down, show on scroll up
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const theme = useTheme();
  const location = useLocation();
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [reportingExpanded, setReportingExpanded] = useState(false);
  const [planningExpanded, setPlanningExpanded] = useState(false);
  const [notificationCount] = useState(2); // For future notification implementation

  // Helper to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if the current page is in a particular section
  const isInSection = (paths) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    if (location.pathname === '/') return null;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return null;

    return (
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          bottom: -30,
          left: 24,
          color: 'rgba(255,255,255,0.7)',
          '& .MuiBreadcrumbs-separator': {
            color: 'rgba(255,255,255,0.5)'
          }
        }}
      >
        <Typography
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
          Home
        </Typography>
        
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          
          // Pretty-print the segment name
          const segmentName = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          return isLast ? (
            <Typography key={path} color="text.primary">
              {segmentName}
            </Typography>
          ) : (
            <Typography
              key={path}
              component={RouterLink}
              to={path}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {segmentName}
            </Typography>
          );
        })}
      </Breadcrumbs>
    );
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    dispatch(logout());
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
  };

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

  const authLinks = (
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
  );

  const guestLinks = (
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
  );

  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        background: theme.palette.primary.main,
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
              alignItems: 'center',
              flexShrink: 0,
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
                  maxHeight: '80vh',
                  width: 280,
                  borderRadius: 2,
                  mt: 1
                }
              }}
            >
              {isAuthenticated && (
                <>
                  {/* Group menu items by category */}
                  <MenuItem sx={{ backgroundColor: 'rgba(25, 118, 210, 0.12)', borderRadius: '4px', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', width: '100%' }}>
                      Main
                    </Typography>
                  </MenuItem>
                  
                  {mainNavItems.map((item) => (
                    <MenuItem
                      key={item.title}
                      onClick={handleCloseNavMenu}
                      component={RouterLink}
                      to={item.path}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 1,
                        mx: 0.5,
                        mb: 0.5,
                        py: 1,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.light' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: isActive(item.path) ? 600 : 400 }}>{item.title}</Typography>
                    </MenuItem>
                  ))}
                  
                  <MenuItem sx={{ backgroundColor: 'rgba(25, 118, 210, 0.12)', borderRadius: '4px', mb: 1, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', width: '100%' }}>
                      Reports & Analytics
                    </Typography>
                  </MenuItem>
                  
                  {reportingNavItems.map((item) => (
                    <MenuItem
                      key={item.title}
                      onClick={handleCloseNavMenu}
                      component={RouterLink}
                      to={item.path}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 1,
                        mx: 0.5,
                        mb: 0.5,
                        py: 1,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.light' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: isActive(item.path) ? 600 : 400 }}>{item.title}</Typography>
                    </MenuItem>
                  ))}
                  
                  <MenuItem sx={{ backgroundColor: 'rgba(25, 118, 210, 0.12)', borderRadius: '4px', mb: 1, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', width: '100%' }}>
                      Planning
                    </Typography>
                  </MenuItem>
                  
                  {planningNavItems.map((item) => (
                    <MenuItem
                      key={item.title}
                      onClick={handleCloseNavMenu}
                      component={RouterLink}
                      to={item.path}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 1,
                        mx: 0.5,
                        mb: 0.5,
                        py: 1,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.light' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: isActive(item.path) ? 600 : 400 }}>{item.title}</Typography>
                    </MenuItem>
                  ))}
                  
                  <MenuItem sx={{ backgroundColor: 'rgba(25, 118, 210, 0.12)', borderRadius: '4px', mb: 1, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', width: '100%' }}>
                      Utilities
                    </Typography>
                  </MenuItem>
                  
                  {utilityNavItems.map((item) => (
                    <MenuItem
                      key={item.title}
                      onClick={handleCloseNavMenu}
                      component={RouterLink}
                      to={item.path}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 1,
                        mx: 0.5,
                        mb: 0.5,
                        py: 1,
                        backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'primary.light' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: isActive(item.path) ? 600 : 400 }}>{item.title}</Typography>
                    </MenuItem>
                  ))}
                </>
              )}
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
            {isAuthenticated && (
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
                    <Button
                      key={item.title}
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
                  {reportingNavItems.map((item, index) => (
                    <Tooltip
                      key={item.title}
                      title={`${item.title}`}
                      arrow
                      placement="bottom"
                    >
                    <Button
                      key={item.title}
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
                  {planningNavItems.map((item, index) => (
                    <Tooltip
                      key={item.title}
                      title={`${item.title}`}
                      arrow
                      placement="bottom"
                    >
                    <Button
                      key={item.title}
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
                  {utilityNavItems.map((item, index) => (
                    <Tooltip
                      key={item.title}
                      title={`${item.title}`}
                      arrow
                      placement="bottom"
                    >
                    <Button
                      key={item.title}
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
                    </Tooltip>
                  ))}
                </Box>
              </>
            )}
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