import { DEFAULT_APPAREL_LOOKBOOK_SLUG } from './apparelLookbookConstants';

const rawGlob = import.meta.glob('../../public/deliverables/*/index.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function sanitizeSlug(slug: string | undefined): string {
  const s = (slug && slug.trim()) || DEFAULT_APPAREL_LOOKBOOK_SLUG;
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(s)) {
    console.warn(`[apparel-lookbook] 無効な slug "${slug}" — 既定にフォールバック`);
    return DEFAULT_APPAREL_LOOKBOOK_SLUG;
  }
  return s;
}

function getDeliverableRaw(slug: string | undefined): string {
  const s = sanitizeSlug(slug);
  const normalized = (k: string) => k.replace(/\\/g, '/');
  for (const [key, mod] of Object.entries(rawGlob)) {
    const nk = normalized(key);
    if (nk.includes(`/deliverables/${s}/index.html`)) {
      return mod as string;
    }
  }
  for (const [key, mod] of Object.entries(rawGlob)) {
    if (normalized(key).includes(`/deliverables/${DEFAULT_APPAREL_LOOKBOOK_SLUG}/index.html`)) {
      console.warn(`[apparel-lookbook] slug "${s}" の HTML がバンドルに無いため既定を使用`);
      return mod as string;
    }
  }
  throw new Error('apparel lookbook: no index.html matched in Vite glob');
}

/** プレビュー用：納品 index.html から body 内を取り出し（スクリプト保持）、main で包む */
export function buildApparelLookbookDeliverableMainHtmlClient(
  _escapeHtmlFn: (s: string) => string,
  slug?: string
): string {
  const deliverableIndexRaw = getDeliverableRaw(slug);
  const bodyMatch = deliverableIndexRaw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('apparel lookbook: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="alb-deliverable">
${inner}
</div>
</main>`;
}
