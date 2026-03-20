/**
 * LP埋め込み用「料金・お支払い」フォームのHTMLを生成。
 * iframe で読み込み、オプションON/OFF・金額算出・支払い確定でStripeへ遷移する。
 */

import { getPlanOptions, getRemovalOptions, getAddonOptions, getOtherServiceOptions } from './price.js';

function escapeHtml(s) {
  if (s == null) return '';
  const t = String(s);
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} [returnUrl] - 決済後の戻り先URL（LPのURL）
 * @returns {string} HTML
 */
export function renderLpPaymentForm(returnUrl = '') {
  const plans = getPlanOptions();
  const removals = getRemovalOptions();
  const addons = getAddonOptions();
  const other = getOtherServiceOptions();

  const planRadios = plans
    .map(
      (p) =>
        `<label class="lp-pay-plan"><input type="radio" name="plan" value="${escapeHtml(p.id)}" ${p.id === 'normal' ? 'checked' : ''}> ${escapeHtml(p.name)}（${p.yen.toLocaleString()}円）</label>`
    )
    .join('');

  const removalChecks = Object.entries(removals)
    .filter(([k]) => k !== 'languageRemovalPer')
    .map(
      ([key, v]) =>
        `<label class="lp-pay-opt"><input type="checkbox" name="${escapeHtml(key)}"> ${escapeHtml(v.name)}（${v.yen < 0 ? '▲' : '+'}${Math.abs(v.yen).toLocaleString()}円）</label>`
    )
    .join('');

  const addonChecks = Object.entries(addons).map(
    ([key, v]) =>
      `<label class="lp-pay-opt"><input type="checkbox" name="${escapeHtml(key)}"> ${escapeHtml(v.name)}（+${v.yen.toLocaleString()}円）</label>`
  ).join('');

  const otherBlocks = Object.entries(other)
    .map(([key, v]) => {
      if (v.yenPerYear != null) {
        const maxY = v.maxYears ?? 10;
        return `<label class="lp-pay-opt">${escapeHtml(v.name)}（1年 +${v.yenPerYear.toLocaleString()}円）${
          v.note ? ' <span style="color:#666;font-size:0.85rem">' + escapeHtml(v.note) + '</span>' : ''
        }　年数: <input type="number" name="customDomainYears" min="0" max="${maxY}" value="0" style="width:3rem"></label>`;
      }
      return `<label class="lp-pay-opt"><input type="checkbox" name="${escapeHtml(key)}"> ${escapeHtml(v.name)}（+${v.yen.toLocaleString()}円）</label>${
        v.note ? ' <span style="color:#666;font-size:0.85rem">' + escapeHtml(v.note) + '</span>' : ''
      }`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>料金・お支払い</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: "Hiragino Sans","Noto Sans JP",sans-serif; margin: 0; padding: 1rem; font-size: 14px; color: #333; background: #f8f8f8; }
    .lp-pay-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.75rem; }
    .lp-pay-section { margin-bottom: 1.25rem; }
    .lp-pay-plan, .lp-pay-opt { display: block; margin: 0.35rem 0; cursor: pointer; }
    .lp-pay-plan input, .lp-pay-opt input { margin-right: 0.5rem; }
    .lp-pay-price { margin: 1rem 0; padding: 0.75rem; background: #fff; border-radius: 8px; border: 1px solid #ddd; }
    .lp-pay-total { font-weight: 700; font-size: 1.1rem; }
    .lp-pay-btn { margin-top: 0.5rem; padding: 0.6rem 1rem; font-size: 0.9rem; cursor: pointer; background: #333; color: #fff; border: none; border-radius: 6px; }
    .lp-pay-btn.primary { background: #0d6efd; padding: 0.75rem 1.5rem; font-weight: 600; }
    .lp-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .lp-pay-err { color: #c00; font-size: 0.875rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="lp-pay-form">
    <p class="lp-pay-title">料金・お支払い</p>
    <p style="margin:0 0 0.75rem;font-size:0.85rem;color:#666;">プランとオプションを選び、合計確認後に支払いを確定してください。</p>

    <div class="lp-pay-section">
      <strong>プラン</strong>
      <div>${planRadios}</div>
    </div>
    <div class="lp-pay-section">
      <strong>削除オプション（値引き）</strong>
      <div>${removalChecks}</div>
      <label class="lp-pay-opt">言語の削除（1つ ▲2,000円） <input type="number" name="languageRemovalCount" min="0" max="10" value="0" style="width:3rem"></label>
    </div>
    <div class="lp-pay-section">
      <strong>追加オプション</strong>
      <div>${addonChecks}</div>
    </div>
    <div class="lp-pay-section">
      <strong>紹介コード（任意）</strong>
      <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#666;">お渡ししたコードを入力すると、有効な場合は<strong>通常／学割の基本料金のみ無料</strong>になります（オプションは別途）。コードはお客様ごとに異なります。</p>
      <input type="text" name="referralCode" placeholder="コードを入力" autocomplete="off" style="width:100%;max-width:280px;padding:0.35rem 0.5rem;border:1px solid #ccc;border-radius:6px;">
    </div>
    <div class="lp-pay-section">
      <strong>その他サービス</strong>
      <div>${otherBlocks}</div>
    </div>

    <button type="button" class="lp-pay-btn" id="lp-pay-recalc">料金を再計算</button>
    <div class="lp-pay-price" id="lp-pay-result" style="display:none;">
      <ul id="lp-pay-items" style="margin:0;padding-left:1.2rem;"></ul>
      <p class="lp-pay-total" id="lp-pay-total"></p>
    </div>
    <p class="lp-pay-err" id="lp-pay-err"></p>
    <button type="button" class="lp-pay-btn primary" id="lp-pay-submit" disabled>支払いを確定する</button>
  </div>

  <script>
(function(){
  var returnUrl = ${JSON.stringify(returnUrl || '')};
  var form = document.querySelector('.lp-pay-form');
  var resultEl = document.getElementById('lp-pay-result');
  var itemsEl = document.getElementById('lp-pay-items');
  var totalEl = document.getElementById('lp-pay-total');
  var errEl = document.getElementById('lp-pay-err');
  var submitBtn = document.getElementById('lp-pay-submit');
  var lastAmount = -1;

  function getBilling() {
    var b = { plan: (form.querySelector('input[name="plan"]:checked') || {}).value || 'normal' };
    var refIn = form.querySelector('input[name="referralCode"]');
    if (refIn) b.referralCode = String(refIn.value || '').trim();
    ['contactFormRemoval','snsFeedRemoval','mapRemoval','presentedByRemoval','customQrCode','webCoupon','storeOfficialSubdomain','cms','onlinePayment','fullCustom','seoMeo','bookingSystem'].forEach(function(k){
      var el = form.querySelector('input[name="' + k + '"]');
      if (el) b[k] = el.type === 'checkbox' ? el.checked : (parseInt(el.value,10)||0);
    });
    var lang = form.querySelector('input[name="languageRemovalCount"]');
    if (lang) b.languageRemovalCount = Math.max(0, parseInt(lang.value,10)||0);
    var cy = form.querySelector('input[name="customDomainYears"]');
    if (cy) b.customDomainYears = Math.max(0, Math.min(10, parseInt(cy.value,10)||0));
    return b;
  }

  function recalc() {
    errEl.textContent = '';
    errEl.style.color = '#c00';
    fetch('/api/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getBilling())
    }).then(function(r){ return r.json(); }).then(function(data){
      resultEl.style.display = 'block';
      itemsEl.innerHTML = (data.items || []).map(function(i){
        return '<li>' + (i.yen >= 0 ? i.yen.toLocaleString() : '▲' + (-i.yen).toLocaleString()) + '円 — ' + i.name + '</li>';
      }).join('');
      lastAmount = typeof data.amountYen === 'number' ? data.amountYen : 0;
      totalEl.textContent = '合計: ' + lastAmount.toLocaleString() + '円';
      submitBtn.disabled = false;
      submitBtn.textContent = lastAmount <= 0 ? '決済不要の案内を表示' : '支払いを確定する';
    }).catch(function(e){
      errEl.textContent = '料金の取得に失敗しました。';
      submitBtn.disabled = true;
      lastAmount = -1;
    });
  }

  document.getElementById('lp-pay-recalc').addEventListener('click', recalc);
  form.addEventListener('change', recalc);
  form.addEventListener('input', recalc);

  submitBtn.addEventListener('click', function(){
    if (submitBtn.disabled) return;
    if (lastAmount <= 0) {
      errEl.style.color = '#0f766e';
      errEl.textContent = 'この内容ではオンライン決済は不要です。お手続き・紹介コードのご案内は、運営よりメールまたはLINEで行います。';
      return;
    }
    submitBtn.disabled = true;
    errEl.textContent = '';
    errEl.style.color = '#c00';
    var successUrl = (returnUrl && returnUrl.indexOf('?') >= 0 ? returnUrl + '&' : returnUrl + '?') + 'payment=success';
    var cancelUrl = returnUrl || (typeof window !== 'undefined' && window.top && window.top.location ? window.top.location.href : '');
    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billing: getBilling(), successUrl: successUrl, cancelUrl: cancelUrl })
    }).then(function(r){ return r.json(); }).then(function(data){
      if (data.free) {
        errEl.style.color = '#0f766e';
        errEl.textContent = data.message || 'この内容ではオンライン決済は不要です。運営よりご連絡します。';
        submitBtn.disabled = false;
        return;
      }
      if (data.url) {
        if (window.top && window.top.location) window.top.location.href = data.url;
        else window.location.href = data.url;
      } else {
        errEl.textContent = data.error || '決済の開始に失敗しました。';
        submitBtn.disabled = false;
      }
    }).catch(function(e){
      errEl.textContent = '決済の開始に失敗しました。';
      submitBtn.disabled = false;
    });
  });

  recalc();
})();
  </script>
</body>
</html>`;
}
