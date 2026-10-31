import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // Chart.js menyebabkan bundle besar; naikkan batas warning
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-charts':  ['chart.js', 'react-chartjs-2'],
          'vendor-icons':   ['lucide-react'],
        },
      },
    },
  },
});
