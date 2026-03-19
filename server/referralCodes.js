/**
 * 紹介コードの照合（Supabase `referral_codes` テーブル）。
 * 本番では発行したコードを1行ずつ登録する（コードは紹介者ごとに任意の文字列で可）。
 *
 * Supabase 未設定時は開発用に環境変数 REFERRAL_CODES（カンマ区切り）のみ一致判定。
 */

import { getSupabase } from './data/supabaseClient.js';

const MAX_CODE_LEN = 200;

function normalizeCode(raw) {
  return String(raw ?? '').trim();
}

function matchEnvFallback(code) {
  const raw = process.env.REFERRAL_CODES || '';
  const list = raw
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return list.includes(code);
}

/**
 * @param {string | undefined} rawCode
 * @returns {Promise<boolean>}
 */
export async function isReferralCodeActive(rawCode) {
  const code = normalizeCode(rawCode);
  if (!code || code.length > MAX_CODE_LEN) return false;

  const sb = await getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('referral_codes')
      .select('code')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle();
    if (error) {
      console.warn('[referralCodes] lookup failed', error.message);
      return false;
    }
    return !!data;
  }

  return matchEnvFallback(code);
}
