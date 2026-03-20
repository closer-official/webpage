export function renderCustomerIntakePage() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ヒアリングフォーム | CLOSER</title>
  <style>
    :root { --bg:#f8fafc; --card:#fff; --text:#0f172a; --sub:#475569; --line:#cbd5e1; --accent:#0f766e; --btn:#0d6efd; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font-family:"Hiragino Sans","Noto Sans JP",sans-serif; }
    .wrap { max-width: 860px; margin: 0 auto; padding: 20px 14px 48px; }
    .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; box-shadow:0 10px 25px rgba(15,23,42,.05); }
    h1 { margin:0 0 8px; font-size:1.35rem; }
    .lead { margin:0 0 16px; color:var(--sub); line-height:1.7; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    .full { grid-column: 1 / -1; }
    label { font-size:.9rem; font-weight:700; display:block; margin:0 0 6px; }
    input, select, textarea { width:100%; border:1px solid var(--line); border-radius:8px; padding:10px 11px; font-size:14px; }
    textarea { min-height:100px; resize:vertical; }
    .note { margin-top:10px; color:var(--sub); font-size:.84rem; line-height:1.6; }
    .actions { margin-top:16px; display:flex; gap:10px; align-items:center; }
    button { border:none; background:var(--btn); color:#fff; border-radius:8px; padding:10px 16px; font-weight:700; cursor:pointer; }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .msg { font-size:.9rem; color:var(--accent); }
    .err { color:#b91c1c; font-size:.9rem; }
    @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>制作前ヒアリングフォーム</h1>
      <p class="lead">ご依頼内容を確認するための入力フォームです。送信後、運営側で確認し、メールまたはLINEでご連絡します。</p>

      <form id="intake-form" novalidate>
        <div class="grid">
          <div>
            <label for="storeName">店舗名 / 事業名 *</label>
            <input id="storeName" name="storeName" required maxlength="120" />
          </div>
          <div>
            <label for="contactName">ご担当者名 *</label>
            <input id="contactName" name="contactName" required maxlength="80" />
          </div>
          <div>
            <label for="contactMethod">主な連絡方法 *</label>
            <select id="contactMethod" name="contactMethod" required>
              <option value="">選択してください</option>
              <option value="email">メール</option>
              <option value="line">LINE</option>
              <option value="phone">電話</option>
            </select>
          </div>
          <div>
            <label for="contactValue">連絡先（メールアドレス/LINE ID/電話番号） *</label>
            <input id="contactValue" name="contactValue" required maxlength="160" />
          </div>
          <div>
            <label for="plan">希望プラン *</label>
            <select id="plan" name="plan" required>
              <option value="">選択してください</option>
              <option value="normal">通常プラン</option>
              <option value="student">学割プラン</option>
            </select>
          </div>
          <div>
            <label for="referralCode">紹介コード（任意）</label>
            <input id="referralCode" name="referralCode" maxlength="200" placeholder="お持ちの場合のみ入力" />
          </div>
          <div class="full">
            <label for="requestSummary">ご要望・掲載したい内容 *</label>
            <textarea id="requestSummary" name="requestSummary" required maxlength="5000" placeholder="例）ターゲット、雰囲気、掲載したいメニュー、営業時間、住所、予約導線など"></textarea>
          </div>
          <div class="full">
            <label for="references">参考サイト / SNS（任意）</label>
            <textarea id="references" name="references" maxlength="5000" placeholder="URLを改行で入力"></textarea>
          </div>
        </div>
        <p class="note">※ 送信内容は制作の事前確認にのみ利用します。紹介コードの判定は運営側で行います。</p>
        <div class="actions">
          <button id="submit-btn" type="submit">ヒアリングを送信</button>
          <span id="ok" class="msg"></span>
          <span id="ng" class="err"></span>
        </div>
      </form>
    </div>
  </div>

  <script>
    (function () {
      var form = document.getElementById('intake-form');
      var btn = document.getElementById('submit-btn');
      var ok = document.getElementById('ok');
      var ng = document.getElementById('ng');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        ok.textContent = '';
        ng.textContent = '';
        if (!form.reportValidity()) return;
        btn.disabled = true;

        var payload = {
          storeName: form.storeName.value.trim(),
          contactName: form.contactName.value.trim(),
          contactMethod: form.contactMethod.value,
          contactValue: form.contactValue.value.trim(),
          plan: form.plan.value,
          referralCode: form.referralCode.value.trim(),
          requestSummary: form.requestSummary.value.trim(),
          references: form.references.value.trim(),
          pageUrl: window.location.href
        };

        fetch('/api/customer-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.ok) {
              ok.textContent = '送信ありがとうございます。確認後、メールまたはLINEでご連絡します。';
              form.reset();
            } else {
              ng.textContent = (data && data.error) ? data.error : '送信に失敗しました。';
            }
          }).catch(function () {
            ng.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
          }).finally(function () {
            btn.disabled = false;
          });
      });
    })();
  </script>
</body>
</html>`;
}
