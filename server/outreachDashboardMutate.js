import { dashboardItemIsBeauty } from './outreachSegment.js';

/**
 * 送付・フェーズ用ダッシュボード行の PATCH 本体（飲食・美容で共通）
 * @returns {null | { status: number, error: string }}
 */
export function patchOutreachDashboardRowFields(row, body, deps) {
  const { randomBytes, canonicalizeOutreachPhaseInput, addMonthsIso } = deps;
  if (body.dmBody !== undefined) row.dmBody = body.dmBody;
  if (body.outreachDmPattern !== undefined) {
    const p = String(body.outreachDmPattern || '').trim();
    if (/^[1-6]$/.test(p)) row.outreachDmPattern = p;
  }
  if (body.outreachDmCustomFirstLine !== undefined) {
    row.outreachDmCustomFirstLine = String(body.outreachDmCustomFirstLine || '')
      .trim()
      .slice(0, 500);
  }
  if (body.status === 'approved') {
    if (row.status !== 'email_sent' && row.status !== 'rejected') {
      return { status: 400, error: '送信済みまたは失注の案件だけ、送信前に戻せます。' };
    }
    row.status = 'approved';
    const pBack = canonicalizeOutreachPhaseInput(body.outreachPhase);
    row.outreachPhase = pBack && ['pre_contact', 'first_contact'].includes(pBack) ? pBack : 'pre_contact';
    row.outreachPhaseChangedAt = new Date().toISOString();
    row.replyWaitStartedAt = undefined;
    row.sleepUntil = undefined;
    row.outreachLostAt = undefined;
    if (!row.unsubscribeToken) row.unsubscribeToken = randomBytes(24).toString('hex');
  }
  if (body.status === 'email_sent') {
    const wasRejected = row.status === 'rejected';
    row.status = 'email_sent';
    if (wasRejected) row.outreachLostAt = undefined;
    const ph = row.outreachPhase;
    const bumpToMessageSent =
      !ph ||
      ph === 'sent' ||
      ph === 'pending_send' ||
      ph === 'pre_contact' ||
      ph === 'first_contact' ||
      ph === 'hearing' ||
      ph === 'no_outreach_channel' ||
      ph === 'appointment';
    if (bumpToMessageSent) {
      row.outreachPhase = 'message_sent';
      row.outreachPhaseChangedAt = new Date().toISOString();
      row.replyWaitStartedAt = undefined;
    } else if ((ph === 'proposal' || ph === 'awaiting_reply') && !row.replyWaitStartedAt) {
      row.replyWaitStartedAt = new Date().toISOString();
    }
    if (!row.unsubscribeToken) row.unsubscribeToken = randomBytes(24).toString('hex');
  }
  if (body.content !== undefined) row.content = body.content;
  if (body.seo !== undefined) row.seo = body.seo;
  if (body.previewEditCss !== undefined) row.previewEditCss = body.previewEditCss;
  if (body.contentVariants !== undefined) row.contentVariants = body.contentVariants;
  if (body.outreachPhase !== undefined) {
    if (!['approved', 'email_sent'].includes(row.status)) {
      return { status: 400, error: '送信前または送信済みの案件のみフェーズを変更できます。' };
    }
    const pRaw = String(body.outreachPhase);
    const p = canonicalizeOutreachPhaseInput(pRaw);
    if (!p) return { status: 400, error: 'Invalid outreachPhase' };
    row.outreachPhase = p;
    row.outreachPhaseChangedAt = new Date().toISOString();
    if (p === 'lost') {
      row.outreachLostAt = new Date().toISOString();
    } else {
      row.outreachLostAt = undefined;
    }
    if (p === 'proposal' || p === 'awaiting_reply') {
      if (!row.replyWaitStartedAt) {
        row.replyWaitStartedAt = new Date().toISOString();
      }
    } else {
      row.replyWaitStartedAt = undefined;
    }
    if (pRaw === 'sleep') {
      row.sleepUntil = addMonthsIso(new Date(), 3);
    } else {
      row.sleepUntil = undefined;
    }
  }
  return null;
}

export async function buildBeautyOutreachDashboardMerged(store) {
  const customs = await store.getTemplateCustomizations();
  const beautyRows = Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [];
  const mainRows = Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [];
  const seen = new Set();
  const out = [];
  for (const r of beautyRows) {
    if (!r?.id) continue;
    seen.add(r.id);
    out.push(r);
  }
  for (const r of mainRows) {
    if (!r?.id || seen.has(r.id)) continue;
    if (dashboardItemIsBeauty(r, customs)) {
      seen.add(r.id);
      out.push(r);
    }
  }
  return out;
}

/**
 * 美容フェーズ PATCH 用: 美容ストア優先、なければメイン上の美容行
 * @returns { null | { beauty: object[], main: object[], idx: number, pool: 'beauty'|'main' } }
 */
export async function resolveBeautyOutreachDashboardPatchTarget(store, itemId) {
  const id = String(itemId || '');
  const customs = await store.getTemplateCustomizations();
  const beauty = [...(Array.isArray(await store.getBeautyDashboard()) ? await store.getBeautyDashboard() : [])];
  const main = [...(Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [])];
  let idx = beauty.findIndex((d) => d && d.id === id);
  if (idx >= 0) return { beauty, main, idx, pool: 'beauty' };
  idx = main.findIndex((d) => d && d.id === id);
  if (idx < 0) return null;
  if (!dashboardItemIsBeauty(main[idx], customs)) return null;
  return { beauty, main, idx, pool: 'main' };
}
