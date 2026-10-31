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
      noteBg: {
        default: '#fdf6d8',
        _dark: 'rgba(240,210,100,0.14)',
      },
      noteBorder: {
        default: '#ecdca0',
        _dark: 'rgba(240,210,100,0.35)',
      },
      noteIcon: {
        default: '#a1862a',
        _dark: '#e5c890',
      },
      tagBg: {
        default: '#fffdf5',
        _dark: '#414559',
      },
      tagTwine: {
        default: '#8a7a64',
        _dark: '#a5adce',
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
      accentGreen: {
        default: '#1c4c36',
        _dark: '#266144',
      },
      accentGreenHover: {
        default: '#143827',
        _dark: '#1e4f37',
      },
      // Gradient fills for the Shuffle (clay/copper) and Ask (sage) buttons.
      // Used via `bg`, which sets the `background` shorthand, so gradients work.
      shuffleBg: {
        default: 'linear-gradient(135deg, #f3d9cb 0%, #ebc3ad 100%)',
        _dark: 'linear-gradient(135deg, #8c5c4a 0%, #6f4a45 100%)',
      },
      shuffleBgHover: {
        default: 'linear-gradient(135deg, #efcdb9 0%, #e4b195 100%)',
        _dark: 'linear-gradient(135deg, #9c6852 0%, #7b524b 100%)',
      },
      shuffleBorder: {
        default: '#d9a185',
        _dark: 'rgba(239,159,118,0.5)',
      },
      shuffleText: {
        default: '#8a3f22',
        _dark: '#fde7da',
      },
      askBg: {
        default: 'linear-gradient(135deg, #dde8d6 0%, #c9dabf 100%)',
        _dark: 'linear-gradient(135deg, #4f6e52 0%, #3d5a48 100%)',
      },
      askBgHover: {
        default: 'linear-gradient(135deg, #d2e0c9 0%, #bccfb1 100%)',
        _dark: 'linear-gradient(135deg, #5a7c5d 0%, #466652 100%)',
      },
      askBorder: {
        default: '#9ab890',
        _dark: 'rgba(166,209,137,0.5)',
      },
      askText: {
        default: '#1c4c36',
        _dark: '#e6f4da',
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
