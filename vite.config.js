import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"; 
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@charts': path.resolve(__dirname, './src/components/charts'),
      '@filters': path.resolve(__dirname, './src/components/filters'),
      '@tables': path.resolve(__dirname, './src/components/tables'),
      '@layouts': path.resolve(__dirname, './src/components/layouts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@data': path.resolve(__dirname, './src/data'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false   // <-- This prevents Vite from cleaning outDir before building to avoid loading module issue in production
  },
  server: {
    port: 3002,
    proxy: {
      "/api": {
        target: "http://localhost:4000", // Your Express server port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
