# 管理者画面（店舗用 CMS）

## 概要

有料オプション「管理者画面（店専用CMS）」向けの機能です。**文言・写真の差し替えをコード不要で**行えます。  
**閲覧数**は共有プレビュー URL（`/api/preview/:id`）を開くたびにサーバー側で 1 ずつ加算されます。

## 使い方（運営SPA・`webpage.closer-official.com` 等）

**運営向けReactアプリに「管理者」タブ（店舗一覧からプレビュー／CMSへ飛ぶ画面）はありません。** 混同しやすいので、役割を分けます。

1. **フルオートで生成した案件** … 画面上部の **「ダッシュボード」** タブで一覧表示。各案件から **プレビュー**（閲覧数加算あり）・**内容の編集** を行います。**保存はサーバー接続時のみ**有効（`PATCH /api/dashboard/:id`）。
2. **納品テンプレ・新店舗の発行・テンプレ見た目の確認** … **「設定」** タブ内の案内、または **`/admin/store-wizard.html`（店舗セットアップ）** を開きます。
3. **すでに納品した店舗の購入者向けCMS**（ジムLP用HTMLなど）は、**店舗ドメイン側のCMS URL**（下記「店舗ドメイン」）で編集します。運営SPAのタブから一覧表示はしません。

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

## 公開範囲・今後の予定

- **ダッシュボード** は運営が生成案件を扱うための一覧です。オプション加入店だけに絞るなどの制御を入れる場合は、**API／ダッシュボード側**で設計します（旧「管理者」タブ相当の別画面は置いていません）。

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

**CDN とルート `/`:** エッジが `Authorization` を無視して認証済みの `index.html` を共有キャッシュすると、未ログインでも `/` が開けてしまうことがあります。`middleware.ts` で **`Vary: Authorization`** を付与し、401 には **`Cache-Control: no-store`** を付けています。デプロイ後も古いキャッシュが残る場合は Vercel の再デプロイやブラウザのスーパーリロードを試してください。

**「毎回」パスワード:** HTTP Basic はブラウザが同一オリジンに対し **認証情報を保持**するため、タブを閉じるまで再入力が出ないのが通常です。別ユーザーに毎回入力させたい場合はシークレットウィンドウの利用や、将来的にはセッション型ログインへの切り替えが必要です。

### Basic なしで開けるもの（顧客向け・ヒアリング・テンプレ閲覧）

| パス | 内容 |
|------|------|
| `GET /api/customer-intake` または `GET /customer-intake` | ヒアリングフォームHTML |
| `POST /api/customer-intake` | 送信 |
| `POST /api/customer-intake-draft`・`GET /api/customer-intake-draft/:id?token=` | 途中保存・再開 |
| `GET /template-gallery` または `GET /api/template-gallery` | **テンプレートギャラリー**（一覧・検索・カテゴリ・人気順・週次ピックアップ） |
| `GET /api/public/template-catalog` | ギャラリー用JSON（カスタム本文は含めない） |
| `POST /api/public/translate-ui` | 顧客向けページの **日→英 UI 翻訳**（Gemini。レート制限あり） |
| `GET /api/template-preview/:templateId` | テンプレプレビューHTML |

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
