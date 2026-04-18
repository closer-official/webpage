/**
 * renderer.js — Salon JSON → LP DOM
 */

export function renderLP(salon, container) {
  container.innerHTML = '';
  if (!salon || !salon.name) {
    container.innerHTML = '<div class="lp-empty"><p>サロン情報を貼り付けて「解析する」を押してください</p></div>';
    return;
  }

  const sections = [];

  // ── Hero ──
  sections.push(buildHero(salon));

  // ── Intro ──
  if (salon.introText) sections.push(buildIntro(salon));

  // ── Features ──
  if (salon.features && salon.features.length > 0) sections.push(buildFeatures(salon));

  // ── Popular Coupons ──
  if (salon.coupons && salon.coupons.length > 0) sections.push(buildCoupons(salon));

  // ── Atmosphere ──
  if (salon.atmosphere && salon.atmosphere.length > 0) sections.push(buildAtmosphere(salon));

  // ── Staff ──
  if (salon.staff && salon.staff.length > 0) sections.push(buildStaff(salon));

  // ── Message ──
  if (salon.messageText) sections.push(buildMessage(salon));

  // ── Stats ──
  if (hasStats(salon)) sections.push(buildStats(salon));

  // ── Access / Salon Data ──
  sections.push(buildAccess(salon));

  // ── Reserve CTA ──
  sections.push(buildCTA(salon));

  sections.forEach(s => container.appendChild(s));
}

// ── Hero ──
function buildHero(salon) {
  const el = el_('section', 'lp-section lp-hero');
  const rating = salon.rating ? `<span class="hero-rating"><span class="rating-star">★</span>${salon.rating}</span>` : '';
  const reviews = salon.reviewCount ? `<span class="hero-reviews">${salon.reviewCount.toLocaleString()}件の口コミ</span>` : '';
  const badge = salon.heroCatch ? `<div class="hero-badge">${salon.heroCatch}</div>` : '';
  const access = salon.accessShort ? `<div class="hero-access"><span class="access-icon">📍</span>${salon.accessShort}</div>` : '';

  el.innerHTML = `
    <div class="hero-inner">
      ${badge}
      <h1 class="hero-name">${esc(salon.name)}</h1>
      ${salon.title ? `<p class="hero-title">${esc(salon.title)}</p>` : ''}
      <div class="hero-meta">
        ${rating}${reviews}
      </div>
      ${access}
    </div>
    <div class="hero-deco" aria-hidden="true">
      <span class="hero-deco-line"></span>
      <span class="hero-deco-circle"></span>
    </div>
  `;
  return el;
}

// ── Intro ──
function buildIntro(salon) {
  const el = el_('section', 'lp-section lp-intro');
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">ABOUT</div>
      <h2 class="section-title">サロンについて</h2>
      <p class="intro-text">${esc(salon.introText)}</p>
    </div>
  `;
  return el;
}

// ── Features ──
function buildFeatures(salon) {
  const el = el_('section', 'lp-section lp-features');
  const cards = salon.features.map((f, i) => `
    <div class="feature-card" style="--i:${i}">
      <div class="feature-num">${String(i + 1).padStart(2, '0')}</div>
      <h3 class="feature-title">${esc(f.title)}</h3>
      <p class="feature-text">${esc(f.text)}</p>
    </div>
  `).join('');
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">FEATURES</div>
      <h2 class="section-title">こだわり</h2>
      <div class="features-grid">${cards}</div>
    </div>
  `;
  return el;
}

// ── Coupons ──
function buildCoupons(salon) {
  const el = el_('section', 'lp-section lp-coupons');
  const cards = salon.coupons.slice(0, 6).map(c => {
    const typeClass = c.type === '新規' ? 'coupon-new' : c.type === '再来' ? 'coupon-repeat' : 'coupon-all';
    const cats = (c.categories || []).join(' · ');
    return `
      <div class="coupon-card ${typeClass}">
        <div class="coupon-type">${esc(c.type)}</div>
        ${cats ? `<div class="coupon-cats">${esc(cats)}</div>` : ''}
        <div class="coupon-price">¥${c.price ? c.price.toLocaleString() : '–'}</div>
        <p class="coupon-title">${esc(c.title)}</p>
      </div>
    `;
  }).join('');
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">COUPON</div>
      <h2 class="section-title">人気クーポン</h2>
      <div class="coupons-grid">${cards}</div>
      ${salon.homepageUrl ? `<div class="coupon-cta-wrap"><a href="${esc(salon.homepageUrl)}" class="btn-outline" target="_blank" rel="noopener">クーポン一覧を見る →</a></div>` : ''}
    </div>
  `;
  return el;
}

// ── Atmosphere ──
function buildAtmosphere(salon) {
  const el = el_('section', 'lp-section lp-atmosphere');
  const items = salon.atmosphere.map((a, i) => `
    <div class="atmo-item" style="--i:${i}">
      <div class="atmo-num">${String(i + 1).padStart(2, '0')}</div>
      <p class="atmo-text">${esc(a)}</p>
    </div>
  `).join('');
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">ATMOSPHERE</div>
      <h2 class="section-title">サロンの雰囲気</h2>
      <div class="atmo-grid">${items}</div>
    </div>
  `;
  return el;
}

