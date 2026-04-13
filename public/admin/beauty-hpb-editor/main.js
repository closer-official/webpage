/**
 * 美容室 HPB エディタ — UI 配線（file:// でも動くようサンプル JSON は同梱）
 */
(function () {
  var BH = window.BeautyHpbEditor;
  if (!BH) return;

  /** fetch 失敗時（file:// 等）に使う sample-extracted.json 相当 */
  var FALLBACK_SAMPLE_DATA = {
    salon: {
      name: 'サンプルサロン 渋谷',
      brandSubtitle: 'SHIBUYA HAIR SALON',
      heroLabel: '当日予約OK・駅近',
      heroCatch: '似合わせカットが得意な\nプライベートサロン',
      heroSubtitle: 'ショート・ボブを中心に、\n再現しやすいスタイルをご提案します。',
      shopTitle: '【渋谷】カットが得意なサロン',
      rating: '4.8',
      reviewCount: '127',
      introduction: '一人ひとりの骨格とライフスタイルに合わせた提案を大切にしています。',
      conceptTitle: '自分らしい、ちょうどよい変化を。',
      conceptBody: '大きく変えるのではなく、日常に自然となじむ形で「ちょっと気分が上がる」ヘアを目指しています。',
      policySectionTitle: 'サロンのこだわり',
      salonMessage: 'はじめての方もお気軽にご相談ください。',
      address: '〒150-0002 東京都渋谷区渋谷1-1-1 サンプルビル 2F',
      access: '渋谷駅 徒歩3分\nA8出口を出て直進',
      avgReservation: '¥8,500',
      genderRatio: '女性 85% / 男性 15%',
      ageRatio: '20代 30% / 30代 40% / その他 30%',
      footerTagline: '渋谷で、あなたに似合うスタイルを。',
      reserveNote: 'ホットペッパービューティーから24時間予約可能です。',
      policies: [
        { title: '骨格に合わせたカット', body: '顔の形と髪の流れを見ながら、自宅でも再現しやすいラインを意識します。' },
        { title: 'ダメージレスカラー', body: '明るさと艶のバランスを調整し、透明感のある仕上がりを目指します。' },
      ],
      coupons: [
        { title: '【新規】カット + トリートメント', price: '¥5,500', body: '初回限定。くせ毛ケア込み。' },
        { title: '【全員】リタッチカラー', price: '¥6,600', body: '根元のリタッチに。' },
      ],
      atmosphere: [{ title: '落ち着いた照明', body: '白を基調にした、リラックスできる空間です。' }],
      staff: [
        {
          role: 'TOP STYLIST',
          name: '山田 花子',
          desc: 'ボブ・ショートが得意です。',
          quote: '「似合う」を一緒に見つけましょう。',
        },
      ],
      faq: [{ q: '初回は何分前に伺えばよいですか？', a: 'ご予約の5分前にお越しください。' }],
      gallery: [{ caption: 'セット面', imageUrl: '' }],
    },
  };

  var ta = document.getElementById('hpb-raw');
  var editorMount = document.getElementById('editor-mount');
  var previewRoot = document.getElementById('preview-root');
  var jsonDialog = document.getElementById('json-dialog');
  var jsonPre = document.getElementById('json-pre');

  var state = { data: { salon: BH.emptySalonData() } };

  function mergeSalonDefaults(s) {
    var e = BH.emptySalonData();
    Object.keys(e).forEach(function (k) {
      if (s[k] === undefined) s[k] = e[k];
    });
    return s;
  }

  function setDataFromParsed(parsed) {
    if (!parsed || !parsed.salon) return;
    mergeSalonDefaults(parsed.salon);
    state.data = parsed;
  }

  function rebuildEditor() {
    BH.mountEditor(editorMount, state.data, function () {
      BH.refreshPreview(previewRoot, state.data);
    });
    BH.refreshPreview(previewRoot, state.data);
  }

  function parseAction() {
    var raw = ta ? ta.value : '';
    var parsed = BH.parseHotPepperText(raw);
    setDataFromParsed(parsed);
    rebuildEditor();
  }

  function resetAction() {
    state.data = { salon: BH.emptySalonData() };
    if (ta) ta.value = '';
    rebuildEditor();
  }

  function sampleTextAction() {
    if (ta && BH.SAMPLE_HP_TEXT) ta.value = BH.SAMPLE_HP_TEXT;
  }

  function applySampleDataObject(obj) {
    if (!obj || !obj.salon) return;
    state.data = BH.deepClone(obj);
    mergeSalonDefaults(state.data.salon);
    rebuildEditor();
  }

  function sampleJsonAction() {
    var url = 'sample-extracted.json';
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(applySampleDataObject)
      .catch(function () {
        applySampleDataObject(FALLBACK_SAMPLE_DATA);
      });
  }

  function jsonViewAction() {
    if (!jsonPre || !jsonDialog) return;
    jsonPre.textContent = JSON.stringify(state.data, null, 2);
    jsonDialog.hidden = false;
  }

  function jsonCloseAction() {
    if (jsonDialog) jsonDialog.hidden = true;
  }

  function htmlExportAction() {
    if (!previewRoot) return;
    var styleEl = document.getElementById('preview-embed-style');
    var wrap = document.createElement('div');
    wrap.innerHTML = previewRoot.innerHTML;
    var html =
      '<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n<title>salon-preview</title>\n';
    if (styleEl && styleEl.textContent) {
      html += '<style>\n' + styleEl.textContent + '\n</style>\n';
    }
    html += '</head>\n<body>\n' + wrap.innerHTML + '\n</body>\n</html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'salon-preview.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function wire(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  wire('btn-parse', parseAction);
  wire('btn-sample-text', sampleTextAction);
  wire('btn-sample-json', sampleJsonAction);
  wire('btn-json', jsonViewAction);
  wire('btn-json-close', jsonCloseAction);
  wire('btn-reset', resetAction);
  wire('btn-html', htmlExportAction);

  if (jsonDialog) {
    jsonDialog.addEventListener('click', function (ev) {
      if (ev.target === jsonDialog) jsonCloseAction();
    });
  }

  rebuildEditor();
})();
