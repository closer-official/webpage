# テンプレ仕様メモ（コピー後に埋める）

## 基本

- **作業スラッグ（フォルダ名）**: `{{WORKSPACE_SLUG}}`
- **提案テンプレ ID**（英小文字・アンダースコア、`server/templateRegistry.js` 用）: `{{TEMPLATE_ID}}`
- **表示名（日本語）**: {{DISPLAY_NAME_JA}}
- **一行説明**: {{ONE_LINE_DESC}}

## 向き・ギャラリー

- **想定業種・キーワード**（推定ルール用メモ）:  
  {{INDUSTRY_KEYWORDS}}
- **ギャラリー用カテゴリ案**: {{GALLERY_CATEGORY}}
- **タグ案（3〜6個）**: {{TAGS}}

## 技術メモ

- **ビルトイン buildHtml テンプレとして載せる** / **deliverables 固定 HTML** / **カスタムのみ** のどれか: {{INTEGRATION_TYPE}}
- **既存テンプレの流用**（あれば ID）: {{BASE_TEMPLATE_ID_OR_NONE}}

## 取り込みチェック（完了したら `[x]`）

コピー元: `docs/テンプレ制作ワークスペース要件書.md` §4

- [ ] `server/templateRegistry.js`
- [ ] `server/templateCatalogMeta.js`
- [ ] `server/buildHtml.js`
- [ ] `src/lib/buildHtml.ts` + `src/lib/templates.ts`
- [ ] （必要なら）`src/types.ts` / `inferTemplatePriority` / `inferTemplateFromSearch`
- [ ] `npm run build`

## メモ

{{FREE_NOTES}}
