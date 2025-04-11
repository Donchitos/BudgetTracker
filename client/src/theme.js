import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define Australian theme colors
const aussieColors = {
  green: '#00843D', // Australian green
  gold: '#FFCD00', // Australian gold
  navy: '#000F9F', // Australian navy blue
  red: '#FF0000', // Australian sporting red
  white: '#FFFFFF',
  black: '#000000',
  teal: '#00A896', // Coastal hue
  sand: '#F4E1C1', // Beach sand color
  eucalyptus: '#5F8575', // Gum tree color
};

// Create a theme instance with responsive configuration
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
    },
    // Australian theme options - users can select this in settings
    aussie: {
      primary: {
        main: aussieColors.green,
        light: '#3BA46E',
        dark: '#00662E',
        contrastText: aussieColors.white,
      },
      secondary: {
        main: aussieColors.gold,
        light: '#FFD633',
        dark: '#C9A000',
        contrastText: aussieColors.black,
      },
      background: {
        default: '#f5f5f5',
        paper: aussieColors.white,
        accent: aussieColors.sand,
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
        disabled: '#999999',
      },
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.6rem',
      },
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.4rem',
      },
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.2rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body1: {
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          '@media (max-width:600px)': {
            fontSize: '0.8rem',
            padding: '6px 12px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px 4px',
          },
        },
        head: {
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            borderRadius: '6px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '6px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            height: '28px',
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '0 12px',
          },
        },
      },
    },
  },
  spacing: (factor) => `${0.25 * factor}rem`,
});

// Apply responsive font sizes to all typography variants
const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;