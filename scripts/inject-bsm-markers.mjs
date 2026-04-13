/**
 * server/beautySalonMellow/generated-body.html に <!--BSM:id--> マーカーを挿入（冪等）
 * node scripts/inject-bsm-markers.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const p = path.join(root, 'server', 'beautySalonMellow', 'generated-body.html');

let h = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
/** ベースマーカー済みで policy だけ未注入の HTML への追補（MD 再生成のあとなど） */
if (h.includes('<!--BSM:hero.headline-->') && !h.includes('<!--BSM:page.policy.1.title-->')) {
  const repP = (a, b) => {
    if (!h.includes(a)) throw new Error('policy anchor not found: ' + a.slice(0, 80).replace(/\n/g, '\\n'));
    h = h.split(a).join(b);
  };
  repP(
    '<div class="policy-card fade-up"><div class="policy-num">01</div><div class="policy-title">扱いやすさを大切にしたカット</div><p class="policy-desc">乾かしただけでもまとまりやすく、毎日のスタイリングが少し楽になるように。骨格や毛流れを見ながら、自然に馴染むシルエットに整えます。</p></div>',
    '<div class="policy-card fade-up"><div class="policy-num">01</div><div class="policy-title"><!--BSM:page.policy.1.title-->扱いやすさを大切にしたカット<!--/BSM:page.policy.1.title--></div><p class="policy-desc"><!--BSM:page.policy.1.desc-->乾かしただけでもまとまりやすく、毎日のスタイリングが少し楽になるように。骨格や毛流れを見ながら、自然に馴染むシルエットに整えます。<!--/BSM:page.policy.1.desc--></p></div>',
  );
  repP(
    '<div class="policy-card fade-up delay-1"><div class="policy-num">02</div><div class="policy-title">やわらかく見える質感づくり</div><p class="policy-desc">軽すぎず、重すぎず。毛先の動きや表面のやわらかさを大切にしながら、上品に見える質感をつくります。</p></div>',
    '<div class="policy-card fade-up delay-1"><div class="policy-num">02</div><div class="policy-title"><!--BSM:page.policy.2.title-->やわらかく見える質感づくり<!--/BSM:page.policy.2.title--></div><p class="policy-desc"><!--BSM:page.policy.2.desc-->軽すぎず、重すぎず。毛先の動きや表面のやわらかさを大切にしながら、上品に見える質感をつくります。<!--/BSM:page.policy.2.desc--></p></div>',
  );
  repP(
    '<div class="policy-card fade-up delay-2"><div class="policy-num">03</div><div class="policy-title">初めての方でも相談しやすい空間</div><p class="policy-desc">「似合う髪型が分からない」「短くしたいけれど不安がある」そんなご相談も歓迎しています。カウンセリングの時間を大切にしながら、無理のないご提案を行います。</p></div>',
    '<div class="policy-card fade-up delay-2"><div class="policy-num">03</div><div class="policy-title"><!--BSM:page.policy.3.title-->初めての方でも相談しやすい空間<!--/BSM:page.policy.3.title--></div><p class="policy-desc"><!--BSM:page.policy.3.desc-->「似合う髪型が分からない」「短くしたいけれど不安がある」そんなご相談も歓迎しています。カウンセリングの時間を大切にしながら、無理のないご提案を行います。<!--/BSM:page.policy.3.desc--></p></div>',
  );
  repP(
    '<div class="policy-card fade-up delay-3"><div class="policy-num">04</div><div class="policy-title">落ち着いて過ごせる店内</div><p class="policy-desc">明るくやわらかな光が入る空間で、ゆったりとお過ごしいただけます。シャンプーブースも落ち着いた雰囲気で、リラックスしやすい設計です。</p></div>',
    '<div class="policy-card fade-up delay-3"><div class="policy-num">04</div><div class="policy-title"><!--BSM:page.policy.4.title-->落ち着いて過ごせる店内<!--/BSM:page.policy.4.title--></div><p class="policy-desc"><!--BSM:page.policy.4.desc-->明るくやわらかな光が入る空間で、ゆったりとお過ごしいただけます。シャンプーブースも落ち着いた雰囲気で、リラックスしやすい設計です。<!--/BSM:page.policy.4.desc--></p></div>',
  );
  fs.writeFileSync(p, h, 'utf8');
  console.log('wrote policy-only BSM markers', p);
  process.exit(0);
}
if (h.includes('<!--BSM:hero.headline-->')) {
  console.log('markers already present, skip');
  process.exit(0);
}

