/**
 * 営業コンソール用: Places API（レガシー）をサーバー経由で呼び出し、キャッシュ・ログは salesAgencyCore 側で行う。
 */

const DETAIL_FIELDS =
  'place_id,name,formatted_address,geometry,photos,rating,user_ratings_total,formatted_phone_number,website,opening_hours,types,business_status';

/**
 * @param {string} apiKey
 * @param {string} input
 * @returns {Promise<{ predictions: Array<{ description: string, place_id: string }>, status: string }>}
 */
export async function placesAutocomplete(apiKey, input) {
  const key = String(apiKey || '').trim();
  const q = String(input || '').trim();
  if (!key || q.length < 2) return { predictions: [], status: 'INVALID_REQUEST' };

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&language=ja&key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  const data = await res.json();
  const predictions = (data.predictions || []).map((p) => ({
    description: p.description,
    place_id: p.place_id,
  }));
  return { predictions, status: data.status || 'UNKNOWN' };
}

/**
 * @param {string} apiKey
 * @param {string} placeId
 * @returns {Promise<{ result: object | null, status: string }>}
 */
export async function placesDetails(apiKey, placeId) {
  const key = String(apiKey || '').trim();
  const id = String(placeId || '').trim();
  if (!key || !id) return { result: null, status: 'INVALID_REQUEST' };

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(id)}&fields=${DETAIL_FIELDS}&language=ja&key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.result) {
    return { result: null, status: data.status || 'UNKNOWN' };
  }
  return { result: data.result, status: 'OK' };
}

/** @param {{ photos?: { photo_reference: string }[] }} d */
export function photoUrlsFromDetails(d, apiKey) {
  const key = String(apiKey || '').trim();
  if (!key || !d?.photos?.length) return [];
  return d.photos.slice(0, 6).map(
    (p) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(p.photo_reference)}&key=${encodeURIComponent(key)}`
  );
}
