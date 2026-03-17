import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';

const KEYS = {
  queue: 'queue',
  dashboard: 'dashboard',
  options: 'options',
  billing: 'billing',
  referenceSites: 'referenceSites',
  designInsights: 'designInsights',
  learningJob: 'learningJob',
  autoProcessEnabled: 'autoProcessEnabled',
};

function getDefault(name) {
  if (name === 'queue' || name === 'dashboard' || name === 'referenceSites') return [];
  if (name === 'designInsights') return { summary: '', byIndustry: {}, designSummary: '', byIndustryDesign: {}, updatedAt: null };
  if (name === 'learningJob') return { status: 'idle', industry: null, maxResults: null, phase: '', current: 0, total: 0, result: null, error: null, startedAt: null, completedAt: null };
  if (name === 'options') return { multiLanguage: false, contactForm: false, instagramLine: true, presentedBy: true, qrCode: false };
  if (name === 'billing') return { plan: 'normal' };
  if (name === 'autoProcessEnabled') return false;
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
  getDashboard: () => get(KEYS.dashboard),
  setDashboard: (arr) => set(KEYS.dashboard, arr),
  getOptions: () => get(KEYS.options),
  setOptions: async (o) => {
    const current = await get(KEYS.options);
    await set(KEYS.options, { ...current, ...o });
  },
  getBilling: () => get(KEYS.billing),
  setBilling: (b) => set(KEYS.billing, { ...getDefault(KEYS.billing), ...b }),
  getReferenceSites: () => get(KEYS.referenceSites),
  setReferenceSites: (arr) => set(KEYS.referenceSites, arr),
  getDesignInsights: () => get(KEYS.designInsights),
  setDesignInsights: (data) => set(KEYS.designInsights, data),
  getLearningJob: () => get(KEYS.learningJob),
  setLearningJob: (data) => set(KEYS.learningJob, data),
  getAutoProcessEnabled: () => get(KEYS.autoProcessEnabled),
  setAutoProcessEnabled: (v) => set(KEYS.autoProcessEnabled, v),
};

export { isSupabaseConfigured };
