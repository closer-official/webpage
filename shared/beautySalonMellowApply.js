/**
 * beauty_salon_mellow 用: 生成済み body HTML に content を反映（サーバー・Vite 共通）
 * @param {string} html
 * @param {Record<string, unknown>} content
 * @param {(s: string) => string} escapeHtml
 */
export function applyBeautySalonMellowReplacements(html, content, escapeHtml) {
  let out = String(html || '');
  const esc = escapeHtml;
  const brand = String(content.siteName || '').trim() || 'mellow by luce';
  const titleRaw = String(content.title || '').trim();
  const tagEn = titleRaw && titleRaw !== brand ? titleRaw : 'OMOTESANDO HAIR SALON';

  const slides = Array.isArray(content.heroSlides) ? content.heroSlides : [];
  const hero = slides.map((u) => String(u || '').trim()).filter(Boolean)[0] || '';
  if (hero && (/^https?:\/\//i.test(hero) || hero.startsWith('/'))) {
    out = out.replace(/(<div class="hero-img" style="background-image:url\(['"])([^'"]+)(['"]\))/m, (_m, a, _b, c) => {
      return a + esc(hero) + c;
    });
  }

  const headline = String(content.headline || '').trim();
  if (headline) {
    out = out.replace(/<h1 class="hero-title">[\s\S]*?<\/h1>/m, `<h1 class="hero-title">${esc(headline).replace(/\n/g, '<br>')}</h1>`);
  }
  const sub = String(content.subheadline || '').trim();
  if (sub) {
    out = out.replace(
      /<p class="hero-subtitle">[\s\S]*?<\/p>/m,
      `<p class="hero-subtitle">${esc(sub).replace(/\n/g, '<br>')}</p>`,
    );
  }

  out = out.replace(
    /<a class="logo" onclick="showPage\('home'\)" style="cursor:pointer">[^<]*<span>[^<]*<\/span><\/a>/g,
    `<a class="logo" onclick="showPage('home')" style="cursor:pointer">${esc(brand)}<span>${esc(tagEn)}</span></a>`,
  );
  out = out.replace(
    /<div class="logo" onclick="showPage\('home'\)" style="cursor:pointer">[^<]*<span>[^<]*<\/span><\/div>/g,
    `<div class="logo" onclick="showPage('home')" style="cursor:pointer">${esc(brand)}<span>${esc(tagEn)}</span></div>`,
  );

  const mapU = String(content.mapEmbedUrl || '').trim();
  if (mapU && /^https?:\/\//i.test(mapU)) {
    out = out.replace(
      /<div class="access-map fade-up">[\s\S]*?<\/div>(\s*<div class="fade-up delay-1">)/m,
      `<div class="access-map fade-up" style="position:relative;min-height:280px;aspect-ratio:4/3;background:var(--beige)"><iframe src="${esc(
        mapU,
      )}" title="地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>$1`,
    );
  }

  const phoneDigits = String(content.footerPhone || '')
    .trim()
    .replace(/\s/g, '');
  if (phoneDigits) {
    const telHref = 'tel:' + esc(phoneDigits);
    out = out.replace(/href=["']tel:[^"']+["']/gi, `href="${telHref}"`);
  }

  const ft = String(content.footerText || '').trim();
  if (ft) {
    out = out.replace(/<div class="footer-bottom">[\s\S]*?<\/div>/g, `<div class="footer-bottom">${esc(ft)}</div>`);
  }

  const accessTitle = String(content.siteName || brand).trim();
  out = out.replace(
    /<div class="access-info-title">[^<]*<\/div>/g,
    `<div class="access-info-title">${esc(accessTitle)}</div>`,
  );

  return out;
}
