import app from '../server/index.js';

/**
 * Vercel の rewrite で /api/foo → /api だけ届き Express がルートにマッチしない問題を避ける。
 * vercel.json: destination "/api?_vp=$1" でサブパスを渡す。
 */
export default function handler(req, res) {
  try {
    const raw = req.url || '/';
    const base = 'http://internal';
    let pathname;
    let search = '';
    try {
      const u = new URL(raw, base);
      pathname = u.pathname;
      search = u.search;
    } catch {
      pathname = raw.split('?')[0] || '/';
      const qi = raw.indexOf('?');
      search = qi >= 0 ? raw.slice(qi) : '';
    }

    const u2 = new URL(pathname + search, base);
    const vp = u2.searchParams.get('_vp');
    if (vp) {
      u2.searchParams.delete('_vp');
      const rest = u2.searchParams.toString();
      req.url = `/api/${vp.replace(/^\//, '')}${rest ? `?${rest}` : ''}`;
    }

    return app(req, res);
  } catch (e) {
    console.error('[api/index]', e);
    if (!res.headersSent) {
      res.status(500).json({
        error: e?.message || 'FUNCTION_INVOCATION_FAILED',
        hint: 'Vercel ログを確認してください。環境変数 GOOGLE_MAPS_API_KEY / GEMINI_API_KEY / Supabase も要確認です。',
      });
    }
  }
}
