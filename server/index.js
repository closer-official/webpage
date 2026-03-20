import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createHash, timingSafeEqual } from 'node:crypto';
import { collectPlaces } from './collect.js';
import { processOne } from './process.js';
import { store } from './data/store.js';
import { isSupabaseConfigured } from './data/storeSupabase.js';
import { fetchPageMeta } from './fetchPageMeta.js';
import { analyzeReferenceSites, extractDesignFromHtml } from './gemini.js';
import { runLearningJob } from './learningJob.js';
import { INDUSTRIES } from './learningQueries.js';
import { calculatePrice, getPlanOptions, getRemovalOptions, getAddonOptions, getOtherServiceOptions } from './price.js';
import { isReferralCodeActive } from './referralCodes.js';
import { createCheckoutSession, isStripeConfigured } from './stripeCheckout.js';
import { getFullAutoStatus, startFullAutoRun } from './fullAutoJob.js';
import { buildHtml } from './buildHtml.js';
import { renderLpPaymentForm } from './lpPaymentForm.js';
import { renderCustomerIntakePage } from './customerIntakePage.js';
import { isValidTemplateId, renderTemplatePreview, findTemplateCandidate, getTemplateCandidates, applyTemplateCustomization } from './templatePreview.js';
import { fetchReferenceHtml } from './referenceFetch.js';
import { buildFingerprintFromHtml } from './styleFingerprint.js';
import { buildDesignBlueprintFromHtml } from './designBlueprint.js';
import { enrichReferenceBlueprint } from './referenceDesignGemini.js';
import { renderBlueprintHtml } from './renderBlueprintHtml.js';

/** 参考URL抽出の簡易レート制限（メモリ保持・サーバーレスではインスタンス単位） */
const styleExtractHits = new Map();
function allowStyleExtract(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 12;
  const arr = (styleExtractHits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  styleExtractHits.set(key, arr);
  return true;
}
function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.socket?.remoteAddress || '';
}

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

function parseCookies(req) {
  const raw = req.headers?.cookie || '';
  const out = {};
  raw.split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i <= 0) return;
    const k = pair.slice(0, i).trim();
    const v = decodeURIComponent(pair.slice(i + 1).trim());
    out[k] = v;
  });
  return out;
}

