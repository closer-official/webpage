/**
 * docs 由来の HTML から「人物＝美容師」誤解を招くスタッフ専用ページ・文言を除き、
 * スタイルは public の style-hair 6枚に統一する。generate-beauty-salon-mellow.mjs から呼ぶ。
 */
const HOME_STYLE_SECTION = `<!-- 店内ピックアップ（内装写真のみ） -->
<section style="background:var(--cream)">
  <div style="max-width:1200px;margin:0 auto">
    <div class="section-label fade-up">Salon</div>
    <h2 class="section-title fade-up delay-1">店内の雰囲気</h2>
    <p class="section-text fade-up delay-2" style="text-align:center;max-width:640px;margin:12px auto 0;font-size:0.85rem;opacity:0.85">掲載は実店舗の内装イメージです（人物写真は使用していません）。</p>
  </div>
  <div class="staff-grid">
    <div class="staff-card fade-up">
      <div class="staff-img"><img src="/beauty-salon-mellow/interior-reception.png" alt="受付エリア"></div>
      <div>
        <div class="staff-name"><small>RECEPTION</small>受付・カウンター</div>
        <p class="staff-desc">木の温もりとやわらかな光の受付スペース。ご予約の確認やご相談は、落ち着いた雰囲気の中でお受けしています。</p>
        <div class="staff-tags"><span class="staff-tag">木の質感</span><span class="staff-tag">グリーン</span><span class="staff-tag">やわらかな照明</span></div>
      </div>
    </div>
    <div class="staff-card fade-up delay-1">
      <div class="staff-img"><img src="/beauty-salon-mellow/interior-floor.png" alt="セット面"></div>
      <div>
        <div class="staff-name"><small>FLOOR</small>セット面</div>
        <p class="staff-desc">ゆとりのあるミラー越しの明るさと、集中して過ごせる距離感を大切にした施術スペースです。</p>
        <div class="staff-tags"><span class="staff-tag">ミラー</span><span class="staff-tag">ペンダント照明</span><span class="staff-tag">観葉植物</span></div>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:48px"><a class="btn-outline" onclick="showPage('salon')">Salon 詳細 →</a></div>
</section>
`;

/** Style セクション（トップ・Style ページ）のギャラリー6枚 — ヘアカタログ用 */
const MELLOW_STYLE_HAIR_SRC = [
  '/beauty-salon-mellow/style-hair-01.png',
  '/beauty-salon-mellow/style-hair-02.png',
  '/beauty-salon-mellow/style-hair-03.png',
  '/beauty-salon-mellow/style-hair-04.png',
  '/beauty-salon-mellow/style-hair-05.png',
  '/beauty-salon-mellow/style-hair-06.png',
];

/** Unsplash を public の内装・外装5枚に順に差し替え（人物ストックを使わない） */
const MELLOW_BUILTIN_IMAGES = [
  '/beauty-salon-mellow/interior-entrance.png',
  '/beauty-salon-mellow/interior-reception.png',
  '/beauty-salon-mellow/interior-floor.png',
  '/beauty-salon-mellow/interior-shampoo.png',
  '/beauty-salon-mellow/exterior-facade.png',
];

