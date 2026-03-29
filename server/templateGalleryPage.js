/**
 * パスワードなしで閲覧できるテンプレートギャラリー（静的シェル + JSON API で描画）
 * 既定言語: 英語（静的二言語、API 翻訳なし）
 *
 * NOTE: 下の :root は「本番に反映されたか目視確認」用の赤テーマ。確認後、元のダークに戻すこと。
 */
import { publicLangBarHtml, publicLangBarStyles } from './publicLangAssets.js';
import { GALLERY_STATIC_STRINGS, GALLERY_LANG_STORAGE_KEY } from './galleryPageI18n.js';

export function renderTemplateGalleryPage() {
  const G_EMBED = JSON.stringify(GALLERY_STATIC_STRINGS).replace(/</g, '\\u003c');
  const SK_EMBED = JSON.stringify(GALLERY_LANG_STORAGE_KEY);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Browse LP templates with live previews. Scroll inside each card, search by keyword, sort, or open the full page in a new tab." />
  <title>Template gallery | Closer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    ${publicLangBarStyles()}
    :root {
      /* デプロイ確認用（目立つ赤）。本番デザインに戻すときはここを元のダーク値に戻す */
      --void: #7f1d1d;
      --surface: #991b1b;
      --elevated: #b91c1c;
      --border: rgba(255, 255, 255, 0.18);
      --text: #fff7f7;
      --muted: #fecaca;
      --gold: #fde68a;
      --gold-dim: rgba(253, 230, 138, 0.45);
      --accent: #bbf7d0;
      --radius: 10px;
      --shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--void);
      color: var(--text);
      font-family: "Outfit", system-ui, sans-serif;
      font-weight: 400;
      line-height: 1.5;
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0.2;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");
      z-index: 0;
    }
    .wrap {
      position: relative;
      z-index: 1;
      max-width: 1280px;
      margin: 0 auto;
      padding: 14px 10px 28px;
    }
    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }
    .topbar-end {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 18px;
    }
    /* 言語バーを fixed から外し、ナビと重ならないようにする */
    .topbar .public-lang-bar {
      position: static;
      top: auto;
      right: auto;
      margin: 0;
      flex-shrink: 0;
      z-index: auto;
    }
    @media (max-width: 520px) {
      .topbar .public-lang-bar {
        width: 100%;
        justify-content: center;
      }
    }
    .brand {
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .nav-links {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.86rem;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--gold); }
    h1 {
      font-family: "Fraunces", Georgia, serif;
      font-weight: 700;
      font-size: clamp(1.65rem, 4vw, 2.35rem);
      line-height: 1.12;
      margin: 0 0 6px;
      letter-spacing: -0.02em;
      background: linear-gradient(120deg, var(--text) 0%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .lead {
      margin: 0 0 12px;
      color: var(--muted);
      font-size: 0.95rem;
      max-width: 40em;
    }
    .controls {
      display: grid;
      gap: 8px;
      margin-bottom: 10px;
    }
    @media (min-width: 720px) {
      .controls {
        grid-template-columns: 1fr auto;
        align-items: end;
      }
    }
    .search-wrap { position: relative; }
    .search-wrap svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      opacity: 0.45;
    }
    .search-wrap input {
      width: 100%;
      padding: 10px 12px 10px 40px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
    }
    .search-wrap input:focus {
      border-color: var(--gold-dim);
      box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
    }
    .sort-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .sort-row label {
      font-size: 0.78rem;
      color: var(--muted);
      margin-right: 2px;
    }
    select {
      padding: 10px 32px 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--elevated);
      color: var(--text);
      font-family: inherit;
      font-size: 0.9rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='%239a9590'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
    }
    .section-title {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.05rem;
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--muted);
      font-weight: 500;
    }
    .section-title span.badge {
      font-family: "Outfit", sans-serif;
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--gold-dim);
      color: var(--gold);
    }
    .pickup-strip { margin: 0 0 12px; padding: 0; }
    .pickup-strip .section-title { margin-bottom: 6px; }
    .pickup-marquee-viewport {
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      margin: 0 -4px;
      padding: 0 4px;
      mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
      -webkit-mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
    }
    #pickup-track.pickup-marquee-track {
      display: flex;
      width: max-content;
      animation: pickup-marquee-scroll 50s linear infinite;
      will-change: transform;
    }
    #pickup-track.pickup-marquee-track:hover { animation-play-state: paused; }
    .pickup-marquee-group {
      display: flex;
      flex-shrink: 0;
      gap: 8px;
      padding: 4px 6px 10px;
      align-items: stretch;
    }
    .pickup-marquee-group .pickup-card { flex: 0 0 min(280px, 72vw); }
    @keyframes pickup-marquee-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      #pickup-track.pickup-marquee-track {
        animation: none !important;
        flex-wrap: wrap;
        width: 100%;
        max-width: 100%;
        justify-content: center;
      }
      .pickup-marquee-duplicate { display: none !important; }
    }
    /* タッチ端末: 横スクロールアニメ中に iframe 操作しづらいためピックアップは静止表示 */
    @media (hover: none) {
      #pickup-track.pickup-marquee-track {
        animation: none !important;
        flex-wrap: wrap;
        width: 100%;
        max-width: 100%;
        justify-content: center;
      }
      .pickup-marquee-duplicate { display: none !important; }
    }
    .pickup-card {
      flex: 0 0 min(280px, 72vw);
      border-radius: calc(var(--radius) + 2px);
      padding: 1px;
      background: linear-gradient(135deg, var(--gold), var(--accent), rgba(212, 165, 116, 0.25));
      box-shadow: var(--shadow);
      transition: transform 0.2s ease;
    }
    .pickup-card:hover { transform: translateY(-2px); }
    .gallery-thumb {
      display: flex;
      flex-direction: column;
      min-height: 0;
      border-radius: var(--radius);
      overflow: hidden;
      background: #0a0a0c;
    }
    .gallery-preview-embed {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: clamp(280px, 48vh, 400px);
      overflow: hidden;
      border-radius: var(--radius);
      background: #0a0a0c;
      border: 1px solid var(--border);
    }
    .gallery-preview-frame {
      flex: 1;
      min-height: 0;
      position: relative;
      width: 100%;
      overflow: hidden;
      overscroll-behavior: contain;
      touch-action: manipulation;
    }
    .gallery-preview-embed iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      pointer-events: auto;
    }
    .gallery-preview-toolbar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 7px 10px;
      background: rgba(10, 10, 12, 0.96);
      border-top: 1px solid var(--border);
    }
    .gallery-preview-toolbar a {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--gold);
      text-decoration: none;
      letter-spacing: 0.02em;
    }
    .gallery-preview-toolbar a:hover {
      color: var(--text);
      text-decoration: underline;
    }
    .gallery-preview-toolbar a:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 2px;
      border-radius: 4px;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
    }
    @media (min-width: 520px) {
      .card-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
    }
    .t-card {
      background: transparent;
      border: none;
      border-radius: var(--radius);
      padding: 0;
      margin: 0;
      display: block;
      transition: transform 0.2s;
    }
    .t-card:hover { transform: translateY(-2px); }
    .grid-section h2 {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1rem;
      margin: 10px 0 6px;
      color: var(--muted);
      font-weight: 500;
    }
    .empty, .err, .loading {
      text-align: center;
      padding: 28px 12px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .err { color: #e8a0a0; }
    footer {
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      font-size: 0.82rem;
      color: var(--muted);
      text-align: center;
    }
    footer a { color: var(--gold); }
    .deploy-canary-banner {
      margin: 0 0 12px;
      padding: 10px 14px;
      border-radius: var(--radius);
      border: 2px solid var(--gold);
      background: rgba(0, 0, 0, 0.25);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text);
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="brand" data-i18n="gallery.brand">Closer Webpage</div>
      <div class="topbar-end">
        <nav class="nav-links" aria-label="Related links">
          <a href="/customer-intake"><span data-i18n="gallery.nav.intake">Apply / inquiry</span></a>
          <a href="/api/customer-intake"><span data-i18n="gallery.nav.intakeAlt">Inquiry (alt URL)</span></a>
        </nav>
        ${publicLangBarHtml({ variant: 'dark', enFirst: true, defaultLang: 'en' })}
      </div>
    </div>
    <h1 data-i18n="gallery.title">Template gallery</h1>
    <p class="deploy-canary-banner" data-i18n="gallery.deployCanary" role="status">
      If this page looks red, the latest production deploy reached you. (Temporary check — revert theme after confirming.)
    </p>
    <p class="lead" data-i18n="gallery.lead">Live previews fill each card—scroll inside the frame to explore the page. Use the link under each preview to open the full template in a new tab. Find templates with the keyword search (name, tags, or category text).</p>

    <section id="pickup-section" class="pickup-strip" style="display:none" aria-hidden="true" aria-labelledby="pickup-h">
      <h2 class="section-title" id="pickup-h"><span class="badge" data-i18n="gallery.badge">Week</span> <span id="week-label">Weekly picks</span></h2>
      <div class="pickup-marquee-viewport">
        <div class="pickup-marquee-track" id="pickup-track"></div>
      </div>
    </section>

    <div id="state-loading" class="loading" data-i18n="gallery.loading">Loading…</div>
    <div id="state-err" class="err" style="display:none;" data-i18n="gallery.err.load">Could not load the catalog. Please try again later.</div>
    <div id="app" style="display:none;">
      <div class="controls">
        <div class="search-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="search" id="q" data-i18n-placeholder="gallery.searchPh" placeholder="Search by keyword" autocomplete="off" enterkeyhint="search" />
        </div>
        <div class="sort-row">
          <label for="sort" data-i18n="gallery.sortLabel">Sort</label>
          <select id="sort" aria-label="Sort order">
            <option value="popular" data-i18n="gallery.sort.popular">Popularity</option>
            <option value="name" data-i18n="gallery.sort.name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      <section aria-labelledby="all-h">
        <h2 class="section-title" id="all-h" data-i18n="gallery.allTitle">All templates</h2>
        <div id="list-root"></div>
      </section>
    </div>

    <footer>
      <span data-i18n="gallery.footer.main">Final design is tuned after your inquiry.</span>
      <a href="/customer-intake"><span data-i18n="gallery.footer.link">Apply / inquiry form</span></a>
    </footer>
  </div>
  <script>
(function () {
  var API = '/api/public/template-catalog';
  var G = ${G_EMBED};
  var SK = ${SK_EMBED};
  /** API の category（日本語）→ 英語 UI 用ラベル（templateCatalogMeta と整合） */
  var CATEGORY_LABEL_EN = {
    '飲食・複数店舗': 'Food & dining · multi-location',
    'ジム・フィットネス（Valx）': 'Gym · fitness (Valx)',
    'ジム・フィットネス（CLOSER）': 'Gym · fitness (Closer)',
    'ジム・フィットネス（レガシー）': 'Gym · fitness (legacy)',
    'セールス・教室（レガシー）': 'Sales · courses (legacy)',
    '法人・相談': 'Business · consultation',
    'オリジナル・ナレッジ': 'Original · knowledge layout',
    'ウェルネス・サウナ（wiki）': 'Wellness · sauna wiki',
    '参考デザイン': 'Reference designs',
    'カスタムテンプレート': 'Custom templates',
    'その他': 'Other',
  };

  var state = { raw: null, q: '', sort: 'popular' };

  function $(id) { return document.getElementById(id); }

  function lang() {
    try {
      var s = localStorage.getItem(SK);
      if (s === 'ja' || s === 'en') return s;
    } catch (e) {}
    return 'en';
  }

  function t(key) {
    var l = lang();
    var pack = G[l] || G.en;
    return pack[key] != null ? pack[key] : (G.en[key] != null ? G.en[key] : key);
  }

  function applyShellI18n() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var key = el.getAttribute('data-i18n');
      if (key && t(key)) el.textContent = t(key);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-placeholder]'), function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key && t(key)) el.setAttribute('placeholder', t(key));
    });
    var opts = document.querySelectorAll('#sort option[data-i18n]');
    Array.prototype.forEach.call(opts, function (el) {
      var key = el.getAttribute('data-i18n');
      if (key && t(key)) el.textContent = t(key);
    });
    var sortEl = $('sort');
    if (sortEl) sortEl.setAttribute('aria-label', t('gallery.sortAria'));
    var errEl = $('state-err');
    if (errEl && errEl.style.display !== 'none') errEl.textContent = t('gallery.err.load');
  }

  function setLang(next) {
    try { localStorage.setItem(SK, next); } catch (e) {}
    document.documentElement.lang = next === 'ja' ? 'ja' : 'en';
    var ja = document.getElementById('public-lang-ja');
    var en = document.getElementById('public-lang-en');
    if (ja) ja.classList.toggle('is-active', next === 'ja');
    if (en) en.classList.toggle('is-active', next === 'en');
    applyShellI18n();
    syncWeekLabel();
    if (state.raw) {
      renderPickups();
      renderList();
    }
    syncOpenAria();
  }

  function syncWeekLabel() {
    var el = $('week-label');
    if (!el) return;
    if (!state.raw) {
      el.textContent = t('gallery.weekDefault');
      return;
    }
    el.textContent = lang() === 'en'
      ? (state.raw.weekLabelEn || state.raw.weekLabel || t('gallery.weekDefault'))
      : (state.raw.weekLabel || t('gallery.weekDefault'));
  }

  function syncOpenAria() {
    var lab = t('gallery.openFullAria');
    Array.prototype.forEach.call(document.querySelectorAll('.gallery-preview-toolbar a'), function (a) {
      a.setAttribute('aria-label', lab);
    });
  }

  function categoryDisplay(raw) {
    if (!raw) return lang() === 'en' ? 'Other' : 'その他';
    if (lang() !== 'en') return raw;
    var customJa = /^(.*)（カスタム）$/.exec(raw);
    if (customJa) {
      var baseJa = customJa[1];
      var baseEn = CATEGORY_LABEL_EN[baseJa] || baseJa;
      return baseEn + ' (custom)';
    }
    return CATEGORY_LABEL_EN[raw] || raw;
  }

  function categoryMatchesQuery(tpl, n) {
    var c = tpl.category || '';
    if (norm(c).indexOf(n) >= 0) return true;
    var disp = categoryDisplay(c);
    if (lang() === 'en' && norm(disp).indexOf(n) >= 0) return true;
    if (lang() === 'ja' && CATEGORY_LABEL_EN[c] && norm(CATEGORY_LABEL_EN[c]).indexOf(n) >= 0) return true;
    return false;
  }

  document.getElementById('public-lang-ja').addEventListener('click', function () { setLang('ja'); });
  document.getElementById('public-lang-en').addEventListener('click', function () { setLang('en'); });

  function locStr() { return lang() === 'en' ? 'en' : 'ja'; }

  function norm(s) { return (s || '').toLowerCase(); }

  function matches(tpl) {
    if (!state.q.trim()) return true;
    var n = norm(state.q);
    if (norm(tpl.name).indexOf(n) >= 0) return true;
    if (categoryMatchesQuery(tpl, n)) return true;
    if ((tpl.tags || []).some(function (x) { return norm(x).indexOf(n) >= 0; })) return true;
    if ((tpl.categories || []).some(function (x) { return norm(x).indexOf(n) >= 0; })) return true;
    return false;
  }

  function filtered() {
    return (state.raw.templates || []).filter(matches);
  }

  function sorted(list) {
    var arr = list.slice();
    var loc = locStr();
    if (state.sort === 'name') {
      arr.sort(function (a, b) { return a.name.localeCompare(b.name, loc); });
    } else {
      arr.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
    }
    return arr;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function previewBlock(purl, title) {
    var lab = t('gallery.openFullAria');
    var linkText = t('gallery.openFullLink');
    return '<div class="gallery-preview-embed">' +
      '<div class="gallery-preview-frame">' +
      '<iframe src="' + esc(purl) + '" title="' + esc(title) + '" loading="lazy"></iframe>' +
      '</div>' +
      '<div class="gallery-preview-toolbar">' +
      '<a href="' + esc(purl) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(lab) + '">' + esc(linkText) + '</a>' +
      '</div>' +
      '</div>';
  }

  function pickupCardHtml(tpl) {
    var purl = esc(tpl.previewUrl);
    var tname = esc(tpl.name);
    return '<article class="pickup-card"><div class="gallery-thumb">' + previewBlock(purl, tname) + '</div></article>';
  }

  function renderPickups() {
    var track = $('pickup-track');
    var pickups = state.raw.pickups || [];
    if (!pickups.length) {
      track.classList.remove('pickup-marquee-track');
      track.innerHTML = '<p class="empty">' + esc(t('gallery.empty.pickup')) + '</p>';
      return;
    }
    var cards = pickups.map(pickupCardHtml).join('');
    track.classList.add('pickup-marquee-track');
    track.innerHTML =
      '<div class="pickup-marquee-group" role="list">' + cards + '</div>' +
      '<div class="pickup-marquee-group pickup-marquee-duplicate" aria-hidden="true">' + cards + '</div>';
    syncOpenAria();
  }

  function renderList() {
    var root = $('list-root');
    var list = sorted(filtered());
    if (!list.length) {
      root.innerHTML = '<p class="empty">' + esc(t('gallery.empty.filter')) + '</p>';
      return;
    }
    root.innerHTML = '<div class="card-grid">' + list.map(cardHtml).join('') + '</div>';
    syncOpenAria();
  }

  function cardHtml(tpl) {
    var purl = esc(tpl.previewUrl);
    var tname = esc(tpl.name);
    return '<article class="t-card">' + previewBlock(purl, tname) + '</article>';
  }

  function refresh() {
    renderPickups();
    renderList();
    applyShellI18n();
    syncWeekLabel();
    syncOpenAria();
  }

  fetch(API)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      state.raw = data;
      $('state-loading').style.display = 'none';
      var ps = $('pickup-section');
      if (ps) {
        ps.style.display = '';
        ps.setAttribute('aria-hidden', 'false');
      }
      $('app').style.display = 'block';
      refresh();
    })
    .catch(function () {
      $('state-loading').style.display = 'none';
      var err = $('state-err');
      err.style.display = 'block';
      err.textContent = t('gallery.err.load');
    });

  $('q').addEventListener('input', function () {
    state.q = $('q').value;
    renderList();
  });
  $('sort').addEventListener('change', function () {
    state.sort = $('sort').value;
    renderList();
    syncOpenAria();
  });

  applyShellI18n();
})();
  <\/script>
</body>
</html>`;
}
