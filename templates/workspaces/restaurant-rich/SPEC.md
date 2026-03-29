# テンプレ仕様メモ（飲食店・リッチ）

## 基本

- **作業スラッグ（フォルダ名）**: `restaurant-rich`
- **提案テンプレ ID**（英小文字・アンダースコア、`server/templateRegistry.js` 用・**未確定**）: `dining_rich`
- **表示名（日本語）**: 飲食店（リッチ）（仮）
- **一行説明**: 飲食店向け・上質・余白多めの LP（プロトタイプ段階）

## 向き・ギャラリー

- **想定業種・キーワード**（推定ルール用メモ）: レストラン、ダイニング、バー、カフェ（高単価・ディナー寄り）
- **ギャラリー用カテゴリ案**: 飲食
- **タグ案（3〜6個）**: `飲食`, `レストラン`, `ディナー`, `予約`, `コース`

## 技術メモ

- **ビルトイン buildHtml テンプレとして載せる** / **deliverables 固定 HTML** / **カスタムのみ** のどれか: **未決**（標準はビルトイン buildHtml）
- **既存テンプレの流用**（あれば ID）: カジュアル系との差分を `cafe_1` 等と比較メモ推奨

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
