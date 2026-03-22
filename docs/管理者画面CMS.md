# 管理者画面（店舗用 CMS）

## 概要

有料オプション「管理者画面（店専用CMS）」向けの機能です。**文言・写真の差し替えをコード不要で**行えます。  
**閲覧数**は共有プレビュー URL（`/api/preview/:id`）を開くたびにサーバー側で 1 ずつ加算されます。

## 使い方（ツール側）

1. 画面上部の **「管理者」** タブを開く。
2. 一覧から店舗を選び、**プレビューを開く**（閲覧数が増える）／**編集**（CMS）を選ぶ。
3. 編集画面で入力・保存。**保存はサーバー接続時のみ**有効（API の `PATCH /api/dashboard/:id`）。

## 編集できる項目

| 区分 | 内容 |
|------|------|
| 基本 | 店名、ページタイトル、キャッチ・サブコピー |
| SEO | メタタイトル、メタ説明、OG 画像 URL |
| セクション | 各ブロックの見出し・本文・**画像 URL** または **端末から画像ファイル選択**（Data URL で保存） |
| ヒーロー | ファーストビュー用画像 URL を **1 行 1 URL**（カフェ等） |
| カタログ | ヘアカタログ等の画像 URL を **1 行 1 URL** |
| 引用 | 引用文（対応テンプレのみ） |
| フッター | フッター文言、住所・電話・メール |
| CTA | メインボタンの文言・リンク先 |

## API（サーバー）

- `GET /api/dashboard` … 一覧（各件に `viewCount` が付く場合あり）
- `PATCH /api/dashboard/:id` … `content` および `seo` を JSON で丸ごと更新可能
- `GET /api/preview/:id` … LP 表示のたびに該当案件の `viewCount` を加算

## 公開範囲（今後の予定）

- **現在** … 「管理者」タブは **全ダッシュボード案件** を表示（運営確認用）。
- **将来** … オプション加入店（例: `cmsPurchased` や Stripe 連携）のみ一覧に出す想定。

## 注意

- 端末から選んだ画像は **Data URL** でダッシュボード JSON に保存されるため、**画像が大きいと保存データが肥大**します。本番運用では画像ホストにアップした **URL 指定**を推奨します。

---

## 運営ドメイン（`webpage.closer-official.com`）

**HTTP Basic 認証**（ブラウザのユーザー名・パスワード）を Edge `middleware.ts` でかけています。

| Vercel 環境変数 | 内容 |
|-----------------|------|
| `WEBPAGE_BASIC_AUTH_USER` | Basic 認証のユーザー名 |
| `WEBPAGE_BASIC_AUTH_PASSWORD` | Basic 認証のパスワード |

**両方必須**です。未設定のときは運営SPA・`/assets` などは **503**（ヒアリング用URLだけは開けます）。

### Basic なしで開けるもの（ヒアリング専用）

| パス | 内容 |
|------|------|
| `GET /api/customer-intake` または `GET /customer-intake` | ヒアリングフォームHTML |
| `POST /api/customer-intake` | 送信 |
| `POST /api/customer-intake-draft`・`GET /api/customer-intake-draft/:id?token=` | 途中保存・再開 |
| `GET /api/template-preview/:templateId` | フォーム内「テンプレをプレビュー」 |

**回答データ・叩き台HTML**は **`GET /api/customer-intake/:id/preview` を管理者Cookie必須**にしてあり、URLを知っていても未ログインでは閲覧できません。一覧は従来どおり `GET /api/customer-intake-list` が管理者のみ。

`/api/auto-process/tick`（Vercel Cron）は Basic なし（`CRON_SECRET` で保護）。

---

## 店舗ドメイン（`*.store-official.net`）構成

本リポジトリの **本番**では middleware により次のようになります。

| URL | 内容 |
|-----|------|
| `/` | 店舗向けジムLPテンプレ（`deliverables/gym-valx-intro` へリライト） |
| `/admin/`（および互換） | ウェブページ作成ツール（React・運営SPA） |
| `/admin/gym-lp.html` | ジムLP専用の文言・キャンペーン・画像URL・閲覧数の管理 |

### ジムLP（`gym-valx-intro`）API

- `GET /api/lp-content/gym-valx-intro` … 公開LPが読み込み
- `PUT /api/lp-content/gym-valx-intro` … CMS保存（LP用または全体ADMIN認証）
- `POST /api/lp-analytics/gym-valx-intro/view` … 閲覧1回の加算（LPが自動送信）
- `GET /api/lp-analytics/gym-valx-intro` … 累計閲覧数（認証が有効な環境ではログイン必須）

### 店舗ごとのアカウント（推奨・100店舗でも Vercel に登録不要）

- 認証情報は **Supabase の `app_store` キー `lpCmsAccounts`**（またはローカルの `lpCmsAccounts.json`）に保存します。
- 運営が **全体管理者**（`ADMIN_USERNAME` / `ADMIN_PASSWORD`）でログインしたうえで、次の API を呼び出して店舗を1件ずつ作成します。

```http
POST /api/admin/lp-cms-provision
Content-Type: application/json

{
  "siteKey": "shibuya-studio",
  "username": "owner_shibuya",
  "password": "8文字以上のパスワード",
  "cloneFrom": "gym-valx-intro"
}
```

- **`siteKey`**: 英小文字・数字・ハイフン（2〜64文字）。本番では **`https://{siteKey}.store-official.net`** のサブドメインと一致させる想定です。
- **`cloneFrom`**: `gym-valx-intro` / `web-closer-intro` / `japanese-history-higashi` のいずれか（`lpContent.json` の初期本文をコピー）。
- 店舗LP・管理画面はホスト名または `?siteKey=` から同じ `siteKey` を解決します。

**Vercel に追加で置くとよいもの（全環境共通で1つずつ）**

- `LP_CMS_SESSION_SECRET` … 店舗CMSクッキー署名用（未設定時はフォールバックあり。本番は必ずランダム文字列を推奨）。

### 旧来の共通LP用ログイン（テンプレ3種のみ）

- **JP_HISTORY_LP_CMS_USER / JP_HISTORY_LP_CMS_PASSWORD** は、上記テンプレキー専用の「全店共通1組」としてまだ使えます（移行中の互換用）。
- 新規店舗は **プロビジョニングAPI** による **店舗別ユーザー** を推奨します。
