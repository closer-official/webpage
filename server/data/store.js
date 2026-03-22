import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isSupabaseConfigured } from './storeSupabase.js';
import { storeSupabase } from './storeSupabase.js';
import { hashPasswordScrypt } from '../lpCmsCrypto.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'json');
const FILES = {
  queue: 'queue.json',
  dashboard: 'dashboard.json',
  options: 'options.json',
  billing: 'billing.json',
  customerIntake: 'customerIntake.json',
  templateCustomizations: 'templateCustomizations.json',
  referenceSites: 'referenceSites.json',
  designInsights: 'designInsights.json',
  learningJob: 'learningJob.json',
  lpContent: 'lpContent.json',
  lpAnalytics: 'lpAnalytics.json',
  salesAgency: 'salesAgency.json',
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function read(name) {
  ensureDir();
  const file = path.join(DATA_DIR, FILES[name]);
  if (!fs.existsSync(file)) return getDefault(name);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return getDefault(name);
  }
}

function write(name, data) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, FILES[name]), JSON.stringify(data, null, 2), 'utf8');
}

function getDefault(name) {
  if (name === 'queue' || name === 'dashboard' || name === 'referenceSites' || name === 'customerIntake' || name === 'templateCustomizations') return [];
  if (name === 'designInsights') return { summary: '', byIndustry: {}, designSummary: '', byIndustryDesign: {}, updatedAt: null };
  if (name === 'learningJob') return { status: 'idle', industry: null, maxResults: null, phase: '', current: 0, total: 0, result: null, error: null, startedAt: null, completedAt: null };
  if (name === 'options') return { multiLanguage: false, contactForm: false, formActionUrl: '', qrCodeTargetUrl: '', instagramLine: true, presentedBy: true, qrCode: false };
  if (name === 'billing') return { plan: 'normal' };
  if (name === 'lpCmsAccounts') return {};
  return {};
}

const fileStore = {
  getQueue: () => Promise.resolve(read('queue')),
  setQueue: (arr) => { write('queue', arr); return Promise.resolve(); },
  getDashboard: () => Promise.resolve(read('dashboard')),
  setDashboard: (arr) => { write('dashboard', arr); return Promise.resolve(); },
  getOptions: () => Promise.resolve(read('options')),
  setOptions: async (o) => { const current = read('options'); write('options', { ...current, ...o }); return Promise.resolve(); },
  getBilling: () => Promise.resolve(read('billing')),
  setBilling: (b) => { write('billing', { ...getDefault('billing'), ...b }); return Promise.resolve(); },
  getCustomerIntake: () => Promise.resolve(read('customerIntake')),
  setCustomerIntake: (arr) => { write('customerIntake', arr); return Promise.resolve(); },
  getTemplateCustomizations: () => Promise.resolve(read('templateCustomizations')),
  setTemplateCustomizations: (arr) => { write('templateCustomizations', arr); return Promise.resolve(); },
  getReferenceSites: () => Promise.resolve(read('referenceSites')),
  setReferenceSites: (arr) => { write('referenceSites', arr); return Promise.resolve(); },
  getDesignInsights: () => Promise.resolve(read('designInsights')),
  setDesignInsights: (data) => { write('designInsights', data); return Promise.resolve(); },
  getLearningJob: () => Promise.resolve(read('learningJob')),
  setLearningJob: (data) => { write('learningJob', data); return Promise.resolve(); },
  getAutoProcessEnabled: () => Promise.resolve(false),
  setAutoProcessEnabled: () => Promise.resolve(),
  getLpContent: async (slug) => {
    const data = read('lpContent');
    return data[slug] ?? null;
  },
  setLpContent: async (slug, content) => {
    const data = read('lpContent');
    data[slug] = content;
    write('lpContent', data);
  },
  getLpAnalytics: async () => read('lpAnalytics'),
  incrementLpView: async (slug) => {
    const data = read('lpAnalytics');
    const prev = data[slug] && typeof data[slug] === 'object' ? data[slug] : { count: 0 };
    const count = (Number(prev.count) || 0) + 1;
    data[slug] = { count, updatedAt: new Date().toISOString() };
    write('lpAnalytics', data);
    return count;
  },
  getLpViewStats: async (slug) => {
    const data = read('lpAnalytics');
    const rec = data[slug];
    if (!rec || typeof rec !== 'object') return { viewCount: 0, updatedAt: null };
    return { viewCount: Number(rec.count) || 0, updatedAt: rec.updatedAt || null };
  },
  getLpCmsAccount: async (siteKey) => {
    const data = read('lpCmsAccounts');
    const rec = data[String(siteKey)];
    if (!rec || typeof rec !== 'object') return null;
    return rec;
  },
  setLpCmsAccount: async (siteKey, username, plainPassword) => {
    const data = read('lpCmsAccounts');
    const h = hashPasswordScrypt(plainPassword);
    data[String(siteKey)] = {
      username: String(username || '').trim(),
      passwordSalt: h.passwordSalt,
      passwordHash: h.passwordHash,
      alg: h.alg,
      updatedAt: new Date().toISOString(),
    };
    write('lpCmsAccounts', data);
  },
  deleteLpCmsAccount: async (siteKey) => {
    const data = read('lpCmsAccounts');
    delete data[String(siteKey)];
    write('lpCmsAccounts', data);
  },
  getSalesAgency: async () => {
    const data = read('salesAgency');
    if (!data || typeof data !== 'object') return getDefault('salesAgency');
    return {
      ...getDefault('salesAgency'),
      ...data,
      orgs: typeof data.orgs === 'object' ? data.orgs : {},
      reps: typeof data.reps === 'object' ? data.reps : {},
      repByEmail: typeof data.repByEmail === 'object' ? data.repByEmail : {},
      sessions: typeof data.sessions === 'object' ? data.sessions : {},
      placeCache: typeof data.placeCache === 'object' ? data.placeCache : {},
      apiUsage: Array.isArray(data.apiUsage) ? data.apiUsage : [],
    };
  },
  setSalesAgency: async (whole) => {
    const base = getDefault('salesAgency');
    write('salesAgency', { ...base, ...whole, updatedAt: new Date().toISOString() });
  },
};

export const store = isSupabaseConfigured() ? storeSupabase : fileStore;
