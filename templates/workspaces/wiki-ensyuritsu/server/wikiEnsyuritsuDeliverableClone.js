import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** リポジトリルート（…/webpage） */
const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');

/**
 * templates/workspaces/wiki-ensyuritsu/embed/index.html の <body> 内を
 * <main><div class="wes-deliverable">…</div></main> で返す（静的）。
 * 編集は embed/index.html。納品物 public/deliverables には依存しない。
 */
export function buildWikiEnsyuritsuDeliverableMainHtml() {
  const deliverablePath = path.join(
    REPO_ROOT,
    'templates',
    'workspaces',
    'wiki-ensyuritsu',
    'embed',
    'index.html',
  );
  const raw = fs.readFileSync(deliverablePath, 'utf8');
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('wiki-ensyuritsu embed: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="wes-deliverable">
${inner}
</div>
</main>`;
}
