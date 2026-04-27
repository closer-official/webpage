import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { createHash, timingSafeEqual, randomBytes } from 'node:crypto';
import {
  isValidLpSiteKeyFormat,
  verifyPasswordScrypt,
  lpCmsSessionCookieValue,
  verifyLpCmsSessionCookie,
} from './lpCmsCrypto.js';
import { collectPlaces } from './collect.js';
import { processOne } from './process.js';
import { store } from './data/store.js';
import { isSupabaseConfigured } from './data/storeSupabase.js';
import { fetchPageMeta } from './fetchPageMeta.js';
import {
  analyzeReferenceSites,
  extractCafe1BasicFromFreeText,
  extractDesignFromHtml,
  extractTemplateOverrideFromDocuments,
  extractTemplateOverrideFromFreeText,
} from './gemini.js';
import { runLearningJob } from './learningJob.js';
import { INDUSTRIES } from './learningQueries.js';
import { calculatePrice, getPlanOptions, getRemovalOptions, getAddonOptions, getOtherServiceOptions } from './price.js';
import { isReferralCodeActive } from './referralCodes.js';
import QRCode from 'qrcode';
import { createCheckoutSession, isStripeConfigured } from './stripeCheckout.js';
import {
  adminSeedSalesRep,
  salesLogin,
  salesRepCookieValue,
  verifyRepSessionToken,
  parseMapsUrlForSales,
  salesPlacesAutocomplete,
  salesPlacesDetails,
  createSalesPreviewSession,
  getSalesPreviewSnapshot,
  getSalesPreviewSession,
  listSalesPreviewSessionsForRep,
  recordSalesPreviewView,
  markSalesPreviewPaid,
  publishSalesPreviewToProduction,
  getSalesApiUsageSummary,
  getRepProfile,
  isValidSalesPreviewPublicId,
} from './salesAgencyCore.js';
import { runLpCmsProvision } from './lpCmsProvisionCore.js';
import { getProductLpTemplatesList, getProductLpTemplateSlugSet } from './productLpTemplates.js';
import { getFullAutoStatus, startFullAutoRun } from './fullAutoJob.js';
import { buildHtml } from './buildHtml.js';
import { renderLpPaymentForm } from './lpPaymentForm.js';
import { renderCustomerIntakePage } from './customerIntakePage.js';
import { renderTemplateGalleryPage } from './templateGalleryPage.js';
import { buildPublicTemplateCatalog, buildAdminTemplateCatalog } from './publicTemplateCatalog.js';
import { BUILTIN_BUILD_HTML_TEMPLATE_IDS } from './templateRegistry.js';
import { translatePublicUiEntries } from './publicUiTranslate.js';
import { CAFE_1_RAMEN_HERO_SLIDES, normalizeCafeVisualGenreId } from './cafe1GenrePresets.js';
import {
  getCafe1BasicLockedOverride,
  mergeCafe1BasicEditable,
  mapGenreToBasicPresetKind,
} from './cafe1BasicLockedPresets.js';
import { isValidTemplateId, renderTemplatePreview, findTemplateCandidate, getTemplateCandidates, applyTemplateCustomization } from './templatePreview.js';
import { ensureDashboardForWorkerDraft } from './dashboardFromWorkerDraft.js';
import { customizationBaseIsBeauty, dashboardItemIsBeauty } from './outreachSegment.js';
import {
  patchOutreachDashboardRowFields,
  buildBeautyOutreachDashboardMerged,
  resolveBeautyOutreachDashboardPatchTarget,
} from './outreachDashboardMutate.js';
import { buildOutreachAnalyticsEventsFromPatch } from './outreachAnalyticsLog.js';
import { computeOutreachAnalyticsAggregates } from './outreachAnalyticsAggregate.js';
import {
  computeOutreachFunnelAndDrilldown,
  computeSnapshotPhaseCounts,
  loadOutreachDashboardRowsForAnalytics,
} from './outreachAnalyticsFunnel.js';
import { buildStrongWebSalonDashboardRow, buildBeautyMemoPromotedDashboardRow } from './memoHpbIntake.js';
import { findDuplicateDraftHints } from './duplicateDraftHint.js';
import { extractJapanesePrefecture } from './japanesePrefectureFromAddress.js';
import { fetchReferenceHtml } from './referenceFetch.js';
import { buildFingerprintFromHtml } from './styleFingerprint.js';
import { buildDesignBlueprintFromHtml } from './designBlueprint.js';
import { enrichReferenceBlueprint } from './referenceDesignGemini.js';
import { renderBlueprintHtml } from './renderBlueprintHtml.js';
import {
  upcomingDateKeys,
  getBookingTimeLabels,
  slotKey,
  isSlotPastJst,
  googleCalendarTemplateUrl,
  BOOKING_SLOT_DURATION_MIN,
} from './bookingUtil.js';
import { sendBookingNotification } from './bookingEmail.js';
import { resolveMapEmbedFromRaw } from './mapEmbedResolve.js';

