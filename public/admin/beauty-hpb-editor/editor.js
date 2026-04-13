/**
 * 編集フォーム生成・JSON 同期
 */
(function (g) {
  g.BeautyHpbEditor = g.BeautyHpbEditor || {};

  var SCALAR_FIELDS = [
    { path: 'name', label: '店名' },
    { path: 'brandSubtitle', label: 'ブランドサブタイトル' },
    { path: 'heroLabel', label: 'ヒーロー上ラベル' },
    { path: 'heroCatch', label: 'ヒーローキャッチ', rows: 3 },
    { path: 'heroSubtitle', label: 'ヒーローサブ', rows: 3 },
    { path: 'shopTitle', label: '店舗タイトル（HP見出し風）' },
    { path: 'rating', label: '評価' },
    { path: 'reviewCount', label: '口コミ件数' },
    { path: 'introduction', label: '店舗紹介文', rows: 5 },
    { path: 'conceptTitle', label: 'Concept 見出し' },
    { path: 'conceptBody', label: 'Concept 本文', rows: 5 },
    { path: 'policySectionTitle', label: 'こだわりセクション見出し' },
    { path: 'salonMessage', label: 'サロンからの一言', rows: 3 },
    { path: 'address', label: '住所', rows: 2 },
    { path: 'access', label: 'アクセス', rows: 3 },
    { path: 'avgReservation', label: '平均予約金額' },
    { path: 'genderRatio', label: '性別比率' },
    { path: 'ageRatio', label: '年代比率' },
    { path: 'footerTagline', label: 'フッタータグライン', rows: 2 },
    { path: 'reserveNote', label: '予約案内', rows: 3 },
  ];

  function setSalonValue(salon, path, value) {
    salon[path] = value === '' ? null : value;
  }

  function renderArrayEditor(container, data, key, fields, label, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'array-editor';
    var h = document.createElement('h4');
    h.textContent = label;
    wrap.appendChild(h);

    var listHost = document.createElement('div');
    listHost.className = 'array-editor-list';

    function rowEl(item, index) {
      var row = document.createElement('div');
      row.className = 'array-row';
      fields.forEach(function (f) {
        var lab = document.createElement('label');
        lab.textContent = f.label;
        var inp = f.rows
          ? (function () {
              var ta = document.createElement('textarea');
              ta.rows = f.rows;
              ta.value = item[f.key] || '';
              ta.addEventListener('input', function () {
                item[f.key] = ta.value.trim() === '' ? null : ta.value;
                onChange();
              });
              return ta;
            })()
          : (function () {
              var i = document.createElement('input');
              i.type = 'text';
              i.value = item[f.key] || '';
              i.addEventListener('input', function () {
                item[f.key] = i.value.trim() === '' ? null : i.value;
                onChange();
              });
              return i;
            })();
        lab.appendChild(inp);
        row.appendChild(lab);
      });
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'btn-row-remove';
      rm.textContent = 'この行を削除';
      rm.addEventListener('click', function () {
        data.salon[key].splice(index, 1);
        onChange();
        build();
      });
      row.appendChild(rm);
      return row;
    }

    function build() {
      listHost.innerHTML = '';
      var arr = data.salon[key] || [];
      arr.forEach(function (item, idx) {
        listHost.appendChild(rowEl(item, idx));
      });
    }

    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-row-add';
    addBtn.textContent = '行を追加';
    addBtn.addEventListener('click', function () {
      if (!data.salon[key]) data.salon[key] = [];
      var empty = {};
      fields.forEach(function (f) {
        empty[f.key] = null;
      });
      data.salon[key].push(empty);
      onChange();
      build();
    });

    wrap.appendChild(listHost);
    wrap.appendChild(addBtn);
    build();
    container.appendChild(wrap);
  }

  function mountEditor(container, data, onChange) {
    if (!container || !data || !data.salon) return;
    container.innerHTML = '';
    var salon = data.salon;

    SCALAR_FIELDS.forEach(function (f) {
      var lab = document.createElement('label');
      lab.className = 'field';
      var span = document.createElement('span');
      span.className = 'field-label';
      span.textContent = f.label;
      lab.appendChild(span);
      var inp;
      if (f.rows) {
        inp = document.createElement('textarea');
        inp.rows = f.rows;
        inp.value = salon[f.path] || '';
        inp.addEventListener('input', function () {
          setSalonValue(salon, f.path, inp.value);
          onChange();
        });
      } else {
        inp = document.createElement('input');
        inp.type = 'text';
        inp.value = salon[f.path] || '';
        inp.addEventListener('input', function () {
          setSalonValue(salon, f.path, inp.value);
          onChange();
        });
      }
      lab.appendChild(inp);
      container.appendChild(lab);
    });

    renderArrayEditor(
      container,
      data,
      'policies',
      [
        { key: 'title', label: '見出し' },
        { key: 'body', label: '本文', rows: 3 },
      ],
      'こだわり（ポリシー）',
      onChange,
    );

    renderArrayEditor(
      container,
      data,
      'coupons',
      [
        { key: 'title', label: 'タイトル' },
        { key: 'price', label: '価格' },
        { key: 'body', label: '説明', rows: 2 },
      ],
      'クーポン',
      onChange,
    );

    renderArrayEditor(
      container,
      data,
      'atmosphere',
      [
        { key: 'title', label: 'タイトル' },
        { key: 'body', label: '説明', rows: 3 },
      ],
      '雰囲気',
      onChange,
    );

    renderArrayEditor(
      container,
      data,
      'staff',
      [
        { key: 'role', label: '役職' },
        { key: 'name', label: '名前' },
        { key: 'desc', label: '紹介', rows: 3 },
        { key: 'quote', label: '一言', rows: 2 },
      ],
      'スタッフ',
      onChange,
    );

    renderArrayEditor(
      container,
      data,
      'faq',
      [
        { key: 'q', label: '質問', rows: 2 },
        { key: 'a', label: '回答', rows: 3 },
      ],
      'FAQ',
      onChange,
    );

    renderArrayEditor(
      container,
      data,
      'gallery',
      [
        { key: 'caption', label: 'キャプション' },
        { key: 'imageUrl', label: '画像URL' },
      ],
      'ギャラリー',
      onChange,
    );
  }

  g.BeautyHpbEditor.mountEditor = mountEditor;
})(typeof window !== 'undefined' ? window : globalThis);
