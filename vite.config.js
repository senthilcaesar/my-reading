import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Only inject into client bundle during local dev (npm run dev)
  // Prevents accidentally baking your secret key into production bundles
  const openAiKey = command === 'serve'
    ? (env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '')
    : '';

  return {
    plugins: [react()],
    base: command === 'build' ? '/my-reading/' : '/',
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(openAiKey),
    },
  };
});
