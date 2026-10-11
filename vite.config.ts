import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { YoutubeTranscript } from 'youtube-transcript';

// Custom Vite plugin to serve YouTube transcript endpoint on localhost
function youtubeTranscriptPlugin() {
  return {
    name: 'youtube-transcript-api',
    configureServer(server: any) {
      server.middlewares.use('/api/youtube-transcript', async (req: any, res: any) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const videoId = url.searchParams.get('videoId');
          const lang = url.searchParams.get('lang') || 'en';

          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'videoId is required' }));
            return;
          }

          let transcript: any[] = [];
          try {
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
          } catch (firstErr) {
            // Fallback without language constraint
            transcript = await YoutubeTranscript.fetchTranscript(videoId);
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, transcript }));
        } catch (err: any) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: false, 
            error: err?.message || 'Legenda do YouTube não disponível para este vídeo' 
          }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), youtubeTranscriptPlugin()],
  build: {
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@supabase')) return 'vendor-supabase';
            return 'vendor';
          }
        }
      }
    }
  },
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
