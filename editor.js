/**
 * editor.js — 抽出結果をフォームへ反映し、編集・再描画を管理
 */

import { renderLP } from './renderer.js';

let currentSalon = null;
let previewContainer = null;

export function initEditor(previewEl) {
  previewContainer = previewEl;
}

export function loadIntoEditor(salon) {
  currentSalon = JSON.parse(JSON.stringify(salon)); // deep copy
  renderForm(currentSalon);
  renderLP(currentSalon, previewContainer);
}

export function getCurrentSalon() {
  return currentSalon;
}

// ---- フォーム描画 ----

function renderForm(salon) {
  const form = document.getElementById('editor-form');
  if (!form) return;
  form.innerHTML = '';

  // 基本情報
  addGroup(form, '基本情報', [
    field('text', 'name', '店名', salon.name),
    field('text', 'title', 'タイトル', salon.title),
    field('text', 'rating', '評価', salon.rating ?? ''),
    field('text', 'reviewCount', '口コミ件数', salon.reviewCount ?? ''),
    field('text', 'address', '住所', salon.address),
    field('text', 'accessShort', 'アクセス（短縮）', salon.accessShort),
    field('textarea', 'accessFull', 'アクセス（詳細）', salon.accessFull),
    field('textarea', 'heroCatch', 'キャッチコピー', salon.heroCatch),
    field('textarea', 'introText', '紹介文', salon.introText),
    field('text', 'homepageUrl', '公式サイトURL', salon.homepageUrl),
  ]);

  // 店舗データ
  addGroup(form, '店舗データ', [
    field('text', 'openingHours', '営業時間', salon.openingHours),
    field('text', 'closedDays', '定休日', salon.closedDays),
    field('text', 'paymentMethods', '支払い方法', salon.paymentMethods),
    field('text', 'seatCount', '席数', salon.seatCount),
    field('text', 'staffCount', 'スタッフ数', salon.staffCount),
    field('text', 'parking', '駐車場', salon.parking),
    field('text', 'cutPrice', 'カット価格', salon.cutPrice),
  ]);

  // メッセージ
  addGroup(form, 'サロンからの一言', [
    field('text', 'messageTitle', 'タイトル', salon.messageTitle),
    field('textarea', 'messageText', 'メッセージ', salon.messageText),
  ]);

  // こだわり（配列）
  addArrayGroup(form, 'features', 'こだわり', salon.features,
    item => [
      field('text', 'title', 'タイトル', item.title),
      field('textarea', 'text', 'テキスト', item.text),
    ],
    () => ({ title: '', text: '' })
  );

  // 雰囲気（配列 of string）
  addStringArrayGroup(form, 'atmosphere', 'サロンの雰囲気', salon.atmosphere);

  // クーポン（配列）
  addArrayGroup(form, 'coupons', 'クーポン', salon.coupons,
    item => [
      field('select', 'type', '種別', item.type, ['新規', '再来', '全員']),
      field('text', 'priceStr', '価格表示', item.priceStr || ''),
      field('text', 'title', 'クーポン名', item.title),
    ],
    () => ({ type: '新規', priceStr: '', price: 0, title: '', categories: [] })
  );

  // スタッフ（配列）
  addArrayGroup(form, 'staff', 'スタイリスト', salon.staff,
    item => [
      field('text', 'name', '名前', item.name),
      field('text', 'specialty', '専門', item.specialty),
      field('text', 'experience', '経験', item.experience),
      field('text', 'catch', 'キャッチ', item.catch),
    ],
    () => ({ name: '', specialty: '', experience: '', catch: '' })
  );
}

// ---- フォームヘルパー ----

function field(type, key, label, value, options = []) {
  return { type, key, label, value: value ?? '', options };
}

function addGroup(form, title, fields) {
  const g = document.createElement('div');
  g.className = 'editor-group';
  g.innerHTML = `<div class="editor-group-title">${title}</div>`;

  fields.forEach(f => {
    const row = document.createElement('div');
    row.className = 'editor-row';
    row.innerHTML = `<label class="editor-label">${f.label}</label>`;

    let input;
    if (f.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'editor-input editor-textarea';
      input.value = f.value;
    } else if (f.type === 'select') {
      input = document.createElement('select');
      input.className = 'editor-input editor-select';
      f.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        if (o === f.value) opt.selected = true;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'editor-input';
      input.value = f.value;
    }

    input.dataset.key = f.key;
    input.addEventListener('input', () => {
      currentSalon[f.key] = input.value;
      renderLP(currentSalon, previewContainer);
    });

    row.appendChild(input);
    g.appendChild(row);
  });

  form.appendChild(g);
}

