/**
 * beauty_salon_mellow: BSM テキストスロット（HTML 内 <!--BSM:id-->…<!--/BSM:id-->）の適用、
 * FAQ 流し込み、ホットペッパー貼り付けの簡易抽出。写真・評価は扱わない。
 */

/** 編集画面のラベル（generated-body.html のマーカーと対応） */
export const BSM_SLOT_UI = [
  { id: 'hero.label', label: 'トップ｜ヒーロー上ラベル' },
  { id: 'hero.headline', label: 'トップ｜ヒーロー見出し（h1）' },
  { id: 'hero.subtitle', label: 'トップ｜ヒーローリード' },
  { id: 'home.concept.title', label: 'トップ｜Concept 見出し' },
  { id: 'home.concept.body', label: 'トップ｜Concept 本文' },
  { id: 'home.style.title', label: 'トップ｜Style 見出し' },
  { id: 'home.style.lede', label: 'トップ｜Style リード' },
  { id: 'home.salon.title', label: 'トップ｜Salon 見出し' },
  { id: 'home.salon.lede', label: 'トップ｜Salon リード' },
  { id: 'home.staff.title', label: 'トップ｜Staff 見出し' },
  { id: 'home.staff1.role', label: 'トップ｜スタッフ1 肩書' },
  { id: 'home.staff1.name', label: 'トップ｜スタッフ1 名前' },
  { id: 'home.staff1.desc', label: 'トップ｜スタッフ1 紹介' },
  { id: 'home.staff2.role', label: 'トップ｜スタッフ2 肩書' },
  { id: 'home.staff2.name', label: 'トップ｜スタッフ2 名前' },
  { id: 'home.staff2.desc', label: 'トップ｜スタッフ2 紹介' },
  { id: 'home.pickup.title', label: 'トップ｜店内ピックアップ見出し' },
  { id: 'home.pickup.lede', label: 'トップ｜店内ピックアップ注記' },
  { id: 'home.pickup1.title', label: 'トップ｜内装カード1 見出し' },
  { id: 'home.pickup1.body', label: 'トップ｜内装カード1 本文' },
  { id: 'home.pickup2.title', label: 'トップ｜内装カード2 見出し' },
  { id: 'home.pickup2.body', label: 'トップ｜内装カード2 本文' },
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
    { id: `home.menu.${n}.jp`, label: `トップ｜メニューカード${n}（日本語）` },
    { id: `home.menu.${n}.price`, label: `トップ｜メニューカード${n}（価格）` },
    { id: `home.menu.${n}.desc`, label: `トップ｜メニューカード${n}（説明）` },
  ]),
  { id: 'home.reserve.title', label: 'トップ｜予約バナー見出し' },
  { id: 'home.reserve.lede', label: 'トップ｜予約バナー本文' },
  { id: 'footer.tagline', label: '共通｜フッタータグライン' },
  { id: 'footer.info', label: '共通｜フッター INFO' },
  { id: 'page.concept.title', label: 'Concept｜見出し' },
  { id: 'page.concept.body', label: 'Concept｜本文' },
  { id: 'page.concept.commit.title', label: 'Concept｜Our Policy 見出し' },
  ...[1, 2, 3, 4].flatMap((n) => [
    { id: `page.policy.${n}.title`, label: `Concept｜こだわり${n} 見出し` },
    { id: `page.policy.${n}.desc`, label: `Concept｜こだわり${n} 本文` },
  ]),
  { id: 'page.staff.title', label: 'Staff ページ｜見出し' },
  { id: 'page.staff1.desc', label: 'Staff ページ｜スタッフ1 紹介' },
  { id: 'page.staff2.desc', label: 'Staff ページ｜スタッフ2 紹介' },
  { id: 'page.staff1.quote', label: 'Staff ページ｜スタッフ1 一言' },
  { id: 'page.staff2.quote', label: 'Staff ページ｜スタッフ2 一言' },
  { id: 'page.salon.title', label: 'Salon｜見出し' },
  { id: 'page.salon.body', label: 'Salon｜本文' },
  { id: 'page.style.title', label: 'Style｜見出し' },
  { id: 'page.style.lede', label: 'Style｜リード' },
  { id: 'page.first.welcome.title', label: 'First Visit｜見出し' },
  { id: 'page.first.welcome.body', label: 'First Visit｜本文' },
  ...[1, 2, 3, 4].flatMap((n) => [
    { id: `page.first.flow.${n}.title`, label: `First｜流れ${n} タイトル` },
    { id: `page.first.flow.${n}.desc`, label: `First｜流れ${n} 説明` },
  ]),
  { id: 'page.first.policy.title', label: 'First｜ご来店にあたって 見出し' },
  { id: 'page.first.payment', label: 'First｜支払い案内' },
  { id: 'page.first.duration', label: 'First｜所要時間案内' },
  { id: 'access.mapCaption', label: 'Access｜地図キャプション' },
  { id: 'access.address', label: 'Access｜住所' },
  { id: 'access.routes', label: 'Access｜経路' },
  { id: 'access.tel', label: 'Access｜電話' },
  { id: 'access.hours', label: 'Access｜営業時間' },
  { id: 'access.payment', label: 'Access｜支払い' },
  { id: 'page.reserve.title', label: 'Reserve｜見出し' },
  { id: 'page.reserve.lede', label: 'Reserve｜本文' },
  { id: 'page.reserve.hoursBlock', label: 'Reserve｜営業時間ブロック' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `style.label.${n}`, label: `Style｜ラベル${n}` })),
];

