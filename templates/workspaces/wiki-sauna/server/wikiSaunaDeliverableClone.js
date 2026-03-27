import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');

/**
 * 開発: Vite が /src/wikiSaunaMain.tsx を配信（ブラウザは通常 localhost:5173 経由で開く）
 * 本番: npm run build で assets/wiki-sauna-app.js を出力
 * 上書き: 環境変数 WIKI_SAUNA_SCRIPT_SRC（フル URL 可）
 */
function wikiSaunaScriptSrc() {
  const fromEnv = process.env.WIKI_SAUNA_SCRIPT_SRC?.trim();
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === 'production' ? '/assets/wiki-sauna-app.js' : '/src/wikiSaunaMain.tsx';
}

function wikiSaunaStyles() {
  return process.env.NODE_ENV === 'production'
    ? '<link rel="stylesheet" href="/assets/wiki-sauna-app.css"/>'
    : '';
}

/**
 * Express 直返しの HTML には Vite の transformIndexHtml が効かない。
 * @vitejs/plugin-react が index に差す preamble（/@react-refresh）＋ HMR 用 /@vite/client を手動で先頭に入れる。
 * @see node_modules/@vitejs/plugin-react/dist/index.js preambleCode
 */
function wikiSaunaDevBootHtml(scriptSrc) {
  if (process.env.WIKI_SAUNA_SCRIPT_SRC?.trim()) return '';
  if (!String(scriptSrc || '').includes('/src/')) return '';
  return `<script type="module">
import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
</script>
<script type="module" src="/@vite/client"></script>
`;
}

/**
 * templates/workspaces/wiki-sauna/embed/react-body.html を差し込み、React エントリを読み込む。
 */
export function buildWikiSaunaDeliverableMainHtml() {
  const fragmentPath = path.join(
    REPO_ROOT,
    'templates',
    'workspaces',
    'wiki-sauna',
    'embed',
    'react-body.html',
  );
  const raw = fs.readFileSync(fragmentPath, 'utf8');
  const entrySrc = wikiSaunaScriptSrc();
  const inner = raw
    .replaceAll('__WIKI_SAUNA_DEV_BOOT__', wikiSaunaDevBootHtml(entrySrc))
    .replaceAll('__WIKI_SAUNA_STYLES__', wikiSaunaStyles())
    .replaceAll('__WIKI_SAUNA_SCRIPT__', entrySrc);
  return `<main id="main-content">
<div class="wss-deliverable">
${inner}
</div>
</main>`;
}
