const rawGlob = import.meta.glob('../../templates/workspaces/wiki-sauna/embed/react-body.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function getWikiSaunaReactBody(): string {
  const keys = Object.keys(rawGlob);
  if (keys.length === 0) {
    throw new Error('wiki-sauna: react-body.html not found in Vite glob');
  }
  return rawGlob[keys[0]] as string;
}

/** プレビュー用：react-body + エントリ script（開発は Vite の TS 直読み） */
export function buildWikiSaunaDeliverableMainHtmlClient(_escapeHtmlFn: (s: string) => string): string {
  void _escapeHtmlFn;
  const scriptSrc = import.meta.env.PROD ? '/assets/wiki-sauna-app.js' : '/src/wikiSaunaMain.tsx';
  const styles = import.meta.env.PROD
    ? '<link rel="stylesheet" href="/assets/wiki-sauna-app.css"/>'
    : '';
  const devBoot =
    !import.meta.env.PROD && scriptSrc.includes('/src/')
      ? `<script type="module">
import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
</script>
<script type="module" src="/@vite/client"></script>
`
      : '';
  const inner = getWikiSaunaReactBody()
    .replaceAll('__WIKI_SAUNA_DEV_BOOT__', devBoot)
    .replaceAll('__WIKI_SAUNA_STYLES__', styles)
    .replaceAll('__WIKI_SAUNA_SCRIPT__', scriptSrc);
  return `<main id="main-content">
<div class="wss-deliverable">
${inner}
</div>
</main>`;
}
