/**
 * Google Place の写真を最大枚数分、表示用URLに変換する。
 * Place Details (Legacy) の photos[].photo_reference を使い、
 * Place Photo のリダイレクトURLを返す（img src にそのまま使える）。
 * @param {string} placeId - Google Place ID
 * @param {number} [maxCount=6] - 取得する最大枚数
 * @returns {Promise<string[]>} 写真URLの配列（取得失敗時は空配列）
 */
export async function getPlacePhotoUrls(placeId, maxCount = 6) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !placeId) return [];

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos&language=ja&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK' || !data.result?.photos?.length) return [];

    const refs = data.result.photos
      .slice(0, maxCount)
      .map((p) => p.photo_reference)
      .filter(Boolean);

    return refs.map(
      (ref) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(ref)}&key=${encodeURIComponent(key)}`
    );
  } catch {
    return [];
  }
}