/** 公開ページ UI 翻訳（Gemini） */
const publicTranslateHits = new Map();
function allowPublicTranslate(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 32;
  const arr = (publicTranslateHits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  publicTranslateHits.set(key, arr);
  return true;
}

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

const bookingPostHits = new Map();
function allowBookingPost(ip) {
  const now = Date.now();
  const key = ip || 'unknown';
  const arr = (bookingPostHits.get(key) || []).filter((t) => now - t < 3600000);
  if (arr.length >= 15) return false;
  arr.push(now);
  bookingPostHits.set(key, arr);
  return true;
}

function bookingBillingEnabled(billing) {
  return !!(billing && billing.bookingSystem);
}

function getBookingAdminEmail(item) {
  const direct = String(item.bookingNotifyEmail || '').trim();
  if (direct) return direct;
  const foot = String(item.content?.footerEmail || '').trim();
  if (foot) return foot;
  return String(process.env.BOOKING_NOTIFY_EMAIL || '').trim();
}

function escHtmlBooking(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
app.use(express.json({ limit: '20mb' }));

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

/** 店舗セットアップ: 管理者Cookie または STORE_SETUP_PROVISION_TOKEN（Bearer） */
function authorizeAdminOrProvisionToken(req) {
  if (adminAuthEnabled() && isAdminAuthenticated(req)) return true;
  const expected = String(process.env.STORE_SETUP_PROVISION_TOKEN || '').trim();
  if (!expected) return false;
  const hdr = String(req.headers.authorization || '');
  const m = hdr.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const got = String(m[1] || '').trim();
  try {
    const a = Buffer.from(got, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const SALES_REP_COOKIE = 'sales_rep_session';

function getSalesRepIdFromRequest(req) {
  const cookies = parseCookies(req);
  let raw = String(cookies[SALES_REP_COOKIE] || '');
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /*  */
  }
  return verifyRepSessionToken(raw);
}

async function requireSalesRep(req, res) {
  const id = getSalesRepIdFromRequest(req);
  if (!id) {
    res.status(401).json({ error: '営業ログインが必要です。' });
    return null;
  }
  const rep = await getRepProfile(id);
  if (!rep) {
    res.status(401).json({ error: 'セッションが無効です。再ログインしてください。' });
    return null;
  }
  return rep;
}

/** 顧客が開くプレビューページの絶対URL（QR・Stripe return 用） */
function resolveSalesPreviewPageUrl(req, publicId) {
  const envBase = String(process.env.SALES_PREVIEW_PUBLIC_BASE || '').replace(/\/$/, '');
  if (envBase.startsWith('http')) {
    return `${envBase}/${publicId}`;
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host') || 'localhost';
  return `${proto}://${host}/deliverables/gym-valx-intro/index.html?salesPreview=${encodeURIComponent(publicId)}`;
}

/** Checkout API のオリジン（Stripe の cancel/success がこのホストに戻る） */
function resolveSalesCheckoutApiOrigin(req) {
  const env = String(process.env.SALES_CHECKOUT_API_ORIGIN || '').replace(/\/$/, '');
  if (env.startsWith('http')) return env;
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host') || 'localhost';
  return `${proto}://${host}`;
}

/** 同梱テンプレのスラッグ（デフォルトJSON・旧来の共通 env 認証対象） */
const LP_CMS_TEMPLATE_SLUGS = new Set(['japanese-history-higashi', 'web-closer-intro', 'gym-valx-intro']);

function lpCmsCookieName(siteKey) {
  return `lp_cms_${String(siteKey).replace(/[^a-zA-Z0-9_]/g, '_')}`;
}

function lpCmsLegacyEnvAuthEnabledForSlug(siteKey) {
  return (
    LP_CMS_TEMPLATE_SLUGS.has(siteKey) &&
    !!(process.env.JP_HISTORY_LP_CMS_USER && process.env.JP_HISTORY_LP_CMS_PASSWORD)
  );
}

function lpCmsCookieValueLegacy(siteKey) {
  const u = process.env.JP_HISTORY_LP_CMS_USER || '';
  const p = process.env.JP_HISTORY_LP_CMS_PASSWORD || '';
  return createHash('sha256').update(`lp-cms|${siteKey}|${u}|${p}`).digest('hex');
}

function getLpContentDefault(slug) {
  try {
    const p = path.join(__dirname, 'data', 'json', 'lpContent.json');
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
      return raw[slug] ?? null;
    }
  } catch (e) {
    console.error('[lpContent default]', e);
  }
  return null;
}

async function isLpSiteKeyRegistered(siteKey) {
  if (!isValidLpSiteKeyFormat(siteKey)) return false;
  if (LP_CMS_TEMPLATE_SLUGS.has(siteKey)) return true;
  const acc = await store.getLpCmsAccount(siteKey);
  if (acc) return true;
  const c = await store.getLpContent(siteKey);
  if (c && typeof c === 'object' && Object.keys(c).length > 0) return true;
  return false;
}

async function isLpCmsAuthenticatedReq(req, siteKey) {
  const cookies = parseCookies(req);
  let raw = String(cookies[lpCmsCookieName(siteKey)] || '');
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* そのまま */
  }
  const acc = await store.getLpCmsAccount(siteKey);
  if (acc) {
    return verifyLpCmsSessionCookie(siteKey, raw, acc);
  }
  if (lpCmsLegacyEnvAuthEnabledForSlug(siteKey)) {
    const expected = lpCmsCookieValueLegacy(siteKey);
    const a = Buffer.from(raw, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    try {
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  return false;
}

async function requireLpContentWriteAsync(req, res, siteKey) {
  if (!isValidLpSiteKeyFormat(siteKey)) {
    res.status(400).json({ error: 'サイトキーが不正です。' });
    return false;
  }
  if (!(await isLpSiteKeyRegistered(siteKey))) {
    res.status(404).json({ error: 'Not found' });
    return false;
  }
  const acc = await store.getLpCmsAccount(siteKey);
  if (acc) {
    if (await isLpCmsAuthenticatedReq(req, siteKey)) return true;
    res.status(401).json({ error: '店舗LPのログインが必要です。' });
    return false;
  }
  if (lpCmsLegacyEnvAuthEnabledForSlug(siteKey)) {
    if (await isLpCmsAuthenticatedReq(req, siteKey)) return true;
    res.status(401).json({ error: 'LP管理者のログインが必要です。' });
    return false;
  }
  if (adminAuthEnabled()) return requireAdmin(req, res);
  res.status(503).json({
    error:
      '保存できません。運営が POST /api/admin/lp-cms-provision で店舗アカウントを作成するか、ADMIN_USERNAME / ADMIN_PASSWORD を設定してください。',
  });
  return false;
}

async function requireLpStatsReadAsync(req, res, siteKey) {
  if (!isValidLpSiteKeyFormat(siteKey)) {
    res.status(404).json({ error: 'Not found' });
    return false;
  }
  if (!(await isLpSiteKeyRegistered(siteKey))) {
    res.status(404).json({ error: 'Not found' });
    return false;
  }
  if (await store.getLpCmsAccount(siteKey)) {
    if (await isLpCmsAuthenticatedReq(req, siteKey)) return true;
    res.status(401).json({ error: '店舗LPのログインが必要です。' });
    return false;
  }
  if (lpCmsLegacyEnvAuthEnabledForSlug(siteKey)) {
    if (await isLpCmsAuthenticatedReq(req, siteKey)) return true;
    res.status(401).json({ error: 'LP管理者のログインが必要です。' });
    return false;
  }
  if (adminAuthEnabled()) {
    if (isAdminAuthenticated(req)) return true;
    res.status(401).json({ error: '管理者ログインが必要です。' });
    return false;
  }
  return true;
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
    subheadline: `ヒアリング回答をもとに作成した叩き台です（ベース: ${
      intake.chosenTemplateId === 'intake_bespoke' ? 'オーダーメイド（テンプレなし）' : intake.chosenTemplateId
    }）。`,
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

function sanitizeOverrideHeroSlides(raw) {
  if (raw === undefined || raw === null) return undefined;
  let list = [];
  if (Array.isArray(raw)) list = raw.map((s) => String(s).trim()).filter(Boolean);
  else if (typeof raw === 'string') {
    list = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  } else return undefined;
  const urls = list
    .slice(0, 10)
    .map((s) => s.slice(0, 2000))
    .filter((s) => {
      if (/^https?:\/\//i.test(s)) return true;
      if (s.startsWith('/') && !s.includes('..')) return true;
      return false;
    });
  return urls;
}

function sanitizeOverrideHeroSlideStyles(raw, countHint = 0) {
  if (!Array.isArray(raw)) return undefined;
  const slidesLen = Math.max(0, Math.min(10, Number(countHint) || 0));
  const max = slidesLen > 0 ? slidesLen : Math.min(10, raw.length);
  const out = [];
  for (const row of raw.slice(0, max)) {
    if (!row || typeof row !== 'object') {
      out.push({ x: 50, y: 50, zoom: 100 });
      continue;
    }
    const x = Number(row.x);
    const y = Number(row.y);
    const z = Number(row.zoom);
    out.push({
      x: Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 50,
      y: Number.isFinite(y) ? Math.max(0, Math.min(100, y)) : 50,
      zoom: Number.isFinite(z) ? Math.max(50, Math.min(250, z)) : 100,
    });
  }
  return out;
}

function sanitizeOverrideSections(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const row of raw.slice(0, 15)) {
    if (!row || typeof row !== 'object') continue;
    let id = String(row.id || '')
      .trim()
      .slice(0, 40)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!id) id = `sec-${out.length}`;
    const title = String(row.title || '').trim().slice(0, 120);
    const content = String(row.content || '').trim().slice(0, 8000);
    const sec = { id, title, content };
    const img = String(row.imageUrl || '').trim().slice(0, 2000);
    if (img && /^https?:\/\//i.test(img)) sec.imageUrl = img;
    out.push(sec);
  }
  return out.length ? out : undefined;
}

function sanitizeFaqItemsOverride(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const row of raw.slice(0, 40)) {
    if (!row || typeof row !== 'object') continue;
    const q = String(row.q || '').trim().slice(0, 500);
    const a = String(row.a || '').trim().slice(0, 4000);
    if (q && a) out.push({ q, a });
  }
  return out.length ? out : undefined;
}

function sanitizeCafeMenuTextRowsOverride(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const row of raw.slice(0, 100)) {
    if (!row || typeof row !== 'object') continue;
    const name = String(row.name || '').trim().slice(0, 200);
    if (!name) continue;
    out.push({
      ...(String(row.groupLabel || '').trim()
        ? { groupLabel: String(row.groupLabel || '').trim().slice(0, 120) }
        : {}),
      name,
      ...(String(row.price || '').trim() ? { price: String(row.price || '').trim().slice(0, 40) } : {}),
      ...(String(row.description || '').trim() ? { description: String(row.description || '').trim().slice(0, 800) } : {}),
      ...(String(row.badge || '').trim() ? { badge: String(row.badge || '').trim().slice(0, 40) } : {}),
    });
  }
  return out.length ? out : undefined;
}

function sanitizeCafeShopLocationsOverride(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const row of raw.slice(0, 8)) {
    if (!row || typeof row !== 'object') continue;
    const name = String(row.name || '').trim().slice(0, 120);
    const detail = String(row.detail || '').trim().slice(0, 8000);
    if (!name || !detail) continue;
    const loc = { name, detail };
    const mapUrl = String(row.mapUrl || '').trim().slice(0, 2000);
    if (mapUrl && /^https?:\/\//i.test(mapUrl)) loc.mapUrl = mapUrl;
    const imageUrl = String(row.imageUrl || '').trim().slice(0, 2000);
    if (imageUrl && /^https?:\/\//i.test(imageUrl)) loc.imageUrl = imageUrl;
    const reserveUrl = String(row.reserveUrl || '').trim().slice(0, 2000);
    if (reserveUrl && /^https?:\/\//i.test(reserveUrl)) loc.reserveUrl = reserveUrl;
    const reserveLabel = String(row.reserveLabel || '').trim().slice(0, 80);
    if (reserveLabel) loc.reserveLabel = reserveLabel;
    out.push(loc);
  }
  return out.length ? out : undefined;
}

function sanitizeCafeInstagramFeedItemsOverride(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const row of raw.slice(0, 24)) {
    if (!row || typeof row !== 'object') continue;
    const imageUrl = String(row.imageUrl || '').trim().slice(0, 2000);
    const postUrl = String(row.postUrl || '').trim().slice(0, 2000);
    if (imageUrl && /^https?:\/\//i.test(imageUrl) && postUrl && /^https?:\/\//i.test(postUrl)) {
      out.push({ imageUrl, postUrl });
    }
  }
  return out.length ? out : undefined;
}

function sanitizeCafeBranchMenuItemsOverride(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const row of raw.slice(0, 20)) {
    if (!row || typeof row !== 'object') continue;
    const label = String(row.label || '').trim().slice(0, 120);
    const menuUrl = String(row.menuUrl || '').trim().slice(0, 2000);
    if (!label || !menuUrl || !/^https?:\/\//i.test(menuUrl)) continue;
    const item = { label, menuUrl };
    const gl = String(row.groupLabel || '').trim().slice(0, 120);
    if (gl) item.groupLabel = gl;
    out.push(item);
  }
  return out.length ? out : undefined;
}

function sanitizeCafeMeoOverride(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = {};
  const servesCuisine = String(raw.servesCuisine || '').trim().slice(0, 300);
  if (servesCuisine) o.servesCuisine = servesCuisine;
  const priceRange = String(raw.priceRange || '').trim().slice(0, 80);
  if (priceRange) o.priceRange = priceRange;
  if (Array.isArray(raw.openingHours)) {
    const oh = raw.openingHours.map((s) => String(s).trim()).filter(Boolean).slice(0, 14);
    if (oh.length) o.openingHours = oh;
  }
  const sa = String(raw.streetAddress || '').trim().slice(0, 200);
  if (sa) o.streetAddress = sa;
  const loc = String(raw.addressLocality || '').trim().slice(0, 120);
  if (loc) o.addressLocality = loc;
  const reg = String(raw.addressRegion || '').trim().slice(0, 120);
  if (reg) o.addressRegion = reg;
  const pc = String(raw.postalCode || '').trim().slice(0, 20);
  if (pc) o.postalCode = pc;
  return Object.keys(o).length ? o : undefined;
}

function sanitizeBeautySalonMellowSlots(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const o = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = String(k || '').trim();
    if (!/^[a-z][a-z0-9_.]*$/i.test(key) || key.length > 80) continue;
    const s = String(v ?? '').trim().slice(0, 12000);
    if (s) o[key] = s;
  }
  return Object.keys(o).length ? o : undefined;
}

/** 美容室独立テンプレ用サロン JSON（クライアントの editor 出力をそのまま保存） */
function sanitizeBeautyStandaloneSalon(raw) {
  if (raw == null) return undefined;
  let o = raw;
  if (typeof raw === 'string') {
    try {
      o = JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return undefined;
  try {
    const s = JSON.stringify(o);
    if (s.length > 200000) return undefined;
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

/** カスタム override の正規化（空はキーごと省略。theme は1つでも値があればだけ載せる） */
function normalizeCustomizationInput(body = {}) {
  const out = {};
  const headline = String(body.headline || '').trim().slice(0, 200);
  if (headline) out.headline = headline;
  const subheadline = String(body.subheadline || '').trim().slice(0, 400);
  if (subheadline) out.subheadline = subheadline;
  const navLabels = String(body.navLabels || '').trim().slice(0, 600);
  if (navLabels) out.navLabels = navLabels;
  const siteName = String(body.siteName || '').trim().slice(0, 120);
  if (siteName) out.siteName = siteName;
  const title = String(body.title || '').trim().slice(0, 200);
  if (title) out.title = title;
  const footerText = String(body.footerText || '').trim().slice(0, 5000);
  if (footerText) out.footerText = footerText;
  const ctaLabel = String(body.ctaLabel || '').trim().slice(0, 80);
  if (ctaLabel) out.ctaLabel = ctaLabel;
  const ctaHref = String(body.ctaHref || '').trim().slice(0, 500);
  if (ctaHref) out.ctaHref = ctaHref;
  const metaTitle = String(body.metaTitle || '').trim().slice(0, 120);
  if (metaTitle) out.metaTitle = metaTitle;
  const metaDescription = String(body.metaDescription || '').trim().slice(0, 320);
  if (metaDescription) out.metaDescription = metaDescription;
  const ogImageUrl = String(body.ogImageUrl || '').trim().slice(0, 2000);
  if (ogImageUrl && /^https?:\/\//i.test(ogImageUrl)) out.ogImageUrl = ogImageUrl;
  const canonicalUrl = String(body.canonicalUrl || '').trim().slice(0, 2000);
  if (canonicalUrl) out.canonicalUrl = canonicalUrl;
  const keywords = String(body.keywords || '').trim().slice(0, 500);
  if (keywords) out.keywords = keywords;

  const theme = {
    bg: String(body.theme?.bg || '').trim().slice(0, 30),
    text: String(body.theme?.text || '').trim().slice(0, 30),
    accent: String(body.theme?.accent || '').trim().slice(0, 30),
  };
  if (theme.bg || theme.text || theme.accent) out.theme = theme;

  const cafeVisualGenre = normalizeCafeVisualGenreId(body.cafeVisualGenre);
  if (cafeVisualGenre) out.cafeVisualGenre = cafeVisualGenre;

  let heroSlides = sanitizeOverrideHeroSlides(body.heroSlides);
  if (cafeVisualGenre === 'ramen') {
    heroSlides = [...CAFE_1_RAMEN_HERO_SLIDES];
  }
  if (heroSlides !== undefined) out.heroSlides = heroSlides;
  const heroSlideStyles = sanitizeOverrideHeroSlideStyles(
    body.heroSlideStyles,
    heroSlides !== undefined ? heroSlides.length : 0,
  );
  if (heroSlideStyles !== undefined) out.heroSlideStyles = heroSlideStyles;

  const sections = sanitizeOverrideSections(body.sections);
  if (sections) out.sections = sections;

  const footerAddress = String(body.footerAddress || '').trim().slice(0, 300);
  if (footerAddress) out.footerAddress = footerAddress;
  const footerPhone = String(body.footerPhone || '').trim().slice(0, 40);
  if (footerPhone) out.footerPhone = footerPhone;
  const footerInstagramUrl = String(body.footerInstagramUrl || '').trim().slice(0, 2000);
  if (footerInstagramUrl && /^https?:\/\//i.test(footerInstagramUrl)) out.footerInstagramUrl = footerInstagramUrl;
  const footerLineUrl = String(body.footerLineUrl || '').trim().slice(0, 2000);
  if (footerLineUrl && /^https?:\/\//i.test(footerLineUrl)) out.footerLineUrl = footerLineUrl;
  const footerTwitterUrl = String(body.footerTwitterUrl || '').trim().slice(0, 2000);
  if (footerTwitterUrl && /^https?:\/\//i.test(footerTwitterUrl)) out.footerTwitterUrl = footerTwitterUrl;
  const mapEmbedUrl = String(body.mapEmbedUrl || '').trim().slice(0, 2000);
  if (mapEmbedUrl && /^https?:\/\//i.test(mapEmbedUrl)) out.mapEmbedUrl = mapEmbedUrl;
  const cafeFloatingMapUrl = String(body.cafeFloatingMapUrl || '').trim().slice(0, 2000);
  if (cafeFloatingMapUrl && /^https?:\/\//i.test(cafeFloatingMapUrl)) out.cafeFloatingMapUrl = cafeFloatingMapUrl;
  const cafeInstagramPermalink = String(body.cafeInstagramPermalink || '').trim().slice(0, 2000);
  if (cafeInstagramPermalink && /^https?:\/\//i.test(cafeInstagramPermalink)) out.cafeInstagramPermalink = cafeInstagramPermalink;
  const cafeReviewCtaText = String(body.cafeReviewCtaText || '').trim().slice(0, 200);
  if (cafeReviewCtaText) out.cafeReviewCtaText = cafeReviewCtaText;
  const cafeReviewCtaUrl = String(body.cafeReviewCtaUrl || '').trim().slice(0, 2000);
  if (cafeReviewCtaUrl && /^https?:\/\//i.test(cafeReviewCtaUrl)) out.cafeReviewCtaUrl = cafeReviewCtaUrl;
  const cafeGbPostsEmbedUrl = String(body.cafeGbPostsEmbedUrl || '').trim().slice(0, 2000);
  if (cafeGbPostsEmbedUrl && /^https?:\/\//i.test(cafeGbPostsEmbedUrl)) out.cafeGbPostsEmbedUrl = cafeGbPostsEmbedUrl;

  const faqItems = sanitizeFaqItemsOverride(body.faqItems);
  if (faqItems) out.faqItems = faqItems;
  const cafeMenuTextRows = sanitizeCafeMenuTextRowsOverride(body.cafeMenuTextRows);
  if (cafeMenuTextRows) out.cafeMenuTextRows = cafeMenuTextRows;
  const cafeShopLocations = sanitizeCafeShopLocationsOverride(body.cafeShopLocations);
  if (cafeShopLocations) out.cafeShopLocations = cafeShopLocations;
  const cafeInstagramFeedItems = sanitizeCafeInstagramFeedItemsOverride(body.cafeInstagramFeedItems);
  if (cafeInstagramFeedItems) out.cafeInstagramFeedItems = cafeInstagramFeedItems;
  const cafeBranchMenuItems = sanitizeCafeBranchMenuItemsOverride(body.cafeBranchMenuItems);
  if (cafeBranchMenuItems) out.cafeBranchMenuItems = cafeBranchMenuItems;
  const cafeMeo = sanitizeCafeMeoOverride(body.cafeMeo);
  if (cafeMeo) out.cafeMeo = cafeMeo;

  const bslots = sanitizeBeautySalonMellowSlots(body.beautySalonMellowSlots);
  if (bslots) out.beautySalonMellowSlots = bslots;
  const brsv = String(body.beautySalonReserveUrl || '').trim().slice(0, 2000);
  if (brsv && /^https?:\/\//i.test(brsv)) out.beautySalonReserveUrl = brsv;
  const meh = String(body.mapEmbedHtml || '').trim().slice(0, 50000);
  if (meh) out.mapEmbedHtml = meh;

  const beautyStandaloneSalon = sanitizeBeautyStandaloneSalon(body.beautyStandaloneSalon);
  if (beautyStandaloneSalon) out.beautyStandaloneSalon = beautyStandaloneSalon;

  return out;
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
  const draftRec = await store.getGalleryDraftBuiltins();
  const galleryDraftBuiltinIds = new Set(Array.isArray(draftRec?.draftBuiltinIds) ? draftRec.draftBuiltinIds : []);
  const candidates = getTemplateCandidates(customs, { forPublicSelection: true, galleryDraftBuiltinIds });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderCustomerIntakePage(candidates));
});

app.get('/api/public/template-catalog', async (req, res) => {
  try {
    const customs = await store.getTemplateCustomizations();
    const catalog = await buildPublicTemplateCatalog(customs);
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
    res.json(catalog);
  } catch (e) {
    console.error('[public/template-catalog]', e);
    res.status(500).json({ error: 'catalog failed' });
  }
});

app.get('/api/admin/template-catalog', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const customs = await store.getTemplateCustomizations();
    const catalog = await buildAdminTemplateCatalog(customs);
    res.setHeader('Cache-Control', 'no-store');
    res.json(catalog);
  } catch (e) {
    console.error('[admin/template-catalog]', e);
    res.status(500).json({ error: 'catalog failed' });
  }
});

app.post('/api/admin/gallery-draft-builtins/publish', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = String(req.body?.id || '').trim();
  if (!BUILTIN_BUILD_HTML_TEMPLATE_IDS.includes(id)) {
    return res.status(400).json({ error: 'ビルトインIDのみ公開できます' });
  }
  try {
    const rec = await store.getGalleryDraftBuiltins();
    const cur = Array.isArray(rec?.draftBuiltinIds) ? rec.draftBuiltinIds : [];
    const next = cur.filter((x) => String(x) !== id);
    await store.setGalleryDraftBuiltins({ draftBuiltinIds: next });
    res.json({ ok: true, draftBuiltinIds: next });
  } catch (e) {
    console.error('[gallery-draft-builtins/publish]', e);
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/api/admin/gallery-draft-builtins/mark-draft', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = String(req.body?.id || '').trim();
  if (!BUILTIN_BUILD_HTML_TEMPLATE_IDS.includes(id)) {
    return res.status(400).json({ error: 'ビルトインIDのみ下書きにできます' });
  }
  try {
    const rec = await store.getGalleryDraftBuiltins();
    const cur = Array.isArray(rec?.draftBuiltinIds) ? [...rec.draftBuiltinIds] : [];
    if (!cur.includes(id)) cur.push(id);
    await store.setGalleryDraftBuiltins({ draftBuiltinIds: cur });
    res.json({ ok: true, draftBuiltinIds: cur });
  } catch (e) {
    console.error('[gallery-draft-builtins/mark-draft]', e);
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/api/public/translate-ui', async (req, res) => {
  const ip = clientIp(req);
  if (!allowPublicTranslate(ip)) {
    return res.status(429).json({ error: 'しばらく時間をおいて再度お試しください。' });
  }
  try {
    const body = req.body || {};
    const entries = body.entries;
    if (!Array.isArray(entries) || entries.length === 0 || entries.length > 120) {
      return res.status(400).json({ error: 'invalid entries' });
    }
    let total = 0;
    const cleaned = [];
    const seenKeys = new Set();
    for (const e of entries) {
      const key = String(e.key || '').trim().slice(0, 160);
      const text = String(e.text || '').trim().slice(0, 2500);
      if (!key || seenKeys.has(key)) continue;
      seenKeys.add(key);
      total += text.length;
      if (total > 14000) {
        return res.status(400).json({ error: 'payload too large' });
      }
      cleaned.push({ key, text });
    }
    if (!cleaned.length) {
      return res.status(400).json({ error: 'invalid entries' });
    }
    const out = await translatePublicUiEntries(cleaned);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, entries: out });
  } catch (e) {
    console.error('[public/translate-ui]', e?.message || e);
    const msg =
      String(e?.message || '').includes('GEMINI_API_KEY') || String(e?.message || '').includes('not set')
        ? '翻訳サービスが設定されていません'
        : 'translation failed';
    res.status(503).json({ error: msg });
  }
});

app.get(['/template-gallery', '/api/template-gallery'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=120');
  res.send(renderTemplateGalleryPage());
});

/** 管理者のみ。未保存の override で HTML を返す（店舗ドラフト編集のライブプレビュー用） */
app.post('/api/template-preview/render', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const baseTemplateId = String(req.body?.baseTemplateId || '').trim();
  if (!baseTemplateId) {
    return res.status(400).json({ error: 'baseTemplateId is required' });
  }
  try {
    const override = normalizeCustomizationInput(req.body?.override || {});
    const html = renderTemplatePreview(baseTemplateId, { override });
    if (!html) {
      return res.status(400).json({ error: 'render failed or invalid template id' });
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.send(html);
  } catch (e) {
    console.error('[template-preview/render]', e);
    res.status(500).json({ error: e?.message || 'render failed' });
  }
});

/** 管理者のみ。ビルトインテンプレの現在値を編集フォーム用に返す */
app.get('/api/template-default/:templateId', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const templateId = String(req.params.templateId || '').trim();
  if (!templateId) return res.status(400).json({ error: 'templateId is required' });
  try {
    const resolved = renderTemplatePreview(templateId, {}, { returnResolvedData: true });
    if (!resolved || typeof resolved !== 'object' || !resolved.content) {
      return res.status(404).json({ error: 'template not found' });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, id: resolved.id, content: resolved.content, seo: resolved.seo || {} });
  } catch (e) {
    console.error('[template-default]', e);
    res.status(500).json({ error: e?.message || 'template-default failed' });
  }
});

/** 管理者のみ。画像/PDFからドラフト入力候補を抽出 */
app.post('/api/template-customizations/extract', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const files = Array.isArray(req.body?.files) ? req.body.files : [];
    const textContext = String(req.body?.text || '').trim().slice(0, 16000);
    const cleanFiles = files
      .slice(0, 4)
      .map((f) => ({
        mimeType: String(f?.mimeType || '').trim().slice(0, 120),
        data: String(f?.data || '').trim(),
        name: String(f?.name || '').trim().slice(0, 160),
      }))
      .filter((f) => f.mimeType && f.data);
    if (!cleanFiles.length && !textContext) return res.status(400).json({ error: 'files or text are required' });

    const extracted = await extractTemplateOverrideFromDocuments(cleanFiles, textContext);
    const normalized = normalizeCustomizationInput(extracted.override || {});
    res.json({
      ok: true,
      nameSuggestion: extracted.nameSuggestion || '',
      override: normalized,
      fileCount: cleanFiles.length,
      textLength: textContext.length,
    });
  } catch (e) {
    console.error('[template-customizations/extract]', e);
    res.status(500).json({ error: e?.message || 'extract failed' });
  }
});

/** 長文テキストのみから override を抽出（フル編集の「Gemini 一括入力」用。normalize 済み） */
app.post('/api/template-customizations/extract-from-text', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const text = String(req.body?.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text が空です' });
  if (text.length > 20000) return res.status(400).json({ error: 'text は 20000 文字以内にしてください' });
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY が未設定です' });
  }
  try {
    const extracted = await extractTemplateOverrideFromFreeText(text);
    const normalized = normalizeCustomizationInput(extracted.override || {});
    res.json({
      ok: true,
      nameSuggestion: extracted.nameSuggestion || '',
      override: normalized,
    });
  } catch (e) {
    console.error('[template-customizations/extract-from-text]', e);
    res.status(500).json({ error: e?.message || 'extract failed' });
  }
});

function templatePreviewPublicHandler(req, res) {
  const templateId = String(req.params.templateId || '');
  const xfProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim() || 'https';
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const previewOrigin = host ? `${xfProto}://${host}` : '';
  const previewCanonicalUrl = previewOrigin
    ? `${previewOrigin}/api/template-preview/${encodeURIComponent(templateId)}`
    : '';

  store
    .getTemplateCustomizations()
    .then((customs) => {
      const candidate = findTemplateCandidate(templateId, customs);
      const notFound = () => {
        const msg = 'Template not found';
        res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8');
        if (req.method === 'HEAD') {
          res.setHeader('Content-Length', Buffer.byteLength(msg, 'utf8'));
          return res.end();
        }
        return res.send(msg);
      };
      if (!candidate) return notFound();

      const baseId = candidate.baseTemplateId || candidate.id;
      const html = renderTemplatePreview(baseId, candidate.customization || null, {
        previewSocialFromContent: true,
        previewAbsoluteOrigin: previewOrigin || undefined,
        previewCanonicalUrl: previewCanonicalUrl || undefined,
      });
      if (!html) return res.status(500).json({ error: 'failed to render preview' });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      const cc = candidate.isCustom ? 'private, no-store' : 'private, max-age=60';
      res.setHeader('Cache-Control', cc);
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      if (req.method === 'HEAD') {
        res.setHeader('Content-Length', Buffer.byteLength(html, 'utf8'));
        return res.end();
      }
      const isOwnAdminView = adminAuthEnabled() && isAdminAuthenticated(req);
      void store.recordTemplatePreviewView(templateId, { isAdminView: isOwnAdminView }).catch((err) => {
        console.error('[template-preview view]', err);
      });
      return res.send(html);
    })
    .catch((e) => {
      console.error('[template-preview]', e);
      if (!res.headersSent) res.status(500).json({ error: 'template preview failed' });
    });
}

app.get('/api/template-preview/:templateId', templatePreviewPublicHandler);
app.head('/api/template-preview/:templateId', templatePreviewPublicHandler);

app.get('/api/template-candidates', async (req, res) => {
  const customs = await store.getTemplateCustomizations();
  const draftRec = await store.getGalleryDraftBuiltins();
  const galleryDraftBuiltinIds = new Set(Array.isArray(draftRec?.draftBuiltinIds) ? draftRec.draftBuiltinIds : []);
  const includeDrafts = adminAuthEnabled() ? isAdminAuthenticated(req) : true;
  const opts = includeDrafts
    ? { forPublicSelection: false }
    : { forPublicSelection: true, galleryDraftBuiltinIds };
  res.json(getTemplateCandidates(customs, opts));
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

/** 店名（トップの店舗名）＋フッター住所の重複ヒント（保存前確認用） */
app.post('/api/template-customizations/duplicate-hint', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  try {
    const customizations = await store.getTemplateCustomizations();
    const dashboardItems = await store.getDashboard();
    const hits = findDuplicateDraftHints({
      siteName: String(body.siteName || ''),
      footerAddress: String(body.footerAddress || ''),
      excludeCustomizationId: String(body.excludeCustomizationId || ''),
      customizations,
      dashboardItems,
    });
    res.json({ ok: true, hits });
  } catch (e) {
    console.error('[template-customizations/duplicate-hint]', e);
    res.status(500).json({ error: e?.message || 'duplicate-hint failed' });
  }
});

/** cafe_1 基本情報のみモード：ジャンル別の固定 override ひな型（プレビュー用） */
app.get('/api/cafe-1-basic-locked-preset', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const genre = String(req.query.genre || '').trim();
  const presetKind = mapGenreToBasicPresetKind(genre);
  try {
    const override = getCafe1BasicLockedOverride(presetKind);
    res.json({ ok: true, presetKind, requestedGenre: genre, override });
  } catch (e) {
    res.status(400).json({ error: e?.message || 'プリセット取得に失敗しました' });
  }
});

/** cafe_1 基本情報のみ保存（固定コンテンツ＋入力項目をサーバー側でマージ） */
app.post('/api/template-customizations/save-cafe1-basic', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  const genre = String(body.genre || '').trim();
  const presetKind =
    body.presetKind === 'ramen' || body.presetKind === 'cafe' || body.presetKind === 'default'
      ? body.presetKind
      : mapGenreToBasicPresetKind(genre);
  let merged;
  try {
    merged = mergeCafe1BasicEditable(presetKind, body.editable || {});
  } catch (e) {
    return res.status(400).json({ error: e?.message || 'マージに失敗しました' });
  }
  const normalizedOv = normalizeCustomizationInput(merged);
  const customizations = await store.getTemplateCustomizations();
  const now = new Date().toISOString();
  const mode = body.mode === 'update' ? 'update' : 'create';

  if (mode === 'update') {
    const id = String(body.id || '');
    const i = customizations.findIndex((v) => v.id === id);
    if (i === -1) return res.status(404).json({ error: 'Customization not found' });
    const nextStatus =
      body.status === 'draft' || body.status === 'published'
        ? body.status
        : customizations[i].status || 'published';
    customizations[i] = {
      ...customizations[i],
      name: String(body.name || customizations[i].name || '').trim().slice(0, 80),
      baseTemplateId: 'cafe_1',
      override: normalizedOv,
      cafe1BasicPresetKind: presetKind,
      status: nextStatus,
      updatedAt: now,
    };
    await store.setTemplateCustomizations(customizations);
    return res.json({ ok: true, item: customizations[i] });
  }

  if (!isValidTemplateId('cafe_1', customizations)) {
    return res.status(400).json({ error: 'cafe_1 template is not available' });
  }
  const id = `custom-${Date.now().toString(36)}`;
  const item = {
    id,
    name: String(body.name || '店舗（基本情報のみ）').trim().slice(0, 80),
    baseTemplateId: 'cafe_1',
    override: normalizedOv,
    cafe1BasicPresetKind: presetKind,
    status: body.status === 'draft' ? 'draft' : 'published',
    createdAt: now,
    updatedAt: now,
  };
  customizations.unshift(item);
  await store.setTemplateCustomizations(customizations);
  res.json({ ok: true, item });
});

/** cafe_1 基本情報のみ：マージ済み override を JSON で返す（クライアント検証用） */
app.post('/api/cafe-1-basic-merged-override', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  const genre = String(body.genre || '').trim();
  const presetKind =
    body.presetKind === 'ramen' || body.presetKind === 'cafe' || body.presetKind === 'default'
      ? body.presetKind
      : mapGenreToBasicPresetKind(genre);
  try {
    const merged = mergeCafe1BasicEditable(presetKind, body.editable || {});
    const override = normalizeCustomizationInput(merged);
    res.json({ ok: true, presetKind, override });
  } catch (e) {
    res.status(400).json({ error: e?.message || 'マージに失敗しました' });
  }
});

/** cafe_1 基本情報のみ：ライブプレビュー用 HTML */
app.post('/api/cafe-1-basic-preview-html', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  const genre = String(body.genre || '').trim();
  const presetKind =
    body.presetKind === 'ramen' || body.presetKind === 'cafe' || body.presetKind === 'default'
      ? body.presetKind
      : mapGenreToBasicPresetKind(genre);
  try {
    const merged = mergeCafe1BasicEditable(presetKind, body.editable || {});
    const override = normalizeCustomizationInput(merged);
    const html = renderTemplatePreview('cafe_1', { override });
    if (!html) return res.status(400).json({ error: 'render failed' });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.send(html);
  } catch (e) {
    console.error('[cafe-1-basic-preview-html]', e);
    res.status(500).json({ error: e?.message || 'preview failed' });
  }
});

/** cafe_1 基本情報：長文貼り付けを Gemini で JSON 化（フォームは空のキーを上書きしない） */
app.post('/api/cafe-1-basic-extract-from-text', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  const text = String(body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text が空です' });
  if (text.length > 20000) return res.status(400).json({ error: 'text は 20000 文字以内にしてください' });
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY が未設定です' });
  }
  try {
    const raw = await extractCafe1BasicFromFreeText(text);
    const extracted = {
      siteName: raw.siteName || '',
      footerAddress: raw.footerAddress || '',
      footerPhone: raw.footerPhone || '',
      mapEmbedUrl: raw.mapEmbedUrl || '',
      openingHoursText: raw.openingHoursText || '',
      footerInstagramUrl: raw.footerInstagramUrl || '',
      footerTwitterUrl: raw.footerTwitterUrl || '',
      visualGenre: normalizeCafeVisualGenreId(raw.visualGenre),
    };
    res.json({ ok: true, extracted });
  } catch (e) {
    console.error('[cafe-1-basic-extract-from-text]', e);
    res.status(500).json({ error: e?.message || '抽出に失敗しました' });
  }
});

/** iframe 全文・埋め込みURL・Google短縮リンク → プレビュー用の埋め込みURL（管理者のみ） */
app.post('/api/resolve-map-embed-url', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = String(req.body?.raw ?? '').trim();
  if (!raw) return res.status(400).json({ error: 'raw が空です' });
  if (raw.length > 50000) return res.status(400).json({ error: '入力が長すぎます' });
  try {
    const out = await resolveMapEmbedFromRaw(raw);
    if (!out.embedUrl) {
      return res.status(422).json({ error: out.error || '埋め込みURLを取得できませんでした' });
    }
    res.json({ ok: true, embedUrl: out.embedUrl });
  } catch (e) {
    console.error('[resolve-map-embed-url]', e);
    res.status(500).json({ error: e?.message || 'resolve failed' });
  }
});

/** 美容室独立LP保存後にメモリード1件を削除する（ドラフト保存で付くダッシュ行とメモ行の二重表示を防ぐ） */
async function consumeBeautyMemoLeadAfterDraftSave(store, memoId) {
  const mid = String(memoId || '').trim();
  if (!mid) return;
  const raw = await store.getBeautyMemoLeads();
  const list = Array.isArray(raw) ? raw : [];
  const next = list.filter((x) => !x || x.id !== mid);
  if (next.length === list.length) return;
  await store.setBeautyMemoLeads(next);
}

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
    const normalizedOv = normalizeCustomizationInput(body.override || {});
    const prevOverride =
      customizations[i].override && typeof customizations[i].override === 'object'
        ? customizations[i].override
        : {};
    /** 置き換え指定でも「今回のフォームで送られたキーだけ」上書きし、省略された項目はDBのまま残す（テンプレ既定へ巻き戻り防止） */
    const nextOverride = { ...prevOverride, ...normalizedOv };
    const nextItem = {
      ...customizations[i],
      name: String(body.name || customizations[i].name || '').trim().slice(0, 80),
      override: nextOverride,
      status: nextStatus,
      ...(body.sourceUrl != null
        ? { sourceUrl: String(body.sourceUrl || '').trim().slice(0, 5000) }
        : {}),
      ...(body.fingerprint != null ? { fingerprint: sanitizeFingerprint(body.fingerprint) } : {}),
      ...(nextBp ? { blueprint: nextBp } : {}),
      updatedAt: now,
    };
    if (body.linkedDashboardId !== undefined) {
      const lid = String(body.linkedDashboardId || '').trim().slice(0, 200);
      if (lid) nextItem.linkedDashboardId = lid;
      else delete nextItem.linkedDashboardId;
    }
    const reqBase = String(body.baseTemplateId || '').trim();
    if (reqBase === 'beauty_standalone' && isValidTemplateId('beauty_standalone', customizations)) {
      nextItem.baseTemplateId = 'beauty_standalone';
    }
    customizations[i] = nextItem;
    const isBeauty = customizationBaseIsBeauty(nextItem.baseTemplateId);
    const dashUpdate = isBeauty
      ? [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])]
      : [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
    ensureDashboardForWorkerDraft(nextItem, body, dashUpdate);
    await store.setTemplateCustomizations(customizations);
    if (isBeauty) await store.setBeautyDashboard(dashUpdate);
    else await store.setDashboard(dashUpdate);
    if (isBeauty) {
      const memoConsume = String(body.memoLeadId || body.beautyMemoLeadId || '').trim();
      if (memoConsume) await consumeBeautyMemoLeadAfterDraftSave(store, memoConsume);
    }
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
  const lidCreate = String(body.linkedDashboardId || '').trim().slice(0, 200);
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
    ...(lidCreate ? { linkedDashboardId: lidCreate } : {}),
    createdAt: now,
    updatedAt: now,
  };
  customizations.unshift(item);
  const isBeautyCreate = customizationBaseIsBeauty(item.baseTemplateId);
  const dashCreate = isBeautyCreate
    ? [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])]
    : [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
  ensureDashboardForWorkerDraft(item, body, dashCreate);
  await store.setTemplateCustomizations(customizations);
  if (isBeautyCreate) await store.setBeautyDashboard(dashCreate);
  else await store.setDashboard(dashCreate);
  if (isBeautyCreate) {
    const memoConsume = String(body.memoLeadId || body.beautyMemoLeadId || '').trim();
    if (memoConsume) await consumeBeautyMemoLeadAfterDraftSave(store, memoConsume);
  }
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
  const draftRec = await store.getGalleryDraftBuiltins();
  const galleryDraftBuiltinIds = new Set(Array.isArray(draftRec?.draftBuiltinIds) ? draftRec.draftBuiltinIds : []);
  const publicCandidates = getTemplateCandidates(templateCustoms, {
    forPublicSelection: true,
    galleryDraftBuiltinIds,
  });
  const allowedTemplateIds = new Set(publicCandidates.map((c) => c.id));
  allowedTemplateIds.add('intake_bespoke');
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
  if (!requireAdmin(req, res)) return;
  const list = await store.getCustomerIntake();
  const row = (list || []).find((v) => v.id === req.params.id);
  if (!row) return res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Intake not found');
  const templateCustoms = await store.getTemplateCustomizations();
  if (!isValidTemplateId(row.chosenTemplateId, templateCustoms)) {
    return res.status(400).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Invalid template');
  }
  const { content, seo } = intakeToPageDraft(row);
  let mergedContent = content;
  let baseTemplateId = row.chosenTemplateId;
  if (row.chosenTemplateId !== 'intake_bespoke') {
    const candidate = findTemplateCandidate(row.chosenTemplateId, templateCustoms);
    baseTemplateId = candidate?.baseTemplateId || row.chosenTemplateId;
    mergedContent = applyTemplateCustomization(content, candidate?.customization?.override || null);
  } else {
    baseTemplateId = 'navy_cyan_consult';
  }
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
const OUTREACH_PHASE_CANONICAL = new Set([
  'pre_contact',
  'first_contact',
  'message_sent',
  'resend_wait',
  'resend_sent',
  'instagram_limited',
  'resend_unavailable',
  'hearing',
  'proposal',
  'contracted',
  'payment_confirmed',
  'lost',
  'no_outreach_channel',
]);
/** PATCH および旧データ用。保存値は正規化して CANONICAL のいずれかに揃える */
const OUTREACH_PHASE_LEGACY_MAP = {
  pending_send: 'pre_contact',
  awaiting_reply: 'proposal',
  sent: 'message_sent',
  appointment: 'hearing',
  won: 'contracted',
  sleep: 'no_outreach_channel',
};

function canonicalizeOutreachPhaseInput(p) {
  const s = String(p || '').trim();
  if (OUTREACH_PHASE_CANONICAL.has(s)) return s;
  return OUTREACH_PHASE_LEGACY_MAP[s] || null;
}

function addMonthsIso(fromDate, months) {
  const d = new Date(fromDate);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

function addDaysIso(fromDate, days) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const MEMO_WEB_STRENGTH = new Set(['no_site', 'weak_site', 'strong_site']);

function hpbMemoLabelForStrength(ws) {
  if (ws === 'weak_site') return '[HPB取込] ウェブあり（弱）';
  if (ws === 'strong_site') return '[HPB取込] ウェブあり（強）';
  return '[HPB取込] ウェブなし';
}

function rewriteHpbMemoFirstLine(memo, ws) {
  const m = String(memo || '');
  if (!m.trim().startsWith('[HPB取込]')) return m;
  const nl = m.indexOf('\n');
  const tail = nl === -1 ? '' : m.slice(nl + 1);
  return `${hpbMemoLabelForStrength(ws)}\n${tail}`;
}

function extractHpbAccessFromMemo(memo) {
  for (const line of String(memo || '').split('\n')) {
    const t = line.trim();
    if (t.startsWith('アクセス:')) return t.replace(/^アクセス:\s*/, '').trim().slice(0, 800);
  }
  return '';
}

/** HPB コピペ末尾の「一覧へ」〜クーポン・空き時間ブロックを除く */
function stripHpbCouponTailFromText(s) {
  const lines = String(s || '').split('\n');
  const cut = lines.findIndex((line) => line.trim() === '一覧へ');
  if (cut < 0) return String(s || '').trim();
  return lines.slice(0, cut).join('\n').trim();
}

function extractHpbSourceFromMemo(memo) {
  const parts = String(memo || '').split(/\n\n+/);
  const tail =
    parts.length < 2 ? String(memo || '').trim() : parts.slice(1).join('\n\n').trim();
  return stripHpbCouponTailFromText(tail).slice(0, 11000);
}

async function findDashboardRowInAnyStoreByItemId(itemId) {
  const id = String(itemId || '');
  const main = [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
  let idx = main.findIndex((d) => d && d.id === id);
  if (idx >= 0) return { pool: 'main', list: main, idx };
  const beauty = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
  idx = beauty.findIndex((d) => d && d.id === id);
  if (idx >= 0) return { pool: 'beauty', list: beauty, idx };
  return null;
}

async function persistDashboardPoolHit(hit) {
  if (!hit) return;
  if (hit.pool === 'beauty') await store.setBeautyDashboard(hit.list);
  else await store.setDashboard(hit.list);
}

app.get('/api/dashboard', async (req, res) => {
  const customs = await store.getTemplateCustomizations();
  const main = Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [];
  const out = main.filter((row) => !dashboardItemIsBeauty(row, customs));
  res.json(out);
});

/** 送付・フェーズ前の軽量メモ（店名＋リンク等のみ。ダッシュボード案件とは別ストア） */
app.get('/api/memo-leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getMemoLeads();
  res.json(Array.isArray(raw) ? raw : []);
});

app.get('/api/memo-leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getMemoLeads();
  const list = Array.isArray(raw) ? raw : [];
  const item = list.find((x) => x && x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/memo-leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const shopName = String(req.body?.shopName || '').trim().slice(0, 200);
  const memo = String(req.body?.memo || '').trim().slice(0, 12000);
  if (!shopName) return res.status(400).json({ error: '店名（shopName）が必要です' });
  const raw = await store.getMemoLeads();
  const list = [...(Array.isArray(raw) ? raw : [])];
  const now = new Date().toISOString();
  const row = {
    id: `ml-${Date.now().toString(36)}-${randomBytes(5).toString('hex')}`,
    shopName,
    memo,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(row);
  await store.setMemoLeads(list);
  res.status(201).json(row);
});

/**
 * メモリード／送付管理への一括取込（美容室HPB想定）。
 * webStrength: no_site | weak_site → memo-leads、strong_site → dashboard（no_outreach_channel）
 */
app.post('/api/memo-leads/intake-batch', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const entries = req.body?.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries（配列）が必要です' });
  }
  if (entries.length > 80) {
    return res.status(400).json({ error: '一度に登録できるのは80件までです' });
  }
  const STRENGTHS = new Set(['no_site', 'weak_site', 'strong_site']);
  const rawMemo = await store.getMemoLeads();
  const memoList = [...(Array.isArray(rawMemo) ? rawMemo : [])];
  const dashboard = [...(await store.getDashboard())];
  const now = new Date().toISOString();
  let memosAdded = 0;
  let dashboardAdded = 0;
  for (let ei = 0; ei < entries.length; ei++) {
    const raw = entries[ei];
    const shopName = String(raw?.shopName || '').trim().slice(0, 200);
    if (!shopName) continue;
    const webStrength = String(raw?.webStrength || '').trim();
    if (!STRENGTHS.has(webStrength)) continue;
    const access = String(raw?.access || '').trim().slice(0, 800);
    const sourceMemo = stripHpbCouponTailFromText(String(raw?.sourceMemo || '')).trim().slice(0, 11000);
    if (webStrength === 'strong_site') {
      dashboard.unshift(
        buildStrongWebSalonDashboardRow({
          shopName,
          accessText: access,
          sourceSnippet: sourceMemo,
        }),
      );
      dashboardAdded += 1;
      continue;
    }
    const label = webStrength === 'weak_site' ? 'ウェブあり（弱）' : 'ウェブなし';
    const memo = ['[HPB取込] ' + label, access ? 'アクセス: ' + access : '', '', sourceMemo]
      .filter(Boolean)
      .join('\n')
      .slice(0, 12000);
    memoList.unshift({
      id: `ml-${Date.now().toString(36)}-${ei}-${randomBytes(5).toString('hex')}`,
      shopName,
      memo,
      webStrength: webStrength === 'weak_site' ? 'weak_site' : 'no_site',
      hpbAccess: access,
      hpbBody: sourceMemo.slice(0, 11000),
      createdAt: now,
      updatedAt: now,
    });
    memosAdded += 1;
  }
  if (memosAdded === 0 && dashboardAdded === 0) {
    return res.status(400).json({ error: '有効な行がありません（店名とウェブ強度を確認してください）' });
  }
  await store.setMemoLeads(memoList);
  await store.setDashboard(dashboard);
  res.json({ ok: true, memosAdded, dashboardAdded });
});

/** HPB 一括取込（美容室フェーズ専用ストア）。strong_site はメモに載せず美容ダッシュボードへ（no_outreach_channel）。 */
app.post('/api/beauty-outreach/memo-leads/intake-batch', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const entries = req.body?.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries（配列）が必要です' });
  }
  if (entries.length > 80) {
    return res.status(400).json({ error: '一度に登録できるのは80件までです' });
  }
  const STRENGTHS = new Set(['no_site', 'weak_site', 'strong_site']);
  const rawMemo = await store.getBeautyMemoLeads();
  const memoList = [...(Array.isArray(rawMemo) ? rawMemo : [])];
  const dashboard = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
  const now = new Date().toISOString();
  let memosAdded = 0;
  let dashboardAdded = 0;
  for (let ei = 0; ei < entries.length; ei++) {
    const raw = entries[ei];
    const shopName = String(raw?.shopName || '').trim().slice(0, 200);
    if (!shopName) continue;
    const rawWs = String(raw?.webStrength || '').trim();
    if (!STRENGTHS.has(rawWs)) continue;
    const webStrength = rawWs;
    const access = String(raw?.access || '').trim().slice(0, 800);
    const sourceMemo = stripHpbCouponTailFromText(String(raw?.sourceMemo || '')).trim().slice(0, 11000);
    if (webStrength === 'strong_site') {
      dashboard.unshift(
        buildStrongWebSalonDashboardRow({
          shopName,
          accessText: access,
          sourceSnippet: sourceMemo,
        }),
      );
      dashboardAdded += 1;
      continue;
    }
    const memoText = [hpbMemoLabelForStrength(webStrength), access ? 'アクセス: ' + access : '', '', sourceMemo]
      .filter(Boolean)
      .join('\n')
      .slice(0, 12000);
    memoList.unshift({
      id: `ml-${Date.now().toString(36)}-${ei}-${randomBytes(5).toString('hex')}`,
      shopName,
      memo: memoText,
      webStrength: webStrength === 'weak_site' ? 'weak_site' : 'no_site',
      hpbAccess: access,
      hpbBody: sourceMemo.slice(0, 11000),
      addressMapUrl: '',
      instagramUrl: '',
      hotPepperUrl: '',
      onOutreachBoard: true,
      createdAt: now,
      updatedAt: now,
    });
    memosAdded += 1;
  }
  if (memosAdded === 0 && dashboardAdded === 0) {
    return res.status(400).json({ error: '有効な行がありません（店名とウェブ強度を確認してください）' });
  }
  await store.setBeautyMemoLeads(memoList);
  await store.setBeautyDashboard(dashboard);
  res.json({ ok: true, memosAdded, dashboardAdded });
});

