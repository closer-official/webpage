/**
 * wiki-sauna エントリが吐く hashed CSS を固定名に複製し、
 * buildHtml が差し込む <link href="/assets/wiki-sauna-app.css"> と一致させる。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'dist', 'assets');

function main() {
  if (!fs.existsSync(assetsDir)) {
    console.warn('[postbuild-wiki-sauna-css] dist/assets なし。スキップ。');
    return;
  }
  const files = fs.readdirSync(assetsDir);
  const css = files.find((f) => /^wikiSauna-.*\.css$/i.test(f));
  if (!css) {
    console.warn('[postbuild-wiki-sauna-css] wikiSauna-*.css が見つかりません。スキップ。');
    return;
  }
  const from = path.join(assetsDir, css);
  const to = path.join(assetsDir, 'wiki-sauna-app.css');
  fs.copyFileSync(from, to);
  console.log(`[postbuild-wiki-sauna-css] ${css} -> wiki-sauna-app.css`);
}

main();
