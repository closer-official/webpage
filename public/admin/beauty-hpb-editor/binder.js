/**
 * JSON → data-bind DOM 反映（配列は template クローン）
 */
(function (g) {
  g.BeautyHpbEditor = g.BeautyHpbEditor || {};

  function getPath(obj, path) {
    if (!obj || !path) return null;
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function isEmpty(v) {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.length === 0;
    return false;
  }

  function nl2br(text) {
    return String(text || '')
      .split('\n')
      .map(function (line) {
        return line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      })
      .join('<br>');
  }

  function setElContent(el, value, asHtml) {
    if (!el) return;
    if (asHtml) el.innerHTML = nl2br(value);
    else el.textContent = value == null ? '' : String(value);
  }

  function toggleSection(root, selector, show) {
    var sec = root.querySelector(selector);
    if (!sec) return;
    sec.hidden = !show;
    sec.style.display = show ? '' : 'none';
  }

  function bindList(host, listPath, data) {
    var salon = data.salon || {};
    var key = String(listPath || '').replace(/^salon\./, '');
    var arr = salon[key];
    if (!Array.isArray(arr)) arr = [];
    var tmpl = host.querySelector('template');
    var mount = host.querySelector('[data-bind-list-mount]') || host;

    mount.querySelectorAll(':scope > [data-bind-clone]').forEach(function (n) {
      n.remove();
    });

    if (!tmpl || !arr.length) {
      host.hidden = true;
      host.style.display = 'none';
      return;
    }
    host.hidden = false;
    host.style.display = '';

    arr.forEach(function (item) {
      var frag = tmpl.content.cloneNode(true);
      var node = frag.firstElementChild;
      if (!node) return;
      node.setAttribute('data-bind-clone', '1');
      node.querySelectorAll('[data-bind]').forEach(function (el) {
        var k = el.getAttribute('data-bind');
        var v = item[k];
        var html = el.getAttribute('data-bind-br') === 'true';
        if (el.tagName === 'IMG' && k === 'imageUrl') {
          if (v) {
            el.src = v;
            el.style.display = '';
          } else {
            el.removeAttribute('src');
            el.style.display = 'none';
          }
          return;
        }
        setElContent(el, isEmpty(v) ? '' : v, html);
      });
      mount.appendChild(node);
    });
  }

  function bindDataToDom(root, data) {
    if (!root || !data || !data.salon) return;
    var salon = data.salon;

    root.querySelectorAll('[data-bind]').forEach(function (el) {
      if (el.closest('template')) return;
      if (el.closest('[data-bind-list]')) return;
      var path = el.getAttribute('data-bind');
      if (!path) return;
      var v = getPath(data, path);
      if (v === undefined && path.indexOf('salon.') === 0) v = getPath(salon, path.slice(6));
      var html = el.getAttribute('data-bind-br') === 'true';
      setElContent(el, isEmpty(v) ? '' : v, html);
    });

    root.querySelectorAll('[data-bind-list]').forEach(function (host) {
      var lp = host.getAttribute('data-bind-list');
      bindList(host, lp, data);
    });

    toggleSection(root, '[data-section="hero"]', !isEmpty(salon.heroCatch) || !isEmpty(salon.heroSubtitle) || !isEmpty(salon.heroLabel));
    toggleSection(root, '[data-section="shopTitle"]', !isEmpty(salon.shopTitle));
    toggleSection(root, '[data-section="meta"]', !isEmpty(salon.rating) || !isEmpty(salon.reviewCount));
    toggleSection(root, '[data-section="intro"]', !isEmpty(salon.introduction));
    toggleSection(root, '[data-section="concept"]', !isEmpty(salon.conceptTitle) || !isEmpty(salon.conceptBody));
    toggleSection(root, '[data-section="policies"]', !!(salon.policies && salon.policies.length));
    toggleSection(root, '[data-section="message"]', !isEmpty(salon.salonMessage));
    toggleSection(root, '[data-section="reserve"]', !isEmpty(salon.reserveNote));
    toggleSection(root, '[data-section="access"]', !isEmpty(salon.address) || !isEmpty(salon.access));
    toggleSection(root, '[data-section="stats"]', !isEmpty(salon.avgReservation) || !isEmpty(salon.genderRatio) || !isEmpty(salon.ageRatio));
    toggleSection(root, '[data-section="coupons"]', !!(salon.coupons && salon.coupons.length));
    toggleSection(root, '[data-section="atmosphere"]', !!(salon.atmosphere && salon.atmosphere.length));
    toggleSection(root, '[data-section="staff"]', !!(salon.staff && salon.staff.length));
    toggleSection(root, '[data-section="faq"]', !!(salon.faq && salon.faq.length));
    var galShow =
      salon.gallery &&
      salon.gallery.some(function (x) {
        return !isEmpty(x && x.imageUrl) || !isEmpty(x && x.caption);
      });
    toggleSection(root, '[data-section="gallery"]', !!galShow);

    var brandRow = root.querySelector('[data-section="brand"]');
    if (brandRow) {
      var showBrand = !isEmpty(salon.name) || !isEmpty(salon.brandSubtitle);
      brandRow.hidden = !showBrand;
      brandRow.style.display = showBrand ? '' : 'none';
    }

    var foot = root.querySelector('[data-section="footer"]');
    if (foot) {
      var sf = !isEmpty(salon.footerTagline);
      foot.hidden = !sf;
      foot.style.display = sf ? '' : 'none';
    }
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  g.BeautyHpbEditor.getPath = getPath;
  g.BeautyHpbEditor.bindDataToDom = bindDataToDom;
  g.BeautyHpbEditor.deepClone = deepClone;
})(typeof window !== 'undefined' ? window : globalThis);
