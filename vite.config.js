import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// NOTE: the OpenAI key is baked into the client bundle (dev and build), so anyone
// visiting the site can read it. This is temporary until the Cloudflare proxy in
// proxy/ is set up — then remove the key from here and from main.yml.
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
    },
  };
});
