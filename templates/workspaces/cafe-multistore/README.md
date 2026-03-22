# ワークスペース: テンプレ1（複数店舗・ミニマル）

**内部テンプレ ID:** `cafe_1`（DB・API・URL はこの ID のまま）

## ここで `npm run deploy` すると？

リポジトリルート（`…/webpage`）の **`npm run deploy`** が実行されます。  
Vercel 連携済みなら **プッシュで本番が更新**され、**ギャラリーのプレビュー**も **このテンプレを選んでいる顧客 LP** も、同じビルド結果に乗ります。

> 注意: デプロイは **サイト全体** です。あるテンプレだけを部分デプロイする仕組みはありません。

## 見た目・文言を変えるとき（編集先）

| 内容 | パス |
|------|------|
| サーバー側 HTML 組み立て（本番の正） | `server/buildHtml.js`（`cafe_1` の分岐・`tid === 'cafe_1'` を検索） |
| テンプレ用 CSS（大きめ） | `server/conceptTemplates.js` の `CAFE_1_CSS` |
| ブラウザ内プレビューとの整合 | `src/lib/buildHtml.ts` / `src/lib/templates.ts`（同様に `cafe_1`） |

変更後は **`npm run build`**（このフォルダからなら同梱スクリプトでルート実行可）で型チェック・フロントビルドを通してください。

## プレビュー URL

- `GET /api/template-preview/cafe_1`（サーバー起動中）
- 他テンプレと並べて見る: **`/admin/template-hub.html`**
