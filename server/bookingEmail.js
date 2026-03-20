/**
 * 予約通知メール（Resend API またはコンソールフォールバック）
 */

/**
 * @param {{ to: string, subject: string, text: string, html?: string }} opts
 * @returns {Promise<{ ok: boolean, via: string }>}
 */
export async function sendBookingNotification(opts) {
  const to = String(opts.to || '').trim();
  if (!to) {
    console.warn('[booking-email] No recipient email; set footerEmail on LP or BOOKING_NOTIFY_EMAIL');
    return { ok: false, via: 'none' };
  }

  const key = process.env.RESEND_API_KEY;
  const from = String(process.env.BOOKING_FROM_EMAIL || 'onboarding@resend.dev').trim();

  if (key) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html || `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(opts.text)}</pre>`,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[booking-email] Resend error', res.status, errText);
      return { ok: false, via: 'resend-error' };
    }
    return { ok: true, via: 'resend' };
  }

  console.log('[booking-email] RESEND_API_KEY 未設定のためコンソール出力のみ');
  console.log('--- TO:', to);
  console.log('--- SUBJECT:', opts.subject);
  console.log(opts.text);
  console.log('---');
  return { ok: true, via: 'console' };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
