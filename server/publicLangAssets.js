/**
 * 顧客向けページ共通：言語切替バー + クライアントスクリプト（data-i18n 要素を Gemini 経由で英訳）
 */
/**
 * @param {{ variant?: 'light' | 'dark'; enFirst?: boolean; defaultLang?: 'ja' | 'en' }} [opts]
 */
export function publicLangBarHtml(opts = {}) {
  const variant = opts.variant === 'dark' ? 'public-lang-bar--dark' : '';
  const enFirst = opts.enFirst === true;
  const def = opts.defaultLang === 'en' ? 'en' : 'ja';
  const jaActive = def === 'ja' ? ' is-active' : '';
  const enActive = def === 'en' ? ' is-active' : '';
  const jaBtn = `<button type="button" class="public-lang-btn${jaActive}" data-lang="ja" id="public-lang-ja">日本語</button>`;
  const enBtn = `<button type="button" class="public-lang-btn${enActive}" data-lang="en" id="public-lang-en">English</button>`;
  const sep = '<span class="public-lang-sep" aria-hidden="true">|</span>';
  const pair = enFirst ? `${enBtn}${sep}${jaBtn}` : `${jaBtn}${sep}${enBtn}`;
  return `<div class="public-lang-bar ${variant}" id="public-lang-bar" role="navigation" aria-label="Language / 言語">
  ${pair}
  <span class="public-lang-status" id="public-lang-status" aria-live="polite"></span>
</div>`;
}

export function publicLangBarStyles() {
  return `
    .public-lang-bar {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.92);
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
      font-size: 0.85rem;
      font-family: system-ui, sans-serif;
    }
    .public-lang-btn {
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      color: #444;
      font: inherit;
    }
    .public-lang-btn:hover { background: rgba(0,0,0,0.06); }
    .public-lang-btn.is-active { font-weight: 700; color: #111; }
    .public-lang-sep { color: #bbb; user-select: none; }
    .public-lang-status { margin-left: 4px; font-size: 0.75rem; color: #666; max-width: 140px; }
    @media (max-width: 520px) {
      .public-lang-bar { left: 12px; right: 12px; justify-content: center; flex-wrap: wrap; }
      .public-lang-status { width: 100%; text-align: center; max-width: none; }
    }
    .public-lang-bar--dark {
      background: rgba(28, 28, 36, 0.94);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .public-lang-bar--dark .public-lang-btn { color: #e8e4df; }
    .public-lang-bar--dark .public-lang-btn:hover { background: rgba(255, 255, 255, 0.08); }
    .public-lang-bar--dark .public-lang-btn.is-active { color: #fff; }
    .public-lang-bar--dark .public-lang-sep { color: #5c5a56; }
    .public-lang-bar--dark .public-lang-status { color: #9a9590; }
  `;
}

/** ページ末尾で読み込むインラインスクリプト（文字列として返す） */
export function publicLangToggleInlineScript() {
  return `
(function () {
  var API = '/api/public/translate-ui';
  var CACHE_PREFIX = 'pubUiEn:';
  var origHtml = new Map();
  var origPh = new Map();

  function nodes() {
    var list = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
    list.sort(function (a, b) {
      var ka = a.getAttribute('data-i18n') || '';
      var kb = b.getAttribute('data-i18n') || '';
      return ka.localeCompare(kb);
    });
    return list;
  }

  function captureJa() {
    nodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) origHtml.set(k, el.innerHTML);
    });
  }

  function phNodes() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-i18n-placeholder]'));
  }

  function captureJaPh() {
    phNodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (k) origPh.set(k, el.getAttribute('placeholder') || '');
    });
  }

  function setActive(lang) {
    var ja = document.getElementById('public-lang-ja');
    var en = document.getElementById('public-lang-en');
    if (ja) ja.classList.toggle('is-active', lang === 'ja');
    if (en) en.classList.toggle('is-active', lang === 'en');
    document.documentElement.lang = lang === 'en' ? 'en' : 'ja';
    try { localStorage.setItem('publicUiLang', lang); } catch (e) {}
  }

  function status(msg) {
    var s = document.getElementById('public-lang-status');
    if (s) s.textContent = msg || '';
  }

  function applyJa() {
    nodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k && origHtml.has(k)) el.innerHTML = origHtml.get(k);
    });
    phNodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (k && origPh.has(k)) el.setAttribute('placeholder', origPh.get(k));
    });
    setActive('ja');
    try { document.dispatchEvent(new CustomEvent('publicUiLangSync', { detail: { lang: 'ja' } })); } catch (e) {}
  }

  function applyEnFromMap(map) {
    nodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k && map[k] != null) el.textContent = map[k];
    });
    phNodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (k && map[k] != null) el.setAttribute('placeholder', map[k]);
    });
    setActive('en');
    status('');
    try { document.dispatchEvent(new CustomEvent('publicUiLangSync', { detail: { lang: 'en' } })); } catch (e) {}
  }

  function goEn() {
    captureJa();
    captureJaPh();
    var list = nodes();
    var seen = new Map();
    list.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k && !seen.has(k)) seen.set(k, el.textContent.trim());
    });
    phNodes().forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      var t = (origPh.get(k) != null ? origPh.get(k) : el.getAttribute('placeholder')) || '';
      if (k && !seen.has(k)) seen.set(k, t.trim());
    });
    var entries = [];
    seen.forEach(function (text, key) {
      entries.push({ key: key, text: text });
    });

    var cacheKey = CACHE_PREFIX + location.pathname;
    try {
      var raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        var cached = JSON.parse(raw);
        if (cached && typeof cached === 'object') {
          applyEnFromMap(cached);
          return;
        }
      }
    } catch (e) {}

    status('Translating…');
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: entries, target: 'en' })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (_ref) {
        var ok = _ref.ok;
        var data = _ref.j;
        if (!ok || !data || !data.entries) throw new Error((data && data.error) || 'translate failed');
        var map = {};
        data.entries.forEach(function (e) { map[e.key] = e.text; });
        try { sessionStorage.setItem(cacheKey, JSON.stringify(map)); } catch (e2) {}
        applyEnFromMap(map);
      })
      .catch(function () {
        applyJa();
        status('翻訳に失敗しました（日本語に戻しました）');
      });
  }

  document.getElementById('public-lang-ja').addEventListener('click', function () { applyJa(); });
  document.getElementById('public-lang-en').addEventListener('click', function () { goEn(); });

  window.__publicUiGoEn = function () {
    try { sessionStorage.removeItem(CACHE_PREFIX + location.pathname); } catch (e) {}
    goEn();
  };
  window.__publicUiApplyJa = applyJa;

  try {
    var saved = localStorage.getItem('publicUiLang');
    var deferAutoEn = /template-gallery|\/api\/template-gallery/.test(location.pathname);
    if (saved === 'en' && !deferAutoEn) {
      captureJa();
      captureJaPh();
      goEn();
    }
  } catch (e) {}
})();
  `.trim();
}
