import type { PageContent, SEOData, TemplateOption } from '../types';
import { buildJsonLd } from './seo';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** プレビュー・エクスポート用の完全なHTMLを生成 */
export function buildHtml(
  content: PageContent,
  seo: SEOData,
  template: TemplateOption,
  options?: { inlineCss?: boolean }
): string {
  const jsonLd = buildJsonLd(content, seo, seo.canonicalUrl || '');

  const metaTags = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `<title>${escapeHtml(seo.metaTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.metaDescription)}">`,
    seo.keywords ? `<meta name="keywords" content="${escapeHtml(seo.keywords)}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(seo.metaTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.metaDescription)}">`,
    seo.ogImageUrl ? `<meta property="og:image" content="${escapeHtml(seo.ogImageUrl)}">` : '',
    seo.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}">` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const bodyClass = `page-wrapper template-${template.id}`;
  const tid = template.id;

  const sectionsDefault = content.sections
    .map(
      (s) =>
        `    <section class="section" aria-labelledby="${s.id}-title">
      <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
    </section>`
    )
    .join('\n');

  const sectionsHtml =
    tid === 'corporate_trust'
      ? `    <div class="section-grid">${content.sections
          .map(
            (s) =>
              `<div class="section-card" aria-labelledby="${s.id}-title">
        <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
        <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
      </div>`
          )
          .join('')}</div>`
      : tid === 'high_energy'
        ? content.sections
            .map(
              (s) =>
                `    <section class="section" aria-labelledby="${s.id}-title">
      <div class="section-inner"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p></div>
    </section>`
            )
            .join('\n')
        : sectionsDefault;

  const heroBgStyle =
    tid === 'dark_edge' && seo.ogImageUrl
      ? ` style="background-image: url(${escapeHtml(seo.ogImageUrl)})"`
      : '';

  const heroSection =
    tid === 'dark_edge'
      ? `<section class="hero">
      <div class="hero-bg"${heroBgStyle}></div>
      <div class="hero-text"><h1>${escapeHtml(content.headline)}</h1><p class="subheadline">${escapeHtml(content.subheadline)}</p></div>
    </section>`
      : `<section class="hero">
      <div class="container">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
      </div>
    </section>`;

  const marqueeText = `${escapeHtml(content.headline)}  ·  ${escapeHtml(content.siteName)}  ·  `;
  const marqueeBar =
    tid === 'high_energy'
      ? `<div class="marquee-bar" aria-hidden="true"><span class="marquee-inner">${marqueeText}${marqueeText}</span></div>`
      : '';

  const css = options?.inlineCss !== false ? template.css : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    <script type="application/ld+json">${jsonLd}</script>
    <style>${css}</style>
</head>
<body class="${bodyClass}">
  ${marqueeBar}
  <header>
    <div class="container">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
    </div>
  </header>
  <main>
    ${heroSection}
    <div class="container">
${sectionsHtml}
    </div>
  </main>
  <footer>
    <div class="container">
      ${escapeHtml(content.footerText)}
    </div>
  </footer>
</body>
</html>`;
}
