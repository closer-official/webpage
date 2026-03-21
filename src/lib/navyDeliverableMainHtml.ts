import deliverableIndexRaw from '../../public/deliverables/japanese-history-higashi/index.html?raw';

const DEFAULT_LINE = 'https://lin.ee/nLMnCmt';
const DEFAULT_TIKTOK = 'https://lite.tiktok.com/t/ZS9RPVvCBsTpb-OZms8/';

/** プレビュー用：納品 index.html から body 内を取り出し、末尾 script を除き URL を差し替えて main で包む */
export function buildNavyDeliverableMainHtmlClient(
  escapeHtmlFn: (s: string) => string,
  lineUrl: string | undefined,
  tiktokUrl: string | undefined
): string {
  const lineEsc = escapeHtmlFn((lineUrl && lineUrl.trim()) || DEFAULT_LINE);
  const tiktokEsc = escapeHtmlFn((tiktokUrl && tiktokUrl.trim()) || DEFAULT_TIKTOK);

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