app.patch('/api/memo-leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getMemoLeads();
  const list = [...(Array.isArray(raw) ? raw : [])];
  const i = list.findIndex((x) => x && x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  if (req.body?.shopName !== undefined) list[i].shopName = String(req.body.shopName || '').trim().slice(0, 200);
  if (req.body?.memo !== undefined) list[i].memo = String(req.body.memo || '').trim().slice(0, 12000);

  if (req.body?.webStrength !== undefined) {
    const ws = String(req.body.webStrength).trim();
    if (!MEMO_WEB_STRENGTH.has(ws)) {
      return res.status(400).json({ error: 'webStrength は no_site / weak_site / strong_site のいずれかです' });
    }
    const memoRow = list[i];
    const memoText = String(memoRow?.memo || '').trim();
    const isHpb = memoText.startsWith('[HPB取込]') || String(memoRow?.hpbBody || '').trim();
    if (!isHpb) {
      return res.status(400).json({ error: 'HPB取込のメモだけウェブ強度を変更できます' });
    }
    if (ws === 'strong_site') {
      const shopName = String(memoRow.shopName || '').trim().slice(0, 200) || '（無題）';
      const access = String(memoRow.hpbAccess || '')
        .trim()
        .slice(0, 800) || extractHpbAccessFromMemo(memoRow.memo);
      const snippet = stripHpbCouponTailFromText(
        String(memoRow.hpbBody || '').trim() || extractHpbSourceFromMemo(memoRow.memo) || memoText,
      ).slice(0, 11000);
      list.splice(i, 1);
      await store.setMemoLeads(list);
      const dashboard = [...(await store.getDashboard())];
      dashboard.unshift(
        buildStrongWebSalonDashboardRow({
          shopName,
          accessText: access,
          sourceSnippet: snippet,
        }),
      );
      await store.setDashboard(dashboard);
      return res.json({ ok: true, movedToDashboard: true });
    }
    memoRow.webStrength = ws === 'weak_site' ? 'weak_site' : 'no_site';
    memoRow.memo = rewriteHpbMemoFirstLine(memoRow.memo, ws);
  }

  list[i].updatedAt = new Date().toISOString();
  await store.setMemoLeads(list);
  res.json(list[i]);
});

