import { TEMPLATE_CANDIDATES } from './templatePreview.js';
import { publicLangBarHtml, publicLangBarStyles, publicLangToggleInlineScript } from './publicLangAssets.js';

export function renderCustomerIntakePage(candidates = TEMPLATE_CANDIDATES) {
  const list = Array.isArray(candidates) && candidates.length ? candidates : TEMPLATE_CANDIDATES;
  const templateCards = list
    .map(
      (t) => `<label class="style-card">
      <div class="style-card-preview" aria-hidden="true">
        <iframe src="/api/template-preview/${t.id}" title="${String(t.name).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}" loading="lazy"></iframe>
      </div>
      <div class="style-card-meta">
        <div><input type="radio" name="intakePickTemplate" value="${t.id}"><span class="ttl" data-i18n="intake.tpl.${t.id}">${t.name}</span></div>
        <p class="sub" data-i18n="intake.tpl.sub">枠内はスクロールして全体を確認できます。テンプレの選択は下のラジオから。別タブで全画面も開けます。</p>
        <a href="/api/template-preview/${t.id}" target="_blank" rel="noopener noreferrer"><span data-i18n="intake.tpl.preview">別タブで全画面</span></a>
      </div>
    </label>`,
    )
    .join('');
  const bespokeCard = `<label class="style-card style-card-bespoke">
      <div class="style-card-bespoke-visual" aria-hidden="true">
        <span data-i18n="intake.bespoke.badge">参考テンプレなし<br />フルオーダーメイド</span>
      </div>
      <div class="style-card-meta">
        <div><input type="radio" name="intakePickTemplate" value="intake_bespoke"><span class="ttl" data-i18n="intake.bespoke.title">テンプレに当てはまらない・1から製作</span></div>
        <p class="sub" data-i18n="intake.bespoke.sub">イメージに合うテンプレがない場合はこちら。参考URLやご要望に沿って構成します。</p>
      </div>
    </label>`;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ヒアリングフォーム | Tadanosuke Closer</title>
  <style>
    :root {
      --bg-base: #f2f0eb;
      --bg-card: #ebe9e4;
      --text: #3d3935;
      --text-muted: #6b6560;
      --terracotta: #b8956f;
      --terracotta-soft: #d4c4b0;
      --sage: #8b9a7a;
      --sage-soft: #a8b498;
      --border: #ddd9d2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg-base);
      color: var(--text);
      font-family: "Noto Sans JP", "Hiragino Sans", sans-serif;
      line-height: 1.8;
    }
    .wrap { max-width: 860px; margin: 0 auto; padding: 72px 14px 72px; }
    .brand { margin-bottom: 18px; color: var(--text-muted); font-size: .84rem; letter-spacing: .06em; text-transform: uppercase; }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 20px rgba(107, 101, 96, .08);
    }
    h1 {
      margin: 0 0 10px;
      font-size: 1.55rem;
      line-height: 1.45;
      font-family: "Noto Serif JP", "Hiragino Mincho ProN", serif;
      font-weight: 600;
      letter-spacing: .02em;
    }
    .lead { margin: 0 0 18px; color: var(--text-muted); }
    .micro-copy {
      margin: 0 0 20px;
      padding-left: 10px;
      border-left: 3px solid var(--terracotta-soft);
      color: var(--text-muted);
      font-size: .92rem;
    }
    .section-title {
      margin: 26px 0 10px;
      font-family: "Noto Serif JP", "Hiragino Mincho ProN", serif;
      font-size: 1.08rem;
      font-weight: 600;
    }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
    .full { grid-column: 1 / -1; }
    label { font-size:.9rem; font-weight:700; display:block; margin:0 0 6px; color: var(--text); }
    input, select, textarea {
      width: 100%;
      border: 1px solid var(--border);
      background: var(--bg-base);
      color: var(--text);
      border-radius: 10px;
      padding: 10px 11px;
      font-size: 14px;
      font-family: "Noto Sans JP", "Hiragino Sans", sans-serif;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--terracotta);
      box-shadow: 0 0 0 3px rgba(184, 149, 111, .22);
    }
    textarea { min-height:120px; resize:vertical; }
    .note {
      margin-top: 12px;
      color: var(--text-muted);
      font-size: .86rem;
      line-height: 1.8;
    }
    .actions {
      margin-top: 18px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    button {
      border: none;
      background: var(--terracotta);
      color: var(--bg-base);
      border-radius: 999px;
      padding: 11px 18px;
      font-weight: 700;
      cursor: pointer;
      transition: transform .2s ease, opacity .2s ease;
    }
    button:hover { transform: translateY(-1px); }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .msg { font-size:.9rem; color:var(--sage); }
    .err { color:#8f4f48; font-size:.9rem; }
    .footer-link { margin-top: 20px; font-size: .88rem; color: var(--text-muted); }
    .footer-link a { color: var(--sage); text-underline-offset: 2px; }
    .chips { display:flex; flex-wrap: wrap; gap:8px; }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 7px 12px;
      background: var(--bg-base);
      color: var(--text);
      cursor: pointer;
      font-size: .9rem;
    }
    .chip input { width: auto; margin: 0; accent-color: var(--terracotta); }
    .style-cards {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .style-card {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px;
      background: var(--bg-base);
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }
    .style-card-preview {
      height: 200px;
      overflow: hidden;
      border-radius: 10px;
      margin-bottom: 10px;
      border: 1px solid var(--border);
      background: #fff;
      position: relative;
      touch-action: manipulation;
    }
    .style-card-preview iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 390px;
      height: 720px;
      border: 0;
      transform: scale(0.5);
      transform-origin: top left;
      /* スクロール・タップはプレビュー内で処理（従来の none だと枠内操作不可） */
      pointer-events: auto;
    }
    .style-card-meta { min-width: 0; }
    .style-card input { width: auto; margin-right: 6px; accent-color: var(--terracotta); }
    .style-card .ttl { font-weight: 700; }
    .style-card .sub { color: var(--text-muted); font-size: .84rem; line-height: 1.6; margin-top: 4px; }
    .style-card a { color: var(--sage); font-size: .82rem; text-underline-offset: 2px; }
    .h-step2 {
      margin: 0 0 10px;
      font-size: 1.35rem;
      line-height: 1.45;
      font-family: "Noto Serif JP", "Hiragino Mincho ProN", serif;
      font-weight: 600;
    }
    .intake-step-banner {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px 16px;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }
    .link-back {
      background: transparent !important;
      color: var(--sage) !important;
      padding: 6px 0 !important;
      border-radius: 0 !important;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .link-back:hover { transform: none; opacity: 0.85; }
    .picked-line { margin: 0; font-size: 0.92rem; color: var(--text-muted); }
    .picked-line strong { color: var(--text); font-weight: 700; }
    .btn-intake-next {
      margin-top: 14px;
      width: 100%;
      max-width: 420px;
      display: block;
    }
    .style-card-bespoke-visual {
      height: 180px;
      border-radius: 10px;
      margin-bottom: 10px;
      border: 1px dashed var(--terracotta-soft);
      background: linear-gradient(145deg, rgba(184, 149, 111, 0.12), rgba(139, 154, 122, 0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-muted);
      line-height: 1.5;
    }
    @media (max-width: 680px) {
      .wrap { padding-top: 48px; }
      .grid { grid-template-columns: 1fr; }
      .style-cards { grid-template-columns: 1fr; }
      .card { padding: 18px; }
    }
  </style>
</head>
<body>
  ${publicLangBarHtml()}
  <div class="wrap">
    <p class="brand" data-i18n="intake.brand">Tadanosuke Closer</p>
    <p class="intake-nav-extra" style="margin:0 0 14px;font-size:0.9rem;">
      <a href="/template-gallery" style="color: var(--sage); text-underline-offset: 3px;"><span data-i18n="intake.nav.gallery">テンプレート一覧を見る</span></a>
      <span style="color: var(--text-muted); margin: 0 0.5rem;">·</span>
      <span style="color: var(--text-muted);" data-i18n="intake.nav.nopw">パスワード不要</span>
    </p>
    <div class="card">
      <div id="intake-step-pick">
        <h1 data-i18n="intake.step1.h1">ステップ1：ベースとなるデザインを選ぶ</h1>
        <p class="lead" data-i18n="intake.step1.lead">プレビュー枠内をスクロールして雰囲気を比べ、近いものをラジオで1つ選ぶか、該当がなければ「1から製作」を選んでください。</p>
        <div class="style-cards">
          ${templateCards}
          ${bespokeCard}
        </div>
        <p class="micro-copy" data-i18n="intake.step1.nextHint">選択後、「次へ」からヒアリングの詳細入力に進みます。</p>
        <p id="ng-step1" class="err" style="margin-top:10px;min-height:0;"></p>
        <button type="button" id="btn-intake-step-next" class="btn-intake-next" data-i18n="intake.step1.btnNext">次へ：ヒアリング内容を入力</button>
      </div>

      <form id="intake-form" style="display:none" novalidate>
        <div class="intake-step-banner">
          <button type="button" id="btn-intake-step-back" class="link-back" data-i18n="intake.step2.back">← デザイン選択に戻る</button>
          <p class="picked-line"><span data-i18n="intake.picked.prefix">選択中：</span><strong id="picked-template-label"></strong></p>
        </div>
        <input type="hidden" name="chosenTemplateId" id="field-chosen-template" value="" />
        <div class="intake-i18n-js-src" hidden aria-hidden="true">
          <span data-i18n="intake.js.draft">途中保存</span>
          <span data-i18n="intake.js.submit">ヒアリングを送信</span>
        </div>
        <h2 class="h-step2" data-i18n="intake.step2.h2">ステップ2：ヒアリング内容の入力</h2>
        <p class="lead" data-i18n="intake.lead">Webを、もっと自由な遊び場に。ご依頼内容を丁寧に確認するための入力フォームです。</p>
        <p class="micro-copy" data-i18n="intake.micro">情報だけのサイトは、もういらない。事業の魅力が伝わる構成にするため、分かる範囲で具体的にご記入ください。</p>
        <p class="section-title" data-i18n="intake.sec.basic">基本情報</p>
        <div class="grid">
          <div>
            <label for="storeName" data-i18n="intake.lbl.storeName">店舗名 / 事業名 *</label>
            <input id="storeName" name="storeName" required maxlength="120" />
          </div>
          <div>
            <label for="contactName" data-i18n="intake.lbl.contactName">ご担当者名 *</label>
            <input id="contactName" name="contactName" required maxlength="80" />
          </div>
          <div>
            <label for="contactMethod" data-i18n="intake.lbl.contactMethod">主な連絡方法 *</label>
            <select id="contactMethod" name="contactMethod" required>
              <option value="" data-i18n="intake.opt.select">選択してください</option>
              <option value="email" data-i18n="intake.opt.email">メール</option>
              <option value="line">LINE</option>
              <option value="phone" data-i18n="intake.opt.phone">電話</option>
            </select>
          </div>
          <div>
            <label for="contactValue" data-i18n="intake.lbl.contactValue">連絡先（メールアドレス/LINE ID/電話番号） *</label>
            <input id="contactValue" name="contactValue" required maxlength="160" />
          </div>
          <div>
            <label for="plan" data-i18n="intake.lbl.plan">希望プラン *</label>
            <select id="plan" name="plan" required>
              <option value="" data-i18n="intake.opt.select2">選択してください</option>
              <option value="normal" data-i18n="intake.opt.planNormal">通常プラン</option>
              <option value="student" data-i18n="intake.opt.planStudent">学割プラン</option>
            </select>
          </div>
          <div>
            <label for="referralCode" data-i18n="intake.lbl.referral">紹介コード（任意）</label>
            <input id="referralCode" name="referralCode" maxlength="200" data-i18n-placeholder="intake.ph.referral" placeholder="お持ちの場合のみ入力" />
          </div>
          <div class="full">
            <label for="websiteGoal" data-i18n="intake.lbl.websiteGoal">Webサイトの最大の目的 *</label>
            <select id="websiteGoal" name="websiteGoal" required>
              <option value="" data-i18n="intake.opt.select3">選択してください</option>
              <option value="business_card" data-i18n="intake.opt.goalCard">名刺代わり</option>
              <option value="sales" data-i18n="intake.opt.goalSales">商品の販売</option>
              <option value="inquiry" data-i18n="intake.opt.goalInquiry">お問い合わせの増加</option>
              <option value="recruit" data-i18n="intake.opt.goalRecruit">採用強化</option>
              <option value="other" data-i18n="intake.opt.goalOther">その他</option>
            </select>
          </div>
          <div class="full">
            <label for="targetAudience" data-i18n="intake.lbl.targetAudience">メインターゲット層 *</label>
            <textarea id="targetAudience" name="targetAudience" required maxlength="3000" data-i18n-placeholder="intake.ph.targetAudience" placeholder="例）30代女性、仕事と育児で疲れていて、短時間で効果を感じたい人"></textarea>
          </div>
          <div class="full">
            <label data-i18n="intake.lbl.designTaste">デザインの希望テイスト（複数選択可）*</label>
            <div class="chips">
              <label class="chip"><input type="checkbox" name="designTaste" value="シンプル"><span data-i18n="intake.taste.simple">シンプル</span></label>
              <label class="chip"><input type="checkbox" name="designTaste" value="高級感"><span data-i18n="intake.taste.lux">高級感</span></label>
              <label class="chip"><input type="checkbox" name="designTaste" value="ポップ"><span data-i18n="intake.taste.pop">ポップ</span></label>
              <label class="chip"><input type="checkbox" name="designTaste" value="スタイリッシュ"><span data-i18n="intake.taste.stylish">スタイリッシュ</span></label>
              <label class="chip"><input type="checkbox" name="designTaste" value="親しみやすい"><span data-i18n="intake.taste.friendly">親しみやすい</span></label>
            </div>
          </div>
          <div class="full">
            <label for="mainColor" data-i18n="intake.lbl.mainColor">コーポレートカラー / 希望メインカラー *</label>
            <input id="mainColor" name="mainColor" required maxlength="120" data-i18n-placeholder="intake.ph.mainColor" placeholder="例）ネイビー＋ゴールド、くすみグリーン など" />
          </div>
          <div class="full">
            <label for="styleDetail" data-i18n="intake.lbl.styleDetail">「もっとこうしてほしい」があれば（任意）</label>
            <textarea id="styleDetail" name="styleDetail" maxlength="3000" data-i18n-placeholder="intake.ph.styleDetail" placeholder="例）Aが近いが、文字はもう少し太め。写真は暖色寄りにしたい"></textarea>
          </div>
          <div class="full">
            <label for="favoriteSiteUrl" data-i18n="intake.lbl.favoriteUrl">参考にしたい / 好きな雰囲気のWebサイトURL *</label>
            <textarea id="favoriteSiteUrl" name="favoriteSiteUrl" required maxlength="5000" data-i18n-placeholder="intake.ph.favoriteUrl" placeholder="URLを改行で入力（複数可）。先頭のURLをスタイル解析に使います。"></textarea>
            <label class="chip full" style="margin-top:10px; border-radius:12px; padding:10px 12px;">
              <input type="checkbox" name="extractStyleToDraft" id="extractStyleToDraft" value="on" />
              <span data-i18n="intake.lbl.extractStyle">先頭の参考URLから配色などを自動抽出し、カスタムテンプレの下書きを作成する（管理者が公開承認するまでヒアリングの候補には出ません）</span>
            </label>
          </div>
          <div class="full">
            <label for="mustHaveContent" data-i18n="intake.lbl.mustHave">絶対に載せたいコンテンツ *</label>
            <textarea id="mustHaveContent" name="mustHaveContent" required maxlength="5000" data-i18n-placeholder="intake.ph.mustHave" placeholder="例）事業内容、料金表、実績、代表挨拶、SNSリンク"></textarea>
          </div>
          <div class="full">
            <label for="currentActivityUrl" data-i18n="intake.lbl.activityUrl">現在の活動がわかるURL（SNS / YouTube / 既存資料など）*</label>
            <textarea id="currentActivityUrl" name="currentActivityUrl" required maxlength="5000" data-i18n-placeholder="intake.ph.urls" placeholder="URLを改行で入力（複数可）"></textarea>
          </div>
          <div class="full">
            <label for="requestSummary" data-i18n="intake.lbl.requestSummary">その他ご要望・補足（任意）</label>
            <textarea id="requestSummary" name="requestSummary" maxlength="5000" data-i18n-placeholder="intake.ph.requestSummary" placeholder="運用面の希望、納期感、NG表現など"></textarea>
          </div>
        </div>
        <p class="note" data-i18n="intake.note">※ 送信内容は制作の事前確認にのみ利用します。紹介コードの照合・ご案内は運営側で手動対応します。</p>
        <div class="actions">
          <button id="submit-btn" type="submit">ヒアリングを送信</button>
          <span id="ok" class="msg"></span>
          <span id="ng" class="err"></span>
        </div>
      </form>
      <p class="footer-link"><span data-i18n="intake.footer.before">送信後、確認のうえ </span><a href="https://closer-official.com" target="_blank" rel="noopener noreferrer">closer-official.com</a><span data-i18n="intake.footer.after"> よりメールまたはLINEでご連絡します。</span></p>
    </div>
  </div>

  <script>
    (function () {
      var stepPick = document.getElementById('intake-step-pick');
      var form = document.getElementById('intake-form');
      var btnNext = document.getElementById('btn-intake-step-next');
      var btnBack = document.getElementById('btn-intake-step-back');
      var ngStep1 = document.getElementById('ng-step1');
      var hiddenTpl = document.getElementById('field-chosen-template');
      var pickedLabel = document.getElementById('picked-template-label');
      var btn = document.getElementById('submit-btn');
      var draftBtn = document.createElement('button');
      draftBtn.type = 'button';
      draftBtn.id = 'draft-btn';
      draftBtn.textContent = '途中保存';
      draftBtn.style.background = 'var(--sage)';
      draftBtn.style.color = 'var(--bg-base)';
      var actions = form.querySelector('.actions');
      if (actions) actions.insertBefore(draftBtn, actions.firstChild);
      var ok = document.getElementById('ok');
      var ng = document.getElementById('ng');
      var draftId = '';
      var draftToken = '';

      function getCheckedPickTemplate() {
        var el = document.querySelector('input[name="intakePickTemplate"]:checked');
        return el ? el.value : '';
      }

      function updatePickedLabel() {
        var el = document.querySelector('input[name="intakePickTemplate"]:checked');
        if (!pickedLabel) return;
        if (!el) {
          pickedLabel.textContent = '';
          return;
        }
        var lab = el.closest('label');
        var ttl = lab ? lab.querySelector('.ttl') : null;
        pickedLabel.textContent = ttl ? String(ttl.textContent || '').trim() : el.value;
      }

      function showStep2() {
        if (stepPick) stepPick.style.display = 'none';
        if (form) form.style.display = '';
        updatePickedLabel();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function showStep1() {
        if (form) form.style.display = 'none';
        if (stepPick) stepPick.style.display = '';
        if (ngStep1) ngStep1.textContent = '';
      }

      function applyTemplateFromPick() {
        var v = getCheckedPickTemplate();
        if (hiddenTpl) hiddenTpl.value = v;
      }

      if (btnNext) {
        btnNext.addEventListener('click', function () {
          if (ngStep1) ngStep1.textContent = '';
          if (!getCheckedPickTemplate()) {
            if (ngStep1) ngStep1.textContent = 'テンプレ（または1から製作）を1つ選んでください。';
            return;
          }
          applyTemplateFromPick();
          showStep2();
        });
      }

      if (btnBack) {
        btnBack.addEventListener('click', function () {
          showStep1();
        });
      }

      function setPickTemplateByValue(val) {
        if (!val) return false;
        var radios = document.querySelectorAll('input[name="intakePickTemplate"]');
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].value === val) {
            radios[i].checked = true;
            if (hiddenTpl) hiddenTpl.value = val;
            return true;
          }
        }
        return false;
      }

      var q = new URLSearchParams(window.location.search);
      var tplParam = q.get('template');
      if (tplParam) {
        try {
          tplParam = decodeURIComponent(tplParam);
        } catch (e) {}
        if (setPickTemplateByValue(tplParam) && q.get('autostep') !== '0') {
          showStep2();
        }
      }

      if (q.get('draft')) {
        draftId = q.get('draft') || '';
        draftToken = q.get('token') || '';
        fetch('/api/customer-intake-draft/' + encodeURIComponent(draftId) + '?token=' + encodeURIComponent(draftToken))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (!d || !d.id) return;
            if (d.chosenTemplateId) {
              setPickTemplateByValue(String(d.chosenTemplateId));
              showStep2();
            }
            form.storeName.value = d.storeName || '';
            form.contactName.value = d.contactName || '';
            form.contactMethod.value = d.contactMethod || '';
            form.contactValue.value = d.contactValue || '';
            form.plan.value = d.plan || '';
            form.referralCode.value = d.referralCode || '';
            form.websiteGoal.value = d.websiteGoal || '';
            form.targetAudience.value = d.targetAudience || '';
            Array.prototype.slice.call(form.querySelectorAll('input[name="designTaste"]')).forEach(function (el) {
              el.checked = (d.designTastes || []).indexOf(el.value) >= 0;
            });
            form.mainColor.value = d.mainColor || '';
            form.styleDetail.value = d.styleDetail || '';
            form.favoriteSiteUrl.value = d.favoriteSiteUrl || '';
            var ex = document.getElementById('extractStyleToDraft');
            if (ex) ex.checked = !!d.extractStyleToDraft;
            form.mustHaveContent.value = d.mustHaveContent || '';
            form.currentActivityUrl.value = d.currentActivityUrl || '';
            form.requestSummary.value = d.requestSummary || '';
            updatePickedLabel();
            ok.textContent = '途中保存データを読み込みました。';
          })
          .catch(function () {});
      }

      function collectPayload() {
        var chosen = (hiddenTpl && hiddenTpl.value) || getCheckedPickTemplate() || '';
        return {
          draftId: draftId || undefined,
          draftToken: draftToken || undefined,
          storeName: form.storeName.value.trim(),
          contactName: form.contactName.value.trim(),
          contactMethod: form.contactMethod.value,
          contactValue: form.contactValue.value.trim(),
          plan: form.plan.value,
          referralCode: form.referralCode.value.trim(),
          websiteGoal: form.websiteGoal.value,
          targetAudience: form.targetAudience.value.trim(),
          designTastes: Array.prototype.slice.call(form.querySelectorAll('input[name="designTaste"]:checked')).map(function (el) { return el.value; }),
          mainColor: form.mainColor.value.trim(),
          chosenTemplateId: chosen,
          styleDetail: form.styleDetail.value.trim(),
          favoriteSiteUrl: form.favoriteSiteUrl.value.trim(),
          mustHaveContent: form.mustHaveContent.value.trim(),
          currentActivityUrl: form.currentActivityUrl.value.trim(),
          requestSummary: form.requestSummary.value.trim(),
          pageUrl: window.location.href,
          extractStyleToDraft: !!(form.extractStyleToDraft && form.extractStyleToDraft.checked)
        };
      }

      draftBtn.addEventListener('click', function () {
        ok.textContent = '';
        ng.textContent = '';
        applyTemplateFromPick();
        var payload = collectPayload();
        fetch('/api/customer-intake-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: draftId || undefined })
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.ok) {
              draftId = data.id || draftId;
              draftToken = data.draftToken || draftToken;
              ok.textContent = '途中保存しました。再開URL: ' + (data.resumeUrl || ('/api/customer-intake?draft=' + draftId + '&token=' + draftToken));
            } else {
              ng.textContent = (data && data.error) ? data.error : '途中保存に失敗しました。';
            }
          })
          .catch(function () {
            ng.textContent = '途中保存に失敗しました。';
          });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        ok.textContent = '';
        ng.textContent = '';
        applyTemplateFromPick();
        if (!form.reportValidity()) return;
        btn.disabled = true;

        var payload = collectPayload();
        if (!payload.chosenTemplateId) {
          ng.textContent = '先にデザインを選び、「次へ」からヒアリング入力に進んでください。';
          showStep1();
          btn.disabled = false;
          return;
        }
        if (!payload.designTastes.length) {
          ng.textContent = 'デザインの希望テイストを1つ以上選択してください。';
          btn.disabled = false;
          return;
        }

        fetch('/api/customer-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.ok) {
              var draftNote = (data.styleDraftTemplateId ? ' テンプレ下書きID: ' + data.styleDraftTemplateId + '（運営が確認・公開します）' : '');
              ok.textContent =
                '送信ありがとうございます。確認後、メールまたはLINEでご連絡します。叩き台プレビューは運営（管理者ログイン）のみ閲覧できます。' +
                draftNote;
              form.reset();
              if (hiddenTpl) hiddenTpl.value = '';
              Array.prototype.slice.call(document.querySelectorAll('input[name="intakePickTemplate"]')).forEach(function (x) { x.checked = false; });
              showStep1();
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
  <script>${publicLangToggleInlineScript()}<\/script>
</body>
</html>`;
}
