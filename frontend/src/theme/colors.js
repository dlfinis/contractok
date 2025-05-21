export const colors = {
  // Brand Colors
  darkBlue: '#0a2e5ad0',
  teal: '#00a878ff',
  mint: '#bef5a3ff',
  white: '#ffffffff',
  
  // Semantic Colors
  primary: '#00a878ff',
  secondary: '#0a2e5ad0',
  accent: '#bef5a3ff',
  background: '#f8fafc',
  text: '#1a202c',
  textLight: '#4a5568',
  
  // Feedback Colors
  success: '#00a878ff',
  error: '#e53e3e',
  warning: '#dd6b20',
  info: '#3182ce',
  
  // UI Colors
  border: '#e2e8f0',
  inputBorder: '#cbd5e0',
  cardBg: '#ffffff',
  cardShadow: 'rgba(10, 46, 90, 0.09)'
};

export const gradients = {
  primary: `linear-gradient(135deg, ${'#00a878ff'} 0%, ${'#0a2e5ad0'} 100%)`,
  secondary: `linear-gradient(135deg, ${'#0a2e5ad0'} 0%, ${'#00a878ff'} 100%)`,
  accent: `linear-gradient(135deg, ${'#bef5a3ff'} 0%, ${'#00a878ff'} 100%)`,
  button: `linear-gradient(135deg, ${'#00a878ff'} 0%, ${'#0a2e5ad0'} 100%)`,
  buttonHover: `linear-gradient(135deg, ${'#00c48a'} 0%, ${'#0d3a7a'} 100%)`
};

export default {
  colors,
  gradients,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  fonts: {
    body: 'var(--main-font), "Sora", "Quicksand", Arial, sans-serif',
    heading: 'var(--logo-font), "Sora", Arial, sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};