app.delete('/api/memo-leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getMemoLeads();
  const list = Array.isArray(raw) ? raw : [];
  const next = list.filter((x) => !x || x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Not found' });
  await store.setMemoLeads(next);
  res.status(204).end();
});

// ---------- 美容室専用：送付・フェーズ（ダッシュボード／メモリードは飲食側と別ストア） ----------
app.get('/api/beauty-outreach/dashboard', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(await buildBeautyOutreachDashboardMerged(store));
});

/** 送付ダッシュの PATCH 由来イベント（送信済み操作・フェーズ変更）を集計用に返す */
app.get('/api/outreach/analytics-events', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getOutreachAnalyticsEvents();
  let list = Array.isArray(raw) ? raw : [];
  const from = String(req.query.from || '').trim();
  const to = String(req.query.to || '').trim();
  const storagePool = String(req.query.storagePool || '').trim();
  const segment = String(req.query.segmentBeauty || '').trim();
  const templateId = String(req.query.templateId || '').trim();
  if (from) {
    const t0 = new Date(from).getTime();
    if (!Number.isNaN(t0)) list = list.filter((e) => e && !Number.isNaN(new Date(e.at).getTime()) && new Date(e.at).getTime() >= t0);
  }
  if (to) {
    const t1 = new Date(to).getTime();
    if (!Number.isNaN(t1)) list = list.filter((e) => e && !Number.isNaN(new Date(e.at).getTime()) && new Date(e.at).getTime() <= t1);
  }
  if (storagePool === 'beauty' || storagePool === 'main') {
    list = list.filter((e) => e && e.storagePool === storagePool);
  }
  if (segment === '1' || segment === 'true') {
    list = list.filter((e) => e && e.segmentBeauty);
  } else if (segment === '0' || segment === 'false') {
    list = list.filter((e) => e && !e.segmentBeauty);
  }
  if (templateId) {
    list = list.filter((e) => e && String(e.templateId || '') === templateId);
  }
  const includeSummary = String(req.query.includeSummary || '1') !== '0';
  const includeEvents = String(req.query.includeEvents || '1') !== '0';
  const eventOffset = Math.max(0, Number.parseInt(String(req.query.eventOffset || '0'), 10) || 0);
  const eventLimitRaw = Number.parseInt(String(req.query.eventLimit || '100'), 10) || 100;
  const eventLimit = Math.max(1, Math.min(eventLimitRaw, 500));

  const snapshotRows = await loadOutreachDashboardRowsForAnalytics(store, {
    storagePool,
    segmentBeauty: segment,
    templateId,
  });
  const rowById = new Map(snapshotRows.filter((r) => r && r.id).map((r) => [String(r.id), r]));
  const pickShopName = (row) =>
    String(row?.shopName || row?.researched?.name || row?.content?.siteName || '').trim().slice(0, 200);
  const pickAddress = (row) =>
    String(
      row?.address ||
        row?.researched?.address ||
        row?.content?.footerAddress ||
        row?.content?.address ||
        row?.content?.beautyStandaloneSalon?.address ||
        '',
    )
      .trim()
      .slice(0, 240);

  /** ページング対象（新しい順） */
  const ordered = list.slice().reverse();
  let events = [];
  if (includeEvents) {
    events = ordered.slice(eventOffset, eventOffset + eventLimit).map((e) => {
      const row = rowById.get(String(e?.itemId || '').trim());
      const shopName = String(e?.shopName || '').trim() || pickShopName(row);
      return {
        ...e,
        shopName,
        address: String(e?.address || '').trim() || pickAddress(row),
      };
    });
  }

  /** 軽量サマリ（必要時のみ） */
  let summary = null;
  let aggregates = null;
  let funnel = null;
  let areaStats = [];
  let previewOpenStats = null;
  let readReceiptStats = null;
  if (includeSummary) {
    const sends = list.filter((e) => e.type === 'message_sent').length;
    const phases = list.filter((e) => e.type === 'phase_change').length;
    aggregates = computeOutreachAnalyticsAggregates(list);
    const snapCounts = computeSnapshotPhaseCounts(snapshotRows);
    funnel = computeOutreachFunnelAndDrilldown(list, { snapCounts });
    if (Array.isArray(funnel?.sentToHearingDrilldown)) {
      funnel.sentToHearingDrilldown = funnel.sentToHearingDrilldown.map((r) => {
        const row = rowById.get(String(r?.itemId || '').trim());
        const shopName = String(r?.shopName || '').trim() || pickShopName(row);
        return {
          ...r,
          shopName,
          address: String(r?.address || '').trim() || pickAddress(row),
        };
      });
    }
    const prefFromAddr = (addr) => extractJapanesePrefecture(addr);
    const byPref = new Map();
    for (const e of list) {
      if (!e || e.type !== 'message_sent') continue;
      const row = rowById.get(String(e.itemId || '').trim());
      const pref = prefFromAddr(String(e.address || '').trim() || pickAddress(row));
      if (!pref) continue;
      if (!byPref.has(pref)) byPref.set(pref, { pref, sent: 0, hearing: 0 });
      byPref.get(pref).sent += 1;
    }
    for (const r of funnel?.sentToHearingDrilldown || []) {
      const pref = prefFromAddr(r?.address);
      if (!pref) continue;
      if (!byPref.has(pref)) byPref.set(pref, { pref, sent: 0, hearing: 0 });
      byPref.get(pref).hearing += 1;
    }
    areaStats = [...byPref.values()]
      .map((x) => {
        const denom = x.sent + x.hearing;
        return { ...x, progressPct: denom ? Math.round((10000 * x.hearing) / denom) / 100 : null };
      })
      .sort((a, b) => b.sent - a.sent || b.hearing - a.hearing || a.pref.localeCompare(b.pref, 'ja'));
    summary = { total: list.length, messageSent: sends, phaseChange: phases, returned: events.length };

    const viewMapRaw = await store.getTemplatePreviewViews();
    const viewMap =
      viewMapRaw && typeof viewMapRaw === 'object' && !Array.isArray(viewMapRaw) ? viewMapRaw : {};
    let messageSentWithLinkedPreview = 0;
    let linkedPreviewOpenedAtLeastOnce = 0;
    let totalPreviewGetsOnLinked = 0;
    let linkedPreviewOpenedAtLeastOnceExternal = 0;
    let totalPreviewGetsOnLinkedExternal = 0;
    const previewOpenDetails = [];
    for (const e of list) {
      if (!e || e.type !== 'message_sent') continue;
      const row = rowById.get(String(e.itemId || '').trim());
      const cid = String(row?.linkedTemplateCustomizationId || '').trim();
      if (!cid) continue;
      messageSentWithLinkedPreview += 1;
      const rec = viewMap[cid];
      const n = rec && typeof rec === 'object' ? Number(rec.count) || 0 : 0;
      const nExternal =
        rec && typeof rec === 'object'
          ? rec.countExternal != null
            ? Number(rec.countExternal) || 0
            : Number(rec.count) || 0
          : 0;
      if (n > 0) {
        linkedPreviewOpenedAtLeastOnce += 1;
        totalPreviewGetsOnLinked += n;
      }
      if (nExternal > 0) {
        linkedPreviewOpenedAtLeastOnceExternal += 1;
        totalPreviewGetsOnLinkedExternal += nExternal;
      }
      previewOpenDetails.push({
        itemId: String(e.itemId || ''),
        shopName: String(e.shopName || '').trim() || pickShopName(row),
        templateCustomizationId: cid,
        previewGets: n,
        previewGetsExternal: nExternal,
        opened: n > 0,
        openedExternal: nExternal > 0,
        firstAt: rec && typeof rec === 'object' ? rec.firstAt || null : null,
        lastAt: rec && typeof rec === 'object' ? rec.lastAt || null : null,
        firstExternalAt: rec && typeof rec === 'object' ? rec.firstExternalAt || null : null,
        lastExternalAt: rec && typeof rec === 'object' ? rec.lastExternalAt || null : null,
      });
    }
    previewOpenDetails.sort((a, b) => {
      const da = Number(a.previewGetsExternal) || 0;
      const db = Number(b.previewGetsExternal) || 0;
      return db - da || String(a.shopName || '').localeCompare(String(b.shopName || ''), 'ja');
    });
    previewOpenStats = {
      messageSentInFilter: sends,
      messageSentWithLinkedPreview,
      linkedPreviewOpenedAtLeastOnce,
      totalPreviewGetsOnLinked,
      linkedPreviewOpenedAtLeastOnceExternal,
      totalPreviewGetsOnLinkedExternal,
      details: previewOpenDetails,
      note:
        '「開封」は /api/template-preview/… への GET を数えます。リンクプレビュー・ボットを含みます。除外（自分）は管理者ログイン状態で開いた分のみ判定できます。',
    };

    function buildPatternReadStats(rowsForPhase, stateKey) {
      const m = new Map();
      let total = 0;
      let read = 0;
      let unread = 0;
      let unknown = 0;
      for (const row of rowsForPhase) {
        const pat = String(row?.outreachDmPattern || '').trim() || '未設定';
        if (!m.has(pat)) m.set(pat, { pattern: pat, sent: 0, read: 0, unread: 0, unknown: 0 });
        const rec = m.get(pat);
        rec.sent += 1;
        total += 1;
        const rs = String(row?.[stateKey] || '').trim();
        if (rs === 'read') {
          rec.read += 1;
          read += 1;
        } else if (rs === 'unread') {
          rec.unread += 1;
          unread += 1;
        } else {
          rec.unknown += 1;
          unknown += 1;
        }
      }
      const byPattern = [...m.values()]
        .map((x) => ({
          pattern: x.pattern,
          sent: x.sent,
          read: x.read,
          unread: x.unread,
          unknown: x.unknown,
          readRate: x.sent ? Math.round((10000 * x.read) / x.sent) / 100 : null,
        }))
        .sort((a, b) => Number(b.sent) - Number(a.sent) || String(a.pattern).localeCompare(String(b.pattern), 'ja'));
      return {
        total,
        read,
        unread,
        unknown,
        readRate: total ? Math.round((10000 * read) / total) / 100 : null,
        byPattern,
      };
    }

    const firstTargetPhases = new Set(['resend_wait', 'resend_sent', 'instagram_limited', 'lost']);
    const phaseReadSnapshot = {
      first_target: { read: 0, unread: 0, unknown: 0 },
      lost: { read: 0, unread: 0, unknown: 0 },
    };
    const firstTargetRows = [];
    const lostRows = [];
    for (const row of snapshotRows) {
      if (!row || row.status !== 'email_sent') continue;
      const ph = String(row.outreachPhase || '').trim();
      if (!firstTargetPhases.has(ph) && ph !== 'lost') continue;
      if (firstTargetPhases.has(ph)) firstTargetRows.push(row);
      if (ph === 'lost') lostRows.push(row);
      const rs1 = String(row.outreachFirstReadState || '').trim();
      if (firstTargetPhases.has(ph)) {
        if (rs1 === 'read') phaseReadSnapshot.first_target.read += 1;
        else if (rs1 === 'unread') phaseReadSnapshot.first_target.unread += 1;
        else phaseReadSnapshot.first_target.unknown += 1;
      }
      if (ph === 'lost') {
        const rs2 = String(row.outreachSecondReadState || '').trim();
        if (rs2 === 'read') phaseReadSnapshot.lost.read += 1;
        else if (rs2 === 'unread') phaseReadSnapshot.lost.unread += 1;
        else phaseReadSnapshot.lost.unknown += 1;
      }
    }
    const firstContact = buildPatternReadStats(firstTargetRows, 'outreachFirstReadState');
    const secondContact = buildPatternReadStats(lostRows, 'outreachSecondReadState');
    readReceiptStats = {
      firstContact,
      secondContact,
      phaseReadSnapshot,
      note: '既読は手動記録です。1stは送信実施後フェーズ（再送待ち/再送済み/インスタ制限中/失注）、2ndは失注での確認値をテンプレ別に集計しています。',
    };
  }

  res.json({
    filters: {
      from: from || null,
      to: to || null,
      storagePool: storagePool || null,
      segmentBeauty: segment || null,
      templateId: templateId || null,
    },
    summary,
    aggregates,
    funnel,
    areaStats,
    previewOpenStats,
    readReceiptStats,
    eventsPage: includeEvents
      ? {
          offset: eventOffset,
          limit: eventLimit,
          total: ordered.length,
          nextOffset: eventOffset + events.length < ordered.length ? eventOffset + events.length : null,
        }
      : null,
    events,
  });
});

