import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rewriteKodoYoutubeSlideshowUrl(req: Connect.IncomingMessage): void {
  const raw = req.url ?? '';
  const pathname = raw.split('?')[0] ?? '';
  if (pathname === '/kodo-youtube-slideshow' || pathname === '/kodo-youtube-slideshow/') {
    const q = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
    req.url = '/kodo-youtube-slideshow/index.html' + q;
  }
}

/** public/kodo-youtube-slideshow/index.html を、末尾スラッシュ付きURLでも拾わせる（SPA フォールバック防止） */
function kodoYoutubeSlideshowStatic(): {
  name: string;
  enforce: 'pre';
  configureServer(server: { middlewares: Connect.Server }): void;
  configurePreviewServer(server: { middlewares: Connect.Server }): void;
} {
  return {
    name: 'kodo-youtube-slideshow-static',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteKodoYoutubeSlideshowUrl(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteKodoYoutubeSlideshowUrl(req);
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  /** 運営SPAはサイトルート。店舗 *.store-official.net のルートは middleware でジムLPへリライト */
  base: '/',
  plugins: [kodoYoutubeSlideshowStatic(), react()],
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
