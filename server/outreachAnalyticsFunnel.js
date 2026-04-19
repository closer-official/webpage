/**
 * フェーズ遷移ログからファネル集計・送信済→ヒアリングのさかのぼり一覧を作る
 *
 * ファネル％の分母は「当該ステップの両フェーズのダッシュボード件数の合計」
 * （例: 送信済相当→ヒアリング ＝ 送信済相当件数 + ヒアリング件数。分子は次フェーズ側の件数）
 */

import { hourInTokyo, weekdayLabelTokyo } from './outreachAnalyticsAggregate.js';
import { dashboardItemIsBeauty } from './outreachSegment.js';
import { buildBeautyOutreachDashboardMerged } from './outreachDashboardMutate.js';

const LEGACY_PHASE = {
  pending_send: 'pre_contact',
  awaiting_reply: 'proposal',
  sent: 'message_sent',
  appointment: 'hearing',
  won: 'contracted',
  sleep: 'no_outreach_channel',
};

/** @param {unknown} p */
export function normalizeOutreachPhase(p) {
  const s = String(p || '').trim();
  if (!s) return null;
  return LEGACY_PHASE[s] || s;
}

const SNAPSHOT_PHASE_KEYS = [
  'pre_contact',
  'first_contact',
  'message_sent',
  'no_outreach_channel',
  'hearing',
  'proposal',
  'contracted',
  'payment_confirmed',
  'lost',
];

/**
 * 送付分析と同じ絞り込みでダッシュボード行を取得（現在フェーズの件数用）
 * @param {{ storagePool?: string, segmentBeauty?: string, templateId?: string }} filters
 */
export async function loadOutreachDashboardRowsForAnalytics(store, filters = {}) {
  const rawCust = await store.getTemplateCustomizations();
  const customs = Array.isArray(rawCust) ? rawCust : [];
  const storagePool = String(filters.storagePool || '').trim();
  const seg = String(filters.segmentBeauty || '').trim();
  const templateId = String(filters.templateId || '').trim();

  let rows = [];
  if (storagePool === 'beauty') {
    rows = await buildBeautyOutreachDashboardMerged(store);
  } else if (storagePool === 'main') {
    const main = Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [];
    rows = main.filter((r) => r && !dashboardItemIsBeauty(r, customs));
  } else {
    const merged = await buildBeautyOutreachDashboardMerged(store);
    const main = Array.isArray(await store.getDashboard()) ? await store.getDashboard() : [];
    const seen = new Set(merged.map((r) => r && r.id).filter(Boolean));
    rows = [...merged, ...main.filter((r) => r && r.id && !seen.has(r.id))];
  }

  if (seg === '1' || seg === 'true') {
    rows = rows.filter((r) => dashboardItemIsBeauty(r, customs));
  } else if (seg === '0' || seg === 'false') {
    rows = rows.filter((r) => !dashboardItemIsBeauty(r, customs));
  }

  if (templateId) {
    rows = rows.filter((r) => String(r.templateId || '').trim() === templateId);
  }

  return rows;
}

/**
 * 送信済み（メール送信済）案件のみ、正規化した outreachPhase の件数
 * @param {object[]} rows loadOutreachDashboardRowsForAnalytics の戻り
 * @returns {Record<string, number>}
 */
export function computeSnapshotPhaseCounts(rows) {
  /** @type {Record<string, number>} */
  const out = Object.fromEntries(SNAPSHOT_PHASE_KEYS.map((k) => [k, 0]));
  const arr = Array.isArray(rows) ? rows : [];
  for (const r of arr) {
    if (!r || r.status !== 'email_sent') continue;
    const p = normalizeOutreachPhase(r.outreachPhase) || 'pre_contact';
    if (out[p] == null) continue;
    out[p] += 1;
  }
  return out;
}

/**
 * @param {object[]} list フィルタ済みイベント（時系列混在）
 * @param {{ snapCounts?: Record<string, number> | null }} [options]
 */
