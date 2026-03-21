/**
 * supernihonshi.store-official.net 専用:
 * ルートの dist/index.html（React アプリ）より先に、日本史LPを返す。
 * vercel.json の has 付き rewrite だけでは / の静的 index に負けることがあるため Middleware で確実にする。
 */
import { next, rewrite } from '@vercel/edge';

const LP_HOSTS = new Set(['supernihonshi.store-official.net', 'www.supernihonshi.store-official.net']);
const LP_BASE = '/deliverables/japanese-history-higashi';

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

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
