/**
 * 参考URLから「デザイン指紋」（色・フォント候補）を抽出する。
 * HTML/CSSのコピーは行わず、出現頻度の高い色などを抽象化して返す。
 */
import fetch from 'node-fetch';

const MAX_BYTES = 400_000;
const TIMEOUT_MS = 12000;

function normalizeHex(h) {
  if (!h) return null;
  let s = String(h).replace('#', '').trim();
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  if (s.length < 6) return null;
  return `#${s.slice(0, 6)}`.toLowerCase();
}

function hexFromRgbParts(r, g, b) {
  const ri = Math.max(0, Math.min(255, Math.round(parseFloat(r))));
  const gi = Math.max(0, Math.min(255, Math.round(parseFloat(g))));
  const bi = Math.max(0, Math.min(255, Math.round(parseFloat(b))));
  return `#${[ri, gi, bi].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
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

export function extractColorsFromHtml(html) {
  const colors = [];
  const text = String(html).slice(0, 800_000);

  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = hexRe.exec(text))) {
    const n = normalizeHex(`#${m[1]}`);
    if (n) colors.push(n);
  }

  const rgbRe = /rgba?\(\s*([^)]+)\)\s*/gi;
  while ((m = rgbRe.exec(text))) {
    const parts = m[1].split(/[,\s]+/).filter(Boolean);
    if (parts.length >= 3) {
      const r = parseFloat(parts[0]);
      const g = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        colors.push(hexFromRgbParts(r, g, b));
      }
    }
  }

  return colors;
}

function pickTop(colors, n = 12) {
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
    return { bg: '#f5f5f0', text: '#2a2a2a', accent: '#b8956f' };
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

/**
 * @param {string} urlStr
 * @returns {Promise<{ fingerprint: object, suggestedOverride: { theme: { bg: string, text: string, accent: string } } }>}
 */
export async function extractStyleFingerprintFromUrl(urlStr) {
  let url;
  try {
    url = new URL(String(urlStr).trim());
  } catch {
    throw new Error('URLの形式が正しくありません。');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('http / https のURLのみ対応しています。');
  }

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CloserStyleBot/1.0; +https://webpage.closer-official.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`取得に失敗しました（HTTP ${res.status}）`);

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    const html = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(slice));

    const colors = extractColorsFromHtml(html);
    const topColors = pickTop(colors, 14);
    const suggested = suggestTheme(topColors.length ? topColors : colors);

    const fontMatches = [];
    const fontRe = /font-family\s*:\s*([^;}"']+)/gi;
    let fm;
    while ((fm = fontRe.exec(html))) {
      const first = fm[1].split(',')[0].trim().replace(/['"]/g, '');
      if (first && first.length < 80) fontMatches.push(first);
    }

    const fingerprint = {
      topColors,
      sampleFonts: [...new Set(fontMatches)].slice(0, 6),
      extractedAt: new Date().toISOString(),
      sourceUrl: url.toString(),
    };

    return {
      fingerprint,
      suggestedOverride: {
        theme: {
          bg: suggested.bg,
          text: suggested.text,
          accent: suggested.accent,
        },
      },
    };
  } catch (e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') throw new Error('取得がタイムアウトしました。');
    throw e;
  }
}
