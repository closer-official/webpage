/**
 * 住所文字列から日本の都道府県名を1つ抽出する（集計キー用）。
 * 旧実装の `.{2,3}県` は「神奈川県」内の「奈川県」などに誤マッチしうるため、
 * 47都道府県を長い表記から順に照合する。
 */

const ALL_47 = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

const SORTED = [...ALL_47].sort((a, b) => b.length - a.length || a.localeCompare(b, 'ja'));

/**
 * @param {string | null | undefined} raw
 * @returns {string} 都道府県名 or ''
 */
export function extractJapanesePrefecture(raw) {
  let s = String(raw || '');
  try {
    s = s.normalize('NFKC');
  } catch {
    /* ignore */
  }
  s = s.replace(/\s+/g, ' ').trim();
  if (!s) return '';
  for (const pref of SORTED) {
    if (s.includes(pref)) return pref;
  }
  return '';
}
