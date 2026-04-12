/**
 * docs 由来の HTML から「人物＝美容師」誤解を招くスタッフ専用ページ・文言を除き、
 * スタイル（モデル撮影）として読めるようにする。generate-beauty-salon-mellow.mjs から呼ぶ。
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

const STYLE_GALLERY_NOTE =
  '<br><small style="display:block;margin-top:1em;opacity:0.85">※写真は当サロンの内装・外観です。</small>';

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

/** Salon / Style / FAQ の見出しは内装のみ（外観が当たらないよう上書き） */
function forceSalonStyleFaqInteriorHeroes(html) {
  let out = forcePageSubHeroBg(html, 'salon', '/beauty-salon-mellow/interior-floor.png');
  out = forcePageSubHeroBg(out, 'style', '/beauty-salon-mellow/interior-entrance.png');
  out = forcePageSubHeroBg(out, 'faq', '/beauty-salon-mellow/interior-shampoo.png');
  return out;
}

export function postProcessBeautySalonMellowBody(body) {
  let out = String(body || '');

  out = out.replace(/<!-- Staff -->[\s\S]*?(?=<!-- Menu -->)/m, HOME_STYLE_SECTION);

  const salonMarker = '<div class="page" id="page-salon">';
  const salonIdx = out.indexOf(salonMarker);
  if (salonIdx !== -1) {
    const before = out.slice(0, salonIdx);
    const staffPageStart = before.lastIndexOf('<div class="page" id="page-staff">');
    if (staffPageStart !== -1) {
      out = before.slice(0, staffPageStart) + salonMarker + out.slice(salonIdx + salonMarker.length);
    }
  }

  out = out.replace(/\n\s*<a onclick="showPage\('staff'\)">Staff<\/a>/g, '');
  out = out.replace(/<a onclick="showPage\('staff'\);closeMobileMenu\(\)">Staff<\/a>\s*\n/g, '');
  out = out.replace(
    /<a onclick="showPage\('staff'\)">Staff<\/a>/g,
    '<a onclick="showPage(\'style\')">Style</a>',
  );
  out = out.replace(
    /<a onclick="showPage\('staff'\);closeMobileMenu\(\)">Staff<\/a>/g,
    '<a onclick="showPage(\'style\');closeMobileMenu()">Style</a>',
  );

  if (!out.includes(`if(id==='staff')`)) {
    out = out.replace(
      /function showPage\(id\)\{\s*/,
      `function showPage(id){\n  if(id==='staff')id='style';\n  `,
    );
  }

  if (/<nav>[\s\S]*?<\/nav>/.test(out) && !/<nav>[\s\S]*?showPage\('style'\)[\s\S]*?<\/nav>/.test(out)) {
    out = out.replace(
      /(<a onclick="showPage\('menu'\)">Menu<\/a>)(\s*\n\s*)(<a onclick="showPage\('salon'\)">Salon<\/a>)/,
      `$1$2<a onclick="showPage('style')">Style</a>$2$3`,
    );
  }

  const galleryP =
    /<p class="section-text fade-up delay-2">自然体の中に少しの洗練を感じるスタイルを大切にしています。<br>特に、ショート・ボブ・ミディアムのやわらかい質感づくりが得意です。<\/p>/;
  if (galleryP.test(out) && !out.includes('当サロンの内装')) {
    out = out.replace(galleryP, (m) => m.replace('</p>', `${STYLE_GALLERY_NOTE}</p>`));
  }

  out = rewriteUnsplashToMellowSalonAssets(out);
  out = forceAccessPageExterior(out);
  out = forceReservePageEntrance(out);
  out = forceSalonStyleFaqInteriorHeroes(out);

  out = out.replace('<!-- Style gallery: 人物写真のみ -->', '<!-- Salon interior / exterior -->');
  out = out.replace('>得意なスタイル<', '>店内・外観の雰囲気<');
  out = out.replace(
    'ショート・ボブ・ミディアムのやわらかい質感づくりを中心に、一人ひとりに似合うスタイルをご提案します。',
    '受付・セット面・シャンプー台など、店内の雰囲気と店頭の外観をご覧ください。',
  );
  out = out.replace('>スタイルギャラリー<', '>サロンの景色<');
  out = out
    .split(
      '自然体の中に少しの洗練を感じるスタイルを大切にしています。<br>特に、ショート・ボブ・ミディアムのやわらかい質感づくりが得意です。',
    )
    .join('木と光、緑を取り入れた落ち着いた空間です。<br>ご来店前に、店内のイメージをお伝えします。');
  out = out.replace('※ギャラリー写真は施術のイメージを伝えるためのモデル撮影であり、特定のスタッフを指すものではありません。', '※写真は当サロンの内装・外観です。');
  out = out.replace('alt="ロングスタイル"', 'alt="店内の様子"');
  out = out.replace('alt="施術シーン"', 'alt="店内"');
  const galleryAltLabels = [
    ['<span class="gallery-label">Short — やわらかなショート</span>', '<span class="gallery-label">セット面</span>'],
    ['<span class="gallery-label">Bob — ふわっとしたボブ</span>', '<span class="gallery-label">シャンプー</span>'],
    ['<span class="gallery-label">Bob — すっきりボブ</span>', '<span class="gallery-label">受付</span>'],
    ['<span class="gallery-label">Medium — ナチュラルウェーブ</span>', '<span class="gallery-label">外観</span>'],
    ['<span class="gallery-label">Long — やわらかなロング</span>', '<span class="gallery-label">エントランス</span>'],
    ['<span class="gallery-label">Short — ソフトショート</span>', '<span class="gallery-label">店内</span>'],
    ['<span class="gallery-label">Bob / Clean</span>', '<span class="gallery-label">受付</span>'],
    ['<span class="gallery-label">Short / Soft</span>', '<span class="gallery-label">セット面</span>'],
    ['<span class="gallery-label">Short</span>', '<span class="gallery-label">セット面</span>'],
    ['<span class="gallery-label">Bob</span>', '<span class="gallery-label">シャンプー</span>'],
    ['<span class="gallery-label">Medium</span>', '<span class="gallery-label">外観</span>'],
    ['<span class="gallery-label">Long</span>', '<span class="gallery-label">エントランス</span>'],
    ['alt="ショート"', 'alt="店内（セット面）"'],
    ['alt="ボブ"', 'alt="シャンプー台"'],
    ['alt="ミディアム"', 'alt="店舗外観"'],
    ['alt="ロング"', 'alt="エントランス"'],
    ['alt="ボブ2"', 'alt="受付カウンター"'],
    ['alt="ショート2"', 'alt="店内（セット面）"'],
    ['alt="Bob Wavy"', 'alt="店内"'],
    ['alt="Bob Clean"', 'alt="店内"'],
    ['alt="Short Dark"', 'alt="店内"'],
  ];
  for (const [a, b] of galleryAltLabels) {
    out = out.split(a).join(b);
  }

  out = out.replace(/(<div class="mobile-menu"[\s\S]*?<\/div>)/, (block) =>
    block.replace(/\n\s{2,8}<a onclick="showPage/g, '\n  <a onclick="showPage'),
  );

  return out;
}
