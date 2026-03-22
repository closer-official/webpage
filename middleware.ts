/**
 * 1) webpage.closer-official.com: HTTP Basic（WEBPAGE_BASIC_AUTH_* 必須・未設定は503）。
 *    ヒアリング・テンプレギャラリー等の公開パスだけ Basic なし（isPublicHearingPath）。
 * 2) preview.{ドメイン}: /pv{24hex} → ジムLP プレビュー（salesPreview クエリ）
 * 3) supernihonshi.store-official.net: 日本史LP をルートに返す
 * 4) *.store-official.net（店舗サブドメイン）: ルート `/` だけジムLPテンプレへリライト
 */
import { next, rewrite } from '@vercel/edge';

const WEBPAGE_BASIC_HOSTS = new Set(['webpage.closer-official.com', 'www.webpage.closer-official.com']);

const LP_HOSTS = new Set(['supernihonshi.store-official.net', 'www.supernihonshi.store-official.net']);
const LP_BASE = '/deliverables/japanese-history-higashi';

const GYM_SALES_PREVIEW_PATH = '/deliverables/gym-valx-intro/index.html';
const GYM_STOREFRONT_PATH = '/deliverables/gym-valx-intro/index.html';

function previewHostname(): string {
  return (process.env.SALES_PREVIEW_HOSTNAME || 'preview.closer-official.com').toLowerCase();
}

function isStoreOfficialSubdomain(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'store-official.net' || h === 'www.store-official.net') return false;
  return h.endsWith('.store-official.net');
}

/** ヒアリング・テンプレギャラリー・テンプレプレビュー等（/api/customer-intake-list は含めない） */
function isPublicHearingPath(method: string, pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  const m = method.toUpperCase();
  const isIntakeForm = p === '/api/customer-intake' || p === '/customer-intake';
  const isDraftApi = p === '/api/customer-intake-draft' || p.startsWith('/api/customer-intake-draft/');
  const isTemplatePreview = p.startsWith('/api/template-preview/');
  const isTemplateGallery =
    p === '/api/template-gallery' ||
    p === '/template-gallery' ||
    p === '/api/public/template-catalog';
  const isPublicTranslate = p === '/api/public/translate-ui';

  if (m === 'OPTIONS') {
    return isIntakeForm || isDraftApi || isTemplatePreview || isTemplateGallery || isPublicTranslate;
  }
  if (isIntakeForm && (m === 'GET' || m === 'POST')) return true;
  if (m === 'GET' && isTemplatePreview) return true;
  if (m === 'GET' && isTemplateGallery) return true;
  if (m === 'POST' && isPublicTranslate) return true;
  if (m === 'POST' && p === '/api/customer-intake-draft') return true;
  if (m === 'GET' && p.startsWith('/api/customer-intake-draft/')) return true;
  return false;
}

/** @returns 401 / 503 Response or null（通過） */
function gateWebpageBasicAuth(request: Request, host: string): Response | null {
  if (!WEBPAGE_BASIC_HOSTS.has(host)) return null;

  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  // Vercel Cron: サーバー側で CRON_SECRET を検証するため Basic 認証は不要
  if (path === '/api/auto-process/tick' || path === '/api/auto-process/tick/') {
    return null;
  }

  if (isPublicHearingPath(method, path)) {
    return null;
  }

  const user = (process.env.WEBPAGE_BASIC_AUTH_USER || '').trim();
  const pass = (process.env.WEBPAGE_BASIC_AUTH_PASSWORD || '').trim();
  if (!user || !pass) {
    return new Response(
      'このドメインでは WEBPAGE_BASIC_AUTH_USER と WEBPAGE_BASIC_AUTH_PASSWORD を Vercel の環境変数に設定してください。',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, private',
        },
      },
    );
  }

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) {
    return new Response('認証が必要です', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Closer Webpage"',
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
      },
    });
  }

  let decoded = '';
  try {
    decoded = atob(auth.slice(6).trim());
  } catch {
    return new Response('認証が不正です', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Closer Webpage"',
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
      },
    });
  }

  const colon = decoded.indexOf(':');
  const u = colon >= 0 ? decoded.slice(0, colon) : decoded;
  const p = colon >= 0 ? decoded.slice(colon + 1) : '';

  if (u !== user || p !== pass) {
    return new Response('認証が不正です', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Closer Webpage"',
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
      },
    });
  }

  return null;
}

/** CDN が Authorization を無視して認証済み HTML を共有キャッシュしないよう付与 */
function withWebpageAuthVary(host: string, response: Response): Response {
  if (!WEBPAGE_BASIC_HOSTS.has(host)) return response;
  const h = new Headers(response.headers);
  const prev = h.get('Vary');
  h.set('Vary', prev ? `${prev}, Authorization` : 'Authorization');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: h,
  });
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  const basicBlock = gateWebpageBasicAuth(request, host);
  if (basicBlock) return basicBlock;

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

  if (LP_HOSTS.has(host)) {
    if (url.pathname.startsWith('/api')) {
      return next();
    }
    const path = url.pathname === '/' || url.pathname === '' ? '/index.html' : url.pathname;
    const dest = new URL(`${LP_BASE}${path}`, url.origin);
    return rewrite(dest);
  }

  if (isStoreOfficialSubdomain(host)) {
    if (url.pathname.startsWith('/api')) {
      return next();
    }
    const p = url.pathname.replace(/\/$/, '') || '/';
    if (p === '/') {
      return rewrite(new URL(GYM_STOREFRONT_PATH, url.origin));
    }
    return next();
  }

  const res = await next();
  return withWebpageAuthVary(host, res);
}

/** /api を含む全パスで Basic 認証をかけられるようにする（旧設定は api を除外していた） */
export const config = {
  matcher: ['/', '/((?!_next).*)'],
};
