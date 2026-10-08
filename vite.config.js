import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// The OpenAI key is injected for `npm run dev` only. Never inject it into a build:
// anything in the client bundle is public. The deployed site uses the visitor's own key.
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devKey = command === 'serve' ? (env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || '').trim() : '';

  return {
    plugins: [react()],
    base: command === 'build' ? '/my-reading/' : '/',
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(devKey),
    },
  };
});
