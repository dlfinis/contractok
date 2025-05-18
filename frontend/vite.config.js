import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '8556-190-9-183-30.ngrok-free.app'
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