function reEsc(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nlToBr(escHtml, text) {
  return escHtml(String(text || '')).replace(/\n/g, '<br>');
}

/**
 * @param {string} html
 * @param {Record<string, string>} slots
 * @param {(s: string) => string} escHtml
 */
export function applyBsmTextSlots(html, slots, escHtml) {
  let out = String(html || '');
  if (!slots || typeof slots !== 'object') return out;
  const esc = escHtml || ((s) => String(s));
  for (const [id, val] of Object.entries(slots)) {
    if (val == null || String(val).trim() === '') continue;
    const pattern = `<!--BSM:${reEsc(id)}-->[\\s\\S]*?<!--/BSM:${reEsc(id)}-->`;
    if (!new RegExp(pattern).test(out)) continue;
    const inner = nlToBr(esc, val);
    out = out.replace(new RegExp(pattern, 'g'), `<!--BSM:${id}-->${inner}<!--/BSM:${id}-->`);
  }
  return out;
}

/**
 * @param {string} html
 * @param {{ q: string; a: string }[]} items
 * @param {(s: string) => string} escHtml
 */
export function applyBsmFaqItems(html, items, escHtml) {
  if (!Array.isArray(items) || !items.length) return html;
  const esc = escHtml || ((s) => String(s));
  const start = html.indexOf('<div class="page" id="page-faq">');
  if (start === -1) return html;
  const end = html.indexOf('<div class="page" id="page-reserve">', start);
  if (end === -1) return html;
  let chunk = html.slice(start, end);
  const itemRe = /<div class="faq-item fade-up">[\s\S]*?<\/div>\s*<\/div>/g;
  const blocks = chunk.match(itemRe);
  if (!blocks || !blocks.length) return html;
  const n = Math.min(blocks.length, items.length);
  for (let i = 0; i < n; i++) {
    const { q, a } = items[i];
    const newBlock = `<div class="faq-item fade-up"><div class="faq-q" onclick="toggleFaq(this)"><span>${esc(
      q || '',
    )}</span><span class="faq-icon">+</span></div><div class="faq-a">${nlToBr(esc, a || '')}</div></div>`;
    chunk = chunk.replace(blocks[i], newBlock);
  }
  return html.slice(0, start) + chunk + html.slice(end);
}

/** ホットペッパー等のコピペから一部スロットを推測（写真・星評価は無視） */
export function parseHotPepperBeautyPaste(raw) {
  const out = {};
  const t = String(raw || '').replace(/\r\n/g, '\n');
  const lines = t
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const skip = (l) =>
    /の写真|（\d+件）|^\d+\.\d+$|スマート支払い|サロン情報|空席確認|ブックマーク|人気のクーポン|予約比率|年代比率|^女性$|^男性$|未設定/.test(l);

  const hpSalon = t.match(/https:\/\/beauty\.hotpepper\.jp\/[^\s<'"]+/i);
  if (hpSalon) {
    let u = hpSalon[0].trim();
    const q = u.indexOf('?');
    if (q !== -1) u = u.slice(0, q);
    u = u.replace(/["'>,).]+$/, '');
    out.beautySalonReserveUrl = u.slice(0, 2000);
  }

  const iframeBlock = t.match(/<iframe[\s\S]{0,8000}?<\/iframe>/i);
  if (iframeBlock && /google\.com\/maps|maps\.google|google\.co\.jp\/maps/i.test(iframeBlock[0])) {
    out.mapEmbedHtml = iframeBlock[0].trim().slice(0, 50000);
  }

  const head = lines.find((l) => !skip(l) && l.length > 4 && l.length < 200 && !/^¥/.test(l));
  if (head) out['hero.headline'] = head.replace(/【[^】]+】/g, '').trim().slice(0, 200);

  const addr = t.match(/(〒\s*\d{3}-\d{4}[^\n]+)/);
  if (addr) out['footer.info'] = addr[1].trim();
  const addrMulti = t.match(/〒\s*\d{3}-\d{4}[\s\S]{0,260}?(?:ビル|丁目|F|階|番地)/);
  if (addrMulti) out['access.address'] = addrMulti[0].replace(/\s+/g, ' ').trim().slice(0, 400);
  const addrTokyo = t.match(/(東京都[^\n]{10,120})/);
  if (!out['access.address'] && addrTokyo) out['access.address'] = addrTokyo[1].trim();

  const tel = t.match(/(0\d{1,4}-\d{1,4}-\d{3,4})/);
  if (tel) {
    out['access.tel'] = tel[1];
    out['footer.info'] = (out['footer.info'] ? out['footer.info'] + '\n\n' : '') + `TEL ${tel[1]}`;
  }

  const hourLines = lines.filter((l) => /[月火水木金土日祝・／]/.test(l) && /\d{1,2}\s*[:：]\s*\d{1,2}/.test(l) && l.length < 220);
  if (hourLines.length) {
    const hb = hourLines.slice(0, 12).join('\n').slice(0, 800);
    out['access.hours'] = hb;
    out['page.reserve.hoursBlock'] = hb;
  } else {
    const open = t.match(/(平日[^\n]{0,100}\d{1,2}:\d{2}[^\n]{0,150})/);
    if (open) {
      out['access.hours'] = open[1].trim();
      out['page.reserve.hoursBlock'] = open[1].trim();
    }
  }

  const closed = t.match(/(定休日[：:\s]*[^\n]{2,80})/);
  if (closed && out['access.hours']) {
    out['access.hours'] = `${out['access.hours']}\n\n${closed[1].trim()}`.slice(0, 900);
    out['page.reserve.hoursBlock'] = out['access.hours'];
  }

  const pay = t.match(/(Visa[／\/][^\n]{10,400}(?:PayPay|ペイペイ)[^\n]*)/i) || t.match(/(お支払い[：:\s]*[^\n]{10,300})/i);
  if (pay) {
    const pv = pay[0].trim();
    out['access.payment'] = pv;
    out['page.first.payment'] = pv.replace(/<br>/g, '\n').slice(0, 400);
  }

  const paras = t
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 100 && !skip(p));
  if (paras[0]) out['page.concept.body'] = paras[0].slice(0, 2000);
  if (paras[1]) out['home.concept.body'] = paras[1].slice(0, 1800);
  if (paras[2]) out['page.style.lede'] = paras[2].slice(0, 1500);

  const stIdx = t.search(/スタイリスト|ディレクター|DIRECTOR\s*\/\s*STYLIST|スタッフ紹介/i);
  if (stIdx !== -1) {
    const tail = t.slice(stIdx, stIdx + 2500);
    const blocks = tail.split(/\n{2,}/).filter((b) => b.length > 30);
    let staffN = 1;
    for (const block of blocks) {
      if (staffN > 2) break;
      if (!/[ァ-ヶーA-Za-z]{2,}/.test(block)) continue;
      const ln = block.split('\n').map((x) => x.trim()).filter(Boolean);
      const nameLine = ln.find((l) => /[／\/]/.test(l) && l.length < 100 && l.length > 3);
      if (!nameLine) continue;
      const parts = nameLine.split(/[／\/]/).map((x) => x.trim());
      const pre = `home.staff${staffN}.`;
      if (parts.length >= 2) {
        out[`${pre}role`] = parts[0].slice(0, 80);
        out[`${pre}name`] = parts[1].slice(0, 80);
      } else {
        out[`${pre}name`] = nameLine.slice(0, 80);
      }
      const rest = ln
        .filter((l) => l !== nameLine && !/^https?:/.test(l))
        .join('\n')
        .trim();
      if (rest) out[`${pre}desc`] = rest.slice(0, 600);
      staffN += 1;
    }
  }

  const couponLines = t.split('\n').filter((l) => /¥[\d,]+/.test(l) && /【|限定|カット|カラー|TR|トリートメント|パーマ|スパ/.test(l));
  couponLines.slice(0, 6).forEach((line, i) => {
    const n = i + 1;
    const pr = line.match(/¥([\d,]+)/);
    if (pr) out[`home.menu.${n}.price`] = `¥${pr[1]}<span>〜</span>`;
    out[`home.menu.${n}.desc`] = line.replace(/¥[\d,]+.*$/, '').trim().slice(0, 200);
  });

  return out;
}
