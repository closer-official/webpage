/**
 * フロントの seo.ts と同じルールで正規URLを解決（サーバー側 buildHtml / キュー処理用）
 */

function slugifyForSubdomain(name) {
  const n = String(name).normalize('NFKC').trim().toLowerCase();
  let s = n
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-]/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!s) {
    let h = 2166136261;
    for (let i = 0; i < n.length; i++) h = Math.imul(h ^ n.charCodeAt(i), 16777619);
    s = 'site-' + (h >>> 0).toString(36).slice(0, 10);
  }
  return s.slice(0, 63);
}

/**
 * @param {object} seo
 * @param {string} siteName
 * @param {string} templateId
 * @param {string} [envDefaultHost]
 */
export function resolveEffectiveCanonicalUrl(seo, siteName, templateId, envDefaultHost = '') {
  const manual = String(seo.canonicalUrl || '').trim();
  if (manual) return manual;
  let host = String(seo.autoCanonicalHost || '').trim();
  if (!host && templateId === 'event') host = 'event-view.net';
  if (!host && envDefaultHost) host = String(envDefaultHost).trim();
  if (!host) return '';
  host = host.replace(/^https?:\/\//i, '').split('/')[0]?.trim() ?? '';
  if (!host) return '';
  const slug = slugifyForSubdomain(siteName || 'site');
  if (!slug) return '';
  return `https://${slug}.${host}/`;
}
