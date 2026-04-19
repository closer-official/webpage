/**
 * フェーズ遷移ログからファネル集計・送信済→ヒアリングのさかのぼり一覧を作る
 */

import { hourInTokyo, weekdayLabelTokyo } from './outreachAnalyticsAggregate.js';

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

/**
 * @param {object[]} list フィルタ済みイベント（時系列混在）
 */
export function computeOutreachFunnelAndDrilldown(list) {
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

  const sentToHearing = normalizedChanges.filter((x) => isPostSendLike(x.from) && x.to === 'hearing').length;
  const sentOutbound = normalizedChanges.filter((x) => isPostSendLike(x.from)).length;
  const hearToProp = edgeCount('hearing', 'proposal');
  const hearOutbound = outboundFrom('hearing');
  const propToContract = edgeCount('proposal', 'contracted');
  const propOutbound = outboundFrom('proposal');

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
    const denom = outboundFrom(from);
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
      postSend_to_hearing: {
        count: sentToHearing,
        outbound: sentOutbound,
        percent: pct(sentToHearing, sentOutbound),
        fromPhases: ['message_sent', 'no_outreach_channel'],
      },
      hearing_to_proposal: {
        count: hearToProp,
        outbound: hearOutbound,
        percent: pct(hearToProp, hearOutbound),
      },
      proposal_to_contracted: {
        count: propToContract,
        outbound: propOutbound,
        percent: pct(propToContract, propOutbound),
      },
    },
    phaseToLost,
    sentToHearingDrilldown,
  };
}
