import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';
import { hashPasswordScrypt } from '../lpCmsCrypto.js';

const KEYS = {
  queue: 'queue',
  lpContent: 'lpContent',
  lpAnalytics: 'lpAnalytics',
  lpCmsAccounts: 'lpCmsAccounts',
  dashboard: 'dashboard',
  options: 'options',
  billing: 'billing',
  customerIntake: 'customerIntake',
  templateCustomizations: 'templateCustomizations',
  referenceSites: 'referenceSites',
  designInsights: 'designInsights',
  learningJob: 'learningJob',
  autoProcessEnabled: 'autoProcessEnabled',
  salesAgency: 'salesAgency',
};

function getDefault(name) {
  if (name === 'queue' || name === 'dashboard' || name === 'referenceSites' || name === 'customerIntake' || name === 'templateCustomizations') return [];
  if (name === 'designInsights') return { summary: '', byIndustry: {}, designSummary: '', byIndustryDesign: {}, updatedAt: null };
  if (name === 'learningJob') return { status: 'idle', industry: null, maxResults: null, phase: '', current: 0, total: 0, result: null, error: null, startedAt: null, completedAt: null };
  if (name === 'options') return { multiLanguage: false, contactForm: false, formActionUrl: '', qrCodeTargetUrl: '', instagramLine: true, presentedBy: true, qrCode: false };
  if (name === 'billing') return { plan: 'normal' };
  if (name === 'lpContent') return {};
  if (name === 'lpAnalytics') return {};
  if (name === 'lpCmsAccounts') return {};
  if (name === 'autoProcessEnabled') return false;
  if (name === 'salesAgency') {
    return {
      orgs: {},
      reps: {},
      repByEmail: {},
      sessions: {},
      placeCache: {},
      apiUsage: [],
    };
  }
  return {};
}

async function get(key) {
  const sb = await getSupabase();
  if (!sb) return getDefault(key);
  const { data, error } = await sb.from('app_store').select('value').eq('key', key).single();
  if (error || !data) return getDefault(key);
  return data.value ?? getDefault(key);
}

async function set(key, value) {
  const sb = await getSupabase();
  if (!sb) return;
  await sb.from('app_store').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

export const storeSupabase = {
  getQueue: () => get(KEYS.queue),
  setQueue: (arr) => set(KEYS.queue, arr),
  getLpContent: async (slug) => {
    const data = await get(KEYS.lpContent);
    const obj = data && typeof data === 'object' ? data : {};
    return obj[slug] ?? null;
  },
  setLpContent: async (slug, content) => {
    const data = (await get(KEYS.lpContent)) || {};
    const obj = typeof data === 'object' ? { ...data } : {};
    obj[slug] = content;
    await set(KEYS.lpContent, obj);
  },
  getLpAnalytics: async () => {
    const data = await get(KEYS.lpAnalytics);
    return data && typeof data === 'object' ? data : {};
  },
  incrementLpView: async (slug) => {
    const data = (await get(KEYS.lpAnalytics)) || {};
    const obj = typeof data === 'object' ? { ...data } : {};
    const prev = obj[slug] && typeof obj[slug] === 'object' ? obj[slug] : { count: 0 };
    const count = (Number(prev.count) || 0) + 1;
    obj[slug] = { count, updatedAt: new Date().toISOString() };
    await set(KEYS.lpAnalytics, obj);
    return count;
  },
  getLpViewStats: async (slug) => {
    const data = (await get(KEYS.lpAnalytics)) || {};
    const obj = typeof data === 'object' ? data : {};
    const rec = obj[slug];
    if (!rec || typeof rec !== 'object') return { viewCount: 0, updatedAt: null };
    return { viewCount: Number(rec.count) || 0, updatedAt: rec.updatedAt || null };
  },
  getLpCmsAccount: async (siteKey) => {
    const data = (await get(KEYS.lpCmsAccounts)) || {};
    const obj = typeof data === 'object' ? data : {};
    const rec = obj[String(siteKey)];
    if (!rec || typeof rec !== 'object') return null;
    return rec;
  },
  setLpCmsAccount: async (siteKey, username, plainPassword) => {
    const data = (await get(KEYS.lpCmsAccounts)) || {};
    const obj = typeof data === 'object' ? { ...data } : {};
    const h = hashPasswordScrypt(plainPassword);
    obj[String(siteKey)] = {
      username: String(username || '').trim(),
      passwordSalt: h.passwordSalt,
      passwordHash: h.passwordHash,
      alg: h.alg,
      updatedAt: new Date().toISOString(),
    };
    await set(KEYS.lpCmsAccounts, obj);
  },
  deleteLpCmsAccount: async (siteKey) => {
    const data = (await get(KEYS.lpCmsAccounts)) || {};
    const obj = typeof data === 'object' ? { ...data } : {};
    delete obj[String(siteKey)];
    await set(KEYS.lpCmsAccounts, obj);
  },
  getDashboard: () => get(KEYS.dashboard),
  setDashboard: (arr) => set(KEYS.dashboard, arr),
  getOptions: () => get(KEYS.options),
  setOptions: async (o) => {
    const current = await get(KEYS.options);
    await set(KEYS.options, { ...current, ...o });
  },
  getBilling: () => get(KEYS.billing),
  setBilling: (b) => set(KEYS.billing, { ...getDefault(KEYS.billing), ...b }),
  getCustomerIntake: () => get(KEYS.customerIntake),
  setCustomerIntake: (arr) => set(KEYS.customerIntake, arr),
  getTemplateCustomizations: () => get(KEYS.templateCustomizations),
  setTemplateCustomizations: (arr) => set(KEYS.templateCustomizations, arr),
  getReferenceSites: () => get(KEYS.referenceSites),
  setReferenceSites: (arr) => set(KEYS.referenceSites, arr),
  getDesignInsights: () => get(KEYS.designInsights),
  setDesignInsights: (data) => set(KEYS.designInsights, data),
  getLearningJob: () => get(KEYS.learningJob),
  setLearningJob: (data) => set(KEYS.learningJob, data),
  getAutoProcessEnabled: () => get(KEYS.autoProcessEnabled),
  setAutoProcessEnabled: (v) => set(KEYS.autoProcessEnabled, v),
  getSalesAgency: async () => {
    const data = await get(KEYS.salesAgency);
    const d = data && typeof data === 'object' ? data : {};
    const def = getDefault(KEYS.salesAgency);
    return {
      ...def,
      ...d,
      orgs: typeof d.orgs === 'object' ? d.orgs : {},
      reps: typeof d.reps === 'object' ? d.reps : {},
      repByEmail: typeof d.repByEmail === 'object' ? d.repByEmail : {},
      sessions: typeof d.sessions === 'object' ? d.sessions : {},
      placeCache: typeof d.placeCache === 'object' ? d.placeCache : {},
      apiUsage: Array.isArray(d.apiUsage) ? d.apiUsage : [],
    };
  },
  setSalesAgency: async (whole) => {
    const base = getDefault(KEYS.salesAgency);
    await set(KEYS.salesAgency, { ...base, ...whole, updatedAt: new Date().toISOString() });
  },
};

export { isSupabaseConfigured };
