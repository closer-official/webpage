/**
 * outreach 分析イベントから、グラフ用の分布集計を作る（全件 list を想定）
 */

const TZ = 'Asia/Tokyo';

/**
 * @param {string} iso
 * @returns {number} 0–23（解釈不能は -1）
 */
export function hourInTokyo(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return -1;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const h = parts.find((p) => p.type === 'hour');
  if (!h) return -1;
  const n = Number.parseInt(h.value, 10);
  return Number.isFinite(n) ? n : -1;
}

/**
 * @param {string} iso
 * @returns {string} 月…日 の1文字想定（解釈不能は ''）
 */
export function weekdayLabelTokyo(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ja-JP', { timeZone: TZ, weekday: 'short' }).format(d);
}

const WD_ORDER = ['月', '火', '水', '木', '金', '土', '日'];

function sortCountRecord(rec) {
  return Object.entries(rec)
    .map(([key, count]) => ({ key, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/**
 * @param {object[]} list フィルタ済みイベント配列
 */
export function computeOutreachAnalyticsAggregates(list) {
  const arr = Array.isArray(list) ? list : [];
  const sent = arr.filter((e) => e && e.type === 'message_sent');
  const phaseChanges = arr.filter((e) => e && e.type === 'phase_change');

  const byTemplate = {};
  const byHour = Object.fromEntries([...Array(24)].map((_, i) => [i, 0]));
  const byWeekday = {};
  const byDmPattern = {};
  const phaseTo = {};

  for (const e of sent) {
    const tid = String(e.templateId || '').trim() || '（templateId 未取得）';
    byTemplate[tid] = (byTemplate[tid] || 0) + 1;
    const h = hourInTokyo(e.at);
    if (h >= 0 && h <= 23) byHour[h] += 1;
    const wd = weekdayLabelTokyo(e.at);
    if (wd) byWeekday[wd] = (byWeekday[wd] || 0) + 1;
    const pat = String(e.outreachDmPattern || '').trim() || '（未設定）';
    byDmPattern[pat] = (byDmPattern[pat] || 0) + 1;
  }

  for (const e of phaseChanges) {
    const to = String(e.toPhase || '').trim() || '（不明）';
    phaseTo[to] = (phaseTo[to] || 0) + 1;
  }

  const byHourJst = [...Array(24)].map((_, hour) => ({ hour, count: byHour[hour] || 0 }));
  const byWeekdayOrdered = WD_ORDER.map((label) => ({
    key: label,
    count: byWeekday[label] || 0,
  }));

  return {
    messageSentCount: sent.length,
    phaseChangeCount: phaseChanges.length,
    byTemplate: sortCountRecord(byTemplate),
    byHourJst,
    byWeekdayJst: byWeekdayOrdered,
    byDmPattern: sortCountRecord(byDmPattern),
    phaseChangeToPhase: sortCountRecord(phaseTo),
  };
}
