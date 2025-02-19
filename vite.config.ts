import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from '@samrum/vite-plugin-web-extension';
import manifest from './manifest';

export default defineConfig({
  plugins: [
    react(),
    webExtension({ manifest }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'public/popup.html',
        background: './src/background.ts'
      },
    },
  },
});
