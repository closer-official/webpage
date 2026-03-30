/**
 * cafe_1（満腹食堂 鉄人）営業時間の単一ソース。
 * 本文・JSON-LD（cafeMeo.openingHours）・店舗カードで同じ内容を使う。
 */
const WEEKDAY_JA = ['月', '火', '水', '木', '金', '土', '日'];
const TIME_LINE = '11:00〜23:00（L.O. 22:30）';

/** schema.org openingHours 用（Google 推奨の曜日略号 + 時刻） */
export const CAFE_1_OPENING_HOURS_JSON_LD = [
  'Mo 11:00-23:00',
  'Tu 11:00-23:00',
  'We 11:00-23:00',
  'Th 11:00-23:00',
  'Fr 11:00-23:00',
  'Sa 11:00-23:00',
  'Su 11:00-23:00',
];

const WEEKDAY_LINES = WEEKDAY_JA.map((d) => `${d}曜日: ${TIME_LINE}`);

const NOTES = [
  '※祝日も上記時間に準じます。定休日は不定休（公式Instagramにて告知）',
  '混雑ピーク：12:00〜13:00 / 19:00〜20:30',
];

/** 営業時間セクションの content */
export const CAFE_1_HOURS_SECTION_CONTENT = [...WEEKDAY_LINES, ...NOTES].join('\n');

/**
 * アクセス内店舗カードの detail（曜日表 + 注記 + 電話 + 住所）
 * @param {string} phone 例: 03-6806-1192
 * @param {string} postalAddressLine 例: 〒120-0026 東京都足立区千住旭町40-2
 */
export function buildCafe1ShopLocationDetail(phone, postalAddressLine) {
  return [...WEEKDAY_LINES, NOTES[0], phone, postalAddressLine].join('\n');
}