const rep = (a, b) => {
  if (!h.includes(a)) throw new Error('anchor not found: ' + a.slice(0, 80).replace(/\n/g, '\\n'));
  h = h.split(a).join(b);
};

rep('<div class="hero-label">OMOTESANDO HAIR SALON</div>', '<div class="hero-label"><!--BSM:hero.label-->OMOTESANDO HAIR SALON<!--/BSM:hero.label--></div>');
rep('<h1 class="hero-title">', '<h1 class="hero-title"><!--BSM:hero.headline-->');
rep('</h1>\n    <p class="hero-subtitle">', '<!--/BSM:hero.headline--></h1>\n    <p class="hero-subtitle">');
rep('<p class="hero-subtitle">', '<p class="hero-subtitle"><!--BSM:hero.subtitle-->');
rep('</p>\n    <div class="hero-actions">', '<!--/BSM:hero.subtitle--></p>\n    <div class="hero-actions">');

rep('<div class="section-label fade-up">Concept</div>\n      <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up">Concept</div>\n      <h2 class="section-title fade-up delay-1"><!--BSM:home.concept.title-->');
rep('</h2>\n      <p class="section-text fade-up delay-2">表参道の静かな通り沿いにある、', '<!--/BSM:home.concept.title--></h2>\n      <p class="section-text fade-up delay-2"><!--BSM:home.concept.body-->表参道の静かな通り沿いにある、');
rep('気分よく過ごせることを大切にしています。</p>\n      <div class="fade-up delay-3"', '気分よく過ごせることを大切にしています。<!--/BSM:home.concept.body--></p>\n      <div class="fade-up delay-3"');

rep('<div class="section-label fade-up">Style</div>\n    <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up">Style</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:home.style.title-->');
rep('</h2>\n    <p class="section-text fade-up delay-2">ショート・ボブ・ミディアム', '<!--/BSM:home.style.title--></h2>\n    <p class="section-text fade-up delay-2"><!--BSM:home.style.lede-->ショート・ボブ・ミディアム');
rep('ご提案します。</p>\n  </div>\n  <div class="gallery-grid">', 'ご提案します。<!--/BSM:home.style.lede--></p>\n  </div>\n  <div class="gallery-grid">');

rep('<!-- Salon interior: 店内写真のみ -->\n<section style="background:var(--ivory)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Salon</div>\n    <h2 class="section-title fade-up delay-1">', '<!-- Salon interior: 店内写真のみ -->\n<section style="background:var(--ivory)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Salon</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:home.salon.title-->');
rep('</h2>\n    <p class="section-text fade-up delay-2">明るくやわらかな光が入る空間で', '<!--/BSM:home.salon.title--></h2>\n    <p class="section-text fade-up delay-2"><!--BSM:home.salon.lede-->明るくやわらかな光が入る空間で');
rep('お過ごしいただけます。</p>\n  </div>\n  <div class="interior-trio fade-up">', 'お過ごしいただけます。<!--/BSM:home.salon.lede--></p>\n  </div>\n  <div class="interior-trio fade-up">');

rep('<!-- Staff -->\n<section style="background:var(--cream)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Staff</div>\n    <h2 class="section-title fade-up delay-1">', '<!-- Staff -->\n<section style="background:var(--cream)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Staff</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:home.staff.title-->');
rep('</h2>\n  </div>\n  <div class="staff-grid">\n    <div class="staff-card fade-up">', '<!--/BSM:home.staff.title--></h2>\n  </div>\n  <div class="staff-grid">\n    <div class="staff-card fade-up">');

