/**
 * フルオート／キュー処理で「メインの1枚目」テンプレ順を決める。
 * 検索クエリ・Maps category を優先し、次に Gemini の conceptId。
 */
import { TEMPLATE_IDS } from './conceptTemplates.js';

/** カフェ・飲食をホテル／サロン系より先に判定（検索が「カフェ」でも Maps の type が beauty_salon 等だと誤爆しやすいため） */
const RULES = [
  {
    style: 'high_energy',
    re: /ジム|gym|フィットネス|fitness|fitness_center|sports_complex|パーソナル|トレーニング|training|workout|クロスフィット|crossfit|ピラティス|pilates|ヨガスタジオ|\byoga\b|スポーツクラブ/i,
  },
  {
    style: 'pop_friendly',
    re: /キッズ|保育|幼稚園|児童|あそび場|室内遊|ボールプール|playground|amusement|preschool|nursery|子ども|子供向け|ファミリー向け/i,
  },
  {
    style: 'warm_organic',
    re: /カフェ|\bcafe\b|coffee|コーヒー|喫茶|ベーカリー|bakery|パン屋|レストラン|restaurant|brunch|スイーツ|カフェテリア|meal_takeaway|meal_delivery|food|bistro/i,
  },
  {
    style: 'dark_edge',
    re: /バー|\bbar\b|ナイト|night_club|ラウンジ|lounge|クラブ|club|pub|居酒屋|ワインバー|カクテル/i,
  },
  {
    style: 'minimal_luxury',
    re: /ホテル|hotel|lodging|motel|旅館|ryokan|民宿|guest house|エステ|esthetic|\bspa\b|beauty_salon|美容室|hair_care|hair_salon|resort|bed_and_breakfast/i,
  },
  {
    style: 'corporate_trust',
    re: /クリニック|医院|歯科|内科|外科|診療|dentist|doctor|hospital|physician|health|コンサル|consulting|税理|法律|lawyer|司法|不動産|real_estate|保険|insurance|士業|会計|株式会社|会社|オフィス/i,
  },
];

const CONCEPT_DEFAULT = {
  cafe: 'warm_organic',
  restaurant: 'warm_organic',
  salon: 'minimal_luxury',
  retail: 'pop_friendly',
  apparel: 'dark_edge',
  service: 'corporate_trust',
  clinic: 'corporate_trust',
  general: 'minimal_luxury',
};

/**
 * @param {string} searchQuery
 * @param {string} category Maps types など
 * @param {string} conceptId Gemini の cafe | salon | …
 * @param {string} [shopName] 店名（手動キューで検索語が空でもカフェ等を推定）
 * @returns {string[]} 6テンプレID（先頭がメインLP）
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
  if (!TEMPLATE_IDS.includes(preferred)) preferred = 'minimal_luxury';
  const rest = TEMPLATE_IDS.filter((tid) => tid !== preferred);
  return [preferred, ...rest];
}
