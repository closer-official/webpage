import type { PageContent, SEOData, TemplateOption, BuildHtmlGenOptions } from '../types';
import type { NavItem } from '../types';
import { buildJsonLd } from './seo';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_NAV: Record<string, NavItem[]> = {
  salon_barber: [
    { label: 'コンセプト', href: '#concept' },
    { label: 'スタイリスト', href: '#staff' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
    { label: '予約', href: '#contact' },
  ],
  cafe_tea: [
    { label: 'こだわり', href: '#concept' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  bakery: [
    { label: 'こだわり', href: '#concept' },
    { label: '商品', href: '#menu' },
    { label: 'アクセス', href: '#access' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  clinic_chiropractic: [
    { label: '施術内容', href: '#menu' },
    { label: '料金', href: '#price' },
    { label: 'アクセス', href: '#access' },
    { label: '予約', href: '#contact' },
  ],
  gym_yoga: [
    { label: 'プログラム', href: '#menu' },
    { label: '料金', href: '#price' },
    { label: 'アクセス', href: '#access' },
    { label: '無料体験', href: '#contact' },
  ],
  builder: [
    { label: '施工事例', href: '#gallery' },
    { label: '会社概要', href: '#concept' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  professional: [
    { label: 'サービス', href: '#menu' },
    { label: '料金', href: '#price' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  cram_school: [
    { label: 'コース', href: '#menu' },
    { label: '料金', href: '#price' },
    { label: 'アクセス', href: '#access' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  izakaya: [
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
    { label: '予約', href: '#contact' },
  ],
  pet_salon: [
    { label: 'メニュー', href: '#menu' },
    { label: 'スタッフ', href: '#staff' },
    { label: 'アクセス', href: '#access' },
    { label: '予約', href: '#contact' },
  ],
};

const DEFAULT_CTA: Record<string, { label: string; href: string }> = {
  salon_barber: { label: 'オンライン予約', href: '#contact' },
  cafe_tea: { label: '予約する', href: '#reserve' },
  bakery: { label: 'お問い合わせ', href: '#contact' },
  clinic_chiropractic: { label: '予約する', href: '#contact' },
  gym_yoga: { label: '無料体験', href: '#trial' },
  builder: { label: 'お問い合わせ', href: '#contact' },
  professional: { label: '無料相談', href: '#contact' },
  cram_school: { label: 'お問い合わせ', href: '#contact' },
  izakaya: { label: '予約する', href: '#contact' },
  pet_salon: { label: '予約する', href: '#contact' },
};

/** プレビュー・エクスポート用の完全なHTMLを生成 */
export function buildHtml(
  content: PageContent,
  seo: SEOData,
  template: TemplateOption,
  options?: { inlineCss?: boolean; genOptions?: BuildHtmlGenOptions }
): string {
  const jsonLd = buildJsonLd(content, seo, seo.canonicalUrl || '');

  const metaTags = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `<title>${escapeHtml(seo.metaTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.metaDescription)}">`,
    seo.keywords ? `<meta name="keywords" content="${escapeHtml(seo.keywords)}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(seo.metaTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.metaDescription)}">`,
    seo.ogImageUrl ? `<meta property="og:image" content="${escapeHtml(seo.ogImageUrl)}">` : '',
    seo.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}">` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const bodyClass = `page-wrapper template-${template.id}`;
  const tid = template.id;
  const navItems = content.navItems?.length ? content.navItems : DEFAULT_NAV[tid] ?? [];
  const cta = content.ctaLabel && content.ctaHref
    ? { label: content.ctaLabel, href: content.ctaHref }
    : DEFAULT_CTA[tid] ?? { label: 'お問い合わせ', href: '#contact' };

  const skipLink =
    '<a href="#main-content" class="skip-link">メインコンテンツへ</a>';

  const headerHtml =
    tid === 'cafe_tea'
      ? ''
      : `<header>
    <div class="container header-inner">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
      <nav class="nav" aria-label="メインメニュー">
        ${navItems.map((n) => `<a href="${escapeHtml(n.href)}" class="nav-link">${escapeHtml(n.label)}</a>`).join('')}
      </nav>
      <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
    </div>
  </header>`;

  const ctaBlockHtml =
    `<div class="cta-block">
    <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
  </div>`;

  const hasFooterCols = !!(content.footerAddress || content.footerPhone || content.footerEmail);
  const footerLegal = '<div class="footer-legal"><p class="presented-by">Presented by ウェブページ作成ツール</p></div>';
  const footerHtml =
    tid === 'cafe_tea'
      ? hasFooterCols
        ? `<footer class="footer-wo">
    <div class="container">
    <a href="#wo-top" class="wo-page-top">PAGE TOP</a>
    <div class="footer-cols">
      <div class="footer-col">
        <p class="footer-brand">${escapeHtml(content.siteName)}</p>
        ${content.footerAddress ? `<p class="footer-address">${escapeHtml(content.footerAddress)}</p>` : ''}
        ${content.footerPhone ? `<p><a href="tel:${escapeHtml(content.footerPhone.replace(/\s/g, ''))}" class="footer-link">${escapeHtml(content.footerPhone)}</a></p>` : ''}
        ${content.footerEmail ? `<p><a href="mailto:${escapeHtml(content.footerEmail)}" class="footer-link">${escapeHtml(content.footerEmail)}</a></p>` : ''}
      </div>
      <div class="footer-col">
        <p>${escapeHtml(content.footerText)}</p>
      </div>
    </div>
    ${footerLegal}
    </div>
  </footer>`
        : `<footer class="footer-wo">
    <div class="container">
    <a href="#wo-top" class="wo-page-top">PAGE TOP</a>
    <p>${escapeHtml(content.footerText)}</p>
    ${footerLegal}
    </div>
  </footer>`
      : hasFooterCols
        ? `<footer>
    <div class="container footer-cols">
      <div class="footer-col">
        <p class="footer-brand">${escapeHtml(content.siteName)}</p>
        ${content.footerAddress ? `<p class="footer-address">${escapeHtml(content.footerAddress)}</p>` : ''}
        ${content.footerPhone ? `<p><a href="tel:${escapeHtml(content.footerPhone.replace(/\s/g, ''))}" class="footer-link">${escapeHtml(content.footerPhone)}</a></p>` : ''}
        ${content.footerEmail ? `<p><a href="mailto:${escapeHtml(content.footerEmail)}" class="footer-link">${escapeHtml(content.footerEmail)}</a></p>` : ''}
      </div>
      <div class="footer-col">
        <p>${escapeHtml(content.footerText)}</p>
      </div>
    </div>
    ${footerLegal}
  </footer>`
        : `<footer>
    <div class="container">
      ${escapeHtml(content.footerText)}
    </div>
    ${footerLegal}
  </footer>`;

  /** セクション位置に応じた余白リズムクラス（賞・高級感用） */
  const getSectionRhythmClass = (i: number, total: number): string => {
    if (total <= 0) return 'section-rhythm-default';
    if (i === 0) return 'section-rhythm-after-hero';
    if (i === total - 1) return 'section-rhythm-before-footer';
    const mid = Math.floor(total / 2);
    if (i === mid) return 'section-rhythm-breath';
    return 'section-rhythm-default';
  };

  const scrollInAttr = tid === 'cafe_tea' ? '' : ' data-scroll-in';
  const woHoursBody = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    const [first, ...rest] = lines;
    const head = `<p class="wo-hours-emphasis"><span class="wo-text-mark">${escapeHtml(first)}</span></p>`;
    const tail = rest.map((l) => `<p class="wo-hours-detail">${escapeHtml(l)}</p>`).join('');
    return head + tail;
  };
  const sectionsDefault =
    tid === 'cafe_tea'
      ? content.sections
          .map((s, i) => {
            const rhythm = getSectionRhythmClass(i, content.sections.length);
            const img = s.imageUrl
              ? `<div class="section-img-wrap"><img src="${escapeHtml(s.imageUrl)}" alt="" class="section-img" loading="lazy"></div>`
              : '';
            const body = `<div class="section-body"><h2 id="${s.id}-title" class="wo-sec-heading">${escapeHtml(s.title)}</h2>
      <div class="wo-sec-prose"><p>${escapeHtml(s.content).replace(/\n/g, '</p><p>')}</p></div></div>`;
            if (s.id === 'hours') {
              return `    <section class="section wo-sec wo-hours ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body">
        <h2 id="${s.id}-title" class="wo-sec-heading">${escapeHtml(s.title)}</h2>
        ${woHoursBody(s.content)}
      </div>
    </section>`;
            }
            if (i === 0) {
              return `    <section class="section wo-sec wo-lede ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body">
        <h2 id="${s.id}-title" class="wo-lede-heading">${escapeHtml(s.title)}</h2>
        <div class="wo-lede-prose"><p>${escapeHtml(s.content).replace(/\n/g, '</p><p>')}</p></div>
      </div>
      ${img}
    </section>`;
            }
            const alt = s.imageUrl ? (i % 2 === 1 ? ' wo-alt' : ' wo-alt wo-alt-rev') : '';
            return `    <section class="section wo-sec ${rhythm}${alt}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      ${img}
      ${body}
    </section>`;
          })
          .join('\n')
      : content.sections
          .map((s, i) => {
            const rhythm = getSectionRhythmClass(i, content.sections.length);
            const alt = s.imageUrl && i >= 1 ? (i % 2 === 1 ? ' section-alt' : ' section-alt section-alt-reverse') : '';
            const img = s.imageUrl ? `<div class="section-img-wrap"><img src="${escapeHtml(s.imageUrl)}" alt="" class="section-img" loading="lazy"></div>` : '';
            return `    <section class="section ${rhythm}${alt}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      ${img}
      <div class="section-body"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p></div>
    </section>`;
          })
          .join('\n');

  const quoteBlockHtml = content.quote
    ? `    <blockquote class="quote-block">${escapeHtml(content.quote)}</blockquote>`
    : '';

  const statsBlockHtml =
    content.stats && content.stats.length > 0 && (tid === 'gym_yoga' || tid === 'professional')
      ? `    <div class="stats-block">
      ${content.stats.map((st) => `<div class="stat-item"><span class="stat-value">${escapeHtml(st.value)}</span><span class="stat-label">${escapeHtml(st.label)}</span></div>`).join('')}
    </div>`
      : '';

  const sectionsHtml =
    statsBlockHtml
      ? `${statsBlockHtml}\n${sectionsDefault}`
      : sectionsDefault;

  const defaultHeroImages: Record<string, string> = {
    salon_barber: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200',
    cafe_tea: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200',
    clinic_chiropractic: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200',
    gym_yoga: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200',
    builder: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200',
    professional: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
    cram_school: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200',
    izakaya: 'https://images.unsplash.com/photo-1514933653103-974c4e9b2c3b?auto=format&fit=crop&w=1200',
    pet_salon: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200',
  };
  const heroImageUrl = seo.ogImageUrl?.trim() || defaultHeroImages[tid] || '';
  const woHeroSlides =
    tid === 'cafe_tea'
      ? (() => {
          const d1 = heroImageUrl || defaultHeroImages.cafe_tea;
          const d2 =
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400';
          const d3 =
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400';
          const hs = (content.heroSlides ?? []).filter((u) => (u || '').trim());
          if (hs.length >= 2) return hs;
          if (hs.length === 1) return [hs[0]!, d2, d3];
          return [d1, d2, d3];
        })()
      : [];
  const heroSection =
    tid === 'cafe_tea'
      ? `<section class="wo-hero" aria-roledescription="carousel" aria-label="メインビジュアル">
      <div class="wo-hero-viewport">
        <div class="wo-hero-track" id="wo-hero-track">${woHeroSlides.map((u) => `<div class="wo-hero-slide" style="background-image:url(${escapeHtml(u)})"></div>`).join('')}</div>
      </div>
      <div class="wo-hero-inner">
        <p class="wo-hero-eyebrow">${escapeHtml(content.siteName)}</p>
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
      </div>
      <div class="wo-hero-dots" role="tablist">${woHeroSlides.map((_, i) => `<button type="button" class="wo-hero-dot${i === 0 ? ' active' : ''}" aria-label="スライド ${i + 1} / ${woHeroSlides.length}" data-wo-dot="${i}"></button>`).join('')}</div>
    </section>`
      : `<section class="hero hero-full-img hell-hero-parallax" style="--hero-bg-img: url(${escapeHtml(heroImageUrl)})">
      <div class="hero-bg-overlay"></div>
      <div class="hero-inner">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
      </div>
    </section>`;

  const marqueeBar = '';

  const css = options?.inlineCss !== false ? template.css : '';
  const googleFonts = '';

  const scrollInScript =
    tid === 'cafe_tea'
      ? ''
      : `<script>
(function(){
var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -28px 0px'});
document.querySelectorAll('[data-scroll-in]').forEach(function(el){if(r){el.classList.add('in-view');}else{io.observe(el);}});
if(!r){
document.querySelectorAll('.hell-hero-parallax').forEach(function(el){
function u(){var y=Math.min(window.scrollY,480);el.style.backgroundPosition='center calc(50% + '+(y*0.055)+'px)';}
window.addEventListener('scroll',u,{passive:true});u();
});
}
})();
</script>`;

  const woOrganicScript =
    tid === 'cafe_tea'
      ? `<script>
(function(){
var track=document.getElementById('wo-hero-track');
if(track){
var slides=track.children.length,i=0,dots=[].slice.call(document.querySelectorAll('.wo-hero-dot')),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,timer,touchStart;
function go(k){i=(k+slides)%slides;while(i<0)i+=slides;track.style.transform='translateX(-'+(i*100)+'%)';dots.forEach(function(d,j){d.classList.toggle('active',j===i);});}
function next(){go(i+1);}function prev(){go(i-1);}
function start(){clearInterval(timer);if(!reduced&&slides>1)timer=setInterval(next,4500);}
function stop(){clearInterval(timer);}
dots.forEach(function(d,j){d.addEventListener('click',function(){go(j);stop();start();});});
track.addEventListener('touchstart',function(e){if(slides<2)return;touchStart=e.touches[0].clientX;stop();},{passive:true});
track.addEventListener('touchend',function(e){if(slides<2)return;var x=e.changedTouches[0].clientX-touchStart;if(x>55)prev();else if(x<-55)next();start();},{passive:true});
if(slides>1)start();
}
var cb=document.getElementById('wo-nav-toggle');
if(cb)document.querySelectorAll('.wo-nav-drawer a').forEach(function(a){a.addEventListener('click',function(){cb.checked=false;});});
})();
</script>`
      : '';

  const mainSectionsHtml = sectionsHtml;
  const ctaAfterHero = tid === 'cafe_tea' ? '' : ctaBlockHtml;

  const genOpts = options?.genOptions;
  const extraMotionAttr = tid === 'cafe_tea' ? '' : ' data-scroll-in';
  let extraSectionsHtml = '';
  if (genOpts) {
    const { contactForm, formActionUrl, instagramLine, instagramUrl, lineUrl, qrCode, qrCodeDataUrl } = genOpts;
    if (instagramLine && (instagramUrl || lineUrl)) {
      if (tid === 'cafe_tea') {
        extraSectionsHtml += `
    <section class="section wo-sec wo-sns-block"${extraMotionAttr} id="sns">
      <div class="section-body">
        <h2 id="sns-title" class="wo-sec-heading">フォロー・お問い合わせ</h2>
        <p class="wo-sns-caption">タップで開きます</p>
        <div class="wo-sns-row" role="list">
          ${instagramUrl ? `<a href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener noreferrer" class="wo-sns-emoji" role="listitem" aria-label="Instagram">📸</a>` : ''}
          ${lineUrl ? `<a href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener noreferrer" class="wo-sns-emoji" role="listitem" aria-label="LINE">💬</a>` : ''}
        </div>
      </div>
    </section>`;
      } else {
        extraSectionsHtml += `
    <section class="section sns-links"${extraMotionAttr} id="sns">
      <h2 id="sns-title">フォロー・お問い合わせ</h2>
      ${instagramUrl ? `<a href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener noreferrer">Instagram</a>` : ''}
      ${lineUrl ? `<a href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener noreferrer">LINE</a>` : ''}
    </section>`;
      }
    }
    if (contactForm) {
      const formAction = (formActionUrl ?? '').trim() || '#';
      if (tid === 'cafe_tea') {
        extraSectionsHtml += `
    <section class="section wo-sec wo-form-block"${extraMotionAttr} id="contact-form">
      <div class="section-body">
        <h2 class="wo-sec-heading" id="wo-form-title">お問い合わせフォーム</h2>
        <form class="wo-form" action="${escapeHtml(formAction)}" method="post" aria-labelledby="wo-form-title">
          <div class="wo-form-field">
            <label class="wo-form-label" for="wo-inp-name">お名前</label>
            <input class="wo-form-control" id="wo-inp-name" type="text" name="name" required autocomplete="name" placeholder="山田 太郎">
          </div>
          <div class="wo-form-field">
            <label class="wo-form-label" for="wo-inp-email">メール</label>
            <input class="wo-form-control" id="wo-inp-email" type="email" name="email" required autocomplete="email" placeholder="example@email.com">
          </div>
          <div class="wo-form-field">
            <label class="wo-form-label" for="wo-inp-body">内容</label>
            <textarea class="wo-form-control wo-form-textarea" id="wo-inp-body" name="body" rows="6" placeholder="ご用件をご記入ください"></textarea>
          </div>
          <button type="submit" class="cta-btn wo-form-submit">送信する</button>
        </form>
      </div>
    </section>`;
      } else {
        extraSectionsHtml += `
    <section class="section"${extraMotionAttr}>
      <h2>お問い合わせフォーム</h2>
      <form action="${escapeHtml(formAction)}" method="post">
        <p><label>お名前 <input type="text" name="name" required></label></p>
        <p><label>メール <input type="email" name="email" required></label></p>
        <p><label>内容 <textarea name="body" rows="4"></textarea></label></p>
        <p><button type="submit">送信</button></p>
      </form>
    </section>`;
      }
    }
    if (qrCode) {
      const qrImg = qrCodeDataUrl
        ? `<img src="${escapeHtml(qrCodeDataUrl)}" alt="QRコード" width="120" height="120">`
        : '<p class="qr-placeholder">QRコード（実際のLPではここに表示）</p>';
      extraSectionsHtml += `
    <section class="section qr-block"${extraMotionAttr}>
      <h2>QRコード</h2>
      ${qrImg}
    </section>`;
    }
  }

  const woChrome =
    tid === 'cafe_tea'
      ? `<div id="wo-top"></div>
<input type="checkbox" id="wo-nav-toggle" class="wo-nav-cb" aria-hidden="true">
<nav class="wo-nav-drawer" aria-label="メインメニュー">
  <label for="wo-nav-toggle" class="wo-nav-backdrop"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">閉じる</span></label>
  <div class="wo-nav-drawer-inner">
    <p class="wo-nav-brand">${escapeHtml(content.siteName)}</p>
    ${navItems.map((n) => `<a href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`).join('')}
    <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
  </div>
</nav>
<label for="wo-nav-toggle" class="wo-nav-fab" aria-label="メニュー"><span></span><span></span><span></span></label>`
      : '';

  const a1Script = '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    ${googleFonts}
    <script type="application/ld+json">${jsonLd}</script>
    <style>${css}</style>
</head>
<body class="${bodyClass}">
  ${skipLink}
  ${woChrome}
  ${marqueeBar}
  ${headerHtml}
  <main id="main-content">
    ${heroSection}
    ${ctaAfterHero}
    <div class="container">
${quoteBlockHtml}
${mainSectionsHtml}
${extraSectionsHtml}
    </div>
  </main>
  ${footerHtml}
  ${a1Script}
  ${scrollInScript}
  ${woOrganicScript}
  <script>
(function(){var h=document.querySelector('header');if(!h)return;function upd(){h.classList.toggle('scrolled',window.scrollY>40);}upd();window.addEventListener('scroll',upd,{passive:true});})();
</script>
</body>
</html>`;
}
