import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // scripts/ holds the scraper's shallow clones of four slicer repos plus its HTTP
        // cache — ~34,000 files that no part of the app imports. Left unignored, the dev
        // server's file watcher indexes every one of them and dies at the 4 GB heap limit.
        watch: { ignored: ['**/scripts/**', '**/dist/**'] },
      },
      // Same reason: scan the real entry point rather than globbing the project for one.
      optimizeDeps: { entries: ['index.tsx'] },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
