import type { QueueTarget, StyleId } from '../types';

/**
 * 検索クエリと Maps の category からテンプレを推定（TEMPLATE_IDS 準拠）。
 */
const RULES: { style: StyleId; re: RegExp }[] = [
  { style: 'salon_barber', re: /美容室|理容室|ヘアサロン|hair_salon|hair_care|beauty_salon|barber/i },
  { style: 'cafe_tea', re: /カフェ|\bcafe\b|coffee|コーヒー|喫茶|レストラン|restaurant|brunch|bistro|パン屋|ベーカリー|bakery|ケーキ|スイーツ|パティスリー/i },
  { style: 'clinic_chiropractic', re: /整骨院|整体|鍼灸|接骨|クリニック|医院|dentist|doctor|hospital|physician/i },
  { style: 'gym_yoga', re: /ジム|gym|フィットネス|fitness|パーソナル|トレーニング|ヨガ|\byoga\b|ピラティス|pilates/i },
  { style: 'builder', re: /工務店|リノベ|施工|建築|ハウスメーカー|builder|renovation/i },
  { style: 'professional', re: /税理士|行政書士|社労士|弁護士|コンサル|consulting|税理|法律|lawyer|士業|会計|不動産|real_estate|保険|insurance/i },
  { style: 'cram_school', re: /塾|習い事|教室|予備校|保育|幼稚園|キッズ|preschool|nursery|教育/i },
  { style: 'ramen', re: /ラーメン|らーめん|ramen|つけ麺|油そば|支那そば|中華そば/i },
  { style: 'izakaya', re: /居酒屋|バー|\bbar\b|ダイニングバー|pub|ワインバー|ナイト|lounge/i },
  { style: 'pet_salon', re: /ペット|ドッグ|犬|トリミング|pet|dog|dog_training/i },
  {
    style: 'apparel',
    re: /アパレル|服|ファッション|cloth|apparel|fashion|ブティック|boutique|ブランド|brand|ルックブック|look\s*book|特集ページ|コラボページ|コレクション.?ページ|キャンペーン.?ページ|革|レザー|\bleather\b|ジビエ|鞣し|タンニン|バッグ|財布|小物|職人|工房|クラフト|アトリエ|素材感|縦書き|工芸|レザークラフト/i,
  },
  { style: 'event', re: /イベント|event|フェス|フェスティバル|festival|コンサート|concert|展示会|セミナー|seminar|ワークショップ|workshop/i },
];

const DEFAULT_STYLE: StyleId = 'salon_barber';

export function inferStyleIdFromSearchQueryAndCategory(searchQuery: string, category: string): StyleId {
  const q = (searchQuery || '').trim();
  const cat = (category || '').replace(/_/g, ' ');
  const blob = `${q} ${cat}`.toLowerCase();
  for (const { style, re } of RULES) {
    if (re.test(blob)) return style;
  }
  return DEFAULT_STYLE;
}

export function inferStyleIdFromQueueTarget(target: QueueTarget): StyleId {
  return inferStyleIdFromSearchQueryAndCategory(target.searchQuery ?? '', target.category ?? '');
}
