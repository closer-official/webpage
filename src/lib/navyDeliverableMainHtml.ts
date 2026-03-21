import { DEFAULT_NAVY_DELIVERABLE_SLUG } from './navyDeliverableConstants';

const DEFAULT_LINE = 'https://lin.ee/nLMnCmt';
const DEFAULT_TIKTOK = 'https://lite.tiktok.com/t/ZS9RPVvCBsTpb-OZms8/';

const rawGlob = import.meta.glob('../../public/deliverables/*/index.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function sanitizeNavyDeliverableSlugClient(slug: string | undefined): string {
  const s = (slug && slug.trim()) || DEFAULT_NAVY_DELIVERABLE_SLUG;
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(s)) {
    console.warn(`[navy] 無効な navyDeliverableSlug "${slug}" — 既定にフォールバック`);
    return DEFAULT_NAVY_DELIVERABLE_SLUG;
  }
  return s;
}

function getNavyDeliverableRaw(slug: string | undefined): string {
  const s = sanitizeNavyDeliverableSlugClient(slug);
  const normalized = (k: string) => k.replace(/\\/g, '/');
  for (const [key, mod] of Object.entries(rawGlob)) {
    const nk = normalized(key);
    if (nk.includes(`/deliverables/${s}/index.html`)) {
      return mod as string;
    }
  }
  for (const [key, mod] of Object.entries(rawGlob)) {
    if (normalized(key).includes(`/deliverables/${DEFAULT_NAVY_DELIVERABLE_SLUG}/index.html`)) {
      console.warn(`[navy] slug "${s}" の HTML がバンドルに無いため既定を使用`);
      return mod as string;
    }
  }
  throw new Error('navy deliverable: no index.html matched in Vite glob');
}

/** プレビュー用：納品 index.html から body 内を取り出し、末尾 script を除き URL を差し替えて main で包む */
export function buildNavyDeliverableMainHtmlClient(
  escapeHtmlFn: (s: string) => string,
  lineUrl: string | undefined,
  tiktokUrl: string | undefined,
  navyDeliverableSlug?: string
): string {
  const lineEsc = escapeHtmlFn((lineUrl && lineUrl.trim()) || DEFAULT_LINE);
  const tiktokEsc = escapeHtmlFn((tiktokUrl && tiktokUrl.trim()) || DEFAULT_TIKTOK);

  const deliverableIndexRaw = getNavyDeliverableRaw(navyDeliverableSlug);

  const bodyMatch = deliverableIndexRaw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('navy deliverable: <body> not found');

  let inner = bodyMatch[1].trim();
  const lastScript = inner.lastIndexOf('<script>');
  if (lastScript !== -1) {
    inner = inner.slice(0, lastScript).replace(/\s+$/, '');
  }

  inner = inner.split(DEFAULT_LINE).join(lineEsc);
  inner = inner.split(DEFAULT_TIKTOK).join(tiktokEsc);

  return `<main id="main-content">
<div class="nc-jh-deliverable">
${inner}
</div>
</main>`;
}
