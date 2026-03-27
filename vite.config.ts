import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  /** 運営SPAはサイトルート。店舗 *.store-official.net のルートは middleware でジムLPへリライト */
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        wikiSauna: path.resolve(__dirname, 'wiki-sauna.html'),
      },
      output: {
        entryFileNames(chunkInfo) {
          if (chunkInfo.name === 'wikiSauna') {
            return 'assets/wiki-sauna-app.js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  server: {
    open: '/',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/customer-intake': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/template-gallery': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
