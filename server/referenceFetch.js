/**
 * 参考サイトのHTML取得（スタイル抽出・ブループリント生成で共用）
 */
import fetch from 'node-fetch';

export const REF_MAX_BYTES = 400_000;
export const REF_TIMEOUT_MS = 12000;

/**
 * @param {string} urlStr
 * @returns {Promise<{ url: URL, html: string }>}
 */
export async function fetchReferenceHtml(urlStr) {
  let url;
  try {
    url = new URL(String(urlStr).trim());
  } catch {
    throw new Error('URLの形式が正しくありません。');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('http / https のURLのみ対応しています。');
  }

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), REF_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CloserDesignBot/1.0; +https://webpage.closer-official.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`取得に失敗しました（HTTP ${res.status}）`);

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > REF_MAX_BYTES ? buf.slice(0, REF_MAX_BYTES) : buf;
    const html = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(slice));
    return { url, html };
  } catch (e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') throw new Error('取得がタイムアウトしました。');
    throw e;
  }
}
