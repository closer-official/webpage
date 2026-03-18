/**
 * Google Maps Places でエリア検索する。
 * - まずレガシー Text Search → INVALID_REQUEST/REQUEST_DENIED 時は Places API (New) の searchText にフォールバック
 * - hasWebsite: false → ウェブサイト未登録のみ / true → ウェブサイトありのみ（参照用）
 */

const LEGACY_FIELDS =
  'place_id,name,formatted_address,website,rating,user_ratings_total,opening_hours,photos,types,reviews';

function buildLegacySearchError(searchData) {
  const detail = searchData.error_message ? ` (${searchData.error_message})` : '';
  let hint = '';
  if (searchData.status === 'REQUEST_DENIED') {
    hint =
      ' 【対処】請求の有効化・Places API の有効化・サーバー用キー（リファラー制限なし）を確認してください。';
  } else if (searchData.status === 'INVALID_REQUEST') {
    hint =
      ' レガシー Text Search が使えない場合、自動で Places API (New) に切り替えます。それでも失敗する場合は請求と API 有効化を確認してください。';
  }
  return new Error(`Google Maps API (レガシー): ${searchData.status}${detail}${hint}`);
}

/**
 * Places API (New) Text Search — レガシーが INVALID_REQUEST のときに利用
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */
async function newPlacesTextSearchAll(query, apiKey, maxResults) {
  const key = String(apiKey).trim();
  const all = [];
  let pageToken = null;

  do {
    const body = {
      textQuery: query,
      languageCode: 'ja',
      maxResultCount: Math.min(20, Math.max(1, maxResults - all.length)),
    };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.name,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.error?.message || data.error?.status || JSON.stringify(data).slice(0, 300);
      throw new Error(
        `Places API (New): ${msg} 【対処】Google Cloud で「Places API (New)」を有効化し、請求をオンにしたうえで、キーにアプリ制限「なし」または適切な API 制限を付けてください。`
      );
    }

    const places = data.places || [];
    for (const p of places) {
      const placeId = String(p.name || '')
        .replace(/^places\//, '')
        .trim();
      if (!placeId) continue;
      all.push({
        place_id: placeId,
        name: p.displayName?.text,
        formatted_address: p.formattedAddress,
        types: p.types,
        rating: p.rating,
        user_ratings_total: p.userRatingCount,
      });
    }
    pageToken = data.nextPageToken || null;
    if (pageToken) await new Promise((r) => setTimeout(r, 1200));
  } while (pageToken && all.length < maxResults);

  return all;
}

export async function collectPlaces(query, options = {}) {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY is not set');
  const { minReviews = 0, maxResults = 20, hasWebsite = false } = options;

  let allResults = [];
  let nextPageToken = null;
  let lastLegacyStatus = null;
  let lastLegacyData = null;

  do {
    const url = nextPageToken
      ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${encodeURIComponent(nextPageToken)}&key=${encodeURIComponent(key)}`
      : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&key=${encodeURIComponent(key)}`;
    const searchRes = await fetch(url);
    const searchData = await searchRes.json();
    lastLegacyStatus = searchData.status;
    lastLegacyData = searchData;

    if (searchData.status === 'OK') {
      allResults = allResults.concat(searchData.results || []);
      nextPageToken = searchData.next_page_token || null;
      if (nextPageToken) await new Promise((r) => setTimeout(r, 2200));
    } else if (searchData.status === 'ZERO_RESULTS') {
      break;
    } else {
      break;
    }
  } while (nextPageToken && allResults.length < maxResults);

  const legacyBlocked =
    allResults.length === 0 &&
    (lastLegacyStatus === 'INVALID_REQUEST' || lastLegacyStatus === 'REQUEST_DENIED');

  if (legacyBlocked) {
    try {
      allResults = await newPlacesTextSearchAll(query, key, maxResults);
    } catch (e) {
      throw new Error(
        `${e.message}\n（レガシー検索: ${lastLegacyStatus}${lastLegacyData?.error_message ? ` — ${lastLegacyData.error_message}` : ''}）`
      );
    }
  } else if (lastLegacyStatus !== 'OK' && lastLegacyStatus !== 'ZERO_RESULTS' && allResults.length === 0) {
    throw buildLegacySearchError(lastLegacyData || { status: lastLegacyStatus });
  }

  const out = [];
  for (let i = 0; i < allResults.length && out.length < maxResults; i++) {
    const place = allResults[i];
    const placeId = place.place_id;
    if (!placeId) continue;

    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${LEGACY_FIELDS}&language=ja&key=${encodeURIComponent(key)}`
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
    const openingHoursText = d.opening_hours && Array.isArray(d.opening_hours.weekday_text)
      ? d.opening_hours.weekday_text.join('\n')
      : '';
    const item = {
      placeId: d.place_id,
      name: d.name || '(名称なし)',
      address: d.formatted_address || '',
      rating: d.rating ?? null,
      userRatingsTotal: d.user_ratings_total ?? null,
      category: d.types && d.types[0] ? d.types[0].replace(/_/g, ' ') : 'store',
      hasOpeningHours: !!d.opening_hours,
      hasPhoto: !!(d.photos && d.photos.length > 0),
      reviews,
      openingHoursText,
    };
    if (hasWebsite && hasSite) {
      item.websiteUrl = String(d.website).trim();
      item.rankIndex = out.length + 1;
    }
    out.push(item);
  }
  return out;
}
