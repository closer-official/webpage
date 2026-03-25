const rawGlob = import.meta.glob('../../templates/workspaces/wiki-ensyuritsu/embed/index.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function getWikiEnsyuritsuEmbedRaw(): string {
  const keys = Object.keys(rawGlob);
  if (keys.length === 0) {
    throw new Error('wiki-ensyuritsu embed: index.html not found in Vite glob');
  }
  return rawGlob[keys[0]] as string;
}

/** プレビュー用：embed/index.html から body 内を取り出し gym-valx と同形で <main> で包む */
export function buildWikiEnsyuritsuDeliverableMainHtmlClient(_escapeHtmlFn: (s: string) => string): string {
  const raw = getWikiEnsyuritsuEmbedRaw();
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('wiki-ensyuritsu embed: <body> not found');
  const inner = bodyMatch[1].trim();
  return `<main id="main-content">
<div class="wes-deliverable">
${inner}
</div>
</main>`;
}
