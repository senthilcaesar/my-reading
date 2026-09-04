import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Poppins', Arial, sans-serif`,
    body: `'Lora', Georgia, serif`,
  },
  semanticTokens: {
    colors: {
      bg: {
        default: '#faf9f5',
        _dark: '#303446',
      },
      surface: {
        default: '#e8e6dc',
        _dark: '#414559',
      },
      surfaceHover: {
        default: '#d4d1c4',
        _dark: '#51576d',
      },
      searchInputBg: {
        default: '#fffdf5',
        _dark: '#f8fafc',
      },
      searchInputText: {
        default: '#141413',
        _dark: '#141413',
      },
      searchInputPlaceholder: {
        default: '#5c5c56',
        _dark: '#5c5c56',
      },
      searchInputFocusBorder: {
        default: '#e6e1d6',
        _dark: '#e5e7eb',
      },
      searchInputFocusHalo: {
        default: '#ffffff',
        _dark: '#ffffff',
      },
      borderPrimary: {
        default: '#b0aea5',
        _dark: '#626880',
      },
      textPrimary: {
        default: '#141413',
        _dark: '#c6d0f5',
      },
      textSecondary: {
        default: '#5c5c56',
        _dark: '#a5adce',
      },
      accentPrimary: {
        default: '#d97757',
        _dark: '#ef9f76',
      },
      accentSecondary: {
        default: '#6a9bcc',
        _dark: '#8caaee',
      },
      accentMagenta: {
        default: '#788c5d',
        _dark: '#a6d189',
      },
    }
  },
  styles: {
    global: {
      body: {
        bg: 'bg',
        color: 'textPrimary',
        transition: 'background-color 0.6s ease, color 0.6s ease',
      },
      '::view-transition-old(root)': {
        animation: 'theme-fade-out 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      '::view-transition-new(root)': {
        animation: 'theme-fade-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        mixBlendMode: 'normal',
      },
      '@keyframes theme-fade-out': {
        from: { opacity: 1, transform: 'scale(1)' },
        to: { opacity: 0, transform: 'scale(0.995)' },
      },
      '@keyframes theme-fade-in': {
        from: { opacity: 0, transform: 'scale(1.005)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
      '@media (prefers-reduced-motion: reduce)': {
        '::view-transition-old(root), ::view-transition-new(root)': {
          animationDuration: '0.01ms',
        },
      },
    },
  },
});

export default theme;