app.get('/api/beauty-outreach/memo-leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getBeautyMemoLeads();
  res.json(Array.isArray(raw) ? raw : []);
});

app.get('/api/beauty-outreach/memo-leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getBeautyMemoLeads();
  const list = Array.isArray(raw) ? raw : [];
  const item = list.find((x) => x && x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/beauty-outreach/memo-leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const shopName = String(req.body?.shopName || '').trim().slice(0, 200);
  const memo = String(req.body?.memo || '').trim().slice(0, 12000);
  if (!shopName) return res.status(400).json({ error: '店名（shopName）が必要です' });
  const raw = await store.getBeautyMemoLeads();
  const list = [...(Array.isArray(raw) ? raw : [])];
  const now = new Date().toISOString();
  const row = {
    id: `ml-${Date.now().toString(36)}-${randomBytes(5).toString('hex')}`,
    shopName,
    memo,
    addressMapUrl: String(req.body?.addressMapUrl || '').trim().slice(0, 2000),
    instagramUrl: String(req.body?.instagramUrl || '').trim().slice(0, 2000),
    hotPepperUrl: String(req.body?.hotPepperUrl || '').trim().slice(0, 2000),
    onOutreachBoard: true,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(row);
  await store.setBeautyMemoLeads(list);
  res.status(201).json(row);
});

app.patch('/api/beauty-outreach/memo-leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getBeautyMemoLeads();
  const list = [...(Array.isArray(raw) ? raw : [])];
  const i = list.findIndex((x) => x && x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  if (req.body?.shopName !== undefined) list[i].shopName = String(req.body.shopName || '').trim().slice(0, 200);
  if (req.body?.memo !== undefined) list[i].memo = String(req.body.memo || '').trim().slice(0, 12000);
  if (req.body?.addressMapUrl !== undefined) {
    list[i].addressMapUrl = String(req.body.addressMapUrl || '').trim().slice(0, 2000);
  }
  if (req.body?.instagramUrl !== undefined) {
    list[i].instagramUrl = String(req.body.instagramUrl || '').trim().slice(0, 2000);
  }
  if (req.body?.hotPepperUrl !== undefined) {
    list[i].hotPepperUrl = String(req.body.hotPepperUrl || '').trim().slice(0, 2000);
  }
  if (req.body?.onOutreachBoard !== undefined) {
    list[i].onOutreachBoard = !!(req.body.onOutreachBoard === true || req.body.onOutreachBoard === 'true');
  }

  if (req.body?.webStrength !== undefined) {
    const ws = String(req.body.webStrength).trim();
    if (!MEMO_WEB_STRENGTH.has(ws)) {
      return res.status(400).json({ error: 'webStrength は no_site / weak_site / strong_site のいずれかです' });
    }
    const memoRow = list[i];
    const memoText = String(memoRow?.memo || '').trim();
    const isHpb = memoText.startsWith('[HPB取込]') || String(memoRow?.hpbBody || '').trim();
    if (!isHpb) {
      return res.status(400).json({ error: 'HPB取込のメモだけウェブ強度を変更できます' });
    }
    if (ws === 'strong_site') {
      const shopName = String(memoRow.shopName || '').trim().slice(0, 200) || '（無題）';
      const access =
        String(memoRow.hpbAccess || '')
          .trim()
          .slice(0, 800) || extractHpbAccessFromMemo(memoRow.memo);
      const snippet = stripHpbCouponTailFromText(
        String(memoRow.hpbBody || '').trim() || extractHpbSourceFromMemo(memoRow.memo) || memoText,
      ).slice(0, 11000);
      list.splice(i, 1);
      await store.setBeautyMemoLeads(list);
      const dash = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
      dash.unshift(
        buildStrongWebSalonDashboardRow({
          shopName,
          accessText: access,
          sourceSnippet: snippet,
        }),
      );
      await store.setBeautyDashboard(dash);
      return res.json({ ok: true, movedToDashboard: true });
    }
    memoRow.webStrength = ws === 'weak_site' ? 'weak_site' : 'no_site';
    memoRow.memo = rewriteHpbMemoFirstLine(memoRow.memo, ws);
  }

  list[i].updatedAt = new Date().toISOString();
  await store.setBeautyMemoLeads(list);
  res.json(list[i]);
});

app.delete('/api/beauty-outreach/memo-leads/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const raw = await store.getBeautyMemoLeads();
  const list = Array.isArray(raw) ? raw : [];
  const next = list.filter((x) => !x || x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Not found' });
  await store.setBeautyMemoLeads(next);
  res.status(204).end();
});

/** メモリード1件を美容ダッシュボードの正式案件にし、メモ一覧から外す（送付一覧表示オンかつ7フェーズのいずれかへ） */
app.post('/api/beauty-outreach/memo-leads/:id/promote', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = String(req.params.id || '').trim();
  const uiPhase = String(req.body?.outreachPhaseUi || '').trim();
  const allowed = new Set([
    'before_send',
    'message_sent',
    'resend_wait',
    'resend_sent',
    'instagram_limited',
    'resend_unavailable',
    'no_outreach_channel',
    'hearing',
    'proposal',
    'contracted',
    'lost',
  ]);
  if (!allowed.has(uiPhase)) {
    return res.status(400).json({ error: 'outreachPhaseUi が無効です（11フェーズのいずれかを指定してください）' });
  }
  const raw = await store.getBeautyMemoLeads();
  const list = [...(Array.isArray(raw) ? raw : [])];
  const idx = list.findIndex((x) => x && x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const memo = list[idx];
  const shopName = String(memo.shopName || '').trim().slice(0, 200);
  if (!shopName) {
    return res.status(400).json({ error: '店名が空のメモは昇格できません' });
  }
  const access =
    String(memo.hpbAccess || '')
      .trim()
      .slice(0, 800) || extractHpbAccessFromMemo(memo.memo);
  const snippet = [String(memo.memo || '').trim(), String(memo.hpbBody || '').trim()].filter(Boolean).join('\n\n').trim();
  const dashboardRow = buildBeautyMemoPromotedDashboardRow({
    shopName,
    accessText: access,
    memoSnippet: snippet,
    uiPhase,
  });
  list.splice(idx, 1);
  const dash = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
  dash.unshift(dashboardRow);
  await store.setBeautyMemoLeads(list);
  await store.setBeautyDashboard(dash);
  res.status(201).json({ ok: true, item: dashboardRow });
});

app.patch('/api/beauty-outreach/dashboard/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const t = await resolveBeautyOutreachDashboardPatchTarget(store, req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const list = t.pool === 'beauty' ? t.beauty : t.main;
  const rowBefore = JSON.parse(JSON.stringify(list[t.idx]));
  const err = patchOutreachDashboardRowFields(list[t.idx], req.body || {}, {
    randomBytes,
    canonicalizeOutreachPhaseInput,
    addMonthsIso,
  });
  if (err) return res.status(err.status).json({ error: err.error });
  if (t.pool === 'beauty') await store.setBeautyDashboard(t.beauty);
  else await store.setDashboard(t.main);
  const rowAfter = list[t.idx];
  const ev = buildOutreachAnalyticsEventsFromPatch({
    body: req.body || {},
    rowBefore,
    rowAfter,
    storagePool: t.pool,
    segmentBeauty: true,
  });
  if (ev.length) await store.appendOutreachAnalyticsEvents(ev);
  res.json(list[t.idx]);
});

