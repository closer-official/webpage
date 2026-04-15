/** 送付・フェーズの「美容室プール」と「飲食・その他」の切り分け */

export const BEAUTY_BASE_TEMPLATE_IDS = new Set(['beauty_standalone', 'beauty_salon_mellow', 'beauty_salon_hpb']);

export function customizationBaseIsBeauty(baseId) {
  return BEAUTY_BASE_TEMPLATE_IDS.has(String(baseId || '').trim());
}

/**
 * ダッシュボード1件が美容室側の案件か（店舗ドラフト base / 紐づき / templateId のヒューリスティック）
 * @param {object} item
 * @param {object[]} customizations template-customizations の配列
 */
export function dashboardItemIsBeauty(item, customizations) {
  if (!item || typeof item !== 'object') return false;
  if (customizationBaseIsBeauty(item.linkedTemplateBaseId)) return true;
  const cid = String(item.linkedTemplateCustomizationId || '').trim();
  if (cid && Array.isArray(customizations)) {
    const c = customizations.find((x) => x && x.id === cid);
    if (customizationBaseIsBeauty(c?.baseTemplateId)) return true;
  }
  const tid = String(item.templateId || '').toLowerCase();
  if (tid.includes('beauty') || tid.includes('mellow') || tid.includes('hpb')) return true;
  return false;
}
