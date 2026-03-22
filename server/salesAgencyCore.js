import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPasswordScrypt, verifyPasswordScrypt, getLpCmsSessionSecret, isValidLpSiteKeyFormat } from './lpCmsCrypto.js';
import { placesAutocomplete, placesDetails, photoUrlsFromDetails } from './salesPlaces.js';
import { extractPlaceIdFromGoogleMapsUrl } from './mapsUrlParser.js';
import { store } from './data/store.js';
import { isProductLpTemplateSlug } from './productLpTemplates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_USAGE_CAP = 8000;
const PLACE_CACHE_TTL_MS = 7 * 24 * 3600 * 1000;
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function getSalesSessionSecret() {
  return String(process.env.SALES_REP_SESSION_SECRET || getLpCmsSessionSecret());
}

export function isValidSalesPreviewPublicId(id) {
  return /^pv[a-f0-9]{24}$/.test(String(id || ''));
}

function newId(prefix) {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}

function newPublicId() {
  return `pv${randomBytes(12).toString('hex')}`;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readLpDefault(slug) {
  try {
    const p = path.join(__dirname, 'data', 'json', 'lpContent.json');
    if (!fs.existsSync(p)) return null;
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    return raw[slug] ?? null;
  } catch {
    return null;
  }
}

function deepClone(o) {
  return o ? JSON.parse(JSON.stringify(o)) : null;
}

function mergePlaceIntoGymSnapshot(place, photoUrls) {
  const base = deepClone(readLpDefault('gym-valx-intro')) || {};
  const name = place?.name || '店舗名（プレビュー）';
  const addr = (place?.formatted_address || '住所は公開前にご確認ください').replace(/\n/g, '<br />');
  const heroUrl = photoUrls[0] || base.hero?.bgUrl;
  const introUrl = photoUrls[1] || photoUrls[0] || base.intro?.bgUrl;

  base.page = base.page || {};
  base.page.title = `${esc(name)} | プレビュー`;
  base.page.description = `${esc(name)} のプレビューページです。Google の情報を下書きとして表示しています。`;

  base.header = base.header || {};
  base.header.line1 = name.slice(0, 12);
  base.header.line2 = 'PREVIEW';

  base.hero = base.hero || {};
  if (heroUrl) base.hero.bgUrl = heroUrl;
  base.hero.nameHtml = `<span class="border-b-2 border-neon pb-0.5">${esc(name)}</span>`;
  base.hero.tagline = 'プレビュー · 掲載前の下書きです';
  base.hero.priceLead = '';
  base.hero.priceLineHtml = 'お見積り・プランは営業時にご案内します';
  base.hero.priceTax = '';

  base.intro = base.intro || {};
  if (introUrl) base.intro.bgUrl = introUrl;
  base.intro.title = `${esc(name)}を、もっと身近に。`;
  base.intro.body1 =
    place?.rating != null
      ? `Google クチコミ平均 ${place.rating}（件数 ${place.user_ratings_total ?? '-'} 件）※参考値`
      : base.intro.body1;
  base.intro.body2 = '※ 写真・文章は Google マップ等の情報をもとにした下書きです。公開前に必ずご確認ください。';

  base.access = base.access || {};
  base.access.name = name;
  base.access.sub = 'PREVIEW';
  base.access.addressHtml = addr;
  base.access.station = '';
  base.access.note =
    '※ 営業用プレビューです。契約・公開後に正しい情報へ更新されます。店舗情報・写真の出典: Google（利用規約・表示要件に従ってください）。';

  base.sticky = base.sticky || {};
  base.sticky.note = 'このページからお申し込み・お支払いいただけます（プレビュー）';
  base.sticky.domain = 'Preview';

  return base;
}

function mergePlaceIntoWebCloserSnapshot(place, photoUrls) {
  const base = deepClone(readLpDefault('web-closer-intro')) || {};
  const name = place?.name || '店舗名（プレビュー）';
  const addrLine = esc((place?.formatted_address || '住所は公開前にご確認ください').replace(/\n/g, '<br />'));

  base.hero = base.hero || {};
  base.hero.brand = name;
  base.hero.logo = name;
  const photos = [photoUrls[0], photoUrls[1], photoUrls[2]].filter(Boolean);
  if (photos.length) base.hero.photos = photos;
  base.hero.sub = `プレビュー（下書き）<br />${addrLine}`;
  base.hero.h1 = `<strong>${esc(name)}</strong> のご案内（プレビュー）`;
  base.hero.bar1 = place?.rating != null ? `Google 参考評価 ${place.rating}（件数 ${place.user_ratings_total ?? '-'}）` : base.hero.bar1;
  base.hero.bar2 = '※ Google マップ情報に基づく下書きです。公開前に必ずご確認ください。';

  base.footer = base.footer || {};
  base.footer.brand = name;
  base.footer.sub = 'プレビュー · 店舗情報の出典: Google（表示要件に従ってください）';
  base.footer.copyright = `© ${esc(name)}（プレビュー）`;

  base.applyUrl = base.applyUrl || '#top';
  return base;
}

function buildSnapshot(templateSlug, place, photoUrls) {
  if (templateSlug === 'web-closer-intro') {
    return mergePlaceIntoWebCloserSnapshot(place, photoUrls);
  }
  return mergePlaceIntoGymSnapshot(place, photoUrls);
}

function signRepSession(repId, expSec) {
  const payload = `${repId}:${expSec}`;
  const sig = createHmac('sha256', getSalesSessionSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyRepSessionToken(token) {
  const t = String(token || '');
  const parts = t.split('.');
  if (parts.length !== 3) return null;
  const [repId, expSec, sig] = parts;
  if (!repId || !expSec || !sig) return null;
  const exp = Number(expSec);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return null;
  const payload = `${repId}:${expSec}`;
  const expected = createHmac('sha256', getSalesSessionSecret()).update(payload).digest('hex');
  try {
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return repId;
}

export function salesRepCookieValue(repId) {
  const expSec = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC;
  return signRepSession(repId, expSec);
}

async function mutate(fn) {
  const s = await store.getSalesAgency();
  const next = await fn(s);
  await store.setSalesAgency(next);
  return next;
}

function pushApiUsage(state, row) {
  const arr = Array.isArray(state.apiUsage) ? [...state.apiUsage, row] : [row];
  while (arr.length > API_USAGE_CAP) arr.shift();
  state.apiUsage = arr;
}

export async function adminSeedSalesRep({ orgName, repEmail, repPassword, repDisplayName }) {
  const email = String(repEmail || '').trim().toLowerCase();
  if (!orgName || !email || String(repPassword || '').length < 8) {
    throw new Error('組織名・メール・パスワード（8文字以上）が必要です。');
  }
  const before = await store.getSalesAgency();
  if (before.repByEmail[email]) {
    throw new Error('このメールは既に登録されています。');
  }
  return mutate((s) => {
    const orgId = newId('org');
    const repId = newId('rep');
    const h = hashPasswordScrypt(repPassword);
    s.orgs[orgId] = { name: String(orgName).trim(), createdAt: new Date().toISOString() };
    s.reps[repId] = {
      orgId,
      email,
      passwordSalt: h.passwordSalt,
      passwordHash: h.passwordHash,
      alg: h.alg,
      displayName: String(repDisplayName || '').trim() || email,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    s.repByEmail[email] = repId;
    return s;
  });
}

export async function salesLogin(email, password) {
  const s = await store.getSalesAgency();
  const em = String(email || '').trim().toLowerCase();
  const repId = s.repByEmail[em];
  if (!repId) return { ok: false, error: 'メールまたはパスワードが違います。' };
  const rep = s.reps[repId];
  if (!rep || rep.status !== 'active') return { ok: false, error: 'メールまたはパスワードが違います。' };
  if (!verifyPasswordScrypt(password, rep.passwordSalt, rep.passwordHash)) {
    return { ok: false, error: 'メールまたはパスワードが違います。' };
  }
  return { ok: true, repId, rep: { id: repId, email: rep.email, displayName: rep.displayName, orgId: rep.orgId } };
}

export async function getRepProfile(repId) {
  const s = await store.getSalesAgency();
  const rep = s.reps[repId];
  if (!rep) return null;
  return { id: repId, email: rep.email, displayName: rep.displayName, orgId: rep.orgId };
}

export async function parseMapsUrlForSales(url) {
  const id = extractPlaceIdFromGoogleMapsUrl(url);
  return { placeId: id };
}

function googleKey() {
  return String(process.env.GOOGLE_MAPS_API_KEY || '').trim();
}

export async function salesPlacesAutocomplete(repId, input) {
  const key = googleKey();
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY が未設定です。');
  const out = await placesAutocomplete(key, input);
  await mutate((s) => {
    pushApiUsage(s, {
      id: `u_${randomBytes(6).toString('hex')}`,
      ts: new Date().toISOString(),
      repId,
      orgId: s.reps[repId]?.orgId || null,
      kind: 'places_autocomplete',
      placeId: null,
      publicId: null,
      units: 1,
    });
    return s;
  });
  return out;
}

export async function salesPlacesDetails(repId, placeId, publicIdForLog = null) {
  const key = googleKey();
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY が未設定です。');
  const id = String(placeId || '').trim();
  if (!id) throw new Error('place_id が必要です。');

  const s0 = await store.getSalesAgency();
  const cached = s0.placeCache[id];
  const now = Date.now();
  if (cached?.fetchedAt && now - new Date(cached.fetchedAt).getTime() < PLACE_CACHE_TTL_MS && cached.result) {
    await mutate((s) => {
      pushApiUsage(s, {
        id: `u_${randomBytes(6).toString('hex')}`,
        ts: new Date().toISOString(),
        repId,
        orgId: s.reps[repId]?.orgId || null,
        kind: 'place_details_cache_hit',
        placeId: id,
        publicId: publicIdForLog,
        units: 0,
      });
      return s;
    });
    return { result: cached.result, fromCache: true };
  }

  const { result, status } = await placesDetails(key, id);
  if (status !== 'OK' || !result) {
    throw new Error(`Place Details に失敗しました: ${status}`);
  }

  await mutate((s) => {
    s.placeCache[id] = { result, fetchedAt: new Date().toISOString() };
    pushApiUsage(s, {
      id: `u_${randomBytes(6).toString('hex')}`,
      ts: new Date().toISOString(),
      repId,
      orgId: s.reps[repId]?.orgId || null,
      kind: 'place_details',
      placeId: id,
      publicId: publicIdForLog,
      units: 1,
    });
    return s;
  });

  return { result, fromCache: false };
}

/**
 * @param {string} repId
 * @param {{
 *   templateSlug: string,
 *   placeId: string,
 *   checkoutApiOrigin: string,
 *   buildPreviewPageUrl: (publicId: string) => string,
 * }} opts
 */
export async function createSalesPreviewSession(repId, opts) {
  const templateSlug = String(opts.templateSlug || 'gym-valx-intro').trim();
  if (!isProductLpTemplateSlug(templateSlug)) {
    throw new Error(
      `このテンプレは営業プレビュー未対応か、標準リストにありません: ${templateSlug}`
    );
  }
  const placeId = String(opts.placeId || '').trim();
  if (!placeId) throw new Error('place_id が必要です。');
  const checkoutOrigin = String(opts.checkoutApiOrigin || '').replace(/\/$/, '');
  if (!checkoutOrigin.startsWith('http')) {
    throw new Error('checkoutApiOrigin は絶対URLで指定してください。');
  }
  if (typeof opts.buildPreviewPageUrl !== 'function') {
    throw new Error('buildPreviewPageUrl が必要です。');
  }

  const { result: place } = await salesPlacesDetails(repId, placeId, null);
  const key = googleKey();
  const photos = photoUrlsFromDetails(place, key);
  const snapshot = buildSnapshot(templateSlug, place, photos);
  const publicId = newPublicId();
  const previewPageUrl = String(opts.buildPreviewPageUrl(publicId)).trim();
  if (!previewPageUrl.startsWith('http')) {
    throw new Error('プレビューURLの生成に失敗しました。');
  }
  snapshot.applyUrl = `${checkoutOrigin}/api/checkout-redirect?returnUrl=${encodeURIComponent(previewPageUrl)}&salesPreviewPublicId=${encodeURIComponent(publicId)}`;

  await mutate((s) => {
    const orgId = s.reps[repId]?.orgId;
    s.sessions[publicId] = {
      repId,
      orgId: orgId || null,
      templateSlug,
      placeId,
      snapshot,
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return s;
  });

  return { publicId, snapshot, previewPageUrl, previewUrl: previewPageUrl, applyUrl: snapshot.applyUrl };
}

export async function getSalesPreviewSnapshot(publicId) {
  if (!isValidSalesPreviewPublicId(publicId)) return null;
  const s = await store.getSalesAgency();
  const sess = s.sessions[publicId];
  if (!sess || sess.status === 'archived') return null;
  return sess.snapshot || null;
}

export async function getSalesPreviewSession(publicId) {
  if (!isValidSalesPreviewPublicId(publicId)) return null;
  const s = await store.getSalesAgency();
  return s.sessions[publicId] || null;
}

export async function listSalesPreviewSessionsForRep(repId) {
  const s = await store.getSalesAgency();
  return Object.entries(s.sessions || {})
    .filter(([, v]) => v.repId === repId)
    .map(([pid, v]) => ({
      publicId: pid,
      status: v.status,
      placeId: v.placeId,
      templateSlug: v.templateSlug,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      publishedSiteKey: v.publishedSiteKey || null,
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function recordSalesPreviewView(publicId) {
  if (!isValidSalesPreviewPublicId(publicId)) return;
  await mutate((s) => {
    const sess = s.sessions[publicId];
    if (!sess) return s;
    sess.viewCount = (sess.viewCount || 0) + 1;
    sess.lastViewAt = new Date().toISOString();
    return s;
  });
}

export async function markSalesPreviewPaid(publicId) {
  if (!isValidSalesPreviewPublicId(publicId)) return false;
  let ok = false;
  await mutate((s) => {
    const sess = s.sessions[publicId];
    if (!sess) return s;
    sess.status = 'paid';
    sess.paidAt = new Date().toISOString();
    ok = true;
    return s;
  });
  return ok;
}

/**
 * 運営: プレビューを本番 siteKey にコピーし、CMS アカウントを作成
 */
export async function publishSalesPreviewToProduction({ publicId, siteKey, username, password, cloneFrom }) {
  if (!isValidSalesPreviewPublicId(publicId)) throw new Error('不正なプレビューIDです。');
  if (!isValidLpSiteKeyFormat(siteKey)) throw new Error('siteKey が不正です。');
  const cf = String(cloneFrom || 'gym-valx-intro').trim();
  const s = await store.getSalesAgency();
  const sess = s.sessions[publicId];
  if (!sess) throw new Error('プレビューが見つかりません。');
  if (!sess.snapshot || typeof sess.snapshot !== 'object') throw new Error('スナップショットがありません。');

  await store.setLpCmsAccount(siteKey, username, password);
  await store.setLpContent(siteKey, deepClone(sess.snapshot));

  await mutate((st) => {
    const se = st.sessions[publicId];
    if (se) {
      se.status = 'published';
      se.publishedSiteKey = siteKey;
      se.publishedAt = new Date().toISOString();
      se.cloneFromUsed = cf;
    }
    return st;
  });

  return { ok: true, siteKey };
}

export async function getSalesApiUsageSummary(repId, limit = 200) {
  const s = await store.getSalesAgency();
  const rows = (s.apiUsage || []).filter((r) => r.repId === repId).slice(-limit);
  const units = rows.reduce((a, r) => a + (Number(r.units) || 0), 0);
  return { rows, unitsTotal: units };
}
