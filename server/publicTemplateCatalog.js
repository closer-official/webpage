import { getTemplateCandidates } from './templatePreview.js';
import {
  getMetaForCandidate,
  weekSeedFromDate,
  formatWeekPickupLabel,
  pickWeeklyShowcase,
} from './templateCatalogMeta.js';

/**
 * 顧客向けに安全なフィールドだけ返す（customization 本文は含めない）
 * @param {unknown[]} customizations
 * @param {Date} [now]
 */
export function buildPublicTemplateCatalog(customizations = [], now = new Date()) {
  const candidates = getTemplateCandidates(customizations, { forPublicSelection: true });

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
    4,
  );
  const pickupSet = new Set(pickupIds);
  const pickups = pickupIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean);

  return {
    weekKey,
    weekLabel: formatWeekPickupLabel(now),
    pickups,
    templates: templates.map((t) => ({
      ...t,
      isWeeklyPickup: pickupSet.has(t.id),
    })),
  };
}
