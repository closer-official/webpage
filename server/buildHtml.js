import { CONCEPT_TEMPLATES, TEMPLATE_CSS } from './conceptTemplates.js';

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCss(templateId) {
  const vars = TEMPLATE_CSS[templateId] || TEMPLATE_CSS.general_minimal;
  const varLines = Object.entries(vars).map(([k, v]) => `  --tp-${k}: ${v};`).join('\n');
  return `
  .page-wrapper.template-${templateId} { ${varLines} }
  .page-wrapper { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--tp-font); color: var(--tp-text); background: var(--tp-bg); line-height: 1.7; }
  .page-wrapper * { box-sizing: border-box; }
  .page-wrapper .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .page-wrapper header { padding: 24px 0; border-bottom: 1px solid var(--tp-border); }
  .page-wrapper .logo { font-size: 1.25rem; font-weight: 700; color: var(--tp-heading); text-decoration: none; }
  .page-wrapper .hero { padding: 64px 0; text-align: center; }
  .page-wrapper .hero h1 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; color: var(--tp-heading); margin: 0 0 16px; }
  .page-wrapper .hero .subheadline { font-size: 1.125rem; opacity: 0.9; }
  .page-wrapper main { padding: 48px 0 64px; }
  .page-wrapper .section { margin-bottom: 48px; }
  .page-wrapper .section h2 { font-size: 1.5rem; font-weight: 600; color: var(--tp-heading); margin: 0 0 16px; }
  .page-wrapper .section p { margin: 0 0 12px; }
  .page-wrapper footer { padding: 32px 0; border-top: 1px solid var(--tp-border); text-align: center; font-size: 0.875rem; opacity: 0.8; }
  .page-wrapper .sns-links { margin-top: 24px; }
  .page-wrapper .sns-links a { margin-right: 12px; color: var(--tp-accent); }
  .page-wrapper .presented-by { font-size: 0.75rem; opacity: 0.7; margin-top: 8px; }
  .page-wrapper .qr-block { margin-top: 24px; text-align: center; }
  .page-wrapper .qr-block img { max-width: 120px; }
`;
}

/**
 * content: { siteName, title, headline, subheadline, sections: [{ id, title, content }], footerText }
 * seo: { metaTitle, metaDescription, keywords, ogImageUrl, canonicalUrl }
 * templateId: minimal | corporate | warm | bold | elegant | modern
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

  const sectionsHtml = (content.sections || [])
    .map(
      (s) =>
        `    <section class="section" aria-labelledby="${s.id}-title">
      <h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.content).replace(/\n/g, '<br>')}</p>
    </section>`
    )
    .join('\n');

  let extraSections = '';
  if (instagramLine && (instagramUrl || lineUrl)) {
    extraSections += `
    <section class="section sns-links">
      <h2>フォロー・お問い合わせ</h2>
      ${instagramUrl ? `<a href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener">Instagram</a>` : ''}
      ${lineUrl ? `<a href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener">LINE</a>` : ''}
    </section>`;
  }
  if (contactForm) {
    const formAction = formActionUrl.trim() || '#';
    extraSections += `
    <section class="section">
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
    <section class="section qr-block">
      <h2>QRコード</h2>
      <img src="${escapeHtml(qrCodeDataUrl)}" alt="QRコード" width="120" height="120">
    </section>`;
  }

  const footerExtra = presentedBy ? '<p class="presented-by">Presented by ウェブページ作成ツール</p>' : '';

  const css = buildCss(templateId);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    ${metaTags}
    <style>${css}</style>
</head>
<body class="page-wrapper template-${templateId}">
  <header>
    <div class="container">
      <a href="#" class="logo">${escapeHtml(content.siteName)}</a>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="container">
        <h1>${escapeHtml(content.headline)}</h1>
        <p class="subheadline">${escapeHtml(content.subheadline)}</p>
      </div>
    </section>
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
</body>
</html>`;
}