function adminAuthEnabled() {
  return !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

function adminCookieValue() {
  const raw = `${process.env.ADMIN_USERNAME || ''}:${process.env.ADMIN_PASSWORD || ''}`;
  return createHash('sha256').update(raw).digest('hex');
}

function isAdminAuthenticated(req) {
  if (!adminAuthEnabled()) return true;
  const cookies = parseCookies(req);
  const actual = Buffer.from(String(cookies.admin_auth || ''));
  const expected = Buffer.from(adminCookieValue());
  if (actual.length !== expected.length) return false;
  try {
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function requireAdmin(req, res) {
  if (!adminAuthEnabled()) return true;
  if (isAdminAuthenticated(req)) return true;
  res.status(401).json({ error: '管理者ログインが必要です。' });
  return false;
}

function makeDraftToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function splitLines(text, limit = 20) {
  return String(text || '')
    .split(/\r?\n|,|、|，/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function goalLabel(goal) {
  const m = {
    business_card: '名刺代わり',
    sales: '商品の販売',
    inquiry: 'お問い合わせの増加',
    recruit: '採用強化',
    other: 'その他',
  };
  return m[String(goal)] || String(goal || 'Web集客');
}

function intakeToPageDraft(intake) {
  const siteName = intake.storeName || 'サンプル店舗';
  const tastes = Array.isArray(intake.designTastes) ? intake.designTastes.join(' / ') : '';
  const musts = splitLines(intake.mustHaveContent, 8);
  const refs = splitLines(intake.favoriteSiteUrl, 8);
  const current = splitLines(intake.currentActivityUrl, 8);

  const sections = [
    {
      id: 'concept',
      title: 'コンセプト',
      content: `最大の目的: ${goalLabel(intake.websiteGoal)}\n\nメインターゲット: ${intake.targetAudience || '未記入'}\n\n希望テイスト: ${tastes || '未記入'}`,
    },
    {
      id: 'menu',
      title: '掲載したい内容',
      content: musts.length ? musts.map((v, i) => `${i + 1}. ${v}`).join('\n') : '掲載内容はヒアリング内容に合わせて調整します。',
    },
    {
      id: 'gallery',
      title: '参考イメージ',
      content: refs.length ? refs.join('\n') : '参考URLは未記入です。',
    },
    {
      id: 'contact',
      title: 'お問い合わせ',
      content: `ご連絡方法: ${intake.contactMethod || '-'}\n連絡先: ${intake.contactValue || '-'}\n\n現在の活動URL:\n${current.join('\n') || '-'}`,
    },
  ];

  if (String(intake.requestSummary || '').trim()) {
    sections.splice(2, 0, {
      id: 'staff',
      title: 'ご要望メモ',
      content: String(intake.requestSummary).trim(),
    });
  }

  const content = {
    siteName,
    title: siteName,
    headline: `${siteName} 公式サイト案`,
    subheadline: `ヒアリング回答をもとに作成した叩き台です（ベーステンプレ: ${intake.chosenTemplateId}）。`,
    ctaLabel: 'お問い合わせ',
    ctaHref: '#contact',
    sections,
    footerText: `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
  };

  const seo = {
    metaTitle: `${siteName} | サイト叩き台`,
    metaDescription: `${goalLabel(intake.websiteGoal)}を目的とした叩き台です。`,
    keywords: tastes || '',
    ogImageUrl: '',
    canonicalUrl: '',
  };

  return { content, seo, templateId: intake.chosenTemplateId };
}

function normalizeCustomizationInput(body = {}) {
  return {
    headline: String(body.headline || '').trim().slice(0, 200),
    subheadline: String(body.subheadline || '').trim().slice(0, 400),
    navLabels: String(body.navLabels || '').trim().slice(0, 600),
    theme: {
      bg: String(body.theme?.bg || '').trim().slice(0, 30),
      text: String(body.theme?.text || '').trim().slice(0, 30),
      accent: String(body.theme?.accent || '').trim().slice(0, 30),
    },
  };
}

function sanitizeFingerprint(fp) {
  if (!fp || typeof fp !== 'object') return undefined;
  const topColors = Array.isArray(fp.topColors)
    ? fp.topColors.map((c) => String(c).trim().slice(0, 20)).filter(Boolean).slice(0, 24)
    : undefined;
  const sampleFonts = Array.isArray(fp.sampleFonts)
    ? fp.sampleFonts.map((s) => String(s).trim().slice(0, 80)).filter(Boolean).slice(0, 10)
    : undefined;
  const out = {
    ...(topColors?.length ? { topColors } : {}),
    ...(sampleFonts?.length ? { sampleFonts } : {}),
    ...(fp.extractedAt ? { extractedAt: String(fp.extractedAt).slice(0, 40) } : {}),
    ...(fp.sourceUrl ? { sourceUrl: String(fp.sourceUrl).trim().slice(0, 2000) } : {}),
  };
  return Object.keys(out).length ? out : undefined;
}

/** 参考設計ブループリント（JSONサイズ上限あり） */
function sanitizeBlueprint(bp) {
  if (!bp || typeof bp !== 'object' || bp.version !== 1) return null;
  try {
    const s = JSON.stringify(bp);
    if (s.length > 120000) return null;
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// ---------- 管理ページログイン ----------
app.get('/api/admin-auth/status', (req, res) => {
  const enabled = adminAuthEnabled();
  const authenticated = enabled ? isAdminAuthenticated(req) : true;
  res.json({ enabled, authenticated });
});

app.post('/api/admin-auth/login', (req, res) => {
  const enabled = adminAuthEnabled();
  if (!enabled) return res.json({ ok: true, enabled: false });
  const username = String(req.body?.username || '');
  const password = String(req.body?.password || '');
  const ok = username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
  if (!ok) return res.status(401).json({ error: 'ユーザー名またはパスワードが違います。' });
  const secure = !!(req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https');
  res.setHeader(
    'Set-Cookie',
    `admin_auth=${encodeURIComponent(adminCookieValue())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure ? '; Secure' : ''}`
  );
  res.json({ ok: true, enabled: true });
});

app.post('/api/admin-auth/logout', (req, res) => {
  const secure = !!(req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https');
  res.setHeader(
    'Set-Cookie',
    `admin_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
  );
  res.json({ ok: true });
});

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

// ---------- 顧客ヒアリング ----------
app.get(['/customer-intake', '/api/customer-intake'], async (req, res) => {
  const customs = await store.getTemplateCustomizations();
  const candidates = getTemplateCandidates(customs, { forPublicSelection: true });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderCustomerIntakePage(candidates));
});

app.get('/api/template-preview/:templateId', (req, res) => {
  const templateId = String(req.params.templateId || '');
  Promise.resolve(store.getTemplateCustomizations()).then((customs) => {
    const candidate = findTemplateCandidate(templateId, customs);
    if (!candidate) {
      return res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Template not found');
    }
    const baseId = candidate.baseTemplateId || candidate.id;
    const html = renderTemplatePreview(baseId, candidate.customization || null);
    if (!html) return res.status(500).json({ error: 'failed to render preview' });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.send(html);
  }).catch((e) => {
    console.error('[template-preview]', e);
    res.status(500).json({ error: 'template preview failed' });
  });
});

app.get('/api/template-candidates', async (req, res) => {
  const customs = await store.getTemplateCustomizations();
  const includeDrafts = adminAuthEnabled() ? isAdminAuthenticated(req) : true;
  res.json(getTemplateCandidates(customs, { forPublicSelection: !includeDrafts }));
});

/** 参考URLからスタイル指紋を取得（レート制限あり）。管理者画面・ヒアリング送信前のプレビュー用 */
app.post('/api/style-reference/extract', async (req, res) => {
  const ip = clientIp(req);
  if (!allowStyleExtract(ip)) {
    return res.status(429).json({ error: 'しばらく時間をおいて再度お試しください。' });
  }
  const rawUrl = String(req.body?.url || '').trim();
  if (!rawUrl) return res.status(400).json({ error: 'url is required' });
  try {
    const { url, html } = await fetchReferenceHtml(rawUrl);
    const { fingerprint, suggestedOverride } = buildFingerprintFromHtml(html, url.toString());
    let blueprint = buildDesignBlueprintFromHtml(html, url.toString());
    blueprint = await enrichReferenceBlueprint(html, blueprint);
    res.json({ ok: true, blueprint, fingerprint, suggestedOverride });
  } catch (e) {
    console.error('[style-reference/extract]', e?.message || e);
    res.status(400).json({ error: e?.message || '抽出に失敗しました' });
  }
});

app.get('/api/template-customizations', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(await store.getTemplateCustomizations());
});

app.post('/api/template-customizations/save', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  const mode = body.mode === 'update' ? 'update' : 'create';
  const customizations = await store.getTemplateCustomizations();
  const now = new Date().toISOString();

  if (mode === 'update') {
    const id = String(body.id || '');
    const i = customizations.findIndex((v) => v.id === id);
    if (i === -1) return res.status(404).json({ error: 'Customization not found' });
    const nextStatus =
      body.status === 'draft' || body.status === 'published'
        ? body.status
        : customizations[i].status || 'published';
    const nextBp = body.blueprint != null ? sanitizeBlueprint(body.blueprint) : null;
    customizations[i] = {
      ...customizations[i],
      name: String(body.name || customizations[i].name || '').trim().slice(0, 80),
      override: normalizeCustomizationInput(body.override || {}),
      status: nextStatus,
      ...(body.sourceUrl != null
        ? { sourceUrl: String(body.sourceUrl || '').trim().slice(0, 5000) }
        : {}),
      ...(body.fingerprint != null ? { fingerprint: sanitizeFingerprint(body.fingerprint) } : {}),
      ...(nextBp ? { blueprint: nextBp } : {}),
      updatedAt: now,
    };
    await store.setTemplateCustomizations(customizations);
    return res.json({ ok: true, item: customizations[i] });
  }

  const baseTemplateId = String(body.baseTemplateId || '');
  const blueprint = sanitizeBlueprint(body.blueprint);
  if (baseTemplateId === 'blueprint') {
    if (!blueprint) return res.status(400).json({ error: '参考設計テンプレには blueprint が必要です' });
  } else if (!isValidTemplateId(baseTemplateId, customizations)) {
    return res.status(400).json({ error: 'baseTemplateId is invalid' });
  }
  const id = `custom-${Date.now().toString(36)}`;
  const status = body.status === 'draft' ? 'draft' : 'published';
  const item = {
    id,
    name: String(body.name || `カスタムテンプレ ${customizations.length + 1}`).trim().slice(0, 80),
    baseTemplateId,
    override: normalizeCustomizationInput(body.override || {}),
    status,
    sourceUrl: String(body.sourceUrl || '').trim().slice(0, 5000) || undefined,
    fingerprint: sanitizeFingerprint(body.fingerprint),
    sourceIntakeId: String(body.sourceIntakeId || '').trim().slice(0, 80) || undefined,
    ...(blueprint && baseTemplateId === 'blueprint' ? { blueprint } : {}),
    createdAt: now,
    updatedAt: now,
  };
  customizations.unshift(item);
  await store.setTemplateCustomizations(customizations);
  res.json({ ok: true, item });
});

/** 下書きテンプレを公開（候補一覧・ヒアリングに表示） */
app.post('/api/template-customizations/publish', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = String(req.body?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'id is required' });
  const customizations = await store.getTemplateCustomizations();
  const i = customizations.findIndex((v) => v.id === id);
  if (i === -1) return res.status(404).json({ error: 'Customization not found' });
  const now = new Date().toISOString();
  customizations[i] = { ...customizations[i], status: 'published', updatedAt: now };
  await store.setTemplateCustomizations(customizations);
  res.json({ ok: true, item: customizations[i] });
});

