import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '7e4d-190-10-170-234.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        //rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
