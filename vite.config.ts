import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/audio-proxy': {
        target: 'https://audio.hyperlingua.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/audio-proxy/, '')
      },
      '/nvidia-proxy': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nvidia-proxy/, '')
      }
    }
  }
});