// ── Staff ──
function buildStaff(salon) {
  const el = el_('section', 'lp-section lp-staff');
  const cards = salon.staff.map((s, i) => `
    <div class="staff-card" style="--i:${i}">
      <div class="staff-avatar">${getInitials(s.name)}</div>
      <h3 class="staff-name">${esc(s.name)}</h3>
      ${s.specialty ? `<p class="staff-specialty">${esc(s.specialty)}</p>` : ''}
      ${s.experience ? `<span class="staff-exp">${esc(s.experience)}</span>` : ''}
      ${s.catch ? `<p class="staff-catch">${esc(s.catch)}</p>` : ''}
    </div>
  `).join('');
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">STAFF</div>
      <h2 class="section-title">スタイリスト</h2>
      <div class="staff-grid">${cards}</div>
    </div>
  `;
  return el;
}

// ── Message ──
function buildMessage(salon) {
  const el = el_('section', 'lp-section lp-message');
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">MESSAGE</div>
      ${salon.messageTitle ? `<h2 class="section-title">${esc(salon.messageTitle)}</h2>` : '<h2 class="section-title">サロンからの一言</h2>'}
      <blockquote class="message-text">${esc(salon.messageText)}</blockquote>
    </div>
  `;
  return el;
}

// ── Stats ──
function hasStats(salon) {
  const s = salon.stats;
  return s && (s.firstVisitPrice || s.repeatVisitPrice || (s.genderRatio && s.genderRatio.female !== null) || (s.ageRatio && s.ageRatio.length > 0));
}

function buildStats(salon) {
  const el = el_('section', 'lp-section lp-stats');
  const s = salon.stats;
  const priceRows = [
    s.firstVisitPrice ? `<tr><td>初来店</td><td>${esc(s.firstVisitPrice)}</td></tr>` : '',
    s.repeatVisitPrice ? `<tr><td>2回目以降</td><td>${esc(s.repeatVisitPrice)}</td></tr>` : ''
  ].filter(Boolean).join('');

  const genderHTML = (s.genderRatio && s.genderRatio.female !== null) ? `
    <div class="stat-block">
      <div class="stat-block-title">性別比率</div>
      <div class="gender-bars">
        <div class="gender-bar">
          <span class="gender-label">女性</span>
          <div class="bar-track"><div class="bar-fill bar-female" style="width:${s.genderRatio.female}%"></div></div>
          <span class="gender-pct">${s.genderRatio.female}%</span>
        </div>
        <div class="gender-bar">
          <span class="gender-label">男性</span>
          <div class="bar-track"><div class="bar-fill bar-male" style="width:${s.genderRatio.male || 0}%"></div></div>
          <span class="gender-pct">${s.genderRatio.male || 0}%</span>
        </div>
      </div>
    </div>
  ` : '';

  const ageHTML = (s.ageRatio && s.ageRatio.length > 0) ? `
    <div class="stat-block">
      <div class="stat-block-title">年代比率</div>
      <div class="age-bars">
        ${s.ageRatio.map(a => `
          <div class="age-bar">
            <span class="age-label">${esc(a.label)}</span>
            <div class="bar-track"><div class="bar-fill bar-age" style="width:${a.value}%"></div></div>
            <span class="age-pct">${a.value}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">DATA</div>
      <h2 class="section-title">利用傾向</h2>
      <div class="stats-grid">
        ${priceRows ? `<div class="stat-block"><div class="stat-block-title">平均予約金額</div><table class="price-table">${priceRows}</table></div>` : ''}
        ${genderHTML}
        ${ageHTML}
      </div>
    </div>
  `;
  return el;
}

// ── Access ──
function buildAccess(salon) {
  const el = el_('section', 'lp-section lp-access');
  const rows = [
    ['住所', salon.address],
    ['アクセス', salon.accessFull || salon.accessShort],
    ['営業時間', salon.openingHours],
    ['定休日', salon.closedDays],
    ['支払い方法', salon.paymentMethods],
    ['席数', salon.seatCount],
    ['スタッフ', salon.staffCount],
    ['駐車場', salon.parking],
    ['カット価格', salon.cutPrice],
  ].filter(([_, v]) => v && v.trim());

  const tableRows = rows.map(([k, v]) => `
    <tr>
      <th>${esc(k)}</th>
      <td>${esc(v)}</td>
    </tr>
  `).join('');

  el.innerHTML = `
    <div class="section-inner">
      <div class="section-label">ACCESS</div>
      <h2 class="section-title">アクセス・店舗情報</h2>
      <div class="access-content">
        <table class="access-table">${tableRows}</table>
        ${salon.homepageUrl ? `<div class="access-url"><a href="${esc(salon.homepageUrl)}" target="_blank" rel="noopener">${esc(salon.homepageUrl)}</a></div>` : ''}
      </div>
    </div>
  `;
  return el;
}

// ── CTA ──
function buildCTA(salon) {
  const el = el_('section', 'lp-section lp-cta');
  el.innerHTML = `
    <div class="cta-inner">
      <div class="section-label light">RESERVE</div>
      <h2 class="cta-title">${esc(salon.name)}<br><span>でお待ちしています</span></h2>
      ${salon.accessShort ? `<p class="cta-access">${esc(salon.accessShort)}</p>` : ''}
      <div class="cta-btns">
        <a href="#" class="btn-primary">今すぐ予約する</a>
        ${salon.homepageUrl ? `<a href="${esc(salon.homepageUrl)}" class="btn-secondary" target="_blank" rel="noopener">公式サイトへ</a>` : ''}
      </div>
    </div>
  `;
  return el;
}

// ── Helpers ──
function el_(tag, cls) {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitials(name) {
  if (!name) return '?';
  // 日本語の場合は最初の1文字
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(name)) return name.charAt(0);
  // ローマ字の場合は頭文字
  return name.split(/\s+/).map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
}
