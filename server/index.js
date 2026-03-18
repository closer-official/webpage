import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { collectPlaces } from './collect.js';
import { processOne } from './process.js';
import { store } from './data/store.js';
import { isSupabaseConfigured } from './data/storeSupabase.js';
import { fetchPageMeta } from './fetchPageMeta.js';
import { analyzeReferenceSites, extractDesignFromHtml } from './gemini.js';
import { runLearningJob } from './learningJob.js';
import { INDUSTRIES } from './learningQueries.js';
import { calculatePrice, getPlanOptions, getRemovalOptions, getAddonOptions, getOtherServiceOptions } from './price.js';
import { createCheckoutSession, isStripeConfigured } from './stripeCheckout.js';
import { getFullAutoStatus, startFullAutoRun } from './fullAutoJob.js';

// 旧オプション形式でも料金計算できるよう互換（billing は呼び出し側で await store.getBilling() して渡す）
function pricePayload(body, billing) {
  if (body && body.plan) return body;
  if (body && typeof body === 'object' && (body.multiLanguage != null || body.contactForm != null)) {
    return body;
  }
  return billing;
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

let autoProcessTimer = null;
async function stopAutoProcess() {
  if (autoProcessTimer) {
    clearInterval(autoProcessTimer);
    autoProcessTimer = null;
  }
  if (isSupabaseConfigured()) await store.setAutoProcessEnabled(false);
}
async function startAutoProcess() {
  if (isSupabaseConfigured()) {
    await store.setAutoProcessEnabled(true);
    return;
  }
  if (autoProcessTimer) return;
  const processNext = async () => {
    const queue = await store.getQueue();
    if (queue.length === 0) {
      stopAutoProcess();
      return;
    }
    try {
      const options = await store.getOptions();
      const item = queue[0];
      const dashboardItem = await processOne(item, options);
      await store.setQueue(queue.slice(1));
      const dashboard = await store.getDashboard();
      dashboard.unshift(dashboardItem);
      await store.setDashboard(dashboard);
    } catch (e) {
      console.error('auto-process error', e);
    }
  };
  autoProcessTimer = setInterval(processNext, 20000);
  processNext();
}

// ---------- オプション ----------
app.get('/api/options', async (req, res) => {
  res.json(await store.getOptions());
});

app.post('/api/options', async (req, res) => {
  const o = await store.getOptions();
  await store.setOptions({ ...o, ...req.body });
  res.json(await store.getOptions());
});

// ---------- キュー ----------
app.get('/api/queue', async (req, res) => {
  res.json(await store.getQueue());
});

app.delete('/api/queue/:id', async (req, res) => {
  const queue = (await store.getQueue()).filter((q) => q.id !== req.params.id);
  await store.setQueue(queue);
  res.status(204).send();
});

app.post('/api/queue', async (req, res) => {
  const queue = await store.getQueue();
  const body = req.body;
  if (body.placeId) {
    const dup = queue.find((q) => q.placeId === body.placeId);
    if (dup) return res.status(200).json({ ...dup, alreadyInQueue: true });
  }
  const item = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    source: body.source || 'google_maps',
    name: body.name || '(名称なし)',
    address: body.address || '',
    placeId: body.placeId || null,
    notes: body.notes || '',
    signals: body.signals || {
      placeId: body.placeId || null,
      mapsUrl: body.placeId ? `https://www.google.com/maps/place/?q=place_id:${body.placeId}` : null,
      rating: body.rating ?? null,
      userRatingsTotal: body.userRatingsTotal ?? null,
      hasOpeningHours: body.hasOpeningHours ?? false,
      hasPhoto: body.hasPhoto ?? false,
      needsVerification: (body.userRatingsTotal ?? 0) < 3,
    },
    category: body.category || 'general',
    searchQuery: body.searchQuery || '',
    createdAt: new Date().toISOString(),
    reviews: body.reviews || [],
    rating: body.rating,
    userRatingsTotal: body.userRatingsTotal,
    hasOpeningHours: body.hasOpeningHours,
    hasPhoto: body.hasPhoto,
    instagramUrl: body.instagramUrl || '',
    lineUrl: body.lineUrl || '',
  };
  queue.push(item);
  await store.setQueue(queue);
  res.status(201).json(item);
});

