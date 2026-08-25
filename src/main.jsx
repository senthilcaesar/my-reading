import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App.jsx';
import theme from './theme.js';
import './index.css';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '32px',
            fontFamily: 'sans-serif',
            maxWidth: '600px',
            margin: '40px auto',
            background: '#fff',
            color: '#111',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ color: '#e53e3e', marginTop: 0 }}>
            Application Render Error
          </h2>
          <pre
            style={{
              background: '#f7fafc',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '13px',
              color: '#2d3748',
            }}
          >
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#3182ce',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '16px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
);
