# ワークスペース: テンプレ2（Valx・ジム販売LP）

**内部テンプレ ID:** `gym_personal_neon`

## ここで `npm run deploy` すると？

ルートの **`npm run deploy`** が走り、**本番全体**が更新されます。ギャラリー・顧客 LP とも同じデプロイに含まれます。

## 見た目の本体（まずここ）

ジム LP の **HTML のほとんど**は固定納品物です。

| 内容 | パス |
|------|------|
| **固定 LP の HTML/CSS（メイン）** | `public/deliverables/gym-valx-intro/index.html` |
| サーバーが body を読み込むブリッジ | `templates/workspaces/gym-valx/server/gymValxDeliverableClone.js` |
| ラッパー周り・共通処理 | `server/buildHtml.js`（`gym_personal_neon`） |
| テンプレ用スコープ CSS | `server/conceptTemplates.js` の `GYM_VALX_DELIVERABLE_PAGE_CSS` |
| ブラウザプレビュー | `src/lib/buildHtml.ts` / `src/lib/templates.ts` |

## プレビュー

- `GET /api/template-preview/gym_personal_neon`
- 他テンプレと並べて見る: **`/admin/template-hub.html`**
