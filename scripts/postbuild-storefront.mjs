/**
 * 店舗公開用: ルートにジムLP、管理ツールを /admin/ に配置する。
 * - Vite の出力 index.html を dist/admin/index.html へ移動
 * - public/deliverables/gym-valx-intro/index.html を dist/index.html へコピー（店舗トップ）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const adminDir = path.join(dist, 'admin');
const gymSrc = path.join(root, 'public', 'deliverables', 'gym-valx-intro', 'index.html');

function main() {
  if (!fs.existsSync(dist)) {
    console.warn('[postbuild-storefront] dist/ がありません。vite build を先に実行してください。');
    process.exit(0);
  }
  const builtIndex = path.join(dist, 'index.html');
  if (!fs.existsSync(builtIndex)) {
    console.warn('[postbuild-storefront] dist/index.html がありません。スキップします。');
    process.exit(0);
  }
  fs.mkdirSync(adminDir, { recursive: true });
  const adminIndex = path.join(adminDir, 'index.html');
  fs.renameSync(builtIndex, adminIndex);
  console.log('[postbuild-storefront] moved dist/index.html -> dist/admin/index.html');

  if (fs.existsSync(gymSrc)) {
    fs.copyFileSync(gymSrc, path.join(dist, 'index.html'));
    console.log('[postbuild-storefront] copied gym-valx-intro -> dist/index.html (storefront)');
  } else {
    console.warn('[postbuild-storefront] gym LP 元ファイルが見つかりません:', gymSrc);
  }
}

main();
