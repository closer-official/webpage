/** cafe_1 ビジュアルジャンル（編集画面のセレクトとヒーロー既定） */

export const CAFE_1_RAMEN_HERO_SLIDES = [
  '/cafe1-genres/ramen/hero-1.png',
  '/cafe1-genres/ramen/hero-2.png',
];

/** ジャンル未指定・ラーメン以外で使うサンプルスライド（従来どおり3枚） */
export const CAFE_1_DEFAULT_HERO_SLIDES = [
  'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1400',
];

/** 表示ラベル（細かめの業態） */
export const CAFE_1_VISUAL_GENRE_OPTIONS = [
  { id: '', label: '指定なし（サンプル写真3枚）' },
  { id: 'ramen', label: 'ラーメン・中華麺' },
  { id: 'cafe_coffee', label: 'カフェ・コーヒー' },
  { id: 'kissaten', label: '喫茶・軽食' },
  { id: 'izakaya', label: '居酒屋・ダイニングバー' },
  { id: 'yakiniku', label: '焼肉・韓国料理' },
  { id: 'sushi', label: '寿司・海鮮' },
  { id: 'yoshoku', label: '洋食・レストラン' },
  { id: 'teishoku', label: '定食・食堂' },
  { id: 'don_udon_soba', label: '丼・うどん・そば' },
  { id: 'sweets', label: 'スイーツ・ベーカリー' },
  { id: 'takeout', label: 'テイクアウト・デリ' },
  { id: 'other_food', label: 'その他飲食' },
];

const ALLOWED_GENRE_IDS = new Set(CAFE_1_VISUAL_GENRE_OPTIONS.map((o) => o.id).filter(Boolean));

export function normalizeCafeVisualGenreId(raw) {
  const id = String(raw || '').trim().slice(0, 40);
  if (!id) return '';
  return ALLOWED_GENRE_IDS.has(id) ? id : '';
}
