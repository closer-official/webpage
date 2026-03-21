import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** public/deliverables/{slug}/index.html（既定: craft-editorial-intro） */
export const DEFAULT_CRAFT_EDITORIAL_SLUG = 'craft-editorial-intro';

/** @param {string | undefined} slug */
export function sanitizeCraftEditorialSlug(slug) {
  const s = (slug && String(slug).trim()) || DEFAULT_CRAFT_EDITORIAL_SLUG;
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(s)) {
    throw new Error(`Invalid craft editorial slug: "${slug}"`);
  }
  const fullPath = path.join(__dirname, '..', 'public', 'deliverables', s, 'index.html');
  if (!fs.existsSync(fullPath)) {
    throw new Error(`craft editorial deliverable not found: "${s}"`);
  }
  return s;
}

/**
 * 職人・編集型 LP（public/deliverables/{slug}/index.html）の <body> 内を読み取り、
 * 末尾スクリプトも含めたまま <main><div class="ced-deliverable">…</div></main> で返す。
 */
export function buildCraftEditorialDeliverableMainHtml(_escapeHtmlFn, slug) {
  const s = sanitizeCraftEditorialSlug(slug);
  const deliverablePath = path.join(__dirname, '..', 'public', 'deliverables', s, 'index.html');
  const raw = fs.readFileSync(deliverablePath, 'utf8');
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('craft editorial: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="ced-deliverable">
${inner}
</div>
</main>`;
}
