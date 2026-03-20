/**
 * 設計ブループリントからHTMLを生成（既存 buildHtml / 業種テンプレに依存しない）
 */
import { generateBlueprintPageModel } from './blueprintContent.js';

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @param {object} blueprint
 * @param {{ override?: { headline?: string; subheadline?: string; navLabels?: string; theme?: object }; page?: ReturnType<typeof generateBlueprintPageModel> }} [options]
 */
export function renderBlueprintHtml(blueprint, options = {}) {
  const bp = blueprint && typeof blueprint === 'object' ? blueprint : null;
  if (!bp || bp.version !== 1) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Blueprint</title></head><body><p>Invalid blueprint</p></body></html>';
  }

  const page = options.page || generateBlueprintPageModel(bp);
  const ov = options.override || {};
  const theme = ov.theme || {};

  const t = bp.tokens;
  const L = bp.layout;
  const ty = bp.typography;
  const sp = t.space;
  const c = {
    bg: theme.bg || t.colors.bg,
    surface: theme.surface || t.colors.surface,
    text: theme.text || t.colors.text,
    muted: theme.muted || t.colors.muted,
    accent: theme.accent || t.colors.accent,
    border: theme.border || t.colors.border,
  };

  const headline = ov.headline || page.heroTitle;
  const subheadline = ov.subheadline || page.heroSub;
  const navLabelsCsv = ov.navLabels;
  let navItems = page.navItems;
  if (navLabelsCsv && String(navLabelsCsv).trim()) {
    navItems = String(navLabelsCsv)
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8)
      .map((label, i) => ({ label, href: i === 0 ? '#top' : `#sec-${i}` }));
  }

  const containerMax = L.containerMaxWidth || 960;
  const density = L.contentDensity || 'normal';
  const sectionPad =
    density === 'compact' ? sp.md : density === 'airy' ? sp['2xl'] * 1.2 : sp.xl;

  const fontHeading = `'Noto Sans JP', ${ty.headingStack || 'system-ui, sans-serif'}`;
  const fontBody = `'Noto Sans JP', ${ty.bodyStack || 'system-ui, sans-serif'}`;

  const css = `
:root {
  --bp-bg: ${c.bg};
  --bp-surface: ${c.surface};
  --bp-text: ${c.text};
  --bp-muted: ${c.muted};
  --bp-accent: ${c.accent};
  --bp-border: ${c.border};
  --bp-space-xs: ${sp.xs}px;
  --bp-space-sm: ${sp.sm}px;
  --bp-space-md: ${sp.md}px;
  --bp-space-lg: ${sp.lg}px;
  --bp-space-xl: ${sp.xl}px;
  --bp-space-2xl: ${sp['2xl']}px;
  --bp-radius-sm: ${t.radius.sm}px;
  --bp-radius-md: ${t.radius.md}px;
  --bp-radius-lg: ${t.radius.lg}px;
  --bp-type-display: ${t.type.display};
  --bp-type-h2: ${t.type.h2};
  --bp-type-lead: ${t.type.lead};
  --bp-type-body: ${t.type.body};
  --bp-container: ${containerMax}px;
  --bp-section-pad: ${typeof sectionPad === 'number' ? `${sectionPad}px` : sectionPad};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body.bp {
  margin: 0;
  font-family: ${fontBody};
  color: var(--bp-text);
  background: var(--bp-bg);
  line-height: 1.6;
  font-size: var(--bp-type-body);
}
.bp a { color: var(--bp-accent); text-underline-offset: 3px; }
.bp-header {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in srgb, var(--bp-bg) 92%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid color-mix(in srgb, var(--bp-border) 40%, transparent);
}
.bp-header-inner {
  max-width: var(--bp-container); margin: 0 auto;
  padding: var(--bp-space-md) var(--bp-space-sm);
  display: flex; align-items: center; justify-content: space-between; gap: var(--bp-space-md); flex-wrap: wrap;
}
.bp-logo { font-weight: 700; letter-spacing: 0.04em; color: var(--bp-text); text-decoration: none; font-size: var(--bp-type-body); }
.bp-nav { display: flex; flex-wrap: wrap; gap: var(--bp-space-sm) var(--bp-space-md); }
.bp-nav a { text-decoration: none; color: var(--bp-muted); font-size: 0.92rem; transition: color .2s; }
.bp-nav a:hover { color: var(--bp-accent); }
.bp-hero {
  padding: var(--bp-space-2xl) var(--bp-space-sm) var(--bp-section-pad);
}
.bp-hero-inner { max-width: var(--bp-container); margin: 0 auto; }
.bp-hero-grid {
  display: grid; grid-template-columns: 1fr; gap: var(--bp-space-xl);
}
@media (min-width: 900px) {
  .bp-hero-grid { grid-template-columns: 1.1fr 0.9fr; align-items: center; }
}
.bp-hero h1 {
  margin: 0 0 var(--bp-space-md);
  font-family: ${fontHeading};
  font-size: var(--bp-type-display);
  font-weight: ${bp.composition?.headingWeight || 700};
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--bp-text);
}
.bp-hero .lead {
  margin: 0;
  font-size: var(--bp-type-lead);
  color: var(--bp-muted);
  max-width: 42em;
}
.bp-hero-img {
  border-radius: var(--bp-radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 40px color-mix(in srgb, var(--bp-text) 12%, transparent);
}
.bp-hero-img img { width: 100%; height: auto; display: block; object-fit: cover; aspect-ratio: 4/3; }
.bp-section {
  padding: var(--bp-section-pad) var(--bp-space-sm);
  border-top: 1px solid color-mix(in srgb, var(--bp-border) 35%, transparent);
}
.bp-section:nth-child(even) { background: color-mix(in srgb, var(--bp-surface) 65%, var(--bp-bg)); }
.bp-section-inner { max-width: var(--bp-container); margin: 0 auto; }
.bp-section h2 {
  margin: 0 0 var(--bp-space-md);
  font-family: ${fontHeading};
  font-size: var(--bp-type-h2);
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--bp-text);
}
.bp-section p { margin: 0 0 var(--bp-space-sm); color: var(--bp-muted); max-width: 52em; }
.bp-section figure { margin: var(--bp-space-lg) 0 0; border-radius: var(--bp-radius-md); overflow: hidden; }
.bp-section figure img { width: 100%; height: auto; display: block; }
.bp-cta {
  margin-top: var(--bp-space-md);
  display: inline-flex; align-items: center; justify-content: center;
  padding: var(--bp-space-sm) var(--bp-space-lg);
  background: var(--bp-accent);
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform .15s, box-shadow .15s;
}
.bp-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px color-mix(in srgb, var(--bp-accent) 35%, transparent); }
.bp-footer {
  padding: var(--bp-space-xl) var(--bp-space-sm);
  text-align: center;
  font-size: 0.85rem;
  color: var(--bp-muted);
  border-top: 1px solid color-mix(in srgb, var(--bp-border) 40%, transparent);
}
.bp-note {
  max-width: var(--bp-container); margin: 0 auto var(--bp-space-md);
  padding: var(--bp-space-sm) var(--bp-space-md);
  background: color-mix(in srgb, var(--bp-accent) 8%, var(--bp-bg));
  border-radius: var(--bp-radius-md);
  font-size: 0.82rem;
  color: var(--bp-muted);
}
`;

  const sectionsHtml = page.sections
    .map(
      (sec, i) => `
<section class="bp-section" id="${escapeHtml(sec.id)}">
  <div class="bp-section-inner">
    <h2>${escapeHtml(sec.title)}</h2>
    <p>${escapeHtml(sec.content)}</p>
    ${i === 1 ? `<figure><img src="${escapeHtml(page.sectionImage)}" alt="" loading="lazy" width="1200" height="800" /></figure>` : ''}
  </div>
</section>`
    )
    .join('\n');

  const navHtml = navItems
    .map((n) => `<a href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`)
    .join('');

  const heroBlock = L.hasHero
    ? `
<section class="bp-hero" id="top">
  <div class="bp-hero-inner">
    <div class="bp-hero-grid">
      <div>
        <h1>${escapeHtml(headline)}</h1>
        <p class="lead">${escapeHtml(subheadline)}</p>
        <a class="bp-cta" href="${escapeHtml(page.ctaHref)}">${escapeHtml(page.ctaLabel)}</a>
      </div>
      <div class="bp-hero-img">
        <img src="${escapeHtml(page.heroImage)}" alt="" width="1600" height="1200" loading="eager" />
      </div>
    </div>
  </div>
</section>`
    : `
<section class="bp-hero" id="top">
  <div class="bp-hero-inner">
    <h1>${escapeHtml(headline)}</h1>
    <p class="lead">${escapeHtml(subheadline)}</p>
    <a class="bp-cta" href="${escapeHtml(page.ctaHref)}">${escapeHtml(page.ctaLabel)}</a>
  </div>
</section>`;

  const metaNote = `<p class="bp-note">${escapeHtml(bp.meta?.note || '')}</p>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="参考URLから数値化した設計ブループリントに基づく新規テンプレのプレビューです。" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body class="bp">
  ${metaNote}
  <header class="bp-header">
    <div class="bp-header-inner">
      <a class="bp-logo" href="#top">${escapeHtml(page.siteName)}</a>
      <nav class="bp-nav" aria-label="主要ナビ">${navHtml}</nav>
    </div>
  </header>
  ${heroBlock}
  ${sectionsHtml}
  <footer class="bp-footer">${escapeHtml(page.footerText)}</footer>
</body>
</html>`;
}