rep('<div class="staff-name"><small>DIRECTOR / STYLIST</small>Kaito Nagase</div>\n        <p class="staff-desc">やわらかいショートや扱いやすいボブスタイルが得意です。骨格や髪質を見ながら、自然に似合うバランスをご提案します。</p>\n        <div class="staff-tags"><span class="staff-tag">ショート</span><span class="staff-tag">ボブ</span><span class="staff-tag">顔まわり似合わせ</span>', '<div class="staff-name"><small><!--BSM:home.staff1.role-->DIRECTOR / STYLIST<!--/BSM:home.staff1.role--></small><!--BSM:home.staff1.name-->Kaito Nagase<!--/BSM:home.staff1.name--></div>\n        <p class="staff-desc"><!--BSM:home.staff1.desc-->やわらかいショートや扱いやすいボブスタイルが得意です。骨格や髪質を見ながら、自然に似合うバランスをご提案します。<!--/BSM:home.staff1.desc--></p>\n        <div class="staff-tags"><span class="staff-tag">ショート</span><span class="staff-tag">ボブ</span><span class="staff-tag">顔まわり似合わせ</span>');

rep('<div class="staff-name"><small>STYLIST</small>Mizuki Arai</div>\n        <p class="staff-desc">ミディアムからロングまで、やわらかさと女性らしさのあるスタイルが得意です。透明感カラーも大切にしています。</p>\n        <div class="staff-tags"><span class="staff-tag">ミディアム</span><span class="staff-tag">透明感カラー</span><span class="staff-tag">ロング</span>', '<div class="staff-name"><small><!--BSM:home.staff2.role-->STYLIST<!--/BSM:home.staff2.role--></small><!--BSM:home.staff2.name-->Mizuki Arai<!--/BSM:home.staff2.name--></div>\n        <p class="staff-desc"><!--BSM:home.staff2.desc-->ミディアムからロングまで、やわらかさと女性らしさのあるスタイルが得意です。透明感カラーも大切にしています。<!--/BSM:home.staff2.desc--></p>\n        <div class="staff-tags"><span class="staff-tag">ミディアム</span><span class="staff-tag">透明感カラー</span><span class="staff-tag">ロング</span>');

rep('<!-- 店内ピックアップ（内装写真のみ） -->\n<section style="background:var(--cream)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Salon</div>\n    <h2 class="section-title fade-up delay-1">', '<!-- 店内ピックアップ（内装写真のみ） -->\n<section style="background:var(--cream)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Salon</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:home.pickup.title-->');
rep('</h2>\n    <p class="section-text fade-up delay-2" style="text-align:center;max-width:640px;margin:12px auto 0;font-size:0.85rem;opacity:0.85">掲載は実店舗', '<!--/BSM:home.pickup.title--></h2>\n    <p class="section-text fade-up delay-2" style="text-align:center;max-width:640px;margin:12px auto 0;font-size:0.85rem;opacity:0.85"><!--BSM:home.pickup.lede-->掲載は実店舗');
rep('使用していません）。</p>\n  </div>\n  <div class="staff-grid">', '使用していません）。<!--/BSM:home.pickup.lede--></p>\n  </div>\n  <div class="staff-grid">');

rep('<div class="staff-name"><small>RECEPTION</small>受付・カウンター</div>\n        <p class="staff-desc">木の温もりとやわらかな光の受付スペース。', '<div class="staff-name"><small>RECEPTION</small><!--BSM:home.pickup1.title-->受付・カウンター<!--/BSM:home.pickup1.title--></div>\n        <p class="staff-desc"><!--BSM:home.pickup1.body-->木の温もりとやわらかな光の受付スペース。');
rep('お受けしています。</p>\n        <div class="staff-tags"><span class="staff-tag">木の質感</span>', 'お受けしています。<!--/BSM:home.pickup1.body--></p>\n        <div class="staff-tags"><span class="staff-tag">木の質感</span>');

