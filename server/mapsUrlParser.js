/**
 * Google マップの共有URLから place_id を推定する（Places API への入力用）。
 * 公式に保証されたものではないため、取れない場合は呼び出し側で Autocomplete へフォールバックする。
 */

function decodeGooglePolylinePlaceId(s) {
  try {
    const dec = decodeURIComponent(String(s || '').replace(/\+/g, ' '));
    const m = dec.match(/^(ChIJ[A-Za-z0-9_-]{20,})$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} rawUrl
 * @returns {string | null} place_id らしき文字列
 */
export function extractPlaceIdFromGoogleMapsUrl(rawUrl) {
  const u = String(rawUrl || '').trim();
  if (!u) return null;

  let url;
  try {
    url = new URL(u, 'https://www.google.com');
  } catch {
    return null;
  }

  const hay = url.href;

  // ?q=place_id:ChIJ... または &query=place_id:...
  const qPlace = hay.match(/[?&](?:q|query)=place_id%3A([^&]+)/i);
  if (qPlace) {
    try {
      const id = decodeURIComponent(qPlace[1]);
      if (/^ChIJ[A-Za-z0-9_-]{20,}$/.test(id)) return id;
    } catch {
      /* ignore */
    }
  }
  const qPlacePlain = hay.match(/[?&](?:q|query)=place_id:([^&]+)/i);
  if (qPlacePlain) {
    const id = decodeGooglePolylinePlaceId(qPlacePlain[1]);
    if (id) return id;
  }

  // data=!3m1!4b1!4m5!3m4!1sChIJ...!8m2!3d...
  const data1s = hay.match(/!1s(ChIJ[A-Za-z0-9_-]{20,})/);
  if (data1s) return data1s[1];

  // 稀に 0x...:0x... 形式（place_id ではないのでスキップ）

  // ftid= で始まる（古い形式）
  const ftid = url.searchParams.get('ftid');
  if (ftid && /^ChIJ[A-Za-z0-9_-]{20,}$/.test(ftid)) return ftid;

  // cid= は place_id ではない

  return null;
}
