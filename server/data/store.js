import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isSupabaseConfigured } from './storeSupabase.js';
import { storeSupabase } from './storeSupabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'json');
const FILES = {
  queue: 'queue.json',
  dashboard: 'dashboard.json',
  options: 'options.json',
  billing: 'billing.json',
  referenceSites: 'referenceSites.json',
  designInsights: 'designInsights.json',
  learningJob: 'learningJob.json',
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
  if (name === 'queue' || name === 'dashboard' || name === 'referenceSites') return [];
  if (name === 'designInsights') return { summary: '', byIndustry: {}, designSummary: '', byIndustryDesign: {}, updatedAt: null };
  if (name === 'learningJob') return { status: 'idle', industry: null, maxResults: null, phase: '', current: 0, total: 0, result: null, error: null, startedAt: null, completedAt: null };
  if (name === 'options') return { multiLanguage: false, contactForm: false, instagramLine: true, presentedBy: true, qrCode: false };
  if (name === 'billing') return { plan: 'normal' };
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
  getReferenceSites: () => Promise.resolve(read('referenceSites')),
  setReferenceSites: (arr) => { write('referenceSites', arr); return Promise.resolve(); },
  getDesignInsights: () => Promise.resolve(read('designInsights')),
  setDesignInsights: (data) => { write('designInsights', data); return Promise.resolve(); },
  getLearningJob: () => Promise.resolve(read('learningJob')),
  setLearningJob: (data) => { write('learningJob', data); return Promise.resolve(); },
  getAutoProcessEnabled: () => Promise.resolve(false),
  setAutoProcessEnabled: () => Promise.resolve(),
};

export const store = isSupabaseConfigured() ? storeSupabase : fileStore;
