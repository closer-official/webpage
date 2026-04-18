/**
 * 美容室テンプレ（独立版）の salon JSON → 共有プレビュー用 HTML。
 * public/admin/beauty-standalone-template/renderer.js のセクション構成に合わせる。
 */

function esc(str) {
  if (str == null || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function effectiveAddressMapUrl(salon) {
  const u = String(salon.addressMapUrl || '').trim();
  if (/^https?:\/\//i.test(u)) return u;
  const addr = String(salon.address || '').trim();
  if (!addr) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}

function primaryBookingUrl(salon) {
  const r = String(salon.reserveUrl || '').trim();
  if (/^https?:\/\//i.test(r)) return r;
  const h = String(salon.homepageUrl || '').trim();
  if (/^https?:\/\//i.test(h)) return h;
  return '';
}

function staffListUrlResolved(salon) {
  const u = String(salon.staffListUrl || '').trim();
  if (/^https?:\/\//i.test(u)) return u;
  return primaryBookingUrl(salon);
}

function staffMemberReserveUrl(salon, staff) {
  const u = String((staff && staff.reserveUrl) || '').trim();
  if (/^https?:\/\//i.test(u)) return u;
  return primaryBookingUrl(salon);
}

function getInitials(name) {
  if (!name) return '?';
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(name)) return name.charAt(0);
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function buildStaffAvatarHtml(staff) {
  const rawUrl = String((staff && staff.avatarUrl) || '').trim();
  const rawText = String((staff && staff.avatarText) || '').trim();
  const fallbackText = rawText || getInitials(staff && staff.name);
  if (rawUrl) {
    return `<div class="staff-avatar has-image"><img src="${esc(rawUrl)}" alt="${esc(
      (staff && staff.name) || 'staff',
    )}" loading="lazy" decoding="async"></div>`;
  }
  return `<div class="staff-avatar">${esc(fallbackText)}</div>`;
}

function hasStats(salon) {
  const s = salon && salon.stats;
  return (
    s &&
    (s.firstVisitPrice ||
      s.repeatVisitPrice ||
      (s.genderRatio && s.genderRatio.female !== null && s.genderRatio.female !== undefined) ||
      (s.ageRatio && s.ageRatio.length > 0))
  );
}

function buildHeroHtml(salon) {
  const rating = salon.rating
    ? `<span class="hero-rating"><span class="rating-star">★</span>${esc(String(salon.rating))}</span>`
    : '';
  const rc = salon.reviewCount;
  const reviews =
    rc != null && rc !== ''
      ? `<span class="hero-reviews">${Number(rc).toLocaleString('ja-JP')}件の口コミ</span>`
      : '';
  const badge = salon.heroCatch ? `<div class="hero-badge">${esc(salon.heroCatch)}</div>` : '';
  const mapUrl = effectiveAddressMapUrl(salon);
  const addr = String(salon.address || '').trim();
  let access = '';
  if (addr && mapUrl) {
    access = `<div class="hero-access"><span class="access-icon">📍</span><a class="hero-access-link" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">${esc(addr)}</a></div>`;
  } else if (addr) {
    access = `<div class="hero-access"><span class="access-icon">📍</span>${esc(addr)}</div>`;
  } else if (salon.accessShort) {
    access = `<div class="hero-access"><span class="access-icon">📍</span>${esc(salon.accessShort)}</div>`;
  }
  return `<section class="lp-section lp-hero" id="top">
    <div class="hero-inner">
      ${badge}
      <h1 class="hero-name">${esc(salon.name)}</h1>
      ${salon.title ? `<p class="hero-title">${esc(salon.title)}</p>` : ''}
      <div class="hero-meta">${rating}${reviews}</div>
      ${access}
    </div>
    <div class="hero-deco" aria-hidden="true">
      <span class="hero-deco-line"></span>
      <span class="hero-deco-circle"></span>
    </div>
  </section>`;
}

function buildIntroHtml(salon) {
  return `<section class="lp-section lp-intro" id="about">
    <div class="section-inner">
      <div class="section-label">ABOUT</div>
      <h2 class="section-title">サロンについて</h2>
      <p class="intro-text">${esc(salon.introText)}</p>
    </div>
  </section>`;
}

function buildFeaturesHtml(salon) {
  const cards = salon.features
    .map(
      (f, i) => `
    <div class="feature-card" style="--i:${i}">
      <div class="feature-num">${String(i + 1).padStart(2, '0')}</div>
      <h3 class="feature-title">${esc(f.title)}</h3>
      <p class="feature-text">${esc(f.text)}</p>
    </div>`,
    )
    .join('');
  return `<section class="lp-section lp-features" id="features">
    <div class="section-inner">
      <div class="section-label">FEATURES</div>
      <h2 class="section-title">こだわり</h2>
      <div class="features-grid">${cards}</div>
    </div>
  </section>`;
}

function buildCouponsHtml(salon) {
  const couponJump = primaryBookingUrl(salon);
  const cards = salon.coupons.slice(0, 6).map((c) => {
    const typeClass = c.type === '新規' ? 'coupon-new' : c.type === '再来' ? 'coupon-repeat' : 'coupon-all';
    const cats = (c.categories || []).join(' · ');
    const price =
      c.price != null && c.price !== '' ? `¥${Number(c.price).toLocaleString('ja-JP')}` : '¥–';
    return `
      <div class="coupon-card ${typeClass}">
        <div class="coupon-type">${esc(c.type)}</div>
        ${cats ? `<div class="coupon-cats">${esc(cats)}</div>` : ''}
        <div class="coupon-price">${price}</div>
        <p class="coupon-title">${esc(c.title)}</p>
      </div>`;
  });
  const cta = salon.homepageUrl
    ? `<div class="coupon-cta-wrap"><a href="${esc(salon.homepageUrl)}" class="btn-outline" target="_blank" rel="noopener">クーポン一覧を見る →</a></div>`
    : '';
  return `<section class="lp-section lp-coupons" id="coupons">
    <div class="section-inner">
      <div class="section-label">COUPON</div>
      <h2 class="section-title">人気クーポン</h2>
      <div class="coupons-grid">${cards.join('')}</div>
      ${cta}
    </div>
  </section>`;
}

function buildAtmosphereHtml(salon) {
  const items = salon.atmosphere
    .map(
      (a, i) => `
    <div class="atmo-item" style="--i:${i}">
      <div class="atmo-num">${String(i + 1).padStart(2, '0')}</div>
      <p class="atmo-text">${esc(a)}</p>
    </div>`,
    )
    .join('');
  return `<section class="lp-section lp-atmosphere" id="atmosphere">
    <div class="section-inner">
      <div class="section-label">ATMOSPHERE</div>
      <h2 class="section-title">サロンの雰囲気</h2>
      <div class="atmo-grid">${items}</div>
    </div>
  </section>`;
}

function buildStaffHtml(salon) {
  const listJump = staffListUrlResolved(salon);
  const cards = salon.staff
    .map((s, i) => {
      const href = staffMemberReserveUrl(salon, s);
      const reserve = href
        ? `<a class="staff-reserve-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">指名して予約する</a>`
        : '';
      return `
    <div class="staff-card" style="--i:${i}">
      ${buildStaffAvatarHtml(s)}
      <h3 class="staff-name">${esc(s.name)}</h3>
      ${s.specialty ? `<p class="staff-specialty">${esc(s.specialty)}</p>` : ''}
      ${s.experience ? `<span class="staff-exp">${esc(s.experience)}</span>` : ''}
      ${s.catch ? `<p class="staff-catch">${esc(s.catch)}</p>` : ''}
      ${reserve}
    </div>`;
    })
    .join('');
  const viewAll =
    listJump && salon.staff.length
      ? `<a class="staff-view-all" href="${esc(listJump)}" target="_blank" rel="noopener noreferrer">
      <div class="staff-card staff-card--linkout" style="--i:${salon.staff.length}">
        <div class="staff-avatar staff-avatar--icon" aria-hidden="true">→</div>
        <h3 class="staff-name">このサロンのすべてのスタイリストを見る</h3>
        <p class="staff-specialty">公式の一覧・予約ページへ</p>
      </div>
    </a>`
      : '';
  return `<section class="lp-section lp-staff" id="staff">
    <div class="section-inner">
      <div class="section-label">STAFF</div>
      <h2 class="section-title">スタイリスト</h2>
      <div class="staff-grid">${cards}${viewAll}</div>
    </div>
  </section>`;
}

function buildMessageHtml(salon) {
  const title = salon.messageTitle
    ? `<h2 class="section-title">${esc(salon.messageTitle)}</h2>`
    : '<h2 class="section-title">サロンからの一言</h2>';
  return `<section class="lp-section lp-message" id="message">
    <div class="section-inner">
      <div class="section-label">MESSAGE</div>
      ${title}
      <blockquote class="message-text">${esc(salon.messageText)}</blockquote>
    </div>
  </section>`;
}

function buildStatsHtml(salon) {
  const s = salon.stats;
  const priceRows = [
    s.firstVisitPrice ? `<tr><td>初来店</td><td>${esc(s.firstVisitPrice)}</td></tr>` : '',
    s.repeatVisitPrice ? `<tr><td>2回目以降</td><td>${esc(s.repeatVisitPrice)}</td></tr>` : '',
  ]
    .filter(Boolean)
    .join('');

  const genderHTML =
    s.genderRatio && s.genderRatio.female !== null && s.genderRatio.female !== undefined
      ? `
    <div class="stat-block">
      <div class="stat-block-title">性別比率</div>
      <div class="gender-bars">
        <div class="gender-bar">
          <span class="gender-label">女性</span>
          <div class="bar-track"><div class="bar-fill bar-female" style="width:${Number(s.genderRatio.female)}%"></div></div>
          <span class="gender-pct">${esc(String(s.genderRatio.female))}%</span>
        </div>
        <div class="gender-bar">
          <span class="gender-label">男性</span>
          <div class="bar-track"><div class="bar-fill bar-male" style="width:${Number(s.genderRatio.male || 0)}%"></div></div>
          <span class="gender-pct">${esc(String(s.genderRatio.male || 0))}%</span>
        </div>
      </div>
    </div>`
      : '';

  const ageHTML =
    s.ageRatio && s.ageRatio.length > 0
      ? `
    <div class="stat-block">
      <div class="stat-block-title">年代比率</div>
      <div class="age-bars">
        ${s.ageRatio
          .map(
            (a) => `
          <div class="age-bar">
            <span class="age-label">${esc(a.label)}</span>
            <div class="bar-track"><div class="bar-fill bar-age" style="width:${Number(a.value)}%"></div></div>
            <span class="age-pct">${esc(String(a.value))}%</span>
          </div>`,
          )
          .join('')}
      </div>
    </div>`
      : '';

  return `<section class="lp-section lp-stats" id="stats">
    <div class="section-inner">
      <div class="section-label">DATA</div>
      <h2 class="section-title">利用傾向</h2>
      <div class="stats-grid">
        ${
          priceRows
            ? `<div class="stat-block"><div class="stat-block-title">平均予約金額</div><table class="price-table">${priceRows}</table></div>`
            : ''
        }
        ${genderHTML}
        ${ageHTML}
      </div>
    </div>
  </section>`;
}

function buildAccessHtml(salon) {
  const mapUrl = effectiveAddressMapUrl(salon);
  const addr = String(salon.address || '').trim();
  const addressCell =
    addr && mapUrl
      ? `<a class="access-map-link" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">${esc(addr)}</a>`
      : esc(addr);
  const rows = [
    ['住所', addressCell, true],
    ['アクセス', salon.accessFull || salon.accessShort, false],
    ['営業時間', salon.openingHours, false],
    ['定休日', salon.closedDays, false],
    ['支払い方法', salon.paymentMethods, false],
    ['席数', salon.seatCount, false],
    ['スタッフ', salon.staffCount, false],
    ['駐車場', salon.parking, false],
    ['カット価格', salon.cutPrice, false],
  ].filter(([, v]) => v && String(v).trim());

  const tableRows = rows
    .map(
      ([k, v, rawHtml]) => `
    <tr>
      <th>${esc(k)}</th>
      <td>${rawHtml ? v : esc(String(v))}</td>
    </tr>`,
    )
    .join('');

  const addressBanner =
    addr && mapUrl
      ? `<div class="access-address"><span class="pin">📍</span><a class="access-map-link" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">${esc(addr)}</a></div>`
      : addr
        ? `<div class="access-address"><span class="pin">📍</span>${esc(addr)}</div>`
        : '';

  return `<section class="lp-section lp-access" id="access">
    <div class="section-inner">
      <div class="section-label">ACCESS</div>
      <h2 class="section-title">アクセス・店舗情報</h2>
      <div class="access-content">
        ${addressBanner}
        <table class="access-table">${tableRows}</table>
        ${
          /^https?:\/\//i.test(String(salon.homepageUrl || '').trim())
            ? `<div class="access-url"><a href="${esc(String(salon.homepageUrl).trim())}" target="_blank" rel="noopener noreferrer">${esc(
                String(salon.homepageUrl).trim(),
              )}</a></div>`
            : ''
        }
      </div>
    </div>
  </section>`;
}

function buildCtaHtml(salon) {
  return `<section class="lp-section lp-cta" id="cta">
    <div class="cta-inner">
      <div class="section-label light">RESERVE</div>
      <h2 class="cta-title">${esc(salon.name)}<br><span>でお待ちしています</span></h2>
      ${salon.accessShort ? `<p class="cta-access">${esc(salon.accessShort)}</p>` : ''}
      <div class="cta-btns">
        <a href="#" class="btn-primary">今すぐ予約する</a>
        ${
          salon.homepageUrl
            ? `<a href="${esc(salon.homepageUrl)}" class="btn-secondary" target="_blank" rel="noopener">公式サイトへ</a>`
            : ''
        }
      </div>
    </div>
  </section>`;
}

function buildNavHtml(salon) {
  return `<nav class="lp-nav">
    <div class="lp-nav-name">${esc(salon.name)}</div>
    <ul class="lp-nav-links">
      <li><a href="#features">こだわり</a></li>
      <li><a href="#coupons">クーポン</a></li>
      <li><a href="#staff">スタッフ</a></li>
      <li><a href="#access">アクセス</a></li>
    </ul>
  </nav>`;
}

function buildSiteFooterHtml(salon) {
  const ig = String(salon.instagramUrl || '').trim();
  const ln = String(salon.lineUrl || '').trim();
  const snsBtns = [];
  if (/^https?:\/\//i.test(ig)) {
    snsBtns.push(
      `<a class="lp-footer-sns-btn lp-footer-sns-ig" href="${esc(ig)}" target="_blank" rel="noopener noreferrer">Instagram</a>`,
    );
  }
  if (/^https?:\/\//i.test(ln)) {
    snsBtns.push(
      `<a class="lp-footer-sns-btn lp-footer-sns-line" href="${esc(ln)}" target="_blank" rel="noopener noreferrer">LINE</a>`,
    );
  }
  const sns = snsBtns.length ? `<div class="lp-footer-sns">${snsBtns.join('')}</div>` : '';
  const hp = String(salon.homepageUrl || '').trim();
  const hpRow =
    /^https?:\/\//i.test(hp) ? `<p class="lp-footer-line"><a href="${esc(hp)}" target="_blank" rel="noopener noreferrer">${esc(hp)}</a></p>` : '';
  const recruitUrl = String(salon.staffRecruitUrl || '').trim();
  const recruitLabelRaw = String(salon.staffRecruitLabel || '').trim();
  const recruitLabel = recruitLabelRaw || 'スタッフ募集';
  const recruitRow =
    /^https?:\/\//i.test(recruitUrl) && recruitLabel
      ? `<p class="lp-footer-recruit"><a href="${esc(recruitUrl)}" target="_blank" rel="noopener noreferrer">${esc(recruitLabel)}</a></p>`
      : '';
  const footMap = effectiveAddressMapUrl(salon);
  const footAddr =
    salon.address && footMap
      ? `<a class="lp-footer-map-link" href="${esc(footMap)}" target="_blank" rel="noopener noreferrer">${esc(salon.address)}</a>`
      : salon.address
        ? esc(salon.address)
        : '';
  return `<footer class="lp-footer lp-site-footer">
    <p>${esc(salon.name)}</p>
    ${footAddr ? `<p class="lp-footer-line">${footAddr}</p>` : ''}
    ${hpRow}
    ${sns}
    ${recruitRow}
    <p class="lp-footer-credit"><a href="https://divizero.jp/" target="_blank" rel="noopener noreferrer">Presented by divizero</a></p>
  </footer>`;
}

/**
 * @param {object} salon — override.beautyStandaloneSalon
 * @returns {string} lp-root 内の HTML
 */
export function buildBeautyStandalonePreviewBodyHtml(salon) {
  if (!salon || !String(salon.name || '').trim()) {
    return `<div class="lp-root" id="lp-preview-root"><div class="lp-empty"><p>サロンデータがありません（美容室独立テンプレ）</p></div></div>`;
  }

  const parts = [buildNavHtml(salon), buildHeroHtml(salon)];
  if (String(salon.introText || '').trim()) parts.push(buildIntroHtml(salon));
  if (Array.isArray(salon.features) && salon.features.length > 0) parts.push(buildFeaturesHtml(salon));
  if (Array.isArray(salon.coupons) && salon.coupons.length > 0) parts.push(buildCouponsHtml(salon));
  if (Array.isArray(salon.atmosphere) && salon.atmosphere.length > 0) parts.push(buildAtmosphereHtml(salon));
  if (Array.isArray(salon.staff) && salon.staff.length > 0) parts.push(buildStaffHtml(salon));
  if (String(salon.messageText || '').trim()) parts.push(buildMessageHtml(salon));
  if (hasStats(salon)) parts.push(buildStatsHtml(salon));
  parts.push(buildAccessHtml(salon));
  parts.push(buildCtaHtml(salon));
  parts.push(buildSiteFooterHtml(salon));
  return `<div class="lp-root" id="lp-preview-root">${parts.join('\n')}</div>`;
}

/**
 * @param {{ salon: object, seo: { metaTitle?: string, metaDescription?: string, ogImageUrl?: string, canonicalUrl?: string, keywords?: string }, stylesheetHref: string }} opts
 */
export function buildBeautyStandalonePreviewDocument(opts) {
  const salon = opts.salon || {};
  const seo = opts.seo || {};
  const cssHref = String(opts.stylesheetHref || '/admin/beauty-standalone-template/styles.css');
  const title = String(seo.metaTitle || salon.name || '美容室LP').trim().slice(0, 200);
  const desc = String(seo.metaDescription || '').trim().slice(0, 320);
  const og = String(seo.ogImageUrl || '').trim();
  const canon = String(seo.canonicalUrl || '').trim();
  const kw = String(seo.keywords || '').trim().slice(0, 500);

  const ogTags = [
    og ? `<meta property="og:image" content="${esc(og)}">` : '',
    `<meta property="og:title" content="${esc(title)}">`,
    desc ? `<meta property="og:description" content="${esc(desc)}">` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const extraStyle = `
    body { margin: 0; }
  `;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  ${desc ? `<meta name="description" content="${esc(desc)}">` : ''}
  ${kw ? `<meta name="keywords" content="${esc(kw)}">` : ''}
  ${canon ? `<link rel="canonical" href="${esc(canon)}">` : ''}
  ${ogTags}
  <link rel="stylesheet" href="${esc(cssHref)}">
  <style>${extraStyle}</style>
</head>
<body>
${buildBeautyStandalonePreviewBodyHtml(salon)}
</body>
</html>`;
}