rep('<div class="staff-name"><small>FLOOR</small>セット面</div>\n        <p class="staff-desc">ゆとりのあるミラー越しの明るさと', '<div class="staff-name"><small>FLOOR</small><!--BSM:home.pickup2.title-->セット面<!--/BSM:home.pickup2.title--></div>\n        <p class="staff-desc"><!--BSM:home.pickup2.body-->ゆとりのあるミラー越しの明るさと');
rep('施術スペースです。</p>\n        <div class="staff-tags"><span class="staff-tag">ミラー</span>', '施術スペースです。<!--/BSM:home.pickup2.body--></p>\n        <div class="staff-tags"><span class="staff-tag">ミラー</span>');

const menus = [
  ['カット', '7,150', '骨格や毛流れを見ながら、自然に馴染むシルエットに。', 1],
  ['カラー', '8,250', 'やわらかく透明感のある発色を大切にしたカラーリング。', 2],
  ['パーマ', '8,800', '軽さとまとまりのある、自然なカールスタイルを。', 3],
  ['トリートメント', '3,300', '艶とやわらかさを引き出す丁寧なトリートメント。', 4],
  ['ストレート', '12,100', '扱いやすく、上品にまとまるストレートパーマ。', 5],
  ['ヘッドスパ', '2,750', '頭皮からリフレッシュ。日常の疲れをほぐします。', 6],
];
for (const [jp, price, desc, n] of menus) {
  rep(`<div class="menu-card-jp">${jp}</div>`, `<div class="menu-card-jp"><!--BSM:home.menu.${n}.jp-->${jp}<!--/BSM:home.menu.${n}.jp--></div>`);
  rep(`<div class="menu-card-price">¥${price}<span>〜</span></div>`, `<div class="menu-card-price"><!--BSM:home.menu.${n}.price-->¥${price}<span>〜</span><!--/BSM:home.menu.${n}.price--></div>`);
  rep(`<div class="menu-card-desc">${desc}</div>`, `<div class="menu-card-desc"><!--BSM:home.menu.${n}.desc-->${desc}<!--/BSM:home.menu.${n}.desc--></div>`);
}

rep('<!-- Reserve -->\n<section class="reserve-banner">\n  <div class="section-label fade-up">Reserve</div>\n  <h2 class="section-title fade-up delay-1">', '<!-- Reserve -->\n<section class="reserve-banner">\n  <div class="section-label fade-up">Reserve</div>\n  <h2 class="section-title fade-up delay-1"><!--BSM:home.reserve.title-->');
rep('</h2>\n  <p class="section-text fade-up delay-2">ご予約は24時間WEBから承っております', '<!--/BSM:home.reserve.title--></h2>\n  <p class="section-text fade-up delay-2"><!--BSM:home.reserve.lede-->ご予約は24時間WEBから承っております');
rep('ご相談ください。</p>\n  <div class="reserve-actions fade-up delay-3">', 'ご相談ください。<!--/BSM:home.reserve.lede--></p>\n  <div class="reserve-actions fade-up delay-3">');

h = h.replace(
  /<p class="footer-tagline">([\s\S]*?)<\/p>/g,
  '<p class="footer-tagline"><!--BSM:footer.tagline-->$1<!--/BSM:footer.tagline--></p>',
);
h = h.replace(
  /<div class="footer-info">([\s\S]*?)<\/div>/g,
  '<div class="footer-info"><!--BSM:footer.info-->$1<!--/BSM:footer.info--></div>',
);

rep('<div class="section-label fade-up">Philosophy</div>\n      <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up">Philosophy</div>\n      <h2 class="section-title fade-up delay-1"><!--BSM:page.concept.title-->');
rep('</h2>\n      <p class="section-text fade-up delay-2">mellow by luceが大切にしているのは', '<!--/BSM:page.concept.title--></h2>\n      <p class="section-text fade-up delay-2"><!--BSM:page.concept.body-->mellow by luceが大切にしているのは');
rep('ご提案します。</p>\n    </div>\n  </div>\n</section>\n<section style="background:var(--cream)">', 'ご提案します。<!--/BSM:page.concept.body--></p>\n    </div>\n  </div>\n</section>\n<section style="background:var(--cream)">');

