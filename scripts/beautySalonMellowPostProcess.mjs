/**
 * docs 由来の HTML から「人物＝美容師」誤解を招くスタッフ専用ページ・文言を除き、
 * スタイル（モデル撮影）として読めるようにする。generate-beauty-salon-mellow.mjs から呼ぶ。
 */
const HOME_STYLE_SECTION = `<!-- Style picks（掲載は施術イメージ・モデル撮影。特定の美容師の紹介ではありません） -->
<section style="background:var(--cream)">
  <div style="max-width:1200px;margin:0 auto">
    <div class="section-label fade-up">Style</div>
    <h2 class="section-title fade-up delay-1">ピックアップスタイル</h2>
    <p class="section-text fade-up delay-2" style="text-align:center;max-width:640px;margin:12px auto 0;font-size:0.85rem;opacity:0.85">掲載の人物写真は、仕上がりのイメージを伝えるためのモデル撮影です。スタッフの肖像ではありません。</p>
  </div>
  <div class="staff-grid">
    <div class="staff-card fade-up">
      <div class="staff-img"><img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80" alt="やわらかボブのスタイルイメージ"></div>
      <div>
        <div class="staff-name"><small>STYLE — BOB</small>やわらかボブ</div>
        <p class="staff-desc">顔まわりに軽さを出しつつ、扱いやすい長さ感に。骨格に合わせたシルエットのご提案イメージです。</p>
        <div class="staff-tags"><span class="staff-tag">ショート</span><span class="staff-tag">ボブ</span><span class="staff-tag">質感</span></div>
      </div>
    </div>
    <div class="staff-card fade-up delay-1">
      <div class="staff-img"><img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80" alt="ミディアム〜ロングのスタイルイメージ"></div>
      <div>
        <div class="staff-name"><small>STYLE — MEDIUM</small>ナチュラルウェーブ</div>
        <p class="staff-desc">やわらかな動きと透明感カラーを意識した、女性らしいラインのイメージです。</p>
        <div class="staff-tags"><span class="staff-tag">ミディアム</span><span class="staff-tag">透明感カラー</span><span class="staff-tag">ロング</span></div>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:48px"><a class="btn-outline" onclick="showPage('style')">Style gallery →</a></div>
</section>
`;

const STYLE_GALLERY_NOTE =
  '<br><small style="display:block;margin-top:1em;opacity:0.85">※ギャラリー写真は施術のイメージを伝えるためのモデル撮影であり、特定のスタッフを指すものではありません。</small>';

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
  if (galleryP.test(out) && !out.includes('特定のスタッフを指す')) {
    out = out.replace(galleryP, (m) => m.replace('</p>', `${STYLE_GALLERY_NOTE}</p>`));
  }

  out = out.replace(/(<div class="mobile-menu"[\s\S]*?<\/div>)/, (block) =>
    block.replace(/\n\s{2,8}<a onclick="showPage/g, '\n  <a onclick="showPage'),
  );

  return out;
}
