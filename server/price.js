/**
 * プラン・オプションに応じた料金表（円）
 * 営業トーク・理由は docs 参照
 */

const PLANS = {
  normal: { yen: 39_800, name: '通常プラン', target: '一般の個人店・事業主' },
  student: { yen: 19_800, name: '学割プラン', target: '学生起業家・フリーランス' },
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

/** その他サービス（チェックボックス） */
const OTHER_SERVICES_CHECKBOX = {
  storeOfficialSubdomain: {
    yen: 5_000,
    name: '店名.store-official.net 提供',
    note: '`店名.store-official.net` で公開する場合',
  },
  cms: {
    yen: 20_000,
    name: '管理者画面（店専用CMS）追加',
    note:
      '顧客がオプションを選んだ場合、その店舗専用の管理画面を用意。閲覧数の確認、ページ内の文章・写真の差し替えが可能（契約後に個別セットアップ）',
  },
  onlinePayment: { yen: 30_000, name: 'オンライン決済導入', note: 'Square / Stripe連携' },
  fullCustom: { yen: 50_000, name: 'デザインフルカスタム', note: '50,000円〜' },
  seoMeo: { yen: 20_000, name: 'SEO・MEOセット', note: 'Google検索・マップ最適化' },
  /** 全テンプレ共通: 画面下固定の予約ボタン・日時枠（○×）・管理者メール通知・Googleカレンダー追加リンク */
  bookingSystem: {
    yen: 4_000,
    name: '予約システム',
    note: 'ホットペッパー風の枠表示・メール通知・カレンダーリンク（3,000〜5,000円帯の標準価格）',
  },
};

/** 独自ドメインは年数 × 単価（UI は数値入力） */
const OTHER_CUSTOM_DOMAIN = {
  yenPerYear: 5_000,
  maxYears: 10,
  name: '独自ドメイン取得・運用',
  note: '1年あたり5,000円。初回は年数分を一括。返金なし。最大10年。',
};

/**
 * @typedef {Object} BillingSelection
 * @property {'normal'|'student'} [plan]
 * @property {string} [referralCode] 紹介コード（照合は API 層。有効時は通常/学割の基本料金のみ0円）
 * @property {boolean} [contactFormRemoval]
 * @property {boolean} [snsFeedRemoval]
 * @property {boolean} [mapRemoval]
 * @property {number} [languageRemovalCount] 削除する言語数（1つにつき-2000円）
 * @property {boolean} [presentedByRemoval]
 * @property {boolean} [customQrCode]
 * @property {boolean} [webCoupon]
 * @property {boolean} [storeOfficialSubdomain]
 * @property {number} [customDomainYears] 独自ドメインの年数（1年あたり5000円）
 * @property {boolean} [domainSetup] 旧キー互換（store-official 提供と同義）
 * @property {boolean} [cms]
 * @property {boolean} [onlinePayment]
 * @property {boolean} [fullCustom]
 * @property {boolean} [seoMeo]
 * @property {boolean} [bookingSystem]
 */

/**
 * @param {BillingSelection} selection
 * @param {{ referralWaivesBasePlan?: boolean }} [options] referralWaivesBasePlan が true かつプランが通常/学割のとき、基本料金のみ0円（オプションはそのまま）
 * @returns {{ amountYen: number, items: { name: string, yen: number }[], referralBaseWaived: boolean }}
 */
export function calculatePrice(selection = {}, options = {}) {
  const referralWaivesBase = !!options.referralWaivesBasePlan;
  let planId = selection.plan || 'normal';
  if (planId === 'studentReferral') planId = 'student';
  const plan = PLANS[planId] || PLANS.normal;

  const canWaiveBase =
    referralWaivesBase && (planId === 'normal' || planId === 'student');
  const planYen = canWaiveBase ? 0 : plan.yen;
  const planLabel = canWaiveBase ? `${plan.name}（紹介コード適用・基本料金無料）` : plan.name;

  const items = [{ name: planLabel, yen: planYen }];
  let total = planYen;

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

  // その他サービス: store-official（旧 domainSetup も同義）
  const storeSub =
    !!(selection.storeOfficialSubdomain || selection.domainSetup);
  if (storeSub) {
    const o = OTHER_SERVICES_CHECKBOX.storeOfficialSubdomain;
    items.push({ name: o.name, yen: o.yen });
    total += o.yen;
  }

  const domainYears = Math.max(
    0,
    Math.min(OTHER_CUSTOM_DOMAIN.maxYears, Number(selection.customDomainYears) || 0)
  );
  if (domainYears > 0) {
    const yen = OTHER_CUSTOM_DOMAIN.yenPerYear * domainYears;
    items.push({
      name: `${OTHER_CUSTOM_DOMAIN.name}（${domainYears}年分）`,
      yen,
    });
    total += yen;
  }

  if (selection.cms) {
    items.push({ name: OTHER_SERVICES_CHECKBOX.cms.name, yen: OTHER_SERVICES_CHECKBOX.cms.yen });
    total += OTHER_SERVICES_CHECKBOX.cms.yen;
  }
  if (selection.onlinePayment) {
    items.push({
      name: OTHER_SERVICES_CHECKBOX.onlinePayment.name,
      yen: OTHER_SERVICES_CHECKBOX.onlinePayment.yen,
    });
    total += OTHER_SERVICES_CHECKBOX.onlinePayment.yen;
  }
  if (selection.fullCustom) {
    items.push({ name: OTHER_SERVICES_CHECKBOX.fullCustom.name, yen: OTHER_SERVICES_CHECKBOX.fullCustom.yen });
    total += OTHER_SERVICES_CHECKBOX.fullCustom.yen;
  }
  if (selection.seoMeo) {
    items.push({ name: OTHER_SERVICES_CHECKBOX.seoMeo.name, yen: OTHER_SERVICES_CHECKBOX.seoMeo.yen });
    total += OTHER_SERVICES_CHECKBOX.seoMeo.yen;
  }
  if (selection.bookingSystem) {
    const b = OTHER_SERVICES_CHECKBOX.bookingSystem;
    items.push({ name: b.name, yen: b.yen });
    total += b.yen;
  }

  return {
    amountYen: Math.max(0, total),
    items,
    referralBaseWaived: canWaiveBase,
  };
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
  return {
    ...OTHER_SERVICES_CHECKBOX,
    customDomainYears: {
      yenPerYear: OTHER_CUSTOM_DOMAIN.yenPerYear,
      maxYears: OTHER_CUSTOM_DOMAIN.maxYears,
      name: OTHER_CUSTOM_DOMAIN.name,
      note: OTHER_CUSTOM_DOMAIN.note,
    },
  };
}
