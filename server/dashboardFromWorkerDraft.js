import { randomBytes } from 'node:crypto';
import { renderTemplatePreview } from './templatePreview.js';

export function makeWorkerDashboardId() {
  return `d-${Date.now().toString(36)}-${randomBytes(6).toString('hex')}`;
}

const EMPTY_SIGNALS = {
  placeId: null,
  mapsUrl: null,
  rating: null,
  userRatingsTotal: null,
  hasOpeningHours: false,
  hasPhoto: false,
  needsVerification: false,
};

export function findDashboardByCustomizationId(dashboard, customizationId) {
  const cid = String(customizationId || '');
  if (!cid) return null;
  const arr = Array.isArray(dashboard) ? dashboard : [];
  return arr.find((d) => d && d.linkedTemplateCustomizationId === cid) || null;
}

/**
 * 店舗ドラフト（template-customizations）から送付・フェーズ用ダッシュボード1件を組み立てる。
 */
export function buildDashboardItemFromCustomization(customizationItem) {
  const cid = String(customizationItem?.id || '');
  if (!cid) return null;

  const nameDraft = String(customizationItem.name || '店舗ドラフト').trim() || '店舗ドラフト';
  const baseId = String(customizationItem.baseTemplateId || 'cafe_1').trim() || 'cafe_1';

  if (
    customizationItem.blueprint &&
    typeof customizationItem.blueprint === 'object' &&
    customizationItem.blueprint.version === 1
  ) {
    const tplId = baseId === 'blueprint' ? 'navy_cyan_consult' : baseId;
    const content = {
      siteName: nameDraft,
      title: nameDraft,
      headline: nameDraft,
      subheadline: '',
      sections: [
        {
          id: 'concept',
          title: 'コンセプト',
          content: '参考設計（blueprint）のドラフトです。検閲画面で本文を調整できます。',
        },
      ],
      footerText: `© ${new Date().getFullYear()} ${nameDraft}`,
    };
    const seo = {
      metaTitle: nameDraft.slice(0, 120),
      metaDescription: `作業者用ドラフト（${cid}）`.slice(0, 320),
      keywords: nameDraft.slice(0, 500),
      ogImageUrl: '',
      canonicalUrl: '',
    };
    return {
      id: makeWorkerDashboardId(),
      researched: {
        queueId: `worker-${cid}`,
        name: nameDraft,
        address: '',
        concept: '店舗ドラフト（作業者用）から自動登録',
        strengths: '',
        imageColorStyleId: tplId,
        category: 'general',
        notes: `template-customization:${cid}`,
        signals: { ...EMPTY_SIGNALS },
      },
      content,
      seo,
      templateId: tplId,
      dmBody: '',
      status: 'approved',
      outreachPhase: 'pending_send',
      createdAt: new Date().toISOString(),
      unsubscribeToken: randomBytes(24).toString('hex'),
      linkedTemplateCustomizationId: cid,
    };
  }

  const resolved = renderTemplatePreview(baseId, customizationItem, { returnResolvedData: true });
  if (!resolved || !resolved.content) return null;

  const c = resolved.content;
  const shopName = String(c.siteName || c.title || c.headline || nameDraft).trim() || nameDraft;
  let address = String(c.footerAddress || '').trim();
  if (!address && c.cafeMeo && typeof c.cafeMeo === 'object') {
    const m = c.cafeMeo;
    address = [m.postalCode, m.addressRegion, m.addressLocality, m.streetAddress].filter(Boolean).join(' ').trim();
  }

  return {
    id: makeWorkerDashboardId(),
    researched: {
      queueId: `worker-${cid}`,
      name: shopName,
      address,
      concept: String(c.subheadline || c.headline || '').trim().slice(0, 500),
      strengths: '',
      imageColorStyleId: resolved.id,
      category: 'general',
      notes: `template-customization:${cid}`,
      signals: { ...EMPTY_SIGNALS },
    },
    content: resolved.content,
    seo: resolved.seo,
    templateId: resolved.id,
    dmBody: '',
    status: 'approved',
    outreachPhase: 'pending_send',
    createdAt: new Date().toISOString(),
    unsubscribeToken: randomBytes(24).toString('hex'),
    linkedTemplateCustomizationId: cid,
  };
}

/**
 * カスタム保存レスポンス用オブジェクトの linkedDashboardId を補い、必要なら dashboard に1件追加する。
 * @param {object} customizationItem — 保存直後のテンプレカスタム1件（ミュータブルで渡す）
 * @param {object} body — リクエスト body（linkedDashboardId の明示指定の判定用）
 * @param {object[]} dashboard — getDashboard() の配列（ミュータブル）
 * @returns {boolean} 新規ダッシュボード行を unshift したか
 */
export function ensureDashboardForWorkerDraft(customizationItem, body, dashboard) {
  const cid = String(customizationItem?.id || '');
  if (!cid) return false;

  const explicit = body && Object.prototype.hasOwnProperty.call(body, 'linkedDashboardId');
  const lid = String((body && body.linkedDashboardId) || '').trim();

  if (explicit) {
    if (!lid) {
      delete customizationItem.linkedDashboardId;
      return false;
    }
    const idx = dashboard.findIndex((d) => d.id === lid);
    if (idx >= 0) {
      customizationItem.linkedDashboardId = lid;
      if (!dashboard[idx].linkedTemplateCustomizationId) {
        dashboard[idx] = { ...dashboard[idx], linkedTemplateCustomizationId: cid };
      }
    } else {
      customizationItem.linkedDashboardId = lid;
    }
    return false;
  }

  const byC = findDashboardByCustomizationId(dashboard, cid);
  if (byC) {
    customizationItem.linkedDashboardId = byC.id;
    return false;
  }

  const cur = String(customizationItem.linkedDashboardId || '').trim();
  if (cur && dashboard.some((d) => d.id === cur)) {
    return false;
  }
  if (cur && !dashboard.some((d) => d.id === cur)) {
    delete customizationItem.linkedDashboardId;
  }

  const row = buildDashboardItemFromCustomization(customizationItem);
  if (!row) return false;
  dashboard.unshift(row);
  customizationItem.linkedDashboardId = row.id;
  return true;
}
