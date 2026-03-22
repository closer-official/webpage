/**
 * フルオート／キュー処理で「メインの1枚目」テンプレ順を決める。
 * 検索クエリ・Maps category を優先し、次に Gemini の conceptId。
 */
import { TEMPLATE_IDS } from './conceptTemplates.js';

/** ビルトイン3種（templatePreview.TEMPLATE_CANDIDATES と一致） */
const RULES = [
  {
    style: 'cafe_1',
    re: /カフェ|\bcafe\b|coffee|コーヒー|喫茶|レストラン|restaurant|brunch|bistro|パン屋|ベーカリー|bakery|ケーキ|スイーツ|パティスリー|ラーメン|らーめん|ramen|つけ麺|油そば|支那そば|中華そば|居酒屋|バー|\bbar\b|ダイニングバー|pub|ワインバー|ナイト|lounge|ペット|ドッグ|犬|トリミング|pet|dog|dog_training/i,
  },
  {
    style: 'academy_lp',
    re: /塾|習い事|教室|予備校|保育|幼稚園|キッズ|preschool|nursery|教育|整骨院|整体|鍼灸|接骨|クリニック|医院|dentist|doctor|hospital|physician|ジム|gym|フィットネス|fitness|パーソナル|トレーニング|ヨガ|\byoga\b|ピラティス|pilates|24時間365日|伴走プラン|フルサポートプラン|ビジター利用プラン|ネオン.?ジム|サイバー.?フィットネス|LINE.?友だち追加だけ|イベント|event|フェス|フェスティバル|festival|コンサート|concert|展示会|セミナー|seminar|ワークショップ|workshop/i,
  },
  {
    style: 'navy_cyan_consult',
    re: /美容室|理容室|ヘアサロン|hair_salon|hair_care|beauty_salon|barber|工務店|リノベ|施工|建築|ハウスメーカー|builder|renovation|税理士|行政書士|社労士|弁護士|コンサル|consulting|税理|法律|lawyer|士業|会計|不動産|real_estate|保険|insurance|アパレル|服|ファッション|cloth|apparel|fashion|ブティック|boutique|ブランド|brand|ルックブック|look\s*book|特集ページ|コラボページ|コレクション.?ページ|キャンペーン.?ページ|革|レザー|\bleather\b|ジビエ|鞣し|タンニン|バッグ|財布|小物|職人|工房|クラフト|アトリエ|素材感|縦書き|工芸|レザークラフト/i,
  },
];

const CONCEPT_DEFAULT = {
  cafe: 'cafe_1',
  restaurant: 'cafe_1',
  salon: 'navy_cyan_consult',
  retail: 'cafe_1',
  apparel: 'navy_cyan_consult',
  service: 'navy_cyan_consult',
  clinic: 'academy_lp',
  general: 'navy_cyan_consult',
};

/**
 * @param {string} searchQuery
 * @param {string} category Maps types など
 * @param {string} conceptId Gemini の cafe | salon | …
 * @param {string} [shopName] 店名（手動キューで検索語が空でもカフェ等を推定）
 * @returns {string[]} テンプレID配列（先頭がメインLP）
 */
export function getOrderedTemplateIds(searchQuery, category, conceptId, shopName = '') {
  const q = String(searchQuery || '').trim();
  const cat = String(category || '').replace(/_/g, ' ');
  const blob = `${q} ${cat} ${String(shopName || '').trim()}`.toLowerCase();
  let preferred = null;
  for (const { style, re } of RULES) {
    if (re.test(blob)) {
      preferred = style;
      break;
    }
  }
  if (!preferred) {
    const id = String(conceptId || 'general').toLowerCase();
    preferred = CONCEPT_DEFAULT[id] || CONCEPT_DEFAULT.general;
  }
  if (!TEMPLATE_IDS.includes(preferred)) preferred = TEMPLATE_IDS[0];
  const rest = TEMPLATE_IDS.filter((tid) => tid !== preferred);
  return [preferred, ...rest];
}
