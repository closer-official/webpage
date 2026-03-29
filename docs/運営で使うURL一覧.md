# 運営で使う URL 一覧

**パスだけ**書いています。開くときは先頭に **本番のオリジン**を付けてください。

- 例（ドキュメントでよく使うホスト）: `https://webpage.closer-official.com`
- 実際の本番ドメインが違う場合は、そのホストに置き換えます。

---

## 1. 運営がよく開く画面

| 何をするか | URL（パス） |
|------------|-------------|
| **運営の入口**（メニュー・各ツールへのリンク） | `/` |
| **テンプレ・ギャラリーハブ**（プレビュー・公開切替・手順コピー） | `/admin/template-hub.html` |
| **店舗ドラフト編集**（文章・画像URL・SEO の保存。API ログイン要のことが多い） | `/admin/template-worker.html` |
| **店舗セットアップ**（納品テンプレ・店舗キー・購入者用URL） | `/admin/store-wizard.html` |
| **売上コンソール**（使っている場合） | `/admin/sales-console.html` |
| **ジムLP 管理**（使っている場合） | `/admin/gym-lp.html` |

**例（フル URL）:**  
`https://webpage.closer-official.com/admin/template-hub.html`

---

## 2. 一般・顧客向け（外に見せる）

| 何をするか | URL（パス） |
|------------|-------------|
| **公開テンプレギャラリー** | `/template-gallery` |
| **ヒアリングフォーム** | `/customer-intake` |

---

## 3. プレビューを共有するとき

保存したテンプレ／カスタムの確認用。**ID は案件ごとに違います。**

| 用途 | URL（パスの形） |
|------|------------------|
| **HTML プレビュー** | `/api/template-preview/<テンプレIDまたはカスタムID>` |

**例:**  
`https://webpage.closer-official.com/api/template-preview/cafe_1`  
`https://webpage.closer-official.com/api/template-preview/custom-abc123`

---

## 4. 認証について（ざっくり）

- **`WEBPAGE_BASIC_AUTH_*` を設定している本番**では、`/` や `/admin/*` を開くとき **ブラウザの Basic 認証**がかかることがあります。
- **テンプレギャラリー・ヒアリング・上記プレビュー GET** などは、設定により **Basic なし**で開けることがあります（詳細は `middleware.ts` の公開パス定義）。
- **店舗ドラフトの保存**などは、別途 **`ADMIN_USERNAME` / `ADMIN_PASSWORD` の API ログイン**が必要な環境があります（各 `/admin/*.html` の説明に合わせる）。

---

## 5. テンプレ制作の「憲法」（別紙）

手順・チェックリストは次を正とします。

- `docs/テンプレ制作_必須契約_AI向け.md`
- オーナー向け短冊: `docs/テンプレ制作_オーナー用_やること一覧.md`
