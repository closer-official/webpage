/**
 * 運営SPAは dist/index.html（ルート）。
 * 旧URL・店舗ドメイン向けに、同一 index を dist/admin/index.html にも置く（/admin/ で開ける）。
 * 店舗サブドメインのルートをジムLPにする処理は middleware.ts（*.store-official.net）。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');
const rootIndex = path.join(dist, 'index.html');
const adminDir = path.join(dist, 'admin');
const adminIndex = path.join(adminDir, 'index.html');

function main() {
  if (!fs.existsSync(rootIndex)) {
    console.warn('[postbuild] dist/index.html がありません。スキップします。');
    process.exit(0);
  }
  fs.mkdirSync(adminDir, { recursive: true });
  fs.copyFileSync(rootIndex, adminIndex);
  console.log('[postbuild] copied dist/index.html -> dist/admin/index.html');
}

main();
