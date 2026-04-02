/**
 * 管理画面用: iframe 全文・埋め込みURL・Google短縮リンクから iframe 用の地図URLを得る
 */

function decodeBasicEntities(s) {
  return String(s || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function extractIframeSrc(html) {
  const s = decodeBasicEntities(html);
  const m = s.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  return m ? m[1].trim() : '';
}

export function extractDirectGoogleEmbedUrl(text) {
  const s = decodeBasicEntities(text);
  const m = s.match(/https:\/\/www\.google\.com\/maps\/embed\?[^\s"'<>]+/i);
  return m ? m[0].trim() : '';
}

function firstHttpsUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s<>"']+/i);
  return m ? m[0].trim() : '';
}

function isGoogleMapsEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (!/\.google\.(com|co\.jp)$/i.test(u.hostname)) return false;
    return /\/maps\/embed/i.test(u.pathname);
  } catch {
    return false;
  }
}

/** 短縮URL取得を許可するホスト（SSRF 抑制） */
function isAllowedShortLinkHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  return h === 'maps.app.goo.gl' || h === 'goo.gl' || h.endsWith('.goo.gl');
}

function isGoogleMapsFinalHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  return (
    h === 'google.com' ||
    h === 'www.google.com' ||
    h === 'google.co.jp' ||
    h === 'www.google.co.jp' ||
    h === 'maps.google.com' ||
    h === 'www.maps.google.com'
  );
}

function latLngFromMapsUrl(url) {
  const u = String(url);
  const at = u.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (at) return { lat: at[1], lng: at[2] };
  const d34 = u.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/i);
  if (d34) return { lat: d34[1], lng: d34[2] };
  return null;
}

function toOutputEmbed(lat, lng) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&output=embed`;
}

/**
 * @param {string} raw
 * @returns {Promise<{ embedUrl: string, error?: string }>}
 */
export async function resolveMapEmbedFromRaw(raw) {
  const s = String(raw || '').trim().slice(0, 50000);
  if (!s) return { embedUrl: '', error: '入力が空です' };

  const fromSrc = extractIframeSrc(s);
  if (fromSrc && isGoogleMapsEmbedUrl(fromSrc)) {
    return { embedUrl: fromSrc };
  }

  const direct = extractDirectGoogleEmbedUrl(s);
  if (direct) {
    return { embedUrl: direct };
  }

  const candidate = fromSrc && /^https?:\/\//i.test(fromSrc) ? fromSrc : firstHttpsUrl(s);
  if (!candidate) {
    return { embedUrl: '', error: 'URL が見つかりません。iframe 全文か https のURLを貼り付けてください。' };
  }

  if (isGoogleMapsEmbedUrl(candidate)) {
    return { embedUrl: candidate };
  }

  const llDirect = latLngFromMapsUrl(candidate);
  if (llDirect) {
    return { embedUrl: toOutputEmbed(llDirect.lat, llDirect.lng) };
  }

  let fetchUrl = candidate;
  try {
    const u = new URL(fetchUrl);
    if (!isAllowedShortLinkHost(u.hostname)) {
      return {
        embedUrl: '',
        error:
          'このURLからは埋め込み用URLを自動生成できません。Googleマップの「共有」→「地図を埋め込む」で表示される iframe をコピーするのが確実です。',
      };
    }
  } catch {
    return { embedUrl: '', error: 'URL の形式が不正です' };
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CloserMapResolve/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(t);
    const finalUrl = res.url || fetchUrl;
    let parsed;
    try {
      parsed = new URL(finalUrl);
    } catch {
      return { embedUrl: '', error: 'リダイレクト先のURLを解釈できませんでした' };
    }
    if (!isGoogleMapsFinalHost(parsed.hostname)) {
      return {
        embedUrl: '',
        error: '短縮URLの先が Google マップ以外でした。iframe のコピペを使ってください。',
      };
    }
    if (isGoogleMapsEmbedUrl(finalUrl)) {
      return { embedUrl: finalUrl };
    }
    const ll = latLngFromMapsUrl(finalUrl);
    if (ll) {
      return { embedUrl: toOutputEmbed(ll.lat, ll.lng) };
    }
    return {
      embedUrl: '',
      error:
        '短縮URLから座標を取れませんでした。確実なのは「共有」→「地図を埋め込む」の iframe です。',
    };
  } catch (e) {
    const msg = e?.name === 'AbortError' ? 'タイムアウトしました' : e?.message || '取得に失敗しました';
    return { embedUrl: '', error: msg };
  }
}
