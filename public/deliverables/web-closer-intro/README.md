# web-closer-intro（ウェブ制作 / Closer 用 LP）

`japanese-history-higashi`（納品物）の**コピー**です。納品フォルダは変更していません。

## 使い方（Closer アプリ内）

1. テンプレート **`navy_cyan_consult`（テンプレ14）** を選ぶだけで、既定でこのフォルダの `index.html` が埋め込まれます。
2. 納品デモ（日本史LP）を使う場合のみ `PageContent.navyDeliverableSlug: "japanese-history-higashi"` を指定。

## 編集するとき

- **文言・画像**: このフォルダ内の `index.html`（および必要なら `terms.html` など）だけを編集。
- **動的差し替え**: `/api/lp-content/web-closer-intro` と `server/data/json/lpContent.json` の `web-closer-intro` キー（管理者・CMSからも更新可）。
- **申し込み先URL**: `lpContent.json` の `applyUrl`（未設定時 `/customer-intake`）。管理者画面の「ヒアリングシート・申し込み先URL」からも変更可。

## 別ブランド用に複製するとき

1. このフォルダごとコピーし、フォルダ名を英小文字・ハイフンのみにする（例: `my-brand-lp`）。
2. `index.html` 末尾スクリプトの `fetch(.../lp-content/スラッグ)` を同じスラッグに合わせる。
3. `server/index.js` の `LP_CMS_TEMPLATE_SLUGS` にスラッグを追加（同梱テンプレ用）。店舗別は `POST /api/admin/lp-cms-provision` で `siteKey` を発行。
4. `lpContent.json` に同じキーで初期 JSON を追加。
5. 案件で `navyDeliverableSlug` をそのスラッグに設定。

CSS は納品 HTML の `<style>` から自動スコープ生成（`scripts/scope-navy-deliverable-css.mjs`）の対象が **`japanese-history-higashi` のみ**のため、**レイアウト用スタイルを大きく変えた場合**はスクリプトの参照先を検討してください。文言・画像のみの変更ならそのままで問題ありません。
