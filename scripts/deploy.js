/**
 * npm run deploy 用スクリプト（標準運用）
 * - git add . → 変更があれば commit → git push（いまのブランチ、多くは master）
 * - Vercel の Production Branch をこのブランチ（例: master）に合わせておけば、
 *   この push だけで本番デプロイまで完結する。
 * - production ブランチを挟む運用は任意: `npm run deploy:prod`（docs/本番ブランチ運用.md）
 * - 末尾の `vercel --prod` はデフォルトオフ（CLI 直載せの事故防止）。
 *   どうしても使う場合: DEPLOY_USE_VERCEL_CLI=1 npm run deploy
 */
import { execSync, spawnSync } from 'node:child_process';

const message = process.argv.slice(2).join(' ') || 'Deploy';

function run(cmd, options = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...options });
    return true;
  } catch (e) {
    return false;
  }
}

// 1. 全部 add
run('git add .');

// 2. 変更があるか
let hasChanges = false;
try {
  const out = execSync('git status --porcelain', { encoding: 'utf8' });
  hasChanges = out.trim().length > 0;
} catch {
  // git でない or エラー
  console.error('git status に失敗しました。Git リポジトリであることを確認してください。');
  process.exit(1);
}

if (hasChanges) {
  const result = spawnSync('git', ['commit', '-m', message], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('git commit に失敗しました。');
    process.exit(1);
  }
  console.log('コミットしました。');
} else {
  console.log('コミットする変更がありません。');
}

// 3. リモートが設定されているか確認
let hasRemote = false;
try {
  const out = execSync('git remote', { encoding: 'utf8' });
  hasRemote = out.trim().length > 0;
} catch {
  // ignore
}
if (!hasRemote) {
  console.error('');
  console.error('リモートが設定されていません。先に GitHub などにリポジトリを作り、次を実行してください:');
  console.error('  git remote add origin <リポジトリのURL>');
  console.error('例: git remote add origin https://github.com/あなたのID/webpage.git');
  console.error('');
  process.exit(1);
}

// 4. push（Vercel 連携ならここで本番デプロイが走る）
let branch = 'master';
try {
  branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim() || branch;
} catch {
  // use default
}
if (!run(`git push -u origin ${branch}`)) {
  console.error('');
  console.error('git push に失敗しました。');
  console.error('  - リモートの URL が正しいか: git remote -v');
  console.error('  - 初回は手動で: git push -u origin ' + branch);
  console.error('');
  process.exit(1);
}

console.log('プッシュ完了。');

if (process.env.DEPLOY_USE_VERCEL_CLI === '1') {
  execSync('npx vercel --prod --yes', { stdio: 'inherit', cwd: process.cwd() });
}
