import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
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
        _dark: '#141413',
      },
      surface: {
        default: '#e8e6dc',
        _dark: 'rgba(250, 249, 245, 0.05)',
      },
      surfaceHover: {
        default: '#d4d1c4',
        _dark: 'rgba(250, 249, 245, 0.1)',
      },
      borderPrimary: {
        default: '#b0aea5',
        _dark: 'rgba(250, 249, 245, 0.15)',
      },
      textPrimary: {
        default: '#141413',
        _dark: '#faf9f5',
      },
      textSecondary: {
        default: '#5c5c56',
        _dark: '#b0aea5',
      },
      accentPrimary: {
        default: '#d97757',
        _dark: '#d97757',
      },
      accentSecondary: {
        default: '#6a9bcc',
        _dark: '#6a9bcc',
      },
      accentMagenta: {
        default: '#788c5d',
        _dark: '#788c5d',
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
