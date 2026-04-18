/**
 * schema.js — Salon data schema and default factory
 */

export function createEmptySalon() {
  return {
    name: '',
    title: '',
    rating: null,
    reviewCount: null,
    address: '',
    accessShort: '',
    accessFull: '',
    heroCatch: '',
    introText: '',
    messageTitle: '',
    messageText: '',
    homepageUrl: '',
    /** 予約（ホットペッパー等）— 未設定時は CTA・指名リンクは homepageUrl にフォールバック */
    reserveUrl: '',
    /** スタイリスト一覧ページ — 未設定時は reserveUrl / homepageUrl */
    staffListUrl: '',
    instagramUrl: '',
    lineUrl: '',
    /** スタッフ募集など。フッター「Presented by divizero」の直上にリンクとして表示（http(s) のみ） */
    staffRecruitUrl: '',
    /** 上記リンクの表示文言（空なら「スタッフ募集」） */
    staffRecruitLabel: '',
    openingHours: '',
    closedDays: '',
    paymentMethods: '',
    seatCount: '',
    staffCount: '',
    parking: '',
    cutPrice: '',
    features: [],      // { title, text }
    atmosphere: [],    // string[]
    coupons: [],       // { type, categories[], price, title, conditions }
    staff: [],         // { name, specialty, catch, experience, avatarUrl, avatarText, reserveUrl? }
    stats: {
      firstVisitPrice: '',
      repeatVisitPrice: '',
      genderRatio: { female: null, male: null },
      ageRatio: []     // { label, value }
    }
  };
}