rep('<section style="background:var(--cream)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Our Policy</div>\n    <h2 class="section-title fade-up delay-1">', '<section style="background:var(--cream)">\n  <div style="max-width:1200px;margin:0 auto">\n    <div class="section-label fade-up">Our Policy</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:page.concept.commit.title-->');
rep('</h2>\n  </div>\n  <div class="policy-grid">', '<!--/BSM:page.concept.commit.title--></h2>\n  </div>\n  <div class="policy-grid">');

rep('<div class="section-label fade-up">Team</div>\n    <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up">Team</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:page.staff.title-->');
rep('</h2>\n  </div>\n  <div class="staff-grid" style="max-width:900px', '<!--/BSM:page.staff.title--></h2>\n  </div>\n  <div class="staff-grid" style="max-width:900px');

rep('<p class="staff-desc">やわらかいショートや、扱いやすいボブスタイルが得意です。骨格や髪質を見ながら、自然に似合うバランスをご提案します。初めての方にも緊張せず過ごしていただけるよう、丁寧なカウンセリングを心がけています。</p>\n        <p class="staff-quote">「変えすぎなくても、', '<p class="staff-desc"><!--BSM:page.staff1.desc-->やわらかいショートや、扱いやすいボブスタイルが得意です。骨格や髪質を見ながら、自然に似合うバランスをご提案します。初めての方にも緊張せず過ごしていただけるよう、丁寧なカウンセリングを心がけています。<!--/BSM:page.staff1.desc--></p>\n        <p class="staff-quote"><!--BSM:page.staff1.quote-->「変えすぎなくても、');
rep('気分が整うヘアを大切にしています。」</p>\n        <div class="staff-tags"><span class="staff-tag">ショート</span><span class="staff-tag">ボブ</span><span class="staff-tag">メンズ</span><span class="staff-tag">顔まわり</span>', '気分が整うヘアを大切にしています。」<!--/BSM:page.staff1.quote--></p>\n        <div class="staff-tags"><span class="staff-tag">ショート</span><span class="staff-tag">ボブ</span><span class="staff-tag">メンズ</span><span class="staff-tag">顔まわり</span>');

rep('<p class="staff-desc">ミディアムからロングまで、やわらかさと女性らしさのあるスタイルが得意です。髪をきれいに見せたい方、自然に垢抜けたい方、初めてでどう伝えればいいか不安な方も、安心してご相談ください。</p>\n        <p class="staff-quote">「日常に自然になじむ、', '<p class="staff-desc"><!--BSM:page.staff2.desc-->ミディアムからロングまで、やわらかさと女性らしさのあるスタイルが得意です。髪をきれいに見せたい方、自然に垢抜けたい方、初めてでどう伝えればいいか不安な方も、安心してご相談ください。<!--/BSM:page.staff2.desc--></p>\n        <p class="staff-quote"><!--BSM:page.staff2.quote-->「日常に自然になじむ、');
rep('無理のないきれいさをご提案します。」</p>\n        <div class="staff-tags"><span class="staff-tag">ミディアム</span><span class="staff-tag">ロング</span><span class="staff-tag">透明感カラー</span><span class="staff-tag">質感</span>', '無理のないきれいさをご提案します。」<!--/BSM:page.staff2.quote--></p>\n        <div class="staff-tags"><span class="staff-tag">ミディアム</span><span class="staff-tag">ロング</span><span class="staff-tag">透明感カラー</span><span class="staff-tag">質感</span>');

rep('<div class="section-label fade-up">Salon</div>\n      <h2 class="section-title fade-up delay-1">木のぬくもりと<br>やわらかな光の空間</h2>\n      <p class="section-text fade-up delay-2">', '<div class="section-label fade-up">Salon</div>\n      <h2 class="section-title fade-up delay-1"><!--BSM:page.salon.title-->木のぬくもりと<br>やわらかな光の空間<!--/BSM:page.salon.title--></h2>\n      <p class="section-text fade-up delay-2"><!--BSM:page.salon.body-->');
rep('リラックスしやすい落ち着いた雰囲気です。</p>\n    </div>\n    <div class="photo-frame landscape deco fade-up delay-1">', 'リラックスしやすい落ち着いた雰囲気です。<!--/BSM:page.salon.body--></p>\n    </div>\n    <div class="photo-frame landscape deco fade-up delay-1">');

