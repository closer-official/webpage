/**
 * 1) preview.{ドメイン}: /pv{24hex} → ジムLP プレビュー（salesPreview クエリ）
 * 2) supernihonshi.store-official.net: 日本史LP をルートに返す
 * 3) webpage.closer-official.com: ルートは運営SPA（postbuild で dist ルートがジムLPになるのを上書き）
 */
import { next, rewrite } from '@vercel/edge';

/** ルート `/` を Vite 管理画面（/admin/index.html）に内部リライトするホスト */
const ADMIN_AT_ROOT_HOSTS = new Set(['webpage.closer-official.com', 'www.webpage.closer-official.com']);

const LP_HOSTS = new Set(['supernihonshi.store-official.net', 'www.supernihonshi.store-official.net']);
const LP_BASE = '/deliverables/japanese-history-higashi';

const GYM_SALES_PREVIEW_PATH = '/deliverables/gym-valx-intro/index.html';

function previewHostname(): string {
  return (process.env.SALES_PREVIEW_HOSTNAME || 'preview.closer-official.com').toLowerCase();
}

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  if (host === previewHostname()) {
    if (url.pathname.startsWith('/api')) {
      return next();
    }
    const path = url.pathname.replace(/\/$/, '') || '/';
    const m = path.match(/^\/(pv[a-f0-9]{24})$/);
    if (m) {
      const id = m[1];
      const dest = new URL(`${GYM_SALES_PREVIEW_PATH}?salesPreview=${encodeURIComponent(id)}`, url.origin);
      return rewrite(dest);
    }
    if (path === '/') {
      return new Response('プレビューIDのパスを指定してください（例: /pv...）。', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    return next();
  }

  if (ADMIN_AT_ROOT_HOSTS.has(host)) {
    if (url.pathname.startsWith('/api')) {
      return next();
    }
    const p = url.pathname.replace(/\/$/, '') || '/';
    if (p === '/') {
      return rewrite(new URL('/admin/index.html', url.origin));
    }
    return next();
  }

  if (!LP_HOSTS.has(host)) {
    return next();
  }

  if (url.pathname.startsWith('/api')) {
    return next();
  }

  const path = url.pathname === '/' || url.pathname === '' ? '/index.html' : url.pathname;
  const dest = new URL(`${LP_BASE}${path}`, url.origin);
  return rewrite(dest);
}

export const config = {
  matcher: ['/', '/((?!api/).*)'],
};
