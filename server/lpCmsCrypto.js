import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

/** 本番では必ず LP_CMS_SESSION_SECRET を設定（1本で全店舗分のセッション署名に使用） */
export function getLpCmsSessionSecret() {
  return String(
    process.env.LP_CMS_SESSION_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'lp-cms-dev-insecure-change-me'
  );
}

export function hashPasswordScrypt(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password), salt, 64);
  return {
    passwordSalt: salt.toString('base64'),
    passwordHash: hash.toString('base64'),
    alg: 'scrypt',
  };
}

export function verifyPasswordScrypt(password, passwordSalt, passwordHash) {
  if (!passwordSalt || !passwordHash) return false;
  try {
    const salt = Buffer.from(String(passwordSalt), 'base64');
    const expected = Buffer.from(String(passwordHash), 'base64');
    const hash = scryptSync(String(password), salt, 64);
    if (hash.length !== expected.length) return false;
    return timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
}

/** DB保存の passwordHash（scrypt）を含めた HMAC セッション（クッキー値） */
export function lpCmsSessionCookieValue(siteKey, username, passwordHash) {
  return createHmac('sha256', getLpCmsSessionSecret())
    .update(`${String(siteKey)}\0${String(username)}\0${String(passwordHash)}`)
    .digest('hex');
}

export function verifyLpCmsSessionCookie(siteKey, cookieVal, account) {
  if (!account || cookieVal == null || cookieVal === '') return false;
  const expected = lpCmsSessionCookieValue(siteKey, account.username, account.passwordHash);
  try {
    return timingSafeEqual(Buffer.from(String(cookieVal), 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

/** 店舗キー: サブドメイン想定（英小文字・数字・ハイフン）2〜64文字 */
export function isValidLpSiteKeyFormat(siteKey) {
  const s = String(siteKey || '');
  if (s.length < 2 || s.length > 64) return false;
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s);
}
