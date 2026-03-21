import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_GYM_VALX_SLUG = 'gym-valx-intro';

/**
 * public/deliverables/gym-valx-intro/index.html の <body> 内を
 * <main><div class="vgx-deliverable">…</div></main> で返す（静的・差し替えなし）。
 */
export function buildGymValxDeliverableMainHtml() {
  const deliverablePath = path.join(
    __dirname,
    '..',
    'public',
    'deliverables',
    DEFAULT_GYM_VALX_SLUG,
    'index.html'
  );
  const raw = fs.readFileSync(deliverablePath, 'utf8');
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('gym-valx deliverable: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="vgx-deliverable">
${inner}
</div>
</main>`;
}
