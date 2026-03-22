/**
 * パスワードなしで閲覧できるテンプレートギャラリー（静的シェル + JSON API で描画）
 */
import { publicLangBarHtml, publicLangBarStyles, publicLangToggleInlineScript } from './publicLangAssets.js';

export function renderTemplateGalleryPage() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="LPテンプレート一覧。カテゴリ・人気順で探せます。" />
  <title>テンプレートギャラリー | Closer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    ${publicLangBarStyles()}
    :root {
      --void: #0c0c0f;
      --surface: #14141a;
      --elevated: #1c1c24;
      --border: rgba(255, 255, 255, 0.08);
      --text: #f4f2ed;
      --muted: #9a9590;
      --gold: #d4a574;
      --gold-dim: rgba(212, 165, 116, 0.35);
      --accent: #7eb8a8;
      --radius: 14px;
      --shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
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
      line-height: 1.6;
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0.4;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");
      z-index: 0;
    }
    .wrap {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 20px 80px;
    }
    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 40px;
    }
    .brand {
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .nav-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--gold); }
    h1 {
      font-family: "Fraunces", Georgia, serif;
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.15;
      margin: 0 0 12px;
      letter-spacing: -0.02em;
      background: linear-gradient(120deg, var(--text) 0%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .lead {
      margin: 0 0 36px;
      color: var(--muted);
      font-size: 1.05rem;
      max-width: 36em;
    }
    .controls {
      display: grid;
      gap: 16px;
      margin-bottom: 36px;
    }
    @media (min-width: 720px) {
      .controls {
        grid-template-columns: 1fr auto;
        align-items: end;
      }
    }
    .search-wrap {
      position: relative;
    }
    .search-wrap svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      opacity: 0.45;
    }
    .search-wrap input {
      width: 100%;
      padding: 14px 16px 14px 44px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-wrap input:focus {
      border-color: var(--gold-dim);
      box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.12);
    }
    .sort-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }
    .sort-row label {
      font-size: 0.8rem;
      color: var(--muted);
      margin-right: 4px;
    }
    select {
      padding: 12px 36px 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--elevated);
      color: var(--text);
      font-family: inherit;
      font-size: 0.95rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='%239a9590'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 28px;
    }
    .chip {
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 0.82rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .chip:hover { color: var(--text); border-color: var(--muted); }
    .chip.active {
      background: linear-gradient(135deg, rgba(212, 165, 116, 0.2), rgba(126, 184, 168, 0.12));
      border-color: var(--gold-dim);
      color: var(--text);
    }
    .section-title {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.35rem;
      margin: 0 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-title span.badge {
      font-family: "Outfit", sans-serif;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--gold-dim);
      color: var(--gold);
    }
    .pickup-strip {
      margin-bottom: 52px;
    }
    .pickup-track {
      display: flex;
      gap: 18px;
      overflow-x: auto;
      padding: 8px 4px 24px;
      scroll-snap-type: x mandatory;
      scrollbar-width: thin;
      scrollbar-color: var(--gold-dim) transparent;
      -webkit-overflow-scrolling: touch;
    }
    .pickup-track::-webkit-scrollbar { height: 6px; }
    .pickup-track::-webkit-scrollbar-thumb {
      background: var(--gold-dim);
      border-radius: 99px;
    }
    .pickup-card {
      flex: 0 0 min(300px, 82vw);
      scroll-snap-align: start;
      border-radius: calc(var(--radius) + 4px);
      padding: 2px;
      background: linear-gradient(135deg, var(--gold), var(--accent), rgba(212, 165, 116, 0.3));
      box-shadow: var(--shadow);
      transition: transform 0.25s ease;
    }
    .pickup-card:hover { transform: translateY(-4px); }
    .pickup-card-inner {
      background: var(--elevated);
      border-radius: var(--radius);
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid var(--border);
    }
    .pickup-card .name {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.3;
    }
    .pickup-card .cat {
      font-size: 0.78rem;
      color: var(--accent);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .pickup-card .pop {
      font-size: 0.85rem;
      color: var(--muted);
    }
    .pickup-card a {
      margin-top: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 10px;
      background: var(--text);
      color: var(--void);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .pickup-card a:hover { opacity: 0.9; }
    .grid-section h2 {
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.25rem;
      margin: 36px 0 18px;
      color: var(--muted);
      font-weight: 500;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }
    .t-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .t-card:hover {
      border-color: rgba(212, 165, 116, 0.25);
      transform: translateY(-2px);
    }
    .t-card h3 {
      margin: 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.05rem;
      font-weight: 600;
    }
    .t-card .meta {
      font-size: 0.8rem;
      color: var(--muted);
    }
    .t-card .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .t-card .tags span {
      font-size: 0.7rem;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--elevated);
      color: var(--muted);
    }
    .t-card .actions {
      margin-top: auto;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .t-card a.btn {
      padding: 10px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .t-card a.btn-primary {
      background: var(--gold);
      color: var(--void);
    }
    .t-card a.btn-ghost {
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .t-card a.btn-ghost:hover { color: var(--text); }
    .empty, .err, .loading {
      text-align: center;
      padding: 48px 20px;
      color: var(--muted);
    }
    .err { color: #e8a0a0; }
    footer {
      margin-top: 64px;
      padding-top: 28px;
      border-top: 1px solid var(--border);
      font-size: 0.85rem;
      color: var(--muted);
      text-align: center;
    }
    footer a { color: var(--gold); }
  </style>
</head>
<body>
  ${publicLangBarHtml({ variant: 'dark' })}
  <div class="wrap">
    <div class="topbar">
      <div class="brand" data-i18n="gallery.brand">Closer Webpage</div>
      <nav class="nav-links" aria-label="関連ページ">
        <a href="/customer-intake"><span data-i18n="gallery.nav.intake">ヒアリング・お申し込み</span></a>
        <a href="/api/customer-intake"><span data-i18n="gallery.nav.intakeAlt">ヒアリング（別URL）</span></a>
      </nav>
    </div>
    <h1 data-i18n="gallery.title">テンプレートギャラリー</h1>
    <p class="lead" data-i18n="gallery.lead">業種や雰囲気からテンプレートを選べます。検索・カテゴリ・並び順を切り替えて、気に入ったデザインを別タブでプレビューできます。</p>

    <div id="state-loading" class="loading" data-i18n="gallery.loading">読み込み中…</div>
    <div id="state-err" class="err" style="display:none;"></div>
    <div id="app" style="display:none;">
      <div class="controls">
        <div class="search-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="search" id="q" data-i18n-placeholder="gallery.searchPh" placeholder="名前・タグ・カテゴリで検索" autocomplete="off" />
        </div>
        <div class="sort-row">
          <label for="sort" data-i18n="gallery.sortLabel">並び順</label>
          <select id="sort" aria-label="並び順">
            <option value="popular" data-i18n="gallery.sort.popular">人気順</option>
            <option value="name" data-i18n="gallery.sort.name">名前（あいうえお）</option>
            <option value="category" data-i18n="gallery.sort.category">カテゴリ別</option>
          </select>
        </div>
      </div>
      <div class="chips" id="chips" role="group" aria-label="カテゴリ"></div>

      <section class="pickup-strip" aria-labelledby="pickup-h">
        <h2 class="section-title" id="pickup-h"><span class="badge" data-i18n="gallery.badge">週間</span> <span id="week-label" data-i18n="gallery.weekDefault">今週のピックアップ</span></h2>
        <div class="pickup-track" id="pickup-track"></div>
      </section>

      <section aria-labelledby="all-h">
        <h2 class="section-title" id="all-h" data-i18n="gallery.allTitle">すべてのテンプレート</h2>
        <div id="list-root"></div>
      </section>
    </div>

    <footer>
      <span data-i18n="gallery.footer.main">デザインの最終形はヒアリング後に調整されます。</span>
      <a href="/customer-intake"><span data-i18n="gallery.footer.link">お申し込み・ヒアリングフォーム</span></a>
    </footer>
  </div>
  <script>
(function () {
  var API = '/api/public/template-catalog';
  var state = { raw: null, q: '', sort: 'popular', category: '' };

  function $(id) { return document.getElementById(id); }

  function norm(s) { return (s || '').toLowerCase(); }

  function matches(t) {
    if (!state.q.trim()) return true;
    var n = norm(state.q);
    if (norm(t.name).indexOf(n) >= 0) return true;
    if (norm(t.category).indexOf(n) >= 0) return true;
    if ((t.tags || []).some(function (x) { return norm(x).indexOf(n) >= 0; })) return true;
    if ((t.categories || []).some(function (x) { return norm(x).indexOf(n) >= 0; })) return true;
    return false;
  }

  function filtered() {
    return (state.raw.templates || []).filter(function (t) {
      if (state.category && t.category !== state.category) return false;
      return matches(t);
    });
  }

  function sorted(list) {
    var arr = list.slice();
    if (state.sort === 'name') {
      arr.sort(function (a, b) { return a.name.localeCompare(b.name, 'ja'); });
    } else if (state.sort === 'popular') {
      arr.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
    } else {
      arr.sort(function (a, b) {
        var c = a.category.localeCompare(b.category, 'ja');
        if (c !== 0) return c;
        return (b.popularity || 0) - (a.popularity || 0);
      });
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

  function renderPickups() {
    var track = $('pickup-track');
    var pickups = state.raw.pickups || [];
    if (!pickups.length) {
      track.innerHTML = '<p class="empty" style="padding:20px;" data-i18n="gallery.empty.pickup">ピックアップは準備中です。</p>';
      return;
    }
    track.innerHTML = pickups.map(function (t) {
      var id = esc(t.id);
      return '<article class="pickup-card"><div class="pickup-card-inner">' +
        '<span class="cat" data-i18n="tcat.' + id + '">' + esc(t.category) + '</span>' +
        '<h3 class="name" data-i18n="cat.' + id + '">' + esc(t.name) + '</h3>' +
        '<p class="pop" data-i18n="tpop.' + id + '">人気スコア ' + esc(String(t.popularity)) + '</p>' +
        '<a href="' + esc(t.previewUrl) + '" target="_blank" rel="noopener noreferrer"><span data-i18n="gallery.pick.preview">プレビューを開く →</span></a>' +
        '</div></article>';
    }).join('');
  }

  function renderList() {
    var root = $('list-root');
    var list = sorted(filtered());
    if (!list.length) {
      root.innerHTML = '<p class="empty" data-i18n="gallery.empty.filter">条件に一致するテンプレートがありません。</p>';
      return;
    }
    if (state.sort === 'category') {
      var byCat = {};
      list.forEach(function (t) {
        var k = t.category || 'その他';
        if (!byCat[k]) byCat[k] = [];
        byCat[k].push(t);
      });
      var keys = Object.keys(byCat).sort(function (a, b) { return a.localeCompare(b, 'ja'); });
      root.innerHTML = keys.map(function (cat) {
        return '<h2>' + esc(cat) + '</h2><div class="card-grid">' +
          byCat[cat].map(cardHtml).join('') + '</div>';
      }).join('');
      return;
    }
    root.innerHTML = '<div class="card-grid">' + list.map(cardHtml).join('') + '</div>';
  }

  function cardHtml(t) {
    var tags = (t.tags || []).slice(0, 5).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    var id = esc(t.id);
    var customJa = t.isCustom ? ' · カスタム' : '';
    return '<article class="t-card">' +
      '<h3 data-i18n="cat.' + id + '">' + esc(t.name) + '</h3>' +
      '<p class="meta" data-i18n="tmeta.' + id + '">' + esc(t.category) + ' · スコア ' + esc(String(t.popularity)) + customJa + '</p>' +
      (tags ? '<div class="tags">' + tags + '</div>' : '') +
      '<div class="actions">' +
      '<a class="btn btn-primary" href="' + esc(t.previewUrl) + '" target="_blank" rel="noopener noreferrer"><span data-i18n="gallery.card.preview">プレビュー</span></a>' +
      '<a class="btn btn-ghost" href="/customer-intake"><span data-i18n="gallery.card.consult">この系統で相談</span></a>' +
      '</div></article>';
  }

  function buildChips() {
    var templates = state.raw.templates || [];
    var set = {};
    templates.forEach(function (t) { set[t.category] = true; });
    var cats = Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'ja'); });
    var chips = $('chips');
    chips.innerHTML = '<button type="button" class="chip active" data-cat="">すべて</button>' +
      cats.map(function (c) {
        return '<button type="button" class="chip" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('');
    chips.querySelectorAll('.chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-cat') || '';
        chips.querySelectorAll('.chip').forEach(function (b) { b.classList.toggle('active', b === btn); });
        renderList();
      });
    });
  }

  function refresh() {
    renderPickups();
    buildChips();
    renderList();
    if (document.documentElement.lang === 'en' && window.__publicUiGoEn) {
      window.__publicUiGoEn();
    }
  }

  fetch(API)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      state.raw = data;
      $('state-loading').style.display = 'none';
      $('app').style.display = 'block';
      $('week-label').textContent = data.weekLabel || '今週のピックアップ';
      refresh();
    })
    .catch(function (e) {
      $('state-loading').style.display = 'none';
      $('state-err').style.display = 'block';
      $('state-err').textContent = '一覧を読み込めませんでした。しばらくしてから再度お試しください。';
    });

  $('q').addEventListener('input', function () {
    state.q = $('q').value;
    renderList();
  });
  $('sort').addEventListener('change', function () {
    state.sort = $('sort').value;
    renderList();
  });
})();
  <\/script>
  <script>${publicLangToggleInlineScript()}<\/script>
</body>
</html>`;
}
