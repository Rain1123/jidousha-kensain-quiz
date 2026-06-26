import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages: set base to '/<repo-name>/' when deploying
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/jidousha-kensain-quiz/' : '/',
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, 'data'),
    },
  },
});
