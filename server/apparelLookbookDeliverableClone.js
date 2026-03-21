import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** public/deliverables/{slug}/index.html（既定: apparel-lookbook-intro） */
export const DEFAULT_APPAREL_LOOKBOOK_SLUG = 'apparel-lookbook-intro';

/** @param {string | undefined} slug */
export function sanitizeApparelLookbookSlug(slug) {
  const s = (slug && String(slug).trim()) || DEFAULT_APPAREL_LOOKBOOK_SLUG;
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(s)) {
    throw new Error(`Invalid apparel lookbook slug: "${slug}"`);
  }
  const fullPath = path.join(__dirname, '..', 'public', 'deliverables', s, 'index.html');
  if (!fs.existsSync(fullPath)) {
    throw new Error(`apparel lookbook deliverable not found: "${s}"`);
  }
  return s;
}

/**
 * アパレル・ルックブック LP（public/deliverables/{slug}/index.html）の <body> 内を読み取り、
 * 末尾スクリプトも含めたまま <main><div class="alb-deliverable">…</div></main> で返す。
 */
export function buildApparelLookbookDeliverableMainHtml(_escapeHtmlFn, slug) {
  const s = sanitizeApparelLookbookSlug(slug);
  const deliverablePath = path.join(__dirname, '..', 'public', 'deliverables', s, 'index.html');
  const raw = fs.readFileSync(deliverablePath, 'utf8');
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('apparel lookbook: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="alb-deliverable">
${inner}
</div>
</main>`;
}