app.delete('/api/beauty-outreach/dashboard/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const t = await resolveBeautyOutreachDashboardPatchTarget(store, req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const list = t.pool === 'beauty' ? t.beauty : t.main;
  const next = list.filter((d) => d.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Not found' });
  if (t.pool === 'beauty') await store.setBeautyDashboard(next);
  else await store.setDashboard(next);
  res.status(204).end();
});

app.post('/api/beauty-outreach/dashboard/:id/duplicate', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const t = await resolveBeautyOutreachDashboardPatchTarget(store, req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const list = t.pool === 'beauty' ? t.beauty : t.main;
  const src = list[t.idx];
  const label = String(req.body?.personalizationLabel || '')
    .trim()
    .slice(0, 120);
  const newItem = JSON.parse(JSON.stringify(src));
  newItem.id = `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  newItem.createdAt = new Date().toISOString();
  newItem.status = 'pending';
  newItem.personalizationLabel = label || undefined;
  newItem.viewCount = 0;
  newItem.unsubscribeToken = randomBytes(24).toString('hex');
  newItem.outreachPhase = undefined;
  newItem.outreachPhaseChangedAt = undefined;
  newItem.sleepUntil = undefined;
  newItem.optOutFeedback = undefined;
  newItem.optedOutAt = undefined;
  newItem.outreachLostAt = undefined;
  newItem.outreachFirstReadState = undefined;
  newItem.outreachFirstReadCheckedAt = undefined;
  newItem.outreachSecondReadState = undefined;
  newItem.outreachSecondReadCheckedAt = undefined;
  delete newItem.linkedTemplateCustomizationId;
  list.unshift(newItem);
  if (t.pool === 'beauty') await store.setBeautyDashboard(t.beauty);
  else await store.setDashboard(t.main);
  res.status(201).json(newItem);
});

app.post('/api/beauty-outreach/dashboard/:id/approve', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const t = await resolveBeautyOutreachDashboardPatchTarget(store, req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const list = t.pool === 'beauty' ? t.beauty : t.main;
  const row = list[t.idx];
  row.status = 'approved';
  if (!row.unsubscribeToken) row.unsubscribeToken = randomBytes(24).toString('hex');
  if (!row.outreachPhase) row.outreachPhase = 'pre_contact';
  row.outreachPhaseChangedAt = new Date().toISOString();
  row.outreachLostAt = undefined;
  row.outreachFirstReadState = undefined;
  row.outreachFirstReadCheckedAt = undefined;
  row.outreachSecondReadState = undefined;
  row.outreachSecondReadCheckedAt = undefined;
  if (t.pool === 'beauty') await store.setBeautyDashboard(t.beauty);
  else await store.setDashboard(t.main);
  res.json(row);
});

app.post('/api/beauty-outreach/dashboard/:id/reject', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const t = await resolveBeautyOutreachDashboardPatchTarget(store, req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const list = t.pool === 'beauty' ? t.beauty : t.main;
  list[t.idx].status = 'rejected';
  list[t.idx].outreachPhaseChangedAt = new Date().toISOString();
  list[t.idx].outreachLostAt = new Date().toISOString();
  if (!list[t.idx].outreachSecondReadState) {
    list[t.idx].outreachSecondReadState = 'unknown';
    list[t.idx].outreachSecondReadCheckedAt = undefined;
  }
  if (t.pool === 'beauty') await store.setBeautyDashboard(t.beauty);
  else await store.setDashboard(t.main);
  res.json(list[t.idx]);
});

app.patch('/api/dashboard/:id', async (req, res) => {
  const dashboard = [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  const customs = await store.getTemplateCustomizations();
  const rowBefore = JSON.parse(JSON.stringify(dashboard[i]));
  const err = patchOutreachDashboardRowFields(dashboard[i], req.body || {}, {
    randomBytes,
    canonicalizeOutreachPhaseInput,
    addMonthsIso,
  });
  if (err) return res.status(err.status).json({ error: err.error });
  await store.setDashboard(dashboard);
  const rowAfter = dashboard[i];
  const ev = buildOutreachAnalyticsEventsFromPatch({
    body: req.body || {},
    rowBefore,
    rowAfter,
    storagePool: 'main',
    segmentBeauty: dashboardItemIsBeauty(rowAfter, customs),
  });
  if (ev.length) await store.appendOutreachAnalyticsEvents(ev);
  res.json(dashboard[i]);
});

/** 案件を一覧から削除（取り消し不可） */
app.delete('/api/dashboard/:id', async (req, res) => {
  const dashboard = await store.getDashboard();
  const next = dashboard.filter((d) => d.id !== req.params.id);
  if (next.length === dashboard.length) return res.status(404).json({ error: 'Not found' });
  await store.setDashboard(next);
  res.status(204).end();
});

/** 案件を複製（個別向け調整用）。元の案件はそのまま。 */
app.post('/api/dashboard/:id/duplicate', async (req, res) => {
  const dashboard = await store.getDashboard();
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  const src = dashboard[i];
  const label = String(req.body?.personalizationLabel || '')
    .trim()
    .slice(0, 120);
  const newItem = JSON.parse(JSON.stringify(src));
  newItem.id = `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  newItem.createdAt = new Date().toISOString();
  newItem.status = 'pending';
  newItem.personalizationLabel = label || undefined;
  newItem.viewCount = 0;
  newItem.unsubscribeToken = randomBytes(24).toString('hex');
  newItem.outreachPhase = undefined;
  newItem.outreachPhaseChangedAt = undefined;
  newItem.sleepUntil = undefined;
  newItem.optOutFeedback = undefined;
  newItem.optedOutAt = undefined;
  newItem.outreachLostAt = undefined;
  newItem.outreachFirstReadState = undefined;
  newItem.outreachFirstReadCheckedAt = undefined;
  newItem.outreachSecondReadState = undefined;
  newItem.outreachSecondReadCheckedAt = undefined;
  delete newItem.linkedTemplateCustomizationId;
  dashboard.unshift(newItem);
  await store.setDashboard(dashboard);
  res.status(201).json(newItem);
});

