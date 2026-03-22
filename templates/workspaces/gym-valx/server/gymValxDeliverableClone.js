import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** このファイルからリポジトリルート（…/webpage） */
const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');

export const DEFAULT_GYM_VALX_SLUG = 'gym-valx-intro';

/**
 * public/deliverables/gym-valx-intro/index.html の <body> 内を
 * <main><div class="vgx-deliverable">…</div></main> で返す（静的・差し替えなし）。
 *
 * 見た目の本体は **このワークスペースの README** にある `public/deliverables/...` を編集してください。
 */
export function buildGymValxDeliverableMainHtml() {
  const deliverablePath = path.join(
    REPO_ROOT,
    'public',
    'deliverables',
    DEFAULT_GYM_VALX_SLUG,
    'index.html',
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
