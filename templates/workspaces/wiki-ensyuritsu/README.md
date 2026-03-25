# wiki-ensyuritsu（内部 ID: `wiki_ensyuritsu`）

オリジナル架空ブランド **円室律 / ENSYRITSU** の静的 LP デモです。士業・法律向けの文脈は含めていません。

## 本体 HTML（ここを編集する）

- **`embed/index.html`** … `/api/template-preview/wiki_ensyuritsu` と Vite プレビューにそのまま埋め込まれます。
- サーバーは `<body>` 内を読み取り、`<main><div class="wes-deliverable">…</div></main>` で包みます（`server/wikiEnsyuritsuDeliverableClone.js`）。

## プレビュー

- 本番相当: `/api/template-preview/wiki_ensyuritsu`
- このフォルダの説明用: `mock/index.html` をブラウザで開く

## 納品物フォルダとの関係

- **依存しません。** `public/deliverables/` は使わず、リポジトリ内の `embed/` だけで完結します。
