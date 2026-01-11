import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
    plugins: [
      react(),
      sentryVitePlugin({
        org: "lesz-4711",
        project: "lesz-academic-agent",
        authToken: env.BASE_SENTRY_AUTH_TOKEN,
        telemetry: false,
      }),
    ],
    build: {
      sourcemap: true, // Needed for Sentry
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
  };
});
