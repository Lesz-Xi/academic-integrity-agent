import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
    },
  },
  plugins: [react()],
  build: {
    // Disable source maps in production for security
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - cached separately
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
          'vendor-genai': ['@google/genai'],
        },
      },
    },
  },
});