rep('<div class="section-label fade-up">Style Gallery</div>\n    <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up">Style Gallery</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:page.style.title-->');
rep('</h2>\n    <p class="section-text fade-up delay-2">自然体の中に少しの洗練を感じるスタイルを大切にしています。', '<!--/BSM:page.style.title--></h2>\n    <p class="section-text fade-up delay-2"><!--BSM:page.style.lede-->自然体の中に少しの洗練を感じるスタイルを大切にしています。');
rep('特に、ショート・ボブ・ミディアムのやわらかい質感づくりが得意です。</p>\n  </div>\n  <div class="gallery-grid">\n    <div class="gallery-item fade-up"><img src="/beauty-salon-mellow/style-hair-01.png"', '特に、ショート・ボブ・ミディアムのやわらかい質感づくりが得意です。<!--/BSM:page.style.lede--></p>\n  </div>\n  <div class="gallery-grid">\n    <div class="gallery-item fade-up"><img src="/beauty-salon-mellow/style-hair-01.png"');

const labels = [
  'Short — やわらかなショート',
  'Bob — ふわっとしたボブ',
  'Bob — すっきりボブ',
  'Medium — ナチュラルウェーブ',
  'Long — やわらかなロング',
  'Short — ソフトショート',
];
labels.forEach((lab, i) => {
  rep(`<span class="gallery-label">${lab}</span>`, `<span class="gallery-label"><!--BSM:style.label.${i + 1}-->${lab}<!--/BSM:style.label.${i + 1}--></span>`);
});

rep('<div class="section-label fade-up">Welcome</div>\n    <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up">Welcome</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:page.first.welcome.title-->');
rep('</h2>\n    <p class="section-text fade-up delay-2" style="max-width:none">初めてご来店', '<!--/BSM:page.first.welcome.title--></h2>\n    <p class="section-text fade-up delay-2" style="max-width:none"><!--BSM:page.first.welcome.body-->初めてご来店');
rep('お話しください。</p>\n  </div>\n</section>\n<section style="background:var(--cream)">', 'お話しください。<!--/BSM:page.first.welcome.body--></p>\n  </div>\n</section>\n<section style="background:var(--cream)">');

const flows = [
  ['01', 'ご予約', 'WEB予約、またはお電話にてご予約ください。メニューに迷われている場合もお気軽にご相談ください。', 1],
  ['02', 'カウンセリング', '髪のお悩み、なりたい雰囲気、普段のお手入れ方法などを伺います。', 2],
  ['03', '施術', '髪質や状態に合わせて、無理のない方法で施術を進めます。', 3],
  ['04', 'お仕上げ', 'ご自宅でも再現しやすいよう、スタイリングのポイントもお伝えします。', 4],
];
for (const [num, title, desc, n] of flows) {
  rep(`<div class="flow-num">${num}</div><div class="flow-title">${title}</div><p class="flow-desc">${desc}</p>`, `<div class="flow-num">${num}</div><div class="flow-title"><!--BSM:page.first.flow.${n}.title-->${title}<!--/BSM:page.first.flow.${n}.title--></div><p class="flow-desc"><!--BSM:page.first.flow.${n}.desc-->${desc}<!--/BSM:page.first.flow.${n}.desc--></p>`);
}

rep('<div class="section-label fade-up">Info</div>\n    <h2 class="section-title fade-up delay-1">ご来店にあたって</h2>', '<div class="section-label fade-up">Info</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:page.first.policy.title-->ご来店にあたって<!--/BSM:page.first.policy.title--></h2>');
rep('<p style="font-size:0.82rem;color:var(--taupe);line-height:2;font-weight:300">現金・各種クレジットカード・交通系IC<br>iD / QUICPay / PayPay</p>', '<p style="font-size:0.82rem;color:var(--taupe);line-height:2;font-weight:300"><!--BSM:page.first.payment-->現金・各種クレジットカード・交通系IC<br>iD / QUICPay / PayPay<!--/BSM:page.first.payment--></p>');
rep('<p style="font-size:0.82rem;color:var(--taupe);line-height:2;font-weight:300">カットのみ：約60分<br>カット＋カラー：約2〜3時間<br>カット＋パーマ：約2〜3時間</p>', '<p style="font-size:0.82rem;color:var(--taupe);line-height:2;font-weight:300"><!--BSM:page.first.duration-->カットのみ：約60分<br>カット＋カラー：約2〜3時間<br>カット＋パーマ：約2〜3時間<!--/BSM:page.first.duration--></p>');

