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
        transition: 'background-color 0.3s, color 0.3s',
      },
    },
  },
});

export default theme;