/** カスタムテンプレ（下書き・公開）の削除 */
app.post('/api/template-customizations/delete', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = String(req.body?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'id is required' });
  const customizations = await store.getTemplateCustomizations();
  const next = customizations.filter((v) => v.id !== id);
  if (next.length === customizations.length) return res.status(404).json({ error: 'Customization not found' });
  await store.setTemplateCustomizations(next);
  res.json({ ok: true });
});

/** 参考設計ブループリントのHTMLプレビュー（管理者のみ・保存不要） */
app.post('/api/design-blueprint/preview', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const bp = sanitizeBlueprint(req.body?.blueprint);
  if (!bp) return res.status(400).json({ error: 'invalid blueprint' });
  try {
    const html = renderBlueprintHtml(bp, {
      override: normalizeCustomizationInput(req.body?.override || {}),
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=0');
    res.send(html);
  } catch (e) {
    console.error('[design-blueprint/preview]', e);
    res.status(500).json({ error: 'render failed' });
  }
});

app.get('/api/customer-intake-list', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const list = await store.getCustomerIntake();
  const out = (Array.isArray(list) ? list : []).map((row) => ({
    ...row,
    previewUrl: `/api/customer-intake/${encodeURIComponent(row.id)}/preview`,
  }));
  res.json(out);
});

