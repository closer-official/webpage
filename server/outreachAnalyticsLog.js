/**
 * 送付ダッシュ PATCH から追記する分析用イベント（送信済み操作・明示的フェーズ変更）
 */

function newEventId() {
  return `oe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {object} params
 * @param {object} params.body
 * @param {object} params.rowBefore
 * @param {object} params.rowAfter
 * @param {'beauty'|'main'} params.storagePool
 * @param {boolean} params.segmentBeauty
 * @returns {object[]}
 */
export function buildOutreachAnalyticsEventsFromPatch({
  body,
  rowBefore,
  rowAfter,
  storagePool,
  segmentBeauty,
}) {
  const b = body && typeof body === 'object' ? body : {};
  const at = new Date().toISOString();
  const actorName = String(b.actorName || '').trim().slice(0, 80) || '(未設定)';
  const itemId = String(rowAfter?.id || rowBefore?.id || '').trim();
  if (!itemId) return [];

  const shopName = String(rowAfter?.shopName || '').trim().slice(0, 200);
  const templateId =
    rowAfter?.templateId != null ? String(rowAfter.templateId).trim().slice(0, 80) : '';
  const dmPat =
    rowAfter?.outreachDmPattern != null ? String(rowAfter.outreachDmPattern).trim().slice(0, 8) : '';

  const fromStatus = rowBefore?.status ?? null;
  const toStatus = rowAfter?.status ?? null;
  const fromPhase = rowBefore?.outreachPhase ?? null;
  const toPhase = rowAfter?.outreachPhase ?? null;

  const events = [];

  if (b.status === 'email_sent') {
    events.push({
      id: newEventId(),
      at,
      type: 'message_sent',
      storagePool,
      segmentBeauty: !!segmentBeauty,
      itemId,
      shopName,
      templateId,
      outreachDmPattern: dmPat,
      actorName,
      fromStatus,
      toStatus,
      phase: toPhase,
    });
  }

  const implicitPhaseFromSendOnly =
    b.status === 'email_sent' && b.outreachPhase === undefined && fromPhase !== toPhase;

  if (!implicitPhaseFromSendOnly && fromPhase !== toPhase) {
    events.push({
      id: newEventId(),
      at,
      type: 'phase_change',
      storagePool,
      segmentBeauty: !!segmentBeauty,
      itemId,
      shopName,
      templateId,
      outreachDmPattern: dmPat,
      actorName,
      fromPhase,
      toPhase,
      fromStatus,
      toStatus,
    });
  }

  return events;
}
