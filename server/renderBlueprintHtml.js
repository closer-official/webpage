/**
 * 設計ブループリントからHTMLを生成（既存 buildHtml / 業種テンプレに依存しない）
 */
import { generateBlueprintPageModel } from './blueprintContent.js';
import { RESPONSIVE_BASE_CSS } from './responsiveBaseCss.js';

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

  const vs = bp.visualStyle || 'light_default';
  if (vs === 'dark_gradient_lp' || vs === 'dark_hero') {
    return renderDarkGradientLpHtml(bp, options);
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
` + RESPONSIVE_BASE_CSS;

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
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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

/**
 * ダーク背景・分割ヒーロー・グラデCTA・金マーカー強調など、高転換LPに近い静的プレビュー
 * @param {object} blueprint
 * @param {{ override?: object; page?: object }} options
 */
function renderDarkGradientLpHtml(blueprint, options = {}) {
  const bp = blueprint;
  const page = options.page || generateBlueprintPageModel(bp);
  const ov = options.override || {};
  const theme = ov.theme || {};

  const t = bp.tokens;
  const L = bp.layout || {};
  const ty = bp.typography || {};
  const sp = t.space;
  const gold = theme.goldAccent || t.colors?.goldAccent || '#c9a227';
  const ctaGrad =
    theme.ctaGradient ||
    t.ctaGradient ||
    'linear-gradient(90deg, #e11d74 0%, #ff8c42 55%, #ffd166 100%)';

  const c = {
    bg: theme.bg || t.colors.bg,
    surface: theme.surface || t.colors.surface,
    text: theme.text || t.colors.text,
    muted: theme.muted || t.colors.muted,
    accent: theme.accent || t.colors.accent,
    border: theme.border || t.colors.border,
  };

  const headline = ov.headline || page.heroTitle;
  const kicker = ov.subheadline || page.heroKicker;
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

  const containerMax = L.containerMaxWidth || 1100;
  const density = L.contentDensity || 'normal';
  const sectionPad =
    density === 'compact' ? sp.md : density === 'airy' ? sp['2xl'] * 1.15 : sp.xl;

  const fontHeading = `'Noto Sans JP', ${ty.headingStack || 'system-ui, sans-serif'}`;
  const fontBody = `'Noto Sans JP', ${ty.bodyStack || 'system-ui, sans-serif'}`;

  const heroLayout = L.heroLayout || 'split_photo_left';
  const showWatermark = !!L.watermarkTypography || bp.visualStyle === 'dark_gradient_lp';

  /** @type {{ text: string; mark?: boolean }[]} */
  const segments = page.heroLeadSegments || [];
  const leadHtml = segments.length
    ? segments
        .map((seg) => {
          const tx = escapeHtml(seg.text);
          return seg.mark ? `<span class="bp-mark">${tx}</span>` : tx;
        })
        .join('')
    : escapeHtml(
        '参考URLのトーンに合わせた余白と階層のプレビューです。文章はすべて差し替え可能なサンプルです。'
      );

  const copyBlock = `
      <div class="bp-hero-copy">
        <p class="bp-kicker">${escapeHtml(kicker)}</p>
        <h1>${escapeHtml(headline)}</h1>
        <p class="bp-lead-dark">${leadHtml}</p>
        <a class="bp-cta-gradient" href="${escapeHtml(page.ctaHref)}">
          <span class="bp-cta-badge">${escapeHtml(page.ctaBadge || '無料')}</span>
          <span class="bp-cta-label">${escapeHtml(page.ctaLabel)}</span>
          <span class="bp-cta-play" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.95)"/><path d="M10 8l6 4-6 4V8z" fill="#333"/></svg>
          </span>
        </a>
      </div>`;

  const visualBlock = `
      <div class="bp-hero-visual">
        <img src="${escapeHtml(page.heroImage)}" alt="" width="900" height="1100" loading="eager" />
      </div>`;

  const heroMain =
    heroLayout === 'split_photo_right'
      ? `${copyBlock}${visualBlock}`
      : `${visualBlock}${copyBlock}`;

  const watermarkHtml = showWatermark
    ? `<div class="bp-watermark" aria-hidden="true">${escapeHtml(page.heroWatermark || 'SAMPLE')}</div>`
    : '';

  const css = `
