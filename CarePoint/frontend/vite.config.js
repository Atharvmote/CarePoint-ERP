import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    open: true,
  },
  
  build: {
    // Optimize output
    minify: 'esbuild',
    // Remove console logs in production
    target: 'esnext',
  },
  esbuild: {
    drop: ['console', 'debugger'],
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'react-toastify'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    
    // Other optimizations
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'socket.io-client'
    ],
  },
});