rep('font-size:0.75rem;font-weight:300">〒150-0001 東京都渋谷区神宮前3-18-7 Luce表参道 1F</div>', 'font-size:0.75rem;font-weight:300"><!--BSM:access.mapCaption-->〒150-0001 東京都渋谷区神宮前3-18-7 Luce表参道 1F<!--/BSM:access.mapCaption--></div>');
rep('<div class="access-block-value">〒150-0001<br>東京都渋谷区神宮前3-18-7<br>Luce表参道 1F</div>', '<div class="access-block-value"><!--BSM:access.address-->〒150-0001<br>東京都渋谷区神宮前3-18-7<br>Luce表参道 1F<!--/BSM:access.address--></div>');
rep('<div class="access-block-value">表参道駅 A2出口より徒歩6分<br>明治神宮前駅 5番出口より徒歩8分<br>原宿駅 東口より徒歩11分</div>', '<div class="access-block-value"><!--BSM:access.routes-->表参道駅 A2出口より徒歩6分<br>明治神宮前駅 5番出口より徒歩8分<br>原宿駅 東口より徒歩11分<!--/BSM:access.routes--></div>');
rep('<div class="access-block-value">03-0000-1842</div></div>\n    <div class="access-block"><div class="access-block-label">OPEN</div>', '<div class="access-block-value"><!--BSM:access.tel-->03-0000-1842<!--/BSM:access.tel--></div></div>\n    <div class="access-block"><div class="access-block-label">OPEN</div>');
rep('<div class="access-block-value">月 10:00—19:00 ／ 水・木 10:00—20:00<br>金 11:00—21:00 ／ 土 10:00—20:00<br>日・祝 10:00—19:00<br><br>定休日：毎週火曜・第2水曜</div>', '<div class="access-block-value"><!--BSM:access.hours-->月 10:00—19:00 ／ 水・木 10:00—20:00<br>金 11:00—21:00 ／ 土 10:00—20:00<br>日・祝 10:00—19:00<br><br>定休日：毎週火曜・第2水曜<!--/BSM:access.hours--></div>');
rep('<div class="access-block-value">現金・各種クレジットカード<br>交通系IC・iD / QUICPay / PayPay</div>', '<div class="access-block-value"><!--BSM:access.payment-->現金・各種クレジットカード<br>交通系IC・iD / QUICPay / PayPay<!--/BSM:access.payment--></div>');

rep('<div class="section-label fade-up" style="justify-content:center">Reserve</div>\n    <h2 class="section-title fade-up delay-1">', '<div class="section-label fade-up" style="justify-content:center">Reserve</div>\n    <h2 class="section-title fade-up delay-1"><!--BSM:page.reserve.title-->');
rep('</h2>\n    <p class="section-text fade-up delay-2" style="max-width:none;text-align:center">ご予約は24時間WEBから承っております', '<!--/BSM:page.reserve.title--></h2>\n    <p class="section-text fade-up delay-2" style="max-width:none;text-align:center"><!--BSM:page.reserve.lede-->ご予約は24時間WEBから承っております');
rep('ご相談ください。</p>\n    <div class="fade-up delay-3"', 'ご相談ください。<!--/BSM:page.reserve.lede--></p>\n    <div class="fade-up delay-3"');
rep('<div style="font-size:0.82rem;color:var(--taupe);line-height:2.4;font-weight:300">月 10:00—19:00 ／ 水・木 10:00—20:00 ／ 金 11:00—21:00<br>土 10:00—20:00 ／ 日・祝 10:00—19:00<br><span style="color:var(--warm-gray);font-size:0.75rem">定休日：毎週火曜・第2水曜</span></div>', '<div style="font-size:0.82rem;color:var(--taupe);line-height:2.4;font-weight:300"><!--BSM:page.reserve.hoursBlock-->月 10:00—19:00 ／ 水・木 10:00—20:00 ／ 金 11:00—21:00<br>土 10:00—20:00 ／ 日・祝 10:00—19:00<br><span style="color:var(--warm-gray);font-size:0.75rem">定休日：毎週火曜・第2水曜</span><!--/BSM:page.reserve.hoursBlock--></div>');

