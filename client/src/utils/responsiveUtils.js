import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Hook to detect mobile devices
 * @returns {boolean} True if device is mobile (screen width < sm breakpoint)
 */
export const useIsMobile = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
};

/**
 * Hook to detect tablet devices
 * @returns {boolean} True if device is tablet (screen width between sm and md breakpoints)
 */
export const useIsTablet = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between('sm', 'md'));
};

/**
 * Hook to detect desktop devices
 * @returns {boolean} True if device is desktop (screen width > md breakpoint)
 */
export const useIsDesktop = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'));
};

/**
 * Custom hook to get a responsive value based on screen size
 * @param {any} mobile - Value for mobile screens
 * @param {any} tablet - Value for tablet screens (optional)
 * @param {any} desktop - Value for desktop screens
 * @returns {any} Responsive value
 */
export const useResponsiveValue = (mobile, tablet, desktop) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  if (isMobile) {
    return mobile;
  } else if (isTablet) {
    return tablet || desktop; // Fallback to desktop if tablet value is not provided
  } else {
    return desktop;
  }
};

/**
 * Custom hook to get current breakpoint information
 * @returns {Object} Object containing breakpoint information
 */
export const useResponsiveBreakpoints = () => {
  const theme = useTheme();
  const isXsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const isXlDown = useMediaQuery(theme.breakpoints.down('xl'));
  
  const isXsUp = useMediaQuery(theme.breakpoints.up('xs'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  
  // Determine current breakpoint
  let currentBreakpoint = 'xs';
  if (isXlUp) currentBreakpoint = 'xl';
  else if (isLgUp) currentBreakpoint = 'lg';
  else if (isMdUp) currentBreakpoint = 'md';
  else if (isSmUp) currentBreakpoint = 'sm';
  
  return {
    isXsDown, isSmDown, isMdDown, isLgDown, isXlDown,
    isXsUp, isSmUp, isMdUp, isLgUp, isXlUp,
    currentBreakpoint,
    isMobile: isSmDown,
    isTablet: !isSmDown && isMdDown,
    isDesktop: isMdUp
  };
};

// Non-hook version that takes screen size as input
export const getResponsiveValue = (screenSize, mobile, tablet, desktop) => {
  if (screenSize === 'mobile') {
    return mobile;
  } else if (screenSize === 'tablet') {
    return tablet || desktop;
  } else {
    return desktop;
  }
};