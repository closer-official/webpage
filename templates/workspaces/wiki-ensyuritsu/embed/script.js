/**
 * wiki-ensyuritsu · 円周率ページ
 * - イントロ → ヒーロー円のシームレス接続
 * - 背景桁のパララックス（スクロール連動・2層）
 * - サイド目次スクロールスパイ
 * - MathJax 数式組版
 * - 歴史セクション：石碑風タイポ＋1字ずつ彫刻表示（スクロールで開始）
 * - 3D 円筒トンネル：ホイールで奥行き＋回転、中央スラブがフォーカス（本文は省略なし）
 * - カーソル軌跡 / ライトボックス
 */

(function () {
  'use strict';

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

  function shuffleDigits(str) {
    var a = str.split('');
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a.join('');
  }

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

  function fillFlowBg2() {
    var el = $('#pi-flow-text-2');
    if (!el) return;
    var s = shuffleDigits(PI_DIGITS + PI_DIGITS);
    var repeated = '';
    while (repeated.length < 10000) {
      repeated += s + ' ';
    }
    el.textContent = repeated;
  }

  function fillLoaderTextPath() {
    var tp = $('#pi-textpath-digits');
    if (!tp) return;
    var s = PI_DIGITS;
    while (s.length < 2800) s += PI_DIGITS;
    tp.textContent = s.slice(0, 2800);
  }

  /** スクロールに応じて桁レイヤーを視差移動（本文の「無限」演出と連動） */
  function initParallaxDigits() {
    if (prefersReduced) return;
    var t1 = $('#pi-flow-text');
    var t2 = $('#pi-flow-text-2');
    var ticking = false;
    function apply() {
      var y = window.scrollY || window.pageYOffset || 0;
      var phase = (y * 0.003) % 6.28318;
      if (t1) {
        t1.style.transform =
          'translateY(' + (-0.16 * y + Math.sin(phase) * 8) + 'px) translateX(' + (-0.02 * y + Math.cos(phase * 0.7) * 6) + 'px)';
      }
      if (t2) {
        t2.style.transform =
          'translateY(' + (0.14 * y + Math.cos(phase * 1.1) * 10) + 'px) translateX(' + (0.025 * y) + 'px)';
      }
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
  }

  /** 3D 円筒トンネル：ホイール＝奥へ進行＋回転、中央スラブがフォーカス（本文 DOM は一字一句維持） */
  function initTunnel() {
    var root = $('#pi-tunnel-root');
    var helix = $('#pi-tunnel-helix');
    var camera = $('#pi-tunnel-camera');
    var scene = $('#pi-tunnel-scene');
    var stage = $('#pi-tunnel-stage');
    var article = $('.pi-wiki-article--tunnel');
    var page = $('.wes-deliverable.pi-page');
    if (!root || !helix || !camera || !article) return;
    if (root.getAttribute('data-tunnel-init') === '1') return;
    root.setAttribute('data-tunnel-init', '1');

    if (prefersReduced) {
      root.classList.add('pi-tunnel--reduced');
      return;
    }

    window.addEventListener('pi-tunnel-enter', function () {
      root.classList.add('pi-tunnel--entered');
    });

    var children = [].slice.call(article.children);
    var frag = document.createDocumentFragment();
    children.forEach(function (node, i) {
      var slab = document.createElement('div');
      slab.className = 'pi-tunnel-slab';
      slab.dataset.tunnelIndex = String(i);
      var poly = document.createElement('div');
      poly.className = 'pi-tunnel-slab__poly';
      poly.setAttribute('aria-hidden', 'true');
      var face = document.createElement('div');
      face.className = 'pi-tunnel-slab__face';
      slab.appendChild(poly);
      slab.appendChild(face);
      face.appendChild(node);
      frag.appendChild(slab);
    });
    article.appendChild(frag);

    var slabs = $all('.pi-tunnel-slab', helix);
    slabs.forEach(function (s) {
      s.classList.add('is-visible');
    });

    var camZ = 520;
    var minZ = -8000;
    var maxZ = 720;
    var gearLabel = $('#pi-tunnel-gear-label');

    function layoutHelix() {
      var R = Math.min(560, Math.max(300, window.innerWidth * 0.34));
      var zStep = Math.min(430, Math.max(300, window.innerHeight * 0.48));
      var angleStep = (Math.PI * 2) / 8.2;
      var n = slabs.length;
      slabs.forEach(function (slab, i) {
        var theta = i * angleStep;
        var x = R * Math.sin(theta);
        var z = -i * zStep + R * Math.cos(theta) * 0.32;
        var y = -i * (zStep * 0.07);
        var deg = (-theta * 180) / Math.PI + 180;
        slab.style.transform =
          'translate(-50%, -50%) translate3d(' +
          x.toFixed(1) +
          'px,' +
          y.toFixed(1) +
          'px,' +
          z.toFixed(1) +
          'px) rotateY(' +
          deg.toFixed(2) +
          'deg)';
        slab._idealCamZ = 500 - i * zStep * 0.88 + R * 0.08;
      });
      minZ = -(n * zStep * 0.92 + 420);
      maxZ = 680;
    }

    layoutHelix();

    function applyCamera() {
      camZ = Math.max(minZ, Math.min(maxZ, camZ));
      var ry = camZ * -0.048;
      camera.style.transform = 'translate3d(0, 0,' + camZ + 'px) rotateY(' + ry + 'deg)';
    }

    applyCamera();

    if (stage) {
      stage.addEventListener(
        'wheel',
        function (e) {
          e.preventDefault();
          camZ += e.deltaY * 0.9;
          applyCamera();
        },
        { passive: false }
      );

      var ty = 0;
      stage.addEventListener(
        'touchstart',
        function (e) {
          if (e.touches[0]) ty = e.touches[0].clientY;
        },
        { passive: true }
      );
      stage.addEventListener(
        'touchmove',
        function (e) {
          if (!e.touches[0]) return;
          var y = e.touches[0].clientY;
          var dy = ty - y;
          ty = y;
          camZ += dy * 1.35;
          applyCamera();
        },
        { passive: true }
      );

      stage.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          camZ -= 280;
          applyCamera();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          camZ += 280;
          applyCamera();
        }
      });
      stage.setAttribute('tabindex', '0');
    }

    window.addEventListener(
      'resize',
      function () {
        layoutHelix();
        applyCamera();
      },
      { passive: true }
    );

    var fb = $('#pi-tunnel-footer-btn');
    if (fb) {
      fb.addEventListener('click', function () {
        document.body.style.overflow = '';
        if (page) page.classList.remove('pi-page--tunnel-mode');
        var ft = $('#contact');
        if (ft) ft.scrollIntoView({ behavior: 'smooth' });
      });
    }

    var aside = $('.pi-toc-aside');
    if (aside) {
      aside.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || root.classList.contains('pi-tunnel--reduced')) return;
        var id = a.getAttribute('href').replace(/^#/, '');
        var target = document.getElementById(id);
        if (!target) return;
        var slab = target.closest('.pi-tunnel-slab');
        if (!slab || typeof slab._idealCamZ !== 'number') return;
        e.preventDefault();
        camZ = slab._idealCamZ;
        applyCamera();
      });
    }

    function tickFocus() {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var best = null;
      var bestD = Infinity;
      for (var i = 0; i < slabs.length; i++) {
        var slab = slabs[i];
        var r = slab.getBoundingClientRect();
        var mx = r.left + r.width / 2;
        var my = r.top + r.height / 2;
        var d = (mx - cx) * (mx - cx) + (my - cy) * (my - cy);
        if (d < bestD) {
          bestD = d;
          best = slab;
        }
      }
      for (var j = 0; j < slabs.length; j++) {
        slabs[j].classList.toggle('pi-tunnel-slab--focus', slabs[j] === best);
      }
      if (best && gearLabel) {
        var h2 = best.querySelector('h2');
        var lbl = '';
        if (h2 && h2.textContent) lbl = h2.textContent.replace(/\s+/g, ' ').trim();
        if (!lbl) {
          var wire = best.querySelector('[data-pi-label]');
          if (wire) lbl = wire.getAttribute('data-pi-label') || '';
        }
        if (!lbl) {
          var ar = best.getAttribute('aria-label');
          if (ar) lbl = ar;
        }
        if (!lbl) {
          var note = best.querySelector('.pi-note');
          if (note) lbl = '出典・凡例';
        }
        gearLabel.textContent = lbl || '—';
      }
      requestAnimationFrame(tickFocus);
    }
    requestAnimationFrame(tickFocus);
  }

  /** サイド目次：現在の章をハイライト */
  function initTocSpy() {
    var aside = $('.pi-toc-aside');
    if (!aside) return;
    var links = $all('.pi-toc-aside a[href^="#"]');
    if (!links.length) return;
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace(/^#/, '');
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, a: a });
    });
    if (!sections.length) return;

    var tunnelRoot = $('#pi-tunnel-root');
    var useTunnel =
      tunnelRoot && !tunnelRoot.classList.contains('pi-tunnel--reduced') && document.querySelector('.pi-tunnel-slab');

    function setActive(currentId) {
      sections.forEach(function (s) {
        var on = s.id === currentId;
        s.a.classList.toggle('is-active', on);
        if (on) s.a.setAttribute('aria-current', 'location');
        else s.a.removeAttribute('aria-current');
      });
    }

    function updateTunnelToc() {
      var focus = document.querySelector('.pi-tunnel-slab--focus');
      if (!focus) return;
      var sec = focus.querySelector('section[id^="wiki-"]');
      if (!sec) sec = focus.querySelector('section[id]');
      var sid = sec ? sec.id : '';
      if (!sid) {
        var inner = focus.querySelector('[id^="wiki-"]');
        if (inner) sid = inner.id;
      }
      var currentId = sections[0].id;
      if (sid) {
        sections.forEach(function (s) {
          if (s.id === sid) currentId = s.id;
        });
      }
      setActive(currentId);
    }

    function updateScrollToc() {
      var mid = window.scrollY + window.innerHeight * 0.33;
      var current = sections[0];
      sections.forEach(function (s) {
        var rect = s.el.getBoundingClientRect();
        var top = rect.top + window.scrollY;
        if (top <= mid) current = s;
      });
      setActive(current.id);
    }

    if (useTunnel) {
      function loop() {
        updateTunnelToc();
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
      return;
    }

    var t = null;
    window.addEventListener(
      'scroll',
      function () {
        if (t) return;
        t = requestAnimationFrame(function () {
          updateScrollToc();
          t = null;
        });
      },
      { passive: true }
    );
    window.addEventListener('resize', updateScrollToc, { passive: true });
    updateScrollToc();
  }

  /** 歴史セクション：テキストノードを1字ずつ包み、石碑彫刻アニメ用にする */
  function wrapHistoryStoneCharNodes(panel) {
    if (!panel || !panel.classList.contains('pi-history-stone') || prefersReduced) return;

    var walker = document.createTreeWalker(
      panel,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var val = node.nodeValue;
          if (!val || !/\S/.test(val)) return NodeFilter.FILTER_REJECT;
          var el = node.parentElement;
          if (!el) return NodeFilter.FILTER_REJECT;
          var tag = el.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          if (el.closest('.pi-stone-skip')) return NodeFilter.FILTER_REJECT;
          if (el.closest('button')) return NodeFilter.FILTER_REJECT;
          if (el.closest('.pi-math-art')) return NodeFilter.FILTER_REJECT;
          if (el.closest('.pi-math-block')) return NodeFilter.FILTER_REJECT;
          if (el.closest('.pi-math-render')) return NodeFilter.FILTER_REJECT;
          if (el.closest('mjx-container')) return NodeFilter.FILTER_REJECT;
          if (el.closest('mjx-assistive-mml')) return NodeFilter.FILTER_REJECT;
          if (el.classList && el.classList.contains('pi-stone-char')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    var textNodes = [];
    var cur;
    while ((cur = walker.nextNode())) {
      textNodes.push(cur);
    }

    textNodes.forEach(function (textNode) {
      var s = textNode.nodeValue;
      var parent = textNode.parentNode;
      if (!parent) return;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < s.length; i++) {
        var span = document.createElement('span');
        span.className = 'pi-stone-char';
        span.textContent = s.charAt(i);
        frag.appendChild(span);
      }
      parent.replaceChild(frag, textNode);
    });

    if (textNodes.length) {
      panel.classList.add('is-stone-ready');
    }
    if (panel.__piStoneTryCarve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          panel.__piStoneTryCarve();
        });
      });
    }
  }

  function carveHistoryStone(panel) {
    var chars = panel.querySelectorAll('.pi-stone-char');
    var total = chars.length;
    if (!total) {
      panel.classList.remove('is-stone-carving');
      panel.setAttribute('aria-busy', 'false');
      return;
    }
    var i = 0;
    var perFrame = total > 12000 ? 28 : total > 7000 ? 18 : 12;

    function frame() {
      var end = Math.min(i + perFrame, total);
      for (; i < end; i++) {
        chars[i].classList.add('is-carved');
      }
      if (i < total) {
        requestAnimationFrame(frame);
      } else {
        panel.classList.add('is-stone-done');
        panel.setAttribute('aria-busy', 'false');
      }
    }
    requestAnimationFrame(frame);
  }

  function startHistoryStoneCarve(panel) {
    if (!panel || panel.classList.contains('pi-history-stone--static')) return;
    if (panel.classList.contains('is-stone-carving')) return;
    if (!panel.querySelectorAll('.pi-stone-char').length) return;
    panel.classList.add('is-stone-carving');
    panel.setAttribute('aria-busy', 'true');
    window.setTimeout(function () {
      carveHistoryStone(panel);
    }, 220);
  }

  function bindHistoryStoneReveal(panel) {
    function tryCarve() {
      var uncarved = panel.querySelectorAll('.pi-stone-char:not(.is-carved)').length;
      if (panel.classList.contains('is-stone-done') && uncarved === 0) return;
      if (panel.classList.contains('is-stone-done') && uncarved > 0) {
        panel.classList.remove('is-stone-done');
        panel.classList.remove('is-stone-carving');
      }
      if (panel.classList.contains('is-stone-carving')) return;
      if (!panel.classList.contains('is-visible')) return;
      if (!panel.querySelectorAll('.pi-stone-char').length) {
        wrapHistoryStoneCharNodes(panel);
      }
      if (!panel.querySelectorAll('.pi-stone-char').length) return;
      startHistoryStoneCarve(panel);
    }

    panel.__piStoneTryCarve = tryCarve;

    var mo = new MutationObserver(tryCarve);
    mo.observe(panel, { attributes: true, attributeFilter: ['class'] });
    tryCarve();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) tryCarve();
          });
        },
        { root: null, rootMargin: '0px 0px 12% 0px', threshold: 0.05 }
      );
      io.observe(panel);
    }

    window.setTimeout(function () {
      if (!panel.classList.contains('is-stone-done') && !panel.classList.contains('is-stone-carving')) {
        tryCarve();
      }
    }, 4800);
  }

  function initHistoryStone() {
    var panel = document.getElementById('wiki-history');
    if (!panel || !panel.classList.contains('pi-history-stone')) return;

    if (prefersReduced) {
      panel.classList.add('pi-history-stone--static');
      return;
    }

    bindHistoryStoneReveal(panel);

    function prepare() {
      wrapHistoryStoneCharNodes(panel);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', prepare);
    } else {
      prepare();
    }
    window.addEventListener('load', function () {
      window.setTimeout(prepare, 400);
      window.setTimeout(prepare, 1200);
    });
  }

  /** MathJax 3: data-tex を持つ .pi-math-render を表示数式として組版 */
  function initMathJax() {
    var nodes = $all('.pi-math-render[data-tex]');
    if (!nodes.length) return;
    var tries = 0;
    function apply() {
      if (!window.MathJax || !window.MathJax.typesetPromise) {
        tries++;
        if (tries < 120) window.setTimeout(apply, 50);
        return;
      }
      nodes.forEach(function (el) {
        var tex = el.getAttribute('data-tex');
        if (!tex) return;
        el.textContent = '\\[' + tex + '\\]';
      });
      MathJax.typesetPromise(nodes)
        .then(function () {
          var hp = document.getElementById('wiki-history');
          if (hp && hp.classList.contains('pi-history-stone')) {
            wrapHistoryStoneCharNodes(hp);
            if (hp.__piStoneTryCarve) {
              requestAnimationFrame(function () {
                hp.__piStoneTryCarve();
              });
            }
          }
        })
        .catch(function () {
          nodes.forEach(function (el) {
            var t = el.getAttribute('data-tex');
            if (t) el.textContent = t;
          });
        });
    }
    apply();
  }

  /** ヒーロー動画: 読み込み失敗時は MDN の CC0 サンプルへ差し替え（Pexels は環境により 403 のことがある） */
  function initHeroVideo() {
    var v = $('.pi-hero__video');
    if (!v) return;
    var fallbackMp4 = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    if (prefersReduced) {
      v.removeAttribute('autoplay');
      try {
        v.pause();
      } catch (e) {
        /* ignore */
      }
      return;
    }
    function onErr() {
      v.removeEventListener('error', onErr);
      var src = v.querySelector('source');
      if (src && src.getAttribute('src') !== fallbackMp4) {
        src.setAttribute('src', fallbackMp4);
        v.load();
      }
    }
    v.addEventListener('error', onErr);
  }

  function runIntro() {
    var loader = $('#pi-loader');
    var main = $('#pi-main');
    var hero = $('#hero');
    if (!loader || !main) return;

    if (prefersReduced) {
      loader.style.display = 'none';
      main.classList.add('pi-main--visible');
      if (hero) hero.classList.add('pi-hero--ring-handoff');
      document.body.style.overflow = '';
      initMathJax();
      window.dispatchEvent(new CustomEvent('pi-tunnel-enter'));
      return;
    }

    var EXIT_MS = 2800;
    var EXIT_ANIM_MS = 1150;

    window.setTimeout(function () {
      loader.classList.add('pi-loader--exit');
      if (hero) hero.classList.add('pi-hero--ring-handoff');
    }, EXIT_MS);

    window.setTimeout(function () {
      loader.style.display = 'none';
      loader.setAttribute('aria-hidden', 'true');
      main.classList.add('pi-main--visible');
      document.body.style.overflow = 'hidden';
      var del = document.querySelector('.wes-deliverable.pi-page');
      if (del) del.classList.add('pi-page--tunnel-mode');
      initMathJax();
      window.dispatchEvent(new CustomEvent('pi-tunnel-enter'));
    }, EXIT_MS + EXIT_ANIM_MS + 40);
  }

  function onLoad() {
    document.body.style.overflow = 'hidden';
    fillFlowBg();
    fillFlowBg2();
    fillLoaderTextPath();
    initHeroVideo();
    runIntro();
  }

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad);
  }

  initParallaxDigits();

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
        var alpha = 0.22 + ((i + 1) / points.length) * 0.68;
        ctx.font = '12px "Source Code Pro", monospace';
        ctx.fillStyle = 'rgba(216, 249, 155, ' + alpha + ')';
        ctx.strokeStyle = 'rgba(0, 0, 0, ' + (alpha * 0.55) + ')';
        ctx.lineWidth = 2;
        ctx.strokeText(p.d, p.x + (i % 5) * 0.6, p.y + (i % 3) * 0.4);
        ctx.fillText(p.d, p.x + (i % 5) * 0.6, p.y + (i % 3) * 0.4);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTunnel);
  } else {
    initTunnel();
  }

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
      { root: null, rootMargin: '0px 0px 12% 0px', threshold: 0 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
    requestAnimationFrame(function () {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 80 && r.bottom > -120) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    });
    window.setTimeout(function () {
      els.forEach(function (el) {
        el.classList.add('is-visible');
        try {
          io.unobserve(el);
        } catch (e) {
          /* ignore */
        }
      });
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTocSpy);
  } else {
    initTocSpy();
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHistoryStone);
  } else {
    initHistoryStone();
  }
})();
