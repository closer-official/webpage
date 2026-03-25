/**
 * wiki-ensyuritsu · 円周率ページ
 * - イントロ（load 後に回転 → 拡大フェードアウト）
 * - カーソルに π 桁の軌跡（canvas）
 * - スクロール表示（IntersectionObserver）
 * - 図版ライトボックス
 * - 数式ホバーで視覚化パネル表示（CSS 連動）
 */

(function () {
  'use strict';

  /** 背景・トレイル用の π 桁（十分な長さ） */
  var PI_DIGITS =
    '3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271209091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554686484949392246172147838334914658105760992';

  var prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return [].slice.call((root || document).querySelectorAll(sel));
  }

  /* --- 流れる背景テキスト --- */
  function fillFlowBg() {
    var el = $('#pi-flow-text');
    if (!el) return;
    var chunk = PI_DIGITS;
    var repeated = '';
    while (repeated.length < 12000) {
      repeated += chunk + ' ';
    }
    el.textContent = repeated;
  }

  /* --- イントロ SVG に π 桁を流し込む（textPath） --- */
  function fillLoaderTextPath() {
    var tp = $('#pi-textpath-digits');
    if (!tp) return;
    var s = PI_DIGITS;
    while (s.length < 2800) s += PI_DIGITS;
    tp.textContent = s.slice(0, 2800);
  }

  function runIntro() {
    var loader = $('#pi-loader');
    var main = $('#pi-main');
    if (!loader || !main) return;

    if (prefersReduced) {
      loader.style.display = 'none';
      main.classList.add('pi-main--visible');
      document.body.style.overflow = '';
      return;
    }

    /** 回転を見せたあと、ローダー全体を拡大フェード（CSS #pi-loader.pi-loader--exit） */
    var EXIT_MS = 2800;
    var EXIT_ANIM_MS = 1150;

    window.setTimeout(function () {
      loader.classList.add('pi-loader--exit');
    }, EXIT_MS);

    window.setTimeout(function () {
      loader.style.display = 'none';
      loader.setAttribute('aria-hidden', 'true');
      main.classList.add('pi-main--visible');
      document.body.style.overflow = '';
    }, EXIT_MS + EXIT_ANIM_MS + 40);
  }

  function onLoad() {
    document.body.style.overflow = 'hidden';
    fillFlowBg();
    fillLoaderTextPath();
    runIntro();
  }

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad);
  }

  /* --- カーソル軌跡（canvas） --- */
  function initCursorTrail() {
    if (prefersReduced) return;
    var canvas = $('#pi-cursor-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var points = [];
    var maxPts = 36;
    var idx = 0;

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener(
      'mousemove',
      function (e) {
        points.push({
          x: e.clientX,
          y: e.clientY,
          d: PI_DIGITS[idx % PI_DIGITS.length],
        });
        idx++;
        if (points.length > maxPts) points.shift();
      },
      { passive: true }
    );

    function tick() {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      if (points.length < 2) {
        requestAnimationFrame(tick);
        return;
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var alpha = (i + 1) / points.length * 0.45;
        ctx.font = '11px "Source Code Pro", monospace';
        ctx.fillStyle = 'rgba(163, 230, 53, ' + alpha + ')';
        ctx.fillText(p.d, p.x + (i % 5) * 0.6, p.y + (i % 3) * 0.4);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (var j = 1; j < points.length; j++) {
        ctx.lineTo(points[j].x, points[j].y);
      }
      ctx.stroke();
      ctx.restore();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  initCursorTrail();

  /* --- スクロールイン --- */
  function initReveal() {
    var els = $all('.pi-reveal');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  /* --- ライトボックス --- */
  function initLightbox() {
    var root = $('#pi-lightbox');
    var panel = $('#pi-lightbox__panel');
    var closeBtn = $('#pi-lightbox__close');
    if (!root || !panel) return;

    function openClone(svgHtml, title) {
      var safe = String(title || '図')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
      panel.innerHTML =
        '<svg role="img" aria-label="' +
        safe +
        '" viewBox="0 0 400 400" width="100%" height="auto">' +
        svgHtml +
        '</svg>';
      root.classList.add('pi-lightbox--open');
      root.setAttribute('aria-hidden', 'false');
      closeBtn && closeBtn.focus();
    }

    function close() {
      root.classList.remove('pi-lightbox--open');
      root.setAttribute('aria-hidden', 'true');
      panel.innerHTML = '';
    }

    $all('[data-art]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-art');
        var svgInner = $('#pi-art-store-' + id);
        if (!svgInner) return;
        openClone(svgInner.innerHTML, btn.getAttribute('aria-label') || '');
      });
    });

    closeBtn && closeBtn.addEventListener('click', close);
    root.addEventListener('click', function (e) {
      if (e.target === root) close();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('pi-lightbox--open')) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }

  /* --- 数式のマウス位置（グラデーション） --- */
  function initFormulaGlow() {
    $all('.pi-formula').forEach(function (f) {
      f.addEventListener('mousemove', function (e) {
        var r = f.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        f.style.setProperty('--fx', x + '%');
        f.style.setProperty('--fy', y + '%');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormulaGlow);
  } else {
    initFormulaGlow();
  }
})();
