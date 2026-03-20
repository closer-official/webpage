/**
 * server/urlClassification.js と同ロジック（フロントの Maps JS 用）
 */

const THIRD_PARTY_SUFFIXES = [
  'instagram.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'fb.com',
  'tiktok.com',
  'line.me',
  'youtube.com',
  'youtu.be',
  'pinterest.com',
  'snapchat.com',
  'threads.net',
  'linkedin.com',
  'hotpepper.jp',
  'tabelog.com',
  'gnavi.co.jp',
  'retty.me',
  'ikyu.com',
  'jalan.net',
  'linktr.ee',
  'linktree.com',
  'ameblo.jp',
  'note.com',
  'salonboard.com',
  'hpb.jp',
  'coubic.com',
  'peatix.com',
  'connpass.com',
  'doorkeeper.jp',
  'wantedly.com',
  'green-japan.com',
];

export function isThirdPartyListingUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  let u = url.trim();
  if (!u) return false;
  try {
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    for (const suf of THIRD_PARTY_SUFFIXES) {
      if (host === suf || host.endsWith(`.${suf}`)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function hasLikelyOwnWebsiteUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  return !isThirdPartyListingUrl(url);
}
