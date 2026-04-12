/**
 * docs/!DOCTYPE html - コピー.md 内の staff-img の data URL を
 * /beauty-salon-mellow/staff-kaito.png / staff-mizuki.png に置換（出現順: Kaito → Mizuki を繰り返し）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mdPath = path.join(root, 'docs', '!DOCTYPE html - コピー.md');

const staffImgs = ['/beauty-salon-mellow/staff-kaito.png', '/beauty-salon-mellow/staff-mizuki.png'];

let s = fs.readFileSync(mdPath, 'utf8');
let idx = 0;
const re = /<div class="staff-img"><img src="data:image\/[^"]+"/g;
const before = (s.match(re) || []).length;
if (before === 0) {
  console.error('no staff-img data URLs found');
  process.exit(1);
}
s = s.replace(re, () => {
  const u = staffImgs[idx % staffImgs.length];
  idx += 1;
  return `<div class="staff-img"><img src="${u}"`;
});
fs.writeFileSync(mdPath, s, 'utf8');
console.log('patched staff-img data URLs:', before, '→', idx);
