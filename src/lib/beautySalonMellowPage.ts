import type { PageContent, SEOData } from '../types';
import { applyBeautySalonMellowReplacements } from '../../shared/beautySalonMellowApply.js';
import bsmCss from '../../server/beautySalonMellow/generated.css?raw';
import bsmBody from '../../server/beautySalonMellow/generated-body.html?raw';

const BSM_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Sans+JP:wght@300;400;500&display=swap" rel="stylesheet">`;

const BSM_SKIP_CSS = `
  .bsm-root .skip-link { position: absolute; top: -4rem; left: 16px; z-index: 10001; padding: 8px 16px; background: var(--ink,#2a2420); color: var(--ivory,#f9f6f1); text-decoration: none; border-radius: 4px; font-size: 0.8rem; transition: top 0.25s ease; }
  .bsm-root .skip-link:focus { top: 12px; outline: 2px solid var(--gold,#c9a96e); outline-offset: 2px; }
`;

export function buildBeautySalonMellowFullDocument(opts: {
  escapeHtml: (s: string) => string;
  content: PageContent;
  seo: SEOData;
  metaTags: string;
  jsonLd: string;
}): string {
  const { escapeHtml, content, metaTags, jsonLd } = opts;
  const inner = applyBeautySalonMellowReplacements(bsmBody, content as unknown as Record<string, unknown>, escapeHtml);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    ${BSM_FONTS}
    <script type="application/ld+json">${jsonLd}</script>
    <style>${BSM_SKIP_CSS}
${bsmCss}</style>
</head>
<body class="bsm-root">
  <a href="#bsm-main" class="skip-link">メインコンテンツへ</a>
  <main id="bsm-main">
${inner}
  </main>
</body>
</html>`;
}
