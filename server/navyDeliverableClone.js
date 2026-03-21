import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_NAVY_DELIVERABLE_SLUG = 'web-closer-intro';

export const NAVY_DELIVERABLE_DEFAULT_LINE = 'https://lin.ee/nLMnCmt';
export const NAVY_DELIVERABLE_DEFAULT_TIKTOK = 'https://lite.tiktok.com/t/ZS9RPVvCBsTpb-OZms8/';

/** @param {string | undefined} slug */
export function sanitizeNavyDeliverableSlug(slug) {
  const s = (slug && String(slug).trim()) || DEFAULT_NAVY_DELIVERABLE_SLUG;
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(s)) {
    throw new Error(`Invalid navyDeliverableSlug: "${slug}"`);
  }
  const fullPath = path.join(__dirname, '..', 'public', 'deliverables', s, 'index.html');
  if (!fs.existsSync(fullPath)) {
    throw new Error(`navy deliverable not found: "${s}"`);
  }
  return s;
}

/**
 * 納品LP（public/deliverables/{slug}/index.html）の <body> 内を読み取り、
 * 末尾の動的差し替え用 <script> を除き、LINE/TikTok URL を置換して
 * <main><div class="nc-jh-deliverable">…</div></main> で返す。
 * 既定は web-closer-intro（テンプレ14）。納品デモは japanese-history-higashi を navyDeliverableSlug で指定。
 */
export function buildNavyDeliverableMainHtml(escapeHtmlFn, lineUrl, tiktokUrl, slug) {
  const s = sanitizeNavyDeliverableSlug(slug);
  const deliverablePath = path.join(__dirname, '..', 'public', 'deliverables', s, 'index.html');

  const lineEsc = escapeHtmlFn(
    (lineUrl && String(lineUrl).trim()) || NAVY_DELIVERABLE_DEFAULT_LINE
  );
  const tiktokEsc = escapeHtmlFn(
    (tiktokUrl && String(tiktokUrl).trim()) || NAVY_DELIVERABLE_DEFAULT_TIKTOK
  );

  const raw = fs.readFileSync(deliverablePath, 'utf8');
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('navy deliverable: <body> not found');

  let inner = bodyMatch[1].trim();
  const lastScript = inner.lastIndexOf('<script>');
  if (lastScript !== -1) {
    inner = inner.slice(0, lastScript).replace(/\s+$/, '');
  }

  inner = inner.split(NAVY_DELIVERABLE_DEFAULT_LINE).join(lineEsc);
  inner = inner.split(NAVY_DELIVERABLE_DEFAULT_TIKTOK).join(tiktokEsc);

  return `<main id="main-content">
<div class="nc-jh-deliverable">
${inner}
</div>
</main>`;
}
