import { DEFAULT_GYM_VALX_SLUG } from './gymValxConstants';

const rawGlob = import.meta.glob('../../public/deliverables/*/index.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function getGymValxDeliverableRaw(): string {
  const normalized = (k: string) => k.replace(/\\/g, '/');
  for (const [key, mod] of Object.entries(rawGlob)) {
    const nk = normalized(key);
    if (nk.includes(`/deliverables/${DEFAULT_GYM_VALX_SLUG}/index.html`)) {
      return mod as string;
    }
  }
  throw new Error('gym-valx deliverable: no index.html matched in Vite glob');
}

/** プレビュー用：納品 index.html から body 内を取り出し <main> で包む */
export function buildGymValxDeliverableMainHtmlClient(_escapeHtmlFn: (s: string) => string): string {
  const deliverableIndexRaw = getGymValxDeliverableRaw();
  const bodyMatch = deliverableIndexRaw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('gym-valx deliverable: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="vgx-deliverable">
${inner}
</div>
</main>`;
}
