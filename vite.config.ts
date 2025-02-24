import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from '@samrum/vite-plugin-web-extension';
import manifest from './manifest';

export default defineConfig({
  base: './',
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
    watch: process.env.NODE_ENV === 'development' ? {} : null,
    sourcemap: true, // 启用 sourcemap 用于断点调试
  },
});