/** 店主向け：案内メールの配信停止（トークン照合・フェーズを失注に） */
app.post('/api/outreach/opt-out', async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const feedback = String(req.body?.feedback || '').trim().slice(0, 2000);
    if (!token) return res.status(400).json({ error: 'トークンが必要です。' });
    const main = [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
    const beauty = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
    let idx = main.findIndex((d) => d.unsubscribeToken === token);
    let pool = 'main';
    if (idx < 0) {
      idx = beauty.findIndex((d) => d.unsubscribeToken === token);
      pool = 'beauty';
    }
    if (idx < 0) return res.status(404).json({ error: 'リンクが無効か、すでに処理済みです。' });
    const row = pool === 'main' ? main[idx] : beauty[idx];
    if (!['approved', 'email_sent'].includes(row.status)) {
      return res.status(400).json({ error: 'このリンクは現在ご利用いただけません。' });
    }
    row.status = 'email_sent';
    row.outreachPhase = 'resend_unavailable';
    row.outreachPhaseChangedAt = new Date().toISOString();
    row.sleepUntil = undefined;
    row.outreachLostAt = undefined;
    row.optOutFeedback = feedback || undefined;
    row.optedOutAt = new Date().toISOString();
    if (pool === 'main') await store.setDashboard(main);
    else await store.setBeautyDashboard(beauty);
    res.json({ ok: true });
  } catch (e) {
    console.error('[outreach/opt-out]', e);
    res.status(500).json({ error: '処理に失敗しました。時間をおいて再度お試しください。' });
  }
});

function tickBackfillOutreachLostAt(row) {
  if (row.optedOutAt) return false;
  const isLost = row.status === 'rejected' || (row.status === 'email_sent' && row.outreachPhase === 'lost');
  if (!isLost || row.outreachLostAt) return false;
  row.outreachLostAt = row.updatedAt || row.createdAt || new Date().toISOString();
  return true;
}

function tickBackfillOutreachPhaseChangedAt(row) {
  if (row.outreachPhaseChangedAt) return false;
  const ph = String(row.outreachPhase || '').trim();
  if (!ph) return false;
  if (row.status !== 'email_sent' && row.status !== 'approved') return false;
  row.outreachPhaseChangedAt = row.updatedAt || row.createdAt || new Date().toISOString();
  return true;
}

function tickBackfillOutreachReadState(row) {
  if (row.status !== 'email_sent') return false;
  const ph = String(row.outreachPhase || '').trim();
  if (!['message_sent', 'resend_wait', 'resend_sent', 'instagram_limited', 'lost'].includes(ph)) {
    return false;
  }
  let changed = false;
  if (['message_sent', 'resend_wait', 'resend_sent', 'instagram_limited'].includes(ph) && !row.outreachFirstReadState) {
    row.outreachFirstReadState = 'unknown';
    row.outreachFirstReadCheckedAt = undefined;
    changed = true;
  }
  if (ph === 'lost' && !row.outreachSecondReadState) {
    row.outreachSecondReadState = 'unknown';
    row.outreachSecondReadCheckedAt = undefined;
    changed = true;
  }
  return changed;
}

/**
 * 失注から3か月経過 → 送信前（approved / pre_contact）へ戻す（再アプローチ用）。
 * 配信停止済み（optedOutAt あり）は除外。
 */
function tickMaybeResetLostToPreSend(row) {
  if (row.optedOutAt) return false;
  const isLost = row.status === 'rejected' || (row.status === 'email_sent' && row.outreachPhase === 'lost');
  if (!isLost || !row.outreachLostAt) return false;
  const deadline = addMonthsIso(row.outreachLostAt, 3);
  if (new Date(deadline).getTime() > Date.now()) return false;
  row.status = 'approved';
  row.outreachPhase = 'pre_contact';
  row.outreachPhaseChangedAt = new Date().toISOString();
  row.replyWaitStartedAt = undefined;
  row.sleepUntil = undefined;
  row.outreachLostAt = undefined;
  if (!row.unsubscribeToken) row.unsubscribeToken = randomBytes(24).toString('hex');
  return true;
}

function tickMaybePromoteMessageSentToResendWait(row) {
  if (row.optedOutAt) return false;
  if (row.status !== 'email_sent') return false;
  if (String(row.outreachPhase || '') !== 'message_sent') return false;
  const baseAt = row.outreachPhaseChangedAt || row.updatedAt || row.createdAt;
  if (!baseAt) return false;
  const deadline = addDaysIso(baseAt, 5);
  if (new Date(deadline).getTime() > Date.now()) return false;
  row.outreachPhase = 'resend_wait';
  row.outreachPhaseChangedAt = new Date().toISOString();
  return true;
}

function tickMaybeMoveResendSentToLost(row) {
  if (row.optedOutAt) return false;
  if (row.status !== 'email_sent') return false;
  if (String(row.outreachPhase || '') !== 'resend_sent') return false;
  const baseAt = row.outreachPhaseChangedAt || row.updatedAt || row.createdAt;
  if (!baseAt) return false;
  const deadline = addDaysIso(baseAt, 7);
  if (new Date(deadline).getTime() > Date.now()) return false;
  row.outreachPhase = 'lost';
  row.outreachPhaseChangedAt = new Date().toISOString();
  row.outreachLostAt = new Date().toISOString();
  return true;
}

function tickMaybeMoveInstagramLimitedToLost(row) {
  if (row.optedOutAt) return false;
  if (row.status !== 'email_sent') return false;
  if (String(row.outreachPhase || '') !== 'instagram_limited') return false;
  const baseAt = row.outreachPhaseChangedAt || row.updatedAt || row.createdAt;
  if (!baseAt) return false;
  const deadline = addDaysIso(baseAt, 7);
  if (new Date(deadline).getTime() > Date.now()) return false;
  row.outreachPhase = 'lost';
  row.outreachPhaseChangedAt = new Date().toISOString();
  row.outreachLostAt = new Date().toISOString();
  return true;
}

/**
 * 提案中でフォロー開始から3か月経過 → 自動で送信済み（再アプローチ用）
 * 送信済みから5日経過 → 再送待ち
 * 再送済み/インスタ制限中から7日間フェーズ変更なし → 失注
 * 失注（却下 or 送信済み＋lost）から3か月経過 → 送信前へ戻す
 * Vercel Cron 等から 1 日 1 回 GET。CRON_SECRET があるときは ?secret= または x-cron-secret
 */
app.get('/api/outreach/phase-tick', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const ok = req.headers['x-cron-secret'] === secret || String(req.query?.secret || '') === secret;
    if (!ok) return res.status(401).type('text/plain').send('Unauthorized');
  }
  try {
    const main = [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
    const beauty = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
    let bumped = 0;
    let resendWaitAuto = 0;
    let lostFromResendAuto = 0;
    let lostFromInstagramLimitAuto = 0;
    let lostReset = 0;
    let changed = false;
    const bumpList = (arr) => {
      for (const row of arr) {
        const ph = row.outreachPhase;
        const inProposalWait = ph === 'proposal' || ph === 'awaiting_reply';
        if (inProposalWait && row.replyWaitStartedAt) {
          const deadline = addMonthsIso(row.replyWaitStartedAt, 3);
          if (new Date(deadline).getTime() <= Date.now()) {
            row.outreachPhase = 'message_sent';
            row.outreachPhaseChangedAt = new Date().toISOString();
            row.replyWaitStartedAt = undefined;
            bumped += 1;
            changed = true;
          }
        }
        if (tickBackfillOutreachLostAt(row)) changed = true;
        if (tickBackfillOutreachPhaseChangedAt(row)) changed = true;
        if (tickBackfillOutreachReadState(row)) changed = true;
        if (tickMaybePromoteMessageSentToResendWait(row)) {
          resendWaitAuto += 1;
          changed = true;
        }
        if (tickMaybeMoveResendSentToLost(row)) {
          lostFromResendAuto += 1;
          changed = true;
        }
        if (tickMaybeMoveInstagramLimitedToLost(row)) {
          lostFromInstagramLimitAuto += 1;
          changed = true;
        }
        if (tickMaybeResetLostToPreSend(row)) {
          lostReset += 1;
          changed = true;
        }
      }
    };
    bumpList(main);
    bumpList(beauty);
    if (changed) {
      await store.setDashboard(main);
      await store.setBeautyDashboard(beauty);
    }
    res.json({ ok: true, bumped, resendWaitAuto, lostFromResendAuto, lostFromInstagramLimitAuto, lostReset });
  } catch (e) {
    console.error('[outreach/phase-tick]', e);
    res.status(500).json({ error: e?.message || 'tick failed' });
  }
});

app.post('/api/dashboard/:id/approve', async (req, res) => {
  const dashboard = await store.getDashboard();
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  dashboard[i].status = 'approved';
  if (!dashboard[i].unsubscribeToken) dashboard[i].unsubscribeToken = randomBytes(24).toString('hex');
  if (!dashboard[i].outreachPhase) dashboard[i].outreachPhase = 'pre_contact';
  dashboard[i].outreachPhaseChangedAt = new Date().toISOString();
  dashboard[i].outreachLostAt = undefined;
  dashboard[i].outreachFirstReadState = undefined;
  dashboard[i].outreachFirstReadCheckedAt = undefined;
  dashboard[i].outreachSecondReadState = undefined;
  dashboard[i].outreachSecondReadCheckedAt = undefined;
  await store.setDashboard(dashboard);
  res.json(dashboard[i]);
});

app.post('/api/dashboard/:id/reject', async (req, res) => {
  const dashboard = await store.getDashboard();
  const i = dashboard.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  dashboard[i].status = 'rejected';
  dashboard[i].outreachPhaseChangedAt = new Date().toISOString();
  dashboard[i].outreachLostAt = new Date().toISOString();
  if (!dashboard[i].outreachSecondReadState) {
    dashboard[i].outreachSecondReadState = 'unknown';
    dashboard[i].outreachSecondReadCheckedAt = undefined;
  }
  await store.setDashboard(dashboard);
  res.json(dashboard[i]);
});

app.get('/api/booking/availability/:itemId', async (req, res) => {
  try {
    const billing = await store.getBilling();
    if (!bookingBillingEnabled(billing)) {
      return res.status(403).json({ error: '予約システムが有効ではありません。オプション契約後にご利用いただけます。' });
    }
    const hit = await findDashboardRowInAnyStoreByItemId(req.params.itemId);
    if (!hit) return res.status(404).json({ error: 'not found' });
    const item = hit.list[hit.idx];
    const booked = new Set(item.bookingSlots || []);
    const dates = upcomingDateKeys(14);
    const times = getBookingTimeLabels();
    const schedule = dates.map((dateKey) => ({
      date: dateKey,
      slots: times.map((t) => {
        const key = slotKey(dateKey, t);
        const past = isSlotPastJst(dateKey, t);
        const taken = booked.has(key);
        const available = !past && !taken;
        return { time: t, available, symbol: available ? '○' : '×' };
      }),
    }));
    res.json({ schedule });
  } catch (e) {
    console.error('[booking-availability]', e);
    res.status(500).json({ error: '取得に失敗しました' });
  }
});

app.post('/api/booking/:itemId', async (req, res) => {
  try {
    const ip = clientIp(req);
    if (!allowBookingPost(ip)) {
      return res.status(429).json({ error: 'しばらく時間をおいて再度お試しください。' });
    }
    const billing = await store.getBilling();
    if (!bookingBillingEnabled(billing)) {
      return res.status(403).json({ error: '予約システムが有効ではありません。' });
    }
    const body = req.body || {};
    const customerName = String(body.customerName || '').trim();
    if (!customerName) return res.status(400).json({ error: 'お名前を入力してください。' });
    const dateKey = String(body.dateKey || '').trim();
    const time = String(body.time || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return res.status(400).json({ error: '日付が不正です。' });
    }
    const labels = getBookingTimeLabels();
    if (!labels.includes(time)) return res.status(400).json({ error: '時間が不正です。' });
    if (isSlotPastJst(dateKey, time)) {
      return res.status(400).json({ error: 'この枠は選択できません。' });
    }
    const hit = await findDashboardRowInAnyStoreByItemId(req.params.itemId);
    if (!hit) return res.status(404).json({ error: 'not found' });
    const dashboard = hit.list;
    const idx = hit.idx;
    const item = dashboard[idx];
    const sk = slotKey(dateKey, time);
    const slots = [...(item.bookingSlots || [])];
    if (slots.includes(sk)) return res.status(409).json({ error: 'この枠は既に埋まりました。別の時間をお選びください。' });
    slots.push(sk);
    item.bookingSlots = slots;
    dashboard[idx] = item;
    await persistDashboardPoolHit(hit);

    const site = String(item.content?.siteName || item.researched?.name || 'Web予約').trim();
    const customerEmail = String(body.customerEmail || '').trim();
    const customerPhone = String(body.customerPhone || '').trim();
    const note = String(body.note || '').trim();
    const calUrl = googleCalendarTemplateUrl({
      title: `[${site}] ${customerName}様`,
      description: `予約者: ${customerName}\nメール: ${customerEmail || '-'}\n電話: ${customerPhone || '-'}\nメモ: ${note || '-'}\n`,
      dateKey,
      startTime: time,
      durationMin: BOOKING_SLOT_DURATION_MIN,
    });

    const adminTo = getBookingAdminEmail(item);
    const text = `新しい予約が入りました。

サイト: ${site}
日時: ${dateKey} ${time} 〜（約${BOOKING_SLOT_DURATION_MIN}分）
お名前: ${customerName}
メール: ${customerEmail || '-'}
電話: ${customerPhone || '-'}
ご要望: ${note || '-'}

▼ Googleカレンダーに追加（リンクをタップ）
${calUrl}
`;

    await sendBookingNotification({
      to: adminTo,
      subject: `【予約】${site} ${dateKey} ${time} ${customerName}様`,
      text,
      html: `<p>新しい予約が入りました。</p>
<ul>
<li>サイト: <strong>${escHtmlBooking(site)}</strong></li>
<li>日時: <strong>${escHtmlBooking(dateKey)} ${escHtmlBooking(time)}</strong>（約${BOOKING_SLOT_DURATION_MIN}分）</li>
<li>お名前: ${escHtmlBooking(customerName)}</li>
<li>メール: ${escHtmlBooking(customerEmail || '-')}</li>
<li>電話: ${escHtmlBooking(customerPhone || '-')}</li>
<li>ご要望: ${escHtmlBooking(note || '-')}</li>
</ul>
<p><a href="${escHtmlBooking(calUrl)}">Googleカレンダーに追加</a></p>`,
    });

    res.json({ ok: true, calendarUrl: calUrl });
  } catch (e) {
    console.error('[booking-post]', e);
    res.status(500).json({ error: '送信に失敗しました' });
  }
});