function addStringArrayGroup(form, arrayKey, title, arr) {
  const g = document.createElement('div');
  g.className = 'editor-group editor-array-group';
  g.dataset.array = arrayKey;

  const titleEl = document.createElement('div');
  titleEl.className = 'editor-group-title';
  titleEl.innerHTML = `${title} <button class="btn-add-item" data-array="${arrayKey}">＋ 追加</button>`;
  g.appendChild(titleEl);

  const list = document.createElement('div');
  list.className = 'array-list';
  list.id = `array-list-${arrayKey}`;
  g.appendChild(list);

  form.appendChild(g);
  renderStringArray(arrayKey, arr, list);

  g.querySelector('.btn-add-item').addEventListener('click', () => {
    if (!currentSalon[arrayKey]) currentSalon[arrayKey] = [];
    currentSalon[arrayKey].push('');
    renderStringArray(arrayKey, currentSalon[arrayKey], list);
    renderLP(currentSalon, previewContainer);
  });
}

function renderStringArray(arrayKey, arr, list) {
  list.innerHTML = '';
  (arr || []).forEach((val, idx) => {
    const row = document.createElement('div');
    row.className = 'array-item';
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'editor-input'; input.value = val;
    input.addEventListener('input', () => {
      currentSalon[arrayKey][idx] = input.value;
      renderLP(currentSalon, previewContainer);
    });
    const del = document.createElement('button');
    del.className = 'btn-del-item'; del.textContent = '✕';
    del.addEventListener('click', () => {
      currentSalon[arrayKey].splice(idx, 1);
      renderStringArray(arrayKey, currentSalon[arrayKey], list);
      renderLP(currentSalon, previewContainer);
    });
    row.appendChild(input); row.appendChild(del);
    list.appendChild(row);
  });
}

function addArrayGroup(form, arrayKey, title, arr, fieldsFn, newItemFn) {
  const g = document.createElement('div');
  g.className = 'editor-group editor-array-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'editor-group-title';
  titleEl.innerHTML = `${title} <button class="btn-add-item" data-array="${arrayKey}">＋ 追加</button>`;
  g.appendChild(titleEl);

  const list = document.createElement('div');
  list.className = 'array-list';
  list.id = `array-list-${arrayKey}`;
  g.appendChild(list);

  form.appendChild(g);
  renderObjectArray(arrayKey, arr, list, fieldsFn);

  g.querySelector('.btn-add-item').addEventListener('click', () => {
    if (!currentSalon[arrayKey]) currentSalon[arrayKey] = [];
    currentSalon[arrayKey].push(newItemFn());
    renderObjectArray(arrayKey, currentSalon[arrayKey], list, fieldsFn);
    renderLP(currentSalon, previewContainer);
  });
}

function renderObjectArray(arrayKey, arr, list, fieldsFn) {
  list.innerHTML = '';
  (arr || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'array-card';

    const header = document.createElement('div');
    header.className = 'array-card-header';
    header.innerHTML = `<span>#${idx + 1}</span>`;
    const del = document.createElement('button');
    del.className = 'btn-del-item'; del.textContent = '削除';
    del.addEventListener('click', () => {
      arr.splice(idx, 1);
      renderObjectArray(arrayKey, arr, list, fieldsFn);
      renderLP(currentSalon, previewContainer);
    });
    header.appendChild(del);
    card.appendChild(header);

    fieldsFn(item).forEach(f => {
      const row = document.createElement('div');
      row.className = 'editor-row';
      row.innerHTML = `<label class="editor-label">${f.label}</label>`;

      let input;
      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'editor-input editor-textarea';
        input.value = f.value;
      } else if (f.type === 'select') {
        input = document.createElement('select');
        input.className = 'editor-input editor-select';
        f.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o; opt.textContent = o;
          if (o === f.value) opt.selected = true;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text'; input.className = 'editor-input';
        input.value = f.value;
      }

      input.addEventListener('input', () => {
        if (f.type === 'select') {
          item[f.key] = input.value;
        } else {
          item[f.key] = input.value;
        }
        renderLP(currentSalon, previewContainer);
      });

      row.appendChild(input);
      card.appendChild(row);
    });

    list.appendChild(card);
  });
}
