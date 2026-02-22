/**
 * Design Tokens из Figma
 * Все значения извлечены из макета Appointy
 */

export const colors = {
  // Primary colors
  primary: {
    DEFAULT: '#000000',
    foreground: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    DEFAULT: '#f5f5f5',
    foreground: '#000000',
  },
  
  // Background
  background: '#ffffff',
  surface: '#f5f5f5',
  
  // Text colors
  foreground: '#000000',
  muted: {
    DEFAULT: '#757575',
    foreground: '#ffffff',
  },
  
  // Border
  border: '#e6e6e6',
  
  // Status colors
  success: {
    DEFAULT: '#009951',
    background: '#ebffee',
  },
  error: {
    DEFAULT: '#ec221f',
    background: '#fee9e7',
  },
  warning: {
    DEFAULT: '#bf6a02',
    background: '#fff1c2',
  },
  
  // Additional colors
  card: {
    DEFAULT: '#ffffff',
    foreground: '#000000',
  },
  popover: {
    DEFAULT: '#ffffff',
    foreground: '#000000',
  },
  
  // Input
  input: {
    border: '#d9d9d9',
    background: '#ffffff',
  },
};

export const typography = {
  fontFamily: {
    heading: 'Nunito, sans-serif',
    body: 'Nunito Sans, sans-serif',
    tech: 'Fira Code, monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
};

export const radii = {
  sm: '8px',      // Inputs
  md: '16px',     // Buttons
  lg: '24px',
  xl: '40px',     // Cards
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  card: '0 4px 24px rgba(0, 0, 0, 0.06)',
};

export const sizes = {
  button: {
    height: '52px',
    radius: '16px',
  },
  card: {
    radius: '40px',
  },
  input: {
    height: '52px',
    radius: '8px',
  },
};
