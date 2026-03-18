/**
 * プラン・オプションに応じた料金表（円）
 * 営業トーク・理由は docs 参照
 */

const PLANS = {
  normal: { yen: 39_800, name: '通常プラン', target: '一般の個人店・事業主' },
  student: { yen: 19_800, name: '学割プラン', target: '学生起業家・フリーランス' },
  studentReferral: { yen: 14_800, name: '学割＋紹介最強プラン', target: '紹介経由の学生' },
};

/** 削除オプション（値引き） */
const REMOVALS = {
  contactFormRemoval: { yen: -3_000, name: 'お問い合わせフォームの削除', note: '予約は電話かインスタDMだけでいい店向け' },
  snsFeedRemoval: { yen: -2_000, name: 'SNSフィード連携の削除', note: '最新インスタ表示が不要な店向け' },
  mapRemoval: { yen: -2_000, name: '簡易マップ表示の削除', note: '店舗を持たないブランド向け' },
  languageRemovalPer: { yen: -2_000, namePer: '言語の削除（1言語につき）' },
};

/** 追加オプション（加算） */
const ADDONS = {
  presentedByRemoval: { yen: 5_000, name: 'Presented by 削除' },
  customQrCode: { yen: 2_000, name: 'カスタマイズQRコード作成' },
  webCoupon: { yen: 5_000, name: 'Webクーポン設置' },
};

/** その他サービス */
const OTHER_SERVICES = {
  domainSetup: { yen: 15_000, name: 'ドメイン取得・設定代行', note: 'サーバー代永久無料設定込み' },
  cms: {
    yen: 20_000,
    name: '管理者画面（店専用CMS）追加',
    note:
      '顧客がオプションを選んだ場合、その店舗専用の管理画面を用意。閲覧数の確認、ページ内の文章・写真の差し替えが可能（契約後に個別セットアップ）',
  },
  onlinePayment: { yen: 30_000, name: 'オンライン決済導入', note: 'Square / Stripe連携' },
  fullCustom: { yen: 50_000, name: 'デザインフルカスタム', note: '50,000円〜' },
  seoMeo: { yen: 20_000, name: 'SEO・MEOセット', note: 'Google検索・マップ最適化' },
};

/**
 * 請求用の選択肢
 * @typedef {Object} BillingSelection
 * @property {'normal'|'student'|'studentReferral'} plan
 * @property {boolean} [contactFormRemoval]
 * @property {boolean} [snsFeedRemoval]
 * @property {boolean} [mapRemoval]
 * @property {number} [languageRemovalCount] 削除する言語数（1つにつき-2000円）
 * @property {boolean} [presentedByRemoval]
 * @property {boolean} [customQrCode]
 * @property {boolean} [webCoupon]
 * @property {boolean} [domainSetup]
 * @property {boolean} [cms]
 * @property {boolean} [onlinePayment]
 * @property {boolean} [fullCustom]
 * @property {boolean} [seoMeo]
 */

/**
 * @param {BillingSelection} selection
 * @returns {{ amountYen: number, items: { name: string, yen: number }[] }}
 */
export function calculatePrice(selection = {}) {
  const planId = selection.plan || 'normal';
  const plan = PLANS[planId] || PLANS.normal;
  const items = [{ name: plan.name, yen: plan.yen }];
  let total = plan.yen;

  // 削除オプション
  if (selection.contactFormRemoval) {
    items.push({ name: REMOVALS.contactFormRemoval.name, yen: REMOVALS.contactFormRemoval.yen });
    total += REMOVALS.contactFormRemoval.yen;
  }
  if (selection.snsFeedRemoval) {
    items.push({ name: REMOVALS.snsFeedRemoval.name, yen: REMOVALS.snsFeedRemoval.yen });
    total += REMOVALS.snsFeedRemoval.yen;
  }
  if (selection.mapRemoval) {
    items.push({ name: REMOVALS.mapRemoval.name, yen: REMOVALS.mapRemoval.yen });
    total += REMOVALS.mapRemoval.yen;
  }
  const langCount = Math.max(0, Math.min(10, Number(selection.languageRemovalCount) || 0));
  if (langCount > 0) {
    const yen = REMOVALS.languageRemovalPer.yen * langCount;
    items.push({ name: `${REMOVALS.languageRemovalPer.namePer} × ${langCount}`, yen });
    total += yen;
  }

  // 追加オプション
  if (selection.presentedByRemoval) {
    items.push({ name: ADDONS.presentedByRemoval.name, yen: ADDONS.presentedByRemoval.yen });
    total += ADDONS.presentedByRemoval.yen;
  }
  if (selection.customQrCode) {
    items.push({ name: ADDONS.customQrCode.name, yen: ADDONS.customQrCode.yen });
    total += ADDONS.customQrCode.yen;
  }
  if (selection.webCoupon) {
    items.push({ name: ADDONS.webCoupon.name, yen: ADDONS.webCoupon.yen });
    total += ADDONS.webCoupon.yen;
  }

  // その他サービス
  if (selection.domainSetup) {
    items.push({ name: OTHER_SERVICES.domainSetup.name, yen: OTHER_SERVICES.domainSetup.yen });
    total += OTHER_SERVICES.domainSetup.yen;
  }
  if (selection.cms) {
    items.push({ name: OTHER_SERVICES.cms.name, yen: OTHER_SERVICES.cms.yen });
    total += OTHER_SERVICES.cms.yen;
  }
  if (selection.onlinePayment) {
    items.push({ name: OTHER_SERVICES.onlinePayment.name, yen: OTHER_SERVICES.onlinePayment.yen });
    total += OTHER_SERVICES.onlinePayment.yen;
  }
  if (selection.fullCustom) {
    items.push({ name: OTHER_SERVICES.fullCustom.name, yen: OTHER_SERVICES.fullCustom.yen });
    total += OTHER_SERVICES.fullCustom.yen;
  }
  if (selection.seoMeo) {
    items.push({ name: OTHER_SERVICES.seoMeo.name, yen: OTHER_SERVICES.seoMeo.yen });
    total += OTHER_SERVICES.seoMeo.yen;
  }

  return { amountYen: Math.max(0, total), items };
}

export function getPlanOptions() {
  return Object.entries(PLANS).map(([id, p]) => ({ id, ...p }));
}

export function getRemovalOptions() {
  return REMOVALS;
}

export function getAddonOptions() {
  return ADDONS;
}

export function getOtherServiceOptions() {
  return OTHER_SERVICES;
}