app.get('/api/customer-intake-draft/:id', async (req, res) => {
  const list = await store.getCustomerIntake();
  const row = (list || []).find((v) => v.id === req.params.id);
  if (!row) return res.status(404).json({ error: 'Draft not found' });
  if (row.status !== 'draft') return res.status(400).json({ error: 'Not a draft' });
  const token = String(req.query.token || '');
  if (!token || token !== String(row.draftToken || '')) {
    return res.status(401).json({ error: '再開リンクが無効です。' });
  }
  res.json({
    id: row.id,
    storeName: row.storeName || '',
    contactName: row.contactName || '',
    contactMethod: row.contactMethod || '',
    contactValue: row.contactValue || '',
    plan: row.plan || 'normal',
    referralCode: row.referralCode || '',
    websiteGoal: row.websiteGoal || '',
    targetAudience: row.targetAudience || '',
    designTastes: row.designTastes || [],
    mainColor: row.mainColor || '',
    chosenTemplateId: row.chosenTemplateId || '',
    styleDetail: row.styleDetail || '',
    favoriteSiteUrl: row.favoriteSiteUrl || '',
    mustHaveContent: row.mustHaveContent || '',
    currentActivityUrl: row.currentActivityUrl || '',
    requestSummary: row.requestSummary || '',
    extractStyleToDraft: !!row.extractStyleToDraft,
  });
});