export function computeOutreachFunnelAndDrilldown(list, options = {}) {
  const arr = Array.isArray(list) ? list : [];
  const phaseChanges = arr.filter((e) => e && e.type === 'phase_change' && e.itemId);
  const messageSents = arr.filter((e) => e && e.type === 'message_sent' && e.itemId);

  /** @type {Map<string, { type: string, at: string, _t: number, [k: string]: unknown }[]>} */
  const byItem = new Map();
  function pushEv(e) {
    const id = String(e.itemId || '').trim();
    if (!id) return;
    const t = new Date(e.at).getTime();
    if (Number.isNaN(t)) return;
    const row = { ...e, _t: t };
    if (!byItem.has(id)) byItem.set(id, []);
    byItem.get(id).push(row);
  }
  for (const e of phaseChanges) pushEv(e);
  for (const e of messageSents) pushEv(e);
  for (const evs of byItem.values()) evs.sort((a, b) => a._t - b._t);

  function normEdge(e) {
    return {
      from: normalizeOutreachPhase(e.fromPhase),
      to: normalizeOutreachPhase(e.toPhase),
      raw: e,
    };
  }

  const normalizedChanges = phaseChanges.map((e) => {
    const { from, to } = normEdge(e);
    const t = new Date(e.at).getTime();
    return { e, from, to, _t: Number.isNaN(t) ? 0 : t };
  });

  function edgeCount(from, to) {
    return normalizedChanges.filter((x) => x.from === from && x.to === to).length;
  }

  function outboundFrom(from) {
    return normalizedChanges.filter((x) => x.from === from).length;
  }

  /** 7種UIの「送信済み」に相当（送信済フェーズ or SNSなし不可） */
  function isPostSendLike(from) {
    return from === 'message_sent' || from === 'no_outreach_channel';
  }

  function pct(count, denom) {
    if (!denom) return null;
    return Math.round((10000 * count) / denom) / 100;
  }

  const snap = options.snapCounts && typeof options.snapCounts === 'object' ? options.snapCounts : null;

  const sentToHearing = normalizedChanges.filter((x) => isPostSendLike(x.from) && x.to === 'hearing').length;
  const sentOutbound = normalizedChanges.filter((x) => isPostSendLike(x.from)).length;
  const hearToProp = edgeCount('hearing', 'proposal');
  const hearOutbound = outboundFrom('hearing');
  const propToContract = edgeCount('proposal', 'contracted');
  const propOutbound = outboundFrom('proposal');

  /** ダッシュボード現在件数ベース（分母＝当該2フェーズの合計） */
  let postSendHearingBlock;
  let hearingProposalBlock;
  let proposalContractedBlock;
  if (snap) {
    const nHearing = snap.hearing || 0;
    const nPostSendLike = (snap.message_sent || 0) + (snap.no_outreach_channel || 0);
    const denom01 = nPostSendLike + nHearing;
    postSendHearingBlock = {
      count: nHearing,
      outbound: denom01,
      percent: pct(nHearing, denom01),
      fromPhases: ['message_sent', 'no_outreach_channel'],
    };

    const nProposal = snap.proposal || 0;
    const denom12 = nHearing + nProposal;
    hearingProposalBlock = {
      count: nProposal,
      outbound: denom12,
      percent: pct(nProposal, denom12),
    };

    const nContracted = snap.contracted || 0;
    const denom23 = nProposal + nContracted;
    proposalContractedBlock = {
      count: nContracted,
      outbound: denom23,
      percent: pct(nContracted, denom23),
    };
  } else {
    postSendHearingBlock = {
      count: sentToHearing,
      outbound: sentOutbound,
      percent: pct(sentToHearing, sentOutbound),
      fromPhases: ['message_sent', 'no_outreach_channel'],
    };
    hearingProposalBlock = {
      count: hearToProp,
      outbound: hearOutbound,
      percent: pct(hearToProp, hearOutbound),
    };
    proposalContractedBlock = {
      count: propToContract,
      outbound: propOutbound,
      percent: pct(propToContract, propOutbound),
    };
  }

  const phasesForLost = [
    'pre_contact',
    'first_contact',
    'message_sent',
    'hearing',
    'proposal',
    'contracted',
    'payment_confirmed',
    'no_outreach_channel',
  ];

  const phaseToLost = phasesForLost.map((from) => {
    const toLost = edgeCount(from, 'lost');
    const nFromSnap = snap ? snap[from] || 0 : 0;
    const denom = snap ? nFromSnap + toLost : outboundFrom(from);
    return {
      fromPhase: from,
      toLost,
      outbound: denom,
      percent: pct(toLost, denom),
    };
  });

  /** 送信済み相当 →ヒアリング に遷移した行だけ：直前の message_sent 操作ログをさかのぼる */
  const sentToHearingDrilldown = [];
  for (const e of phaseChanges) {
    const { from, to } = normEdge(e);
    if (!isPostSendLike(from) || to !== 'hearing') continue;
    const id = String(e.itemId || '').trim();
    const chain = byItem.get(id) || [];
    const tH = new Date(e.at).getTime();
    let lastSent = null;
    for (const x of chain) {
      if (x._t >= tH) break;
      if (x.type === 'message_sent') lastSent = x;
    }
    const sentAt = lastSent ? String(lastSent.at) : null;
    sentToHearingDrilldown.push({
      itemId: id,
      shopName: String(e.shopName || lastSent?.shopName || '').trim(),
      fromPhase: from,
      heardAt: String(e.at),
      sentAt,
      templateId: lastSent ? String(lastSent.templateId || '').trim() : '',
      outreachDmPattern: lastSent ? String(lastSent.outreachDmPattern || '').trim() : '',
      weekdayJst: sentAt ? weekdayLabelTokyo(sentAt) : '',
      hourJst: sentAt ? hourInTokyo(sentAt) : -1,
      sentKnown: !!lastSent,
      storagePool: e.storagePool,
      segmentBeauty: !!e.segmentBeauty,
    });
  }
  sentToHearingDrilldown.sort((a, b) => String(b.heardAt).localeCompare(String(a.heardAt)));

  return {
    funnel: {
      postSend_to_hearing: postSendHearingBlock,
      hearing_to_proposal: hearingProposalBlock,
      proposal_to_contracted: proposalContractedBlock,
    },
    phaseToLost,
    sentToHearingDrilldown,
  };
}
