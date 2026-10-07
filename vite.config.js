import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const openAiKey = (
    process.env.VITE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    env.VITE_OPENAI_API_KEY ||
    env.OPENAI_API_KEY ||
    ''
  ).trim();

  return {
    plugins: [react()],
    base: command === 'build' ? '/my-reading/' : '/',
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(openAiKey),
      'import.meta.env.OPENAI_API_KEY': JSON.stringify(openAiKey),
    },
  };
});