app.post('/api/customer-intake-draft', async (req, res) => {
  const body = req.body || {};

  const list = await store.getCustomerIntake();
  const now = new Date().toISOString();
  const targetId = String(body.id || '').trim();
  const targetToken = String(body.draftToken || '').trim();
  const base = {
    storeName: String(body.storeName || '').trim().slice(0, 120),
    contactName: String(body.contactName || '').trim().slice(0, 80),
    contactMethod: String(body.contactMethod || '').trim(),
    contactValue: String(body.contactValue || '').trim().slice(0, 160),
    plan: String(body.plan || '').trim(),
    referralCode: String(body.referralCode || '').trim().slice(0, 200),
    websiteGoal: String(body.websiteGoal || '').trim().slice(0, 120),
    targetAudience: String(body.targetAudience || '').trim().slice(0, 3000),
    designTastes: Array.isArray(body.designTastes) ? body.designTastes.map((v) => String(v).trim()).filter(Boolean).slice(0, 20) : [],
    mainColor: String(body.mainColor || '').trim().slice(0, 120),
    chosenTemplateId: String(body.chosenTemplateId || '').trim().slice(0, 120),
    styleDetail: String(body.styleDetail || '').trim().slice(0, 3000),
    favoriteSiteUrl: String(body.favoriteSiteUrl || '').trim().slice(0, 5000),
    mustHaveContent: String(body.mustHaveContent || '').trim().slice(0, 5000),
    currentActivityUrl: String(body.currentActivityUrl || '').trim().slice(0, 5000),
    requestSummary: String(body.requestSummary || '').trim().slice(0, 5000),
    pageUrl: String(body.pageUrl || '').trim().slice(0, 500),
    extractStyleToDraft: Boolean(body.extractStyleToDraft),
    status: 'draft',
    updatedAt: now,
  };

  let rowId = targetId;
  if (rowId) {
    const i = list.findIndex((v) => v.id === rowId);
    if (i >= 0) {
      if (!targetToken || String(list[i].draftToken || '') !== targetToken) {
        return res.status(401).json({ error: '途中保存の更新権限がありません。' });
      }
      list[i] = { ...list[i], ...base, status: 'draft' };
      await store.setCustomerIntake(list);
      return res.json({
        ok: true,
        id: rowId,
        draftToken: targetToken,
        resumeUrl: `/api/customer-intake?draft=${encodeURIComponent(rowId)}&token=${encodeURIComponent(targetToken)}`,
      });
    }
  }
  rowId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const draftToken = makeDraftToken();
  list.unshift({ id: rowId, draftToken, ...base, createdAt: now });
  await store.setCustomerIntake(list);
  res.json({
    ok: true,
    id: rowId,
    draftToken,
    resumeUrl: `/api/customer-intake?draft=${encodeURIComponent(rowId)}&token=${encodeURIComponent(draftToken)}`,
  });
});

