# テンプレ仕様メモ（アパレル）

## 基本

- **作業スラッグ（フォルダ名）**: `apparel-retail`
- **提案テンプレ ID**（英小文字・アンダースコア、`server/templateRegistry.js` 用・**未確定**）: `apparel_retail`
- **表示名（日本語）**: アパレル（仮）
- **一行説明**: アパレル・セレクトショップ向け LP（プロトタイプ段階）

## 向き・ギャラリー

- **想定業種・キーワード**（推定ルール用メモ）: アパレル、セレクトショップ、ファッション、雑貨（服メイン）
- **ギャラリー用カテゴリ案**: ファッション・小売
- **タグ案（3〜6個）**: `アパレル`, `ファッション`, `セレクト`, `ルック`, `ストア`

## 技術メモ

- **ビルトイン buildHtml テンプレとして載せる** / **deliverables 固定 HTML** / **カスタムのみ** のどれか: **未決**（標準はビルトイン buildHtml）
- **既存テンプレの流用**（あれば ID）: なし（親テンプレを別途指定してもよい）

## 取り込みチェック（完了したら `[x]`）

コピー元: `docs/テンプレ制作ワークスペース要件書.md` §4

- [ ] `server/templateRegistry.js`
- [ ] `server/templateCatalogMeta.js`
- [ ] `server/buildHtml.js`
- [ ] `src/lib/buildHtml.ts` + `src/lib/templates.ts`
- [ ] （必要なら）`src/types.ts` / `inferTemplatePriority` / `inferTemplateFromSearch`
- [ ] `npm run build`

## メモ

（親テンプレから派生する場合はここに親 ID と差分方針を書く）
