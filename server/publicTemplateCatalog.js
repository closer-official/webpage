import { getTemplateCandidates } from './templatePreview.js';
import {
  getMetaForCandidate,
  weekSeedFromDate,
  formatWeekPickupLabel,
  formatWeekPickupLabelEn,
  pickWeeklyShowcase,
} from './templateCatalogMeta.js';
import { store } from './data/store.js';

/**
 * 顧客向けに安全なフィールドだけ返す（customization 本文は含めない）
 * @param {unknown[]} customizations
 * @param {Date} [now]
 */
export async function buildPublicTemplateCatalog(customizations = [], now = new Date()) {
  const draftRec = await store.getGalleryDraftBuiltins();
  const galleryDraftBuiltinIds = new Set(
    Array.isArray(draftRec?.draftBuiltinIds) ? draftRec.draftBuiltinIds : [],
  );
  const candidates = getTemplateCandidates(customizations, {
    forPublicSelection: true,
    galleryDraftBuiltinIds,
  });

  const templates = candidates.map((c) => {
    const meta = getMetaForCandidate(c);
    return {
      id: c.id,
      name: c.name,
      baseTemplateId: c.baseTemplateId || c.id,
      previewUrl: `/api/template-preview/${encodeURIComponent(c.id)}`,
      category: meta.category,
      categories: meta.categories,
      popularity: meta.popularity,
      tags: meta.tags,
      kind: c.isCustom ? c.kind || 'custom' : 'builtin',
      isCustom: !!c.isCustom,
    };
  });

  const weekKey = weekSeedFromDate(now);
  const pickupIds = pickWeeklyShowcase(
    templates.map((t) => t.id),
    weekKey,
    3,
  );
  const pickupSet = new Set(pickupIds);
  const pickups = pickupIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean);

  return {
    weekKey,
    weekLabel: formatWeekPickupLabel(now),
    weekLabelEn: formatWeekPickupLabelEn(now),
    pickups,
    templates: templates.map((t) => ({
      ...t,
      isWeeklyPickup: pickupSet.has(t.id),
    })),
  };
}

/**
 * 管理者用: ギャラリー下書き中のビルトインも含め、各件に galleryDraft を付与
 * @param {unknown[]} customizations
 * @param {Date} [now]
 */
export async function buildAdminTemplateCatalog(customizations = [], now = new Date()) {
  const draftRec = await store.getGalleryDraftBuiltins();
  const draftSet = new Set(Array.isArray(draftRec?.draftBuiltinIds) ? draftRec.draftBuiltinIds : []);
  const candidates = getTemplateCandidates(customizations, { forPublicSelection: false });

  const templates = candidates.map((c) => {
    const meta = getMetaForCandidate(c);
    const galleryDraft = !c.isCustom && draftSet.has(c.id);
    return {
      id: c.id,
      name: c.name,
      baseTemplateId: c.baseTemplateId || c.id,
      previewUrl: `/api/template-preview/${encodeURIComponent(c.id)}`,
      category: meta.category,
      categories: meta.categories,
      popularity: meta.popularity,
      tags: meta.tags,
      kind: c.isCustom ? c.kind || 'custom' : 'builtin',
      isCustom: !!c.isCustom,
      galleryDraft,
    };
  });

  const weekKey = weekSeedFromDate(now);
  const visibleIds = templates.filter((t) => !t.galleryDraft).map((t) => t.id);
  const pickupIds = pickWeeklyShowcase(visibleIds, weekKey, 3);
  const pickupSet = new Set(pickupIds);
  const pickups = pickupIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean);

  return {
    weekKey,
    weekLabel: formatWeekPickupLabel(now),
    weekLabelEn: formatWeekPickupLabelEn(now),
    pickups,
    draftBuiltinIds: [...draftSet],
    templates: templates.map((t) => ({
      ...t,
      isWeeklyPickup: pickupSet.has(t.id),
    })),
  };
}
