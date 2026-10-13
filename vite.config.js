import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// Never expose the OpenAI key to the client bundle: Ask the Library goes through
// the Cloudflare proxy in proxy/ (VITE_ASK_PROXY_URL), which holds the key.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/my-reading/' : '/',
}));
