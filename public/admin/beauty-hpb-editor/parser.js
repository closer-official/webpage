/**
 * ホットペッパー風テキスト → 構造化 JSON（部分抽出OK・例外で落ちない）
 */
(function (g) {
  g.BeautyHpbEditor = g.BeautyHpbEditor || {};

  function safe(fn, fallback) {
    try {
      return fn();
    } catch (e) {
      return fallback;
    }
  }

  function normalizeText(raw) {
    return String(raw || '').replace(/\r\n/g, '\n');
  }

  function linesOf(t) {
    return t
      .split('\n')
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean);
  }

  function extractSalonNameParenLine(lines) {
    for (var i = 0; i < Math.min(lines.length, 25); i++) {
      var l = lines[i];
      var m = l.match(/^(.{2,80}?)\s*\(([^)]+)\)\s*$/);
      if (!m) m = l.match(/^(.{2,80}?)（([^）]+)）\s*$/);
      if (m && /[\u3000-\u9FFF]/.test(m[1])) return m[1].trim();
    }
    return null;
  }

  function extractShopTitleLine(lines) {
    for (var i = 0; i < Math.min(lines.length, 30); i++) {
      var l = lines[i];
      if (/^【[^】]+】/.test(l) && l.length < 120) return l.trim();
    }
    return null;
  }

  function extractRatingAndReviews(t) {
    var rating = null;
    var count = null;
    var m = t.match(/(\d+\.\d)\s*[（(](\d+)\s*件\s*[)）]/);
    if (m) {
      rating = m[1];
      count = m[2];
      return { rating: rating, reviewCount: count };
    }
    m = t.match(/(\d+\.\d)/);
    if (m) rating = m[1];
    m = t.match(/(\d+)\s*件/);
    if (m) count = m[1];
    return { rating: rating, reviewCount: count };
  }

  function extractAddressLine(lines, t) {
    var m = t.match(/(〒\s*\d{3}-\d{4}[^\n]+)/);
    if (m) return m[1].replace(/\s+/g, ' ').trim();
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (/(東京都|北海道|大阪府|京都府|[一-龥ぁ-ゔ]{2,4}(都|道|府|県))/.test(l) && l.length > 8 && l.length < 200) {
        if (/^\d+\.\d/.test(l)) continue;
        return l;
      }
    }
    return null;
  }

  function extractAccessBlock(lines, addrLine) {
    var out = [];
    var ai = -1;
    for (var i = 0; i < lines.length; i++) {
      if (addrLine && lines[i] === addrLine) {
        ai = i;
        break;
      }
    }
    var start = ai >= 0 ? ai + 1 : 0;
    for (var j = start; j < Math.min(lines.length, start + 5); j++) {
      var l = lines[j];
      if (/徒歩|駅|出口|分|バス|JR|地下鉄|線/.test(l) && l.length < 200) out.push(l);
    }
    return out.length ? out.join('\n') : null;
  }

  function extractHeroishLine(lines) {
    var keys = /当日予約|駅近|人気|口コミ|予約OK|プライベート|カットが得意/;
    for (var i = 0; i < Math.min(lines.length, 20); i++) {
      if (keys.test(lines[i]) && lines[i].length < 160) return lines[i];
    }
    return null;
  }

  function extractParagraphs(t) {
    return t
      .split(/\n{2,}/)
      .map(function (p) {
        return p.trim();
      })
      .filter(function (p) {
        if (p.length < 40) return false;
        if (/スマート支払い|ブックマーク|空席確認|一覧へ|サロン情報/.test(p)) return false;
        return true;
      });
  }

  function extractSalonMessage(t) {
    var idx = t.search(/サロンからの一言/i);
    if (idx < 0) return null;
    var tail = t.slice(idx, idx + 800);
    var parts = tail.split(/\n+/).map(function (x) {
      return x.trim();
    });
    var buf = [];
    var started = false;
    for (var i = 0; i < parts.length; i++) {
      if (/サロンからの一言/i.test(parts[i])) {
        started = true;
        continue;
      }
      if (!started) continue;
      if (/^雰囲気|こだわり|クーポン|スタイリスト|アクセス|^¥/.test(parts[i])) break;
      if (parts[i]) buf.push(parts[i]);
    }
    return buf.length ? buf.join('\n') : null;
  }

  function extractAtmosphere(t) {
    var idx = t.search(/^雰囲気/m);
    if (idx < 0) idx = t.search(/\n雰囲気\n/);
    if (idx < 0) return [];
    var tail = t.slice(idx, idx + 1200);
    var lines = tail.split('\n').map(function (x) {
      return x.trim();
    });
    var body = [];
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      if (/こだわり|クーポン|スタイリスト|サロンから|人気のクーポン/.test(lines[i])) break;
      body.push(lines[i]);
    }
    if (!body.length) return [];
    return [{ title: '雰囲気', body: body.join('\n') }];
  }

  function extractKodawari(t) {
    var idx = t.search(/こだわり/i);
    if (idx < 0) return [];
    var tail = t.slice(idx, idx + 2000);
    var blocks = tail.split(/\n{2,}/);
    var policies = [];
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b].trim();
      if (/人気のクーポン|クーポン|スタイリスト|サロンから/.test(block)) break;
      var ls = block.split('\n').map(function (x) {
        return x.trim();
      });
      if (!ls.length) continue;
      var title = ls[0].replace(/^こだわり\s*/, '').trim() || 'こだわり';
      var rest = ls.slice(1).join('\n').trim();
      if (rest.length > 15) policies.push({ title: title.slice(0, 80), body: rest.slice(0, 500) });
      else if (ls[0].length > 15 && !/^こだわり$/i.test(ls[0])) policies.push({ title: 'こだわり', body: ls.join('\n').slice(0, 500) });
      if (policies.length >= 6) break;
    }
    return policies;
  }

  function extractCoupons(t) {
    var lines = normalizeText(t).split('\n');
    var coupons = [];
    var buf = [];
    function flush() {
      if (!buf.length) return;
      var chunk = buf.join('\n').trim();
      buf = [];
      if (chunk.length < 6) return;
      if (!/¥|￥/.test(chunk)) return;
      var priceM = chunk.match(/[¥￥]\s*[\d,]+/);
      var price = priceM ? priceM[0].replace(/\s/g, '') : '';
      var title = chunk
        .replace(/[¥￥]\s*[\d,〜\-]+.*$/, '')
        .trim()
        .slice(0, 200);
      var body = chunk.slice(0, 400);
      coupons.push({ title: title || 'クーポン', price: price, body: body });
    }
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (/新規|再来|全員|当日|平日|限定|メンズ|レディース|カット|カラー|パーマ|トリートメント|TR/i.test(l) && /¥|￥/.test(l)) {
        if (buf.length) flush();
        buf.push(l);
      } else if (buf.length && l && /¥|￥/.test(l)) {
        buf.push(l);
      } else if (buf.length && !l) {
        flush();
      }
    }
    flush();
    return coupons.slice(0, 12);
  }

  function extractRatios(t) {
    var avg = null;
    var m = t.match(/平均[^\n]{0,20}?([\d,]+)\s*円/);
    if (m) avg = '¥' + m[1].replace(/,/g, '');
    m = t.match(/予約比率[^\n]{0,80}/);
    var gender = m ? m[0].trim() : null;
    m = t.match(/年代[^\n]{0,120}/);
    var age = m ? m[0].trim() : null;
    return { avgReservation: avg, genderRatio: gender, ageRatio: age };
  }

  function extractStaffBlocks(t) {
    var idx = t.search(/スタイリスト|スタッフ紹介|DIRECTOR/i);
    if (idx < 0) return [];
    var tail = t.slice(idx, idx + 3500);
    var paras = tail.split(/\n{2,}/);
    var staff = [];
    for (var p = 0; p < paras.length; p++) {
      var block = paras[p].trim();
      var ln = block.split('\n').map(function (x) {
        return x.trim();
      });
      var nameLine = null;
      for (var i = 0; i < ln.length; i++) {
        if (/[／\/]/.test(ln[i]) && ln[i].length < 100) {
          nameLine = ln[i];
          break;
        }
      }
      if (!nameLine) continue;
      var parts = nameLine.split(/[／\/]/).map(function (x) {
        return x.trim();
      });
      var role = parts.length > 1 ? parts[0] : '';
      var name = parts.length > 1 ? parts[1] : nameLine;
      var rest = ln
        .filter(function (l) {
          return l !== nameLine;
        })
        .join('\n')
        .trim();
      var quoteM = rest.match(/「([^」]{2,200})」/);
      var quote = quoteM ? quoteM[0] : null;
      var desc = quote ? rest.replace(quote, '').trim() : rest;
      staff.push({
        role: role.slice(0, 80),
        name: name.slice(0, 80),
        desc: desc.slice(0, 800),
        quote: quote,
      });
      if (staff.length >= 5) break;
    }
    return staff;
  }

  function emptySalonData() {
    return {
      name: null,
      brandSubtitle: null,
      heroLabel: null,
      heroCatch: null,
      heroSubtitle: null,
      shopTitle: null,
      rating: null,
      reviewCount: null,
      introduction: null,
      conceptTitle: null,
      conceptBody: null,
      policySectionTitle: null,
      salonMessage: null,
      address: null,
      access: null,
      avgReservation: null,
      genderRatio: null,
      ageRatio: null,
      footerTagline: null,
      reserveNote: null,
      policies: [],
      coupons: [],
      atmosphere: [],
      staff: [],
      faq: [],
      gallery: [],
    };
  }

  function parseHotPepperText(raw) {
    var salon = emptySalonData();
    safe(function () {
      var t = normalizeText(raw);
      var lines = linesOf(t);

      salon.name = extractSalonNameParenLine(lines) || null;
      salon.shopTitle = extractShopTitleLine(lines) || null;

      var rr = extractRatingAndReviews(t);
      salon.rating = rr.rating;
      salon.reviewCount = rr.reviewCount;

      salon.heroLabel = extractHeroishLine(lines) || null;

      var paras = extractParagraphs(t);
      if (paras[0]) salon.introduction = paras[0].slice(0, 2500);
      if (paras[1]) salon.heroSubtitle = paras[1].slice(0, 800);
      if (paras[2]) salon.conceptBody = paras[2].slice(0, 2500);
      if (paras[0] && paras[0].length > 20 && paras[0].length < 120) salon.heroCatch = paras[0];

      var addr = extractAddressLine(lines, t);
      salon.address = addr;
      salon.access = extractAccessBlock(lines, addr);

      var ratios = extractRatios(t);
      salon.avgReservation = ratios.avgReservation;
      salon.genderRatio = ratios.genderRatio;
      salon.ageRatio = ratios.ageRatio;

      salon.salonMessage = extractSalonMessage(t);
      var atm = extractAtmosphere(t);
      if (atm.length) salon.atmosphere = atm;

      var pol = extractKodawari(t);
      if (pol.length) {
        salon.policies = pol;
        salon.policySectionTitle = 'こだわり';
      }

      var cps = extractCoupons(t);
      if (cps.length) salon.coupons = cps;

      var st = extractStaffBlocks(t);
      if (st.length) salon.staff = st;
    }, null);

    return { salon: salon };
  }

  g.BeautyHpbEditor.emptySalonData = emptySalonData;
  g.BeautyHpbEditor.parseHotPepperText = parseHotPepperText;
})(typeof window !== 'undefined' ? window : globalThis);
