import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // GitHub Pages serves from /advanced-budget-tracker/
  base: '/advanced-budget-tracker/',

  server: {
    port: 3000,
    open: true,
    // Local dev proxy — not used on GitHub Pages
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