/** 共有用プレビュー: 案件IDでHTMLを返す。スマホ等別端末で同じURLを開ける。Stripe 有効時はメニューに「購入」を追加。閲覧時に viewCount を加算。 */
app.get('/api/preview/:id', async (req, res) => {
  try {
    const hit = await findDashboardRowInAnyStoreByItemId(req.params.id);
    if (!hit) return res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Not found');
    const item = hit.list[hit.idx];
    item.viewCount = (item.viewCount || 0) + 1;
    await persistDashboardPoolHit(hit);
    const options = await store.getOptions();
    const billing = await store.getBilling();
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
    if (bookingBillingEnabled(billing) && origin) {
      genOptions.bookingEnabled = true;
      genOptions.bookingItemId = item.id;
      genOptions.bookingApiOrigin = origin;
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
// ---------- LP コンテンツ（siteKey＝店舗。認証は DB または旧テンプレ用 env） ----------

/** 公開: 納品用テンプレ一覧（購入者ウィザード・営業・ヒアリングの正） */
app.get('/api/product-lp-templates', (req, res) => {
  res.json({ templates: getProductLpTemplatesList() });
});

/**
 * 店舗の初回作成（標準テンプレのみ clone 可）。
 * 管理者ログイン **または** `Authorization: Bearer <STORE_SETUP_PROVISION_TOKEN>`（決済後メール等で付与）
 */
app.post('/api/store-setup/provision', async (req, res) => {
  if (!authorizeAdminOrProvisionToken(req)) {
    return res.status(401).json({
      error:
        '管理者ログインが必要です。または環境変数 STORE_SETUP_PROVISION_TOKEN を設定し、Authorization: Bearer で渡してください。',
    });
  }
  try {
    const out = await runLpCmsProvision(
      store,
      getLpContentDefault,
      LP_CMS_TEMPLATE_SLUGS,
      req.body,
      getProductLpTemplateSlugSet()
    );
    const meta = getProductLpTemplatesList().find((t) => t.slug === String(req.body?.cloneFrom || '').trim());
    res.json({
      ...out,
      purchaserEditorUrl: meta
        ? `${meta.purchaserEditorPath}?${meta.purchaserEditorQuery || 'site'}=${encodeURIComponent(out.siteKey)}`
        : null,
      publicSiteUrl: meta
        ? `${meta.liveDemoPath}?${meta.purchaserEditorQuery || 'site'}=${encodeURIComponent(out.siteKey)}`
        : null,
    });
  } catch (e) {
    const code = e.statusCode && Number(e.statusCode) >= 400 && Number(e.statusCode) < 500 ? e.statusCode : 500;
    console.error('[store-setup/provision]', e);
    res.status(code).json({ error: e?.message || 'failed' });
  }
});

/** 運営のみ: 店舗ごとの CMS ユーザー作成＋初回LP本文クローン（レガシー含む全 LP_CMS スラッグ可・緊急用） */
app.post('/api/admin/lp-cms-provision', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const out = await runLpCmsProvision(
      store,
      getLpContentDefault,
      LP_CMS_TEMPLATE_SLUGS,
      req.body,
      null
    );
    res.json(out);
  } catch (e) {
    const code = e.statusCode && Number(e.statusCode) >= 400 && Number(e.statusCode) < 500 ? e.statusCode : 500;
    console.error('[lp-cms-provision]', e);
    res.status(code).json({ error: e?.message || 'failed' });
  }
});

app.get('/api/lp-cms/:slug/status', async (req, res) => {
  const siteKey = req.params.slug;
  if (!isValidLpSiteKeyFormat(siteKey)) return res.status(404).json({ error: 'Not found' });
  if (!(await isLpSiteKeyRegistered(siteKey))) return res.status(404).json({ error: 'Not found' });
  const hasStoreAccount = !!(await store.getLpCmsAccount(siteKey));
  const legacyOn = lpCmsLegacyEnvAuthEnabledForSlug(siteKey);
  const adminOn = adminAuthEnabled();
  let mode = 'none';
  let lpConfigured = false;
  if (hasStoreAccount) {
    mode = 'lp_cms';
    lpConfigured = true;
  } else if (legacyOn) {
    mode = 'lp_cms';
    lpConfigured = true;
  } else if (adminOn) mode = 'global_admin';
  let authenticated = false;
  if (mode === 'lp_cms') authenticated = await isLpCmsAuthenticatedReq(req, siteKey);
  else if (mode === 'global_admin') authenticated = isAdminAuthenticated(req);
  else authenticated = true;
  res.json({
    mode,
    authenticated,
    lpConfigured,
    storeAccount: hasStoreAccount,
    legacyEnv: legacyOn,
  });
});

app.post('/api/lp-cms/:slug/login', async (req, res) => {
  const siteKey = req.params.slug;
  if (!isValidLpSiteKeyFormat(siteKey)) return res.status(400).json({ error: 'Invalid site key' });
  const username = String(req.body?.username || '');
  const password = String(req.body?.password || '');
  const acc = await store.getLpCmsAccount(siteKey);
  const secure = !!(req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https');
  const name = lpCmsCookieName(siteKey);

  if (acc) {
    if (username !== acc.username || !verifyPasswordScrypt(password, acc.passwordSalt, acc.passwordHash)) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが違います。' });
    }
    const val = encodeURIComponent(lpCmsSessionCookieValue(siteKey, acc.username, acc.passwordHash));
    res.setHeader(
      'Set-Cookie',
      `${name}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure ? '; Secure' : ''}`
    );
    return res.json({ ok: true, authKind: 'store' });
  }

  if (lpCmsLegacyEnvAuthEnabledForSlug(siteKey)) {
    const ok =
      username === process.env.JP_HISTORY_LP_CMS_USER && password === process.env.JP_HISTORY_LP_CMS_PASSWORD;
    if (!ok) return res.status(401).json({ error: 'ユーザー名またはパスワードが違います。' });
    const val = encodeURIComponent(lpCmsCookieValueLegacy(siteKey));
    res.setHeader(
      'Set-Cookie',
      `${name}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure ? '; Secure' : ''}`
    );
    return res.json({ ok: true, authKind: 'legacy' });
  }

  return res.status(404).json({
    error:
      'このサイトキー用のアカウントがありません。運営に店舗作成（POST /api/admin/lp-cms-provision）を依頼するか、旧テンプレ向けに JP_HISTORY_LP_CMS_USER / PASSWORD を設定してください。',
  });
});

app.post('/api/lp-cms/:slug/logout', (req, res) => {
  const siteKey = req.params.slug;
  if (!isValidLpSiteKeyFormat(siteKey)) return res.status(400).json({ error: 'Invalid site key' });
  const secure = !!(req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https');
  const name = lpCmsCookieName(siteKey);
  res.setHeader(
    'Set-Cookie',
    `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
  );
  res.json({ ok: true });
});

app.get('/api/lp-content/:slug', async (req, res) => {
  const siteKey = req.params.slug;
  if (!isValidLpSiteKeyFormat(siteKey)) return res.status(404).json({ error: 'Not found' });
  if (!(await isLpSiteKeyRegistered(siteKey))) return res.status(404).json({ error: 'Not found' });
  let content = await store.getLpContent(siteKey);
  if (!content) content = getLpContentDefault(siteKey);
  res.json(content || {});
});

app.put('/api/lp-content/:slug', async (req, res) => {
  const siteKey = req.params.slug;
  if (!(await requireLpContentWriteAsync(req, res, siteKey))) return;
  const content = req.body;
  if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Invalid content' });
  await store.setLpContent(siteKey, content);
  res.json({ ok: true });
});

/** 納品LPの閲覧計測（登録済み siteKey のみ） */
app.post('/api/lp-analytics/:slug/view', async (req, res) => {
  const siteKey = req.params.slug;
  if (!isValidLpSiteKeyFormat(siteKey)) return res.status(404).json({ error: 'Not found' });
  if (!(await isLpSiteKeyRegistered(siteKey))) return res.status(404).json({ error: 'Not found' });
  try {
    const viewCount = await store.incrementLpView(siteKey);
    res.json({ ok: true, viewCount });
  } catch (e) {
    console.error('[lp-analytics view]', e);
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

/** 閲覧数の参照 */
app.get('/api/lp-analytics/:slug', async (req, res) => {
  const siteKey = req.params.slug;
  if (!(await requireLpStatsReadAsync(req, res, siteKey))) return;
  try {
    const stats = await store.getLpViewStats(siteKey);
    res.json(stats);
  } catch (e) {
    console.error('[lp-analytics get]', e);
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

// ---------- 営業代行: ログイン・プレビュー・Places プロキシ ----------
app.post('/api/sales/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const out = await salesLogin(email, password);
    if (!out.ok) return res.status(401).json({ error: out.error });
    const secure = !!(req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https');
    const val = encodeURIComponent(salesRepCookieValue(out.repId));
    res.setHeader(
      'Set-Cookie',
      `${SALES_REP_COOKIE}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure ? '; Secure' : ''}`
    );
    res.json({ ok: true, rep: out.rep });
  } catch (e) {
    console.error('[sales login]', e);
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/sales/auth/logout', (req, res) => {
  const secure = !!(req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https');
  res.setHeader(
    'Set-Cookie',
    `${SALES_REP_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
  );
  res.json({ ok: true });
});

app.get('/api/sales/auth/me', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  const summary = await getSalesApiUsageSummary(rep.id, 100);
  res.json({ rep, apiUsage: summary });
});

app.post('/api/sales/parse-maps-url', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  const url = String(req.body?.url || '').trim();
  const { placeId } = await parseMapsUrlForSales(url);
  res.json({ placeId });
});

app.post('/api/sales/places/autocomplete', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  try {
    const input = String(req.body?.input || '').trim();
    const out = await salesPlacesAutocomplete(rep.id, input);
    res.json(out);
  } catch (e) {
    console.error('[sales autocomplete]', e);
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/sales/places/details', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  try {
    const placeId = String(req.body?.placeId || '').trim();
    const out = await salesPlacesDetails(rep.id, placeId, null);
    res.json({ result: out.result, fromCache: out.fromCache });
  } catch (e) {
    console.error('[sales details]', e);
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/sales/preview-sessions', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  try {
    const templateSlug = String(req.body?.templateSlug || 'gym-valx-intro').trim();
    let placeId = String(req.body?.placeId || '').trim();
    const mapsUrl = String(req.body?.mapsUrl || '').trim();
    if (!placeId && mapsUrl) {
      const parsed = await parseMapsUrlForSales(mapsUrl);
      placeId = parsed.placeId || '';
    }
    if (!placeId) {
      return res.status(400).json({ error: 'place_id または解析可能な Google マップURLが必要です。' });
    }
    const checkoutApiOrigin = resolveSalesCheckoutApiOrigin(req);
    const { publicId, previewUrl, applyUrl, previewPageUrl } = await createSalesPreviewSession(rep.id, {
      templateSlug,
      placeId,
      checkoutApiOrigin,
      buildPreviewPageUrl: (pid) => resolveSalesPreviewPageUrl(req, pid),
    });
    res.json({ publicId, previewUrl: previewUrl || previewPageUrl, applyUrl });
  } catch (e) {
    console.error('[sales preview-sessions]', e);
    res.status(500).json({ error: e?.message || 'failed' });
  }
});

app.get('/api/sales/preview-sessions', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  const list = await listSalesPreviewSessionsForRep(rep.id);
  res.json({ sessions: list });
});

app.get('/api/sales/preview-sessions/:publicId/qr.png', async (req, res) => {
  const rep = await requireSalesRep(req, res);
  if (!rep) return;
  const pid = String(req.params.publicId || '');
  if (!isValidSalesPreviewPublicId(pid)) return res.status(400).send('bad id');
  const sess = await getSalesPreviewSession(pid);
  if (!sess || sess.repId !== rep.id) return res.status(404).send('not found');
  const url = resolveSalesPreviewPageUrl(req, pid);
  try {
    const buf = await QRCode.toBuffer(url, { type: 'png', width: 320, margin: 2 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(buf);
  } catch (e) {
    console.error('[sales qr]', e);
    res.status(500).send('error');
  }
});

/** プレビューLPの JSON（認証なし・IDがバレれば閲覧可） */
app.get('/api/sales/preview-lp-content/:publicId', async (req, res) => {
  const pid = String(req.params.publicId || '');
  if (!isValidSalesPreviewPublicId(pid)) return res.status(404).json({ error: 'Not found' });
  const snap = await getSalesPreviewSnapshot(pid);
  if (!snap) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Cache-Control', 'private, max-age=0');
  res.json(snap);
});

app.post('/api/sales/preview-public/:publicId/view', async (req, res) => {
  const pid = String(req.params.publicId || '');
  if (!isValidSalesPreviewPublicId(pid)) return res.status(404).json({ error: 'Not found' });
  await recordSalesPreviewView(pid);
  res.json({ ok: true });
});

app.post('/api/admin/sales-seed-rep', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { orgName, repEmail, repPassword, repDisplayName } = req.body || {};
    await adminSeedSalesRep({ orgName, repEmail, repPassword, repDisplayName });
    res.json({ ok: true });
  } catch (e) {
    console.error('[sales-seed]', e);
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/admin/sales-publish-preview', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const publicId = String(req.body?.publicId || '').trim();
    const siteKey = String(req.body?.siteKey || '').trim();
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const cloneFrom = String(req.body?.cloneFrom || 'gym-valx-intro').trim();
    if (!LP_CMS_TEMPLATE_SLUGS.has(cloneFrom)) {
      return res.status(400).json({ error: 'cloneFrom が不正です。' });
    }
    const out = await publishSalesPreviewToProduction({ publicId, siteKey, username, password, cloneFrom });
    res.json(out);
  } catch (e) {
    console.error('[sales-publish]', e);
    res.status(400).json({ error: e?.message || 'failed' });
  }
});

app.post('/api/admin/sales-preview-mark-paid', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const publicId = String(req.body?.publicId || '').trim();
  if (!isValidSalesPreviewPublicId(publicId)) {
    return res.status(400).json({ error: 'publicId が不正です。' });
  }
  const ok = await markSalesPreviewPaid(publicId);
  if (!ok) return res.status(404).json({ error: 'セッションが見つかりません。' });
  res.json({ ok: true });
});

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
  const salesPreviewPublicId = String(req.query.salesPreviewPublicId || '').trim();
  const stripeMeta = {};
  if (isValidSalesPreviewPublicId(salesPreviewPublicId)) {
    stripeMeta.sales_preview_public_id = salesPreviewPublicId;
    try {
      const sess = await getSalesPreviewSession(salesPreviewPublicId);
      if (sess?.repId) stripeMeta.sales_rep_id = String(sess.repId);
      if (sess?.orgId) stripeMeta.sales_org_id = String(sess.orgId);
    } catch {
      /* ignore */
    }
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
    const { url } = await createCheckoutSession(amountYen, items, successUrl, returnUrl, billing, stripeMeta);
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
