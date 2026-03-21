# 日本史徹底攻略 / よし先生 — 専用LP（納品物）

本番URL予定: **supernihonshi.store-official.net**（現行プレビュー: closer-official.com 配下の deliverables）

## プレビュー（開発時）

Vite 開発サーバー起動後:

`http://localhost:5173/deliverables/japanese-history-higashi/index.html`

**管理者画面**（文言・写真の差し替え）:

`http://localhost:5173/deliverables/japanese-history-higashi/admin.html`

- サーバー（`cd server && npm run dev`）が起動している必要があります
- 管理者認証が有効な場合（`ADMIN_USERNAME` / `ADMIN_PASSWORD` 設定時）はログインが必要です
- 「Presented by Closer」は削除・変更できません
- 写真はURL入力で差し替え可能です

本番では `dist` に同梱されるか、静的ホスティングに `public/deliverables/` ごとアップロードしてください。API（`/api/lp-content/...`）が利用可能な環境では、管理者画面で保存した内容がLPに反映されます。

## 法的ページ

- **利用規約** … `terms.html`
- **特定商取引法に基づく表記** … `tokushohou.html`（管理者画面で事業者名・連絡先等を編集可能）
- **プライバシーポリシー** … `privacy.html`

## 納品後のテンプレ化（手順）

1. 管理画面にログイン → **デザイン確認** タブ  
2. 右のフォームで文言・色を調整したうえで **「公開として保存」** または **「下書き保存」**  
3. ヒアリングフォームのテンプレ候補に載せる場合は **「公開承認（下書き→候補表示）」**  

※ このフォルダの HTML は **静的LP** です。テンプレートエンジンに取り込む場合は、該当セクションを `buildHtml` 用のコンテンツに転記する運用になります。

## 連絡先（掲載済み）

- LINE: `@871fitgx`  
- 友だち追加: https://lin.ee/nLMnCmt  
- TikTok: https://lite.tiktok.com/t/ZS9RPVvCBsTpb-OZms8/

## 参考にした構成

REAL VALUE ACADEMIA 系LPのセクション構成（ヒーロー・悩み・ベネフィット・理由・こだわり・FAQ・申込フロー等）を踏襲し、配色を **ダークネイビー × シアン × 白** に差し替えています。

---

## 初めての納品でおすすめの運用

1. **このフォルダをそのまま ZIP で渡す**（`index.html` 単体で開けるので、クライアントはブラウザでプレビュー可能）。
2. **本番URL**は Netlify / Cloudflare Pages / お手持ちサーバの `public_html` などに `japanese-history-higashi` フォルダごとアップロード。
3. **計測**が必要なら、`<head>` に GA4 や Meta ピクセルを追記（ご依頼時にタグをもらうと差し込みやすいです）。
4. **画像** … 開発中は Unsplash の URL を直指定しています。クライアント要望どおり本番では **[写真AC（ACワークス）](https://www.photo-ac.com/)** の素材に差し替え、同サイトの利用規約・クレジット表記に従ってください。
5. **テンプレ化** … 管理ツール側では **デザイン確認** から別途「公開として保存」する運用（[WORKFLOW.md](../../docs/WORKFLOW.md)）。**この HTML をそのままテンプレエンジンに取り込む**場合は、セクション単位で `PageContent` に転記する作業が必要です。

### 「納品したらテンプレに保存ボタン」について

現状アプリに **ワンクリックでこのファイルをテンプレ登録する専用ボタンは未実装**です。先に決めた運用どおり、**納品物を確認したうえで管理画面の「デザイン確認」から手動でテンプレ保存**する形が現実的です。自動連携が必要になったら、そのとき API と UI を足す形で設計できます。
