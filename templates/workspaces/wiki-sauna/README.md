# wiki-sauna（内部 ID: `wiki_sauna`）

KODŌ（鼓動）デモ。**React + Framer Motion + Lenis**（`src/wikiSauna/`）。

## 本体

- **`src/wikiSauna/KodoApp.tsx`** … LP の見た目・インタラクション
- **`src/wikiSaunaMain.tsx`** … Vite 第2エントリ（`wiki-sauna.html` / 本番は `assets/wiki-sauna-app.js`）
- **`embed/react-body.html`** … `#wss-kodo-root` + `type="module"` script（プレースホルダ `__WIKI_SAUNA_SCRIPT__`）
- **`server/wikiSaunaDeliverableClone.js`** … 上記フラグメントを読み `<main><div class="wss-deliverable">…` で包む

開発中は script が **`/src/wikiSaunaMain.tsx`**（Vite が解決）、本番ビルド後は **`/assets/wiki-sauna-app.js`**。上書きは環境変数 **`WIKI_SAUNA_SCRIPT_SRC`**。

## プレビュー

- **`http://localhost:5173/api/template-preview/wiki_sauna`**（Vite + サーバー 3001、推奨）
- **`http://localhost:5173/wiki-sauna.html`** … React だけ単体確認
- `mock/index.html`（案内のみ）

`public/deliverables` には依存しません。