export function rewriteUnsplashToMellowSalonAssets(html) {
  let i = 0;
  return String(html || '').replace(
    /https:\/\/images\.unsplash\.com\/photo-[0-9a-zA-Z-]+(?:\?[^'")\s>]*)?/g,
    () => MELLOW_BUILTIN_IMAGES[i++ % MELLOW_BUILTIN_IMAGES.length],
  );
}

/** Access ページの見出し写真・地図横の大きい写真を外観に固定 */
function forceAccessPageExterior(html) {
  const start = html.indexOf('<div class="page" id="page-access">');
  if (start === -1) return html;
  const end = html.indexOf('<div class="page" id="page-faq">', start);
  if (end === -1) return html;
  let chunk = html.slice(start, end);
  chunk = chunk.replace(
    /<div class="sub-hero-img" style="background-image:url\('[^']*'\)/,
    "<div class=\"sub-hero-img\" style=\"background-image:url('/beauty-salon-mellow/exterior-facade.png')",
  );
  chunk = chunk.replace(
    /(<div class="access-map[^>]*>\s*<img src=")[^"]+/,
    "$1/beauty-salon-mellow/exterior-facade.png",
  );
  return html.slice(0, start) + chunk + html.slice(end);
}

/** 予約ページのサブヒーローをエントランス内観に固定 */
function forceReservePageEntrance(html) {
  const start = html.indexOf('<div class="page" id="page-reserve">');
  if (start === -1) return html;
  const end = html.indexOf('<div class="mobile-cta">', start);
  const sliceEnd = end === -1 ? html.length : end;
  let chunk = html.slice(start, sliceEnd);
  chunk = chunk.replace(
    /<div class="sub-hero-img" style="background-image:url\('[^']*'\)/,
    "<div class=\"sub-hero-img\" style=\"background-image:url('/beauty-salon-mellow/interior-entrance.png')",
  );
  return html.slice(0, start) + chunk + html.slice(sliceEnd);
}

function forcePageSubHeroBg(html, pageId, url) {
  const marker = `<div class="page" id="page-${pageId}">`;
  const start = html.indexOf(marker);
  if (start === -1) return html;
  const next = html.indexOf('<div class="page" id="page-', start + marker.length);
  const end = next === -1 ? html.length : next;
  let chunk = html.slice(start, end);
  chunk = chunk.replace(
    /<div class="sub-hero-img" style="background-image:url\('[^']*'\)/,
    `<div class="sub-hero-img" style="background-image:url('${url}')`,
  );
  return html.slice(0, start) + chunk + html.slice(end);
}

/** 各ページサブヒーロー。Style / Staff のトップ帯はギャラリー用の店舗（内装）写真。 */
function forceSalonStyleFaqInteriorHeroes(html) {
  let out = forcePageSubHeroBg(html, 'salon', '/beauty-salon-mellow/interior-floor.png');
  out = forcePageSubHeroBg(out, 'style', '/beauty-salon-mellow/interior-entrance.png');
  out = forcePageSubHeroBg(out, 'staff', '/beauty-salon-mellow/interior-reception.png');
  out = forcePageSubHeroBg(out, 'faq', '/beauty-salon-mellow/interior-shampoo.png');
  return out;
}

function patchGalleryGridImgSrcsToStyleHair(gridInner) {
  let i = 0;
  return gridInner.replace(/(<div class="gallery-item[^>]*>\s*<img src=")([^"]+)(")/g, (_m, a, _b, c) => {
    const u = MELLOW_STYLE_HAIR_SRC[Math.min(i, MELLOW_STYLE_HAIR_SRC.length - 1)];
    i += 1;
    return a + u + c;
  });
}

/** トップの Style 6枚グリッドと Style 専用ページのギャラリーを内装URLから必ず差し替え */
function ensureMellowStyleGalleryHairImages(html) {
  let out = String(html || '');
  const pageStyleRe =
    /(<div class="page" id="page-style">[\s\S]*?<div class="gallery-grid">)([\s\S]*?)(<\/div>\s*<\/section>\s*<section class="reserve-banner">)/;
  out = out.replace(pageStyleRe, (_m, pre, grid, post) => pre + patchGalleryGridImgSrcsToStyleHair(grid) + post);
  const homeStyleRe =
    /(<div class="section-label fade-up">Style<\/div>[\s\S]*?<div class="gallery-grid">)([\s\S]*?)(<\/div>\s*<div style="text-align:center;margin-top:48px"><a class="btn-outline" onclick="showPage\('style'\)">View all styles →<\/a><\/div>\s*<\/section>)/;
  out = out.replace(homeStyleRe, (_m, pre, grid, post) => pre + patchGalleryGridImgSrcsToStyleHair(grid) + post);
  return out;
}

export function postProcessBeautySalonMellowBody(body) {
  let out = String(body || '');

  /** ホーム内「Staff」ブロックの直後に、内装ピックアップ（人物なし）を差し込む */
  const staffBlockEnd = /(<!-- Staff -->[\s\S]*?<\/section>\s*\n)(?=<!-- Menu -->)/m;
  if (staffBlockEnd.test(out)) {
    out = out.replace(staffBlockEnd, `$1${HOME_STYLE_SECTION}\n`);
  }

  if (/<nav>[\s\S]*?<\/nav>/.test(out) && !/<nav>[\s\S]*?showPage\('style'\)[\s\S]*?<\/nav>/.test(out)) {
    out = out.replace(
      /(<a onclick="showPage\('menu'\)">Menu<\/a>)(\s*\n\s*)(<a onclick="showPage\('staff'\)">Staff<\/a>)/,
      `$1$2$3$2<a onclick="showPage('style')">Style</a>`,
    );
  }

  out = rewriteUnsplashToMellowSalonAssets(out);
  out = forceAccessPageExterior(out);
  out = forceReservePageEntrance(out);
  out = forceSalonStyleFaqInteriorHeroes(out);

  out = ensureMellowStyleGalleryHairImages(out);

  out = out.replace(/(<div class="mobile-menu"[\s\S]*?<\/div>)/, (block) =>
    block.replace(/\n\s{2,8}<a onclick="showPage/g, '\n  <a onclick="showPage'),
  );

  return out;
}
