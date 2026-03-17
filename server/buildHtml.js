import { getTemplateFullCss } from './conceptTemplates.js';

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_NAV = {
  minimal_luxury: [
    { label: '宿泊', href: '#accommodation' },
    { label: 'エステ', href: '#experience' },
    { label: 'アクセス', href: '#access' },
    { label: '予約', href: '#reserve' },
  ],
  dark_edge: [
    { label: 'RESERVE', href: '#reserve' },
    { label: 'ACCESS', href: '#access' },
  ],
  corporate_trust: [
    { label: 'サービス', href: '#service' },
    { label: '実績', href: '#stats' },
    { label: '会社概要', href: '#about' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  warm_organic: [
    { label: 'こだわり', href: '#concept' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
  ],
  pop_friendly: [
    { label: 'あそび場', href: '#concept' },
    { label: '利用案内', href: '#info' },
    { label: 'アクセス', href: '#access' },
  ],
  high_energy: [
    { label: 'プログラム', href: '#program' },
    { label: '料金', href: '#price' },
    { label: 'アクセス', href: '#access' },
  ],
};

const DEFAULT_CTA = {
  minimal_luxury: { label: 'ご予約はこちら', href: '#reserve' },
  dark_edge: { label: 'RESERVE', href: '#reserve' },
  corporate_trust: { label: '無料相談', href: '#contact' },
  warm_organic: { label: '予約する', href: '#reserve' },
  pop_friendly: { label: '予約はこちら', href: '#reserve' },
  high_energy: { label: '無料体験', href: '#trial' },
};

const defaultHeroImages = {
  minimal_luxury: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200',
  dark_edge: 'https://images.unsplash.com/photo-1514933653103-974c4e9b2c3b?auto=format&fit=crop&w=1200',
  corporate_trust: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
  warm_organic: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200',
  pop_friendly: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200',
  high_energy: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200',
};

/**
 * content: { siteName, title, headline, subheadline, sections: [{ id, title, content }], footerText }
 * seo: { metaTitle, metaDescription, keywords, ogImageUrl, canonicalUrl }
 * templateId: minimal_luxury | dark_edge | corporate_trust | warm_organic | pop_friendly | high_energy
 * genOptions: { contactForm, formActionUrl?, instagramLine, presentedBy, qrCode, instagramUrl?, lineUrl?, qrCodeDataUrl? }
 */
export function buildHtml(content, seo, templateId, genOptions = {}) {
  const {
    contactForm = false,
    formActionUrl = '',
    instagramLine = true,
    presentedBy = true,
    qrCode = false,
    instagramUrl = '',
    lineUrl = '',
    qrCodeDataUrl = '',
  } = genOptions;

  const tid = templateId;
  const navItems = (content.navItems && content.navItems.length) ? content.navItems : (DEFAULT_NAV[tid] || []);
  const cta = (content.ctaLabel && content.ctaHref) ? { label: content.ctaLabel, href: content.ctaHref } : (DEFAULT_CTA[tid] || { label: 'お問い合わせ', href: '#contact' });
  const heroImageUrl = (seo.ogImageUrl && seo.ogImageUrl.trim()) || defaultHeroImages[tid] || '';

  const skipLink = '<a href="#main-content" class="skip-link">メインコンテンツへ</a>';

  const headerHtml = tid === 'dark_edge'
    ? `<header class="header-with-menu">
    <div class="container header-inner">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
      <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="メニューを開く">
      <label for="nav-toggle" class="nav-toggle-label"><span></span><span></span><span></span></label>
      <nav class="nav-overlay" aria-label="メインメニュー">
        <div class="nav-overlay-inner">
          ${navItems.map((n) => `<a href="${escapeHtml(n.href)}" class="nav-overlay-link">${escapeHtml(n.label)}</a>`).join('')}
          <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-hero">${escapeHtml(cta.label)}</a>
        </div>
      </nav>
    </div>
  </header>`
    : `<header>
    <div class="container header-inner">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
      <nav class="nav" aria-label="メインメニュー">
        ${navItems.map((n) => `<a href="${escapeHtml(n.href)}" class="nav-link">${escapeHtml(n.label)}</a>`).join('')}
      </nav>
      <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
    </div>
  </header>`;

  const ctaBlockHtml = `<div class="cta-block">
    <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
  </div>`;

  const footerExtra = presentedBy ? '<p class="presented-by">Presented by ウェブページ作成ツール</p>' : '';
  const hasFooterCols = !!(content.footerAddress || content.footerPhone || content.footerEmail);
  const footerHtml = hasFooterCols
    ? `<footer>
    <div class="container footer-cols">
      <div class="footer-col">
        <p class="footer-brand">${escapeHtml(content.siteName)}</p>
        ${content.footerAddress ? `<p class="footer-address">${escapeHtml(content.footerAddress)}</p>` : ''}
        ${content.footerPhone ? `<p><a href="tel:${escapeHtml(String(content.footerPhone).replace(/\s/g, ''))}" class="footer-link">${escapeHtml(content.footerPhone)}</a></p>` : ''}
        ${content.footerEmail ? `<p><a href="mailto:${escapeHtml(content.footerEmail)}" class="footer-link">${escapeHtml(content.footerEmail)}</a></p>` : ''}
      </div>
      <div class="footer-col">
        <p>${escapeHtml(content.footerText)}</p>
        ${footerExtra}
      </div>
    </div>
  </footer>`
    : `<footer>
    <div class="container">
      ${escapeHtml(content.footerText)}
      ${footerExtra}
    </div>
  </footer>`;

  const metaTags = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${escapeHtml(seo.metaTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.metaDescription)}">`,
    seo.keywords ? `<meta name="keywords" content="${escapeHtml(seo.keywords)}">` : '',
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${escapeHtml(seo.metaTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.metaDescription)}">`,
    seo.ogImageUrl ? `<meta property="og:image" content="${escapeHtml(seo.ogImageUrl)}">` : '',
    seo.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}">` : '',
  ].filter(Boolean).join('\n    ');

  const sections = content.sections || [];

  const scrollInAttr = (tid === 'dark_edge' || tid === 'corporate_trust') ? ' data-scroll-in' : '';
  const sectionImg = (s) => s.imageUrl ? `<div class="section-img-wrap"><img src="${escapeHtml(s.imageUrl)}" alt="" class="section-img" loading="lazy"></div>` : '';
  const sectionBody = (s) => `<div class="section-body"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p></div>`;

  const sectionsDefault = sections
    .map((s) => `    <section class="section" aria-labelledby="${s.id}-title"${scrollInAttr}>
      ${sectionImg(s)}
      ${sectionBody(s)}
    </section>`)
    .join('\n');

  const quoteBlockHtml = content.quote && (tid === 'minimal_luxury' || tid === 'warm_organic')
    ? `    <blockquote class="quote-block"${tid === 'minimal_luxury' ? ' data-a1-animate' : ''}>${escapeHtml(content.quote)}</blockquote>`
    : '';

  const stats = content.stats && content.stats.length && (tid === 'corporate_trust' || tid === 'high_energy') ? content.stats : [];
  const statsBlockHtml = stats.length
    ? `    <div class="stats-block">
      ${stats.map((st) => `<div class="stat-item"><span class="stat-value">${escapeHtml(st.value)}</span><span class="stat-label">${escapeHtml(st.label)}</span></div>`).join('')}
    </div>`
    : '';

  const sectionsHtml =
    tid === 'corporate_trust'
      ? `    ${statsBlockHtml}
    <div class="section-grid">${sections
          .map(
            (s) => `<div class="section-card" aria-labelledby="${s.id}-title" data-scroll-in>
        ${s.imageUrl ? `<div class="section-card-img"><img src="${escapeHtml(s.imageUrl)}" alt="" loading="lazy"></div>` : ''}
        <div class="section-card-body"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p></div>
      </div>`
          )
          .join('')}</div>`
      : tid === 'high_energy'
        ? `    ${statsBlockHtml}
${sections
            .map(
              (s) => `    <section class="section" aria-labelledby="${s.id}-title" data-scroll-in>
      <div class="section-inner">
        ${sectionImg(s)}
        <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
        <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
      </div>
    </section>`
            )
            .join('\n')}`
        : tid === 'minimal_luxury'
          ? sections
              .map(
                (s) => `    <section class="section" aria-labelledby="${s.id}-title" data-a1-animate>
      ${sectionImg(s)}
      ${sectionBody(s)}
    </section>`
              )
              .join('\n')
          : sectionsDefault;

  const a1SectionAttr = tid === 'minimal_luxury' ? ' data-a1-animate' : '';
  let extraSections = '';
  if (instagramLine && (instagramUrl || lineUrl)) {
    extraSections += `
    <section class="section sns-links"${a1SectionAttr}>
      <h2>フォロー・お問い合わせ</h2>
      ${instagramUrl ? `<a href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener">Instagram</a>` : ''}
      ${lineUrl ? `<a href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener">LINE</a>` : ''}
    </section>`;
  }
  if (contactForm) {
    const formAction = formActionUrl.trim() || '#';
    extraSections += `
    <section class="section"${a1SectionAttr}>
      <h2>お問い合わせ</h2>
      <form action="${escapeHtml(formAction)}" method="post">
        <p><label>お名前 <input type="text" name="name" required></label></p>
        <p><label>メール <input type="email" name="email" required></label></p>
        <p><label>内容 <textarea name="body" rows="4"></textarea></label></p>
        <p><button type="submit">送信</button></p>
      </form>
    </section>`;
  }
  if (qrCode && qrCodeDataUrl) {
    extraSections += `
    <section class="section qr-block"${a1SectionAttr}>
      <h2>QRコード</h2>
      <img src="${escapeHtml(qrCodeDataUrl)}" alt="QRコード" width="120" height="120">
    </section>`;
  }

  const a1HeroSlides = (tid === 'minimal_luxury' && content.heroSlides && content.heroSlides.length) ? content.heroSlides : [heroImageUrl];
  const a1UseSlideshow = a1HeroSlides.length >= 2;
  const a1HeroHtml = tid === 'minimal_luxury'
    ? a1UseSlideshow
      ? `<div class="hero-a1-slides">${a1HeroSlides.map((url, i) => `<img src="${escapeHtml(url)}" alt="" class="hero-a1-slide" data-slide="${i}" loading="eager">`).join('')}</div>`
      : `<img src="${escapeHtml(a1HeroSlides[0] || heroImageUrl)}" alt="" class="hero-a1-img hero-ken-burns" loading="eager">`
    : '';

  const heroBgStyle = tid === 'dark_edge' ? ` style="background-image: url(${escapeHtml(heroImageUrl)})"` : '';

  const heroSection =
    tid === 'dark_edge'
      ? `<section class="hero">
      <div class="hero-bg hero-bg-ken-burns"${heroBgStyle}></div>
      <div class="hero-text">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <div class="hero-cta-wrap">
          <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-hero">${escapeHtml(cta.label)}</a>
          <a href="#access" class="cta-btn cta-btn-hero-outline">ACCESS</a>
        </div>
      </div>
    </section>`
      : tid === 'minimal_luxury'
        ? `<section class="hero" data-a1-animate>
      <div class="hero-a1-text"><h1>${escapeHtml(content.headline)}</h1><p class="subheadline">${escapeHtml(content.subheadline)}</p></div>
      <div class="hero-a1-img-wrap">${a1HeroHtml}</div>
    </section>`
        : tid === 'corporate_trust'
          ? `<section class="hero hero-with-bg">
      <div class="hero-bg-layer" style="--hero-bg-img: url(${escapeHtml(heroImageUrl)})"></div>
      <div class="hero-bg-overlay"></div>
      <div class="container hero-inner">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
      </div>
    </section>`
          : tid === 'high_energy'
            ? `<section class="hero hero-full-img" style="--hero-bg-img: url(${escapeHtml(heroImageUrl)})">
      <div class="hero-bg-overlay"></div>
      <div class="hero-inner">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
      </div>
    </section>`
            : tid === 'warm_organic' || tid === 'pop_friendly'
              ? `<section class="hero">
      <div class="container">
        <div class="hero-img-wrap-hero"><img src="${escapeHtml(heroImageUrl)}" alt="" class="hero-sample-img" loading="eager"></div>
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
      </div>
    </section>`
              : `<section class="hero">
      <div class="container">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
      </div>
    </section>`;

  const marqueeText = `${escapeHtml(content.headline)}  ·  ${escapeHtml(content.siteName)}  ·  `;
  const marqueeBar =
    tid === 'high_energy'
      ? `<div class="marquee-bar" aria-hidden="true"><span class="marquee-inner">${marqueeText}${marqueeText}</span></div>`
      : '';

  const css = getTemplateFullCss(tid);
  const googleFonts =
    tid === 'minimal_luxury'
      ? '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">'
      : tid === 'pop_friendly'
        ? '<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800&display=swap" rel="stylesheet">'
        : '';
  const a1Script =
    tid === 'minimal_luxury'
      ? `<script>
(function(){var el=document.querySelectorAll('[data-a1-animate]');var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('a1-visible');io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});el.forEach(function(e){io.observe(e);});})();
</script>`
      : '';
  const scrollInScript =
    tid === 'dark_edge' || tid === 'corporate_trust'
      ? `<script>
(function(){var el=document.querySelectorAll('[data-scroll-in]');var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -30px 0px'});el.forEach(function(e){io.observe(e);});})();
</script>`
      : '';

  const ctaAfterHero = tid === 'minimal_luxury' ? ctaBlockHtml : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    ${googleFonts}
    <style>${css}</style>
</head>
<body class="page-wrapper template-${tid}">
  ${skipLink}
  ${marqueeBar}
  ${headerHtml}
  <main id="main-content">
    ${heroSection}
    ${ctaAfterHero}
    <div class="container">
${quoteBlockHtml}
${sectionsHtml}
${extraSections}
    </div>
  </main>
  ${footerHtml}
  ${a1Script}
  ${scrollInScript}
</body>
</html>`;
}
