# 参考URL → 新規設計テンプレ（ブループリント）

## 方針

- **既存の美容室・飲食などの業種テンプレに「当てる」ことはしません。**
- 参考URLのHTMLを取得し、**色・余白（px）・フォントサイズ傾向・セクション数・コンテナ幅・ヒーロー有無・ナビ本数**などを**数値・トークン化**した **設計ブループリント（`version: 1`）** を生成します。
- 表示は **`buildHtml` / 既存テンプレCSSではなく**、`server/renderBlueprintHtml.js` による**専用レイアウト**です。
- **文章・写真は参考サイトからコピーしません。** `blueprintContent.js` のオリジナル文言とストック写真で構成します（法的・品質上の分離）。

## 保存形式

- `baseTemplateId: 'blueprint'` かつ `blueprint: { version: 1, ... }` を `templateCustomizations` に保存。
- 下書き（`status: 'draft'`）はヒアリング候補に出さない。公開承認で `published`。

## API

- `POST /api/style-reference/extract` — `blueprint` + `fingerprint` + `suggestedOverride`（配色の互換用）
- `POST /api/design-blueprint/preview` — 管理者のみ。ブループリントHTMLを返す（保存不要の確認用）
- `POST /api/template-customizations/save` — `baseTemplateId: 'blueprint'` のとき `blueprint` 必須

## ヒアリング

「参考URLからテンプレ下書き」にチェックすると、**参考設計テンプレ（下書き）** が作成されます（従来の業種ベース上書きではありません）。

## 限界（今後の拡張）

- 取得は先頭 **約400KB** のHTMLのみ。外部CSSの全読込・スクリーンショット解析は未実装。
- レイアウトは**推定**であり、ピクセルパーフェクトではありません。より精密にする場合は、セクションDOMのクラス構造解析や、別途スクリーンショット＋Vision API などのハイブリッドが必要です。
