/** 予約枠・GoogleカレンダーURL（JST基準） */

const TOKYO_OFFSET_MS = 9 * 60 * 60 * 1000;

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export const BOOKING_SLOT_DURATION_MIN = 60;

/** @returns {string[]} "HH:mm" 30分刻み（昼休み 12:00–13:00 は除外） */
export function getBookingTimeLabels() {
  const out = [];
  for (let h = 9; h <= 11; h++) {
    out.push(`${pad2(h)}:00`, `${pad2(h)}:30`);
  }
  for (let h = 13; h <= 19; h++) {
    out.push(`${pad2(h)}:00`, `${pad2(h)}:30`);
  }
  return out;
}

export function todayKeyJst(now = Date.now()) {
  const j = new Date(now + TOKYO_OFFSET_MS);
  return `${j.getUTCFullYear()}-${pad2(j.getUTCMonth() + 1)}-${pad2(j.getUTCDate())}`;
}

/**
 * 今日（JST）から最大 count 日分、日曜を除く日付キー
 * @param {number} count
 * @returns {string[]}
 */
export function upcomingDateKeys(count = 14) {
  const keys = [];
  let k = todayKeyJst();
  let safety = 0;
  while (keys.length < count && safety < 50) {
    const [y, mo, da] = k.split('-').map(Number);
    const wd = new Date(Date.UTC(y, mo - 1, da)).getUTCDay();
    if (wd !== 0) keys.push(k);
    const next = new Date(Date.UTC(y, mo - 1, da + 1));
    k = `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
    safety += 1;
  }
  return keys;
}

export function slotKey(dateKey, timeLabel) {
  return `${dateKey}_${timeLabel}`;
}

/**
 * JSTの「今」以降のみ予約可とするため、当日は過去枠を不可に
 * @param {string} dateKey YYYY-MM-DD
 * @param {string} timeLabel HH:mm
 */
export function isSlotPastJst(dateKey, timeLabel, now = Date.now()) {
  const [Y, M, D] = dateKey.split('-').map(Number);
  const [h, m] = timeLabel.split(':').map(Number);
  const slotStartUtc = Date.UTC(Y, M - 1, D, h - 9, m, 0);
  return slotStartUtc < now + 30 * 60 * 1000;
}

/**
 * @param {{ title: string, description: string, dateKey: string, startTime: string, durationMin?: number }}
 */
export function googleCalendarTemplateUrl({ title, description, dateKey, startTime, durationMin = BOOKING_SLOT_DURATION_MIN }) {
  const [yy, mm, dd] = dateKey.split('-').map(Number);
  const [th, tm] = startTime.split(':').map(Number);
  const start = new Date(Date.UTC(yy, mm - 1, dd, th - 9, tm, 0));
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const f = (d) =>
    d.getUTCFullYear().toString() +
    pad2(d.getUTCMonth() + 1) +
    pad2(d.getUTCDate()) +
    'T' +
    pad2(d.getUTCHours()) +
    pad2(d.getUTCMinutes()) +
    '00Z';
  const dates = `${f(start)}/${f(end)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