app.post('/api/collect', async (req, res) => {
  try {
    const { query, minReviews = 0, maxResults = 20, hasWebsite = false } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    const places = await collectPlaces(query, { minReviews, maxResults, hasWebsite });

    if (hasWebsite) {
      const refs = await store.getReferenceSites();
      const existingIds = new Set(refs.map((r) => r.placeId));
      const added = [];
      for (const p of places) {
        if (existingIds.has(p.placeId)) continue;
        const item = {
          id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          placeId: p.placeId,
          name: p.name,
          address: p.address || '',
          websiteUrl: p.websiteUrl || '',
          rankIndex: p.rankIndex ?? null,
          category: p.category || 'store',
          title: null,
          metaDescription: null,
          designTraits: null,
          createdAt: new Date().toISOString(),
        };
        refs.push(item);
        existingIds.add(p.placeId);
        added.push(item);
      }
      await store.setReferenceSites(refs);
      return res.json({ added: added.length, items: added });
    }

    const queue = await store.getQueue();
    const existingIds = new Set(queue.map((q) => q.placeId));
    const added = [];
    for (const p of places) {
      if (existingIds.has(p.placeId)) continue;
      const item = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        source: 'google_maps',
        name: p.name,
        address: p.address,
        placeId: p.placeId,
        notes: '',
        signals: {
          placeId: p.placeId,
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.placeId}`,
          rating: p.rating,
          userRatingsTotal: p.userRatingsTotal,
          hasOpeningHours: p.hasOpeningHours,
          hasPhoto: p.hasPhoto,
          needsVerification: (p.userRatingsTotal ?? 0) < 3,
        },
        category: p.category,
        searchQuery: query || '',
        createdAt: new Date().toISOString(),
        reviews: p.reviews || [],
        rating: p.rating,
        userRatingsTotal: p.userRatingsTotal,
        hasOpeningHours: p.hasOpeningHours,
        hasPhoto: p.hasPhoto,
        instagramUrl: '',
        lineUrl: '',
      };
      queue.push(item);
      existingIds.add(p.placeId);
      added.push(item);
    }
    await store.setQueue(queue);
    res.json({ added: added.length, items: added });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'collect failed' });
  }
});

// ---------- 処理（1件ずつ） ----------
app.post('/api/process-next', async (req, res) => {
  try {
    const queue = await store.getQueue();
    if (queue.length === 0) {
      return res.status(404).json({ error: 'Queue is empty' });
    }
    const options = await store.getOptions();
    const item = queue[0];
    const dashboardItem = await processOne(item, options);
    await store.setQueue(queue.slice(1));
    const dashboard = await store.getDashboard();
    dashboard.unshift(dashboardItem);
    await store.setDashboard(dashboard);
    res.status(201).json(dashboardItem);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'process failed' });
  }
});

// ---------- ダッシュボード ----------
app.get('/api/dashboard', async (req, res) => {
  res.json(await store.getDashboard());
});

app.patch('/api/dashboard/:id', async (req, res) => {
  const dashboard = await store.getDashboard();
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  if (req.body.dmBody !== undefined) dashboard[i].dmBody = req.body.dmBody;
  if (req.body.status === 'email_sent') dashboard[i].status = 'email_sent';
  await store.setDashboard(dashboard);
  res.json(dashboard[i]);
});

app.post('/api/dashboard/:id/approve', async (req, res) => {
  const dashboard = await store.getDashboard();
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  dashboard[i].status = 'approved';
  await store.setDashboard(dashboard);
  res.json(dashboard[i]);
});

app.post('/api/dashboard/:id/reject', async (req, res) => {
  const dashboard = await store.getDashboard();
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  dashboard[i].status = 'rejected';
  await store.setDashboard(dashboard);
  res.json(dashboard[i]);
});

// ---------- 参照サイト（ウェブあり・上位表示分析用） ----------
app.get('/api/reference-sites', async (req, res) => {
  res.json(await store.getReferenceSites());
});

app.delete('/api/reference-sites', async (req, res) => {
  await store.setReferenceSites([]);
  res.status(204).send();
});

app.post('/api/reference-sites/fetch-meta', async (req, res) => {
  try {
    const refs = await store.getReferenceSites();
    const withDesign = !!process.env.GEMINI_API_KEY;
    for (let i = 0; i < refs.length; i++) {
      if (refs[i].websiteUrl) {
        const data = await fetchPageMeta(refs[i].websiteUrl, { includeHtmlForDesign: withDesign });
        refs[i].title = data.title;
        refs[i].metaDescription = data.metaDescription;
        if (withDesign && data.htmlSnippet) {
          refs[i].designTraits = await extractDesignFromHtml(data.htmlSnippet);
        }
      }
    }
    await store.setReferenceSites(refs);
    res.json({ updated: refs.length, designIncluded: withDesign });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'fetch-meta failed' });
  }
});

app.post('/api/reference-sites/analyze', async (req, res) => {
  try {
    const refs = await store.getReferenceSites();
    const insights = await analyzeReferenceSites(refs);
    const data = await store.getDesignInsights();
    data.byIndustry = insights.byCategory;
    data.summary = insights.summary;
    data.designSummary = insights.designSummary || '';
    data.byIndustryDesign = insights.byCategoryDesign || {};
    data.updatedAt = new Date().toISOString();
    await store.setDesignInsights(data);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'analyze failed' });
  }
});

app.get('/api/design-insights', async (req, res) => {
  res.json(await store.getDesignInsights());
});

// ---------- 学習ジョブ（業種・件数で開始→自動で収集→メタ・デザイン→分析） ----------
app.get('/api/learning/industries', (req, res) => {
  res.json(INDUSTRIES);
});

app.post('/api/learning/start', async (req, res) => {
  const job = await store.getLearningJob();
  if (job.status === 'running') {
    return res.status(409).json({ error: 'Learning job already running' });
  }
  const { industry, maxResults = 60 } = req.body;
  if (!industry || (industry !== 'all' && !INDUSTRIES.includes(industry))) {
    return res.status(400).json({ error: 'industry required (one of: ' + INDUSTRIES.join(', ') + ', or all)' });
  }
  runLearningJob(industry, Math.min(Number(maxResults) || 60, 100));
  res.status(202).json({ status: 'running', industry, maxResults });
});

app.get('/api/learning/status', async (req, res) => {
  res.json(await store.getLearningJob());
});

// ---------- フルオート（検索→LP→DM を一括・手離れ） ----------
app.post('/api/full-auto/start', async (req, res) => {
  try {
    const out = await startFullAutoRun(req.body || {});
    if (out && out.ok === false) {
      return res.status(400).json({ error: out.error || 'フルオートに失敗しました', ...out });
    }
    return res.json(out);
  } catch (e) {
    console.error('[full-auto/start]', e);
    const msg = e?.message || String(e);
    if (String(msg).includes('すでに')) return res.status(409).json({ error: msg });
    if (String(msg).includes('地域とカテゴリ')) return res.status(400).json({ error: msg });
    return res.status(400).json({ error: msg });
  }
});

app.get('/api/full-auto/status', (req, res) => {
  res.json(getFullAutoStatus());
});

// ---------- キュー自動処理（調べる→作成→メール文まで自動） ----------
app.post('/api/auto-process/start', async (req, res) => {
  await startAutoProcess();
  res.json({ running: true });
});

app.post('/api/auto-process/stop', async (req, res) => {
  await stopAutoProcess();
  res.json({ running: false });
});

app.get('/api/auto-process/status', async (req, res) => {
  if (isSupabaseConfigured()) {
    const enabled = await store.getAutoProcessEnabled();
    res.json({ running: !!enabled });
    return;
  }
  res.json({ running: !!autoProcessTimer });
});

app.get('/api/auto-process/tick', async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(404).send();
  if (process.env.CRON_SECRET && req.headers['x-cron-secret'] !== process.env.CRON_SECRET) return res.status(401).send();
  const enabled = await store.getAutoProcessEnabled();
  if (!enabled) return res.status(204).send();
  const queue = await store.getQueue();
  if (queue.length === 0) {
    await store.setAutoProcessEnabled(false);
    return res.status(204).send();
  }
  try {
    const options = await store.getOptions();
    const item = queue[0];
    const dashboardItem = await processOne(item, options);
    await store.setQueue(queue.slice(1));
    const dashboard = await store.getDashboard();
    dashboard.unshift(dashboardItem);
    await store.setDashboard(dashboard);
  } catch (e) {
    console.error('auto-process tick error', e);
  }
  res.status(204).send();
});

// ---------- 請求設定（プラン・オプション） ----------
app.get('/api/billing', async (req, res) => {
  res.json(await store.getBilling());
});

app.post('/api/billing', async (req, res) => {
  const billing = await store.getBilling();
  await store.setBilling({ ...billing, ...req.body });
  res.json(await store.getBilling());
});

// ---------- 料金計算 ----------
app.post('/api/price', async (req, res) => {
  const billing = await store.getBilling();
  const selection = pricePayload(req.body, billing);
  const result = calculatePrice(selection);
  res.json(result);
});

app.get('/api/price-plans', (req, res) => {
  res.json({
    plans: getPlanOptions(),
    removals: getRemovalOptions(),
    addons: getAddonOptions(),
    other: getOtherServiceOptions(),
  });
});

// ---------- Stripe 決済 ----------
app.get('/api/stripe-configured', (req, res) => {
  res.json({ configured: isStripeConfigured() });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const billing = req.body.billing ?? await store.getBilling();
    const { successUrl, cancelUrl } = req.body;
    const { amountYen, items } = calculatePrice(billing);
    if (amountYen <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    const { url } = await createCheckoutSession(amountYen, items, successUrl, cancelUrl, billing);
    if (!url) return res.status(500).json({ error: 'Failed to create session' });
    res.json({ url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Checkout failed' });
  }
});

// JSON 破損など未処理エラーで 500 になるのを防ぎ、メッセージを返す
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'JSONの形式が不正です。' });
  }
  console.error('[express]', err);
  res.status(500).json({
    error: err?.message || 'サーバー内部エラー',
    hint: 'server/.env に GOOGLE_MAPS_API_KEY と GEMINI_API_KEY があるか、ターミナルでサーバーログを確認してください。',
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
