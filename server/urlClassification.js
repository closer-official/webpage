/**
 * Google Places の website フィールドは、店舗の独自ドメインだけでなく
 * ホットペッパー・Instagram 等の第三者URLになることが多い。
 * 「Web未掲載店のみ」検索ではそれらを独自サイト扱いにしない。
 */

/** @type {string[]} サブドメイン含め末尾一致で判定するベースドメイン */
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

/**
 * Maps の website が「独自の公式サイト」とはみなせない第三者URLか
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export function isThirdPartyListingUrl(url) {
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

/**
 * 独自ドメインの公式サイトとして扱うか（第三者掲載は false）
 * @param {string | null | undefined} url
 */
export function hasLikelyOwnWebsiteUrl(url) {
  if (!url || typeof url !== 'string' || !String(url).trim()) return false;
  return !isThirdPartyListingUrl(url);
}
