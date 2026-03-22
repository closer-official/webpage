import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  /** 運営SPAはサイトルート。店舗 *.store-official.net のルートは middleware でジムLPへリライト */
  base: '/',
  plugins: [react()],
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
})
