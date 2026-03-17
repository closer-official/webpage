/**
 * URL から HTML を取得し、<title> と <meta name="description"> を抽出する。
 * includeHtmlForDesign: true のときは htmlSnippet（デザイン抽出用の先頭部分）も返す。
 */
export async function fetchPageMeta(url, options = {}) {
  const { includeHtmlForDesign = false } = options;
  if (!url || !url.startsWith('http')) {
    return includeHtmlForDesign
      ? { title: null, metaDescription: null, htmlSnippet: null }
      : { title: null, metaDescription: null };
  }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LP-tool/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return includeHtmlForDesign
        ? { title: null, metaDescription: null, htmlSnippet: null }
        : { title: null, metaDescription: null };
    }
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
      || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    const out = {
      title: titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim().slice(0, 200) : null,
      metaDescription: metaMatch ? metaMatch[1].replace(/\s+/g, ' ').trim().slice(0, 300) : null,
    };
    if (includeHtmlForDesign) {
      out.htmlSnippet = html.slice(0, 12000);
    }
    return out;
  } catch {
    return includeHtmlForDesign
      ? { title: null, metaDescription: null, htmlSnippet: null }
      : { title: null, metaDescription: null };
  }
}
