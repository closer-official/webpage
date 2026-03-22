# ワークスペース: テンプレ3（ネイビー×シアン・Web/LP）

**内部テンプレ ID:** `navy_cyan_consult`

## ここで `npm run deploy` すると？

ルートの **`npm run deploy`** → 本番全体更新。ギャラリー・顧客サイトも同じビルドです。

## 見た目の本体

| 内容 | パス |
|------|------|
| **既定の固定 LP** | `public/deliverables/web-closer-intro/index.html` |
| 別スラッグへの切替 | 店舗データの `navyDeliverableSlug`（存在する `public/deliverables/<slug>/index.html` のみ） |
| 読み込み・LINE/TikTok 差し替え | `templates/workspaces/navy-cyan-web/server/navyDeliverableClone.js` |
| スコープ CSS（納品 HTML 用） | `server/navyDeliverableScopedCss.js` + `server/conceptTemplates.js` の `NAVY_DELIVERABLE_PAGE_CSS` |
| ラッパー | `server/buildHtml.js`（`navy_cyan_consult`） |

## プレビュー

- `GET /api/template-preview/navy_cyan_consult`
- 他テンプレと並べて見る: **`/admin/template-hub.html`**
