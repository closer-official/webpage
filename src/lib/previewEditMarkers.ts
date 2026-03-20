/**
 * 検閲プレビュー iframe 内に data-pe を付与し、編集用CSSを注入する
 */

export function injectPreviewEditCss(html: string, css: string | undefined): string {
  let h = html.replace(/<style id="preview-edit-user-css"[\s\S]*?<\/style>/gi, '');
  const c = (css || '').trim();
  if (!c) return h;
  const block = `<style id="preview-edit-user-css" type="text/css">\n${c}\n</style>`;
  if (h.includes('</head>')) return h.replace('</head>', `${block}</head>`);
  return h;
}

const OUTLINE_CSS = `
body.pe-edit-mode [data-pe] { cursor: pointer; transition: outline 0.15s; }
body.pe-edit-mode [data-pe]:hover { outline: 2px dashed rgba(37, 99, 235, 0.55); }
body.pe-edit-mode [data-pe-selected="1"] { outline: 3px solid #2563eb !important; }
`;

export function injectEditModeOutline(html: string, enable: boolean): string {
  if (!enable) {
    return html
      .replace(/\s*id="preview-edit-mode-ui"/, '')
      .replace(/<style id="preview-edit-outline-css"[\s\S]*?<\/style>/, '');
  }
  const block = `<style id="preview-edit-outline-css" type="text/css">${OUTLINE_CSS}</style>`;
  if (html.includes('</head>')) return html.replace('</head>', `${block}</head>`);
  return html;
}

/**
 * クリック編集対象に data-pe を付与（テンプレ差異を吸収するセレクタの列挙）
 */
export function markPreviewElements(doc: Document): void {
  doc.querySelectorAll('[data-pe]').forEach((el) => el.removeAttribute('data-pe'));
  doc.querySelectorAll('[data-pe-selected]').forEach((el) => el.removeAttribute('data-pe-selected'));

  const h1 =
    doc.querySelector(
      '.hero-inner h1, .wo-hero-inner h1, section.hero h1, .gym-hero-inner h1, .pro-hero .hero-inner h1, .pet-hero .hero-inner h1, .ramen-hero .hero-inner h1, h1.builder-hero-title, .wo-hero h1'
    ) || doc.querySelector('main h1');
  if (h1) h1.setAttribute('data-pe', 'headline');

  const sub =
    doc.querySelector('.subheadline, p.subheadline, .builder-hero-catchphrase') ||
    doc.querySelector('.wo-hero-inner .subheadline');
  if (sub) sub.setAttribute('data-pe', 'subheadline');

  const logo = doc.querySelector('a.logo, .header .logo');
  if (logo) logo.setAttribute('data-pe', 'siteName');
  else {
    const eyebrow = doc.querySelector('.wo-hero-eyebrow');
    if (eyebrow) eyebrow.setAttribute('data-pe', 'siteName');
  }

  const foot = doc.querySelector('.footer-text, footer .footer-text');
  if (foot) foot.setAttribute('data-pe', 'footerText');

  const heroSec =
    doc.querySelector('section.hero, section.wo-hero, section.gym-hero-section, section.pet-hero, section.ramen-hero, section.pro-hero');
  if (heroSec) heroSec.setAttribute('data-pe', 'hero');

  doc.querySelectorAll('section[id]').forEach((sec) => {
    const id = sec.getAttribute('id');
    if (!id || id.startsWith('wo-')) return;
    const h2 =
      sec.querySelector(`h2#${id}-title`) ||
      sec.querySelector('h2.wo-sec-heading, h2.salon-sec-title, h2.wo-lede-heading, h2');
    if (h2) h2.setAttribute('data-pe', `section-${id}-title`);

    const img = sec.querySelector('img.section-img');
    if (img) img.setAttribute('data-pe', `section-${id}-image`);

    const prose =
      sec.querySelector('.wo-sec-prose') ||
      sec.querySelector('.section-concept-prose') ||
      sec.querySelector('.wo-lede-prose') ||
      sec.querySelector('.section-body');
    if (prose) prose.setAttribute('data-pe', `section-${id}-body`);
  });
}

export function peLabelJa(pe: string): string {
  if (pe === 'headline') return 'メイン見出し';
  if (pe === 'subheadline') return 'サブ見出し';
  if (pe === 'siteName') return 'サイト名・ロゴ';
  if (pe === 'footerText') return 'フッター文言';
  if (pe === 'hero') return 'ヒーロー背景画像';
  const mt = /^section-([^-]+)-title$/.exec(pe);
  if (mt) return `セクション「${mt[1]}」見出し`;
  const mb = /^section-([^-]+)-body$/.exec(pe);
  if (mb) return `セクション「${mb[1]}」本文`;
  const mi = /^section-([^-]+)-image$/.exec(pe);
  if (mi) return `セクション「${mi[1]}」画像`;
  return pe;
}

export function parseRgb(input: string): { r: number; g: number; b: number } {
  const s = input.trim();
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) {
    return { r: Math.round(Number(m[1])), g: Math.round(Number(m[2])), b: Math.round(Number(m[3])) };
  }
  if (s.startsWith('#') && s.length >= 7) {
    const r = parseInt(s.slice(1, 3), 16);
    const g = parseInt(s.slice(3, 5), 16);
    const b = parseInt(s.slice(5, 7), 16);
    if (!Number.isNaN(r + g + b)) return { r, g, b };
  }
  return { r: 30, g: 41, b: 59 };
}

export function buildPeCssRule(pe: string, opts: { color?: string; fontSizePx?: number }): string {
  const parts: string[] = [];
  if (opts.color) parts.push(`color: ${opts.color} !important`);
  if (opts.fontSizePx != null && opts.fontSizePx > 0) parts.push(`font-size: ${opts.fontSizePx}px !important`);
  if (!parts.length) return '';
  return `[data-pe="${pe}"] { ${parts.join('; ')}; }\n`;
}

/** 既存CSSから同じ data-pe ルールを置き換え */
export function upsertPeCssRule(fullCss: string, pe: string, ruleLine: string): string {
  const esc = pe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\[data-pe="${esc}"\\]\\s*\\{[^}]*\\}\\s*`, 'g');
  const without = (fullCss || '').replace(re, '').trim();
  const add = ruleLine.trim();
  if (!add) return without;
  return `${without}\n${add}`.trim();
}
