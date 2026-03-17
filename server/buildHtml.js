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

  const sectionsDefault = sections
    .map(
      (s) =>
        `    <section class="section" aria-labelledby="${s.id}-title">
      <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
    </section>`
    )
    .join('\n');

  const sectionsHtml =
    tid === 'corporate_trust'
      ? `    <div class="section-grid">${sections
          .map(
            (s) =>
              `<div class="section-card" aria-labelledby="${s.id}-title">
        <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
        <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
      </div>`
          )
          .join('')}</div>`
      : tid === 'high_energy'
        ? sections
            .map(
              (s) =>
                `    <section class="section" aria-labelledby="${s.id}-title">
      <div class="section-inner"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p></div>
    </section>`
            )
            .join('\n')
        : tid === 'minimal_luxury'
          ? sections
              .map(
                (s) =>
                  `    <section class="section" aria-labelledby="${s.id}-title" data-a1-animate>
      <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
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

  const footerExtra = presentedBy ? '<p class="presented-by">Presented by ウェブページ作成ツール</p>' : '';

  const heroBgStyle = tid === 'dark_edge' && seo.ogImageUrl ? ` style="background-image: url(${escapeHtml(seo.ogImageUrl)})"` : '';
  const a1HeroImage =
    tid === 'minimal_luxury'
      ? (seo.ogImageUrl && seo.ogImageUrl.trim()) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200'
      : '';

  const heroSection =
    tid === 'dark_edge'
      ? `<section class="hero">
      <div class="hero-bg"${heroBgStyle}></div>
      <div class="hero-text"><h1>${escapeHtml(content.headline)}</h1><p class="subheadline">${escapeHtml(content.subheadline)}</p></div>
    </section>`
      : tid === 'minimal_luxury'
        ? `<section class="hero" data-a1-animate>
      <div class="hero-a1-text"><h1>${escapeHtml(content.headline)}</h1><p class="subheadline">${escapeHtml(content.subheadline)}</p></div>
      <div><img src="${escapeHtml(a1HeroImage)}" alt="" class="hero-a1-img" loading="eager"></div>
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
      : '';
  const a1Script =
    tid === 'minimal_luxury'
      ? `<script>
(function(){var el=document.querySelectorAll('[data-a1-animate]');var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('a1-visible');io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});el.forEach(function(e){io.observe(e);});})();
</script>`
      : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    ${googleFonts}
    <style>${css}</style>
</head>
<body class="page-wrapper template-${tid}">
  ${marqueeBar}
  <header>
    <div class="container">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
    </div>
  </header>
  <main>
    ${heroSection}
    <div class="container">
${sectionsHtml}
${extraSections}
    </div>
  </main>
  <footer>
    <div class="container">
      ${escapeHtml(content.footerText)}
      ${footerExtra}
    </div>
  </footer>
  ${a1Script}
</body>
</html>`;
}
