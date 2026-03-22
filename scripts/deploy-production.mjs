/**
 * 本番反映: main を production にマージして push するだけ。
 * Vercel の Production Branch が production のとき、ここで本番デプロイが走る。
 *
 * 使い方:
 *   npm run deploy:prod
 *   npm run deploy:prod -- "リリースメッセージ"
 */
import { execSync, spawnSync } from 'node:child_process';

const mergeMessage = process.argv.slice(2).join(' ') || `Release ${new Date().toISOString().slice(0, 10)}`;

/** マージ元（既定: origin/main があれば main、なければ master）。上書き: DEPLOY_SOURCE_BRANCH=master */
function detectSourceBranch() {
  const env = String(process.env.DEPLOY_SOURCE_BRANCH || '').trim();
  if (env) return env;
  try {
    const br = execSync('git branch -r', { encoding: 'utf8' });
    if (/\borigin\/main\b/.test(br)) return 'main';
    if (/\borigin\/master\b/.test(br)) return 'master';
  } catch {
    /* ignore */
  }
  return 'main';
}

function sh(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function getBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// 未コミット変更があれば警告して中止（誤マージ防止）
let dirty = false;
try {
  const st = execSync('git status --porcelain', { encoding: 'utf8' });
  dirty = st.trim().length > 0;
} catch {
  console.error('git status に失敗しました。');
  process.exit(1);
}
if (dirty) {
  console.error('');
  console.error('未コミットの変更があります。先に開発ブランチ（main / master）でコミットするか、stash してください。');
  console.error('（production に切り替えると変更が持ち越される事故を防ぐため）');
  process.exit(1);
}

const startBranch = getBranch();
if (!startBranch) {
  console.error('ブランチを取得できませんでした。');
  process.exit(1);
}

try {
  sh('git fetch origin');

  // production がリモートに無ければ、main から作る手順を表示
  let hasRemoteProduction = false;
  try {
    const branches = execSync('git branch -r', { encoding: 'utf8' });
    hasRemoteProduction = /\borigin\/production\b/.test(branches);
  } catch {
    /* ignore */
  }

  if (!hasRemoteProduction) {
    console.log('');
    const src = detectSourceBranch();
    console.log('リモートに production ブランチがありません。初回は次を実行してください:');
    console.log(`  git checkout ${src} && git pull origin ${src}`);
    console.log('  git checkout -b production');
    console.log('  git push -u origin production');
    console.log('');
    console.log('その後、Vercel の Production Branch を production に設定してください。');
    process.exit(1);
  }

  const sourceBranch = detectSourceBranch();
  sh('git checkout production');
  sh('git pull origin production');
  console.log(`マージ元: origin/${sourceBranch}`);
  const mergeResult = spawnSync('git', ['merge', `origin/${sourceBranch}`, '-m', mergeMessage], {
    stdio: 'inherit',
  });
  if (mergeResult.status !== 0) {
    console.error('');
    console.error('マージでコンフリクトしました。解消後: git commit → git push origin production');
    process.exit(1);
  }
  sh('git push origin production');
  console.log('');
  console.log('production を push しました。Vercel が本番デプロイを開始します。');
} finally {
  try {
    if (startBranch && startBranch !== 'production') {
      sh(`git checkout ${startBranch}`);
    }
  } catch {
    /* ignore */
  }
}
