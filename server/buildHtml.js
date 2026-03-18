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
  salon_barber: [
    { label: 'ニュース', href: '#news' },
    { label: 'コンセプト', href: '#concept' },
    { label: 'ヘアカタログ', href: '#menu' },
    { label: 'サロン', href: '#gallery' },
    { label: 'スタッフ', href: '#staff' },
    { label: 'オンライン予約', href: '#contact' },
  ],
  cafe_tea: [
    { label: 'こだわり', href: '#concept' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
  ],
  bakery: [
    { label: 'こだわり', href: '#concept' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
  ],
  clinic_chiropractic: [
    { label: 'プログラム', href: '#program' },
    { label: '施術者', href: '#staff' },
    { label: '院内', href: '#evidence' },
    { label: 'アクセス', href: '#access' },
    { label: '予約', href: '#contact' },
  ],
  gym_yoga: [
    { label: 'プログラム', href: '#program' },
    { label: 'トレーナー', href: '#staff' },
    { label: 'コース', href: '#menu' },
    { label: 'アクセス', href: '#access' },
    { label: '無料カウンセリング', href: '#contact' },
  ],
  builder: [
    { label: 'WORKS', href: '#gallery' },
    { label: 'IDEAS', href: '#concept' },
    { label: 'PEOPLE', href: '#staff' },
    { label: 'ABOUT', href: '#about' },
  ],
  professional: [
    { label: 'サービス', href: '#menu' },
    { label: '会社概要', href: '#concept' },
    { label: 'お問い合わせ', href: '#contact' },
  ],
  cram_school: [
    { label: '講師の想い', href: '#concept' },
    { label: 'コース・月謝', href: '#menu' },
    { label: 'アクセス', href: '#access' },
  ],
  izakaya: [
    { label: 'こだわり', href: '#concept' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
  ],
  pet_salon: [
    { label: 'こだわり', href: '#concept' },
    { label: 'メニュー', href: '#menu' },
    { label: 'アクセス', href: '#access' },
  ],
};

const DEFAULT_CTA = {
  salon_barber: { label: 'オンライン予約', href: '#contact' },
  cafe_tea: { label: '予約する', href: '#contact' },
  bakery: { label: 'お問い合わせ', href: '#contact' },
  clinic_chiropractic: { label: '体験予約', href: '#contact' },
  gym_yoga: { label: '無料カウンセリング', href: '#contact' },
  builder: { label: 'お問い合わせ', href: '#contact' },
  professional: { label: '無料相談', href: '#contact' },
  cram_school: { label: '無料体験', href: '#contact' },
  izakaya: { label: 'ご予約', href: '#contact' },
  pet_salon: { label: 'ご予約', href: '#contact' },
};

const defaultHeroImages = {
  salon_barber: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200',
  cafe_tea: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200',
  clinic_chiropractic: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200',
  gym_yoga: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200',
  builder: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200',
  professional: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
  cram_school: 'https://images.unsplash.com/photo-1523240795612-9a05468c4e75?auto=format&fit=crop&w=1200',
  izakaya: 'https://images.unsplash.com/photo-1514933653103-974c4e9b2c3b?auto=format&fit=crop&w=1200',
  pet_salon: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200',
};

/**
 * content: { siteName, title, headline, subheadline, sections: [{ id, title, content }], footerText }
 * seo: { metaTitle, metaDescription, keywords, ogImageUrl, canonicalUrl }
 * templateId: salon_barber | cafe_tea | bakery | clinic_chiropractic | gym_yoga | builder | professional | cram_school | izakaya | pet_salon
 * genOptions: { contactForm, formActionUrl?, instagramLine, presentedBy, qrCode, instagramUrl?, lineUrl?, qrCodeDataUrl?, purchaseUrl? }
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
    purchaseUrl = '',
  } = genOptions;

  const tid = templateId;
  const navItems = (content.navItems && content.navItems.length) ? content.navItems : (DEFAULT_NAV[tid] || []);
  const purchaseNavHtml = !purchaseUrl ? '' : (tid === 'cafe_tea'
    ? `<a href="${escapeHtml(purchaseUrl)}" id="nav-item-purchase">購入</a>`
    : `<a href="${escapeHtml(purchaseUrl)}" class="nav-link" id="nav-item-purchase">購入</a>`);
  const cta = (content.ctaLabel && content.ctaHref) ? { label: content.ctaLabel, href: content.ctaHref } : (DEFAULT_CTA[tid] || { label: 'お問い合わせ', href: '#contact' });
  const heroImageUrl = (seo.ogImageUrl && seo.ogImageUrl.trim()) || defaultHeroImages[tid] || '';
  const woHeroSlides =
    tid === 'cafe_tea'
      ? (() => {
          const d1 = heroImageUrl || defaultHeroImages.cafe_tea;
          const d2 = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400';
          const d3 = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400';
          const hs = (content.heroSlides || []).filter((u) => (u || '').trim());
          if (hs.length >= 2) return hs;
          if (hs.length === 1) return [hs[0], d2, d3];
          return [d1, d2, d3];
        })()
      : [];

  const skipLink = '<a href="#main-content" class="skip-link">メインコンテンツへ</a>';

  const builderNavOverlay = tid === 'builder'
    ? `
<input type="checkbox" id="builder-nav-cb" class="builder-nav-cb" aria-hidden="true">
<div class="builder-nav-overlay" aria-label="メニュー" id="builder-nav-overlay">
  <label for="builder-nav-cb" class="builder-nav-close" aria-label="閉じる">CLOSE</label>
  <nav class="builder-nav-primary" aria-label="主要ナビゲーション">
    ${navItems.map((n) => `<a href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`).join('')}
  </nav>
  <nav class="builder-nav-secondary" aria-label="サブナビゲーション">
    <a href="#concept">news</a>
    <a href="#contact">contact</a>
    <a href="#access">access</a>
  </nav>
</div>`
    : '';

  const sections = content.sections || [];

  const headerHtml = tid === 'salon_barber'
    ? `<header>
    <div class="container header-inner">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
      <nav class="nav" aria-label="メインメニュー">
        ${navItems.map((n) => `<a href="${escapeHtml(n.href)}" class="nav-link">${escapeHtml(n.label)}</a>`).join('')}
        ${purchaseNavHtml}
      </nav>
      <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
    </div>
  </header>`
    : tid === 'cafe_tea'
      ? ''
      : tid === 'builder'
        ? `<header>
    <div class="container header-inner" style="display: flex; justify-content: space-between; align-items: center;">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
      <label for="builder-nav-cb" class="builder-menu-btn" aria-label="メニューを開く">MENU</label>
      ${purchaseNavHtml}
      <a href="${escapeHtml(cta.href)}" class="cta-btn" style="margin-left: auto;">${escapeHtml(cta.label)}</a>
    </div>
  </header>${builderNavOverlay}`
        : `<header>
    <div class="container header-inner">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
      <nav class="nav" aria-label="メインメニュー">
        ${navItems.map((n) => `<a href="${escapeHtml(n.href)}" class="nav-link">${escapeHtml(n.label)}</a>`).join('')}
        ${purchaseNavHtml}
      </nav>
      <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
    </div>
  </header>`;

  const ctaBlockHtml = `<div class="cta-block">
    <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
  </div>`;

  const footerLegal = '<div class="footer-legal"><p class="presented-by">Presented by ウェブページ作成ツール</p></div>';
  const hasFooterCols = !!(content.footerAddress || content.footerPhone || content.footerEmail);
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
        ${content.footerPhone ? `<p><a href="tel:${escapeHtml(String(content.footerPhone).replace(/\s/g, ''))}" class="footer-link">${escapeHtml(content.footerPhone)}</a></p>` : ''}
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
        ${content.footerPhone ? `<p><a href="tel:${escapeHtml(String(content.footerPhone).replace(/\s/g, ''))}" class="footer-link">${escapeHtml(content.footerPhone)}</a></p>` : ''}
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

  function getSectionRhythmClass(i, total) {
    if (total <= 0) return 'section-rhythm-default';
    if (i === 0) return 'section-rhythm-after-hero';
    if (i === total - 1) return 'section-rhythm-before-footer';
    const mid = Math.floor(total / 2);
    if (i === mid) return 'section-rhythm-breath';
    return 'section-rhythm-default';
  }

  const scrollInAttr = tid === 'cafe_tea' ? '' : ' data-scroll-in';
  const sectionImg = (s) => s.imageUrl ? `<div class="section-img-wrap"><img src="${escapeHtml(s.imageUrl)}" alt="" class="section-img" loading="lazy"></div>` : '';
  const sectionBody = (s) => `<div class="section-body"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p></div>`;

  function woHoursBody(text) {
    const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    const first = lines[0];
    const rest = lines.slice(1);
    const head = `<p class="wo-hours-emphasis"><span class="wo-text-mark">${escapeHtml(first)}</span></p>`;
    const tail = rest.map((l) => `<p class="wo-hours-detail">${escapeHtml(l)}</p>`).join('');
    return head + tail;
  }

  const faqItems = content.faqItems || [];
  const priceRows = content.priceRows || [];

  const sectionsDefault =
    tid === 'cafe_tea'
      ? sections
          .map((s, i) => {
            const rhythm = getSectionRhythmClass(i, sections.length);
            const imgWrapClass = s.imageUrl ? (i % 3 === 0 ? ' wo-img-wide' : i % 3 === 1 ? ' wo-img-tall' : ' wo-img-square') : '';
            const img = s.imageUrl ? `<div class="section-img-wrap${imgWrapClass}"><img src="${escapeHtml(s.imageUrl)}" alt="" class="section-img" loading="lazy"></div>` : '';
            const body = `<div class="section-body"><h2 id="${s.id}-title" class="wo-sec-heading">${escapeHtml(s.title)}</h2><div class="wo-sec-prose"><p>${escapeHtml(s.content).replace(/\n/g, '</p><p>')}</p></div></div>`;
            if (s.id === 'hours') {
              return `    <section class="section wo-sec wo-hours ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body">
        <h2 id="${s.id}-title" class="wo-sec-heading">${escapeHtml(s.title)}</h2>
        ${woHoursBody(s.content)}
      </div>
    </section>`;
            }
            if (s.id === 'faq' && faqItems.length > 0) {
              const faqHtml = faqItems.map((faq, j) => `<div class="wo-faq-item"><button type="button" class="wo-faq-q" aria-expanded="false" aria-controls="wo-faq-a-${i}-${j}" id="wo-faq-q-${i}-${j}">${escapeHtml(faq.q)}</button><div class="wo-faq-a" id="wo-faq-a-${i}-${j}" role="region" aria-labelledby="wo-faq-q-${i}-${j}"><p>${escapeHtml(faq.a)}</p></div></div>`).join('');
              return `    <section class="section wo-sec wo-faq ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body">
        <h2 id="${s.id}-title" class="wo-sec-heading">${escapeHtml(s.title)}</h2>
        <div class="wo-faq-list">${faqHtml}</div>
      </div>
    </section>`;
            }
            if (s.id === 'price' && priceRows.length > 0) {
              const rowsHtml = priceRows.map((row) => `<tr><td class="wo-price-name">${escapeHtml(row.name)}</td><td class="wo-price-value">${escapeHtml(row.price)}</td></tr>`).join('');
              return `    <section class="section wo-sec wo-price ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body">
        <h2 id="${s.id}-title" class="wo-sec-heading">${escapeHtml(s.title)}</h2>
        <div class="wo-price-table-wrap"><table class="wo-price-table"><tbody>${rowsHtml}</tbody></table></div>
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
      : sections
          .map((s, i) => {
            const rhythm = getSectionRhythmClass(i, sections.length);
            const alt = s.imageUrl && i >= 1 ? (i % 2 === 1 ? ' section-alt' : ' section-alt section-alt-reverse') : '';
            if (tid === 'salon_barber' && s.id === 'concept') {
              return `    <section class="section section-concept-lede ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      ${sectionImg(s)}
      <div class="section-body"><h2 id="${s.id}-title" class="salon-sec-title">${escapeHtml(s.title)}</h2><div class="section-concept-prose"><p>${escapeHtml(s.content).replace(/\n/g, '</p><p>')}</p></div></div>
    </section>`;
            }
            if (tid === 'salon_barber' && s.id === 'hours') {
              const lines = String(s.content).split('\n').map((l) => l.trim()).filter(Boolean);
              const dlRows = lines.map((line) => {
                const fullColon = line.indexOf('：');
                if (fullColon > 0) {
                  return `<dt>${escapeHtml(line.slice(0, fullColon))}</dt><dd>${escapeHtml(line.slice(fullColon + 1))}</dd>`;
                }
                const space = line.indexOf(' ');
                if (space > 0) {
                  return `<dt>${escapeHtml(line.slice(0, space))}</dt><dd>${escapeHtml(line.slice(space + 1))}</dd>`;
                }
                return `<dt class="salon-hours-label">${escapeHtml(line)}</dt><dd></dd>`;
              }).join('');
              return `    <section class="section section-hours ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body"><h2 id="${s.id}-title" class="salon-sec-title">${escapeHtml(s.title)}</h2><dl class="salon-hours-dl">${dlRows}</dl></div>
    </section>`;
            }
            if (tid === 'salon_barber' && s.id === 'access') {
              const mapEmbed = content.mapEmbedUrl
                ? `<div class="salon-map-wrap"><iframe src="${escapeHtml(content.mapEmbedUrl)}" width="100%" height="240" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="地図"></iframe></div>`
                : '';
              return `    <section class="section section-access ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body"><h2 id="${s.id}-title" class="salon-sec-title">${escapeHtml(s.title)}</h2><p class="salon-access-text">${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>${mapEmbed}</div>
    </section>`;
            }
            if (tid === 'clinic_chiropractic' && s.id === 'access') {
              const mapEmbed = content.mapEmbedUrl
                ? `<div class="clinic-map-wrap"><iframe src="${escapeHtml(content.mapEmbedUrl)}" width="100%" height="240" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="地図"></iframe></div>`
                : '';
              return `    <section class="section section-access ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>${mapEmbed}</div>
    </section>`;
            }
            if (tid === 'gym_yoga' && s.id === 'access') {
              const mapEmbed = content.mapEmbedUrl
                ? `<div class="gym-map-wrap"><iframe src="${escapeHtml(content.mapEmbedUrl)}" width="100%" height="240" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="地図"></iframe></div>`
                : '';
              return `    <section class="section section-access ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>${mapEmbed}</div>
    </section>`;
            }
            if (tid === 'salon_barber' && s.id === 'menu' && content.catalogImages && content.catalogImages.length > 0) {
              const catalogImgs = content.catalogImages.map((url) => `<div class="salon-catalog-item"><img src="${escapeHtml(url)}" alt="" class="salon-catalog-img" loading="lazy"></div>`).join('');
              return `    <section class="section section-catalog ${rhythm}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      <div class="section-body"><h2 id="${s.id}-title" class="salon-sec-title">${escapeHtml(s.title)}</h2><p>${escapeHtml(s.content)}</p><div class="salon-catalog-grid">${catalogImgs}</div></div>
    </section>`;
            }
            return `    <section class="section ${rhythm}${alt}" aria-labelledby="${s.id}-title"${scrollInAttr}>
      ${sectionImg(s)}
      ${sectionBody(s)}
    </section>`;
          })
          .join('\n');

  const quoteBlockHtml = content.quote
    ? `    <blockquote class="quote-block">${escapeHtml(content.quote)}</blockquote>`
    : '';

  const stats = content.stats && content.stats.length && tid === 'professional' ? content.stats : [];
  const statsBlockHtml = stats.length
    ? `    <div class="stats-block">
      ${stats.map((st) => `<div class="stat-item"><span class="stat-value">${escapeHtml(st.value)}</span><span class="stat-label">${escapeHtml(st.label)}</span></div>`).join('')}
    </div>`
    : '';

  const sectionsHtml = (statsBlockHtml ? statsBlockHtml + '\n' : '') + sectionsDefault;

  const extraMotionAttr = ' data-scroll-in';
  let extraSections = '';
  if (instagramLine && (instagramUrl || lineUrl)) {
    if (tid === 'cafe_tea') {
      extraSections += `
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
      extraSections += `
    <section class="section sns-links"${extraMotionAttr}>
      <h2>フォロー・お問い合わせ</h2>
      ${instagramUrl ? `<a href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener noreferrer">Instagram</a>` : ''}
      ${lineUrl ? `<a href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener noreferrer">LINE</a>` : ''}
    </section>`;
    }
  }
  if (contactForm) {
    const formAction = formActionUrl.trim() || '#';
    if (tid === 'cafe_tea') {
      extraSections += `
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
    } else if (tid === 'salon_barber') {
      extraSections += `
    <section class="section salon-form-block"${extraMotionAttr} id="contact-form">
      <div class="section-body">
        <h2 id="contact-form-title" class="salon-sec-title">お問い合わせ・予約</h2>
        <form class="salon-form" action="${escapeHtml(formAction)}" method="post" aria-labelledby="contact-form-title">
          <div class="salon-form-field">
            <label class="salon-form-label" for="salon-inp-name">お名前</label>
            <input class="salon-form-control" id="salon-inp-name" type="text" name="name" required autocomplete="name" placeholder="山田 太郎">
          </div>
          <div class="salon-form-field">
            <label class="salon-form-label" for="salon-inp-email">メール</label>
            <input class="salon-form-control" id="salon-inp-email" type="email" name="email" required autocomplete="email" placeholder="example@email.com">
          </div>
          <div class="salon-form-field">
            <label class="salon-form-label" for="salon-inp-body">ご用件</label>
            <textarea class="salon-form-control salon-form-textarea" id="salon-inp-body" name="body" rows="6" placeholder="ご予約希望日時・ご質問など"></textarea>
          </div>
          <button type="submit" class="cta-btn salon-form-submit">送信する</button>
        </form>
      </div>
    </section>`;
    } else {
      extraSections += `
    <section class="section"${extraMotionAttr}>
      <h2>お問い合わせ</h2>
      <form action="${escapeHtml(formAction)}" method="post">
        <p><label>お名前 <input type="text" name="name" required></label></p>
        <p><label>メール <input type="email" name="email" required></label></p>
        <p><label>内容 <textarea name="body" rows="4"></textarea></label></p>
        <p><button type="submit">送信</button></p>
      </form>
    </section>`;
    }
  }
  if (qrCode && qrCodeDataUrl) {
    extraSections += `
    <section class="section qr-block"${extraMotionAttr}>
      <h2>QRコード</h2>
      <p class="qr-block-mobile-note">スマホでご覧の方は、PCでこのページを開いてから読み取ってください。</p>
      <div class="qr-block-img-wrap"><img src="${escapeHtml(qrCodeDataUrl)}" alt="QRコード" width="120" height="120" class="qr-block-img"></div>
    </section>`;
  }

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
      <div class="wo-hero-dots" role="tablist">${woHeroSlides.map((_, i) => `<button type="button" class="wo-hero-dot${i === 0 ? ' active' : ''}" aria-label="スライド ${i + 1} / ${woHeroSlides.length}"></button>`).join('')}</div>
    </section>`
      : tid === 'salon_barber' || tid === 'bakery' || tid === 'clinic_chiropractic' || tid === 'gym_yoga' || tid === 'builder' || tid === 'professional' || tid === 'cram_school' || tid === 'izakaya' || tid === 'pet_salon'
        ? `<section class="hero hero-full-img hell-hero-parallax" style="--hero-bg-img: url(${escapeHtml(heroImageUrl)})">
      <div class="hero-bg-overlay"></div>
      <div class="hero-inner">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
      </div>
    </section>`
        : `<section class="hero hero-full-img" style="--hero-bg-img: url(${escapeHtml(heroImageUrl)})">
      <div class="hero-bg-overlay"></div>
      <div class="hero-inner">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
        <a href="${escapeHtml(cta.href)}" class="cta-btn cta-btn-primary">${escapeHtml(cta.label)}</a>
      </div>
    </section>`;

  const marqueeBar = '';

  const css = getTemplateFullCss(tid);
  const googleFonts = '';
  const a1Script = '';
  const scrollInScript = `<script>
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
document.querySelectorAll('.wo-faq-item').forEach(function(item){
var q=item.querySelector('.wo-faq-q');var a=item.querySelector('.wo-faq-a');
if(!q||!a)return;
q.addEventListener('click',function(){var open=item.classList.toggle('is-open');q.setAttribute('aria-expanded',open);});
});
})();
</script>`
      : '';

  const woChrome =
    tid === 'cafe_tea'
      ? `<div id="wo-top"></div>
<input type="checkbox" id="wo-nav-toggle" class="wo-nav-cb" aria-hidden="true">
<nav class="wo-nav-drawer" aria-label="メインメニュー">
  <label for="wo-nav-toggle" class="wo-nav-backdrop"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">閉じる</span></label>
  <div class="wo-nav-drawer-inner">
    <p class="wo-nav-brand">${escapeHtml(content.siteName)}</p>
    ${navItems.map((n) => `<a href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a>`).join('')}
    ${purchaseNavHtml}
    <a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a>
  </div>
</nav>
<label for="wo-nav-toggle" class="wo-nav-fab" aria-label="メニュー"><span></span><span></span><span></span></label>`
      : '';

  const ctaAfterHero = (tid !== 'cafe_tea' && tid !== 'salon_barber' && tid !== 'clinic_chiropractic' && tid !== 'gym_yoga') ? ctaBlockHtml : '';

  const symptomItems = content.symptomItems || [];
  const reasonItems = content.reasonItems || [];
  const conceptDiagramLabels = content.conceptDiagramLabels || [];
  let clinicBlocksHtml = '';
  if (tid === 'clinic_chiropractic') {
    if (symptomItems.length > 0) {
      clinicBlocksHtml += `
    <section class="clinic-symptoms" aria-labelledby="clinic-symptoms-title">
      <h2 id="clinic-symptoms-title">こんなお悩みありませんか？</h2>
      <ul class="clinic-symptoms-list">${symptomItems.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
      <a href="${escapeHtml(cta.href)}" class="clinic-cta-banner">その悩み、当院にお任せください</a>
    </section>`;
    }
    if (reasonItems.length > 0) {
      clinicBlocksHtml += `
    <section class="clinic-reasons" aria-labelledby="clinic-reasons-title">
      <h2 id="clinic-reasons-title">選ばれる理由</h2>
      <div class="clinic-reason-list">${reasonItems.map((r) => `
        <div class="clinic-reason-item">
          <span class="clinic-reason-num">${escapeHtml(r.num)}</span>
          <div class="clinic-reason-body">
            <h3>${escapeHtml(r.title)}</h3>
            <p>${escapeHtml(r.body)}</p>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    }
    const clinicStats = content.stats && content.stats.length ? content.stats : [];
    if (clinicStats.length > 0) {
      clinicBlocksHtml += `
    <section class="clinic-stats-wrap" aria-label="実績">
      <div class="stats-block">${clinicStats.map((st) => `<div class="stat-item"><span class="stat-value">${escapeHtml(st.value)}</span><span class="stat-label">${escapeHtml(st.label)}</span></div>`).join('')}</div>
    </section>`;
    }
    if (conceptDiagramLabels.length >= 2) {
      clinicBlocksHtml += `
    <section class="clinic-diagram" aria-labelledby="clinic-diagram-title">
      <h2 id="clinic-diagram-title">アプローチ</h2>
      <div class="clinic-diagram-circles" role="img" aria-label="${escapeHtml(conceptDiagramLabels.join('・'))}">${conceptDiagramLabels.map((l) => `<span>${escapeHtml(l)}</span>`).join('')}</div>
    </section>`;
    }
  }

  const gymStats = tid === 'gym_yoga' && content.stats && content.stats.length ? content.stats : [];
  const gymReasonItems = tid === 'gym_yoga' ? (content.reasonItems || []) : [];
  let gymBlocksHtml = '';
  if (tid === 'gym_yoga') {
    if (gymStats.length > 0) {
      gymBlocksHtml += `
    <section class="gym-results-block" aria-labelledby="gym-results-title">
      <h2 id="gym-results-title">実績</h2>
      <div class="gym-results-stats">${gymStats.map((st) => `<div class="gym-stat-item"><span class="gym-stat-value">${escapeHtml(st.value)}</span><span class="gym-stat-label">${escapeHtml(st.label)}</span></div>`).join('')}</div>
    </section>`;
    }
    if (gymReasonItems.length > 0) {
      gymBlocksHtml += `
    <section class="gym-reasons-block" aria-labelledby="gym-reasons-title">
      <h2 id="gym-reasons-title">選ばれる理由</h2>
      <div class="gym-reason-list">${gymReasonItems.map((r) => `
        <div class="gym-reason-item">
          <span class="gym-reason-num">${escapeHtml(r.num)}</span>
          <div class="gym-reason-body">
            <h3>${escapeHtml(r.title)}</h3>
            <p>${escapeHtml(r.body)}</p>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    }
  }

  const gymStickyCtaHtml = (tid === 'gym_yoga' && cta.label && cta.href)
    ? `<div class="gym-sticky-cta" aria-label="申し込み"><a href="${escapeHtml(cta.href)}" class="cta-btn">${escapeHtml(cta.label)}</a></div>`
    : '';

  const builderViewIdToSectionId = { works: 'gallery', ideas: 'concept', people: 'staff', about: 'about', access: 'access', contact: 'contact' };
  const getSectionById = (id) => sections.find((s) => s.id === id);
  const getSectionForView = (viewId) => {
    const sid = builderViewIdToSectionId[viewId];
    if (viewId === 'ideas') return sections.find((s) => s.id === 'concept');
    return getSectionById(sid);
  };

  let builderViewsHtml = '';
  let builderViewScript = '';
  if (tid === 'builder') {
    const heroBg = `url(${escapeHtml(heroImageUrl)})`;
    builderViewsHtml = `
<div id="builder-views" class="builder-views">
  <div class="builder-view builder-view-hero active" id="builder-view-hero" data-builder-view="hero">
    <div class="builder-hero-bg" style="background-image:${heroBg}"></div>
    <div class="builder-hero-overlay">
      <div class="builder-hero-search">Search:</div>
      <div class="builder-hero-logo">${escapeHtml(content.siteName)}</div>
      <div class="builder-hero-copy">
        <p class="builder-hero-catchphrase">${escapeHtml(content.subheadline)}</p>
        <h1 class="builder-hero-title">${escapeHtml(content.headline)}</h1>
      </div>
      <a href="#menu" class="builder-hero-menu-btn">MENU</a>
      <div class="builder-hero-dots"><span></span><span></span><span></span></div>
    </div>
  </div>
  <div class="builder-view builder-view-menu" id="builder-view-menu" data-builder-view="menu">
    <div class="builder-menu-inner">
      <a href="#" class="builder-nav-close" aria-label="閉じる">CLOSE</a>
      <div class="builder-menu-search">Search:</div>
      <nav class="builder-nav-primary">
        <a href="#works">WORKS</a>
        <a href="#ideas">IDEAS</a>
        <a href="#people">PEOPLE</a>
        <a href="#about">ABOUT</a>
      </nav>
      <nav class="builder-nav-secondary">
        <a href="#concept">news</a>
        <a href="#contact">contact</a>
        <a href="#access">access</a>
        <a href="#contact">newsletter</a>
        <span class="builder-menu-ja-en">ja / en</span>
      </nav>
    </div>
  </div>
  ${['works', 'ideas', 'people', 'about', 'access', 'contact'].map((viewId) => {
    const sec = getSectionForView(viewId);
    const title = viewId.charAt(0).toUpperCase() + viewId.slice(1);
    if (!sec) return `<div class="builder-view builder-view-${viewId}" id="builder-view-${viewId}" data-builder-view="${viewId}"><div class="builder-content-bar"><a href="#menu">MENU</a></div><div class="container builder-content-inner"><h2>${title}</h2><p>—</p></div></div>`;
    return `<div class="builder-view builder-view-${viewId}" id="builder-view-${viewId}" data-builder-view="${viewId}">
    <div class="builder-content-bar"><a href="#menu">MENU</a></div>
    <div class="container builder-content-inner">
      <section class="section section-rhythm-default">${sectionImg(sec)}${sectionBody(sec)}</section>
    </div>
  </div>`;
  }).join('')}
</div>`;

    builderViewScript = `<script>
(function(){
  var views = document.querySelectorAll('.builder-view');
  var hashToView = { '': 'hero', 'hero': 'hero', 'menu': 'menu', 'works': 'works', 'ideas': 'ideas', 'people': 'people', 'about': 'about', 'access': 'access', 'contact': 'contact' };
  function applyView(){
    var h = (location.hash || '#').replace(/^#/, '') || '';
    var viewId = hashToView[h] || 'hero';
    views.forEach(function(v){
      var id = v.getAttribute('data-builder-view');
      v.classList.toggle('active', id === viewId);
    });
  }
  applyView();
  window.addEventListener('hashchange', applyView);
})();
</script>`;
  }

  const isBuilder = tid === 'builder';
  const bodyInner = isBuilder
    ? `${skipLink}${builderViewsHtml}${builderViewScript}`
    : `${skipLink}
  ${woChrome}
  ${marqueeBar}
  ${headerHtml}
  <main id="main-content">
    ${heroSection}
    ${ctaAfterHero}
    ${clinicBlocksHtml}
    ${gymBlocksHtml}
    <div class="container">
${quoteBlockHtml}
${sectionsHtml}
${extraSections}
    </div>
  </main>
  ${gymStickyCtaHtml}
  ${footerHtml}
  ${a1Script}
  ${scrollInScript}
  ${woOrganicScript}
  ${purchaseUrl ? `<script>
(function(){if(/[?&]payment=success/.test(location.search)){var el=document.getElementById('nav-item-purchase');if(el)el.style.display='none';}})();
</script>` : ''}
  <script>
(function(){var h=document.querySelector('header');if(!h)return;function upd(){h.classList.toggle('scrolled',window.scrollY>40);}upd();window.addEventListener('scroll',upd,{passive:true});})();
</script>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    ${googleFonts}
    <style>${css}</style>
</head>
<body class="page-wrapper template-${tid}">
  ${bodyInner}
</body>
</html>`;
}
