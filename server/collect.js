/**
 * Google Maps Places API (Web) でエリア検索する。
 * - hasWebsite: false（既定）→ ウェブサイト未登録の店だけ返す（LP作成用）
 * - hasWebsite: true → ウェブサイトがある店だけ返す（上位表示参照用）。websiteUrl と rankIndex 付き。
 * - maxResults: 20 が既定。60〜100 を指定すると next_page_token で複数ページ取得する（学習用）。
 */
export async function collectPlaces(query, options = {}) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY is not set');
  const { minReviews = 0, maxResults = 20, hasWebsite = false } = options;

  const fields = 'place_id,name,formatted_address,website,rating,user_ratings_total,opening_hours,photos,types,reviews';
  let allResults = [];
  let nextPageToken = null;

  do {
    const url = nextPageToken
      ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${encodeURIComponent(nextPageToken)}&key=${key}`
      : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&key=${key}`;
    const searchRes = await fetch(url);
    const searchData = await searchRes.json();
    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      const msg = searchData.error_message || searchData.status;
      const hint = (searchData.status === 'INVALID_REQUEST' || searchData.status === 'REQUEST_DENIED')
        ? ' APIキー・請求の有効化・Places API（Text Search）の有効化を確認してください。'
        : '';
      throw new Error(`Google Maps API: ${msg}${hint}`);
    }
    const pageResults = searchData.results || [];
    allResults = allResults.concat(pageResults);
    nextPageToken = searchData.next_page_token || null;
    if (nextPageToken) {
      await new Promise((r) => setTimeout(r, 2200));
    }
  } while (nextPageToken && allResults.length < maxResults);

  const out = [];
  for (let i = 0; i < allResults.length && out.length < maxResults; i++) {
    const place = allResults[i];
    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=${fields}&language=ja&key=${key}`
    );
    const detailData = await detailRes.json();
    if (detailData.status !== 'OK' || !detailData.result) continue;
    const d = detailData.result;
    const hasSite = !!(d.website && String(d.website).trim());
    const total = d.user_ratings_total ?? 0;
    if (total < minReviews) continue;
    if (hasWebsite && !hasSite) continue;
    if (!hasWebsite && hasSite) continue;
    const reviews = (d.reviews || []).map((r) => (r.text || '').trim()).filter(Boolean);
    const item = {
      placeId: d.place_id,
      name: d.name || '(名称なし)',
      address: d.formatted_address || '',
      rating: d.rating ?? null,
      userRatingsTotal: d.user_ratings_total ?? null,
      category: (d.types && d.types[0]) ? d.types[0].replace(/_/g, ' ') : 'store',
      hasOpeningHours: !!d.opening_hours,
      hasPhoto: !!(d.photos && d.photos.length > 0),
      reviews,
    };
    if (hasWebsite && hasSite) {
      item.websiteUrl = String(d.website).trim();
      item.rankIndex = out.length + 1;
    }
    out.push(item);
  }
  return out;
}
