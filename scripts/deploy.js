/**
 * npm run deploy 用スクリプト
 * - git add . → 変更があれば commit → git push
 * - プッシュで Vercel の Git 連携により本番デプロイが走る想定
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

// 3. push（Vercel 連携ならここで本番デプロイが走る）
if (!run('git push')) {
  console.error('git push に失敗しました。リモートとブランチを確認してください。');
  process.exit(1);
}

console.log('プッシュ完了。Vercel で本番デプロイが開始されます。');
