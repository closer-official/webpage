/**
 * 学習ジョブ用：業種 → 検索クエリのマッピング
 * エリアは固定（東京）で上位表示を取得。必要なら変更可能。
 */
const AREA = '東京';

export const INDUSTRY_QUERIES = {
  cafe: `${AREA} カフェ`,
  restaurant: `${AREA} レストラン`,
  salon: `${AREA} 美容室`,
  retail: `${AREA} 雑貨`,
  apparel: `${AREA} アパレル`,
  service: `${AREA} サービス`,
  clinic: `${AREA} 整骨院`,
  general: `${AREA} 店`,
};

export const INDUSTRIES = Object.keys(INDUSTRY_QUERIES);