:root {
  --bp-bg: ${c.bg};
  --bp-surface: ${c.surface};
  --bp-text: ${c.text};
  --bp-muted: ${c.muted};
  --bp-accent: ${c.accent};
  --bp-border: ${c.border};
  --bp-gold: ${gold};
  --bp-cta-grad: ${ctaGrad};
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
body.bp-dark {
  margin: 0;
  font-family: ${fontBody};
  color: var(--bp-text);
  background: var(--bp-bg);
  line-height: 1.65;
  font-size: var(--bp-type-body);
}
.bp-dark a { color: var(--bp-accent); text-underline-offset: 3px; }
.bp-header-dark {
  position: sticky; top: 0; z-index: 30;
  background: color-mix(in srgb, var(--bp-bg) 88%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid color-mix(in srgb, var(--bp-border) 28%, transparent);
}
.bp-header-dark-inner {
  max-width: var(--bp-container); margin: 0 auto;
  padding: var(--bp-space-md) var(--bp-space-sm);
  display: flex; align-items: center; justify-content: space-between; gap: var(--bp-space-md); flex-wrap: wrap;
}
.bp-logo-dark {
  position: relative;
  display: inline-block;
  font-weight: 800;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  color: var(--bp-text);
  text-decoration: none;
  text-transform: uppercase;
}
.bp-logo-dark::after {
  content: '';
  position: absolute; left: -2%; right: -2%; top: 50%;
  height: 1px;
  background: color-mix(in srgb, var(--bp-text) 55%, transparent);
  pointer-events: none;
}
.bp-nav-dark { display: flex; flex-wrap: wrap; gap: var(--bp-space-sm) var(--bp-space-lg); }
.bp-nav-dark a {
  text-decoration: none;
  color: color-mix(in srgb, var(--bp-muted) 92%, var(--bp-text));
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: 0.06em;
}
.bp-nav-dark a:hover { color: var(--bp-text); }
.bp-hero-dark {
  position: relative;
  padding: var(--bp-space-2xl) var(--bp-space-sm) var(--bp-section-pad);
  overflow: hidden;
}
.bp-hero-dark-inner {
  max-width: var(--bp-container);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}
.bp-hero-grid-dark {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--bp-space-xl);
  align-items: end;
}
@media (max-width: 899px) {
  .bp-hero-grid-dark .bp-hero-copy { order: 1; }
  .bp-hero-grid-dark .bp-hero-visual { order: 2; }
}
@media (min-width: 900px) {
  .bp-hero-grid-dark {
    grid-template-columns: minmax(280px, 0.95fr) minmax(320px, 1.05fr);
    align-items: end;
    gap: var(--bp-space-2xl);
  }
  .bp-hero-grid-dark.bp-order-visual-right .bp-hero-visual { order: 2; }
  .bp-hero-grid-dark.bp-order-visual-right .bp-hero-copy { order: 1; }
  .bp-hero-grid-dark.bp-order-visual-left .bp-hero-visual { order: 1; }
  .bp-hero-grid-dark.bp-order-visual-left .bp-hero-copy { order: 2; }
}
.bp-watermark {
  position: absolute;
  left: 4%;
  top: 10%;
  z-index: 0;
  font-size: clamp(64px, 14vw, 160px);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: color-mix(in srgb, var(--bp-text) 7%, transparent);
  font-family: ${fontHeading};
  pointer-events: none;
  user-select: none;
}
.bp-hero-visual {
  position: relative;
  border-radius: var(--bp-radius-lg);
  overflow: hidden;
  isolation: isolate;
}
.bp-hero-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, var(--bp-bg) 0%, transparent 42%),
    linear-gradient(to right, var(--bp-bg) 0%, transparent 14%),
    linear-gradient(to left, var(--bp-bg) 0%, transparent 10%);
  pointer-events: none;
  z-index: 1;
}
.bp-hero-visual img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  object-position: center top;
  min-height: 320px;
  aspect-ratio: 3/4;
}
.bp-hero-copy { position: relative; z-index: 2; }
.bp-kicker {
  margin: 0 0 var(--bp-space-sm);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: color-mix(in srgb, var(--bp-muted) 90%, var(--bp-text));
}
.bp-hero-copy h1 {
  margin: 0 0 var(--bp-space-md);
  font-family: ${fontHeading};
  font-size: var(--bp-type-display);
  font-weight: ${bp.composition?.headingWeight || 700};
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.bp-lead-dark {
  margin: 0 0 var(--bp-space-lg);
  font-size: var(--bp-type-lead);
  color: color-mix(in srgb, var(--bp-muted) 35%, var(--bp-text));
  max-width: 38em;
}
.bp-mark {
  font-weight: 600;
  color: var(--bp-text);
  background: linear-gradient(transparent 62%, color-mix(in srgb, var(--bp-gold) 88%, transparent) 62%, color-mix(in srgb, var(--bp-gold) 88%, transparent) 92%, transparent 92%);
  padding: 0 0.06em;
}
.bp-cta-gradient {
  display: inline-flex;
  align-items: center;
  gap: var(--bp-space-sm);
  padding: 0.55rem 0.6rem 0.55rem 0.45rem;
  border-radius: 999px;
  background: var(--bp-cta-grad);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  box-shadow: 0 10px 36px color-mix(in srgb, #000 35%, transparent);
  transition: transform .15s, filter .15s;
}
.bp-cta-gradient:hover { transform: translateY(-2px); filter: brightness(1.06); }
.bp-cta-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  padding: 0.35rem 0.45rem;
  border-radius: 999px;
  background: #fff;
  color: #e11d74;
  font-size: 0.72rem;
  font-weight: 800;
}
.bp-cta-label { flex: 1; text-align: center; padding: 0 var(--bp-space-xs); }
.bp-cta-play { display: flex; align-items: center; justify-content: center; }
.bp-section-dark {
  padding: var(--bp-section-pad) var(--bp-space-sm);
  border-top: 1px solid color-mix(in srgb, var(--bp-border) 25%, transparent);
  background: color-mix(in srgb, var(--bp-surface) 22%, var(--bp-bg));
}
.bp-section-dark:nth-of-type(even) {
  background: color-mix(in srgb, var(--bp-surface) 12%, var(--bp-bg));
}
.bp-section-inner-dark { max-width: var(--bp-container); margin: 0 auto; }
.bp-section-dark h2 {
  margin: 0 0 var(--bp-space-md);
  font-family: ${fontHeading};
  font-size: var(--bp-type-h2);
  font-weight: 650;
  letter-spacing: 0.02em;
}
.bp-section-dark p {
  margin: 0 0 var(--bp-space-sm);
  color: color-mix(in srgb, var(--bp-muted) 55%, var(--bp-text));
  max-width: 52em;
}
.bp-section-dark figure {
  margin: var(--bp-space-lg) 0 0;
  border-radius: var(--bp-radius-md);
  overflow: hidden;
}
.bp-section-dark figure img { width: 100%; height: auto; display: block; }
.bp-footer-dark {
  padding: var(--bp-space-xl) var(--bp-space-sm);
  text-align: center;
  font-size: 0.82rem;
  color: var(--bp-muted);
  border-top: 1px solid color-mix(in srgb, var(--bp-border) 30%, transparent);
}
.bp-note-dark {
  max-width: var(--bp-container);
  margin: 0 auto var(--bp-space-md);
  padding: var(--bp-space-sm) var(--bp-space-md);
  background: color-mix(in srgb, var(--bp-accent) 6%, var(--bp-bg));
  border-radius: var(--bp-radius-md);
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--bp-muted) 80%, var(--bp-text));
  border: 1px solid color-mix(in srgb, var(--bp-border) 35%, transparent);
}
` + RESPONSIVE_BASE_CSS;

  const sectionsHtml = page.sections
    .map(
      (sec, i) => `
<section class="bp-section-dark" id="${escapeHtml(sec.id)}">
  <div class="bp-section-inner-dark">
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

  const gridOrderClass =
    heroLayout === 'split_photo_right' ? 'bp-order-visual-right' : 'bp-order-visual-left';

  const metaNote = `<p class="bp-note-dark">${escapeHtml(bp.meta?.note || '')}</p>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="参考URLのビジュアル特徴に近づけた設計ブループリントのプレビューです。" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body class="bp bp-dark">
  ${metaNote}
  <header class="bp-header-dark">
    <div class="bp-header-dark-inner">
      <a class="bp-logo-dark" href="#top">${escapeHtml(page.siteName)}</a>
      <nav class="bp-nav-dark" aria-label="主要ナビ">${navHtml}</nav>
    </div>
  </header>
  <section class="bp-hero-dark" id="top">
    ${watermarkHtml}
    <div class="bp-hero-dark-inner">
      <div class="bp-hero-grid-dark ${gridOrderClass}">
        ${heroMain}
      </div>
    </div>
  </section>
  ${sectionsHtml}
  <footer class="bp-footer-dark">${escapeHtml(page.footerText)}</footer>
</body>
</html>`;
}
