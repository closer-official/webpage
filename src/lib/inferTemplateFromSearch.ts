import type { QueueTarget, StyleId } from '../types';

/**
 * 検索クエリ（例: 港区 ホテル）と Maps の category（例: lodging, gym）からテンプレを推定。
 * 先にヒットしたルールを採用（ジム→6、カフェ→4、ホテル・エステ→1 など）。
 */
const RULES: { style: StyleId; re: RegExp }[] = [
  {
    style: 'high_energy',
    re: /ジム|gym|フィットネス|fitness|fitness_center|sports_complex|パーソナル|トレーニング|training|workout|クロスフィット|crossfit|ピラティス|pilates|ヨガスタジオ|\byoga\b|スポーツクラブ/i,
  },
  {
    style: 'pop_friendly',
    re: /キッズ|保育|幼稚園|児童|あそび場|室内遊|ボールプール|playground|amusement|preschool|nursery|子ども|子供向け|ファミリー向け/i,
  },
  {
    style: 'minimal_luxury',
    re: /ホテル|hotel|lodging|motel|旅館|ryokan|民宿|guest house|エステ|esthetic|スパ|\bspa\b|beauty_salon|サロン|resort|bed_and_breakfast/i,
  },
  {
    style: 'dark_edge',
    re: /バー|\bbar\b|ナイト|night_club|ラウンジ|lounge|クラブ|club|pub|居酒屋|ワインバー|カクテル/i,
  },
  {
    style: 'warm_organic',
    re: /カフェ|\bcafe\b|coffee|コーヒー|喫茶|ベーカリー|bakery|パン屋|レストラン|restaurant|brunch|スイーツ|カフェテリア/i,
  },
  {
    style: 'corporate_trust',
    re: /クリニック|医院|歯科|内科|外科|診療|dentist|doctor|hospital|physician|health|コンサル|consulting|税理|法律|lawyer|司法|不動産|real_estate|保険|insurance|士業|会計|株式会社|会社|オフィス/i,
  },
];

const DEFAULT_STYLE: StyleId = 'corporate_trust';

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
