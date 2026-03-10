import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Outfit', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  semanticTokens: {
    colors: {
      bg: {
        default: '#fcf8e8',
        _dark: '#050507',
      },
      surface: {
        default: 'rgba(67, 52, 34, 0.05)',
        _dark: 'rgba(255, 255, 255, 0.03)',
      },
      surfaceHover: {
        default: 'rgba(67, 52, 34, 0.08)',
        _dark: 'rgba(255, 255, 255, 0.08)',
      },
      borderPrimary: {
        default: 'rgba(67, 52, 34, 0.15)',
        _dark: 'rgba(255, 255, 255, 0.1)',
      },
      textPrimary: {
        default: '#3d3021',
        _dark: '#f0f0f5',
      },
      textSecondary: {
        default: '#6e5b4b',
        _dark: '#a0a0b0',
      },
      accentPrimary: {
        default: '#b08d57',
        _dark: '#00f2ff',
      },
      accentSecondary: {
        default: '#7d6b5d',
        _dark: '#7000ff',
      },
      accentMagenta: {
        default: '#a64d4d',
        _dark: '#ff00ea',
      },
    }
  },
  styles: {
    global: {
      body: {
        bg: 'bg',
        color: 'textPrimary',
        transition: 'background-color 0.3s, color 0.3s',
      },
    },
  },
});

export default theme;
