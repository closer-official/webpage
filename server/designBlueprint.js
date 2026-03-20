/**
 * 参考HTMLから「設計ブループリント」を生成する（既存業種テンプレにはマッピングしない）。
 * 色・余白・タイポスケール・セクション数・コンテナ幅などを数値化する。
 */
import { fetchReferenceHtml } from './referenceFetch.js';
import { extractColorsFromHtml } from './styleFingerprint.js';

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ra = (pa >> 16) & 255;
  const ga = (pa >> 8) & 255;
  const ba = pa & 255;
  const rb = (pb >> 16) & 255;
  const gb = (pb >> 8) & 255;
  const bb = pb & 255;
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

function normalizeHex(h) {
  if (!h) return null;
  let s = String(h).replace('#', '').trim();
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  if (s.length < 6) return null;
  return `#${s.slice(0, 6)}`.toLowerCase();
}

function luminance(hex) {
  const h = normalizeHex(hex);
  if (!h) return 0.5;
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const [R, G, B] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function saturation(hex) {
  const h = normalizeHex(hex);
  if (!h) return 0;
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  return (max - min) / (1 - Math.abs(max + min - 1) + 1e-6);
}

function pickTop(colors, n = 14) {
  const freq = new Map();
  for (const c of colors) {
    const norm = normalizeHex(c);
    if (!norm) continue;
    freq.set(norm, (freq.get(norm) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map((x) => x[0]);
}

function suggestTheme(colorList) {
  const unique = [...new Set(colorList.map(normalizeHex).filter(Boolean))];
  if (unique.length === 0) {
    return { bg: '#f5f5f0', text: '#2a2a2a', accent: '#2563eb' };
  }
  const lums = unique.map((h) => ({ h, l: luminance(h), s: saturation(h) }));
  const light = lums.filter((x) => x.l > 0.55).sort((a, b) => b.l - a.l);
  const dark = lums.filter((x) => x.l < 0.45).sort((a, b) => a.l - b.l);
  const vibrant = lums
    .filter((x) => x.s > 0.12 && x.l > 0.18 && x.l < 0.88)
    .sort((a, b) => b.s - a.s);

  const bg = light[0]?.h || unique[0];
  const text = dark[0]?.h || '#2a2a2a';
  const accent = vibrant[0]?.h || vibrant[1]?.h || unique[1] || text;

  return { bg, text, accent };
}

function collectPxValues(html) {
  const pxValues = [];
  const re = /(?:padding|margin)(?:-[a-z]+)?\s*:\s*([^;}{]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    const nums = m[1].match(/\d+(?:\.\d+)?px/g);
    if (nums) nums.forEach((n) => pxValues.push(parseFloat(n)));
  }
  return pxValues.filter((n) => n > 0 && n < 400);
}

function deriveSpacingScale(pxValues) {
  const base = pxValues.length ? clamp(Math.round(median(pxValues) / 4) * 4, 4, 24) : 8;
  return {
    unit: base,
    xs: Math.max(4, Math.round(base * 0.5)),
    sm: base,
    md: base * 2,
    lg: base * 3,
    xl: base * 4,
    '2xl': base * 6,
  };
}

function collectFontSizesPx(html) {
  const sizes = [];
  const re = /font-size\s*:\s*(\d+(?:\.\d+)?)(px|rem)/gi;
  let m;
  while ((m = re.exec(html))) {
    const v = parseFloat(m[1]);
    sizes.push(m[2] === 'rem' ? v * 16 : v);
  }
  return sizes.filter((n) => n >= 10 && n <= 120);
}

function deriveTypeScale(pxSizes) {
  const body = pxSizes.length ? clamp(Math.round(median(pxSizes)), 14, 18) : 16;
  const display = clamp(Math.round(body * 2.75), 36, 72);
  const h2 = clamp(Math.round(body * 1.75), 22, 40);
  const lead = clamp(Math.round(body * 1.15), 15, 22);
  return {
    displayPx: display,
    h2Px: h2,
    leadPx: lead,
    bodyPx: body,
    /** clamp() 用の相対指定 */
    display: `clamp(${Math.round(display * 0.5)}px, 4vw + ${Math.round(body * 0.5)}px, ${display}px)`,
    h2: `clamp(${Math.round(h2 * 0.65)}px, 2vw + ${Math.round(body * 0.4)}px, ${h2}px)`,
    lead: `clamp(${lead - 2}px, 0.8vw + ${body - 1}px, ${lead + 2}px)`,
    body: `clamp(${body - 1}px, 0.2vw + ${body - 2}px, ${body + 2}px)`,
  };
}

function firstFontFromContext(html, tag) {
  const re = new RegExp(`<${tag}[^>]*style\\s*=\\s*["'][^"']*font-family\\s*:\\s*([^;"']+)`, 'i');
  const m = html.match(re);
  if (m) return m[1].split(',')[0].trim().replace(/['"]/g, '').slice(0, 120);
  const re2 = /font-family\s*:\s*([^;}"']+)/i;
  const m2 = html.match(re2);
  if (m2) return m2[1].split(',')[0].trim().replace(/['"]/g, '').slice(0, 120);
  return '';
}

function guessContainerMaxWidth(html) {
  const mws = [];
  const re = /max-width\s*:\s*(\d+)px/gi;
  let m;
  while ((m = re.exec(html))) {
    const v = parseInt(m[1], 10);
    if (v >= 320 && v <= 1920) mws.push(v);
  }
  if (!mws.length) return 960;
  const med = median(mws);
  return clamp(Math.round(med), 720, 1200);
}

/**
 * @param {string} html
 * @param {string} sourceUrl
 */
export function buildDesignBlueprintFromHtml(html, sourceUrl) {
  const colors = extractColorsFromHtml(html);
  const topColors = pickTop(colors, 18);
  const theme = suggestTheme(topColors.length ? topColors : colors);

  const pxVals = collectPxValues(html);
  const space = deriveSpacingScale(pxVals);
  const fontSizes = collectFontSizesPx(html);
  const type = deriveTypeScale(fontSizes);

  const sectionTags = (html.match(/<section[^>]*>/gi) || []).length;
  const h2n = (html.match(/<h2[^>]*>/gi) || []).length;
  const h1n = (html.match(/<h1[^>]*>/gi) || []).length;
  const approxSections = clamp(Math.max(sectionTags || 0, Math.ceil(h2n / 2) || 0, 3), 3, 12);

  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const textLen = stripped.replace(/<[^>]+>/g, '').length;
  let contentDensity = 'normal';
  if (textLen > 12000) contentDensity = 'compact';
  else if (textLen < 2500) contentDensity = 'airy';

  const hasHeader = /<header[^>]*>/i.test(html);
  const hasNav = /<nav[^>]*>/i.test(html);
  let navApproxItems = 4;
  const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch) {
    const links = (navMatch[1].match(/<a[^>]+>/gi) || []).length;
    navApproxItems = clamp(links || 4, 2, 8);
  }

  const heroPresent = h1n > 0 || /<section[^>]*class\s*=\s*["'][^"']*hero/i.test(html);

  const headingStack = firstFontFromContext(html, 'h1') || '"Noto Sans JP", system-ui, sans-serif';
  const bodyStack = firstFontFromContext(html, 'h2') || '"Noto Sans JP", system-ui, sans-serif';

  const surface = mixHex(theme.bg, '#ffffff', luminance(theme.bg) < 0.5 ? 0.08 : 0.04);
  const muted = mixHex(theme.text, theme.bg, 0.35);
  const border = mixHex(theme.text, theme.bg, 0.9);

  return {
    version: 1,
    tokens: {
      space,
      radius: { sm: 6, md: 12, lg: 20 },
      colors: {
        bg: theme.bg,
        surface,
        text: theme.text,
        muted,
        accent: theme.accent,
        border,
      },
      type,
      topColors,
    },
    layout: {
      containerMaxWidth: guessContainerMaxWidth(html),
      contentDensity,
      sectionCount: approxSections,
      hasHero: heroPresent,
      navApproxItems,
      headerStyle: hasHeader || hasNav ? 'standard' : 'minimal',
    },
    typography: {
      headingStack,
      bodyStack,
    },
    composition: {
      /** 参考の見出し密度から推定 */
      headingWeight: '600',
      textAlign: 'start',
    },
    meta: {
      sourceUrl: String(sourceUrl || '').slice(0, 2000),
      extractedAt: new Date().toISOString(),
      note: 'HTML/CSSのコピーではなく、計測・推定値に基づくブループリントです。文章・画像はオリジナル素材です。',
    },
  };
}

/**
 * @param {string} urlStr
 */
export async function extractDesignBlueprintFromUrl(urlStr) {
  const { url, html } = await fetchReferenceHtml(urlStr);
  const blueprint = buildDesignBlueprintFromHtml(html, url.toString());
  return { blueprint, html };
}