app.post('/api/customer-intake', async (req, res) => {
  const body = req.body || {};
  const required = [
    'storeName',
    'contactName',
    'contactMethod',
    'contactValue',
    'plan',
    'websiteGoal',
    'targetAudience',
    'mainColor',
    'chosenTemplateId',
    'favoriteSiteUrl',
    'mustHaveContent',
    'currentActivityUrl',
  ];
  for (const k of required) {
    if (!String(body[k] || '').trim()) return res.status(400).json({ error: `${k} is required` });
  }
  if (!['normal', 'student'].includes(String(body.plan))) {
    return res.status(400).json({ error: 'plan must be normal or student' });
  }
  if (!['email', 'line', 'phone'].includes(String(body.contactMethod))) {
    return res.status(400).json({ error: 'contactMethod must be email/line/phone' });
  }
  const designTastes = Array.isArray(body.designTastes) ? body.designTastes.map((v) => String(v).trim()).filter(Boolean) : [];
  if (designTastes.length === 0) {
    return res.status(400).json({ error: 'designTastes is required' });
  }
  const templateCustoms = await store.getTemplateCustomizations();
  const publicCandidates = getTemplateCandidates(templateCustoms, { forPublicSelection: true });
  const allowedTemplateIds = new Set(publicCandidates.map((c) => c.id));
  if (!allowedTemplateIds.has(String(body.chosenTemplateId || '').trim())) {
    return res.status(400).json({ error: 'chosenTemplateId is invalid' });
  }

  const list = await store.getCustomerIntake();
  const now = new Date().toISOString();
  const draftId = String(body.draftId || '').trim();
  const draftToken = String(body.draftToken || '').trim();
  const existingDraft = draftId ? list.find((v) => v.id === draftId) : null;
  const rowId = draftId || `intake-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const extractStyleToDraft =
    body.extractStyleToDraft === true ||
    body.extractStyleToDraft === 'true' ||
    body.extractStyleToDraft === 'on';

  const row = {
    id: rowId,
    storeName: String(body.storeName || '').trim().slice(0, 120),
    contactName: String(body.contactName || '').trim().slice(0, 80),
    contactMethod: String(body.contactMethod || '').trim(),
    contactValue: String(body.contactValue || '').trim().slice(0, 160),
    plan: String(body.plan || '').trim(),
    referralCode: String(body.referralCode || '').trim().slice(0, 200),
    websiteGoal: String(body.websiteGoal || '').trim().slice(0, 120),
    targetAudience: String(body.targetAudience || '').trim().slice(0, 3000),
    designTastes: designTastes.slice(0, 20),
    mainColor: String(body.mainColor || '').trim().slice(0, 120),
    chosenTemplateId: String(body.chosenTemplateId || '').trim().slice(0, 120),
    styleDetail: String(body.styleDetail || '').trim().slice(0, 3000),
    favoriteSiteUrl: String(body.favoriteSiteUrl || '').trim().slice(0, 5000),
    mustHaveContent: String(body.mustHaveContent || '').trim().slice(0, 5000),
    currentActivityUrl: String(body.currentActivityUrl || '').trim().slice(0, 5000),
    requestSummary: String(body.requestSummary || '').trim().slice(0, 5000),
    pageUrl: String(body.pageUrl || '').trim().slice(0, 500),
    status: 'submitted',
    updatedAt: now,
    createdAt: existingDraft?.createdAt || now,
  };

  let styleDraftTemplateId = null;
  if (extractStyleToDraft) {
    const firstUrl = String(row.favoriteSiteUrl || '')
      .split(/[\n\r]+/)
      .map((s) => s.trim())
      .find(Boolean);
    if (firstUrl) {
      try {
        const freshCustoms = await store.getTemplateCustomizations();
        const { url, html } = await fetchReferenceHtml(firstUrl);
        let blueprint = buildDesignBlueprintFromHtml(html, url.toString());
        blueprint = await enrichReferenceBlueprint(html, blueprint);
        const { fingerprint } = buildFingerprintFromHtml(html, url.toString());
        const tid = `custom-${Date.now().toString(36)}`;
        const draftItem = {
          id: tid,
          name: `参考設計:${row.storeName}`.slice(0, 80),
          baseTemplateId: 'blueprint',
          blueprint,
          override: normalizeCustomizationInput({
            theme: {
              bg: blueprint.tokens.colors.bg,
              text: blueprint.tokens.colors.text,
              accent: blueprint.tokens.colors.accent,
            },
          }),
          status: 'draft',
          sourceUrl: firstUrl,
          fingerprint,
          sourceIntakeId: row.id,
          createdAt: now,
          updatedAt: now,
        };
        freshCustoms.unshift(draftItem);
        await store.setTemplateCustomizations(freshCustoms);
        styleDraftTemplateId = tid;
      } catch (e) {
        console.error('[intake style draft]', e);
      }
    }
  }
  if (styleDraftTemplateId) row.styleDraftTemplateId = styleDraftTemplateId;

  if (draftId) {
    const i = list.findIndex((v) => v.id === draftId);
    if (i >= 0) {
      if (!draftToken || String(list[i].draftToken || '') !== draftToken) {
        return res.status(401).json({ error: '下書き送信の権限がありません。' });
      }
      list[i] = { ...list[i], ...row, id: draftId, status: 'submitted', updatedAt: now };
    } else {
      list.unshift(row);
    }
  } else {
    list.unshift(row);
  }
  await store.setCustomerIntake(list);
  const previewUrl = `/api/customer-intake/${encodeURIComponent(row.id)}/preview`;
  res.status(201).json({
    ok: true,
    id: row.id,
    previewUrl,
    styleDraftTemplateId: row.styleDraftTemplateId || null,
  });
});

app.get('/api/customer-intake/:id/preview', async (req, res) => {
  const list = await store.getCustomerIntake();
  const row = (list || []).find((v) => v.id === req.params.id);
  if (!row) return res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Intake not found');
  const templateCustoms = await store.getTemplateCustomizations();
  if (!isValidTemplateId(row.chosenTemplateId, templateCustoms)) {
    return res.status(400).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Invalid template');
  }
  const candidate = findTemplateCandidate(row.chosenTemplateId, templateCustoms);
  const { content, seo } = intakeToPageDraft(row);
  const baseTemplateId = candidate?.baseTemplateId || row.chosenTemplateId;
  const mergedContent = applyTemplateCustomization(content, candidate?.customization?.override || null);
  const html = buildHtml(mergedContent, seo, baseTemplateId, {
    contactForm: false,
    instagramLine: false,
    presentedBy: true,
    qrCode: false,
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=0');
  res.send(html);
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
  if (req.body.content !== undefined) dashboard[i].content = req.body.content;
  if (req.body.seo !== undefined) dashboard[i].seo = req.body.seo;
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

/** 共有用プレビュー: 案件IDでHTMLを返す。スマホ等別端末で同じURLを開ける。Stripe 有効時はメニューに「購入」を追加。閲覧時に viewCount を加算。 */
app.get('/api/preview/:id', async (req, res) => {
  try {
    const dashboard = await store.getDashboard();
    const idx = dashboard.findIndex((d) => d.id === req.params.id);
    if (idx === -1) return res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Not found');
    const item = dashboard[idx];
    item.viewCount = (item.viewCount || 0) + 1;
    await store.setDashboard(dashboard);
    const options = await store.getOptions();
    const origin = (req.headers.origin || (req.protocol + '://' + req.get('host')) || '').replace(/\/$/, '');
    const previewUrl = origin ? `${origin}/api/preview/${encodeURIComponent(item.id)}` : '';
    const genOptions = {
      contactForm: options.contactForm ?? false,
      formActionUrl: options.formActionUrl || '',
      instagramLine: options.instagramLine ?? true,
      presentedBy: options.presentedBy ?? true,
      qrCode: false,
      instagramUrl: '',
      lineUrl: '',
      qrCodeDataUrl: '',
    };
    if (isStripeConfigured() && origin) {
      genOptions.purchaseUrl = `${origin}/api/checkout-redirect?returnUrl=${encodeURIComponent(previewUrl)}`;
    }
    const html = buildHtml(item.content, item.seo, item.templateId, genOptions);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=0');
    res.send(html);
  } catch (e) {
    console.error('[preview]', e);
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Error');
  }
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
  const referralValid = await isReferralCodeActive(selection.referralCode);
  const result = calculatePrice(selection, { referralWaivesBasePlan: referralValid });
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
    const referralValid = await isReferralCodeActive(billing.referralCode);
    const { amountYen, items } = calculatePrice(billing, { referralWaivesBasePlan: referralValid });
    if (amountYen <= 0) {
      return res.json({
        free: true,
        amountYen: 0,
        url: null,
        message:
          'この内容ではオンライン決済は不要です。お手続きは運営よりメールまたはLINEでご案内します。',
      });
    }
    const { url } = await createCheckoutSession(amountYen, items, successUrl, cancelUrl, billing);
    if (!url) return res.status(500).json({ error: 'Failed to create session' });
    res.json({ url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Checkout failed' });
  }
});

/** LP埋め込み用: 料金・お支払いフォーム（オプションON/OFF・金額算出・支払い確定でStripeへ）。iframe で読み込む。 */
app.get('/api/lp-payment-form', (req, res) => {
  const returnUrl = (req.query.returnUrl && String(req.query.returnUrl)) || '';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderLpPaymentForm(returnUrl));
});

/** LPの「購入」ボタン用: itemId と returnUrl で Checkout を作成し Stripe へリダイレクト。決済後は returnUrl?payment=success に戻る */
app.get('/api/checkout-redirect', async (req, res) => {
  if (!isStripeConfigured()) {
    return res.status(503).setHeader('Content-Type', 'text/html; charset=utf-8')
      .send('<p>Stripe が未設定です。</p>');
  }
  const returnUrl = (req.query.returnUrl && String(req.query.returnUrl)) || '';
  if (!returnUrl.startsWith('http')) {
    return res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8')
      .send('<p>returnUrl が不正です。</p>');
  }
  try {
    const billing = await store.getBilling();
    const referralValid = await isReferralCodeActive(billing.referralCode);
    const { amountYen, items } = calculatePrice(billing, { referralWaivesBasePlan: referralValid });
    if (amountYen <= 0) {
      const sep = returnUrl.includes('?') ? '&' : '?';
      return res.redirect(302, `${returnUrl}${sep}payment=not_required`);
    }
    const successUrl = returnUrl + (returnUrl.includes('?') ? '&' : '?') + 'payment=success';
    const { url } = await createCheckoutSession(amountYen, items, successUrl, returnUrl, billing);
    if (url) return res.redirect(302, url);
  } catch (e) {
    console.error('[checkout-redirect]', e);
  }
  res.redirect(returnUrl);
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