rep(
  '<div class="policy-card fade-up"><div class="policy-num">01</div><div class="policy-title">扱いやすさを大切にしたカット</div><p class="policy-desc">乾かしただけでもまとまりやすく、毎日のスタイリングが少し楽になるように。骨格や毛流れを見ながら、自然に馴染むシルエットに整えます。</p></div>',
  '<div class="policy-card fade-up"><div class="policy-num">01</div><div class="policy-title"><!--BSM:page.policy.1.title-->扱いやすさを大切にしたカット<!--/BSM:page.policy.1.title--></div><p class="policy-desc"><!--BSM:page.policy.1.desc-->乾かしただけでもまとまりやすく、毎日のスタイリングが少し楽になるように。骨格や毛流れを見ながら、自然に馴染むシルエットに整えます。<!--/BSM:page.policy.1.desc--></p></div>',
);
rep(
  '<div class="policy-card fade-up delay-1"><div class="policy-num">02</div><div class="policy-title">やわらかく見える質感づくり</div><p class="policy-desc">軽すぎず、重すぎず。毛先の動きや表面のやわらかさを大切にしながら、上品に見える質感をつくります。</p></div>',
  '<div class="policy-card fade-up delay-1"><div class="policy-num">02</div><div class="policy-title"><!--BSM:page.policy.2.title-->やわらかく見える質感づくり<!--/BSM:page.policy.2.title--></div><p class="policy-desc"><!--BSM:page.policy.2.desc-->軽すぎず、重すぎず。毛先の動きや表面のやわらかさを大切にしながら、上品に見える質感をつくります。<!--/BSM:page.policy.2.desc--></p></div>',
);
rep(
  '<div class="policy-card fade-up delay-2"><div class="policy-num">03</div><div class="policy-title">初めての方でも相談しやすい空間</div><p class="policy-desc">「似合う髪型が分からない」「短くしたいけれど不安がある」そんなご相談も歓迎しています。カウンセリングの時間を大切にしながら、無理のないご提案を行います。</p></div>',
  '<div class="policy-card fade-up delay-2"><div class="policy-num">03</div><div class="policy-title"><!--BSM:page.policy.3.title-->初めての方でも相談しやすい空間<!--/BSM:page.policy.3.title--></div><p class="policy-desc"><!--BSM:page.policy.3.desc-->「似合う髪型が分からない」「短くしたいけれど不安がある」そんなご相談も歓迎しています。カウンセリングの時間を大切にしながら、無理のないご提案を行います。<!--/BSM:page.policy.3.desc--></p></div>',
);
rep(
  '<div class="policy-card fade-up delay-3"><div class="policy-num">04</div><div class="policy-title">落ち着いて過ごせる店内</div><p class="policy-desc">明るくやわらかな光が入る空間で、ゆったりとお過ごしいただけます。シャンプーブースも落ち着いた雰囲気で、リラックスしやすい設計です。</p></div>',
  '<div class="policy-card fade-up delay-3"><div class="policy-num">04</div><div class="policy-title"><!--BSM:page.policy.4.title-->落ち着いて過ごせる店内<!--/BSM:page.policy.4.title--></div><p class="policy-desc"><!--BSM:page.policy.4.desc-->明るくやわらかな光が入る空間で、ゆったりとお過ごしいただけます。シャンプーブースも落ち着いた雰囲気で、リラックスしやすい設計です。<!--/BSM:page.policy.4.desc--></p></div>',
);

fs.writeFileSync(p, h, 'utf8');
console.log('wrote BSM markers', p);
