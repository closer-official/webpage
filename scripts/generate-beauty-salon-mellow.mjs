/**
 * docs/!DOCTYPE html - コピー.md（美容室LP・data URL 大量）から
 * server/beautySalonMellow/ 用の軽量 CSS + body 断片を生成する。
 * npm / node で: node scripts/generate-beauty-salon-mellow.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { postProcessBeautySalonMellowBody } from './beautySalonMellowPostProcess.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPath = path.join(root, 'docs', '!DOCTYPE html - コピー.md');
const outDir = path.join(root, 'server', 'beautySalonMellow');

/** MD 内 data URL 置換用（生成後 postProcess で内装5枚へ。Style 6枚は style-hair に固定） */
const POOL = [
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1595476108010-b4d1f102b31b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1633681926022-84c79e2bdd89?auto=format&fit=crop&w=1200&q=80',
];
let poolI = 0;
function nextImg() {
  const u = POOL[poolI % POOL.length];
  poolI++;
  return u;
}

function main() {
  if (!fs.existsSync(srcPath)) {
    console.error('missing source:', srcPath);
    process.exit(1);
  }
  console.log('reading (large file)...');
  const raw = fs.readFileSync(srcPath, 'utf8');

  const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/i);
  if (!styleMatch) throw new Error('no <style> block');
  let css = styleMatch[1].trim();
  css = css.replace(/\bbody\s*\{/g, '.bsm-root{');
  css = css.replace(/\bhtml\s*\{/g, '.bsm-root{');

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('no <body>');
  let body = bodyMatch[1].trim();

  body = body.replace(/url\(\s*['"]data:[^'"]+['"]\s*\)/gi, () => `url('${nextImg()}')`);
  body = body.replace(/url\(\s*data:[^)]+\)/gi, () => `url('${nextImg()}')`);
  body = body.replace(/src\s*=\s*["']data:[^"']+["']/gi, () => `src="${nextImg()}"`);

  body = postProcessBeautySalonMellowBody(body);

  fs.mkdirSync(outDir, { recursive: true });
  const cssPath = path.join(outDir, 'generated.css');
  const htmlPath = path.join(outDir, 'generated-body.html');
  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync(htmlPath, body, 'utf8');
  console.log('wrote', cssPath, '(' + Math.round(fs.statSync(cssPath).size / 1024) + ' KB)');
  console.log('wrote', htmlPath, '(' + Math.round(fs.statSync(htmlPath).size / 1024) + ' KB)');

  const inj = spawnSync(process.execPath, [path.join(root, 'scripts', 'inject-bsm-markers.mjs')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (inj.status !== 0) process.exit(inj.status ?? 1);
}

main();
