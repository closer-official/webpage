/**
 * beauty_salon_mellow 用: 生成済み body HTML に content を反映（サーバー・Vite 共通）
 * @param {string} html
 * @param {Record<string, unknown>} content
 * @param {(s: string) => string} escapeHtml
 */
import { applyBsmTextSlots, applyBsmFaqItems } from './beautySalonMellowTextSlots.js';

function decodeBasicEntities(s) {
  return String(s || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function extractFirstIframeSrcFromHtml(html) {
  const s = decodeBasicEntities(html);
  const m = s.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  return m ? m[1].trim() : '';
}

function isAllowedGoogleMapsIframeSrc(src) {
  try {
    const u = new URL(String(src || '').trim());
    const h = u.hostname.toLowerCase();
    if (!/^(www\.)?google\.(com|co\.jp)$/i.test(h) && !/^maps\.google\.(com|co\.jp)$/i.test(h)) return false;
    return /\/maps\//i.test(u.pathname) || /[?&]pb=/.test(u.search);
  } catch {
    return false;
  }
}

/**
 * @param {string} html
 * @param {(s: string) => string} esc
 */
function replaceAccessMapWithIframe(html, esc, iframeSrc) {
  const src = String(iframeSrc || '').trim();
  if (!src || !isAllowedGoogleMapsIframeSrc(src)) return html;
  const safe = `<iframe src="${esc(
    src,
  )}" title="地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>`;
  return html.replace(
    /<div class="access-map fade-up">[\s\S]*?<\/div>(\s*<div class="fade-up delay-1">)/m,
    `<div class="access-map fade-up" style="position:relative;min-height:280px;aspect-ratio:4/3;background:var(--beige)">${safe}</div>$1`,
  );
}

export function applyBeautySalonMellowReplacements(html, content, escapeHtml) {
  let out = String(html || '');
  const esc = escapeHtml;
  const rawSlots =
    content.beautySalonMellowSlots && typeof content.beautySalonMellowSlots === 'object' && !Array.isArray(content.beautySalonMellowSlots)
      ? content.beautySalonMellowSlots
      : {};
  const slots = { ...rawSlots };
  const hl = String(content.headline || '').trim();
  const sub = String(content.subheadline || '').trim();
  if (hl && !String(slots['hero.headline'] || '').trim()) slots['hero.headline'] = hl;
  if (sub && !String(slots['hero.subtitle'] || '').trim()) slots['hero.subtitle'] = sub;

  out = applyBsmTextSlots(out, slots, esc);
  out = applyBsmFaqItems(out, content.faqItems, esc);

  const hasBsmHero = out.includes('<!--BSM:hero.headline-->');
  if (!hasBsmHero) {
    if (hl) {
      out = out.replace(/<h1 class="hero-title">[\s\S]*?<\/h1>/m, `<h1 class="hero-title">${esc(hl).replace(/\n/g, '<br>')}</h1>`);
    }
    if (sub) {
      out = out.replace(
        /<p class="hero-subtitle">[\s\S]*?<\/p>/m,
        `<p class="hero-subtitle">${esc(sub).replace(/\n/g, '<br>')}</p>`,
      );
    }
  }

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

  out = out.replace(
    /<a class="logo" onclick="showPage\('home'\)" style="cursor:pointer">[^<]*<span>[^<]*<\/span><\/a>/g,
    `<a class="logo" onclick="showPage('home')" style="cursor:pointer">${esc(brand)}<span>${esc(tagEn)}</span></a>`,
  );
  out = out.replace(
    /<div class="logo" onclick="showPage\('home'\)" style="cursor:pointer">[^<]*<span>[^<]*<\/span><\/div>/g,
    `<div class="logo" onclick="showPage('home')" style="cursor:pointer">${esc(brand)}<span>${esc(tagEn)}</span></div>`,
  );

  const rawMapHtml = String(content.mapEmbedHtml || '').trim().slice(0, 50000);
  const fromHtmlSrc = rawMapHtml ? extractFirstIframeSrcFromHtml(rawMapHtml) : '';
  if (fromHtmlSrc && isAllowedGoogleMapsIframeSrc(fromHtmlSrc)) {
    out = replaceAccessMapWithIframe(out, esc, fromHtmlSrc);
  } else {
    const mapU = String(content.mapEmbedUrl || '').trim();
    if (mapU && /^https?:\/\//i.test(mapU) && isAllowedGoogleMapsIframeSrc(mapU)) {
      out = replaceAccessMapWithIframe(out, esc, mapU);
    }
  }

  const resUrl = String(content.beautySalonReserveUrl || '').trim();
  if (resUrl && /^https?:\/\//i.test(resUrl)) {
    const safeU = esc(resUrl);
    out = out.replace(
      /<a class="btn-gold" onclick="showPage\('reserve'\)">WEB予約<\/a>/g,
      `<a class="btn-gold" href="${safeU}" target="_blank" rel="noopener noreferrer">WEB予約</a>`,
    );
    out = out.replace(
      /<a class="btn-primary" onclick="showPage\('reserve'\)">WEB予約はこちら<\/a>/g,
      `<a class="btn-primary" href="${safeU}" target="_blank" rel="noopener noreferrer">WEB予約はこちら</a>`,
    );
    out = out.replace(
      /<a class="btn-primary" style="text-align:center;padding:20px;font-size:0\.8rem">▶ WEB予約（24時間受付）<\/a>/g,
      `<a class="btn-primary" href="${safeU}" target="_blank" rel="noopener noreferrer" style="text-align:center;padding:20px;font-size:0.8rem">▶ WEB予約（24時間受付）</a>`,
    );
    out = out.replace(/<a onclick="showPage\('reserve'\)">WEB予約<\/a>/g, `<a href="${safeU}" target="_blank" rel="noopener noreferrer">WEB予約</a>`);
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
