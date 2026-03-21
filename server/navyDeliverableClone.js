import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DELIVERABLE_PATH = path.join(
  __dirname,
  '..',
  'public',
  'deliverables',
  'japanese-history-higashi',
  'index.html'
);

export const NAVY_DELIVERABLE_DEFAULT_LINE = 'https://lin.ee/nLMnCmt';
export const NAVY_DELIVERABLE_DEFAULT_TIKTOK = 'https://lite.tiktok.com/t/ZS9RPVvCBsTpb-OZms8/';

/**
 * 納品LP（public/deliverables/…/index.html）の <body> 内を読み取り、
 * 末尾の動的差し替え用 <script> を除き、LINE/TikTok URL を置換して
 * <main><div class="nc-jh-deliverable">…</div></main> で返す。
 * 納品ファイル自体は変更しない。
 */
export function buildNavyDeliverableMainHtml(escapeHtmlFn, lineUrl, tiktokUrl) {
  const lineEsc = escapeHtmlFn(
    (lineUrl && String(lineUrl).trim()) || NAVY_DELIVERABLE_DEFAULT_LINE
  );
  const tiktokEsc = escapeHtmlFn(
    (tiktokUrl && String(tiktokUrl).trim()) || NAVY_DELIVERABLE_DEFAULT_TIKTOK
  );

  const raw = fs.readFileSync(DELIVERABLE_PATH, 'utf8');
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
