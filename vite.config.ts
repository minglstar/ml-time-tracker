import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from '@samrum/vite-plugin-web-extension';
import manifest from './manifest';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    webExtension({ 
      manifest,
      webExtConfig: {
        background: {
          entry: 'src/background.ts',
        },
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'public/popup.html',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
