/**
 * cafe_1 プレビュー・ギャラリー用の「営業時間」サンプル。
 * 実サイトではセクション id=hours の本文・MEO の openingHours を編集して上書きする。
 */
const SAMPLE_LUNCH = '11:00〜15:00（L.O. 14:30）';
const SAMPLE_DINNER = '17:00〜22:00（L.O. 21:30）';

/** schema.org openingHours 用（サンプル・Google 推奨形式） */
export const CAFE_1_OPENING_HOURS_JSON_LD = ['Mo-Su 11:00-15:00', 'Mo-Su 17:00-22:00'];

/** 営業時間セクションの content（サンプル文言） */
export const CAFE_1_HOURS_SECTION_CONTENT = [
  `ランチ　${SAMPLE_LUNCH}`,
  `ディナー　${SAMPLE_DINNER}`,
  '土日祝・通し営業の日は変わる場合があります（店舗にご確認ください）',
  '定休日は公式のお知らせをご確認ください',
].join('\n');

/**
 * アクセス内店舗カードの detail（電話・住所のみ。時刻は固定しない）
 * @param {string} phone 例: 03-0000-0000
 * @param {string} postalAddressLine 例: 〒100-0001 東京都…
 */
export function buildCafe1ShopLocationDetail(phone, postalAddressLine) {
  return [`電話: ${phone}`, postalAddressLine, '営業時間は本ページの「営業時間」をご確認ください。'].join('\n');
}
