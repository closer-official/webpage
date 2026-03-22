import { isValidLpSiteKeyFormat } from './lpCmsCrypto.js';

/**
 * 店舗 LP の初回プロビジョニング（アカウント + 空なら lpContent クローン）
 * @param {import('./data/store.js').store} store
 * @param {(slug: string) => object | null} getLpContentDefault
 * @param {Set<string>} allowedLpSlugs - リポジトリに存在する全 LP CMS スラッグ
 * @param {{ siteKey: string, username: string, password: string, cloneFrom: string }} body
 * @param {Set<string> | null} restrictCloneTo - 指定時は cloneFrom がこの集合に含まれる必要がある（新規納品ウィザード用）
 */
export async function runLpCmsProvision(store, getLpContentDefault, allowedLpSlugs, body, restrictCloneTo = null) {
  const siteKey = String(body?.siteKey || '').trim();
  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  const cloneFrom = String(body?.cloneFrom || 'gym-valx-intro').trim();

  if (!isValidLpSiteKeyFormat(siteKey)) {
    const err = new Error(
      'siteKey が不正です（英小文字・数字・ハイフンのみ、2〜64文字、先頭・末尾は英数字）。例: shibuya-studio'
    );
    err.statusCode = 400;
    throw err;
  }
  if (!username || password.length < 8) {
    const err = new Error('ユーザー名とパスワード（8文字以上）が必要です。');
    err.statusCode = 400;
    throw err;
  }
  if (!allowedLpSlugs.has(cloneFrom)) {
    const err = new Error(
      `cloneFrom が不正です。許可: ${[...allowedLpSlugs].join(', ')}`
    );
    err.statusCode = 400;
    throw err;
  }
  if (restrictCloneTo && !restrictCloneTo.has(cloneFrom)) {
    const err = new Error('この操作では選択できないテンプレです。標準テンプレから選び直してください。');
    err.statusCode = 400;
    throw err;
  }

  await store.setLpCmsAccount(siteKey, username, password);
  const existing = await store.getLpContent(siteKey);
  const hasContent = existing && typeof existing === 'object' && Object.keys(existing).length > 0;
  if (!hasContent) {
    const tmpl = getLpContentDefault(cloneFrom);
    await store.setLpContent(siteKey, tmpl ? JSON.parse(JSON.stringify(tmpl)) : {});
  }
  return { ok: true, siteKey };
}
